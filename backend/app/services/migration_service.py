"""Content Migration Pipeline (Section 12.7). Two-pass process that converts
existing markdown-based lessons into stage-based lesson configurations.

Pass 1 — Automated Parsing: reads markdown, extracts dialogue/vocabulary/grammar
  /exercises using the existing curriculum loader, generates draft stages_config.

Pass 2 — Entity Creation: creates dialogue entities, links vocabulary, generates
  checkpoint stubs, produces the final stages_config.

Supports editorial review with stage reordering, checkpoint refinement, and
approve/reject workflow. Phased rollout by CEFR level."""

import logging
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.lesson import Lesson
from app.curriculum_loader import parse_lesson_file
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic
from app.models.dialogue import DialogueLine

logger = logging.getLogger("deutschcoach.migration")

# ── Stage templates keyed by lesson_type ─────────────────────────────────

STAGE_TEMPLATES = {
    "dialogue": [
        {"key": "listen", "label": "Listen"},
        {"key": "dialogue", "label": "Dialogue"},
        {"key": "vocabulary", "label": "Vocabulary"},
        {"key": "pronounce", "label": "Pronounce"},
        {"key": "role-play", "label": "Role-play"},
        {"key": "comprehension-check", "label": "Comprehension Check"},
    ],
    "grammar": [
        {"key": "observe", "label": "Observe"},
        {"key": "discover", "label": "Discover"},
        {"key": "explain", "label": "Explain"},
        {"key": "practice", "label": "Practice"},
        {"key": "apply", "label": "Apply"},
        {"key": "mini-review", "label": "Mini Review"},
    ],
    "vocabulary": [
        {"key": "listen", "label": "Listen"},
        {"key": "see", "label": "See"},
        {"key": "hear", "label": "Hear"},
        {"key": "match", "label": "Match"},
        {"key": "type", "label": "Type"},
        {"key": "recall", "label": "Recall"},
        {"key": "speak", "label": "Speak"},
    ],
    "mixed": [
        {"key": "welcome", "label": "Welcome"},
        {"key": "objectives", "label": "Objectives"},
        {"key": "interactive-dialogue", "label": "Interactive Dialogue"},
        {"key": "vocab-explorer", "label": "Vocab Explorer"},
        {"key": "checkpoint", "label": "Checkpoint"},
        {"key": "grammar-discovery", "label": "Grammar Discovery"},
        {"key": "guided-practice", "label": "Guided Practice"},
        {"key": "mini-review", "label": "Mini Review"},
        {"key": "summary", "label": "Summary"},
    ],
}


# ── Pass 1: Parse lesson and generate draft ─────────────────────────────

def pass1_parse(filepath: str) -> dict:
    """Pass 1 — Parse a markdown lesson file.
    Returns the extracted lesson structure with dialogue, vocabulary, grammar,
    and exercise data used to generate a draft stages_config."""
    data = parse_lesson_file(filepath)
    content = data.get("content", "")
    lesson_type = data.get("lesson_type", "mixed")

    # Extract dialogue sections from markdown
    dialogue_lines = []
    dialogue_match = __import__("re").search(r"##\s*Dialogue\s*\n(.*?)(?=\n##|\Z)", content, __import__("re").Dotall)
    if dialogue_match:
        for line in dialogue_match.group(1).strip().split("\n"):
            clean = line.strip()
            if clean.startswith("*") or clean.startswith("-"):
                clean = clean.lstrip("*- ").strip()
            parts = clean.split(":", 1)
            if len(parts) == 2 and parts[1].strip():
                dialogue_lines.append({
                    "speaker": parts[0].strip().rstrip("**"),
                    "german": parts[1].strip(),
                })

    # Build draft
    draft_stages = STAGE_TEMPLATES.get(lesson_type, STAGE_TEMPLATES["mixed"])

    lesson_content = {
        "title": data.get("title", ""),
        "level": data.get("level", "A1"),
        "lesson_type": lesson_type,
        "topics": data.get("topics", []),
        "dialogue_lines": dialogue_lines,
        "vocabulary": data.get("vocabulary", []),
        "grammar": data.get("grammar", []),
        "exercises": data.get("exercises", []),
        "draft_stages": draft_stages,
    }

    return lesson_content


# ── Pass 2: Create entities and finalize stages_config ──────────────────

