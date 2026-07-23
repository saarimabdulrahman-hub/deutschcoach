# DeutschFlow — Speaking Guidelines

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active · **Sprint:** 6.3A

> Speaking is where confidence is won or lost. It is optional, scaffolded, and never punitive.

---

## 1. When speaking begins
- **Within a lesson:** last (Produce), after input + recognition + practice — the learner already has the words and pattern (Output Hypothesis).
- **In the curriculum:** from **Lesson 1**, but as a *tiny, guided* exchange (say your name) — early exposure normalizes speaking without pressure.

---

## 2. Confidence progression
| Level | Speaking task | Scaffold |
|---|---|---|
| A1 | 1–2 turn guided reply ("Wie heißt du?" → "Ich heiße…") | Full suggestion chips + typed input |
| A2 | 3–4 turns, one scenario | Suggestions on request |
| B1 | Short free exchange | Minimal scaffolding |
| B2–C1 | Open conversation, register-aware | Emma pushes for nuance |

Difficulty rises **across** lessons, never within a single beginner lesson.

---

## 3. Optional vs required
- **Always optional.** A visible `Skip for now` is present every time; skipping never penalizes and still seeds vocabulary (Guided-not-Gated).
- **Always encouraged.** Copy: "Try it with Emma — mistakes are how you learn." "No mic? Just type."
- **Input modality:** typing now (universally accessible); speech (🎤) later. Never mic-only.

---

## 4. AI feedback philosophy (Emma)
- **English-first, correction-with-reason:** never "Wrong." Instead: "Close! Say *Ich heiße Anna* — the verb *heiße* comes right after *ich*."
- **Praise the attempt, then refine one thing** (don't correct everything at once — cognitive load).
- **Level-appropriate:** at A1, ignore minor errors that don't block meaning; focus on the target pattern.
- See AI_TUTOR_GUIDELINES for the full persona + hint ladder.

---

## 5. Pronunciation scoring philosophy
- **No harsh scores, no red "fail".** If/when pronunciation assessment exists, present it as **encouraging guidance** ("Nice — try a rounder *ü*"), never a percentage that can feel like a grade.
- **Formative, not summative:** pronunciation feedback informs practice; it never gates progress or lowers a visible score.
- Until real speech scoring ships, speaking is text/turn-based with Emma — documented as a dependency, gracefully degraded.

---

## 6. How mistakes are handled
| Situation | Response |
|---|---|
| Minor error, meaning clear | Affirm, model the ideal, move on |
| Target-pattern error | Gentle correction + one-line why |
| Learner stuck / blank | Offer a suggestion chip; never leave them staring |
| Learner skips | "You can practice anytime" — no guilt |

## 7. Assumptions & trade-offs
- **Assumption:** Emma receives lesson context (current vocab/pattern) — a known dependency (PRODUCT_AUDIT #4).
- **Trade-off:** making speaking optional lowers completion friction at the cost of some learners under-practicing output; we accept it (forcing speaking causes anxiety and churn) and nudge via encouragement + streak-positive framing.
- **Edge case:** offline → speaking unavailable; show "Emma's offline — you can skip and practice later," advance normally.
