"""Feature flag router (Section 12.1). Returns flag state for the requesting user,
supporting percentage-based rollout for gradual feature deployment."""

from __future__ import annotations
import hashlib
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.feature_flag import FeatureFlag

logger = logging.getLogger("deutschcoach.flags")
router = APIRouter(prefix="/flags", tags=["Feature Flags"])


def _user_in_rollout(user_id: int, rollout_pct: float) -> bool:
    """Deterministic per-user rollout check. Users are hashed into percentile
    buckets so the same user consistently sees the same flags."""
    if rollout_pct >= 100.0:
        return True
    if rollout_pct <= 0.0:
        return False
    hash_str = hashlib.md5(str(user_id).encode()).hexdigest()
    bucket = (int(hash_str[:4], 16) % 100) + 1
    return bucket <= rollout_pct


@router.get("")
def get_flags(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Return all feature flags with their resolved state for the current user.
    Also returns experiment assignments for A/B testing (Section 12.3)."""
    flags = db.query(FeatureFlag).all()
    result_flags = []
    experiments = {}

    for f in flags:
        enabled = _user_in_rollout(user.id, f.rollout_pct)
        result_flags.append({
            "key": f.flag_key,
            "enabled": enabled,
            "rollout_pct": f.rollout_pct,
        })
        # Expose experiment assignment for A/B comparison
        if f.flag_key == "stage-based-lessons":
            experiments["lesson-flow"] = {
                "variant": "stage-based" if enabled else "legacy",
                "flag_key": f.flag_key,
            }

    return {
        "flags": result_flags,
        "experiments": experiments,
    }
