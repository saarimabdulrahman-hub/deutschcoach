import os
import re
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.routers.auth_dependency import require_auth
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
ANTHROPIC_API_URL = f"{ANTHROPIC_BASE_URL}/v1/messages"
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

SCENARIOS = {
    "restaurant": "You are at a German restaurant. The user is the customer and you are the waiter. Take their order, recommend dishes, handle payment.",
    "job-interview": "You are conducting a job interview in German. Ask about experience, skills, motivations. Keep it professional.",
    "casual": "You are a German friend. Have a relaxed conversation about hobbies, travel, daily life.",
    "shopping": "You are a shop assistant in a German store. Help the user find items, discuss sizes and prices.",
    "travel": "You are at a German train station/airport. Help with tickets, schedules, directions.",
    "doctor": "You are a doctor in Germany. Ask about symptoms, give advice. Use medical vocabulary appropriately.",
}

TIER_LEVEL_MAX = {"free": "A1", "starter": "A2", "plus": "B1", "pro": "C1"}


def build_system_prompt(db: Session, user) -> str:
    """Build a system prompt that includes the user's level, known vocab, and grammar topics."""
    tier = user.subscription_tier.value if hasattr(user.subscription_tier, "value") else str(user.subscription_tier)
    target = user.target_level.value if hasattr(user.target_level, "value") else "A1"
    max_level = TIER_LEVEL_MAX.get(tier, "A1")

    # Get user's mastered and learning vocab from SRS
    from app.models.srs import SRSState, CardStatus
    from app.models.vocab import VocabEntry
    from app.models.lesson_progress import LessonProgress

    srs_cards = (
        db.query(SRSState)
        .filter(
            SRSState.user_id == user.id,
            SRSState.status.in_([CardStatus.reviewing, CardStatus.mastered]),
        )
        .limit(30)
        .all()
    )

    known_vocab: list[str] = []
    if srs_cards:
        vocab_ids = [c.vocab_entry_id for c in srs_cards]
        vocab_entries = db.query(VocabEntry).filter(VocabEntry.id.in_(vocab_ids)).all()
        known_vocab = [f"{v.german} ({v.english})" for v in vocab_entries[:20]]

    # Completed lessons count
    completed = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == user.id,
            LessonProgress.completed_at.isnot(None),
        )
        .count()
    )

    vocab_section = ", ".join(known_vocab[:15]) if known_vocab else "beginner - use very simple German"

    prompt = f"""You are a friendly, patient German language tutor. You are having a natural conversation with a student learning German.

STUDENT INFO:
- CEFR Level: {target} (max available: {max_level})
- Lessons completed: {completed}
- Known vocabulary: {vocab_section}

YOUR RULES:
1. MATCH THE STUDENT'S LANGUAGE: If the student writes in English → respond in English. If the student writes in German → respond in German. This is your most important rule — always mirror the language the student uses.
2. Speak at the student's level ({target}). Use vocabulary and grammar appropriate for that level.
3. If the student makes a German mistake, briefly correct it in parentheses: (Hint: it's "dem" not "den" because dative)
4. Keep corrections friendly and brief — don't interrupt the flow of conversation.
5. Naturally introduce 1-2 new vocabulary words when relevant, showing them in context.
6. Keep responses concise (2-4 sentences). This is a chat, not a lecture.
7. Use emoji occasionally to keep it friendly.
8. If the student seems lost, offer to switch to English briefly to explain.
9. Adjust your German complexity based on how well the student is responding."""

    return prompt


@router.post("/send", response_model=ChatResponse)
async def chat_send(
    body: ChatRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chat feature is not configured. Set ANTHROPIC_API_KEY in backend/.env",
        )

    system_prompt = build_system_prompt(db, user)

    # Add scenario context if selected
    scenario_instruction = ""
    if body.scenario and body.scenario in SCENARIOS:
        scenario_instruction = f"\n\nCURRENT SCENARIO: {SCENARIOS[body.scenario]}\nStay in character for this scenario."

    # Build messages for Anthropic API (last 20 for context window)
    anthropic_messages = []
    for msg in body.messages[-20:]:
        anthropic_messages.append({"role": msg.role, "content": msg.content})

    # If this is the first message, prepend a greeting instruction
    if len(body.messages) == 1 and body.messages[0].role == "user":
        system_prompt += "\n\nThis is the first message. Greet the student warmly. Match their language — if they wrote in English, respond in English. If they wrote in German, respond in German."

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
                    "max_tokens": 500,
                    "system": system_prompt + scenario_instruction,
                    "messages": anthropic_messages,
                },
            )

        if resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"LLM API error: {resp.text[:200]}",
            )

        data = resp.json()
        reply = None

        # Anthropic format: content[0].text
        if isinstance(data.get("content"), list):
            for block in data["content"]:
                if block.get("type") == "text" and block.get("text"):
                    reply = block["text"]
                    break
            if not reply and len(data["content"]) > 0:
                first = data["content"][0]
                reply = first.get("text") or first.get("thinking") or ""

        # OpenAI format: choices[0].message.content
        if not reply and isinstance(data.get("choices"), list):
            reply = data["choices"][0]["message"]["content"]

        if not reply:
            raise HTTPException(status_code=502, detail=f"Unexpected API response format: {json.dumps(data)[:300]}")

        # Parse corrections from the response
        corrections: list[dict] = []
        hints = re.findall(r"\(Hint:\s*(.+?)\)", reply)
        for hint in hints:
            correction_text = ""
            error_text = ""
            if "it's" in hint:
                error_text = hint.split("it's")[0].strip().strip('"')
            if '"' in hint:
                correction_text = hint.split('"')[1] if hint.count('"') >= 2 else ""
            if not correction_text and "not" in hint:
                correction_text = hint.split("not")[-1].strip()
            corrections.append(
                {
                    "error": error_text,
                    "correction": correction_text,
                    "explanation": hint,
                }
            )

        return ChatResponse(reply=reply, corrections=corrections)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="LLM request timed out")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chat error: {str(e)[:200]}")


@router.get("/scenarios")
def get_scenarios(user=Depends(require_auth)):
    tier = user.subscription_tier.value if hasattr(user.subscription_tier, "value") else str(user.subscription_tier)
    max_level = TIER_LEVEL_MAX.get(tier, "A1")

    level_scenarios = {
        "A1": ["casual", "shopping"],
        "A2": ["casual", "shopping", "restaurant", "travel"],
        "B1": ["casual", "shopping", "restaurant", "travel", "job-interview"],
        "C1": ["casual", "shopping", "restaurant", "travel", "job-interview", "doctor"],
    }

    available = level_scenarios.get(max_level, ["casual"])
    return {
        "scenarios": [
            {"key": k, "name": k.replace("-", " ").title()} for k in available
        ]
    }
