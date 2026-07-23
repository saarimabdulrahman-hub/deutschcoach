# DeutschFlow — Exercise Pattern Library

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active — the canonical exercise types.
**Governed by:** EXERCISE_GUIDELINES · FEEDBACK_GUIDELINES · LESSON_BLUEPRINT

> This is the complete library. **Do not invent new exercise types without adding them here.** Every lesson draws exercises from this set. 6 types: 4 core (1–4) ship in every lesson; 2 extended (5–6) available when appropriate.

---

## Core set (shipped in every lesson)

### Type 1 — Recognition (Multiple-Choice)

| Property | Value |
|---|---|
| **Purpose** | Bind a meaning to a form (word / phrase / sentence) |
| **Cognitive skill** | Recognition (lowest cognitive load — ideal as a first exercise) |
| **Lesson position** | First exercise in the practice block (errorless → productive-failure gradient) |
| **Difficulty** | Low |
| **Input** | A question/prompt + 3–4 options (one correct, 2–3 plausible distractors) |
| **Output** | Tap/click one option |
| **Common mistakes** | Guessing from rhythm; distractor confusion (near rhymes, false friends, opposite meaning) |
| **Feedback ✓** | "Genau — {why it's correct, one line}." |
| **Feedback ✗** | "Not quite — {correct answer}. {why, one line}." |
| **Emma hint** | Rung 1–2 (reframe / conceptual) — never the answer |
| **A11y** | Options are `<button>` elements; feedback in `aria-live="polite"`; correctness via ✓/✗ + text (not color alone); keyboard selectable |
| **~Time** | 8–12 seconds |
| **Example** | Prompt: *"Which means 'Hello'?"* → ( **Hallo** ) ( Tschüss ) ( Danke ) · Distractors: a "bye" and a "polite" word (semantic peers, not random) |

### Type 2 — Matching (Pairs)

| Property | Value |
|---|---|
| **Purpose** | Consolidate 4–6 items via visual/organised recognition |
| **Cognitive skill** | Recognition + light recall (slightly higher than MCQ) |
| **Lesson position** | Second exercise |
| **Difficulty** | Low–Medium |
| **Input** | 4–6 German items listed on the left; English shuffled on the right |
| **Output** | Tap to pair each German item with its English equivalent |
| **Common mistakes** | Fixed phrases mismatched (lit. translation); look-alikes confounded |
| **Feedback ✓** | Inline per pair; ✓ appears on correct match |
| **Feedback ✗** | "Almost — {item} is a set phrase; it means '{meaning}'." |
| **Emma hint** | "Two are easy by sound. Start with the ones you're sure of." |
| **A11y** | Accessible via drag/disclosure or button-pair logic; each pair announced |
| **~Time** | 25–40 seconds |
| **Example** | Match: *Hallo · Danke · Tschüss · Freut mich* ↔ *Bye · Hello · Thank you · Nice to meet you*. Note: *Freut mich* is the trap (un-analyzable as single words). |

### Type 3 — Ordering (Build-the-sentence)

