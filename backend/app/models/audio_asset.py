"""Audio asset tracking model (Section 11.6). Tracks which word/phrase has which
audio file on CDN storage for native-quality pronunciation playback."""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class AudioAsset(Base):
    __tablename__ = "audio_assets"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(255), nullable=False, index=True)          # German word/phrase
    filename = Column(String(500), nullable=False)                   # CDN filename (e.g. "hallo.mp3")
    slow_filename = Column(String(500), nullable=True)               # Slow variant (e.g. "hallo_slow.mp3")
    cefr_level = Column(String(10), nullable=True)                   # A1-C1
    has_normal = Column(Boolean, default=True)
    has_slow = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
