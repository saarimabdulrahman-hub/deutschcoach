# DeutschFlow — Lesson Wireframes & Interaction Blueprint

**Version:** 1.0
**Last Updated:** 2026-07-12
**Status:** Active — build spec for the lesson experience
**Sprint:** 5.3D (Lesson Interaction Blueprint)
**Governed by:** LESSON_PRINCIPLES.md · LESSON_FLOW.md · PRODUCT_VISION · DESIGN_SYSTEM · UX_GUIDELINES · LEARNING_PRINCIPLES

> This document specifies **every screen** from tapping "Start Lesson" to returning to Learn — layout, states, interactions, transitions, microcopy, and accessibility — in enough detail to build without further clarification. It does **not** prescribe final visual polish (Sprint 5.3F); it uses existing DESIGN_SYSTEM tokens and reuses existing components where they exist.
>
> **Running example throughout:** *A1 · Unit 1 · Lesson 2 — "Introduce yourself"* (topics: greetings, introductions).

---

## PART A — The Lesson Shell (shared by all screens)

Every learning screen renders inside one persistent **Lesson Shell** so the frame never jumps.

```
┌───────────────────────────────────────────┐  ← sticky header (56px)
│ ✕   ▓▓▓▓░░░ · · · ·      Step 3 of 7        │
│     Vocabulary                              │  ← current objective (13px)
├───────────────────────────────────────────┤
│                                             │
│              CONTENT SLOT                   │  ← scrolls; one stage at a time
│         (one idea, minimal scroll)          │
│                                             │
├───────────────────────────────────────────┤  ← sticky footer (safe-area padded)
│ [ ‹ Back ]            [  Continue  → ]      │  ← ONE primary action, thumb zone
└───────────────────────────────────────────┘
```

- **Header (sticky, top):** `✕` exit · **segmented progress bar** · `Step N of 7` · current objective label.
- **Footer (sticky, bottom, thumb zone):** optional `‹ Back` (secondary) + **one** primary CTA.
- **Content slot:** the only region that scrolls; each screen fills it with one focused stage.
- **Max content width** 640px centered on tablet/desktop; full-width on phone.
- Uses `var(--color-*)` tokens, `rounded-2xl/xl`, existing spacing scale only.

### The Progress Model (final)

**Segmented bar + step label + current objective + checkpoints.** No bare percentages.

- **7 segments** = the learning stages: `Warm-up · Dialogue · Vocabulary · Grammar · Practice · Speaking · Review`.
- Segment states: **done** = filled + ✓, **current** = filled + subtle emphasis, **upcoming** = hollow, **skipped** = filled with a dash (speaking, if skipped).
- **Step label:** `Step 3 of 7`. **Objective label:** the human name (`Vocabulary`, and on content title the capability, e.g., "Meet your first German words").
- **Checkpoints** = every segment boundary is a save point (see Resume, Part D).
- Preview/Welcome are *pre-lesson* (bar empty at 0/7); Celebration/Summary/Next are *post-lesson* (bar full, ✓ Complete).

Why: a beginner instantly sees **what stage, why, and how much remains** — the exact question set the product must answer. A percentage would hide structure; a step-only counter would hide proportion.

---

## PART B — Screen-by-Screen Blueprint

Each screen lists: **Goal · Emotion · Wireframe · Hierarchy · Primary/Secondary CTA · Navigation · States (loading/error) · Exit · Transition & animation · Accessibility · Mobile · Confusion → how avoided.** Shared defaults live in Parts C–E; only deviations are repeated.

---

