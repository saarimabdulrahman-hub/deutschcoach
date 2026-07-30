"""Adaptive learning persistence models (Section 10.2). Shared concept confidence
and lesson prerequisite tracking for vocabulary and grammar concepts."""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base


class ConceptConfidence(Base):
    """Polymorphic confidence record for vocabulary and grammar concepts.
    Vocabulary records use vocab_entry_id; grammar records use grammar_topic_id
    with concept_type = 'grammar'. Both use the same confidence model."""
    __tablename__ = "concept_confidence"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    concept_type = Column(String(20), nullable=False, index=True)  # "vocabulary" | "grammar"
    vocab_entry_id = Column(Integer, ForeignKey("vocab_entries.id"), nullable=True)
    grammar_topic_id = Column(Integer, ForeignKey("grammar_topics.id"), nullable=True)
    confidence = Column(Float, default=0.5, nullable=False)  # 0.0–1.0
    easiness_factor = Column(Float, default=2.5)
    lapse_count = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class LessonPrerequisite(Base):
    """Tracks prerequisite relationships for adaptive lesson readiness."""
    __tablename__ = "lesson_prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    prereq_lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    prereq_vocab_entry_id = Column(Integer, ForeignKey("vocab_entries.id"), nullable=True)
    prereq_grammar_topic_id = Column(Integer, ForeignKey("grammar_topics.id"), nullable=True)
    min_confidence = Column(Float, default=0.3, nullable=False)  # minimum confidence required
    created_at = Column(DateTime, server_default=func.now())
