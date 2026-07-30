"""Adaptive learning endpoints (Section 10.2). Weak concept retrieval, review
suggestions, and prerequisite evaluation for the adaptive lesson engine."""

from __future__ import annotations
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.lesson import Lesson
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic
from app.models.srs import SRSState
from app.models.adaptive import ConceptConfidence, LessonPrerequisite
from app.schemas.adaptive import (
    WeakConceptOut,
    WeakConceptsResponse,
    ReviewSuggestRequest,
    ReviewSuggestItem,
    ReviewSuggestResponse,
    PrerequisiteOut,
    PrerequisiteResponse,
)

logger = logging.getLogger("deutschcoach.adaptive")
router = APIRouter(prefix="/adaptive", tags=["Adaptive"])


# ── Weak concepts ────────────────────────────────────────────────────────

@router.get("/weak-concepts", response_model=WeakConceptsResponse)
def get_weak_concepts(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
    limit: int = 10,
):
    """Return the learner's weakest vocabulary and grammar concepts.
    Vocabulary weakness is determined by SRS ease factor and lapse count.
    Grammar weakness is determined by concept_confidence records."""
    uid = user.id

    # Weak vocabulary: from SRS, sorted by easiness_factor asc + lapses desc
    weak_vocab = (
        db.query(SRSState, VocabEntry)
        .join(VocabEntry, SRSState.vocab_entry_id == VocabEntry.id)
        .filter(SRSState.user_id == uid)
        .order_by(SRSState.easiness_factor.asc(), desc(SRSState.lapses))
        .limit(limit)
        .all()
    )

    vocabulary = [
        WeakConceptOut(
            concept_type="vocabulary",
            id=srs.vocab_entry_id,
            label=vocab.german,
            confidence=max(0.1, min(1.0, srs.easiness_factor / 3.0)),
            easiness_factor=srs.easiness_factor,
            lapse_count=srs.lapses,
        )
        for srs, vocab in weak_vocab
    ]

    # Weak grammar: from concept_confidence, sorted by confidence asc
    weak_grammar_db = (
        db.query(ConceptConfidence, GrammarTopic)
        .outerjoin(GrammarTopic, ConceptConfidence.grammar_topic_id == GrammarTopic.id)
        .filter(
            ConceptConfidence.user_id == uid,
            ConceptConfidence.concept_type == "grammar",
        )
        .order_by(ConceptConfidence.confidence.asc())
        .limit(limit)
        .all()
    )

    grammar = [
        WeakConceptOut(
            concept_type="grammar",
            id=cc.grammar_topic_id or 0,
            label=topic.title if topic else f"Grammar #{cc.grammar_topic_id}",
            confidence=cc.confidence,
            easiness_factor=cc.easiness_factor,
            lapse_count=cc.lapse_count,
        )
        for cc, topic in weak_grammar_db
    ]

    return WeakConceptsResponse(vocabulary=vocabulary, grammar=grammar)


# ── Review suggestions ────────────────────────────────────────────────────

@router.post("/review-suggest", response_model=ReviewSuggestResponse)
def suggest_review(
    body: ReviewSuggestRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Suggest review cards related to a completed lesson.
    Prioritizes due cards matching the lesson's vocabulary."""
    uid = user.id

    # Find lesson vocab entries to prioritize
    lesson = db.query(Lesson).filter(Lesson.id == body.lesson_id).first()
    lesson_vocab_ids: list[int] = []
    if lesson:
        lesson_vocab_ids = [
            row[0] for row in db.query(VocabEntry.id)
            .filter(VocabEntry.lesson_id == lesson.id)
            .all()
        ]

    # Get due SRS cards for this lesson's vocabulary, plus other due cards
    due_cards = (
        db.query(SRSState, VocabEntry)
        .join(VocabEntry, SRSState.vocab_entry_id == VocabEntry.id)
        .filter(SRSState.user_id == uid)
        .filter(SRSState.next_review_at <= func.now())
        .order_by(
            # Prioritize lesson-related cards
            SRSState.vocab_entry_id.in_(lesson_vocab_ids).desc(),
            SRSState.easiness_factor.asc(),
        )
        .limit(body.limit)
        .all()
    )

    items = [
        ReviewSuggestItem(
            id=srs.id,
            concept_type="vocabulary",
            label=vocab.german,
            confidence=max(0.1, min(1.0, srs.easiness_factor / 3.0)),
            due=True,
        )
        for srs, vocab in due_cards
    ]

    total_due = (
        db.query(func.count(SRSState.id))
        .filter(SRSState.user_id == uid, SRSState.next_review_at <= func.now())
        .scalar()
    ) or 0

    return ReviewSuggestResponse(items=items, total_due=total_due)


# ── Lesson prerequisites ─────────────────────────────────────────────────

@router.get("/prerequisites/{lesson_id}", response_model=PrerequisiteResponse)
def get_prerequisites(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Evaluate prerequisite readiness for a lesson.
    Checks vocabulary and grammar prerequisites and returns their current
    confidence levels."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    prereqs: list[PrerequisiteOut] = []

    # Check vocabulary prerequisites
    vocab_ids: list[int] = lesson.prerequisite_vocab_ids or []
    for vid in vocab_ids:
        confidence_record = (
            db.query(ConceptConfidence)
            .filter(
                ConceptConfidence.user_id == user.id,
                ConceptConfidence.concept_type == "vocabulary",
                ConceptConfidence.vocab_entry_id == vid,
            )
            .first()
        )
        vocab_entry = db.query(VocabEntry).filter(VocabEntry.id == vid).first()
        current = confidence_record.confidence if confidence_record else 0.0
        prereqs.append(PrerequisiteOut(
            prereq_type="vocabulary",
            id=vid,
            label=vocab_entry.german if vocab_entry else f"Vocab #{vid}",
            current_confidence=current,
            min_confidence=0.3,
            satisfied=current >= 0.3,
        ))

    # Check grammar prerequisites
    grammar_ids: list[int] = lesson.prerequisite_grammar_topic_ids or []
    for gid in grammar_ids:
        confidence_record = (
            db.query(ConceptConfidence)
            .filter(
                ConceptConfidence.user_id == user.id,
                ConceptConfidence.concept_type == "grammar",
                ConceptConfidence.grammar_topic_id == gid,
            )
            .first()
        )
        topic = db.query(GrammarTopic).filter(GrammarTopic.id == gid).first()
        current = confidence_record.confidence if confidence_record else 0.0
        prereqs.append(PrerequisiteOut(
            prereq_type="grammar",
            id=gid,
            label=topic.title if topic else f"Grammar #{gid}",
            current_confidence=current,
            min_confidence=0.3,
            satisfied=current >= 0.3,
        ))

    return PrerequisiteResponse(
        lesson_id=lesson_id,
        prerequisites=prereqs,
        all_satisfied=all(p.satisfied for p in prereqs),
    )
