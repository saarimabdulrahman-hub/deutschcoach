from sqlalchemy import Column, Integer, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base
import enum


class QuizType(str, enum.Enum):
    translate = "translate"
    fill_blank = "fill-blank"
    multiple_choice = "multiple-choice"
    conjugate = "conjugate"
    mixed = "mixed"


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    quiz_type = Column(SQLEnum(QuizType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    score_pct = Column(Float, nullable=False)
    questions_total = Column(Integer, nullable=False)
    questions_correct = Column(Integer, nullable=False)
    missed_vocab_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
