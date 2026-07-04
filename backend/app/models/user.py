from sqlalchemy import Column, Integer, String, DateTime, Date, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    starter = "starter"
    plus = "plus"
    pro = "pro"


class CEFRLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    subscription_tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.free, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    daily_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    target_level = Column(SQLEnum(CEFRLevel), default=CEFRLevel.A1)
    settings = Column(JSON, default=lambda: {"reminders_enabled": False, "daily_goal_cards": 20, "quiz_size": 10})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
