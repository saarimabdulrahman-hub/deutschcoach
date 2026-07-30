from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta, UTC

from database import get_db
from app.models.user import User
from app.models.vocab import VocabEntry
from app.models.srs import SRSState, CardStatus
from app.models.adaptive import ConceptConfidence
from app.models.grammar_srs import GrammarCard
from app.models.grammar import GrammarTopic
from datetime import datetime as dt_module
from app.models.user_vocab_note import UserVocabNote
from app.routers.auth_dependency import require_auth
from app.srs.engine import calculate_srs
from app.schemas.srs import (
    SRSReviewRequest,
    SRSCustomRequest,
    SRSSeedRequest,
    SRSCardOut,
    SRSStats,
)

router = APIRouter(prefix="/srs", tags=["SRS"])


def _vocab_to_dict(v: VocabEntry) -> dict:
    return {
        "id": v.id,
        "german": v.german,
        "english": v.english,
        "example_sentence": v.example_sentence,
        "part_of_speech": v.part_of_speech,
    }


def _card_to_out(card: SRSState) -> dict:
    """Serialize an SRSState with its joined vocab entry for API response."""
    return {
        "id": card.id,
        "vocab_entry": _vocab_to_dict(card.vocab_entry) if card.vocab_entry else {},
        "status": card.status.value if hasattr(card.status, "value") else card.status,
        "easiness_factor": card.easiness_factor,
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "lapses": card.lapses,
    }


