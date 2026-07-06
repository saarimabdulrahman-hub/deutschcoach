from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from app.models.user import User
from app.models.vocab import VocabEntry
from app.models.quiz import QuizResult, QuizType
from app.models.srs import SRSState, CardStatus
from app.models.lesson_progress import LessonProgress
from app.routers.auth_dependency import require_auth, TIER_LIMITS
from app.quiz.generator import generate_quiz, get_session, delete_session
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizSubmitRequest,
    QuizSessionOut,
    QuizQuestionOut,
    QuizResultOut,
    QuizResultItem,
)

router = APIRouter(prefix="/quiz", tags=["Quiz"])


def _compare_answer(user_answer: str, correct_answer: str, question_type: str) -> bool:
    """Compare user answer leniently.

    - Case-insensitive, whitespace-trimmed
    - Ignores leading articles (der/die/das/the) for translate
    - Partial matching for fill-blank
    - Substring matching for close answers
    """
    ua = user_answer.strip().lower()
    ca = correct_answer.strip().lower()

    if ua == ca:
        return True

    if question_type == "multiple-choice":
        return ua == ca

    # Strip leading articles for translate questions
    for art in ["der ", "die ", "das ", "the "]:
        ua = ua.removeprefix(art)
        ca = ca.removeprefix(art)

    if ua == ca:
        return True

    # Fill-blank: accept if one contains the other
    if question_type == "fill-blank":
        if ua in ca or ca in ua:
            return True

    # Close match: allow 1-2 character difference for answers > 3 chars
    if len(ua) > 3 and len(ca) > 3 and abs(len(ua) - len(ca)) <= 2:
        shorter = ua if len(ua) <= len(ca) else ca
        longer = ca if len(ua) <= len(ca) else ua
        if shorter in longer:
            return True

    return False


def _find_vocab_entry(db: Session, correct_answer: str) -> VocabEntry | None:
    """Find a VocabEntry by matching the correct_answer against german or english."""
    answer = correct_answer.strip()
    entry = db.query(VocabEntry).filter(VocabEntry.german == answer).first()
    if entry:
        return entry
    entry = db.query(VocabEntry).filter(VocabEntry.english == answer).first()
    if entry:
        return entry
    # Try case-insensitive as last resort
    entry = db.query(VocabEntry).filter(VocabEntry.german.ilike(answer)).first()
    if entry:
        return entry
    return db.query(VocabEntry).filter(VocabEntry.english.ilike(answer)).first()


def _seed_srs_for_missed(db: Session, user_id: int, vocab_entry: VocabEntry):
    """Create or reset SRSState for a missed vocab word."""
    existing = (
        db.query(SRSState)
        .filter(
            SRSState.user_id == user_id,
            SRSState.vocab_entry_id == vocab_entry.id,
        )
        .first()
    )

    if existing:
        existing.interval_days = 0
        existing.repetitions = 0
        existing.status = CardStatus.learning
        existing.next_review_at = datetime.utcnow()
    else:
        db.add(
            SRSState(
                user_id=user_id,
                vocab_entry_id=vocab_entry.id,
                status=CardStatus.new,
                next_review_at=datetime.utcnow(),
            )
        )


