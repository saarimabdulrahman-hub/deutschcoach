from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base


class QuizSession(Base):
    """Ephemeral quiz session — stores in-progress quiz questions with answers.

    Sessions are created when a user starts a quiz and deleted when they submit.
    Auto-cleaned: sessions older than 1 hour are swept on access.
    """

    __tablename__ = "quiz_sessions"

    session_id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    questions = Column(JSON, nullable=False)  # List of question dicts (includes answers)
    created_at = Column(DateTime, server_default=func.now())
