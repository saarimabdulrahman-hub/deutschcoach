# DeutschFlow — Lesson Blueprint

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active
**Sprint:** 6.3A · **Governs:** every DeutschFlow lesson
**Builds on:** LESSON_PRINCIPLES · LESSON_FLOW · LESSON_WIREFRAMES · LEARNING_PRINCIPLES · PRODUCT_VISION

> This is the master template. Every lesson — authored by a human, an instructional designer, or an AI — must conform to it. Companion docs specify each part (vocabulary, grammar, exercises, speaking, feedback, microcopy, AI tutor, curriculum).

---

## 0. The DeutschFlow Learning Model (the hybrid)

We do not follow one methodology. We combine the evidence-based parts of several into a single loop — **Confidence-First Comprehensible Practice (CFCP):**

```
INPUT → NOTICE → RECOGNIZE → RETRIEVE → PRODUCE → CONSOLIDATE → (SRS across lessons)
```

| Stage of the loop | Research basis | In the lesson |
|---|---|---|
| **Input** | Comprehensible Input (Krashen, i+1) | Dialogue (listen + read, captions) |
| **Notice** | Noticing Hypothesis (Schmidt); low Cognitive Load (Sweller) | Grammar Discovery points to a pattern already heard |
| **Recognize** | Active Recall (recognition tier) | Vocabulary flip cards |
| **Retrieve** | Retrieval Practice; Errorless → Productive Failure | Guided Practice → Interactive Exercises |
| **Produce** | Output Hypothesis (Swain); Deliberate Practice | Speaking with Emma (optional, scaffolded) |
| **Consolidate** | Testing effect; end-on-a-win | Mini Review |
| **Across lessons** | Spaced Repetition (SM-2); Interleaving | Review deck seeded on completion |

**Confidence is the through-line:** difficulty rises monotonically within a lesson, feedback never punishes, nothing gates, and every lesson ends on success (LESSON_PRINCIPLES §6, §9). This is the single non-negotiable that differentiates us from drill apps.

**Errorless-then-productive-failure gradient:** early stages are heavily scaffolded (near-impossible to fail — warm-up, recognition), later stages invite an attempt *before* revealing (productive failure) but always with a safety net (hint → reveal → why). We never let a beginner sit in confusion.

---

## 1. Lesson objective

Every lesson delivers **exactly one real-world communicative capability**, phrased as something the learner can *do*:

- ✅ "Introduce yourself", "Order a coffee", "Ask for directions"
- ❌ "Learn the verb *sein*", "Vocabulary set 3", "Nominative articles"

**Rule:** if you cannot finish the sentence *"After this lesson you can ____"* with a real-world action, the lesson is mis-scoped. One capability = one lesson (LESSON_PRINCIPLES §1, §4).

---

## 2. Success criteria

A lesson **succeeds** when a first-time learner, unaided, can:

1. **Complete it** end-to-end without asking "what do I do next?"
2. **Feel successful** — end on a win, no unresolved failure.
3. **Remember tomorrow** — items are seeded to SRS and re-appear.
4. **Want Lesson 2** — the next capability is visible and inviting.

These map to the four Success-Metric questions the sprint requires; every lesson is reviewed against them.

---

## 3. Quantitative spec (decision table)

| Dimension | A1 (Beginner) | A2 | B1 | B2–C1 | Rationale |
|---|---|---|---|---|---|
| **Duration** | 8–10 min | 8–12 | 10–14 | 12–16 | Fits 15–20 min/day; single focused session |
| **New vocabulary** | 8–10 words | 8–12 | 10–14 | 12–16 | Working memory 7±2, chunked into ≤6 sets |
| **Grammar concepts** | **1** | 1 | 1 (may revisit) | 1–2 (advanced) | One concept per lesson; depth over breadth |
| **Exercises** | 3–4 | 4–5 | 4–6 | 5–7 | Touch each item ~once without drill fatigue |
| **Speaking tasks** | 1 (optional) | 1 | 1–2 | 2 | Output consolidates; never gate on it |
| **Total interactions** | 10–14 | 12–16 | 14–18 | 16–20 | Enough to practice, few enough to stay < duration |
| **Reading level of instructions** | English, A2-simple | English | English/German mix | German-leaning | Instructions must never out-level the target |

*Trade-off:* richer B2–C1 lessons risk overload; we cap new items and lean on interleaving of known material instead of piling on new words.

---

## 4. Grammar scope

- **One** pattern, **discovered** (notice → name), taught with a compact table + examples drawn only from *this lesson's* vocabulary (GRAMMAR_GUIDELINES).
- Grammar is never the objective; it is the machinery behind the capability. "Introduce yourself" *uses* `ich heiße / ich bin` — the pattern serves the goal.

---

## 5. Speaking expectations

- Speaking is **optional and encouraged**, never required to complete a lesson (Guided-not-Gated).
- One short guided exchange with Emma, scaffolded by suggestions, typed now / spoken later.
- Skipping still seeds vocabulary. See SPEAKING_GUIDELINES.

---

## 6. Review strategy

- **Every completion** seeds the lesson's vocabulary into SM-2 (`seed-lesson`).
- Missed exercise items get **extra SRS weight** (deliberate practice on weak areas).
- Later lessons **spiral** prior vocabulary into warm-ups and dialogues (interleaving). See VOCABULARY_GUIDELINES §Review.

---

## 7. Celebration strategy

- Name the **capability achieved** ("You can now introduce yourself"), not points.
- Show a concrete learned tally (N words · 1 pattern) and the SRS handoff ("N cards ready").
- Positive-only streak/goal tick. **No XP, no mascots, reduced-motion friendly** (LESSON_PRINCIPLES §6, §9).

---

## 8. Exit criteria (what "done" means)

A lesson is **complete** when the learner reaches the Mini Review checkpoint and completes it (which seeds SRS). Celebration + Summary are closure, not gates. Speaking is not required. A learner may also **leave safely at any checkpoint** and resume — an incomplete lesson is *paused*, never *failed*.

| State | Meaning |
|---|---|
| Completed | Reached Mini Review; SRS seeded; capability delivered |
| Paused | Left at a checkpoint; resumes at that stage |
| Skipped (optional stage) | e.g., Speaking skipped — lesson still counts as complete |

---

## 9. Assumptions & trade-offs
1. **Assumption:** learners have ~10 min and a phone. Lessons are built for that; a "long lesson" is a content smell — split it.
2. **Trade-off (breadth vs depth):** we cap new items per lesson and accept slower vocabulary accumulation in exchange for retention and confidence. Competitors that front-load 20+ words per lesson show faster "coverage" but worse recall.
3. **Assumption:** the engine (6.2A–E) provides shell, navigation, audio UI, SRS seeding. This blueprint targets those capabilities; nothing here requires engine changes.
4. **Edge case:** a capability that genuinely needs two patterns (e.g., separable verbs) → split across two chained lessons, not crammed.