### Screen 1 · Lesson Preview
- **Goal:** Answer "what will I be able to do, why, how long, what's inside" *before* any effort.
- **Emotion:** Curious, oriented, safe.
- **Wireframe**
```
┌───────────────────────────────┐
│ ✕                    (no bar)  │
├───────────────────────────────┤
│ A1 · Unit 1 · ~8 min           │
│ Introduce yourself             │  ← H1 (capability, not "Lesson 2")
│ By the end you'll greet someone│
│ and say your name in German.   │
│                                │
│ In this lesson:                │
│  🗣  A short real dialogue      │
│  📇  8 new words                │
│  ✦  1 pattern: "ich heiße…"    │
│  ✎  A few quick exercises       │
├───────────────────────────────┤
│              [  Start lesson → ]│
└───────────────────────────────┘
```
- **Hierarchy:** capability H1 → one-line outcome → "in this lesson" checklist (icon+label) → CTA.
- **Primary CTA:** `Start lesson →`. **Secondary:** none (exit is `✕`).
- **Navigation:** `✕` → back to Learn (no confirm; nothing started yet). `Start` → Screen 2.
- **Loading:** shell + shimmer for the checklist while `/curriculum/{level}/{id}` resolves.
- **Error:** `ErrorState` ("We couldn't load this lesson." + Try again + Back to Learn).
- **Exit:** immediate (no progress to lose).
- **Transition/anim:** fade-in content 150ms; CTA press → slide-forward to Screen 2.
- **Accessibility:** H1 is the page heading; checklist is a `<ul>`; `✕` `aria-label="Close lesson"`.
- **Mobile:** everything above the fold; CTA sticky bottom.
- **Confusion → avoided:** "Is this the right lesson / am I ready?" → the capability title + duration + contents make scope obvious before committing.

---

### Screen 2 · Warm Welcome (Warm-up)
- **Goal:** Activate prior knowledge with a 2–3 item recall — a guaranteed early win. *(Skipped entirely for Lesson 1 of Unit 1.)*
- **Emotion:** "I already know something" — confident.
- **Wireframe**
```
│ ✕  ▓░░░░░░  Step 1 of 7 · Warm-up │
│ Quick warm-up — you've seen these │
│                                   │
│  Which means "hello"?             │
│   ( Hallo )  ( Danke )  ( Tschüss)│
│                                   │
│ ✓ Nice — that's right!            │  ← inline, non-blocking
│              [ Continue → ]       │
```
- **Hierarchy:** friendly prompt → 2–3 large option chips → gentle feedback → Continue.
- **Primary CTA:** `Continue →` (enabled after an attempt; also enabled if they just want to move on).
- **Navigation:** `Back` hidden (first stage). Correct/incorrect both allow Continue — **never blocks**.
- **Error state:** answering wrong shows a soft "Not quite — it's *Hallo*." No penalty.
- **Exit:** `✕` → Exit Confirm (progress now exists).
- **Transition/anim:** chip tap → checkmark/settle 120ms (respects reduced-motion → instant).
- **Accessibility:** chips are `<button>`s; feedback in `aria-live="polite"`; correctness via ✓/text, not color only.
- **Mobile:** chips full-width stacked, ≥44px.
- **Confusion → avoided:** "Do I have to get it right?" → copy is casual ("you've seen these"), Continue is always available.

---

### Screen 3 · Dialogue (Chunked) — Listen + Read
- **Goal:** Comprehensible input — hear + see the language in a real scenario. This *is* the listening stage.
- **Emotion:** Immersed, slightly stretched but supported (captions).
- **Wireframe**
```
│ ✕  ▓▓░░░░░  Step 2 of 7 · Dialogue │
│ Listen to a first meeting          │
│ ┌────────────────────────────────┐ │
│ │ ▶  ⏸  ↺   Speaking 1 / 5        │ │  ← ReadAloudBar
│ └────────────────────────────────┘ │
│  Anna:  Hallo! Ich heiße Anna.      │  ← current line highlighted
│  Ben:   Hallo Anna, ich bin Ben.    │
│  Anna:  Freut mich!                 │
│         (English on tap)            │
│              [ Continue → ]         │
```
- **Hierarchy:** scene title → audio controls → dialogue lines (current line emphasized) → per-line translation on demand → Continue.
- **Primary CTA:** `Continue →` (available immediately; audio is optional to finish).
- **Secondary:** `Back ‹` (to warm-up). Per-line **"Show English"** toggle.
- **Audio:** reuse `ReadAloudBar` — play / pause / resume / replay, sentence-by-sentence, progress "Speaking 1/5". Captions always visible (never audio-only).
- **Loading:** dialogue text shimmer; audio control disabled until ready.
- **Error:** if audio (TTS) fails → captions remain, a quiet "Audio unavailable — read along" note; lesson still completable.
- **Exit:** Exit Confirm.
- **Transition/anim:** current-line highlight advances with audio; reduced-motion → highlight without scroll animation.
- **Accessibility:** dialogue is an ordered list read in speaker order; audio button `aria-label`; "Show English" is a labelled toggle; playback state announced.
- **Mobile:** audio bar sticky just under header; lines scroll; tap a line to hear/translate it.
- **Confusion → avoided:** "I don't understand the German" → captions + on-tap English + replay remove the fear; nothing is hidden behind comprehension.

