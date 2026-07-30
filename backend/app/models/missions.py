"""Daily missions and achievements model (Section 11.5)."""

from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class DailyMission(Base):
    """Tracks a user's daily mission progress."""
    __tablename__ = "daily_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mission_id = Column(String(50), nullable=False)  # "complete_lesson" | "review_cards" | "practice_speaking"
    target = Column(Integer, nullable=False)          # e.g. 1 lesson, 10 cards, 3 sentences
    progress = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False)
    mission_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Achievement(Base):
    """Tracks unlocked learner achievements."""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(String(50), nullable=False)  # "first_dialogue" | "vocab_master" | "grammar_apprentice"
    unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)
    progress = Column(Integer, default=0)  # current progress toward achievement
    target = Column(Integer, nullable=False)  # target to unlock
    created_at = Column(DateTime, server_default=func.now())
