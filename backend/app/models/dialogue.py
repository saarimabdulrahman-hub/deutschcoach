"""Dialogue line entity for migrated lessons (Section 12.7)."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base


class DialogueLine(Base):
    __tablename__ = "dialogue_lines"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    speaker = Column(String(100), nullable=False)
    german = Column(Text, nullable=False)
    translation = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
