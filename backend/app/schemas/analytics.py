"""Learning analytics schemas (Sprint 20)."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Supported event types ────────────────────────────────────────────────

EVENT_TYPES = {
    "lesson_started": "Learner opened a lesson",
    "lesson_completed": "Learner finished all stages + review",
    "stage_entered": "Learner entered a specific stage",
    "exercise_retry": "Learner tapped retry on an exercise",
    "exercise_reveal": "Learner revealed the answer",
    "emma_opened": "Emma panel was opened",
    "emma_question": "Learner sent Emma a message",
    "audio_play": "Audio clip was played",
    "audio_replay": "Audio was replayed",
    "speaking_skipped": "Learner skipped the speaking stage",
    "stage_skip": "Learner skipped an item within a stage",
    "resume": "Learner resumed a paused lesson",
    "dropoff": "Learner left the lesson before completing it",
    "time_spent": "Cumulative time spent in a stage (seconds)",
}


# ── Request ──────────────────────────────────────────────────────────────

class RecordEventRequest(BaseModel):
    event_type: str = Field(max_length=50)
    lesson_id: int | None = None
    stage: str | None = Field(default=None, max_length=50)
    payload: dict | None = None
    client_ts: str | None = None   # ISO-8601


class RecordBatchRequest(BaseModel):
    events: list[RecordEventRequest] = Field(max_length=100)


# ── Response ──────────────────────────────────────────────────────────────

class EventResponse(BaseModel):
    id: int
    event_type: str
    lesson_id: int | None
    stage: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Dashboard aggregations ───────────────────────────────────────────────

class LessonStats(BaseModel):
    lesson_id: int
    title: str | None
    starts: int = 0
    completions: int = 0
    dropoffs: int = 0
    avg_time_spent_sec: float = 0
    emma_questions: int = 0


class LearnerSummary(BaseModel):
    total_lessons_started: int = 0
    total_lessons_completed: int = 0
    completion_rate_pct: float = 0
    total_emma_questions: int = 0
    avg_exercise_retries: float = 0
    speaking_skip_rate_pct: float = 0
    streak: int = 0
    active_days: int = 0


class DashboardResponse(BaseModel):
    learner: LearnerSummary
    recent_lessons: list[LessonStats] = Field(default_factory=list)
