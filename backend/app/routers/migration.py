"""Content Migration router (Section 12.7). Supports the two-pass migration
workflow, editorial review, and phased rollout."""

from __future__ import annotations
import logging
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.lesson import Lesson
from sqlalchemy import func as sqla_func

from app.services.migration_service import (
    pass1_parse,
    pass2_create_entities,
    approve_migration,
    reject_migration,
    reorder_stages,
)
from app.models.dialogue import DialogueLine
from app.models.lesson_session import LessonSession, CheckpointResult

logger = logging.getLogger("deutschcoach.migration")
router = APIRouter(prefix="/migration", tags=["Migration"])

CURRICULUM_DIR = Path(__file__).parent.parent.parent / "data" / "curriculum"

# ── Schemas ──────────────────────────────────────────────────────────────

class MigrateRequest(BaseModel):
    filepath: str

class ApproveRequest(BaseModel):
    stages_config: list[dict]

class ReorderRequest(BaseModel):
    stage_key: str
    new_index: int

class RejectRequest(BaseModel):
    reason: str = ""


# ── Pass 1: Parse ────────────────────────────────────────────────────────

@router.post("/pass1")
def run_pass1(
    body: MigrateRequest,
    _=Depends(require_auth),
):
    """Pass 1 — Parse a lesson markdown file and return the extracted structure."""
    filepath = str(CURRICULUM_DIR / body.filepath)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Lesson file not found: {body.filepath}")
    try:
        result = pass1_parse(filepath)
        return {"status": "ok", "lesson_content": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Pass 2: Create entities ─────────────────────────────────────────────

@router.post("/pass2/{lesson_id}")
def run_pass2(
    lesson_id: int,
    body: MigrateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Pass 2 — Generate entities and stages_config for a parsed lesson."""
    filepath = str(CURRICULUM_DIR / body.filepath)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Lesson file not found: {body.filepath}")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson_content = pass1_parse(filepath)
    lesson.lesson_content_json = lesson_content
    db.commit()

    result = pass2_create_entities(db, lesson, lesson_content)
    return {"status": "ok", "migration": result}


# ── Editorial review ─────────────────────────────────────────────────────

@router.post("/{lesson_id}/approve")
def approve_lesson_migration(
    lesson_id: int,
    body: ApproveRequest,
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Approve a migration — apply the reviewed stages_config."""
    try:
        lesson = approve_migration(db, lesson_id, body.stages_config)
        return {"status": "approved", "lesson_id": lesson.id, "title": lesson.title}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{lesson_id}/reject")
def reject_lesson_migration(
    lesson_id: int,
    body: RejectRequest = RejectRequest(),
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Reject a migration — discard the draft."""
    try:
        lesson = reject_migration(db, lesson_id, body.reason)
        return {"status": "rejected", "lesson_id": lesson.id, "title": lesson.title}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{lesson_id}/reorder")
def reorder_lesson_stage(
    lesson_id: int,
    body: ReorderRequest,
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Reorder a stage within the lesson's stages_config."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.stages_config:
        raise HTTPException(status_code=400, detail="No stages_config to reorder")

    reordered = reorder_stages(lesson.stages_config, body.stage_key, body.new_index)
    lesson.stages_config = reordered
    db.commit()
    return {"status": "ok", "stages_config": reordered}


# ── Preview migrated lesson ───────────────────────────────────────────────

@router.get("/{lesson_id}/preview")
def preview_migration(
    lesson_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Preview a migrated lesson's stages_config and dialogue for editorial review."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if not lesson.stages_config and not lesson.lesson_content_json:
        raise HTTPException(status_code=400, detail="Lesson has no migration draft")

    dialogue = db.query(DialogueLine).filter(
        DialogueLine.lesson_id == lesson_id
    ).order_by(DialogueLine.order).all()

    return {
        "lesson": {
            "id": lesson.id,
            "title": lesson.title,
            "level": lesson.level.value if hasattr(lesson.level, "value") else str(lesson.level),
        },
        "stages_config": lesson.stages_config,
        "dialogue_lines": [
            {"id": d.id, "speaker": d.speaker, "german": d.german, "translation": d.translation}
            for d in dialogue
        ],
        "status": "migrated" if lesson.stages_config else "draft",
    }


# ── Rollout validation (A1 checkpoint) ────────────────────────────────────

@router.get("/rollout/validation")
def get_rollout_validation(
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Evaluate rollout readiness for A1-migrated lessons.
    Checks completion rates and checkpoint scores before A2-B1 progression."""
    from app.models.learning_event import LearningEvent

    a1_lessons = db.query(Lesson).filter(
        Lesson.level == "A1",
        Lesson.stages_config.isnot(None),
    ).all()

    lesson_stats = []
    for lesson in a1_lessons:
        sessions = db.query(LessonSession).filter(
            LessonSession.lesson_id == lesson.id,
            LessonSession.status == "completed",
        ).all()

        completions = db.query(sqla_func.count(LearningEvent.id)).filter(
            LearningEvent.event_type == "lesson_completed",
            LearningEvent.lesson_id == lesson.id,
        ).scalar() or 0

        starts = db.query(sqla_func.count(LearningEvent.id)).filter(
            LearningEvent.event_type == "lesson_started",
            LearningEvent.lesson_id == lesson.id,
        ).scalar() or 0

        checkpoint_scores = []
        for s in sessions:
            cps = db.query(CheckpointResult).filter(
                CheckpointResult.session_id == s.id
            ).all()
            if cps:
                checkpoint_scores.append(round(sum(c.pct for c in cps) / len(cps), 1))

        lesson_stats.append({
            "lesson_id": lesson.id,
            "title": lesson.title,
            "completion_rate_pct": round((completions / starts * 100), 1) if starts > 0 else 0,
            "avg_checkpoint_score": round(sum(checkpoint_scores) / len(checkpoint_scores), 1) if checkpoint_scores else None,
            "session_count": len(sessions),
        })

    overall_completion = round(
        sum(s["completion_rate_pct"] for s in lesson_stats) / len(lesson_stats), 1
    ) if lesson_stats else 0

    avg_checkpoint = round(
        sum(s["avg_checkpoint_score"] for s in lesson_stats if s["avg_checkpoint_score"] is not None) /
        max(len([s for s in lesson_stats if s["avg_checkpoint_score"] is not None]), 1), 1
    )

    return {
        "level": "A1",
        "migrated_lesson_count": len(a1_lessons),
        "lessons": lesson_stats,
        "overall_completion_rate_pct": overall_completion,
        "overall_avg_checkpoint_score": avg_checkpoint,
        "ready_for_next_level": overall_completion >= 60 and (avg_checkpoint >= 50 if avg_checkpoint else False),
    }


# ── Phased rollout status ────────────────────────────────────────────────

@router.get("/rollout")
def get_rollout_status(
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Return the migration status grouped by CEFR level (phased rollout)."""
    lessons = db.query(Lesson).order_by(Lesson.level, Lesson.order).all()
    levels: dict[str, list[dict]] = {}
    for lesson in lessons:
        lvl = lesson.level.value if hasattr(lesson.level, "value") else str(lesson.level)
        if lvl not in levels:
            levels[lvl] = []
        levels[lvl].append({
            "id": lesson.id,
            "title": lesson.title,
            "migrated": lesson.stages_config is not None,
            "has_draft": lesson.lesson_content_json is not None,
        })
    return {"rollout": levels}