---

### Screen 4 · Vocabulary Discovery
- **Goal:** Isolate the 8–12 new words from the dialogue; build recognition; give each word its *why/context*.
- **Emotion:** Collecting, in control ("these are mine now").
- **Wireframe**
```
│ ✕  ▓▓▓░░░░  Step 3 of 7 · Vocabulary │
│ Your first words · Set 1 of 2        │
│ ┌────────────────────────────────┐   │
│ │        ich heiße       🔊        │   │  ← VocabCard (front)
│ │        phrase                    │   │
│ │      (tap to flip)               │   │
│ └────────────────────────────────┘   │
│  ● ○ ○ ○ ○ ○   (card 1 of 6)          │  ← dot pager
│              [ Continue → ]           │
```
- **Hierarchy:** set label ("Set 1 of 2") → one card at a time → dot pager → Continue (enabled after last card seen).
- **Primary CTA:** `Continue →`. **Secondary:** `Back ‹`.
- **Interaction:** tap/Space to flip (German ↔ English + example + 🔊); swipe or dot to move between cards. Words chunked into **sets of ≤6**.
- **Loading:** card skeleton.
- **Error:** if a word's audio fails, card still flips; 🔊 shows disabled.
- **Exit:** Exit Confirm.
- **Transition/anim:** flip 180ms (reduced-motion → cross-fade); card-to-card slide.
- **Accessibility:** card is a button ("Flip card: ich heiße"); flipped state announced; 🔊 labelled; pager conveys "card 1 of 6" to SR.
- **Mobile:** one card fills width; big flip target; swipe + dots.
- **Confusion → avoided:** "How many words?! " → chunked sets + a pager cap the visible load to ≤6; "Am I supposed to memorize now?" → copy: "Just meet them — you'll review later."

---

### Screen 5 · Pattern Discovery (Grammar, inductive)
- **Goal:** Teach **one** pattern by first pointing to it in the dialogue, then naming + explaining it.
- **Emotion:** "Ohhh, I see the rule" — insight.
- **Wireframe**
```
│ ✕  ▓▓▓▓░░░  Step 4 of 7 · Pattern │
│ Did you notice?                   │
│  "Ich heiße Anna" · "ich bin Ben" │  ← lines pulled from the dialogue
│                                   │
│ Saying your name                  │
│  ich heiße …  = my name is …      │
│  ich bin …    = I am …            │
│  Both work. "heiße" is a bit more │
│  formal.                          │
│              [ Got it → ]         │
```
- **Hierarchy:** "Did you notice?" callback → the pattern named → compact table/examples from *this lesson's* words → one-line *why*.
- **Primary CTA:** `Got it →`. **Secondary:** `Back ‹`.
- **States:** static content; error = `ErrorState` if grammar payload missing (rare — skip stage gracefully if absent).
- **Exit:** Exit Confirm.
- **Transition/anim:** the "noticed" lines fade in first, then the rule (staged reveal, 150ms each; reduced-motion → all at once).
- **Accessibility:** one `<h2>`; example table is a real `<table>` with headers; no color-only meaning.
- **Mobile:** single column; table becomes stacked rows if narrow.
- **Confusion → avoided:** "Grammar is scary" → it's framed as *noticing what you already saw*, one rule only, examples are words they just met.

---

### Screen 6 · Guided Practice (intro to practice)
- **Goal:** Bridge from learning to doing — set expectations for practice, deliver the **first, most-supported** exercise with a worked hint available.
- **Emotion:** Ready, a little tested but safe.
- **Wireframe**
```
│ ✕  ▓▓▓▓▓░░  Step 5 of 7 · Practice │
│ Let's try it — no pressure         │
│  1 of 4                            │
│  Complete: "Hallo, ich ___ Anna."  │
│   ( heiße )  ( bin )  ( bist )     │
│   💡 Hint                           │
│              [ Check ]             │
```
- **Hierarchy:** reassuring lead ("no pressure") → item counter "1 of 4" → prompt → answer controls → optional Hint → Check.
- **Primary CTA:** `Check` → becomes `Continue →` after feedback. **Secondary:** `💡 Hint` (reveals a clue, never the full answer first time).
- **Navigation:** `Back ‹` to Pattern.
- **Feedback:** see Screen 7 (shared exercise feedback).
- **Exit:** Exit Confirm.
- **Accessibility:** `aria-live` feedback; Hint is a labelled disclosure.
- **Mobile:** options as full-width buttons; Check sticky bottom; keyboard-safe input.
- **Confusion → avoided:** "What if I'm wrong?" → "no pressure" copy + Hint + non-penalizing feedback established up front.

