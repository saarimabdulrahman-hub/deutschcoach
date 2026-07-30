"""Adaptive learning schemas (Section 10.2)."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


class WeakConceptOut(BaseModel):
    concept_type: str  # "vocabulary" | "grammar"
    id: int
    label: str
    confidence: float
    easiness_factor: float
    lapse_count: int


class WeakConceptsResponse(BaseModel):
    vocabulary: list[WeakConceptOut]
    grammar: list[WeakConceptOut]


class ReviewSuggestRequest(BaseModel):
    lesson_id: int
    lesson_title: str = Field(default="", max_length=200)
    limit: int = Field(default=10, ge=1, le=50)


class ReviewSuggestItem(BaseModel):
    id: int
    concept_type: str
    label: str
    confidence: float
    due: bool = True


class ReviewSuggestResponse(BaseModel):
    items: list[ReviewSuggestItem]
    total_due: int


class PrerequisiteOut(BaseModel):
    prereq_type: str  # "lesson" | "vocabulary" | "grammar"
    id: int
    label: str
    current_confidence: Optional[float] = None
    min_confidence: float
    satisfied: bool


class PrerequisiteResponse(BaseModel):
    lesson_id: int
    prerequisites: list[PrerequisiteOut]
    all_satisfied: bool
