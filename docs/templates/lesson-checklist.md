# DeutschFlow — Lesson Checklist

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active — fill before marking any lesson "Ready."
**Based on:** LESSON_BLUEPRINT · LESSON_TEMPLATE · EXERCISE_PATTERN_LIBRARY

> Every `□` must be checked before a lesson leaves Draft. Use this with `lesson-review-rubric.md` (target: avg ≥4.0, no dimension below 3). This is a production gate, not a suggestion.

---

## A. Pedagogy & method

- [ ] **One communicative capability** — passes the LESSON_BLUEPRINT test ("After this lesson you can ____" with a real-world action). No topic-only lessons.
- [ ] **Dialogue authored first** — vocabulary and the grammar pattern were extracted from the dialogue, not the reverse.
- [ ] **Grammar discovered, not lectured** — the Pattern Discovery stage uses lines from the dialogue (notice → name); learners are never shown an abstract rule table before seeing the pattern in context.
- [ ] **Input → recognition → production gradient** — the lesson follows LESSON_BLUEPRINT §0 order; does not demand free production before recognition.
- [ ] **No more than one grammar pattern.** If the capability genuinely needs two → split into two lessons.
- [ ] **CEFR-appropriate** — reading level of instructions, dialogue length, exercise mix, and scaffolding match the level (A1_SCOPE · CURRICULUM_PRINCIPLES).
- [ ] **Vocabulary count within bounds** — 8–12 for a capability lesson (per LESSON_BLUEPRINT §3); 0 for a review lesson.
- [ ] **Nouns always taught with article + plural** — no bare noun in any vocabulary card.
- [ ] **Vocabulary chunked** — into sets of ≤6.
- [ ] **Translation policy followed** — English hidden by default on dialogue lines and vocabulary cards (one-tap reveal; never forced). VOCABULARY_GUIDELINES §3.

## B. Flow & completeness

- [ ] **All 9 stages present** — Warm Welcome · Dialogue · Vocabulary · Pattern Discovery · Guided Practice · Speaking · Mini Review · Celebration · Learning Summary. (Speaking may be skipped; its UI + skip path must exist.)
- [ ] **Stage order correct** — no reordering that contradicts LESSON_FLOW.
- [ ] **Warm Welcome states the capability** — not the lesson number or topic. "You'll be able to introduce yourself", not "Welcome to Lesson 1."
- [ ] **Dialogue is realistic** — 2–3 speakers, 6–10 lines, uses only known + this-lesson words, represents a scenario a real learner might encounter.
- [ ] **Pattern Discovery ≤ 1 compact table** — no paradigm charts at A1.
- [ ] **Guided Practice = 4 exercises minimum (core: MCQ · Matching · Ordering · Fill-in)** — per EXERCISE_PATTERN_LIBRARY.
- [ ] **Exercises ordered: recognition → cued → production.**
- [ ] **Speaking is optional** — a visible `Skip for now` is present; the script includes branches A (correct), B (incomplete), C (stuck), and Skip.
- [ ] **Mini Review is recognition+recall** — 3–4 rapid items over the whole lesson; ends on wins. Never a scored quiz.
- [ ] **Celebration names the capability achieved** — not "lesson complete." No XP, points, or mascot. Reduced-motion compatible.
- [ ] **Learning Summary lists: words · pattern · conversation practiced · next lesson.**

## C. Content quality

- [ ] **Vocabulary: every item has pronunciation, meaning, example, and a "common beginner confusion" note.**
- [ ] **Vocabulary words support the capability** — no filler items. Every word appears in the dialogue or is essential to the capability.
- [ ] **Dialogue lines are natural** — not stilted, not "textbook German."
- [ ] **Pronunciation respellings are consistent** — uses a standardised scheme (HAH-loh, ish HY-suh, etc.) for A1–A2; removed at B1+.
- [ ] **Exercises: every one has a purpose, expected mistake, correct + incorrect feedback, and an Emma hint.** No busywork.
- [ ] **Distractors are plausible and educational** — never random. EXERCISE_PATTERN_LIBRARY "Distractor design."
- [ ] **Common beginner mistakes table populated** — at least 3 items; each links to a recovery mechanism in the lesson.
- [ ] **Timing table filled and validated** — total within the level's budget (A1 ≤10 min).

## D. Emma consistency

- [ ] **Emma appears only where needed** — ≤6 touchpoints per lesson (AI_TUTOR_GUIDELINES §7 rule 4).
- [ ] **Emma never opens with the answer** — all exercise hints start at Rung 1 or 2 of the hint ladder.
- [ ] **Emma's voice matches `emma-script-template.md`** — no free-handed voice, no "Wrong.", no lecture, no guilt.
- [ ] **Emma intervention inventory table populated** (`lesson-template.md` §11).

## E. Accessibility & design system

- [ ] **No information communicated by colour alone** — exercise feedback uses ✓/✗ + text; status uses icon + label.
- [ ] **Audio never the only channel** — any audio has a visible text equivalent (captioned dialogue, text transcription for listening exercises).
- [ ] **≥44px touch targets** — exercise options, navigation, and audio controls.
- [ ] **Keyboard-operable** — every stage can be completed without a mouse (exercise options are buttons; continue is reachable via Tab/Enter).
- [ ] **Focus-visible** — reliance on the existing `:focus-visible` global rule; no custom focus suppression.
- [ ] **Reduced motion** — celebration uses static ✓ + text when `prefers-reduced-motion` is active; lesson-level animations are a future concern.

## F. Pre-publication sign-off

- [ ] **Lesson scored via `lesson-review-rubric.md`** — avg ≥4.0, no dimension below 3.
- [ ] **Native German speaker review completed.** (Minimum: one native reader; recommended: a CEFR-qualified teacher.)
- [ ] **Audio assets confirmed available** — every German line/word in the lesson has a corresponding audio file (native or production-grade TTS). Mark `[ ] audio planned` otherwise.
- [ ] **Lesson seeded into the curriculum continuity** — the preceding and following lesson references are correct; the spiral vocabulary list for the warm-up is defined.
- [ ] **Meta fields filled:** level, unit, lesson #, duration, status.

---

## What "checked" means
- Every `□` = the author has verified it against this document. Not assumed. Not deferred.
- A lesson that passes all checks is **Author-Ready**.
- A lesson that also has real audio + native review is **Production-Ready**.

## Quick self-audit (before the full review)
1. Scan the Dialogue — does it sound like a real conversation?
2. Count the vocabulary — is every word with an article? Is every word needed?
3. Walk the exercises in order — does difficulty rise? Does each one teach?
4. Read Emma's lines aloud — would you feel helped, not judged?
5. Read the Celebration aloud — does it make you want to do another lesson?

If any answer is no, fix it before the rubric review.
