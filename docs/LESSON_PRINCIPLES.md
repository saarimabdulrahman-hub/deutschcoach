# DeutschFlow — Lesson Principles

**Version:** 1.0
**Last Updated:** 2026-07-12
**Status:** Active — governs every lesson in DeutschFlow
**Sprint:** 5.3C (Lesson Experience Architecture)
**Derived from:** PRODUCT_VISION · LEARNING_PRINCIPLES · UX_GUIDELINES · DESIGN_SYSTEM · Sprint 5.1–5.3B

> This document defines *how a lesson should feel and behave*. `LESSON_FLOW.md` defines the concrete stage-by-stage flow. Neither may contradict the six canonical docs.

---

## 0. The One-Sentence Purpose

**A lesson takes a beginner from "I can't do this" to "I can do this" for one concrete communicative capability — through comprehensible input, guided practice, and low-stakes production — and ends with the learner more confident than they started.**

Everything below serves that sentence.

---

## 1. First Principles (answered)

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose of a lesson** | Deliver **one real-world capability** ("introduce yourself," "order food") — not a list of words. One concept per lesson. |
| 2 | **Know before starting** | *What* they'll be able to do, *why* it matters, *how long* it takes, and that it builds on prior lessons. |
| 3 | **Know after finishing** | They can perform the capability, own ~8–12 new words + 1 grammar pattern, have seen it in a realistic dialogue, and their words are queued for review. |
| 4 | **Ideal beginner length** | **8–10 minutes** (7–12 range). Fits the 15–20 min/day persona in one focused session with room to review. |
| 5 | **Number of interactions** | **~10–14 micro-interactions** total — enough to touch each item once, few enough to avoid fatigue. One decision per screen. |
| 6 | **When grammar appears** | **After** the dialogue and vocabulary — *notice the pattern in context first, then name it* (inductive "grammar discovery"). |
| 7 | **When vocabulary appears** | **Right after the dialogue** — words are met in context, then isolated for study. Before heavy grammar. |
| 8 | **When speaking appears** | **Late** — production follows input. After learners have the words + pattern. Low-stakes, encouraged, never gated. |
| 9 | **When listening appears** | **Early** — the dialogue *is* the listening moment. Input before output. |
| 10 | **How confidence increases** | Monotonically: safe input → recognition → guided practice (reveal, not punish) → supported production → consolidation → celebration. **Never end on a failure.** |

---

## 2. Product Philosophy (lesson-specific)

Inherited from PRODUCT_VISION, applied to lessons:

1. **Explain, don't just drill.** Every word, pattern, and exercise carries a *why*. Beginners should understand the language, not memorize noise.
2. **Guided, not gated.** No stage blocks progress. Miss an exercise, skip speaking, leave early — the learner always moves forward. Mastery is *tracked*, never a wall.
3. **Serious, not sterile.** Motivation comes from *visible progress and real capability*, not points, timers, or mascots. A completed lesson feels like an accomplishment, not a game reward.
4. **Input before output.** Comprehensible input (listen/read) precedes recognition, which precedes production. This is how humans acquire language and how anxiety stays low.
5. **Notice, then name.** Grammar is *felt* in the dialogue before it is *explained*. Rules land better after exposure.
6. **Progress over perfection.** Errors are learning events, not penalties. The SRS handles what needs revisiting.
7. **One continuous guided experience.** The learner is never dropped at a decision point mid-lesson. There is always one obvious next action.

---

## 3. UX Principles

1. **One primary action per screen.** "Continue," "Check," or "Got it" — never a cluster of equal choices. This is the lesson-level expression of UX_GUIDELINES' "never wonder what's next."
2. **Structure is always visible.** A segmented progress model shows *what stage, why, and how much remains* at all times (see §Progress).
3. **The learner can always leave and return** without losing work — checkpoints at section boundaries.
4. **Feedback is immediate and kind.** Correct → brief affirm + why-it's-right. Incorrect → reveal + explanation, never harshness, never a score deduction.
5. **Reading order = learning order.** The visual top-to-bottom order matches the pedagogical sequence.
6. **No dead ends.** Every terminal state (complete, error, empty, offline) offers a clear next action.

---

## 4. Learning Principles

Consistent with LEARNING_PRINCIPLES.md:

