# Emma — Context Schema
**Version:** 1.0 · **Updated:** 2026-07-13 · **Status:** Active
**Source:** `emma-pipeline.ts` · `emma_prompts.py` · `app/schemas/emma.py`

> The data contract between the DeutschFlow application and Emma's AI layer. Every field is what Emma receives on each message. Change this schema and you change what Emma knows.

---

## 1. Full context payload (`EmmaFullContext`)

```json
{
  "schemaVersion": "1.0",
  "lesson": {
    "id": 1,
    "title": "Greetings & Introductions",
    "level": "A1",
    "unit": 1,
    "topics": ["greetings", "introductions"],
    "description": "Meet someone and introduce yourself"
  },
  "stage": {
    "key": "vocabulary",
    "label": "Vocabulary",
    "step": 3,
    "totalSteps": 8
  },
  "stageDetail": {
    "type": "vocabulary",
    "data": {
      "words": {
        "items": [{"g":"Hallo","e":"Hello","p":"greeting"}, …],
        "total": 10,
        "omitted": 0,
        "strategy": "head"
      }
    }
  },
  "vocabulary": {
    "items": [{"g":"Hallo","e":"Hello","p":"greeting"}, …],
    "total": 10,
    "omitted": 0,
    "strategy": "head"
  },
  "grammar": {
    "pattern": "ich heiße / du heißt",
    "rule": "The ending changes with who is speaking — -e for I, -t for you.",
    "examples": ["Ich heiße Anna.", "Wie heißt du?"],
    "relatedTopics": []
  },
  "exercise": {
    "exerciseType": "fill-blank",
    "question": "Wie ___ du?",
    "expectedAnswer": "heißt",
    "expectedMistakes": ["wrong verb form", "word order"],
    "hint": "Think about the verb ending.",
    "learnerAnswer": null
  },
  "conversation": {
    "recentMessages": [],
    "messageCount": 0,
    "lastLearnerMessage": null
  },
  "progress": {
    "completed": 2,
    "total": 10,
    "pct": 20
  }
}
```

## 2. Field reference

### `lesson` (LessonContext)
| Field | Type | Source |
|---|---|---|
| `id` | number | `LessonDetail.lesson.id` |
| `title` | string | `LessonDetail.lesson.title` |
| `level` | string | `LessonDetail.lesson.level` |
| `unit` | number | `LessonDetail.lesson.unit` |
| `topics` | string[] | `LessonDetail.lesson.topics` |
| `description` | string\|null | `LessonDetail.lesson.description` |

### `stage` (StageContext)
| Field | Type | Source |
|---|---|---|
| `key` | string | Current stage key from `LessonStageDef` (e.g. `"vocabulary"`) |
| `label` | string | Human label (e.g. `"Vocabulary"`) |
| `step` | number | 1-based position among progress stages |
| `totalSteps` | number | Count of progress stages |

### `stageDetail` (discriminated union)
The `type` field discriminates — Emma's backend can type-narrow:
- `"dialogue"` → `{ speakers[], lineCount, firstLines[] }`
- `"vocabulary"` → `{ words: CompressedList<VocabWord> }`
- `"grammar"` → `{ pattern, rule, examples[], relatedTopics[] }`
- `"exercise"` → `{ exerciseType, question, expectedAnswer, expectedMistakes[], hint, learnerAnswer }`
- `"speaking"` → `{ prompt, suggestion, vocabInScope[] }`
- `"review"` → `{ itemCount, sampleItems[] }`
- `"other"` → `{ key, label }` (base stage context)

### `vocabulary` (CompressedList<VocabWord>)
Each word: `{ g: string (German), e: string (English), p?: string (part of speech) }`. Capped at 15 items — the `total` and `omitted` fields tell Emma how many more exist.

### `grammar` (GrammarContext \| null)
Null when the stage has no grammar pattern. When present: pattern name, one-line rule, 2–3 examples from the lesson, and related topic slugs.

### `exercise` (ExerciseContext \| null)
Null when not in an exercise stage. Includes the **expected mistakes** list so Emma can offer targeted coaching before the learner even asks. `learnerAnswer` is populated after the learner submits.

### `conversation` (ConversationContext)
Last 8 messages (truncated to 200 chars each), total message count, and the last learner message text.

### `progress`
Completed stages, total stages, and a percentage. Used for context-awareness: a learner on step 1 of 8 gets more scaffolding than one on step 7 of 8.

## 3. Compression rules
- **Vocabulary:** head strategy — first 15 items. `omitted` tells how many were dropped.
- **Conversation:** last 8 messages, each capped at 200 characters.
- **Dialogue lines:** first 3 lines only.
- **Grammar examples:** first 3 only.
- **Expected mistakes:** all 3–5 (short strings, no compression needed).

## 4. Serialization
The full context is serialized via `JSON.stringify` and sent in `EmmaRequest.context` (the backend Pydantic model). Total size: ~2–5 KB. Well within any HTTP body limit.

## 5. Pipeline assembly
The single entry point is `assemblePipeline()` in `web/lib/emma-pipeline.ts`. It takes raw lesson data (from `GET /curriculum/:level/:id`), the current stage, and optional fields (learner answer, messages, dialogue lines, speaking prompt) and returns the complete `EmmaFullContext`.

## 6. Backend mirror
The backend `EmmaLessonContext` Pydantic model (`app/schemas/emma.py`) is a **flat subset** of this full context — used by the chat endpoint. The full discriminated context is available to the prompt engine when building Emma's messages.
