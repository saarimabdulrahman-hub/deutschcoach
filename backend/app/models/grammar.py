from sqlalchemy import Column, Integer, String, Text, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base
from app.models.user import CEFRLevel


class GrammarTopic(Base):
    __tablename__ = "grammar_topics"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    level = Column(SQLEnum(CEFRLevel), nullable=False)
    content = Column(Text, nullable=True)
    examples = Column(JSON, nullable=True)
    related_lesson_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
