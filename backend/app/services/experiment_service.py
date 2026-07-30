"""Learning Outcome Experiment (Section 12.4). Compares the existing markdown
lesson format (control) against the stage-based lesson (treatment) using
identical Lesson 01-greetings content.

── Execution window ─────────────────────────────────────────────────────
  Built during:        Phase 1 (Weeks 3–8)
  Runs during:         Phase 1 → Phase 2 transition (Weeks 8–9)
  Evaluation type:    Gate decision — Phase 2 is blocked until this
                      experiment passes ALL thresholds.
─────────────────────────────────────────────────────────────────────────

Phase 2 is approved only if ALL conditions are met:
  • Treatment mean quiz score ≥ control mean + 5%
  • Statistical significance: p < 0.05
  • Treatment completion rate ≥ control completion rate + 10%
  • Treatment 7-day retention ≥ 60% (absolute)
"""

import math
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.learning_event import LearningEvent
from app.models.lesson_session import LessonSession, CheckpointResult

logger = logging.getLogger("deutschcoach.experiment")

# ── Experiment metadata ──────────────────────────────────────────────────
# Built during Phase 1 (Weeks 3–8), runs during Phase 1 → Phase 2 transition
EXPERIMENT_NAME = "lesson-flow"
EXPERIMENT_PHASE_BUILT = 1
EXPERIMENT_PHASE_RUNS = "Phase 1 → Phase 2 transition"
EXPERIMENT_WINDOW_WEEKS = "Weeks 8–9"
EXPERIMENT_LESSON_ID = 1  # Lesson 01-greetings
MIN_SAMPLE_SIZE = 100
PASS_THRESHOLDS = {
    "quiz_score_improvement_pct": 5.0,   # +5%
    "completion_rate_improvement_pct": 10.0,  # +10%
    "retention_absolute_pct": 60.0,       # ≥60%
    "p_value_max": 0.05,                  # p < 0.05
}


def _get_variant_for_user(db: Session, user_id: int) -> Optional[str]:
    """Determine which experiment variant a user was assigned."""
    start_event = db.query(LearningEvent).filter(
        LearningEvent.user_id == user_id,
        LearningEvent.event_type == "lesson_started",
        LearningEvent.lesson_id == EXPERIMENT_LESSON_ID,
    ).order_by(LearningEvent.created_at.asc()).first()
    if not start_event:
        return None
    payload = start_event.payload or {}
    return payload.get("variant")


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _t_test_p_value(mean1: float, var1: float, n1: int, mean2: float, var2: float, n2: int) -> float:
    """Two-sample t-test p-value approximation using the normal distribution."""
    import math as _m
    se = _m.sqrt(var1 / n1 + var2 / n2)
    if se == 0:
        return 1.0
    t = abs(mean1 - mean2) / se
    # Approximation using standard normal CDF
    p = _m.erfc(t / _m.sqrt(2))
    return p


class ExperimentResult:
    def __init__(self):
        self.control = {"users": 0, "quiz_scores": [], "completions": 0, "returns": 0}
        self.treatment = {"users": 0, "quiz_scores": [], "completions": 0, "returns": 0}
        self.control_quiz_mean: Optional[float] = None
        self.treatment_quiz_mean: Optional[float] = None
        self.control_completion_rate: Optional[float] = None
        self.treatment_completion_rate: Optional[float] = None
        self.control_retention: Optional[float] = None
        self.treatment_retention: Optional[float] = None
        self.p_value: Optional[float] = None
        self.quiz_improvement_pct: Optional[float] = None
        self.completion_improvement_pct: Optional[float] = None
        self.sample_size_met: bool = False
        self.all_criteria_met: bool = False
        self.phase_2_approved: bool = False
        self.fail_reasons: list[str] = []

    def to_dict(self) -> dict:
        return {
            "experiment": "lesson-flow",
            "lesson_id": EXPERIMENT_LESSON_ID,
            "control": {
                "user_count": self.control["users"],
                "quiz_score_mean": self.control_quiz_mean,
                "completion_rate_pct": self.control_completion_rate,
                "retention_pct": self.control_retention,
            },
            "treatment": {
                "user_count": self.treatment["users"],
                "quiz_score_mean": self.treatment_quiz_mean,
                "completion_rate_pct": self.treatment_completion_rate,
                "retention_pct": self.treatment_retention,
            },
            "sample_size_met": self.sample_size_met,
            "min_sample_size": MIN_SAMPLE_SIZE,
            "p_value": self.p_value,
            "quiz_improvement_pct": self.quiz_improvement_pct,
            "completion_improvement_pct": self.completion_improvement_pct,
            "pass_thresholds": PASS_THRESHOLDS,
            "all_criteria_met": self.all_criteria_met,
            "phase_2_approved": self.phase_2_approved,
            "fail_reasons": self.fail_reasons,
        }