def pass2_create_entities(db: Session, lesson: Lesson, lesson_content: dict) -> dict:
    """Pass 2 — Create dialogue entities, link vocabulary, generate checkpoint
    stubs, and produce the final stages_config."""
    lesson_type = lesson_content.get("lesson_type", "mixed")

    # Link vocabulary to stages
    vocab_list = lesson_content.get("vocabulary", [])
    for v in vocab_list:
        existing = db.query(VocabEntry).filter(
            VocabEntry.lesson_id == lesson.id,
            VocabEntry.german == v.get("german", ""),
        ).first()
        if not existing:
            db.add(VocabEntry(
                lesson_id=lesson.id,
                german=v.get("german", ""),
                english=v.get("english", ""),
                part_of_speech=v.get("pos", "noun"),
                gender=v.get("gender"),
                plural_form=v.get("plural"),
                example_sentence=v.get("example", ""),
                difficulty_rank=v.get("difficulty", 1),
            ))

    # Link grammar topics
    for g in lesson_content.get("grammar", []):
        existing = db.query(GrammarTopic).filter(
            GrammarTopic.slug == g.get("slug", ""),
        ).first()
        if not existing:
            db.add(GrammarTopic(
                slug=g.get("slug", ""),
                title=g.get("title", g.get("slug", "")),
                level=lesson.level,
                content=g.get("description", ""),
                examples=g.get("examples", []),
                related_lesson_ids=[lesson.id],
            ))
        else:
            related = existing.related_lesson_ids or []
            if lesson.id not in related:
                related.append(lesson.id)
                existing.related_lesson_ids = related

    # Create dialogue line entities
    dialogue_lines = lesson_content.get("dialogue_lines", [])
    if dialogue_lines:
        # Remove existing dialogue lines for this lesson
        db.query(DialogueLine).filter(DialogueLine.lesson_id == lesson.id).delete()
        for i, line in enumerate(dialogue_lines):
            db.add(DialogueLine(
                lesson_id=lesson.id,
                speaker=line.get("speaker", ""),
                german=line.get("german", ""),
                translation=line.get("translation", ""),
                order=i,
            ))

    db.commit()

    # Build checkpoint stubs based on lesson content
    checkpoint_stages = []
    has_dialogue = bool(lesson_content.get("dialogue_lines"))
    has_grammar = bool(lesson_content.get("grammar"))
    if has_dialogue:
        checkpoint_stages.append({
            "key": "checkpoint-dialogue",
            "label": "Quick Check",
            "questions": [
                {"question": "What was the dialogue about?", "options": ["The main topic", "A different lesson", "None"], "correctIndex": 0, "explanation": "Review the dialogue section."},
            ],
        })
    if has_grammar:
        checkpoint_stages.append({
            "key": "checkpoint-grammar",
            "label": "Grammar Check",
            "questions": [
                {"question": "Which grammar pattern was covered?", "options": ["The one in this lesson", "A different one", "Not sure"], "correctIndex": 0, "explanation": "Check the grammar section."},
            ],
        })

    # Build final stages_config
    base_stages = STAGE_TEMPLATES.get(lesson_type, STAGE_TEMPLATES["mixed"])
    final_stages = list(base_stages)

    # Insert checkpoint stubs
    for cp in checkpoint_stages:
        insert_after = -1
        for i, s in enumerate(final_stages):
            if s["key"] == cp["key"].replace("checkpoint-", "").replace("-dialogue", "").replace("-grammar", ""):
                insert_after = i
        if insert_after >= 0:
            final_stages.insert(insert_after + 1, {"key": cp["key"], "label": cp["label"]})

    return {
        "stages": final_stages,
        "checkpoints": checkpoint_stages,
        "vocabulary_count": len(vocab_list),
        "grammar_count": len(lesson_content.get("grammar", [])),
        "migrated_at": datetime.now(timezone.utc).isoformat(),
        "status": "draft" if not checkpoint_stages else "review",
    }


# ── Editorial review helpers ─────────────────────────────────────────────

def approve_migration(db: Session, lesson_id: int, stages_config: list[dict]) -> Lesson:
    """Approve a migration — apply the final stages_config to the lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError("Lesson not found")
    lesson.stages_config = stages_config
    db.commit()
    db.refresh(lesson)
    logger.info("Migration APPROVED for lesson %d (%s)", lesson.id, lesson.title)
    return lesson


def reject_migration(db: Session, lesson_id: int, reason: str = "") -> Lesson:
    """Reject a migration — clear the draft stages_config."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError("Lesson not found")
    lesson.stages_config = None
    lesson.lesson_content_json = None
    db.commit()
    db.refresh(lesson)
    logger.info("Migration REJECTED for lesson %d (%s). Reason: %s", lesson.id, lesson.title, reason)
    return lesson


def reorder_stages(stages_config: list[dict], stage_key: str, new_index: int) -> list[dict]:
    """Reorder a stage within the stages_config."""
    stages = list(stages_config)
    idx = next((i for i, s in enumerate(stages) if s.get("key") == stage_key), None)
    if idx is None:
        return stages
    stage = stages.pop(idx)
    new_index = max(0, min(new_index, len(stages)))
    stages.insert(new_index, stage)
    return stages
