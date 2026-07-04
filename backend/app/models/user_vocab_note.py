from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from database import Base


class UserVocabNote(Base):
    __tablename__ = "user_vocab_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    german = Column(String(255), nullable=False)
    english = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
