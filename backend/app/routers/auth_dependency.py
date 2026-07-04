from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from sqlalchemy.orm import Session
from database import get_db
from app.models.user import User

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Tier limits: which CEFR levels each subscription tier can access
TIER_LIMITS = {
    "free": ["A1"],
    "starter": ["A1", "A2"],
    "plus": ["A1", "A2", "B1"],
    "pro": ["A1", "A2", "B1", "B2", "C1"],
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id: int = int(user_id_raw)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_auth(user: User = Depends(get_current_user)) -> User:
    return user


def require_tier_access(requested_level: str):
    """Returns a dependency that checks if the user's subscription allows access to the given CEFR level."""
    def checker(user: User = Depends(get_current_user)):
        tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else user.subscription_tier
        allowed = TIER_LIMITS.get(tier, ["A1"])
        if requested_level.upper() not in [l.upper() for l in allowed]:
            raise HTTPException(
                status_code=403,
                detail=f"Your {tier} plan does not include {requested_level} content. Upgrade to access this level.",
            )
        return user
    return checker
