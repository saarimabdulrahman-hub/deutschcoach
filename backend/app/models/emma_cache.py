"""Emma response cache model (Section 9.4). Persists LLM responses for grammar
explanations and common hints to avoid redundant LLM requests. Keyed by
(topic_slug, cefr_level)."""

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class EmmaCache(Base):
    __tablename__ = "emma_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)  # "{topic_slug}:{cefr_level}"
    response_type = Column(String(20), nullable=False, index=True)  # "grammar" | "hint"
    response_text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
