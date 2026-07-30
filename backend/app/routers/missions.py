"""Daily Missions & Achievements endpoints (Section 11.5)."""

from __future__ import annotations
import logging
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.missions import DailyMission, Achievement

logger = logging.getLogger("deutschcoach.missions")
router = APIRouter(prefix="/missions", tags=["Missions"])

# ── Schemas ──────────────────────────────────────────────────────────────

class MissionOut(BaseModel):
    id: str
    label: str
    description: str
    target: int
    progress: int
    completed: bool

class AchievementOut(BaseModel):
    id: str
    label: str
    description: str
    unlocked: bool
    progress: int
    target: int
    unlocked_at: str | None = None

class MissionsResponse(BaseModel):
    missions: list[MissionOut]
    achievements: list[AchievementOut]
    streak: int
    streak_bonus: int

# ── Mission definitions ──────────────────────────────────────────────────

MISSION_DEFS = {
    "complete_lesson": {"label": "Complete 1 Lesson", "description": "Finish one lesson", "target": 1},
    "review_cards": {"label": "Review 10 Cards", "description": "Review flashcards", "target": 10},
    "practice_speaking": {"label": "Practice Speaking", "description": "Record 3 sentences", "target": 3},
}

ACHIEVEMENT_DEFS = {
    "first_dialogue": {"label": "First Dialogue", "description": "Complete your first dialogue lesson", "target": 1},
    "vocab_master": {"label": "Vocabulary Master", "description": "Learn 50 words", "target": 50},
    "grammar_apprentice": {"label": "Grammar Apprentice", "description": "Complete a grammar lesson", "target": 1},
}

# ── Streak bonus configuration (tunable defaults — not specification-defined) ──
# Map of {consecutive_days: bonus_xp}. Override via STREAK_BONUS_CONFIG env var
# as a JSON string, e.g. {"3":5,"7":10,"14":25,"30":50}
_DEFAULT_STREAK_BONUSES = {3: 5, 7: 10, 14: 25, 30: 50}
_STREAK_BONUS_THRESHOLDS: dict[int, int] = _DEFAULT_STREAK_BONUSES
import json as _json, os as _os
_env_bonus = _os.getenv("STREAK_BONUS_CONFIG")
if _env_bonus:
    try:
        parsed = _json.loads(_env_bonus)
        if isinstance(parsed, dict):
            _STREAK_BONUS_THRESHOLDS = {int(k): int(v) for k, v in parsed.items()}
    except (ValueError, TypeError):
        pass  # invalid config — use defaults

# ── Helpers ──────────────────────────────────────────────────────────────

def _get_or_create_missions(db: Session, user_id: int) -> list[DailyMission]:
    today = date.today()
    missions: list[DailyMission] = []
    for mid, mdef in MISSION_DEFS.items():
        m = db.query(DailyMission).filter(
            DailyMission.user_id == user_id,
            DailyMission.mission_id == mid,
            DailyMission.mission_date == today,
        ).first()
        if not m:
            m = DailyMission(
                user_id=user_id,
                mission_id=mid,
                target=mdef["target"],
                mission_date=today,
            )
            db.add(m)
        missions.append(m)
    db.commit()
    return missions


def _get_or_create_achievements(db: Session, user_id: int) -> list[Achievement]:
    achievements: list[Achievement] = []
    for aid, adef in ACHIEVEMENT_DEFS.items():
        a = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.achievement_id == aid,
        ).first()
        if not a:
            a = Achievement(
                user_id=user_id,
                achievement_id=aid,
                target=adef["target"],
            )
            db.add(a)
        achievements.append(a)
    db.commit()
    return achievements


def _calculate_streak_bonus(streak: int) -> int:
    bonus = 0
    for threshold, xp in sorted(_STREAK_BONUS_THRESHOLDS.items()):
        if streak >= threshold:
            bonus = xp
    return bonus

# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("/", response_model=MissionsResponse)
def get_missions(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Get today's missions, achievements, and streak info."""
    missions = _get_or_create_missions(db, user.id)
    achievements = _get_or_create_achievements(db, user.id)

    streak = user.daily_streak or 0
    streak_bonus = _calculate_streak_bonus(streak)

    return MissionsResponse(
        missions=[
            MissionOut(
                id=m.mission_id,
                **MISSION_DEFS[m.mission_id],
                progress=m.progress,
                completed=m.completed,
            )
            for m in missions
        ],
        achievements=[
            AchievementOut(
                id=a.achievement_id,
                **ACHIEVEMENT_DEFS[a.achievement_id],
                unlocked=a.unlocked,
                progress=a.progress,
                target=a.target,
                unlocked_at=a.unlocked_at.isoformat() if a.unlocked_at else None,
            )
            for a in achievements
        ],
        streak=streak,
        streak_bonus=streak_bonus,
    )


@router.get("/achievements")
def get_achievements(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return all learner achievements with unlock status."""
    achievements = _get_or_create_achievements(db, user.id)
    return {
        "achievements": [
            {
                "id": a.achievement_id,
                **ACHIEVEMENT_DEFS[a.achievement_id],
                "unlocked": a.unlocked,
                "progress": a.progress,
                "target": a.target,
                "unlocked_at": a.unlocked_at.isoformat() if a.unlocked_at else None,
            }
            for a in achievements
        ]
    }


@router.post("/claim")
def claim_mission(
    mission_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Claim a completed daily mission reward."""
    today = date.today()
    mission = db.query(DailyMission).filter(
        DailyMission.user_id == user.id,
        DailyMission.mission_id == mission_id,
        DailyMission.mission_date == today,
        DailyMission.completed == True,
    ).first()
    if not mission:
        return {"claimed": False, "reason": "Mission not completed or not found"}
    # Streak bonus already applied; mark as claimed to prevent double-claim
    mission.completed = False  # reset for tomorrow
    db.commit()
    return {"claimed": True, "mission_id": mission_id}

def update_progress(
    event_type: str,
    value: int = 1,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Update mission and achievement progress for an event.
    Supported event types: lesson_completed, cards_reviewed, speaking_practiced."""
    today = date.today()

    # Map event to missions
    mission_map = {
        "lesson_completed": "complete_lesson",
        "cards_reviewed": "review_cards",
        "speaking_practiced": "practice_speaking",
    }
    achievement_map = {
        "lesson_completed": ["first_dialogue", "grammar_apprentice"],
        "vocab_learned": ["vocab_master"],
    }

    # Update missions
    mid = mission_map.get(event_type)
    if mid:
        missions = _get_or_create_missions(db, user.id)
        for m in missions:
            if m.mission_id == mid and not m.completed:
                m.progress = min(m.target, m.progress + value)
                if m.progress >= m.target:
                    m.completed = True
                db.commit()

    # Update achievements
    aids = achievement_map.get(event_type, [])
    for aid in aids:
        achievements = _get_or_create_achievements(db, user.id)
        for a in achievements:
            if a.achievement_id == aid and not a.unlocked:
                a.progress += value
                if a.progress >= a.target:
                    a.unlocked = True
                    a.unlocked_at = datetime.now(timezone.utc)
                db.commit()

    return {"status": "ok"}
