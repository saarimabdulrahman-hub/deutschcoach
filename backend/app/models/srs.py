from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.sql import func
from database import Base
import enum


class CardStatus(str, enum.Enum):
    new = "new"
    learning = "learning"
    reviewing = "reviewing"
    mastered = "mastered"


class SRSState(Base):
    __tablename__ = "srs_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    vocab_entry_id = Column(Integer, ForeignKey("vocab_entries.id"), nullable=False)
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
        UniqueConstraint("user_id", "vocab_entry_id", name="uq_user_vocab"),
    )
