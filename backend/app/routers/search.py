"""Search across lessons, grammar topics, and vocabulary."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.lesson import Lesson
from app.models.grammar import GrammarTopic
from app.models.vocab import VocabEntry

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def search(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Search lessons, grammar topics, and vocabulary by query string."""
    q_lower = q.lower()
    results = []

    # Search lessons
    lessons = (
        db.query(Lesson)
        .filter(
            or_(
                Lesson.title.ilike(f"%{q_lower}%"),
                Lesson.description.ilike(f"%{q_lower}%"),
            )
        )
        .limit(6)
        .all()
    )
    for l in lessons:
        topics = l.topics or []
        results.append({
            "id": f"lesson-{l.id}",
            "title": f"{l.level}: {l.title}",
            "description": f"Lesson {l.order} · {', '.join(topics[:2])}" if topics else f"Lesson {l.order}",
            "category": "lesson",
            "href": f"/curriculum/{l.level.lower()}/{l.id}",
            "relevance": 90,
        })

    # Search grammar topics
    grammar_topics = (
        db.query(GrammarTopic)
        .filter(
            or_(
                GrammarTopic.title.ilike(f"%{q_lower}%"),
                GrammarTopic.content.ilike(f"%{q_lower}%"),
            )
        )
        .limit(4)
        .all()
    )
    for g in grammar_topics:
        results.append({
            "id": f"grammar-{g.id}",
            "title": g.title,
            "description": g.level or "",
            "category": "grammar",
            "href": f"/grammar/{g.slug}",
            "relevance": 80,
        })

    # Search vocabulary
    vocab_entries = (
        db.query(VocabEntry)
        .filter(
            or_(
                VocabEntry.german.ilike(f"%{q_lower}%"),
                VocabEntry.english.ilike(f"%{q_lower}%"),
            )
        )
        .limit(4)
        .all()
    )
    for v in vocab_entries:
        results.append({
            "id": f"vocab-{v.id}",
            "title": f"{v.german} — {v.english}",
            "description": v.part_of_speech or "",
            "category": "vocabulary",
            "href": f"/curriculum/{v.lesson.level.lower()}/{v.lesson_id}" if v.lesson else "#",
            "relevance": 70,
        })

    return results