@router.get("/due")
def get_due_cards(
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return cards due for review, ordered by next_review_at ascending."""
    now = datetime.now(UTC).replace(tzinfo=None)

    cards = (
        db.query(SRSState)
        .filter(
            SRSState.user_id == user.id,
            SRSState.next_review_at <= now,
        )
        .order_by(SRSState.next_review_at.asc())
        .limit(limit)
        .all()
    )

    # Eager-load vocab entries for each card
    vocab_ids = [c.vocab_entry_id for c in cards]
    if vocab_ids:
        vocab_map = {
            v.id: v
            for v in db.query(VocabEntry).filter(VocabEntry.id.in_(vocab_ids)).all()
        }
    else:
        vocab_map = {}

    result = []
    for card in cards:
        card.vocab_entry = vocab_map.get(card.vocab_entry_id)
        result.append(_card_to_out(card))

    return result


@router.post("/review")
def review_card(
    body: SRSReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Submit a review rating for a card. Applies SM-2 algorithm and persists."""
    card = (
        db.query(SRSState)
        .filter(SRSState.id == body.card_id, SRSState.user_id == user.id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found or does not belong to current user",
        )

    if body.rating < 0 or body.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 0 and 5",
        )

    # Apply SM-2 algorithm (pure function, mutates card in place)
    calculate_srs(card, body.rating)

    # Sync to shared concept_confidence (Section 10.2)
    confidence_record = db.query(ConceptConfidence).filter(
        ConceptConfidence.user_id == user.id,
        ConceptConfidence.concept_type == "vocabulary",
        ConceptConfidence.vocab_entry_id == card.vocab_entry_id,
    ).first()
    if confidence_record:
        confidence_record.confidence = max(0.1, min(1.0, card.easiness_factor / 3.0))
        confidence_record.easiness_factor = card.easiness_factor
        confidence_record.lapse_count = card.lapses
        confidence_record.review_count = card.repetitions
        confidence_record.last_reviewed_at = dt_module.now()
    else:
        db.add(ConceptConfidence(
            user_id=user.id,
            concept_type="vocabulary",
            vocab_entry_id=card.vocab_entry_id,
            confidence=max(0.1, min(1.0, card.easiness_factor / 3.0)),
            easiness_factor=card.easiness_factor,
            lapse_count=card.lapses,
            review_count=card.repetitions,
            last_reviewed_at=dt_module.now(),
        ))

    db.commit()
    db.refresh(card)

    # Load vocab for response
    vocab = db.query(VocabEntry).filter(VocabEntry.id == card.vocab_entry_id).first()
    card.vocab_entry = vocab

    return _card_to_out(card)


@router.get("/stats", response_model=SRSStats)
def get_srs_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return counts by card status and total cards due today."""
    now = datetime.now(UTC).replace(tzinfo=None)

    new_count = (
        db.query(func.count(SRSState.id))
        .filter(SRSState.user_id == user.id, SRSState.status == CardStatus.new)
        .scalar()
    ) or 0

    learning_count = (
        db.query(func.count(SRSState.id))
        .filter(SRSState.user_id == user.id, SRSState.status == CardStatus.learning)
        .scalar()
    ) or 0

    reviewing_count = (
        db.query(func.count(SRSState.id))
        .filter(SRSState.user_id == user.id, SRSState.status == CardStatus.reviewing)
        .scalar()
    ) or 0

    mastered_count = (
        db.query(func.count(SRSState.id))
        .filter(SRSState.user_id == user.id, SRSState.status == CardStatus.mastered)
        .scalar()
    ) or 0

    due_today = (
        db.query(func.count(SRSState.id))
        .filter(
            SRSState.user_id == user.id,
            SRSState.next_review_at <= now,
        )
        .scalar()
    ) or 0

    return SRSStats(
        new=new_count,
        learning=learning_count,
        reviewing=reviewing_count,
        mastered=mastered_count,
        total_due_today=due_today,
    )


@router.post("/custom")
def add_custom_vocab(
    body: SRSCustomRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Create a UserVocabNote and seed an SRSState for a custom word.

    Looks up an existing VocabEntry by german word to link the SRSState.
    If no matching VocabEntry exists, only the note is created.
    """
    # Always create the user vocab note
    note = UserVocabNote(
        user_id=user.id,
        german=body.german.strip(),
        english=body.english.strip(),
        notes=body.notes.strip() if body.notes else None,
    )
    db.add(note)

    # Try to find an existing VocabEntry for SRS linking
    vocab_entry = (
        db.query(VocabEntry)
        .filter(VocabEntry.german.ilike(body.german.strip()))
        .first()
    )

    srs_card = None
    if vocab_entry:
        # Check if SRSState already exists for this user + vocab
        existing = (
            db.query(SRSState)
            .filter(
                SRSState.user_id == user.id,
                SRSState.vocab_entry_id == vocab_entry.id,
            )
            .first()
        )

        if not existing:
            now = datetime.now(UTC).replace(tzinfo=None)
            srs_card = SRSState(
                user_id=user.id,
                vocab_entry_id=vocab_entry.id,
                easiness_factor=2.5,
                interval_days=0,
                repetitions=0,
                lapses=0,
                next_review_at=now,
                status=CardStatus.new,
            )
            db.add(srs_card)

    db.commit()
    db.refresh(note)

    response = {
        "note": {
            "id": note.id,
            "german": note.german,
            "english": note.english,
            "notes": note.notes,
        },
        "card": None,
    }

    if srs_card:
        db.refresh(srs_card)
        srs_card.vocab_entry = vocab_entry
        response["card"] = _card_to_out(srs_card)

    return response


@router.post("/seed-lesson")
def seed_lesson(
    body: SRSSeedRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Create SRSState rows for all vocab in a lesson (skip existing).

    Called when a lesson is completed to seed the SRS deck.
    """
    # Verify lesson exists
    vocab_entries = (
        db.query(VocabEntry)
        .filter(VocabEntry.lesson_id == body.lesson_id)
        .all()
    )

    if not vocab_entries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No vocabulary found for lesson {body.lesson_id}",
        )

    # Get existing SRSState vocab_entry_ids for this user (to skip duplicates)
    existing_ids = {
        row[0]
        for row in db.query(SRSState.vocab_entry_id)
        .filter(
            SRSState.user_id == user.id,
            SRSState.vocab_entry_id.in_([v.id for v in vocab_entries]),
        )
        .all()
    }

    now = datetime.now(UTC).replace(tzinfo=None)
    # Seed cards as immediately due (1 second in the past) so they are
    # guaranteed to appear in stats.total_due_today regardless of MySQL
    # DATETIME sub-second rounding.
    due_now = now - timedelta(seconds=1)
    created = 0

    for v in vocab_entries:
        if v.id in existing_ids:
            continue

        card = SRSState(
            user_id=user.id,
            vocab_entry_id=v.id,
            easiness_factor=2.5,
            interval_days=0,
            repetitions=0,
            lapses=0,
            next_review_at=due_now,
            status=CardStatus.new,
        )
        db.add(card)
        created += 1

    # Create or update lesson progress
    from app.models.lesson_progress import LessonProgress
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.lesson_id == body.lesson_id,
    ).first()
    if not progress:
        progress = LessonProgress(
            user_id=user.id,
            lesson_id=body.lesson_id,
            completed_at=now,
        )
        db.add(progress)
    elif not progress.completed_at:
        progress.completed_at = now

    # Update user streak
    today = date.today()
    yesterday = today - timedelta(days=1)
    if user.last_active_date == yesterday:
        user.daily_streak += 1
    elif user.last_active_date != today:
        user.daily_streak = 1
    user.last_active_date = today

    db.commit()

    return {
        "lesson_id": body.lesson_id,
        "total_vocab": len(vocab_entries),
        "newly_seeded": created,
        "already_existed": len(vocab_entries) - created,
        "streak": user.daily_streak,
    }


# ── Grammar SRS (Section 18) ────────────────────────────────────────────

@router.get("/grammar/due")
def get_grammar_due(
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return grammar cards due for review, ordered by next_review_at."""
    now = datetime.now(UTC).replace(tzinfo=None)
    cards = (
        db.query(GrammarCard, GrammarTopic)
        .join(GrammarTopic, GrammarCard.grammar_topic_id == GrammarTopic.id)
        .filter(GrammarCard.user_id == user.id, GrammarCard.next_review_at <= now)
        .order_by(GrammarCard.next_review_at.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": c.id,
            "grammar_topic_id": c.grammar_topic_id,
            "topic_slug": t.slug,
            "topic_title": t.title,
            "topic_content": t.content,
            "easiness_factor": c.easiness_factor,
            "interval_days": c.interval_days,
            "repetitions": c.repetitions,
            "lapses": c.lapses,
            "next_review_at": c.next_review_at.isoformat() if c.next_review_at else None,
            "status": c.status.value if hasattr(c.status, "value") else c.status,
        }
        for c, t in cards
    ]


@router.post("/grammar/review")
def review_grammar_card(
    card_id: int,
    rating: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Submit a review rating (0-5) for a grammar card. Uses SM-2."""
    card = db.query(GrammarCard).filter(
        GrammarCard.id == card_id,
        GrammarCard.user_id == user.id,
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Grammar card not found")
    if rating < 0 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 0-5")

    # Apply SM-2 via the existing engine
    srs_card = SRSState(
        easiness_factor=card.easiness_factor,
        interval_days=card.interval_days,
        repetitions=card.repetitions,
        lapses=card.lapses,
        next_review_at=card.next_review_at,
        last_reviewed_at=card.last_reviewed_at,
        status=card.status,
    )
    calculate_srs(srs_card, rating)

    card.easiness_factor = srs_card.easiness_factor
    card.interval_days = srs_card.interval_days
    card.repetitions = srs_card.repetitions
    card.lapses = srs_card.lapses
    card.next_review_at = srs_card.next_review_at
    card.last_reviewed_at = srs_card.last_reviewed_at
    card.status = srs_card.status

    # Sync to concept_confidence
    confidence = max(0.1, min(1.0, card.easiness_factor / 3.0))
    existing = db.query(ConceptConfidence).filter(
        ConceptConfidence.user_id == user.id,
        ConceptConfidence.concept_type == "grammar",
        ConceptConfidence.grammar_topic_id == card.grammar_topic_id,
    ).first()
    if existing:
        existing.confidence = confidence
        existing.easiness_factor = card.easiness_factor
        existing.lapse_count = card.lapses
        existing.review_count = card.repetitions
        existing.last_reviewed_at = card.last_reviewed_at
    else:
        db.add(ConceptConfidence(
            user_id=user.id,
            concept_type="grammar",
            grammar_topic_id=card.grammar_topic_id,
            confidence=confidence,
            easiness_factor=card.easiness_factor,
            lapse_count=card.lapses,
            review_count=card.repetitions,
        ))

    db.commit()
    db.refresh(card)
    return {
        "id": card.id,
        "grammar_topic_id": card.grammar_topic_id,
        "easiness_factor": card.easiness_factor,
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "lapses": card.lapses,
        "next_review_at": card.next_review_at.isoformat() if card.next_review_at else None,
        "status": card.status.value if hasattr(card.status, "value") else card.status,
    }


@router.post("/grammar/seed-lesson")
def seed_grammar_cards(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Create grammar SRS cards for a lesson's grammar topics."""
    from app.models.lesson import Lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    grammar_topics = db.query(GrammarTopic).filter(
        GrammarTopic.related_lesson_ids.contains([lesson.id])
    ).all()

    now = datetime.now(UTC).replace(tzinfo=None)
    created = 0
    for topic in grammar_topics:
        existing = db.query(GrammarCard).filter(
            GrammarCard.user_id == user.id,
            GrammarCard.grammar_topic_id == topic.id,
        ).first()
        if not existing:
            db.add(GrammarCard(
                user_id=user.id,
                grammar_topic_id=topic.id,
                next_review_at=now,
            ))
            created += 1
    db.commit()
    return {"lesson_id": lesson_id, "grammar_topics": len(grammar_topics), "cards_created": created}
