from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base


class VocabEntry(Base):
    __tablename__ = "vocab_entries"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    german = Column(String(255), nullable=False)
    english = Column(String(255), nullable=False)
    part_of_speech = Column(String(50), nullable=True)
    gender = Column(String(10), nullable=True)  # m, f, n, pl, or empty
    plural_form = Column(String(255), nullable=True)
    example_sentence = Column(Text, nullable=True)
    audio_url = Column(String(500), nullable=True)
    difficulty_rank = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
