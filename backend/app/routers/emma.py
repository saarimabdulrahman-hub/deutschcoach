"""Emma AI Tutor router (Sprint 14). Streaming + non-streaming endpoints with
lesson-context injection, rate-limiting, retry, and timeout handling.

Registered in main.py as `app.include_router(emma.router)`.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.emma_cache import EmmaCache
from app.schemas.emma import (
    EmmaRequest,
    EmmaResponse,
    EmmaStreamStart,
    EmmaStreamDelta,
    EmmaStreamDone,
    EmmaStreamError,
    EmmaHintRequest,
    EmmaHintResponse,
    EmmaPronounceRequest,
    EmmaPronounceResponse,
    EmmaEncourageRequest,
    EmmaEncourageResponse,
    EmmaExplainGrammarRequest,
    EmmaExplainGrammarResponse,
)
from app.services.emma_prompts import (
    build_system_prompt,
    build_emma_messages,
    compress_history,
    DEFAULT_VERSION,
)

logger = logging.getLogger("deutschcoach.emma")

router = APIRouter(prefix="/emma", tags=["Emma AI Tutor"])

# ── Config (env-driven) ──────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
ANTHROPIC_API_URL = f"{ANTHROPIC_BASE_URL}/v1/messages"
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# Rate-limit: max messages per minute per user (simple in-memory; scale with Redis/cache).
# TODO: Replace with Redis-backed rate limiter for multi-worker deployments.
_RATE_WINDOW_S = 60
_MAX_REQUESTS_PER_WINDOW = 20
_rate_store: dict[int, list[float]] = {}  # user_id → [timestamps]


def _check_rate(user_id: int) -> None:
    import time as _t
    now = _t.time()
    stamps = _rate_store.setdefault(user_id, [])
    stamps[:] = [s for s in stamps if now - s < _RATE_WINDOW_S]
    if len(stamps) >= _MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many messages. Wait a moment and try again.")
    stamps.append(now)


# ── Helpers ──────────────────────────────────────────────────────────────

def _extract_corrections(text: str) -> list[dict]:
    """Parse Emma's response for hint-style corrections."""
    corrections: list[dict] = []
    for hint in re.findall(r"\(Hint:\s*(.+?)\)", text):
        parts = {"error": "", "correction": "", "explanation": hint}
        if "it's" in hint:
            parts["error"] = hint.split("it's")[0].strip().strip('"')
        if '"' in hint:
            parts["correction"] = hint.split('"')[1] if hint.count('"') >= 2 else ""
        corrections.append(parts)
    return corrections


async def _stream_anthropic(messages: list[dict], system: str) -> AsyncGenerator[str, None]:
    """Call the Anthropic Messages API with streaming enabled. Yields SSE text chunks."""
    if not ANTHROPIC_API_KEY:
        yield json.dumps(EmmaStreamError(detail="Emma is not configured — set ANTHROPIC_API_KEY.").model_dump())
        return

    body = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": 1024,
        "system": system,
        "messages": messages,
        "stream": True,
    }

    retries = 2
    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                async with client.stream(
                    "POST", ANTHROPIC_API_URL,
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json=body,
                ) as resp:
                    if resp.status_code != 200:
                        body_bytes = await resp.aread()
                        logger.error("Emma API error %s: %s", resp.status_code, body_bytes[:400])
                        yield json.dumps(EmmaStreamError(detail=f"LLM error {resp.status_code}").model_dump())
                        return

                    async for line in resp.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                return
                            try:
                                data = json.loads(data_str)
                                if data.get("type") == "content_block_delta":
                                    delta_obj = data.get("delta", {})
                                    text = delta_obj.get("text", "")
                                    if text:
                                        yield json.dumps(EmmaStreamDelta(text=text).model_dump())
                                elif data.get("type") == "message_stop":
                                    return
                            except json.JSONDecodeError:
                                continue
            return  # success — exit retry loop
        except httpx.TimeoutException:
            if attempt == retries:
                yield json.dumps(EmmaStreamError(detail="Emma is taking too long — try again in a moment.").model_dump())
            await asyncio.sleep(0.5 * (attempt + 1))
        except (httpx.HTTPStatusError, json.JSONDecodeError, httpx.ConnectError, httpx.RemoteProtocolError) as e:
            if attempt == retries:
                logger.exception("Emma stream error")
                yield json.dumps(EmmaStreamError(detail="An unexpected error occurred. Please try again.").model_dump())
            await asyncio.sleep(0.5 * (attempt + 1))
        except Exception:
            if attempt == retries:
                logger.exception("Emma stream error")
                yield json.dumps(EmmaStreamError(detail="An unexpected error occurred. Please try again.").model_dump())
            await asyncio.sleep(0.5 * (attempt + 1))


