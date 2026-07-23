"""Learning analytics endpoints (Sprint 20). Fire-and-forget event recording +
aggregated dashboard queries."""

from __future__ import annotations
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqla_func

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.learning_event import LearningEvent
from app.schemas.analytics import (
    RecordEventRequest,
    RecordBatchRequest,
    EventResponse,
    DashboardResponse,
    LearnerSummary,
    LessonStats,
)

logger = logging.getLogger("deutschcoach.analytics")
router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── Event recording ──────────────────────────────────────────────────────

@router.post("/event", response_model=EventResponse, status_code=201)
def record_event(
    body: RecordEventRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    event = LearningEvent(
        user_id=user.id,
        event_type=body.event_type,
        lesson_id=body.lesson_id,
        stage=body.stage,
        payload=body.payload,
        client_ts=datetime.fromisoformat(body.client_ts) if body.client_ts else None,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse(
        id=event.id,
        event_type=event.event_type,
        lesson_id=event.lesson_id,
        stage=event.stage,
        created_at=event.created_at,
    )


@router.post("/events", status_code=201)
def record_batch(
    body: RecordBatchRequest,
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    """Fire-and-forget batch — send multiple events at once (e.g. on lesson exit)."""
    rows = []
    for ev in body.events:
        rows.append(LearningEvent(
            user_id=user.id,
            event_type=ev.event_type,
            lesson_id=ev.lesson_id,
            stage=ev.stage,
            payload=ev.payload,
            client_ts=datetime.fromisoformat(ev.client_ts) if ev.client_ts else None,
        ))
    db.add_all(rows)
    db.commit()
    return {"recorded": len(rows)}


# ── Dashboard ────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    uid = user.id
    thirty_days = datetime.now(timezone.utc) - timedelta(days=30)

    # ── learner summary ──────────────────────────────────────────────────
    base = db.query(LearningEvent).filter(LearningEvent.user_id == uid)

    total_starts = base.filter(LearningEvent.event_type == "lesson_started").count()
    total_completions = base.filter(LearningEvent.event_type == "lesson_completed").count()
    completion_rate = (total_completions / total_starts * 100) if total_starts > 0 else 0

    total_emma_qs = base.filter(LearningEvent.event_type == "emma_question").count()
    total_retries = base.filter(LearningEvent.event_type == "exercise_retry").count()

    total_speaking = (
        base.filter(LearningEvent.event_type == "stage_entered")
        .filter(LearningEvent.stage == "speaking")
        .count()
    )
    total_skip_speaking = base.filter(LearningEvent.event_type == "speaking_skipped").count()
    speaking_skip_rate = (total_skip_speaking / total_speaking * 100) if total_speaking > 0 else 0

    # active days (distinct created_at days, last 30)
    active_days = (
        db.query(sqla_func.count(sqla_func.distinct(sqla_func.date(LearningEvent.created_at))))
        .filter(LearningEvent.user_id == uid)
        .filter(LearningEvent.created_at >= thirty_days)
        .scalar()
    ) or 0

    learner = LearnerSummary(
        total_lessons_started=total_starts,
        total_lessons_completed=total_completions,
        completion_rate_pct=round(completion_rate, 1),
        total_emma_questions=total_emma_qs,
        avg_exercise_retries=round(total_retries / max(total_starts, 1), 1),
        speaking_skip_rate_pct=round(speaking_skip_rate, 1),
        streak=0,  # streak is User.daily_streak — join or skip for now
        active_days=active_days,
    )

    # ── recent lessons ───────────────────────────────────────────────────
    lesson_ids = (
        db.query(LearningEvent.lesson_id, sqla_func.count(LearningEvent.id))
        .filter(LearningEvent.user_id == uid)
        .filter(LearningEvent.lesson_id.isnot(None))
        .filter(LearningEvent.created_at >= thirty_days)
        .group_by(LearningEvent.lesson_id)
        .order_by(sqla_func.max(LearningEvent.created_at).desc())
        .limit(10)
        .all()
    )

    recent: list[LessonStats] = []
    for lid, _ in lesson_ids:
        evts = base.filter(LearningEvent.lesson_id == lid)
        starts = evts.filter(LearningEvent.event_type == "lesson_started").count()
        comps = evts.filter(LearningEvent.event_type == "lesson_completed").count()
        drops = evts.filter(LearningEvent.event_type == "dropoff").count()
        emma_qs = evts.filter(LearningEvent.event_type == "emma_question").count()
        time_events = evts.filter(LearningEvent.event_type == "time_spent").all()
        avg_time = (
            sum((e.payload or {}).get("seconds", 0) for e in time_events) / max(len(time_events), 1)
        )
        recent.append(LessonStats(
            lesson_id=lid,
            title=None,
            starts=starts,
            completions=comps,
            dropoffs=drops,
            avg_time_spent_sec=round(avg_time, 1),
            emma_questions=emma_qs,
        ))

    return DashboardResponse(learner=learner, recent_lessons=recent)


# ── Event type reference ─────────────────────────────────────────────────

@router.get("/event-types")
def list_event_types(user=Depends(require_auth)):
    from app.schemas.analytics import EVENT_TYPES
    return {"event_types": [{"key": k, "description": v} for k, v in EVENT_TYPES.items()]}