---

### Screen 7 · Interactive Exercise (the repeating item pattern)
- **Goal:** The reusable exercise screen for items 2..N across the three types (`fill-blank`, `multiple-choice`, `translate`).
- **Emotion:** Engaged; each item a small, winnable challenge.
- **Wireframe (after a wrong answer)**
```
│ ✕  ▓▓▓▓▓░░  Step 5 of 7 · Practice │
│  3 of 4                            │
│  Translate: "I am Ben."            │
│  [ Ich bin Ben._____________ ]     │  ← text input (translate)
│  ✗ Almost — check the word order.  │  ← kind, specific
│  Answer: "Ich bin Ben."            │
│  Why: the verb "bin" comes second. │
│              [ Continue → ]        │
```
- **Hierarchy:** counter → prompt → input/options → **feedback (icon+text)** → answer + *why* on miss → Continue.
- **Primary CTA:** `Check` → `Continue →`. **Secondary:** `💡 Hint` (before checking); `Skip` (rare, allowed).
- **Answer feedback (shared rule):**
  - Correct → `✓ Genau!` + one-line why-it's-right → auto-enable Continue.
  - Incorrect → `✗ Almost` + correct answer + **why** + item flagged for extra SRS weight. **No score, never blocks.**
  - Text answers use **tolerant matching** (case/whitespace/umlaut-fold; accept known alternates) to avoid false negatives.
- **Loading:** input disabled with spinner only while submitting to backend (if server-checked); local checks are instant.
- **Error (network):** "Couldn't save that — we'll retry." Answer still shown locally; write queued.
- **Exit:** Exit Confirm.
- **Transition/anim:** feedback slides in under the item (120ms); next item cross-fades.
- **Accessibility:** feedback `aria-live="assertive"` for correctness; ✓/✗ + text (not color); input has `<label>`; error tied via `aria-describedby`.
- **Mobile:** big option buttons; for `translate`, input stays above the on-screen keyboard; `Check` reachable.
- **Confusion → avoided:** "I typed it right but it says wrong" → tolerant matching + the shown correct answer prevent frustration; "why is it wrong?" → the *why* line teaches.

---

### Screen 8 · Speaking Practice (Emma) — optional
- **Goal:** Low-stakes production — use the capability in a 2–3 turn guided exchange with Emma; corrections *with reasons*.
- **Emotion:** Braver than expected; supported, not judged.
- **Wireframe**
```
│ ✕  ▓▓▓▓▓▓░  Step 6 of 7 · Speaking │
│ Try it with Emma                   │
│  Emma: Hallo! Wie heißt du?        │
│  [ type or 🎤 speak … ]            │
│  Suggestions: "Ich heiße …"        │  ← scaffold
│         [ Skip for now ]  [ Send ] │
```
- **Hierarchy:** encouraging title → Emma's prompt → input (type now; 🎤 later) → suggestion scaffold → Skip / Send.
- **Primary CTA:** `Send`. **Secondary (always present):** `Skip for now`.
- **Interaction:** Emma replies with affirmation + gentle correction + *why*; 2–3 turns then "Great — you did it!". **Speaking retry:** an attempt can always be re-sent; skipping never penalizes; the words are seeded regardless.
- **Loading:** typing indicator while Emma responds.
- **Error:** if Emma is unreachable → "Emma's offline right now — you can skip and practice later." Skip advances.
- **Exit:** Exit Confirm.
- **Accessibility:** chat is a log with `aria-live="polite"` for new messages; input labelled; Skip always keyboard-first.
- **Mobile:** input pinned above keyboard; suggestions as tappable chips; Skip visible without scroll.
- **Confusion → avoided:** "I can't speak yet / no mic" → typing works, suggestions scaffold the answer, Skip is always one tap. *(Dependency: Emma receives lesson context — LESSON_FLOW §9.)*

