"""Learning Outcome Experiment endpoint (Section 12.4). Evaluates the Phase 1→Phase 2
gate experiment and returns pass/fail decision."""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.services.experiment_service import (
    evaluate_experiment,
    EXPERIMENT_NAME,
    EXPERIMENT_PHASE_BUILT,
    EXPERIMENT_PHASE_RUNS,
    EXPERIMENT_WINDOW_WEEKS,
    EXPERIMENT_LESSON_ID,
)

logger = logging.getLogger("deutschcoach.experiment")
router = APIRouter(prefix="/experiment", tags=["Experiment"])


@router.get("/lesson-flow/result")
def get_experiment_result(
    db: Session = Depends(get_db),
    _=Depends(require_auth),
):
    """Evaluate and return the Learning Outcome Experiment result.
    Compares the markdown lesson format (control) against the stage-based
    lesson format (treatment) using Lesson 01-greetings.

    This endpoint determines whether Phase 2 is approved."""
    result = evaluate_experiment(db)
    data = result.to_dict()
    data["metadata"] = {
        "experiment": EXPERIMENT_NAME,
        "phase_built": EXPERIMENT_PHASE_BUILT,
        "phase_runs": EXPERIMENT_PHASE_RUNS,
        "window_weeks": EXPERIMENT_WINDOW_WEEKS,
        "lesson_id": EXPERIMENT_LESSON_ID,
        "purpose": "Gate decision: Phase 2 is blocked until this experiment passes ALL thresholds",
    }
    return data
