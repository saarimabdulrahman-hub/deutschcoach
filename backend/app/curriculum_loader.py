import os
import yaml
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic

CURRICULUM_DIR = Path(__file__).parent.parent / "data" / "curriculum"


def parse_lesson_file(filepath: str) -> dict:
    """Parse a lesson .md file, splitting YAML frontmatter from Markdown body."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.startswith("---"):
        raise ValueError(f"No frontmatter found in {filepath}")

    parts = content.split("---", 2)
    if len(parts) < 3:
        raise ValueError(f"Invalid frontmatter in {filepath}")

    frontmatter = yaml.safe_load(parts[1])
    body = parts[2].strip()
    frontmatter["content"] = body
    return frontmatter


def load_all_lessons() -> list[dict]:
    """Walk CURRICULUM_DIR and parse all .md files."""
    lessons = []
    if not CURRICULUM_DIR.exists():
        return lessons
    for level_dir in sorted(CURRICULUM_DIR.iterdir()):
        if level_dir.is_dir():
            for md_file in sorted(level_dir.glob("*.md")):
                lessons.append(parse_lesson_file(str(md_file)))
    return lessons


def sync_curriculum(db: Session):
    """Sync parsed lessons into Lesson, VocabEntry, and GrammarTopic tables."""
    lessons = load_all_lessons()
    for data in lessons:
        # Upsert lesson
        lesson = db.query(Lesson).filter(
            Lesson.level == data["level"],
            Lesson.unit == data.get("unit", 1),
            Lesson.order == data.get("order", 1),
        ).first()
        if lesson:
            lesson.title = data["title"]
            lesson.description = data.get("description", "")
            lesson.content = data["content"]
            lesson.topics = data.get("topics", [])
            lesson.exercises = data.get("exercises", [])
            lesson.lesson_type = data.get("lesson_type", "mixed")
        else:
            lesson = Lesson(
                level=data["level"],
                lesson_type=data.get("lesson_type", "mixed"),
                unit=data.get("unit", 1),
                order=data.get("order", 1),
                title=data["title"],
                description=data.get("description", ""),
                content=data["content"],
                topics=data.get("topics", []),
                exercises=data.get("exercises", []),
            )
            db.add(lesson)
            db.flush()

        # Sync vocab entries
        for vocab_data in data.get("vocabulary", []):
            existing = db.query(VocabEntry).filter(
                VocabEntry.lesson_id == lesson.id,
                VocabEntry.german == vocab_data["german"],
            ).first()
            if not existing:
                db.add(VocabEntry(
                    lesson_id=lesson.id,
                    german=vocab_data["german"],
                    english=vocab_data["english"],
                    part_of_speech=vocab_data.get("pos", "noun"),
                    gender=vocab_data.get("gender"),
                    plural_form=vocab_data.get("plural"),
                    example_sentence=vocab_data.get("example", ""),
                    difficulty_rank=vocab_data.get("difficulty", 1),
                ))

        # Sync grammar topics
        for grammar_data in data.get("grammar", []):
            existing = db.query(GrammarTopic).filter(
                GrammarTopic.slug == grammar_data["slug"],
            ).first()
            if not existing:
                db.add(GrammarTopic(
                    slug=grammar_data["slug"],
                    title=grammar_data.get("title", grammar_data["slug"]),
                    level=data["level"],
                    content=grammar_data.get("description", ""),
                    examples=grammar_data.get("examples", []),
                    related_lesson_ids=[lesson.id],
                ))
            else:
                related = existing.related_lesson_ids or []
                if lesson.id not in related:
                    related.append(lesson.id)
                    existing.related_lesson_ids = related

    db.commit()
