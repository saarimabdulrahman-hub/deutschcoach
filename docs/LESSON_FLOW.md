# DeutschFlow — Lesson Flow

**Version:** 1.0
**Last Updated:** 2026-07-12
**Status:** Active — the canonical flow every DeutschFlow lesson follows
**Sprint:** 5.3C (Lesson Experience Architecture)
**Companion to:** LESSON_PRINCIPLES.md · governed by LEARNING_PRINCIPLES.md + PRODUCT_VISION.md

> This is the blueprint. It does not prescribe visual design (that is Sprint 5.3F) — it prescribes **sequence, purpose, interaction, and recovery**.

---

## 1. The Flow at a Glance

```
Tap "Continue Lesson"
        ↓
0 · INTRO            (set the goal + why)                 ~20s
        ↓
1 · WARM-UP          (recall 2–3 prior words)             ~40s
        ↓
2 · DIALOGUE         (listen + read in context) ── CHECKPOINT   ~1.5m
        ↓
3 · VOCABULARY       (meet + flip 8–12 words) ── CHECKPOINT     ~2m
        ↓
4 · GRAMMAR DISCOVERY (notice → name one pattern) ── CHECKPOINT ~1.5m
        ↓
5 · GUIDED PRACTICE  (3–5 exercises, reveal not punish) ── CHECKPOINT ~2m
        ↓
6 · SPEAKING         (short guided exchange w/ Emma — optional)  ~1.5m
        ↓
7 · MINI REVIEW      (quick recall of this lesson) ── CHECKPOINT ~1m
        ↓
8 · CELEBRATION      (capability achieved + words banked)  ~15s
        ↓
9 · NEXT LESSON      (one CTA → continue / review)
```

**Target total: 8–10 minutes.** Checkpoints (⎯) are safe save/resume points.

### Why this order differs from the example brief

The brief placed *Listening → Speaking → Grammar*. We instead do **Dialogue(listen) → Vocab → Grammar → Practice → Speaking**, because:
- **Listening is the dialogue**, so it merges into stage 2 (no separate "listening" stage — that would be redundant input).
- **Speaking (output) belongs after grammar + practice**, once the learner actually has the words and pattern to produce. Producing before the pattern is named raises anxiety and lowers success — violating the confidence-monotonic rule in LESSON_PRINCIPLES §1.10.
- **Grammar comes after exposure** (notice → name), per the "input before output / notice then name" principles.

---

## 2. Stage-by-Stage

For each stage: **Purpose · Interaction · Why here · Merge/Remove/Move analysis.**

### 0 · Intro  (~20s)
- **Purpose:** Answer "what will I be able to do, why, how long" before any effort. Sets relevance and expectation.
- **Interaction:** Passive screen — objective ("Introduce yourself"), 1-line why, duration, and a "Begin" button (single action).
- **Why here:** Orientation must come first (UX_GUIDELINES).
- **Merge?** Warm-up can fold in for very short lessons, but keep separate when there's prior vocabulary to recall. **Keep.**

### 1 · Warm-up  (~40s)
- **Purpose:** Spiral review — recall 2–3 words from prior lessons to activate memory and score an early, easy win (confidence primer).
- **Interaction:** 2–3 ultra-light recognition taps (tap the matching meaning). No failure state.
- **Why here:** Priming + a guaranteed early success raises baseline confidence.
- **Remove?** Omit gracefully for Lesson 1 of Unit 1 (nothing to recall). **Conditional.**

### 2 · Dialogue — Listen + Read  ⎯checkpoint  (~1.5m)
- **Purpose:** Comprehensible input. Hear + see the target language used in a realistic scenario; this is the **listening** stage.
- **Interaction:** Play audio (sentence-by-sentence, pause/resume/replay — the existing `ReadAloudBar`), captions always visible. "Continue" to advance.
- **Why here:** Input before output; context before isolation. Everything downstream references this dialogue.
- **Merge/Move?** Do **not** split listening out; captions make it accessible. **Keep, first content stage.**

### 3 · Vocabulary  ⎯checkpoint  (~2m)
- **Purpose:** Isolate the 8–12 new words *encountered in the dialogue*; build recognition; explain the *why/context* of each.
- **Interaction:** Flip cards (German ↔ English + example + audio), delivered in **sets of ≤6**. Learner taps through; optional self-rate.
- **Why here:** Right after the dialogue, while context is fresh; before grammar.
- **Merge/Remove?** Cannot remove (core). Chunk into 2 sets when ≥10 to protect working memory. **Keep.**