def evaluate_experiment(db: Session) -> ExperimentResult:
    """Evaluate the Learning Outcome Experiment and determine Phase 2 approval."""
    result = ExperimentResult()

    # Get all users who started Lesson 01-greetings
    start_events = db.query(LearningEvent).filter(
        LearningEvent.event_type == "lesson_started",
        LearningEvent.lesson_id == EXPERIMENT_LESSON_ID,
    ).all()

    for event in start_events:
        payload = event.payload or {}
        variant = payload.get("variant", "legacy") if isinstance(payload, dict) else "legacy"
        uid = event.user_id

        if variant == "stage-based":
            group = result.treatment
        else:
            group = result.control

        group["users"] += 1

        # Quiz scores from lesson session checkpoints
        sessions = db.query(LessonSession).filter(
            LessonSession.user_id == uid,
            LessonSession.lesson_id == EXPERIMENT_LESSON_ID,
            LessonSession.status == "completed",
        ).all()
        for s in sessions:
            checkpoints = db.query(CheckpointResult).filter(
                CheckpointResult.session_id == s.id
            ).all()
            if checkpoints:
                avg_score = sum(c.pct for c in checkpoints) / len(checkpoints)
                group["quiz_scores"].append(avg_score)

        # Completion
        completed = db.query(LearningEvent).filter(
            LearningEvent.user_id == uid,
            LearningEvent.event_type == "lesson_completed",
            LearningEvent.lesson_id == EXPERIMENT_LESSON_ID,
        ).first()
        if completed:
            group["completions"] += 1

        # 7-day retention: returned within 7 days after first start
        seven_days = event.created_at + timedelta(days=7)
        returned = db.query(LearningEvent).filter(
            LearningEvent.user_id == uid,
            LearningEvent.event_type == "lesson_started",
            LearningEvent.created_at > event.created_at,
            LearningEvent.created_at <= seven_days,
        ).first()
        if returned:
            group["returns"] += 1

    # Check sample size
    c = result.control
    t = result.treatment
    result.sample_size_met = c["users"] >= MIN_SAMPLE_SIZE and t["users"] >= MIN_SAMPLE_SIZE

    # Quiz score comparison
    if c["quiz_scores"] and t["quiz_scores"]:
        result.control_quiz_mean = _mean(c["quiz_scores"])
        result.treatment_quiz_mean = _mean(t["quiz_scores"])
        result.quiz_improvement_pct = (
            ((result.treatment_quiz_mean - result.control_quiz_mean) / result.control_quiz_mean) * 100
            if result.control_quiz_mean > 0 else 0
        )
        # T-test
        c_var = sum((s - result.control_quiz_mean) ** 2 for s in c["quiz_scores"]) / len(c["quiz_scores"])
        t_var = sum((s - result.treatment_quiz_mean) ** 2 for s in t["quiz_scores"]) / len(t["quiz_scores"])
        result.p_value = _t_test_p_value(
            result.control_quiz_mean, c_var, len(c["quiz_scores"]),
            result.treatment_quiz_mean, t_var, len(t["quiz_scores"]),
        )

    # Completion rates
    if c["users"] > 0:
        result.control_completion_rate = (c["completions"] / c["users"]) * 100
    if t["users"] > 0:
        result.treatment_completion_rate = (t["completions"] / t["users"]) * 100
    if result.control_completion_rate and result.treatment_completion_rate:
        result.completion_improvement_pct = result.treatment_completion_rate - result.control_completion_rate

    # Retention
    if c["users"] > 0:
        result.control_retention = (c["returns"] / c["users"]) * 100
    if t["users"] > 0:
        result.treatment_retention = (t["returns"] / t["users"]) * 100

    # Evaluate thresholds
    result.all_criteria_met = True
    result.fail_reasons = []

    if not result.sample_size_met:
        result.all_criteria_met = False
        result.fail_reasons.append(f"Sample size too small: need {MIN_SAMPLE_SIZE} per group")

    if result.quiz_improvement_pct is not None and result.quiz_improvement_pct < PASS_THRESHOLDS["quiz_score_improvement_pct"]:
        result.all_criteria_met = False
        result.fail_reasons.append(
            f"Quiz score improvement {result.quiz_improvement_pct:.1f}% < {PASS_THRESHOLDS['quiz_score_improvement_pct']}%"
        )

    if result.p_value is not None and result.p_value >= PASS_THRESHOLDS["p_value_max"]:
        result.all_criteria_met = False
        result.fail_reasons.append(f"p-value {result.p_value:.4f} ≥ {PASS_THRESHOLDS['p_value_max']} (not significant)")

    if result.completion_improvement_pct is not None and result.completion_improvement_pct < PASS_THRESHOLDS["completion_rate_improvement_pct"]:
        result.all_criteria_met = False
        result.fail_reasons.append(
            f"Completion improvement {result.completion_improvement_pct:.1f}% < {PASS_THRESHOLDS['completion_rate_improvement_pct']}%"
        )

    if result.treatment_retention is not None and result.treatment_retention < PASS_THRESHOLDS["retention_absolute_pct"]:
        result.all_criteria_met = False
        result.fail_reasons.append(
            f"Treatment retention {result.treatment_retention:.1f}% < {PASS_THRESHOLDS['retention_absolute_pct']}%"
        )

    result.phase_2_approved = result.all_criteria_met
    if not result.phase_2_approved:
        logger.warning("Phase 2 NOT approved. Reasons: %s", result.fail_reasons)
    else:
        logger.info("Phase 2 APPROVED — all criteria met!")

    return result
