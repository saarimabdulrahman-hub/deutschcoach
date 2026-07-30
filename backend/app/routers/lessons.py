"""Lesson lifecycle endpoints (Section 8.5). Create sessions, submit checkpoints,
record per-stage progress, complete lessons, and retrieve mastery scores."""

from __future__ import annotations
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.lesson import Lesson
from app.models.lesson_session import LessonSession, CheckpointResult, LessonStageProgress
from app.models.adaptive import ConceptConfidence
from app.models.grammar import GrammarTopic
from app.schemas.lesson_session import (
    StartLessonResponse,
    CheckpointSubmission,
    CheckpointSubmissionResponse,
    StageProgressSubmission,
    CompleteLessonResponse,
    MasteryResponse,
    MasteryCategory,
)

logger = logging.getLogger("deutschcoach.lessons")
router = APIRouter(prefix="/lessons", tags=["Lessons"])


def _get_lesson_or_404(db: Session, lesson_id: int) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


def _get_active_session(db: Session, user_id: int, lesson_id: int) -> LessonSession | None:
    return db.query(LessonSession).filter(
        LessonSession.user_id == user_id,
        LessonSession.lesson_id == lesson_id,
        LessonSession.status == "in_progress",
    ).first()


# ── Start session ─────────────────────────────────────────────────────────

@router.post("/{lesson_id}/start", response_model=StartLessonResponse)
def start_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Create a new lesson session. If an in-progress session exists, return it."""
    _get_lesson_or_404(db, lesson_id)

    existing = _get_active_session(db, user.id, lesson_id)
    if existing:
        return StartLessonResponse(
            session_id=existing.id,
            lesson_id=existing.lesson_id,
            status=existing.status,
            started_at=existing.started_at,
        )

    session = LessonSession(user_id=user.id, lesson_id=lesson_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    return StartLessonResponse(
        session_id=session.id,
        lesson_id=session.lesson_id,
        status=session.status,
        started_at=session.started_at,
    )


# ── Submit checkpoint ──────────────────────────────────────────────────────

@router.post("/{lesson_id}/checkpoint", response_model=CheckpointSubmissionResponse)
def submit_checkpoint(
    lesson_id: int,
    body: CheckpointSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Submit a checkpoint result for the active session."""
    session = _get_active_session(db, user.id, lesson_id)
    if not session:
        raise HTTPException(status_code=404, detail="No active lesson session")

    pct = round((body.correct / body.total) * 100, 1)
    result = CheckpointResult(
        session_id=session.id,
        checkpoint_id=body.checkpoint_id,
        correct=body.correct,
        total=body.total,
        pct=pct,
    )
    db.add(result)

    # Sync grammar checkpoint results to concept_confidence (Section 10.2)
    if body.checkpoint_id == "checkpoint-grammar":
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson:
            grammar_topics = db.query(GrammarTopic).filter(
                GrammarTopic.related_lesson_ids.contains([lesson.id])
            ).all()
            for topic in grammar_topics:
                existing = db.query(ConceptConfidence).filter(
                    ConceptConfidence.user_id == user.id,
                    ConceptConfidence.concept_type == "grammar",
                    ConceptConfidence.grammar_topic_id == topic.id,
                ).first()
                confidence_val = max(0.1, min(1.0, pct / 100.0))
                if existing:
                    existing.confidence = confidence_val
                    existing.review_count += 1
                else:
                    db.add(ConceptConfidence(
                        user_id=user.id,
                        concept_type="grammar",
                        grammar_topic_id=topic.id,
                        confidence=confidence_val,
                    ))

    db.commit()
    db.refresh(result)

    return CheckpointSubmissionResponse(
        id=result.id,
        checkpoint_id=result.checkpoint_id,
        correct=result.correct,
        total=result.total,
        pct=result.pct,
    )


# ── Complete lesson ────────────────────────────────────────────────────────

@router.post("/{lesson_id}/complete", response_model=CompleteLessonResponse)
def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Finalize the active lesson session and calculate the mastery score."""
    session = _get_active_session(db, user.id, lesson_id)
    if not session:
        raise HTTPException(status_code=404, detail="No active lesson session")

    # Calculate score from checkpoint results
    checkpoints = db.query(CheckpointResult).filter(
        CheckpointResult.session_id == session.id
    ).all()

    if checkpoints:
        score = round(sum(c.pct for c in checkpoints) / len(checkpoints), 1)
    else:
        score = None

    session.status = "completed"
    session.score = score
    session.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)

    return CompleteLessonResponse(
        session_id=session.id,
        status=session.status,
        score=session.score,
        completed_at=session.completed_at,
    )


# ── Get mastery ────────────────────────────────────────────────────────────

@router.get("/{lesson_id}/mastery", response_model=MasteryResponse)
def get_mastery(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Retrieve the lesson mastery score from completed sessions."""
    _get_lesson_or_404(db, lesson_id)

    sessions = db.query(LessonSession).filter(
        LessonSession.user_id == user.id,
        LessonSession.lesson_id == lesson_id,
        LessonSession.status == "completed",
    ).order_by(LessonSession.completed_at.desc()).all()

    if not sessions:
        raise HTTPException(status_code=404, detail="No completed lesson sessions")

    latest = sessions[0]

    # Fetch checkpoint results for the latest session
    checkpoints = db.query(CheckpointResult).filter(
        CheckpointResult.session_id == latest.id
    ).all()

    # Map checkpoint results to categories
    categories: dict[str, MasteryCategory] = {
        "dialogueComprehension": MasteryCategory(score=None, status="completed"),
        "vocabularyRecall": MasteryCategory(score=None, status="completed"),
        "grammarApplication": MasteryCategory(score=None, status="completed"),
        "speaking": MasteryCategory(score=None, status="skipped"),
    }

    for cp in checkpoints:
        if cp.checkpoint_id == "checkpoint-dialogue":
            categories["dialogueComprehension"] = MasteryCategory(score=cp.pct, status="completed")
        elif cp.checkpoint_id == "checkpoint-grammar":
            categories["grammarApplication"] = MasteryCategory(score=cp.pct, status="completed")
        elif cp.checkpoint_id == "checkpoint-final":
            categories["vocabularyRecall"] = MasteryCategory(score=cp.pct, status="completed")

    # Check if speaking stage was completed
    speaking_progress = db.query(LessonStageProgress).filter(
        LessonStageProgress.session_id == latest.id,
        LessonStageProgress.stage_key.in_(["speaking", "speak"]),
    ).first()
    if speaking_progress:
        categories["speaking"] = MasteryCategory(score=100.0, status="completed")

    return MasteryResponse(
        lesson_id=lesson_id,
        session_id=latest.id,
        overall=latest.score,
        categories=categories,
        checkpoint_count=len(checkpoints),
    )


# ── Record stage progress ─────────────────────────────────────────────────

@router.post("/{lesson_id}/stage")
def record_stage_progress(
    lesson_id: int,
    body: StageProgressSubmission,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Record progress for a single lesson stage."""
    session = _get_active_session(db, user.id, lesson_id)
    if not session:
        raise HTTPException(status_code=404, detail="No active lesson session")

    progress = LessonStageProgress(
        session_id=session.id,
        stage_key=body.stage_key,
        status=body.status,
    )
    db.add(progress)
    db.commit()

    return {"id": progress.id, "stage_key": progress.stage_key, "status": progress.status}