1. **One concept per lesson.** Never pronouns *and* verb conjugation together.
2. **8–12 vocabulary words**, chunked (split into 2 sets if ≥10) to respect working memory (7±2).
3. **3–5 exercises**, covering each concept/word at least once — no drill fatigue.
4. **Dialogue-first authoring.** Write the realistic scenario, then extract vocab and grammar from it.
5. **Spiral review.** Reuse prior-lesson vocabulary in the warm-up and dialogue.
6. **Recognition → production.** Flip cards (recognize) before typing/speaking (produce).
7. **Every completion seeds the SRS** (`POST /srs/seed-lesson`) so retention is automatic.
8. **Speaking practice = Emma**, the AI tutor: English-first explanations, corrections *with reasons*, level-appropriate.

---

## 5. Cognitive-Load Principles

1. **One new-information stream at a time.** Never introduce vocab while explaining grammar.
2. **Chunk, don't dump.** 8–12 words arrive in small sets, not one wall.
3. **Progressive disclosure inside the lesson.** Each stage reveals only what that stage needs.
4. **No time pressure.** No countdowns, no timed exercises — anxiety kills acquisition.
5. **Reduce choices.** The learner makes learning decisions, not navigation decisions.
6. **Scaffold, then remove.** Early stages give heavy support (audio + text + hints); later stages ask for recall.
7. **Short screens.** Minimal scrolling; one focused idea per screen on mobile.

---

## 6. Motivation Principles

Motivation is engineered as an *arc*, using only VISION-approved mechanics (no XP, no streak-freezes, no guilt):

| Phase | Learner should feel | How |
|-------|--------------------|-----|
| **Beginning** | Oriented + safe | Clear objective ("what you'll be able to do"), zero-stakes input, an easy warm-up win |
| **Middle** | "I'm getting it" (competence) | Recognizing words, spotting the pattern, self-paced practice with supportive feedback |
| **Near completion** | Capable + gently challenged (agency) | Producing language, speaking with Emma, applying the pattern |
| **Completion** | Proud + eager for the next (closure) | The capability is *named as achieved*, words banked for review, streak/daily-goal ticks up, next capability previewed |

**Rules:** celebrate progress not perfection; never punish; end every lesson on a win; the next step is always one tap away.

---

## 7. Accessibility Principles

Target: **WCAG 2.1 AA** (per PRODUCT_VISION core value).

1. **Keyboard:** full tab order, Enter/Space activation, every stage operable without a mouse, visible `:focus-visible`.
2. **Screen readers:** semantic structure, `aria-live="polite"` for answer feedback, `aria-current="step"` for progress, labelled controls, dialogue read in speaker order.
3. **Reduced motion:** no meaning conveyed by motion; `prefers-reduced-motion` swaps confetti/animation for static equivalents.
4. **Captions:** audio is **never** the only channel — dialogue and vocabulary audio always ship with visible text.
5. **Color blindness:** status uses **icon + text + shape**, never color alone (✓ / ✗ + words). AA contrast throughout.
6. **Touch:** ≥44px targets, thumb-reachable primary actions, tap (not hover) for anything essential.

---

## 8. Mobile-First Principles

1. **One stage per screen** — the lesson is a vertical sequence of focused screens, not one long scroll.
2. **Thumb-zone primary action** — "Continue"/"Check" anchored bottom, reachable one-handed.
3. **Sticky progress top, sticky action bottom;** content scrolls minimally between.
4. **Short, resumable sessions** — a lesson fits 8–10 min one-handed; checkpoints allow pausing.
5. **Portrait-optimized, landscape-tolerant** — typing exercises must keep the input visible above the keyboard.
6. **Large, forgiving targets** — vocab flips on tap, exercises use big option buttons.

---

## 9. Non-Negotiables (what a lesson must never do)

- ❌ Block progress on a wrong answer or a skipped stage (Guided, not Gated).
- ❌ Use timers, countdowns, XP, points, or a mascot.
- ❌ Present audio without text, or convey status by color alone.
- ❌ Introduce more than one grammar concept.
- ❌ End on an error or a dead end.
- ❌ Lose a learner's progress when they leave or go offline.
- ❌ Make the learner ask "what do I do next?" at any point.

---

## 10. The Acceptance Question

> **"Would a first-time learner complete this lesson confidently without external guidance?"**

A lesson passes only when every stage answers, on its own screen: *what am I doing, why, how much is left, am I making progress* — with one obvious action and no way to get stuck. See `LESSON_FLOW.md` for the flow that satisfies this.
