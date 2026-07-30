"""Grammar SRS model (Section 18). SM-2 scheduling for grammar concepts,
mirroring the vocabulary SRS model. Writes to shared concept_confidence."""

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.sql import func
from database import Base
from app.models.srs import CardStatus


class GrammarCard(Base):
    __tablename__ = "grammar_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    grammar_topic_id = Column(Integer, ForeignKey("grammar_topics.id"), nullable=False)
    easiness_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=0)
    repetitions = Column(Integer, default=0)
    lapses = Column(Integer, default=0)
    next_review_at = Column(DateTime, index=True, nullable=False)
    last_reviewed_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(CardStatus), default=CardStatus.new)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "grammar_topic_id", name="uq_user_grammar"),
    )