@router.post("/generate", response_model=QuizSessionOut)
def create_quiz(
    body: QuizGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Generate a new quiz session. Answers are stripped from the response."""
    # Check tier access if a level is specified
    if body.level:
        user_tier = user.subscription_tier.value if hasattr(user.subscription_tier, 'value') else user.subscription_tier
        allowed_levels = TIER_LIMITS.get(user_tier, ["A1"])
        if body.level.upper() not in [l.upper() for l in allowed_levels]:
            raise HTTPException(
                status_code=403,
                detail=f"Your {user_tier} plan does not include {body.level} content. Upgrade to access this level.",
            )

    result = generate_quiz(
        db=db,
        user_id=user.id,
        lesson_id=body.lesson_id,
        level=body.level,
        vocab_ids=body.vocab_ids,
        count=body.count,
    )

    # Strip answers from questions before returning to client
    safe_questions = []
    for q in result["questions"]:
        safe_q = {
            "id": q["id"],
            "type": q["type"],
            "prompt": q["prompt"],
            "options": q.get("options"),
            "hint": q.get("hint"),
        }
        safe_questions.append(QuizQuestionOut(**safe_q))

    return QuizSessionOut(session_id=result["session_id"], questions=safe_questions)


@router.post("/{session_id}/submit", response_model=QuizResultOut)
def submit_quiz(
    session_id: str,
    body: QuizSubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Submit answers for a quiz session. Grades, stores result, seeds SRS for
    missed words, and deletes the session."""
    session = get_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found or has expired",
        )

    if session["user_id"] != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This quiz session does not belong to you",
        )

    questions = session["questions"]
    questions_map = {q["id"]: q for q in questions}

    # Build answer lookup from submission
    submitted = {a.question_id: a.answer for a in body.answers}

    results: list[QuizResultItem] = []
    missed_vocab_ids: list[int] = []

    for q in questions:
        qid = q["id"]
        correct_answer = q["answer"]
        user_answer = submitted.get(qid, "")
        is_correct = _compare_answer(user_answer, correct_answer, q["type"])

        feedback = None
        if not is_correct:
            feedback = f"The correct answer was: {correct_answer}"

        results.append(
            QuizResultItem(
                question_id=qid,
                correct=is_correct,
                your_answer=user_answer,
                correct_answer=correct_answer,
                feedback=feedback,
            )
        )

        # If incorrect, try to find the vocab entry and seed SRS
        if not is_correct:
            vocab_entry = _find_vocab_entry(db, correct_answer)
            if vocab_entry:
                missed_vocab_ids.append(vocab_entry.id)

    questions_total = len(questions)
    questions_correct = sum(1 for r in results if r.correct)
    score_pct = (
        round((questions_correct / questions_total) * 100, 1) if questions_total > 0 else 0.0
    )

    # Persist QuizResult
    quiz_result = QuizResult(
        user_id=user.id,
        quiz_type=QuizType.mixed,
        score_pct=score_pct,
        questions_total=questions_total,
        questions_correct=questions_correct,
        missed_vocab_ids=missed_vocab_ids if missed_vocab_ids else None,
    )
    db.add(quiz_result)

    # Seed SRS for missed words (deduplicate by vocab_entry_id)
    seen_vocab_ids: set[int] = set()
    for q in questions:
        qid = q["id"]
        user_answer = submitted.get(qid, "")
        correct_answer = q["answer"]
        is_correct = _compare_answer(user_answer, correct_answer, q["type"])
        if not is_correct:
            vocab_entry = _find_vocab_entry(db, correct_answer)
            if vocab_entry and vocab_entry.id not in seen_vocab_ids:
                seen_vocab_ids.add(vocab_entry.id)
                _seed_srs_for_missed(db, user.id, vocab_entry)

    db.commit()

    # Delete the session (consumed)
    delete_session(db, session_id)

    return QuizResultOut(
        score_pct=score_pct,
        questions_total=questions_total,
        questions_correct=questions_correct,
        results=results,
    )


@router.get("/next")
def get_next_suggestion(
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Suggest what to study next based on lesson progress and weakest SRS words."""
    # 1. Find the most recent lesson with progress (current lesson)
    latest_progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user.id)
        .order_by(LessonProgress.updated_at.desc())
        .first()
    )

    # 2. Find weakest SRS words
    weakest = (
        db.query(SRSState)
        .filter(SRSState.user_id == user.id, SRSState.lapses > 0)
        .order_by(SRSState.lapses.desc())
        .first()
    )

    if weakest:
        # Find the vocab entry to get more context
        vocab = (
            db.query(VocabEntry)
            .filter(VocabEntry.id == weakest.vocab_entry_id)
            .first()
        )
        if vocab:
            word = vocab.german
            pos = vocab.part_of_speech or "word"
            reason = f"You've missed '{word}' {weakest.lapses} time(s) — time to reinforce it."
            suggestion = f"Practice {pos} vocabulary like '{word}'"
            return {"suggestion": suggestion, "reason": reason}

    if latest_progress:
        from app.models.lesson import Lesson
        lesson = db.query(Lesson).filter(Lesson.id == latest_progress.lesson_id).first()
        if lesson:
            return {
                "suggestion": f"Continue with {lesson.title}",
                "reason": f"You're currently working on Unit {lesson.unit} at level {lesson.level.value if hasattr(lesson.level, 'value') else lesson.level}.",
            }

    # Fallback: general suggestion
    return {
        "suggestion": "Start a new quiz on your weakest vocabulary",
        "reason": "No recent activity found. Taking a quiz helps identify areas to improve.",
    }