async def _non_streaming_response(messages: list[dict], system: str) -> EmmaResponse:
    """Fallback non-streaming call."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="Emma is not configured — set ANTHROPIC_API_KEY.")

    retries = 2
    last_err = ""
    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    ANTHROPIC_API_URL,
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": ANTHROPIC_MODEL,
                        "max_tokens": 1024,
                        "system": system,
                        "messages": messages,
                    },
                )
                if resp.status_code != 200:
                    body_bytes = await resp.aread()
                    logger.error("Anthropic API error %s: %s", resp.status_code, body_bytes[:500])
                    raise HTTPException(status_code=502, detail="The AI service is temporarily unavailable. Please try again later.")
                data = resp.json()
                reply = ""
                if isinstance(data.get("content"), list):
                    for block in data["content"]:
                        if block.get("type") == "text":
                            reply = block["text"]
                            break
                if not reply and isinstance(data.get("choices"), list):
                    reply = data["choices"][0]["message"]["content"]
                if not reply:
                    raise HTTPException(status_code=502, detail="Empty response from LLM")
                return EmmaResponse(
                    reply=reply,
                    corrections=_extract_corrections(reply),
                    prompt_version=DEFAULT_VERSION,
                )
        except HTTPException:
            raise
        except httpx.TimeoutException:
            last_err = "LLM request timed out"
            if attempt < retries:
                await asyncio.sleep(0.5 * (attempt + 1))
        except Exception as e:
            last_err = str(e)[:200]
            if attempt < retries:
                await asyncio.sleep(0.5 * (attempt + 1))
    raise HTTPException(status_code=504, detail=last_err or "Emma unavailable")


# ── Endpoints ────────────────────────────────────────────────────────────

@router.post("/chat", response_model=None)
async def emma_chat(
    body: EmmaRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    """Emma chat — streaming or non-streaming, lesson-context-aware."""
    _check_rate(user.id)

    system_prompt = build_system_prompt(body.prompt_version or DEFAULT_VERSION)
    messages = build_emma_messages(
        user_message=body.message,
        context=body.context,
        history=body.history,
        version=body.prompt_version or DEFAULT_VERSION,
    )

    if body.stream:
        return StreamingResponse(
            _stream_wrapper(messages, system_prompt),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    else:
        return await _non_streaming_response(messages, system_prompt)


async def _stream_wrapper(messages: list[dict], system: str) -> AsyncGenerator[str, None]:
    """SSE wrapper — sends start, deltas, done/error."""
    yield f"data: {json.dumps(EmmaStreamStart(prompt_version=DEFAULT_VERSION).model_dump())}\n\n"
    full = ""
    async for chunk in _stream_anthropic(messages, system):
        try:
            obj = json.loads(chunk)
        except json.JSONDecodeError:
            continue
        if obj.get("event") == "error":
            yield f"data: {json.dumps(obj)}\n\n"
            return
        if obj.get("event") == "delta":
            full += obj["text"]
            yield f"data: {json.dumps(obj)}\n\n"
    yield f"data: {json.dumps(EmmaStreamDone(full_text=full, corrections=_extract_corrections(full)).model_dump())}\n\n"


@router.post("/chat/stream")
async def emma_chat_stream(
    body: EmmaRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    """Convenience alias — forces streaming mode."""
    body.stream = True
    return await emma_chat(body, db, user)


# ── Phase 3 dedicated endpoints ──────────────────────────────────────────

@router.post("/hint", response_model=EmmaHintResponse)
async def emma_hint(
    body: EmmaHintRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    """Return a contextual Emma hint based on lesson context and learner question.
    Common hints are cached by (topic_slug, cefr_level) to avoid redundant LLM calls."""
    ctx = body.lesson_context
    topic_slug = ctx.grammar_pattern.lower().replace(" ", "-") if ctx.grammar_pattern else "general"
    cache_key = f"{topic_slug}:{ctx.level or 'A1'}"
    cached = db.query(EmmaCache).filter(
        EmmaCache.cache_key == cache_key,
        EmmaCache.response_type == "hint",
    ).first()
    if cached:
        logger.info("Emma cache HIT for hint key=%s", cache_key)
        return EmmaHintResponse(hint=cached.response_text, prompt_version=DEFAULT_VERSION)

    logger.info("Emma cache MISS for hint key=%s — invoking LLM", cache_key)
    messages = [
        {"role": "user", "content": (
            f"The learner is in lesson \"{ctx.lesson_title}\" (stage: {ctx.stage_label}). "
            f"Vocabulary: {', '.join(ctx.vocabulary[:5])}. "
            f"Grammar pattern: {ctx.grammar_pattern or 'N/A'}. "
            f"Their question is: {body.question}\n\n"
            "Provide a concise, encouraging hint in English. Do not give the answer directly — "
            "guide the learner to discover it themselves. Max 3 sentences."
        )}
    ]
    system = "You are Emma, a warm German tutor. Give short contextual hints in English."
    try:
        resp = await _non_streaming_response(messages, system)
        # Cache the successful hint response
        db.add(EmmaCache(
            cache_key=cache_key,
            response_type="hint",
            response_text=resp.reply,
        ))
        db.commit()
        return EmmaHintResponse(hint=resp.reply, prompt_version=DEFAULT_VERSION)
    except HTTPException:
        return EmmaHintResponse(
            hint=f"Think about the pattern you've seen in this lesson. Try breaking down the question into smaller parts — what do you already know? 💡",
            prompt_version=DEFAULT_VERSION,
        )


@router.post("/pronounce", response_model=EmmaPronounceResponse)
async def emma_pronounce(
    body: EmmaPronounceRequest,
    user=Depends(require_auth),
):
    """Return pronunciation feedback for a spoken text (Phase 3 temporary).
    Flow: lesson text → LLM evaluation → binary feedback.
    Phase 5 will replace this with Speechace (STT + scoring).
    Returns only binary feedback — no numeric scoring."""
    import time as _time
    t0 = _time.time()
    messages = [
        {"role": "user", "content": (
            f"The learner is practicing pronouncing this German text: \"{body.lesson_text}\"\n\n"
            "Evaluate whether their pronunciation sounds correct. Detect obvious mistakes like "
            "pronouncing 'ch' as 'k' (e.g. saying 'ik' instead of 'ich'). "
            "Respond with exactly one of these two formats:\n"
            "- If correct: \"Good!\"\n"
            "- If incorrect: \"Try again — focus on the [specific sound] sound\"\n"
            "Example: \"Try again — focus on the 'ch' sound\"\n"
            "Do not include scores, ratings, or any other text."
        )}
    ]
    system = "You are Emma, a German pronunciation coach. Respond with exactly one line: 'Good!' or 'Try again — focus on the ... sound'."
    try:
        resp = await _non_streaming_response(messages, system)
        elapsed = _time.time() - t0
        logger.info("Pronunciation eval (text) completed in %.2fs — feedback: %s", elapsed, resp.reply[:40])
        return EmmaPronounceResponse(feedback=resp.reply, score=50, prompt_version=DEFAULT_VERSION)
    except HTTPException:
        return EmmaPronounceResponse(
            feedback="Try again — focus on the vowel sounds. 🎤",
            score=50, prompt_version=DEFAULT_VERSION,
        )


@router.post("/pronounce/audio", response_model=EmmaPronounceResponse)
async def emma_pronounce_audio(
    file: UploadFile = File(...),
    lesson_text: str = Form(...),
    user=Depends(require_auth),
):
    """Pronunciation evaluation from recorded audio (Phase 3 temporary).
    Pipeline: audio → transcription → LLM evaluation → binary feedback.

    Phase 3 transcription is simulated (reference text used as transcription).
    Phase 5 will replace this pipeline with actual Speechace STT + scoring.
    The response format stays identical so no frontend changes are needed."""
    import time as _time
    t0 = _time.time()

    # ── Step 1: Receive audio ───────────────────────────────────────────
    logger.info("Audio pronunciation eval: file=%s (%d bytes), text=%s",
                file.filename, file.size or 0, lesson_text)

    # ── Step 2: Transcribe (Phase 3: simulated — uses reference text) ────
    transcription = lesson_text
    logger.info("Transcription (Phase 3 simulated): \"%s\"", transcription)

    # ── Step 3: LLM evaluation ──────────────────────────────────────────
    messages = [
        {"role": "user", "content": (
            f"The learner attempted to pronounce this German text: \"{transcription}\"\n\n"
            "Detect obvious pronunciation mistakes like pronouncing 'ch' as 'k' "
            "(e.g. saying 'ik' instead of 'ich'), or incorrect umlaut sounds.\n"
            "Respond with exactly one line:\n"
            "- If correct: \"Good!\"\n"
            "- If incorrect: \"Try again — focus on the [specific sound] sound\""
        )}
    ]
    system = "You are Emma, a German pronunciation coach. One-line response only."
    try:
        resp = await _non_streaming_response(messages, system)
        elapsed = _time.time() - t0
        logger.info("Pronunciation eval (audio) completed in %.2fs — feedback: %s", elapsed, resp.reply[:40])
        return EmmaPronounceResponse(feedback=resp.reply, score=50, prompt_version=DEFAULT_VERSION)
    except HTTPException:
        return EmmaPronounceResponse(
            feedback="Try again — focus on the vowel sounds. 🎤",
            score=50, prompt_version=DEFAULT_VERSION,
        )


@router.post("/encourage", response_model=EmmaEncourageResponse)
async def emma_encourage(
    body: EmmaEncourageRequest,
    user=Depends(require_auth),
):
    """Return encouragement based on checkpoint score and lesson context."""
    score = body.checkpoint_score
    if score >= 80:
        message = f"Excellent work on {body.lesson_title}! 🌟 You scored {score:.0f}% — that's mastery level. Keep up the great momentum!"
    elif score >= 50:
        message = f"Good progress on {body.lesson_title}! 💪 You scored {score:.0f}%. Review the areas you found tricky and you'll have it down."
    else:
        message = f"You completed {body.lesson_title}! 🌱 Every attempt builds your German skills. Try reviewing with flashcards — you scored {score:.0f}%, but that score will climb quickly with practice."
    return EmmaEncourageResponse(message=message, prompt_version=DEFAULT_VERSION)


@router.post("/explain-grammar", response_model=EmmaExplainGrammarResponse)
async def emma_explain_grammar(
    body: EmmaExplainGrammarRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    """Return a learner-friendly grammar explanation for a given topic.
    Responses are cached by (topic_slug, cefr_level) — repeated requests
    reuse the cached response instead of invoking the LLM again."""
    cache_key = f"{body.topic_slug}:{user.target_level or 'A1'}"
    cached = db.query(EmmaCache).filter(
        EmmaCache.cache_key == cache_key,
        EmmaCache.response_type == "grammar",
    ).first()
    if cached:
        logger.info("Emma cache HIT for grammar key=%s", cache_key)
        return EmmaExplainGrammarResponse(explanation=cached.response_text, prompt_version=DEFAULT_VERSION)

    logger.info("Emma cache MISS for grammar key=%s — invoking LLM", cache_key)
    messages = [
        {"role": "user", "content": (
            f"Explain the German grammar topic \"{body.topic_title}\" to a beginner learner.\n\n"
            f"Topic slug: {body.topic_slug}\n"
            f"Reference content: {body.topic_content or 'N/A'}\n\n"
            "Provide a clear, simple explanation in English. Use examples. "
            "Avoid technical jargon. Be encouraging. Max 5 sentences."
        )}
    ]
    system = "You are Emma, a German grammar tutor. Explain concepts simply in English with examples."
    try:
        resp = await _non_streaming_response(messages, system)
        # Cache the successful response
        db.add(EmmaCache(
            cache_key=cache_key,
            response_type="grammar",
            response_text=resp.reply,
        ))
        db.commit()
        return EmmaExplainGrammarResponse(explanation=resp.reply, prompt_version=DEFAULT_VERSION)
    except HTTPException:
        return EmmaExplainGrammarResponse(
            explanation=f"**{body.topic_title}**: This pattern helps you construct correct German sentences. Look at the examples in the lesson — notice how the words change based on the pattern. Practice by creating your own sentences! 📚",
            prompt_version=DEFAULT_VERSION,
        )
