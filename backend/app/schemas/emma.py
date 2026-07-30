"""Emma AI Tutor — Request / Response / SSE schemas (Sprint 14)."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Request ─────────────────────────────────────────────────────────────

class EmmaLessonContext(BaseModel):
    """Injected lesson context — Emma always knows this."""
    lesson_title: str = Field(default="", max_length=200)
    lesson_id: int | None = None
    level: str = Field(default="A1", max_length=10)
    stage: str = Field(default="", max_length=50)
    stage_label: str = Field(default="", max_length=50)
    vocabulary: list[str] = Field(default_factory=list, max_length=100)
    grammar_pattern: str | None = Field(default=None, max_length=200)
    current_exercise: str | None = Field(default=None, max_length=500)
    progress_step: int = 1
    progress_total: int = 1
    recent_mistakes: list[str] = Field(default_factory=list, max_length=20)


class EmmaChatMessage(BaseModel):
    role: str = Field(max_length=20)   # "learner" | "emma"
    text: str = Field(max_length=2000)
    timestamp: float | None = None


class EmmaRequest(BaseModel):
    message: str = Field(default="", max_length=2000)
    history: list[EmmaChatMessage] = Field(default_factory=list, max_length=50)
    context: EmmaLessonContext = Field(default_factory=EmmaLessonContext)
    stream: bool = False
    prompt_version: str = Field(default="v1", max_length=20)


# ── Response (non-streaming) ────────────────────────────────────────────

class EmmaResponse(BaseModel):
    reply: str = Field(max_length=5000)
    corrections: list[dict] = Field(default_factory=list)
    prompt_version: str = Field(default="v1", max_length=20)


# ── SSE streaming event shapes ──────────────────────────────────────────

class EmmaStreamStart(BaseModel):
    event: str = Field(default="start", max_length=20)
    prompt_version: str = Field(default="v1", max_length=20)


class EmmaStreamDelta(BaseModel):
    event: str = Field(default="delta", max_length=20)
    text: str = Field(max_length=2000)


class EmmaStreamDone(BaseModel):
    event: str = Field(default="done", max_length=20)
    full_text: str = Field(max_length=5000)
    corrections: list[dict] = Field(default_factory=list)


class EmmaStreamError(BaseModel):
    event: str = Field(default="error", max_length=20)
    detail: str = Field(max_length=500)


# ── Phase 3 dedicated endpoint schemas ────────────────────────────────────

class EmmaHintRequest(BaseModel):
    lesson_context: EmmaLessonContext = Field(default_factory=EmmaLessonContext)
    question: str = Field(max_length=500)


class EmmaHintResponse(BaseModel):
    hint: str = Field(max_length=1000)
    prompt_version: str = Field(default="v1", max_length=20)


class EmmaPronounceRequest(BaseModel):
    lesson_text: str = Field(max_length=500)
    # Audio is handled via multipart upload — text metadata sent here


class EmmaPronounceResponse(BaseModel):
    feedback: str = Field(max_length=1000)
    score: int = Field(default=0, ge=0, le=100)
    prompt_version: str = Field(default="v1", max_length=20)


class EmmaEncourageRequest(BaseModel):
    checkpoint_score: float = Field(ge=0, le=100)
    lesson_title: str = Field(default="", max_length=200)
    stage: str = Field(default="", max_length=50)


class EmmaEncourageResponse(BaseModel):
    message: str = Field(max_length=1000)
    prompt_version: str = Field(default="v1", max_length=20)


class EmmaExplainGrammarRequest(BaseModel):
    topic_slug: str = Field(max_length=100)
    topic_title: str = Field(default="", max_length=200)
    topic_content: str | None = Field(default=None, max_length=2000)


class EmmaExplainGrammarResponse(BaseModel):
    explanation: str = Field(max_length=2000)
    prompt_version: str = Field(default="v1", max_length=20)
