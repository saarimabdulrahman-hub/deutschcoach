import random
import uuid
from sqlalchemy.orm import Session
from app.models.vocab import VocabEntry
from app.models.srs import SRSState

QUESTION_TYPES = ["translate", "fill-blank", "multiple-choice"]  # "conjugate" removed — needs proper verb conjugation dictionary

# In-memory session store: {session_id: {questions: [...], user_id: int}}
# TODO: Replace in-memory store with Redis or DB for multi-worker deployments
import time
_session_store: dict = {}
SESSION_TTL = 3600  # 1 hour


def _sweep_expired():
    """Remove sessions older than SESSION_TTL."""
    now = time.time()
    expired = [sid for sid, s in _session_store.items() if now - s.get("_created", 0) > SESSION_TTL]
    for sid in expired:
        del _session_store[sid]


def _generate_distractors(db: Session, correct_entry: VocabEntry, count: int = 3) -> list[str]:
    """Pick distractors from same part of speech, excluding correct answer."""
    candidates = (
        db.query(VocabEntry)
        .filter(
            VocabEntry.part_of_speech == correct_entry.part_of_speech,
            VocabEntry.id != correct_entry.id,
        )
        .limit(count * 5)
        .all()
    )
    if len(candidates) < count:
        # Fallback: any vocab entries
        candidates = (
            db.query(VocabEntry)
            .filter(VocabEntry.id != correct_entry.id)
            .limit(count * 5)
            .all()
        )
    return random.sample([c.english for c in candidates], min(count, len(candidates)))


def _make_translate_question(entry: VocabEntry) -> dict:
    direction = random.choice(["de-en", "en-de"])
    if direction == "de-en":
        return {
            "id": str(uuid.uuid4()),
            "type": "translate",
            "prompt": f"Translate: {entry.german}",
            "answer": entry.english,
            "hint": None,
        }
    else:
        return {
            "id": str(uuid.uuid4()),
            "type": "translate",
            "prompt": f"Translate: {entry.english}",
            "answer": entry.german,
            "hint": entry.part_of_speech,
        }


def _make_fill_blank_question(entry: VocabEntry) -> dict:
    sentence = entry.example_sentence
    word = entry.german
    if sentence and word in sentence:
        prompt = sentence.replace(word, "___")
    else:
        prompt = f"___ (Translate: {entry.english})"
    return {
        "id": str(uuid.uuid4()),
        "type": "fill-blank",
        "prompt": prompt,
        "answer": word,
        "hint": f"({entry.part_of_speech})" if entry.part_of_speech else None,
    }


def _make_multiple_choice_question(entry: VocabEntry, db: Session) -> dict:
    distractors = _generate_distractors(db, entry, 3)
    options = distractors + [entry.english]
    random.shuffle(options)
    return {
        "id": str(uuid.uuid4()),
        "type": "multiple-choice",
        "prompt": f"What does '{entry.german}' mean?",
        "options": options,
        "answer": entry.english,
    }


def _make_conjugate_question(entry: VocabEntry) -> dict:
    if entry.part_of_speech == "verb":
        persons = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]
        person = random.choice(persons)
        return {
            "id": str(uuid.uuid4()),
            "type": "conjugate",
            "prompt": f"Conjugate '{entry.german}' — {person} (present)",
            "answer": "[conjugated form]",
            "hint": "Type the conjugated verb only",
        }
    # Fallback to translate for non-verbs
    return _make_translate_question(entry)


def _make_question(entry: VocabEntry, db: Session) -> dict:
    qtype = random.choice(QUESTION_TYPES)
    if qtype == "translate":
        return _make_translate_question(entry)
    elif qtype == "fill-blank":
        return _make_fill_blank_question(entry)
    elif qtype == "multiple-choice":
        return _make_multiple_choice_question(entry, db)
    elif qtype == "conjugate":
        return _make_conjugate_question(entry)
    # Fallback (should never reach here)
    return _make_translate_question(entry)


def generate_quiz(
    db: Session,
    user_id: int,
    lesson_id: int = None,
    level: str = None,
    vocab_ids: list[int] = None,
    count: int = 20,
) -> dict:
    """Generate a quiz session. Returns {session_id, questions}."""
    _sweep_expired()  # Clean up expired sessions before creating new one

    query = db.query(VocabEntry)

    if vocab_ids:
        query = query.filter(VocabEntry.id.in_(vocab_ids))
    elif lesson_id:
        query = query.filter(VocabEntry.lesson_id == lesson_id)
    elif level:
        from app.models.lesson import Lesson

        query = query.join(Lesson).filter(Lesson.level == level)
    else:
        # Default: weakest SRS words + some random vocab
        weak = (
            db.query(SRSState)
            .filter(SRSState.user_id == user_id, SRSState.lapses > 0)
            .order_by(SRSState.lapses.desc())
            .limit(count // 2)
            .all()
        )
        weak_ids = [w.vocab_entry_id for w in weak]
        if weak_ids:
            query = query.filter(VocabEntry.id.in_(weak_ids))
        else:
            query = query.order_by(VocabEntry.difficulty_rank).limit(count * 3)

    entries = query.all()
    if not entries:
        entries = db.query(VocabEntry).limit(count * 3).all()

    selected = random.sample(entries, min(count, len(entries)))
    questions = [_make_question(e, db) for e in selected]
    session_id = str(uuid.uuid4())
    _session_store[session_id] = {"questions": questions, "user_id": user_id, "_created": time.time()}

    return {"session_id": session_id, "questions": questions}


def get_session(session_id: str) -> dict | None:
    return _session_store.get(session_id)


def delete_session(session_id: str):
    _session_store.pop(session_id, None)
