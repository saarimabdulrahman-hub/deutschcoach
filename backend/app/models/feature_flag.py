"""Feature flag model (Section 12.1). Controls rollout of major platform
capabilities across Phases 1-5. Supports percentage-based gradual rollout."""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    flag_key = Column(String(100), unique=True, nullable=False, index=True)
    enabled = Column(Boolean, default=False)
    rollout_pct = Column(Float, default=0.0)  # 0.0, 10.0, 50.0, 100.0
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
