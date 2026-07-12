"""Learning analytics event model (Sprint 20). Tracks every meaningful learner
action for dashboards, retention analysis, and product decisions."""

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base


class LearningEvent(Base):
    __tablename__ = "learning_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    stage = Column(String(50), nullable=True)           # e.g. "dialogue", "vocabulary"
    payload = Column(JSON, nullable=True)                # event-specific data
    client_ts = Column(DateTime, nullable=True)          # when the event happened (client clock)
    created_at = Column(DateTime, server_default=func.now())