### 4 · Grammar Discovery  ⎯checkpoint  (~1.5m)
- **Purpose:** Teach **one** pattern inductively — highlight where it already appeared in the dialogue, *then* name and explain it with a compact table + examples ("explain the why").
- **Interaction:** A "did you notice…?" reveal, one rule, one table, 2–3 examples from the lesson's own vocabulary. Passive → "Got it."
- **Why here:** After exposure (notice → name); before practice that applies it.
- **Move earlier?** No — naming grammar before exposure is abstract and raises load. **Keep after vocab.**

### 5 · Guided Practice  ⎯checkpoint  (~2m)
- **Purpose:** Apply words + pattern; convert recognition toward production; surface gaps safely.
- **Interaction:** 3–5 exercises (`fill-blank`, `multiple-choice`, `translate`). Answer → **immediate, kind feedback**: correct → affirm + why; incorrect → reveal + explanation, mark for extra SRS, **no score penalty, never blocks**.
- **Why here:** Practice needs the input + rule first.
- **Merge?** No — this is where learning consolidates. **Keep.**

### 6 · Speaking (with Emma)  (~1.5m, optional)
- **Purpose:** Low-stakes production — use the new capability in a short guided exchange; corrections *with reasons*.
- **Interaction:** 2–3 turn guided prompt with Emma (type now; speech later). **Skippable** with a gentle "practice anytime."
- **Why here:** Output last, once the learner is equipped.
- **Remove?** Never gate on it (mic/anxiety). **Keep as optional, encouraged.** *(Dependency: Emma must receive lesson context — PRODUCT_AUDIT #4.)*

### 7 · Mini Review  ⎯checkpoint  (~1m)
- **Purpose:** Consolidate *this lesson's* items with quick recall; end the effort on wins; seed the SRS.
- **Interaction:** 3–5 rapid recognition/recall items drawn only from this lesson. Supportive, no penalty.
- **Why here:** Just before celebration — the last thing before the win is a set of successes.
- **Merge?** Distinct from Practice (review = recall of the whole lesson, mixed). **Keep.**

### 8 · Celebration  (~15s)
- **Purpose:** Name the achievement ("You can now introduce yourself"), summarize what was learned, confirm words added to the review deck, tick the streak/daily-goal — **without XP or cartoon**.
- **Interaction:** Static-friendly celebration (respects reduced-motion), a short "you learned: N words · 1 pattern" summary.
- **Why here:** Closure + positive affect drive return.
- **Remove?** No — ending on a win is a core motivation rule. **Keep.**

### 9 · Next Lesson
- **Purpose:** Convert momentum into the next session.
- **Interaction:** **One** primary CTA — "Next: {capability}" — plus a secondary "Review flashcards." No dead end.
- **Keep.**

---

## 3. Progress Model

**Chosen: a segmented, section-based progress bar + step label.** e.g. `Step 4 of 8 · Grammar` with a bar divided into the stage segments, completed segments checked, current highlighted.

**Why this beats the alternatives:**
| Model | Verdict |
|-------|---------|
| Bare **percentage bar** | ❌ Hides *what* remains; "63%" doesn't tell a beginner what's left. |
| **Step counter only** | 🟡 Position but no sense of proportion/structure. |
| **Segmented bar + step label** | ✅ Communicates *structure + position + remaining* at a glance — directly answers the product goal ("how much is left / am I progressing"). |
| **Checkpoints** | ✅ Layered on top: section boundaries are save/resume points. |

So: **segmented bar (structure) + step label (position) + checkpoints (resume).** No mid-lesson percentages of correctness (avoids a "grade" feeling).

---

## 4. Interaction Model

- **One primary action per screen:** `Begin` → `Continue` → `Check` → `Got it` → `Next`.
- **Input stages** (dialogue, grammar): passive, advance on `Continue`.
- **Recognition** (vocab, warm-up, review): tap to flip / tap to match.
- **Practice:** answer → `Check` → feedback → `Continue`.
- **Speaking:** free input to Emma, `Skip` always present.
- Feedback is **`aria-live`**, icon+text, non-color-dependent.

---

## 5. Estimated Timings (beginner, A1)

| Metric | Recommendation | Reasoning |
|--------|----------------|-----------|
| **Total duration** | **8–10 min** | Fits the 15–20 min/day persona in one focused session with review headroom; matches the `~10 min` placeholder. |
| **Exercises** | **3–5** | Cover each item once without drill fatigue (LEARNING_PRINCIPLES). |
| **Vocabulary** | **8–12 words** | Substantial yet within working memory; chunk into ≤6 sets. |
| **Grammar concepts** | **1** | One concept per lesson — depth over breadth, avoids interference. |
| **Speaking activities** | **1** (short, optional) | Output consolidates, but heavy early speaking overwhelms beginners. |
| **Interactions total** | **~10–14** | Enough to touch each item; few enough to stay < ~10 min. |

---

## 6. Error Recovery

| Situation | Behavior |
|-----------|----------|
| **Answers incorrectly** | Immediate, kind feedback + correct answer + **why**. No points lost. Option to retry or continue. |
| **Fails repeatedly** (≥2 on one item) | Auto-reveal answer with explanation, flag the item for **extra SRS weighting**, move on — never block (Guided, not Gated). |
| **Skips speaking** | Allowed; the item is still seeded; gentle "you can practice with Emma anytime." |
| **Leaves mid-lesson** | Auto-save at the **last completed checkpoint**; return shows **"Resume where you left off"** + a 1-line recap. *(Dependency: lesson progress persistence — see §9.)* |
| **Returns later** | Resume at checkpoint; brief recap of what was covered; spiral-review nudge. |
| **Loses internet** | Continue on locally-cached content; queue completion + SRS writes; **"Offline — your progress is saved"**; sync on reconnect; never lose work. *(Dependency: offline queue — future.)* |

**Principle:** an error is a teaching moment, never a penalty or a wall.

---

## 7. Mobile Considerations

- **One stage per screen**, vertical sequence — no long scroll.
- **Sticky progress bar (top)** + **sticky primary action (bottom, thumb zone)**.
- **≥44px targets**; vocab flips on tap; big option buttons for exercises.
- **Portrait-first, landscape-tolerant**; typing exercises keep the field above the keyboard.
- **Resumable in ≤10 min** one-handed; checkpoints make interruptions safe.
- Reduced-motion and captions on by capability, not opt-in.

---

## 8. Success Metrics

| Metric | What it tells us | Target signal |
|--------|------------------|---------------|
| **Lesson completion rate** | Does the flow hold learners to the end? | ↑ over time |
| **Per-stage drop-off** | *Where* do learners leave? | No single stage spikes |
| **Resume rate** | Do checkpoints bring people back? | High after mid-lesson exits |
| **Exercise accuracy trend** | Is practice calibrated (not too hard/easy)? | Rising, not floored/ceilinged |
| **Speaking participation** | Is optional output inviting enough? | Healthy opt-in %, no completion penalty for skipping |
| **Time-on-lesson** | Is length right? | Clusters ~8–10 min |
| **Post-lesson review adherence** | Do seeded cards actually get reviewed? | High next-day review rate |
| **Next-lesson start within 24h** | Confidence + momentum proxy | ↑ |

---

## 9. Implementation Dependencies (flagged, not in scope)

The *design* is complete; a fully-confident YES depends on:
1. **Lesson progress persistence** (`progress_pct` / last-checkpoint) for true Resume.
2. **Emma ↔ lesson context** so speaking references the current vocabulary (PRODUCT_AUDIT #4).
3. **Captions/audio** always paired (native audio is a known gap; TTS + text in the interim).
4. **Offline queue** for the internet-loss case.

These are engineering tasks for later sprints; the flow above is authored to degrade gracefully without them (skip speaking, restart-not-resume, TTS captions).

---

## 10. Acceptance Answer

> **"Would a first-time learner complete this lesson confidently without external guidance?"**

**Yes.** At every stage the learner can answer, on one screen, *what am I doing, why, how much is left, am I making progress* — there is exactly one obvious action, input always precedes output, errors explain rather than punish, nothing is gated, progress is always visible and resumable, and the lesson ends on a win that names a real new capability. The four items in §9 make it a *robust* yes at scale, but the flow itself yields a confident yes today.