---

### Screen 9 · Mini Review
- **Goal:** Quick recall of *this lesson's* items to consolidate and end effort on wins; seeds the SRS.
- **Emotion:** "I actually remember these" — competent.
- **Wireframe**
```
│ ✕  ▓▓▓▓▓▓▓  Step 7 of 7 · Review │
│ Quick check — 1 of 4              │
│  What's "my name is…"?            │
│   ( ich heiße )  ( ich bin )      │
│   ( freut mich ) ( danke )        │
│  ✓ Yes!                           │
│              [ Continue → ]       │
```
- **Hierarchy:** "quick check" + counter → recognition/recall item → affirming feedback → Continue.
- **Primary CTA:** `Continue →`. **Secondary:** `Back ‹`.
- **Interaction:** 3–5 rapid items, this lesson only; supportive, no penalty. Every completion → `POST /srs/seed-lesson`.
- **Exit:** Exit Confirm (but this late, offer "Finish & save").
- **Accessibility:** same feedback rules as exercises.
- **Mobile:** big options; fast tapping cadence.
- **Confusion → avoided:** "Is this graded?" → framed as a "quick check," celebratory, no score shown.

---

### Screen 10 · Celebration
- **Goal:** Mark the achievement and the moment of closure — *without XP or mascots*.
- **Emotion:** Proud, accomplished, wanting more.
- **Wireframe**
```
│        ▓▓▓▓▓▓▓  ✓ Complete         │
│               🎉                    │
│      Lesson complete!               │
│  You can now introduce yourself.    │  ← names the capability
│  🔥 3-day streak · goal met         │  ← positive only
│              [ See what you learned]│
```
- **Hierarchy:** celebratory mark → **capability achieved** (the point) → positive progress (streak/goal) → CTA to Summary.
- **Primary CTA:** `See what you learned →` (Screen 11). **Secondary:** `Back to Learn`.
- **Exit:** free (lesson saved).
- **Transition/anim:** confetti (reduced-motion → static ✓ + copy). Keep < 1.5s; never block the CTA.
- **Accessibility:** `role="status"` announces "Lesson complete — you can now introduce yourself"; confetti `aria-hidden`.
- **Mobile:** full-screen moment; single CTA.
- **Confusion → avoided:** "Did it save? What did I actually get?" → explicit "complete" + capability statement; Summary is one tap.

---

### Screen 11 · Learning Summary
- **Goal:** Reinforce and make retention tangible — what was learned + where it goes next.
- **Emotion:** Reflective, reassured ("it's not lost").
- **Wireframe**
```
│ ✕                     ✓ Complete   │
│ You learned                        │
│  📇 8 words → added to your reviews │
│  ✦ 1 pattern: ich heiße / ich bin  │
│  🗣 1 dialogue practiced            │
│  5 cards are ready to review       │
│   [ Review now ]   [ Next lesson → ]│
```
- **Hierarchy:** "You learned" → words/pattern/dialogue tally → review handoff (cards seeded) → two clear next actions.
- **Primary CTA:** `Next lesson →`. **Secondary:** `Review now` (→ SRS).
- **Exit:** `✕` → Learn.
- **Accessibility:** list semantics; both CTAs labelled with destinations.
- **Mobile:** two stacked full-width CTAs; primary on top.
- **Confusion → avoided:** "Do I lose these words?" → the "added to your reviews / N ready" line makes the SRS handoff explicit.

---

### Screen 12 · Next Lesson (return)
- **Goal:** Convert momentum into the next session or a graceful return to Learn.
- **Emotion:** Momentum, agency.
- **Wireframe**
```
│           Up next                  │
│  A1 · Unit 1 · Lesson 3            │
│  Order a coffee   ~8 min          │
│   [ Start next lesson → ]          │
│   [ Back to Learn ]               │
```
- **Hierarchy:** "Up next" → next capability + duration → one primary CTA → return link.
- **Primary CTA:** `Start next lesson →` (→ Screen 1 of the next lesson). **Secondary:** `Back to Learn`.
- **Empty/edge:** if it was the last lesson in the unit/level → "You finished Unit 1! " + `Back to Learn` primary.
- **Accessibility:** headings + labelled CTAs.
- **Mobile:** thumb-zone primary; return secondary below.
- **Confusion → avoided:** "What now?" → one recommended next capability, or a clean exit; never a dead end.

