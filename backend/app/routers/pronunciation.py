"""Pronunciation scoring endpoint (Section 11.3). Production-grade scoring using
Speechace API with LLM fallback. Provides per-word, per-sentence, and phoneme-
level feedback."""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel

from app.routers.auth_dependency import require_auth
from app.services.pronunciation_scorer import evaluate_pronunciation

logger = logging.getLogger("deutschcoach.pronunciation")
router = APIRouter(prefix="/pronunciation", tags=["Pronunciation"])


class WordPhoneme(BaseModel):
    phoneme: str
    score: int
    incorrect: bool


class WordScoreOut(BaseModel):
    word: str
    score: int
    phonemes: list[WordPhoneme]


class PronunciationScoreResponse(BaseModel):
    overall_score: int
    word_scores: list[WordScoreOut]
    incorrect_phonemes: list[str]
    feedback: str
    source: str = "speechace"  # "speechace" | "llm"


@router.post("/score", response_model=PronunciationScoreResponse)
async def score_pronunciation(
    file: UploadFile = File(...),
    text: str = Form(...),
    user=Depends(require_auth),
):
    """Score pronunciation from recorded audio.
    Accepts an audio file + the expected reference text.
    Returns per-word scores, phoneme analysis, and targeted feedback."""
    audio_data = await file.read()
    logger.info("Pronunciation scoring: text=%s, audio=%d bytes", text, len(audio_data))

    result = await evaluate_pronunciation(audio_data, text)

    return PronunciationScoreResponse(
        overall_score=result.overall_score,
        word_scores=[
            WordScoreOut(word=w.word, score=w.score, phonemes=[
                WordPhoneme(phoneme=p["phoneme"], score=p["score"], incorrect=p["incorrect"])
                for p in w.phonemes
            ])
            for w in result.word_scores
        ],
        incorrect_phonemes=result.incorrect_phonemes,
        feedback=result.feedback,
        source="speechace",
    )
