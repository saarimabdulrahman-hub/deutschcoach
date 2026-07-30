"""Lesson session schemas (Section 8.5)."""

from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class StartLessonResponse(BaseModel):
    session_id: int
    lesson_id: int
    status: str
    started_at: datetime


class CheckpointSubmission(BaseModel):
    checkpoint_id: str = Field(max_length=50)
    correct: int = Field(ge=0)
    total: int = Field(ge=1, le=10)


class CheckpointSubmissionResponse(BaseModel):
    id: int
    checkpoint_id: str
    correct: int
    total: int
    pct: float


class StageProgressSubmission(BaseModel):
    stage_key: str = Field(max_length=50)
    status: str = Field(default="completed", max_length=20)


class CompleteLessonResponse(BaseModel):
    session_id: int
    status: str
    score: Optional[float] = None
    completed_at: Optional[datetime] = None


class MasteryCategory(BaseModel):
    score: Optional[float] = None
    status: str = "completed"  # completed | skipped


class MasteryResponse(BaseModel):
    lesson_id: int
    session_id: int
    overall: Optional[float] = None
    categories: dict[str, MasteryCategory]
    checkpoint_count: int = 0