---

## PART C — Interaction Blueprint (global rules)

| Rule | Specification |
|------|---------------|
| **Tap behaviour** | One primary action per screen; whole option chips/cards are tappable (≥44px); no double-tap needed; no accidental-destructive taps. |
| **Keyboard shortcuts** | `Enter`/`Space` = primary CTA / flip / select focused option; `←/→` = prev/next card (vocab); `Esc` = exit (→ confirm); `1–4` optionally select options. Nothing is keyboard-only-inaccessible. |
| **Focus management** | On each screen transition, focus moves to the new screen's `<h1>/<h2>`; on feedback, focus stays on the input, feedback announced via live region; modal (exit confirm) traps focus and restores on close. |
| **Screen-reader flow** | Header progress announced as `Step 3 of 7, Vocabulary` via `aria-current`; content read top-down in learning order; feedback via `aria-live` (polite for info, assertive for correctness). |
| **Audio controls** | Play / pause / resume / replay (reuse `ReadAloudBar`); sentence-level for dialogue, word-level for vocab; captions always present; audio never required to advance. |
| **Replay** | Replay is always one tap from where audio lives; replaying never resets progress. |
| **Skip** | Speaking and individual practice items are skippable; skipping advances progress (marked "skipped") and never penalizes; core input stages (dialogue/vocab) advance via Continue, not skip. |
| **Resume** | On leave, save the **last completed checkpoint** (segment). On return: "Resume where you left off" → re-enter at that segment with a 1-line recap; "Start over" is available. *(Needs backend last-checkpoint/`progress_pct`.)* |
| **Offline** | Cached lesson content stays usable; completion + SRS writes **queue locally** and sync on reconnect; banner: "Offline — your progress is saved." No work lost. |
| **Speaking retry** | Any turn can be re-sent; Emma re-prompts kindly; skipping is always available; seeding happens regardless of speaking. |
| **Answer feedback** | Correct → `✓` + affirm + brief why; Incorrect → `✗` + correct answer + why + SRS flag; tolerant text matching; never a score, never a block, always via icon+text. |
| **Progress saving** | Autosave at each checkpoint and on every answer; celebration only after `seed-lesson` succeeds (or is queued). |

---

## PART D — Navigation & Transition Rules

- **Forward** is always the sticky primary CTA. **Backward** is the header/footer `‹ Back` (to the previous segment) — never loses forward progress within a segment.
- **Exit (`✕` / `Esc`):** if any progress exists → **Exit Confirm** sheet: *"Leave lesson? Your progress is saved — you can pick up right here."* [ Keep learning ] (primary) / [ Leave ] (secondary). Preview screen exits with no confirm.
- **Transitions:** horizontal slide-forward / slide-back between stages (200ms, ease-out) so motion encodes direction; the **progress bar animates a step** on each forward move to reinforce advancement. **Reduced-motion** → instant cross-fade, no slide, progress updates without animation.
- **No abrupt full-page reloads:** the shell persists; only the content slot swaps.
- **Never a dead end:** every terminal state (error, offline, last-lesson) offers a labelled next action.

---

## PART E — Microcopy Library

*Tone: encouraging, concise, beginner-first, sentence case, no jargon, no guilt.*

| Context | Copy |
|---------|------|
| **Welcome / Preview** | "By the end you'll greet someone and say your name in German." · "In this lesson: a short dialogue, 8 words, one pattern." |
| **Warm-up** | "Quick warm-up — you've seen these." · "Nice, that's right!" · "Not quite — it's *Hallo*." |
| **Dialogue** | "Listen to a first meeting." · "Tap any line to hear it again or see the English." |
| **Vocabulary** | "Just meet these words — you'll review them later." · "Set 1 of 2." · "Tap to flip." |
| **Pattern** | "Did you notice? You already saw this." · "Both work — *heiße* is a bit more formal." |
| **Hints** | "💡 Think about which word means 'am'." · "It starts with *h*…" |
| **Errors (answer)** | "Almost — the verb comes second." · "Close! It's *Ich bin Ben*." · "Here's why: …" |
| **Errors (system)** | "Couldn't load this lesson." · "Audio's unavailable — read along instead." · "Offline — your progress is saved." |
| **Success (item)** | "Genau! ✓" · "Perfect." · "You've got it." |
| **Speaking encouragement** | "Try it with Emma — mistakes are how you learn." · "No mic? Just type." · "You can skip and practice anytime." |
| **Lesson completion** | "Lesson complete! You can now introduce yourself." · "8 words added to your reviews." · "Up next: order a coffee." |
| **Exit confirm** | "Leave lesson? Your progress is saved — pick up right here." |

