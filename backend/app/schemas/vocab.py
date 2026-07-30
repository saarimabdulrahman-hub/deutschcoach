"""Vocabulary lookup schemas (Phase 1)."""

from __future__ import annotations
from pydantic import BaseModel, Field


class VocabLookupRequest(BaseModel):
    words: list[str] = Field(min_length=1, max_length=50, description="German words to look up")


class VocabLookupItem(BaseModel):
    german: str
    english: str | None = None
    ipa: str | None = None
    audio_url: str | None = None


class VocabLookupResponse(BaseModel):
    results: list[VocabLookupItem]