| Property | Value |
|---|---|
| **Purpose** | Introduce word order in a scaffolded, low-stakes way (sentence production without typing) |
| **Cognitive skill** | Cued production — structural recall |
| **Lesson position** | Third exercise (bridge from recognition toward production) |
| **Difficulty** | Medium |
| **Input** | 3–5 word/phrase chips shown shuffled |
| **Output** | Tap/arrange chips into the correct order |
| **Common mistakes** | English word order; verb-first; object-first |
| **Feedback ✓** | "Perfect — {pattern shape, e.g. Ich · heiße · [name]}." |
| **Feedback ✗** | "Close — start with {first chip}, then {second}, then {third}." (scaffold, don't just say "wrong order") |
| **Emma hint** | "Who first? Start with the person." (rung 2–3) |
| **A11y** | Chips are reorderable buttons; announcement of position and re-order |
| **~Time** | 12–20 seconds |
| **Example** | [ Ben ] [ heiße ] [ Ich ] → **Ich heiße Ben.** |

### Type 4 — Fill-in (Cued production)

| Property | Value |
|---|---|
| **Purpose** | Apply the target form in a gapped sentence (the pattern's primary practice) |
| **Cognitive skill** | Cued recall — the learner retrieves the correct form |
| **Lesson position** | Fourth exercise (climax of the practice block) |
| **Difficulty** | Medium–High |
| **Input** | A sentence with a blank + 3–4 options (MCQ-fill-in at A1) or a typed text input (A2+) |
| **Output** | Select the correct option / type the correct word |
| **Common mistakes** | Wrong verb form (ich-form for du); word-order; article error; missing umlaut |
| **Tolerant matching (typed)** | Case-insensitive; umlaut 2-letter alternate accepted (ü→ue); whitespace-trimmed |
| **Feedback ✓** | "Yes — with {who} it's {form}. {why, one line}." |
| **Feedback ✗** | After 1 miss: "Almost — remember {pattern clue}. Try again." After 2 misses: reveal answer + why + flag SRS |
| **Emma hint** | "You discovered this earlier — {du} takes the **-t** ending." (rung 2–3) |
| **A11y** | Options as buttons (MCQ) or labelled `<input>` with keyboard submit |
| **~Time** | 12–20 seconds (MCQ); 20–35 seconds (typed) |
| **Example** | *"Wie ___ du?"* → ( heiße ) ( **heißt** ) ( heißen ). Miss: reveals "heißt" + why. |

---

## Extended set (use when the capability or level needs them)

### Type 5 — Listening (Script-only; audio in live lesson)

| Property | Value |
|---|---|
| **Purpose** | Bind sound to meaning (adds the auditory modality to recognition) |
| **Cognitive skill** | Listening recognition |
| **Lesson position** | 5th exercise (after the core set, if audio distinctiveness justifies it) |
| **Difficulty** | Low–Medium |
| **Input** | An audio clip (or script-for-authoring: the spoken line) + 3 options |
| **Output** | Tap/click the meaning or respond to a question |
| **Common mistakes** | Guessing by rhythm; confusing near-homophones |
| **Feedback ✓** | "That's it — {line} means '{meaning}'." |
| **Feedback ✗** | "Listen again — it's '{line}' = '{meaning}'. The key sound is {sound}." |
| **Emma hint** | "It has two words and a soft 'sh' at the end." + [0.5×] |
| **A11y** | Text-alternative always present; 0.5× always available; audio never the only channel |
| **~Time** | 10–15 seconds |
| **Example** | Audio: *"Freut mich!"* → ( Nice to meet you ) ( Thank you ) ( Goodbye ). Distractors = other greeting-adjacent meanings. |

### Type 6 — Micro-production (Type your answer)

| Property | Value |
|---|---|
| **Purpose** | First free-ish recall — the learner produces the target from a meaning prompt |
| **Cognitive skill** | Free recall / light production |
| **Lesson position** | Last (optional) practice item; only when the learner has succeeded on the core set |
| **Difficulty** | High |
| **Input** | A natural prompt in English ("Introduce yourself. Type: I'm called [your name].") |
| **Output** | Typed German sentence |
| **Common mistakes** | English word order; verb conjugation error; missing article; spelling |
| **Tolerant matching** | Case/spacing/umlaut-fold; accept listed alternates; accept any name in the name slot |
| **Feedback ✓** | "You just typed real German. 🎉 {correct form}." |
| **Feedback ✗** | "So close — the shape is {Ich heiße [name]}. The verb comes second." — never marks a willingness error |
| **Emma hint** | "Whatever your name is, drop it after *heiße*. There's no wrong name!" |
| **A11y** | Labelled `<input>`; visible above keyboard on mobile; keyboard-submit |
| **~Time** | 20–40 seconds |
| **Example** | Prompt: "Introduce yourself. I'm called ___." → Learner types any name; goal is the frame. |

---

## Exercise composition rules

### How many?
- **A1:** 4 core (1–2–3–4) + Mini Review. Add Listening (5) only if audio distinction is key.
- **A2+:** 4–5 exercises, type 6 optional if engagement permits.
- **Review lessons:** use types 1–2 + Mini Review (0 new words; retrieval only).
- **Never exceed the LESSON_BLUEPRINT time budget** — if duration >10 min at A1, cut exercises before cutting vocabulary or dialogue.

### Ordering philosophy
Always: **recognition → cued → production** (errorless-leaning at A1; attempt-before-reveal at B1+). Never put type 6 before type 4.

### Distractor design
Distractors must be **plausible and educational** — a semantic peer, a near-form (conjugation), or an opposite — never a random word. A distractor that teaches is a good distractor.

### Feedback must always:
- **Be immediate** (on check).
- **Be specific** (name the correct answer + one-line why, per FEEDBACK_GUIDELINES).
- **Be safe** (never punitive, never a score, never blocks).
- **Use ✓/✗ + text** (not color alone).

---

## Adding a new type
If a future lesson genuinely needs an exercise form not in this library: propose it as a **new type card** with the same 11-property table, evaluate against EXERCISE_GUIDELINES, and add it below with a version bump. Do not create a one-off exercise in a lesson file. All exercises reference a type in this library.
