import os

import bcrypt
import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from app.models.user import User
from app.models.srs import SRSState
from app.models.quiz import QuizResult
from app.models.lesson_progress import LessonProgress
from app.models.user_vocab_note import UserVocabNote
from app.models.reset_token import PasswordResetToken
from app.routers.auth_dependency import require_auth
from app.schemas.user import UserProfileUpdate, UserOut

router = APIRouter(prefix="/user", tags=["User"])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def _serialize_user(user: User) -> dict:
    """Serialize a User ORM instance into a dict matching UserOut."""
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "subscription_tier": user.subscription_tier.value
        if hasattr(user.subscription_tier, "value")
        else str(user.subscription_tier),
        "trial_ends_at": user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        "daily_streak": user.daily_streak,
        "target_level": user.target_level.value
        if hasattr(user.target_level, "value")
        else str(user.target_level),
        "settings": user.settings or {},
        "created_at": user.created_at.isoformat() if user.created_at else "",
    }


@router.get("/profile", response_model=UserOut)
def get_profile(user: User = Depends(require_auth)):
    return _serialize_user(user)


@router.patch("/profile")
def update_profile(
    body: UserProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    if body.name is not None:
        user.name = body.name
    if body.email is not None:
        user.email = body.email
    if body.settings is not None:
        user.settings = body.settings
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated"}


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Change the authenticated user's password."""
    if not bcrypt.checkpw(body.current_password.encode("utf-8"), user.password_hash.encode("utf-8")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user.password_hash = bcrypt.hashpw(body.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.commit()
    return {"message": "Password changed"}


@router.get("/bookmarks")
def get_bookmarks(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return all saved vocabulary notes for the authenticated user."""
    notes = (
        db.query(UserVocabNote)
        .filter(UserVocabNote.user_id == user.id)
        .order_by(UserVocabNote.updated_at.desc())
        .all()
    )
    return [
        {
            "id": n.id,
            "german": n.german,
            "english": n.english,
            "notes": n.notes,
            "created_at": n.created_at.isoformat() if n.created_at else "",
            "updated_at": n.updated_at.isoformat() if n.updated_at else "",
        }
        for n in notes
    ]


@router.post("/delete-account")
def delete_account(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Permanently delete the authenticated user's account and all associated data."""
    # Cancel Stripe subscription if active
    if user.stripe_subscription_id:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        try:
            stripe.Subscription.cancel(user.stripe_subscription_id)
        except stripe.error.StripeError:
            pass  # Log this, but don't block deletion

    db.query(SRSState).filter(SRSState.user_id == user.id).delete()
    db.query(QuizResult).filter(QuizResult.user_id == user.id).delete()
    db.query(LessonProgress).filter(LessonProgress.user_id == user.id).delete()
    db.query(UserVocabNote).filter(UserVocabNote.user_id == user.id).delete()
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    return {"message": "Account deleted"}
