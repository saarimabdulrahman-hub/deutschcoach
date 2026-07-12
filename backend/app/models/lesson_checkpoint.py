"""Lesson checkpoint persistence (Sprint 21). One row per user per lesson —
saves the current stage, completed stages, and last-updated timestamp so
resume works across sessions and devices."""

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class LessonCheckpoint(Base):
    __tablename__ = "lesson_checkpoints"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    current_stage = Column(String(50), nullable=False, default="warm-welcome")
    completed_stages = Column(JSON, nullable=False, default=list)   # ["warm-welcome", "dialogue", …]
    time_spent_sec = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
