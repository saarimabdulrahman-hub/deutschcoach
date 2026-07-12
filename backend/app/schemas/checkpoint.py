"""Checkpoint schemas (Sprint 21)."""
from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime


class SaveCheckpointRequest(BaseModel):
    current_stage: str = Field(max_length=50)
    completed_stages: list[str] = Field(default_factory=list, max_length=50)
    time_spent_sec: int = 0


class CheckpointResponse(BaseModel):
    lesson_id: int
    current_stage: str
    completed_stages: list[str]
    time_spent_sec: int
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    has_checkpoint: bool
    checkpoint: CheckpointResponse | None = None
