"""Lesson session persistence model (Section 8.5). Tracks per-session lesson
progress, checkpoint results, and stage completion."""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base


class LessonSession(Base):
    __tablename__ = "lesson_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    status = Column(String(20), default="in_progress", nullable=False)  # in_progress | completed | abandoned
    score = Column(Float, nullable=True)  # overall mastery percentage
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)


class CheckpointResult(Base):
    __tablename__ = "checkpoint_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("lesson_sessions.id"), nullable=False, index=True)
    checkpoint_id = Column(String(50), nullable=False)  # e.g. "checkpoint-dialogue"
    correct = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    pct = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class LessonStageProgress(Base):
    __tablename__ = "lesson_stage_progress"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("lesson_sessions.id"), nullable=False, index=True)
    stage_key = Column(String(50), nullable=False)
    status = Column(String(20), default="completed", nullable=False)  # completed | skipped
    completed_at = Column(DateTime, server_default=func.now())
