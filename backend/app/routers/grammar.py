from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from app.models.grammar import GrammarTopic
from app.models.lesson import Lesson
from app.models.user import User
from app.routers.auth_dependency import require_auth, get_current_user, TIER_LIMITS
from app.schemas.grammar import GrammarTopicOut, GrammarTopicDetail

router = APIRouter(prefix="/grammar", tags=["Grammar"])


@router.get("/", response_model=list[GrammarTopicOut])
def list_grammar(
    q: str = Query(None, description="Search query"),
    level: str = Query(None, description="Filter by CEFR level"),
    db: Session = Depends(get_db),
    user=Depends(require_auth),
):
    query = db.query(GrammarTopic)
    if q:
        query = query.filter(
            GrammarTopic.title.ilike(f"%{q}%")
            | GrammarTopic.content.ilike(f"%{q}%")
        )
    if level:
        query = query.filter(GrammarTopic.level == level)
    return query.order_by(GrammarTopic.level, GrammarTopic.title).all()


@router.get("/{slug}", response_model=GrammarTopicDetail)
def get_grammar_topic(
    slug: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    topic = db.query(GrammarTopic).filter(GrammarTopic.slug == slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Grammar topic not found")

    # Check tier access based on the topic's level
    topic_level = topic.level.value if hasattr(topic.level, "value") else topic.level
    user_tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else user.subscription_tier
    allowed_levels = TIER_LIMITS.get(user_tier, ["A1"])
    if topic_level.upper() not in [l.upper() for l in allowed_levels]:
        raise HTTPException(
            status_code=403,
            detail=f"Your {user_tier} plan does not include {topic_level} content. Upgrade to access this level.",
        )

    # Resolve related lessons
    related = []
    if topic.related_lesson_ids:
        lessons = (
            db.query(Lesson)
            .filter(Lesson.id.in_(topic.related_lesson_ids))
            .all()
        )
        related = [
            {
                "id": l.id,
                "title": l.title,
                "level": l.level.value if hasattr(l.level, "value") else l.level,
                "unit": l.unit,
            }
            for l in lessons
        ]

    return GrammarTopicDetail(
        id=topic.id,
        slug=topic.slug,
        title=topic.title,
        level=topic.level.value if hasattr(topic.level, "value") else topic.level,
        content=topic.content,
        examples=topic.examples or [],
        related_lessons=related,
    )
