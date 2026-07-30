"""Word interaction analytics model (Phase 1). Tracks which words a learner
taps or clicks for analytics and personalization."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class WordInteraction(Base):
    __tablename__ = "word_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vocab_entry_id = Column(Integer, ForeignKey("vocab_entries.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
