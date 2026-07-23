# DeutschFlow — Exercise Guidelines

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active · **Sprint:** 6.3A

> Per-type spec for the practice + interactive-exercise stages. Engine supports `fill-blank`, `multiple-choice`, `translate`; this doc also defines two lightweight recognition types used in warm-up/mini-review.

---

## 1. Shared exercise rules
- **Immediate, kind feedback** (FEEDBACK_GUIDELINES): correct → affirm + why; incorrect → reveal + why + SRS flag; **no score, never blocks**.
- **Tolerant matching** for typed answers (case/whitespace/umlaut-fold; accept known alternates).
- **Hint before check** (💡), **Skip** available (rare), **retry** allowed.
- **Ordering:** recognition → cued production → free production (errorless → productive-failure gradient).

---

## 2. Type-by-type (decision table)

| Type | Purpose | Cognitive skill | Difficulty | ~Time/item | Common mistakes | Hint | Feedback | Recovery | When to **skip** |
|---|---|---|---|---|---|---|---|---|---|
| **Multiple-choice** | Recognize meaning/form | Recognition | Low | 8–12s | Guessing; distractor confusion | Eliminate one distractor | ✓ + why / ✗ + correct + why | Re-ask later in mini-review | If already 100% on this item type this lesson |
| **Fill-blank** | Apply a form in context | Cued recall | Medium | 12–20s | Wrong verb form; word order | Show the base word / first letter | ✓/✗ + the rule line | Reveal + SRS flag after 2 misses | Never auto-skip; learner may skip 1 |
| **Translate (EN→DE)** | Produce from meaning | Free recall / production | High | 20–35s | Word order (V2); missing article; umlauts | Give the sentence skeleton | Tolerant match; ✗ shows model + why | Reveal model, offer Emma, SRS flag | Optional at A1 if it's the hardest item |
| **Match (pairs)** *(warm-up)* | Reactivate prior words | Recognition | Low | 5–8s/pair | — | Highlight one pair | ✓ inline, no penalty | — | Skipped for Lesson 1 of a unit |
| **Listen-and-choose** *(review)* | Bind sound→meaning | Listening recognition | Low–Med | 10–15s | Similar-sounding words | Replay / 0.5× | ✓/✗ + replay | Replay + reveal | If audio unavailable, fall back to MCQ |

---

## 3. Errorless vs productive failure (when to use which)
- **Early stages / A1 / first exposure:** errorless — heavy scaffolding, MCQ, hints up front. Success rate target ~80–90%.
- **Later stages / A2+ / consolidation:** productive failure — ask the learner to *attempt* (translate) before revealing; the struggle primes learning, but the safety net (hint → reveal → why) always catches them.

---

## 4. Count & mix per lesson
- 3–5 exercises (LESSON_BLUEPRINT), covering each new item/pattern ≥once.
- Mix skews to recognition at A1, shifts to production by B1.
- **Mini Review** (separate stage) = 3–5 rapid recognition items over the whole lesson — always ends on wins.

## 5. Assumptions & trade-offs
- **Assumption:** exercise checking can be client-side (tolerant matching) for UI-only; server scoring optional later.
- **Trade-off:** tolerant matching risks accepting a "close-enough" wrong answer; we bias toward *avoiding false negatives* (beginner frustration is the bigger risk than an occasional lenient pass, which SRS will catch).
- **Edge case:** ambiguous translations (multiple valid answers) must ship an `alternates` list; if unknown, prefer MCQ/fill-blank over translate for that item.
