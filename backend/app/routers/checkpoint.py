"""Checkpoint persistence API (Sprint 21). Save/load/resume per-lesson progress."""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.lesson_checkpoint import LessonCheckpoint
from app.schemas.checkpoint import SaveCheckpointRequest, CheckpointResponse, ResumeResponse

logger = logging.getLogger("deutschcoach.checkpoint")
router = APIRouter(prefix="/checkpoint", tags=["Checkpoint"])


def _get_checkpoint(db: Session, user_id: int, lesson_id: int) -> LessonCheckpoint | None:
    return (
        db.query(LessonCheckpoint)
        .filter(LessonCheckpoint.user_id == user_id, LessonCheckpoint.lesson_id == lesson_id)
        .first()
    )


@router.post("/{lesson_id}", response_model=CheckpointResponse)
def save_checkpoint(
    lesson_id: int,
    body: SaveCheckpointRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    cp = _get_checkpoint(db, user.id, lesson_id)
    if cp:
        cp.current_stage = body.current_stage
        cp.completed_stages = body.completed_stages
        cp.time_spent_sec = body.time_spent_sec
    else:
        cp = LessonCheckpoint(
            user_id=user.id,
            lesson_id=lesson_id,
            current_stage=body.current_stage,
            completed_stages=body.completed_stages,
            time_spent_sec=body.time_spent_sec,
        )
        db.add(cp)
    db.commit()
    db.refresh(cp)
    return CheckpointResponse(
        lesson_id=cp.lesson_id,
        current_stage=cp.current_stage,
        completed_stages=cp.completed_stages or [],
        time_spent_sec=cp.time_spent_sec or 0,
        updated_at=cp.updated_at,
    )


@router.get("/{lesson_id}/resume", response_model=ResumeResponse)
def resume_checkpoint(
    lesson_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    cp = _get_checkpoint(db, user.id, lesson_id)
    if not cp:
        return ResumeResponse(has_checkpoint=False)
    return ResumeResponse(
        has_checkpoint=True,
        checkpoint=CheckpointResponse(
            lesson_id=cp.lesson_id,
            current_stage=cp.current_stage,
            completed_stages=cp.completed_stages or [],
            time_spent_sec=cp.time_spent_sec or 0,
            updated_at=cp.updated_at,
        ),
    )


@router.delete("/{lesson_id}", status_code=204)
def reset_checkpoint(
    lesson_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    cp = _get_checkpoint(db, user.id, lesson_id)
    if cp:
        db.delete(cp)
        db.commit()
