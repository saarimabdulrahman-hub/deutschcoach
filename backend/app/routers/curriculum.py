from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from app.models.user import User, CEFRLevel
from app.models.lesson import Lesson
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic
from app.models.lesson_progress import LessonProgress
from app.routers.auth_dependency import require_auth, TIER_LIMITS
from app.schemas.curriculum import (
    CurriculumLevel,
    LessonListItem,
    LessonDetail,
    VocabEntryOut,
)

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])

# Human-readable titles for each CEFR level
LEVEL_TITLES = {
    "A1": "Beginner",
    "A2": "Elementary",
    "B1": "Intermediate",
    "B2": "Upper Intermediate",
    "C1": "Advanced",
}


def _lesson_to_dict(lesson: Lesson) -> dict:
    return {
        "id": lesson.id,
        "title": lesson.title,
        "level": lesson.level.value if hasattr(lesson.level, "value") else lesson.level,
        "unit": lesson.unit,
        "order": lesson.order,
        "description": lesson.description,
        "content": lesson.content,
        "topics": lesson.topics or [],
        "prerequisite_lesson_id": lesson.prerequisite_lesson_id,
        "created_at": lesson.created_at.isoformat() if lesson.created_at else None,
    }


@router.get("/", response_model=list[CurriculumLevel])
def list_levels(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return all available CEFR levels with lesson counts and user's completed counts."""
    # Get all lessons grouped by level
    levels_data = (
        db.query(
            Lesson.level,
            func.count(Lesson.id).label("lesson_count"),
        )
        .group_by(Lesson.level)
        .order_by(Lesson.level)
        .all()
    )

    if not levels_data:
        return []

    # For each level, count completed lessons for the current user
    result = []
    for level, lesson_count in levels_data:
        level_str = level.value if hasattr(level, "value") else level

        # Count completed lessons for this user in this level
        completed_count = (
            db.query(func.count(LessonProgress.id))
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)
            .filter(
                LessonProgress.user_id == user.id,
                Lesson.level == level,
                LessonProgress.completed_at.isnot(None),
            )
            .scalar()
        )

        result.append(CurriculumLevel(
            level=level_str,
            title=LEVEL_TITLES.get(level_str, level_str),
            lesson_count=lesson_count,
            completed_count=completed_count or 0,
        ))

    return result


@router.get("/{level}", response_model=list[LessonListItem])
def list_lessons(
    level: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return all lessons for a given CEFR level with completion status for the current user."""
    # Validate level
    valid_levels = [e.value for e in CEFRLevel]
    if level.upper() not in valid_levels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level '{level}'. Valid levels: {', '.join(valid_levels)}",
        )

    # Check tier access
    user_tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else user.subscription_tier
    allowed_levels = TIER_LIMITS.get(user_tier, ["A1"])
    if level.upper() not in [l.upper() for l in allowed_levels]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your {user_tier} plan does not include {level} content. Upgrade to access this level.",
        )

    lessons = (
        db.query(Lesson)
        .filter(Lesson.level == level.upper())
        .order_by(Lesson.unit, Lesson.order)
        .all()
    )

    # Get completed lesson IDs for this user
    completed_ids = {
        row[0]
        for row in db.query(LessonProgress.lesson_id)
        .filter(
            LessonProgress.user_id == user.id,
            LessonProgress.completed_at.isnot(None),
        )
        .all()
    }

    result = []
    for lesson in lessons:
        result.append(LessonListItem(
            id=lesson.id,
            title=lesson.title,
            unit=lesson.unit,
            order=lesson.order,
            topics=lesson.topics or [],
            completed=(lesson.id in completed_ids),
        ))

    return result


@router.get("/{level}/{lesson_id}", response_model=LessonDetail)
def get_lesson_detail(
    level: str,
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return full lesson detail with vocabulary, exercises, and grammar topics."""
    # Validate level
    valid_levels = [e.value for e in CEFRLevel]
    if level.upper() not in valid_levels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid level '{level}'. Valid levels: {', '.join(valid_levels)}",
        )

    # Check tier access
    user_tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else user.subscription_tier
    allowed_levels = TIER_LIMITS.get(user_tier, ["A1"])
    if level.upper() not in [l.upper() for l in allowed_levels]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your {user_tier} plan does not include {level} content. Upgrade to access this level.",
        )

    lesson = (
        db.query(Lesson)
        .filter(Lesson.id == lesson_id, Lesson.level == level.upper())
        .first()
    )

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found in level {level}",
        )

    # Fetch vocabulary
    vocab_entries = (
        db.query(VocabEntry)
        .filter(VocabEntry.lesson_id == lesson.id)
        .all()
    )

    vocab_out = [VocabEntryOut.model_validate(v) for v in vocab_entries]

    # Exercises are stored as JSON on the lesson model
    exercises = lesson.exercises or []

    # Find grammar topics linked to this lesson
    grammar_topics = (
        db.query(GrammarTopic)
        .filter(GrammarTopic.related_lesson_ids.contains([lesson.id]))
        .all()
    )

    grammar_out = []
    for gt in grammar_topics:
        grammar_out.append({
            "id": gt.id,
            "slug": gt.slug,
            "title": gt.title,
            "level": gt.level.value if hasattr(gt.level, "value") else gt.level,
            "content": gt.content,
            "examples": gt.examples or [],
        })

    return LessonDetail(
        lesson=_lesson_to_dict(lesson),
        vocabulary=vocab_out,
        exercises=exercises,
        grammar_topics=grammar_out,
    )