---

## PART F — Mobile Behaviour (consolidated)

- **One stage per screen**, vertical, minimal scroll; the decision is always visible without scrolling.
- **Sticky header progress** (top) + **sticky primary CTA** (bottom, safe-area inset, thumb zone).
- **≥44px** targets; options and cards are full-width buttons; vocab flips on tap, pages on swipe.
- **Keyboard-aware:** `translate` inputs and the speaking field stay above the on-screen keyboard.
- **Portrait-first, landscape-tolerant:** in landscape, header condenses to a thin bar; content centers at 640px.
- **Interruptible:** every checkpoint is a safe pause; resuming takes ≤1 tap.

---

## PART G — Component Inventory

**Reuse (exists):** `ReadAloudBar` (audio), `VocabCard` (flip), `LessonViewer`/`DialogueBlock` (content), `ErrorState`, `Skeleton`/`.shimmer`, `Icons`, existing DESIGN_SYSTEM tokens.

**New (named here; built in a later sprint):**
| Component | Role |
|-----------|------|
| `LessonShell` | Sticky header (progress+exit) + content slot + sticky footer CTA; owns transitions. |
| `ProgressSegments` | The 7-segment bar + step + objective + checkpoint states. |
| `ExitConfirmSheet` | Leave-lesson confirmation (focus-trapped). |
| `LessonPreview` | Screen 1. |
| `WarmUpItem` | Screen 2 recall chips. |
| `PatternCard` | Screen 5 grammar (callback + rule + table). |
| `ExerciseItem` + `AnswerFeedback` | Screens 6–7 (three exercise types + shared feedback + tolerant matching). |
| `SpeakingPanel` | Screen 8 Emma exchange + Skip + suggestions. |
| `MiniReviewItem` | Screen 9. |
| `CelebrationView` | Screen 10 (reduced-motion aware). |
| `LearningSummary` | Screen 11 (learned tally + SRS handoff). |
| `NextLessonCard` | Screen 12. |
| `LiveRegion` | Shared `aria-live` announcer for feedback/progress. |

---

## PART H — Design Rationale (why this shape)

1. **Shell + one-stage-per-screen** makes every screen answer *what/why/next* with a single action — the product's core requirement — and keeps cognitive load minimal (LESSON_PRINCIPLES §5).
2. **Segmented progress + checkpoints** communicates structure and "how much is left" without a grade-like percentage, and enables safe pause/resume (mobile reality).
3. **Input → recognition → guided practice → production → review** is the confidence-monotonic arc from LESSON_FLOW; screens are ordered to never demand output before the tools exist.
4. **Errors teach, never punish; nothing gates** — realized as tolerant matching, reveal-with-why, always-available Skip/Continue (Guided, not Gated).
5. **Accessibility and mobile are structural, not add-ons** — captions, icon+text status, live regions, thumb-zone CTAs, ≥44px are specified per screen.
6. **No XP, timers, or mascots** — motivation is capability + visible progress + positive streak, per PRODUCT_VISION.

---

## PART I — Success Answer

> **"Could another engineer build the complete lesson experience from this document without additional clarification?"**

**Yes.** The document specifies, for all 12 screens: layout (wireframes), hierarchy, primary/secondary actions, navigation, loading/error/exit states, transitions with reduced-motion fallbacks, accessibility (keyboard, SR, live regions, captions, non-color status), mobile behaviour, exact microcopy, the progress model, global interaction rules (tap/keyboard/focus/audio/skip/resume/offline/feedback/save), and a named component inventory that maps to existing + new pieces.

**Two backend capabilities are called out as dependencies** (last-checkpoint/`progress_pct` for true Resume; Emma-with-lesson-context for Speaking) — both have specified graceful fallbacks (restart-not-resume; type/skip), so an engineer can build the full front-end experience today and light up Resume/Emma-context when those endpoints land.
