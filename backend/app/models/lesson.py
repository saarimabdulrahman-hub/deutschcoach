from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base
from app.models.user import CEFRLevel


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(SQLEnum(CEFRLevel), nullable=False)
    unit = Column(Integer, nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)
    topics = Column(JSON, nullable=True)
    prerequisite_lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
