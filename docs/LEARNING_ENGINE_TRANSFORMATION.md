# DeutschFlow Learning Engine Transformation Plan

> From a Beautiful Language App → A World-Class Language Learning Platform
>
> Version: 2.0 (Comprehensive)
> Status: Planning Phase
> Priority: Critical

---

## Table of Contents

1. [Vision & Principles](#1-vision--principles)
2. [Business Objectives](#2-business-objectives)
3. [Learning Philosophy](#3-learning-philosophy)
4. [Current State & Core Problems](#4-current-state--core-problems)
5. [Architecture Overview](#5-architecture-overview)
6. [Phase 0 — Quick Wins (Weeks 1–2)](#6-phase-0--quick-wins-weeks-1-2)
7. [Phase 1 — Interactive Learning Foundation (Weeks 3–8)](#7-phase-1--interactive-learning-foundation-weeks-3-8)
8. [Phase 2 — Lesson Engine Redesign (Weeks 9–16)](#8-phase-2--lesson-engine-redesign-weeks-9-16)
9. [Phase 3 — AI-Assisted Learning (Weeks 5–20, Cross-Cutting)](#9-phase-3--ai-assisted-learning-weeks-5-20-cross-cutting)
10. [Phase 4 — Adaptive Learning Intelligence (Weeks 17–24)](#10-phase-4--adaptive-learning-intelligence-weeks-17-24)
11. [Phase 5 — Premium Learning Experience (Weeks 25–36)](#11-phase-5--premium-learning-experience-weeks-25-36)
12. [Cross-Cutting Concerns](#12-cross-cutting-concerns)
13. [Product Milestones](#13-product-milestones)
14. [What We Are NOT Building](#14-what-we-are-not-building)
15. [Prioritization Within Phases](#15-prioritization-within-phases)
16. [Definition of Success Per Phase](#16-definition-of-success-per-phase)
17. [Lesson Architecture](#17-lesson-architecture)
18. [Grammar SRS](#18-grammar-srs)
19. [Effort Estimates & Risk Register](#19-effort-estimates--risk-register)
20. [Success Metrics](#20-success-metrics)
21. [Final Outcome](#21-final-outcome)

---

## 1. Vision & Principles

### Vision

DeutschFlow already delivers a premium visual experience. The next evolution is to transform it into a platform that not only looks exceptional but also teaches German in a way that is engaging, interactive, memorable, and scientifically grounded.

**The objective is not to redesign the UI. The objective is to redesign how learning happens.**

### Design Principles

#### 1. Audio First
The learner should hear German *before* reading German whenever possible. Audio is the first experience; text is reinforcement.

#### 2. Interaction First
Every learning concept must be immediately followed by an interaction. No concept exists without practice.

#### 3. Learn by Doing
Replace passive reading with active participation: listening, clicking, matching, speaking, typing, ordering, translating, repeating.

#### 4. Progressive Difficulty
Each lesson gradually increases difficulty: Easy → Easy → Medium → Medium → Hard. Never overwhelm beginners immediately.

#### 5. Immediate Reinforcement
Every newly introduced word or grammar rule reappears within the same lesson. No concept disappears after being introduced.

#### 6. Continuous Feedback
Learners receive feedback constantly — not only at the end of the lesson.

### Desired Learning Flow

```
Listen → Observe → Interact → Practice → Receive Feedback → Recall → Speak → Master
```

Every stage requires learner participation.

---

## 2. Business Objectives

Before any feature decisions, define what success means for the business. These objectives are the north star for every technical and design choice in this plan.

### 2.1 Primary Goals (12-month horizon)

| Objective | Current Baseline | Target | How We Measure |
|-----------|-----------------|--------|---------------|
| Lesson completion rate | Unknown | ≥75% | `lesson_completed` / `lesson_started` |
| Daily active users / sessions per week | Unknown | ≥4 sessions/week | Analytics pipeline (Phase 0) |
| 30-day learner retention | Unknown | ≥40% | Users with ≥1 session in days 28–30 |
| Speaking practice adoption | Unknown | ≥30% of active users attempt ≥1 speaking exercise/week | Speaking stage starts |
| Beginner abandonment (first 3 days) | Unknown | ≤40% | Users who start ≥1 lesson but don't return within 3 days |

### 2.2 Secondary Goals

- Reduce time from A1 start → A2 readiness by 20%
- Achieve average app store rating ≥4.5 (currently unrated)
- Establish measurable improvement in learner pronunciation vs baseline

### 2.3 How Objectives Drive Decisions

Every feature in this plan can be traced back to at least one objective. For example:
- **Interactive dialogue** → lesson completion rate, beginner abandonment
- **Pronunciation feedback** → speaking practice adoption, pronunciation improvement
- **Neural TTS in Phase 0** → beginner abandonment (audio quality affects first-impression retention)
- **Analytics in Phase 0** → enables all other objectives to be measured

If a proposed feature doesn't serve a business objective, it's deprioritized.

---

## 3. Learning Philosophy

### 3.1 DeutschFlow's Teaching Philosophy

> We don't teach German. We create the conditions for learners to acquire it.

Our pedagogy follows a universal learning arc:

```
Observe → Listen → Repeat → Understand → Practice → Recall → Speak → Master
```

Every lesson, every interaction, every review session adheres to this flow. It is not a suggestion — it is the structural backbone of the platform.

### 3.2 What This Means For Each Phase

| Stage | Learner Action | Platform's Job |
|-------|---------------|---------------|
| **Observe** | See the language in context (dialogue, sentence) | Present authentic examples |
| **Listen** | Hear the sounds, rhythm, intonation | Audio-first delivery |
| **Repeat** | Mimic sounds (shadowing, speaking) | Provide clear model + recording |
| **Understand** | Grasp meaning and structure | Translation, grammar discovery |
| **Practice** | Use the language actively | Exercises, checkpoints, games |
| **Recall** | Retrieve from memory | SRS review, mini review |
| **Speak** | Produce language freely | Conversation simulator, Emma chat |
| **Master** | Automatic, confident use | Adaptive recycling, spaced mastery |

### 3.3 Educational Identity

DeutschFlow is:
- **Structured** — CEFR-aligned, progressive difficulty, clear milestones
- **Interactive** — no passive reading, every concept practiced immediately
- **Patient** — hints before answers, discovery before explanation, unlimited attempts
- **Personal** — adapts to each learner's weak points, Emma as companion
- **Audio-rooted** — listening before reading, pronunciation at every step

DeutschFlow is NOT:
- A textbook on a screen
- Gamification without learning substance
- One-size-fits-all lessons

---

## 4. Current State & Core Problems

### 4.1 What Already Works

- Beautiful UI/UX
- Well-organized lesson structure (CEFR levels, units)
- AI tutor (Emma) in chat
- Vocabulary management
- CEFR progression
- Quiz system (5 modes)
- SM-2 spaced repetition (vocabulary only)
- SRS stats and review overview
- Vocabulary cards with IPA and listen

### 4.2 Core Problem

Learning is **passive**. Lessons are rendered markdown — the learner reads instead of interacts. Grammar is explained, not experienced. Pronunciation support only covers ~30 hardcoded words. Audio is an optional enhancement, not a core teaching tool.

### 4.3 Learning Gaps Identified

| Gap | Severity | Current State |
|-----|----------|---------------|
| Passive lessons | Critical | Content consumed, not interacted with |
| Weak pronunciation | Critical | ~30 words have guides; hundreds don't |
| Grammar is informational | High | Text + tables, no discovery or practice |
| Too few exercises | High | 2–3 per lesson vs 8–10 needed |
| No learning checkpoints | High | One bulk "Complete" action at the end |
| Audio is optional | High | Browser TTS only, no native recordings |
| No vocabulary recycling | Medium | Words from lesson 1 never appear in lesson 2. Manual recycling (content rule) costs nothing and can start immediately. |
| No grammar SRS | Medium | Only vocabulary gets spaced repetition |
| No dictation/spelling practice | Medium | German spelling (umlauts, ß, capitals) unaddressed |
| Lesson flow is one long read | High | No alternation between learn and practice |
| No analytics baseline | High | No way to measure whether changes improve outcomes |
| Accessibility gaps | Medium | Screen readers, reduced motion, audio captions not addressed |

---

## 5. Architecture Overview

### 5.1 Core Learning Model (Single Source of Truth)

One architecture diagram saves hundreds of questions later. The entire learning engine is built around this core model:

```
LESSON
├── Metadata (level, unit, order, title)
├── Stages Config (ordered list of stage definitions)
├── Dialogue
│   └── Lines (speaker → text → tokens)
├── Vocabulary
│   └── Entries (german → english → IPA → audio)
├── Grammar Topics (linked by slug)
├── Exercises (type → prompt → answer)
└── Checkpoints (2–3 per lesson, placed between stages)
```

This is the single source of truth. Every feature — lesson renderer, SRS, quiz, adaptive engine, analytics — reads from this model.

### 5.2 Dependency Graph

Strict dependency ordering prevents building things in the wrong sequence:

```
Phase 0 (Quick Wins)
  │
  ▼
Phase 1 (Interactive Foundation)
  Requires: Pronunciation Map, Analytics, Neural TTS
  │
  ▼
Phase 2 (Lesson Engine)
  Requires: Interactive Dialogue, Clickable Vocabulary, Stage Renderer
  │
  ▼
Phase 3 (AI-Assisted)
  Requires: Stage Renderer, Checkpoints, Grammar Discovery
  │
  ▼
Phase 4 (Adaptive)
  Requires: Confidence Engine, Grammar SRS, Analytics Pipeline
  │
  ▼
Phase 5 (Premium)
  Requires: Everything above
```

### 5.3 Data Architecture

Key tables and their relationships:

```
users
  │
  ├── lesson_sessions          (per-session progress, links to stages)
  ├── checkpoint_results       (per-checkpoint scores per session)
  ├── word_interactions        (clicks, taps, listens — analytics)
  │
  ├── srs_cards                (vocabulary SM-2 scheduling)
  ├── grammar_cards            (grammar concept SM-2 scheduling)
  ├── concept_confidence       (unified confidence score: vocab + grammar)
  │
  ├── analytics_events         (Phase 0 instrumentation)
  ├── user_achievements
  ├── daily_missions + mission_progress
  │
  └── emma_cache               (cached grammar explanations, hints)
```

### 5.4 AI Strategy — Where AI Is Used vs Deterministic Logic

Not everything needs an LLM. This table defines where AI adds value and where deterministic logic is cheaper, faster, and more reliable.

| Feature | Approach | Why |
|---------|----------|-----|
| Translation | Deterministic (vocab lookup) | Pre-defined, fast, offline-capable |
| IPA generation | Deterministic (epitran + lookup) | LLM is unreliable for consistent IPA |
| Hint system (grammar discovery) | LLM (Emma) | Needs contextual understanding of learner's mistake |
| Pronunciation feedback (Phase 3) | LLM (stopgap) | "Good" / "Try again" — cheap, good enough |
| Pronunciation scoring (Phase 5) | Speechace (deterministic) | Phoneme-level accuracy requires dedicated engine |
| Exercise generation | Deterministic (templates) | Pre-written exercises are higher quality than LLM-generated |
| Lesson content creation | LLM-assisted | LLM drafts stages_config → human reviews (see §5.5) |
| Personalization (Phase 4) | Deterministic (confidence scores) | Math is simpler and more transparent than an LLM deciding |
| Conversation (Emma chat) | LLM | Core use case — requires natural language understanding |
| Encouragement messages | LLM | Low cost, high value, no accuracy requirements |

### 5.5 Content Pipeline (How New Lessons Are Created)

For every future lesson (not migration), the pipeline is:

```
Author writes markdown
       │
       ▼
Validation script checks:
  ✓ Frontmatter complete
  ✓ Minimum vocabulary count (≥6)
  ✓ At least 1 dialogue
  ✓ At least 2 checkpoints
  ✓ At least 8 exercises
  ✓ Grammar topics referenced exist
       │
       ▼
Stage Generator (LLM) parses markdown → draft stages_config
       │
       ▼
Human Review (editor)
  ✓ Stage ordering correct
  ✓ Checkpoint questions well-written
  ✓ Difficulty progression feels right
       │
       ▼
QA (automated + manual)
  ✓ All stages render
  ✓ All audio files exist
  ✓ All vocab links resolve
  ✓ Mobile responsive
       │
       ▼
Production (behind feature flag → gradual rollout)
```

### 5.6 Content Standards (Per-Lesson Rules)

Every lesson must satisfy these minimum requirements:

```
✓  6–10 vocabulary words
✓  1 dialogue (min. 6 speaker lines)
✓  2 checkpoints (3 questions each)
✓  1 pronunciation activity
✓  1 grammar discovery (or direct explanation for low-suitability topics)
✓  8–10 exercises (mix of fill, match, translate, order)
✓  1 speaking activity
✓  1 lesson recap / summary
✓  ≥3 recycled vocabulary items from the prior lesson (manual spiral review)
```

These are enforced by the validation script in the content pipeline. A lesson cannot ship without meeting every requirement.

---
## 6. Phase 0 — Quick Wins (Weeks 1–2)

> High-impact, low-effort fixes that deliver immediate value while the larger architecture is being built.

#### Content Rule: Manual Vocabulary Recycling

Starting in Phase 0 content work, every new or migrated lesson follows a content rule:

> **Each lesson's dialogue must reuse ≥3 vocabulary items from the immediately preceding lesson.**
> **Each lesson's guided practice must reference ≥1 concept (vocab or grammar) from a lesson at least 2 units back.**

This rule costs zero engineering — it's enforced during editorial review. It ensures intentional spiral review from day 1, before any adaptive engine exists. The automated/adaptive version remains in Phase 4.

### 6.1 Universal Pronunciation Guide

| Item | Detail |
|------|--------|
| **Problem** | Pronunciation guide exists for ~30 hardcoded words |
| **Solution** | Auto-generate pronunciation for all vocabulary at build time |
| **Approach** | Script that reads all vocab, generates IPA (via epitran) + beginner pronunciation (via rules), writes to a JSON lookup table |
| **Backend** | `scripts/generate_pronunciation.py` — run once, output `web/public/pronunciation-map.json` |
| **Frontend** | `VocabCard` reads from the map instead of hardcoded `getIpa()`/`getBeginnerPron()` objects |
| **Effort** | 1 day |
| **Impact** | Every word in every lesson gets pronunciation help immediately |

### 6.2 More Exercises Per Lesson

| Item | Detail |
|------|--------|
| **Problem** | 2–3 exercises per lesson |
| **Solution** | Add 5–7 more exercises to each lesson markdown file |
| **Approach** | Add fill-blank, multiple-choice, translate, match, reorder exercises to all 5 A1 lessons |
| **Backend** | No changes — exercises are stored as JSON in the Lesson model |
| **Frontend** | ExerciseCard already handles multiple types; may need minor rendering tweaks |
| **Effort** | 2 days |
| **Impact** | More practice = better retention, immediately |

### 6.3 Click-to-Speak on Any German Word

| Item | Detail |
|------|--------|
| **Problem** | Only vocab cards and dialogue lines have audio buttons |
| **Solution** | Make any German word clickable for pronunciation throughout lesson content |
| **Approach** | `renderInline` already handles inline markup; add `.german-word` class that hooks into `useWordSpeech` on click; auto-detect German text via regex |
| **Frontend** | New `ClickableText` wrapper component |
| **Effort** | 1 day |
| **Impact** | Learners can hear any word instantly |

### 6.4 Reveal Exercise Answers Inline

| Item | Detail |
|------|--------|
| **Problem** | Exercises require clicking "Reveal Answer" |
| **Solution** | Already partially done; add keyboard shortcut (Space) and auto-reveal after 3 wrong attempts |
| **Frontend** | Minor ExerciseCard enhancement |
| **Effort** | 0.5 day |

### 6.5 Neural TTS Audio Bridge

> Pull a slice of Phase 5 forward. Browser TTS is poor for German (compound words, umlauts, intonation). Neural TTS bridges the 24-week gap until native recordings arrive.

| Item | Detail |
|------|--------|
| **Problem** | Browser speech synthesis sounds robotic and mispronounces compound German words (Entschuldigung, Geschwister). "Audio First" principle is undermined for ~6 months. |
| **Solution** | Pre-generate neural TTS audio files for all curriculum vocabulary using ElevenLabs or OpenAI tts-1 |
| **Cost** | ~$1.50 for A1 vocab (1000 words × 2s avg via ElevenLabs Turbo). ~$10 for full A1–C1. |
| **Pre-gen time** | ~4 minutes for A1 using ElevenLabs Turbo API |
| **Storage** | ~16 MB for A1 (Opus 64kbps), ~80 MB for full curriculum |
| **Approach** | The Phase 0 pronunciation script also calls ElevenLabs API → saves MP3 to `public/audio/{word}.mp3` |
| **Backend** | `scripts/generate_audio.py` — reads vocab list, calls TTS API, writes audio files |
| **Frontend** | `AudioService` gets a three-tier fallback chain (see below) |
| **Effort** | 1 day (script) + $1.50 API cost |
| **Impact** | Every word has near-native audio from day 1 instead of day 180 |

#### Three-Tier Audio Fallback Chain

The `AudioService` tries each tier in order, falling through on failure:

```
Tier 1:  Pre-generated neural MP3  → public/audio/{word}.mp3
Tier 2:  Browser TTS (any voice)   → window.speechSynthesis
Tier 3:  No audio (graceful degradation)
```

When native recordings arrive in Phase 5, they sit at Tier 0 without any frontend changes.

### 6.6 Phase 0 Deliverables Summary (Revised)

| Deliverable | Effort | Backend | Frontend |
|-------------|--------|---------|----------|
| Universal pronunciation map | 1 day | `generate_pronunciation.py` | VocabCard reads JSON map |
| Neural TTS audio files | 1 day | `generate_audio.py` + $1.50 API | AudioService three-tier fallback |
| More exercises per lesson | 2 days | — | Minor ExerciseCard tweaks |
| Click-to-speak on words | 1 day | — | `ClickableText` component |
| Exercise answer UX | 0.5 day | — | ExerciseCard enhancement |
| **Total** | **5.5 days + $1.50** | | |

---

## 7. Phase 1 — Interactive Learning Foundation (Weeks 3–8)

> Transform static lesson content into interactive learning materials.

### 7.1 What We're Building

#### Interactive Dialogue System
- Dialogue lines become individual interactive blocks
- Tap any word for translation + pronunciation
- Hide/reveal speaker sides for recall practice
- Comprehension check after each dialogue section

#### Clickable Vocabulary
- Every German word in lesson content is clickable
- Click shows: English translation, IPA, audio button, example sentence
- Inline popover, not a modal

#### Improved Text-to-Speech
- Browser speech synthesis with voice selection (prefer German voices)
- Slow-playback mode (0.5x speed)
- Listen-before-reading toggle (hide text until audio plays)

#### IPA + Pronunciation for All Words
- Pronunciation map from Phase 0 becomes the foundation
- Frontend service to look up any word, with fallback TTS

### 7.2 Backend Track

| Item | Detail |
|------|--------|
| **New tables** | `word_interactions` (track which words a user tapped/clicked for analytics) |
| **New endpoints** | `POST /vocab/lookup` (batch word lookup: translation, IPA, audio) |
| **Migration** | `add_word_interactions_table` |
| **Existing changes** | None to lesson or vocab models |

### 7.3 Frontend Track

| Component | What Changes |
|-----------|-------------|
| `LessonViewer.tsx` | Dialogue lines become interactive blocks with tap-to-translate, hide/reveal |
| `DialogueBlock` | New role-play mode, comprehension check after dialogue |
| `ClickableText` | New component — wraps any German word with click handler |
| `WordPopover` | New component — inline popover with translation, IPA, audio |
| `AudioService` | New service — TTS with voice selection, slow mode, queue management |
| `ListenBeforeRead` | New component — toggle that hides text until audio finishes |

### 7.4 Deliverables

| Deliverable | Priority | Backend | Frontend |
|-------------|----------|---------|----------|
| Interactive dialogue blocks | Must have | — | DialogueBlock refactor |
| Tap-to-translate + pronounce | Must have | `POST /vocab/lookup` | ClickableText + WordPopover |
| Improved TTS with slow mode | Must have | — | AudioService |
| Listen-before-reading mode | Must have | — | ListenBeforeRead component |
| Word interaction tracking | Nice to have | `word_interactions` table | ClickableText → POST analytics |

### 7.5 Success Criteria

- Learner can complete an entire dialogue without reading static paragraphs
- Every German word on the page is clickable for translation + audio
- Slow-playback works and is clearly discoverable
- Pronunciation guide exists for every word in the curriculum

---

## 8. Phase 2 — Lesson Engine Redesign (Weeks 9–16)

> Transform lessons from one long read into a guided experience with alternating learn/practice cycles.

### 8.1 Lesson Architecture — Modular Stages

Lessons no longer follow a rigid 15-step structure. Instead, each lesson selects stages based on its content type:

| Lesson Type | Stages (6–10 per lesson) |
|-------------|--------------------------|
| **Dialogue-heavy** (greetings, ordering food) | Listen → Dialogue → Vocab → Pronounce → Role-play → Comprehension Check |
| **Grammar-heavy** (cases, prepositions) | Observe → Discover → Explain → Practice → Apply → Mini Review |
| **Vocabulary-heavy** (numbers, colors, family) | Listen → See → Hear → Match → Type → Recall → Speak |
| **Mixed** (default) | Welcome → Objectives → Interactive Dialogue → Vocab Explorer → Checkpoint → Grammar Discovery → Guided Practice → Mini Review → Summary |

**No lesson should exceed 10 stages.** Average target: 7–8.

### 8.2 New Lesson Stage Types

| Stage | Purpose | Interaction Type |
|-------|---------|-----------------|
| **Welcome** | Set objectives, show what you'll learn | Read only |
| **Listen First** | Hear the dialogue before seeing text | Audio only |
| **Interactive Dialogue** | Read + interact with dialogue | Tap, click, reveal |
| **Vocabulary Explorer** | Discover new words in context | Tap, listen, flip |
| **Pronunciation Practice** | Repeat words, get feedback | Speak + listen |
| **Checkpoint** | Quick comprehension check (2–3 questions) | Multiple choice, fill |
| **Grammar Discovery** | Observe pattern → identify → explain → practice | Fill, match, order |
| **Guided Practice** | Apply what you've learned | Translate, complete |
| **Speaking Practice** | Speak German phrases | Record + playback |
| **Mini Review** | 3–5 quick recall questions | Type, match, order |
| **Lesson Summary** | Show score, what you've mastered | Read only |
| **Dictation** | Hear → type what you heard | Type |
| **Dictation (mobile)** | Specialized keyboard helper for ß, ä/ö/ü, and capitalized nouns | Type with autocomplete |

### 8.3 Checkpoints System

Each lesson has 2–3 checkpoints interspersed (after dialogue, after grammar, before summary). Each checkpoint:
- Asks 2–3 questions about content just covered
- Provides immediate feedback (correct/wrong + explanation)
- Records score for lesson mastery calculation

### 8.4 Lesson Mastery Score

After completing a lesson, the learner sees:

```
Score: 85% Mastery
├── Dialogue Comprehension: 90%
├── Vocabulary Recall: 80%
├── Grammar Application: 85%
└── Speaking: — (skipped)
```

Score is calculated from checkpoint performance + exercise accuracy.

### 8.5 Backend Track

| Item | Detail |
|------|--------|
| **New tables** | `lesson_sessions` (track per-session progress), `checkpoint_results` (per-checkpoint scores), `lesson_stage_progress` (which stages completed) |
| **New endpoints** | `POST /lessons/{id}/start` (create session), `POST /lessons/{id}/checkpoint` (submit checkpoint), `POST /lessons/{id}/complete` (finalize + calculate score), `GET /lessons/{id}/mastery` (retrieve score) |
| **Migration** | `add_lesson_session_tables`, `add_checkpoint_results` |
| **Changes** | Lesson model may need `stages_config` JSON field to define which stages a lesson uses |

### 8.6 Frontend Track

| Component | What Changes |
|-----------|-------------|
| `LessonPage` | Replace current single-page render with stage-based router |
| `StageRenderer` | New — renders the current stage component based on stage type |
| `StageNav` | New — progress bar + stage navigation |
| `CheckpointStage` | New — mini-quiz between lesson sections |
| `SummaryStage` | New — mastery score display |
| `DictationStage` | New — hear → type interface |

### 8.7 Grammar Discovery — Specifics

Instead of showing grammar as a text block, learners follow a **discovery method** — encountering the pattern before being told the rule. However, the discovery depth depends on the topic.

#### Discovery Suitability

Not all grammar topics suit discovery equally well. Topics marked low-suitability skip straight to Explanation → Practice:

| Grammar topic | Suitability | Why | Discovery approach |
|---------------|-------------|-----|-------------------|
| Verb conjugation | ★★★★★ | Pattern is highly visible (endings change) | Full discovery |
| Definite articles | ★★★★☆ | Pattern visible but abstract (der/die/das) | Full discovery |
| Sentence position | ★★★☆☆ | Requires understanding clauses | Discovery with hints |
| Preposition cases | ★★☆☆☆ | *mit* + dative, *für* + accusative — no visible pattern | Skip to Explanation → Practice |
| Weak nouns | ★☆☆☆☆ | Exception pattern, needs direct explanation | Skip to Explanation → Practice |

#### Progressive Hint System

For topics that use discovery, an **escape hatch** prevents learner frustration. The learner clicks "Give me a hint" to progress through levels:

| Level | What Emma says |
|-------|---------------|
| **1 — Subtle nudge** | "Look at the ending of *dem* vs *der* — do you see a difference?" |
| **2 — Stronger hint** | "The word after *mit* changed. Compare *der Zug* → *mit dem Zug*" |
| **3 — Direct guidance** | "After *mit*, the masculine article *der* becomes *dem*. This is the dative case." |
| **4 — Full explanation** | Shows the rule card + 2 examples |

Each click reveals more information but never skips the discovery entirely. Learners who want to figure it out themselves can ignore the hint button.

#### Discovery Flow (Steps)

1. **Observe** — Show 3–4 example sentences with the target pattern highlighted
2. **Identify** — "What do you notice about the verb position?" (multiple choice; progressive hint available)
3. **Experiment** — "Try forming a sentence using the pattern" (drag words into order; progressive hint available)
4. **Explanation** — Show the rule (after the learner has tried, or immediately for low-suitability topics)
5. **Practice** — 3–5 quick exercises applying the rule

#### Grammar Discovery Templates

Rather than hand-crafting each discovery flow, define reusable **templates** parameterized by the grammar topic:

| Template | Used For | Flow |
|----------|---------|------|
| **declension** | Articles, adjectives, pronouns | Show 4 sentences with different cases → learner identifies which case each uses |
| **conjugation** | Regular verbs, sein/haben, modals | Show pronoun + verb pairs → learner matches correct ending |
| **position** | Verb position, time-manner-place | Show scrambled sentences → learner orders correctly |
| **comparison** | Comparative/superlative, adjective endings | Show two versions → learner picks correct one |

New lessons just reference a template + topic slug. The interactive exercise is auto-generated.

#### Grammar Discovery + Emma Integration

Emma appears at three points:
- **Hint button** (steps 2–3): progressive hints via the 4-level system
- **Explanation** (step 4): Emma explains the rule in conversational language, not textbook prose
- **Practice** (step 5): After a wrong answer, Emma gives targeted feedback specific to the error

### 8.8 Deliverables

| Deliverable | Priority | Backend | Frontend |
|-------------|----------|---------|----------|
| Stage-based lesson renderer | Must have | — | StageRenderer + StageNav |
| Checkpoint system | Must have | checkpoint tables + endpoints | CheckpointStage |
| Grammar discovery flow | Must have | — | 5-step grammar component |
| Lesson mastery score | Must have | score calculation + persistence | SummaryStage |
| Modular stage config | Must have | `stages_config` on Lesson model | StageRenderer reads config |
| Dictation stage | High | — | DictationStage |
| Lesson session tracking | High | `lesson_sessions` table | StageRenderer → POST |

### 8.9 Success Criteria

- Every lesson alternates between learning and practice (never >3 consecutive reading stages)
- Checkpoints appear at least twice per lesson
- Mastery score is shown at lesson completion
- Grammar discovery replaces text-only grammar explanations

---

## 9. Phase 3 — AI-Assisted Learning (Weeks 5–20, Cross-Cutting)

> Emma integration is not a separate phase — it's an infrastructure layer that runs through all phases. Integration starts in Phase 1 and deepens with each phase.

### 9.1 Emma's Role Per Phase

| Phase | Emma Integration |
|-------|-----------------|
| Phase 0 | No change (Emma stays in chat) |
| Phase 1 | Word popovers include "Ask Emma" button → Emma explains the word in context |
| Phase 2 | Checkpoint hints come from Emma; grammar discovery "Explain" step uses Emma; mastery summary includes Emma encouragement |
| Phase 3 (this) | Full lesson-level Emma: proactive tips, pronunciation feedback, personalized encouragement |
| Phase 4 | Adaptive hints based on learner's weak words |
| Phase 5 | Conversation simulator with Emma as interlocutor |

### 9.2 Phase 3 Deliverables

| Deliverable | Detail | Backend | Frontend |
|-------------|--------|---------|----------|
| Emma hint API | `POST /emma/hint` — given lesson context + learner question, return hint | New endpoint in `emma.py` | Hints appear in contextual tooltip |
| Emma pronunciation feedback (stopgap) | `POST /emma/pronounce` — given text + learner's audio, LLM-based feedback on accuracy | Audio capture + LLM eval | SpeakingStage records audio |
| Emma encouragement engine | `POST /emma/encourage` — given checkpoint score, return encouragement | New endpoint | Shown after checkpoints and at summary |
| Emma grammar explainer | `POST /emma/explain-grammar` — given topic slug, return learner-friendly explanation | New endpoint (can cache responses) | "Ask Emma" button on grammar stages |

### 9.3 Integration Points

| Location | How Emma Appears |
|----------|-----------------|
| Word popover | "Ask Emma: how is this word used?" |
| Checkpoint | After wrong answer: "Need a hint? → Emma's hint" |
| Grammar discovery | Step 4 (Explanation): Emma explains the rule in conversational language |
| Lesson summary | Emma gives personalized encouragement + tips |
| Speaking practice | Emma rates pronunciation (basic: "Good!" / "Try again") |

### 9.4 Technical Note: Caching

Grammar explanations and common hints should be cached aggressively. Many learners will ask about the same grammar points. Use a `emma_cache` table keyed by `(topic_slug, cefr_level)` to avoid redundant LLM calls.

### 9.5 Pronunciation Feedback: Stopgap vs Permanent

Phase 3 ships an LLM-based pronunciation check (transcribe audio → ask LLM "did they pronounce this correctly?"). This is a **temporary stopgap**, not a permanent feature. It is "good enough" when:

- It correctly identifies complete mispronunciations (e.g., "ch" said as "k" in *ich*)
- It gives binary feedback ("Good!" / "Try again — focus on the 'ch' sound")
- Latency is under 3 seconds per evaluation

This is NOT designed for phoneme-level accuracy. That arrives in Phase 5 via Speechace (or equivalent). The Phase 5 version replaces the Phase 3 version entirely — the frontend SpeakingStage swaps the LLM call for the Speechace call behind the same interface. No UI changes needed.

**Investment gating:** Phase 5 Speechace integration ($5K+ cost + API integration) is only greenlit if:
1. Phase 3's LLM version achieves >80% user satisfaction in post-task surveys
2. At least 30% of active users attempt at least one speaking exercise per week
3. LLM-based pronunciation feedback has measurable impact on checkpoint pass rates

### 9.6 Success Criteria

- Emma appears in at least 3 touchpoints per lesson (not just chat)
- Learners can ask Emma for help without leaving the lesson
- Emma's hints improve checkpoint pass rates (measurable)

---

## 10. Phase 4 — Adaptive Learning Intelligence (Weeks 17–24)

> Make lessons adapt to learner performance. Phase 4 expands from "weak words" to **weak concepts** — covering both vocabulary AND grammar.

### 10.1 What We're Building

#### Weak Concept Injection (Vocab + Grammar)
- During vocab explorer, guided practice, and grammar practice stages, inject concepts the learner has previously struggled with
- **Vocabulary**: Pulled from SRS cards with low ease factor or high lapse count
- **Grammar**: Pulled from grammar SRS cards with low ease factor or high lapse count
- Unified scoring: a single `confidence_score` field on both vocabulary and grammar cards, so the adaptive system treats them identically

#### Grammar Prerequisite Awareness
Grammar is hierarchical. You can't practice dative declension without knowing accusative. The adaptive system checks prerequisites before injecting weak grammar topics:

```
Before injecting weak grammar topic X:
  Check if prerequisite topics are "strong" (confidence > threshold)
  If not: inject prerequisite FIRST, then X
  If yes: inject X directly
```

Example flow for a learner weak on dative:

| Current lesson | Injected concept | Prerequisite check |
|---------------|-----------------|-------------------|
| Family vocab (A1) | — (no grammar context) | — |
| Food/drink (A1) | Accusative articles (weak) | Prereq (nominative) is strong ✓ |
| Restaurant (A2) | Dative articles (weak) | Prereq (accusative) still weak → inject accusative first |

#### Adaptive Review
- After a lesson, prioritize review cards that relate to the lesson just completed
- "You just learned 8 words about family — here are the family words from your review queue"

#### Vocabulary & Grammar Recycling
- Lessons intentionally include vocabulary and grammar concepts from previous lessons
- Phase 4 adds a `prerequisite_vocab_ids` and `prerequisite_grammar_topic_ids` field to lessons → system prompts the learner to review relevant old material before starting

#### Confidence Estimation
- Track per-word and per-grammar-topic confidence based on: checkpoint accuracy, exercise accuracy, SRS rating history
- Display confidence as a simple indicator (Low / Medium / High)
- Unified model: `concept_confidence(user_id, concept_type, concept_id, score)`

### 10.2 Backend Track

| Item | Detail |
|------|--------|
| **New tables** | `concept_confidence` (polymorphic: vocab OR grammar), `lesson_prerequisites` (both vocab and grammar prereqs) |
| **New endpoints** | `GET /adaptive/weak-concepts` (list weakest vocab + grammar for injection), `POST /adaptive/review-suggest` (given lesson ID, return related due cards), `GET /adaptive/prerequisites/{lesson_id}` (check prerequisite strength) |
| **Migration** | `add_concept_confidence`, `add_lesson_prerequisites` |
| **Changes** | Lesson model: `prerequisite_vocab_ids` + `prerequisite_grammar_topic_ids` JSON fields; both SRS models write to shared `concept_confidence` table |

### 10.3 Frontend Track

| Component | What Changes |
|-----------|-------------|
| `VocabularyExplorer` | Includes 1–2 weak words alongside new words |
| `GuidedPractice` | Injects weak vocab + weak grammar into practice prompts |
| `GrammarPractice` | New component — practices weak grammar concepts inline |
| `ReviewSidebar` | Shows "Review before this lesson" section with both vocab + grammar |
| `VocabCard` | Displays confidence indicator (Low/Med/High dot) |
| `GrammarCard` | Also displays confidence indicator |

### 10.4 Deliverables

| Deliverable | Priority | Backend | Frontend |
|-------------|----------|---------|----------|
| Weak concept injection (vocab + grammar) | Must have | Endpoint + `concept_confidence` table | VocabularyExplorer, GuidedPractice |
| Grammar prerequisite checking | Must have | `prerequisite_grammar_topic_ids` + check endpoint | Lesson start → prerequisite prompt |
| Adaptive review suggestions | Must have | Endpoint | ReviewSidebar |
| Unified confidence scoring | High | Concept confidence table + calculation | Confidence dot on both card types |

### 10.5 Success Criteria

- Each lesson includes 1–2 previously weak concepts (vocab or grammar) for reinforcement
- Grammar injection respects prerequisite ordering (never injects dative before accusative)
- Learners see relevant review cards after completing a lesson
- Concept confidence correlates with actual SRS performance

---

## 11. Phase 5 — Premium Learning Experience (Weeks 25–36)

> Deliver a learning experience comparable to leading language platforms.

### 11.1 Native-Quality Audio

| Item | Detail |
|------|--------|
| **Scope** | Professional native German voice recordings for all A1–C1 vocabulary |
| **Format** | Normal speed + slow speed for each word; full-sentence recordings for key phrases |
| **Storage** | CDN (Cloudflare R2 / AWS S3) |
| **Delivery** | Audio endpoint returns signed URL; frontend caches via Service Worker |
| **Phased rollout** | A1 words first (Week 25–26), then A2 (Week 27–28), etc. |
| **Cost** | ~$5K–$15K for A1; ~$20K–$50K for full curriculum |
| **Fallback** | TTS when native audio unavailable |

### 11.2 Conversation Simulator

| Item | Detail |
|------|--------|
| **What** | Emma plays a role (waiter, shopkeeper, friend) and the learner responds |
| **Scenes** | Ordering food, buying a ticket, introducing yourself, asking for directions |
| **Interaction** | Learner types or speaks their part; Emma responds naturally |
| **Feedback** | After each exchange, Emma highlights grammar/vocab improvements |

### 11.3 Pronunciation Scoring

| Item | Detail |
|------|--------|
| **Service** | Speechace API or Google Speech-to-Text + comparison |
| **Scoring** | 0–100 accuracy per word, per sentence |
| **Feedback** | Highlight which phonemes were off; offer targeted practice |
| **Caveat** | This is genuinely hard for German (compounds, regional variation) |
| **Status** | Phase 5 only — requires significant investment |

### 11.4 Shadowing Mode

| Item | Detail |
|------|--------|
| **What** | Listen to a sentence → repeat it → compare audio waveforms |
| **Visual** | Side-by-side waveform display (native vs learner) |
| **Use case** | Pronunciation + intonation practice |

### 11.5 Daily Missions & Achievements

| Item | Detail |
|------|--------|
| **Daily missions** | "Complete 1 lesson", "Review 10 cards", "Practice speaking 3 sentences" |
| **Streak bonuses** | Extra XP for consecutive days |
| **Achievements** | "First Dialogue", "Vocabulary Master (50 words)", "Grammar Apprentice" |

### 11.6 Backend Track

| Item | Detail |
|------|--------|
| **New tables** | `achievements`, `user_achievements`, `daily_missions`, `mission_progress`, `audio_assets` (track which word has which audio file) |
| **New endpoints** | `GET /audio/{word}` (return signed URL or fallback TTS), `POST /speaking/score` (submit audio, get score back), `GET /missions/daily`, `POST /missions/claim`, `GET /achievements` |
| **Migration** | 5+ new tables |
| **External services** | Speechace API integration, CDN setup |

### 11.7 Frontend Track

| Component | What Changes |
|-----------|-------------|
| `AudioService` | Add CDN lookup + fallback chain |
| `SpeakingStage` | Major upgrade: record → upload → display score |
| `ShadowingStage` | New component: listen → record → waveform comparison |
| `MissionsPanel` | New component: daily missions in sidebar |
| `AchievementsGrid` | New component: badges and progress |
| `ConversationSimulator` | New component: multi-turn role-play |

### 11.8 Deliverables

| Deliverable | Priority | Backend | Frontend |
|-------------|----------|---------|----------|
| Native audio for A1 | Must have | Audio asset table + CDN | AudioService fallback chain |
| Conversation simulator | Must have | Emma endpoint for role-play | ConversationSimulator |
| Daily missions | High | missions tables + endpoints | MissionsPanel |
| Achievement system | High | achievements tables | AchievementsGrid |
| Pronunciation scoring | Medium | Speechace integration | SpeakingStage upgrade |
| Shadowing mode | Medium | — | ShadowingStage |
| Native audio A2–C1 | Ongoing | CDN uploads | — |

### 11.9 Success Criteria

- A1 vocabulary has professional native audio coverage
- Conversation simulator supports 5+ real-world scenarios
- Learners can score pronunciation and see targeted feedback
- Daily missions drive ≥1 session/day engagement

---

## 12. Cross-Cutting Concerns

### 12.1 Feature Flag System

Every new feature must be behind a feature flag:

```
featureFlag("interactive-dialogue")    → Phase 1
featureFlag("stage-based-lessons")     → Phase 2
featureFlag("emma-in-lesson")          → Phase 3
featureFlag("adaptive-vocab")          → Phase 4
featureFlag("native-audio")            → Phase 5
```

**Frontend:** `lib/featureFlags.ts` — reads from `localStorage` or API
**Backend:** `feature_flags` table or environment variable per flag
**Strategy:** Roll flags per user percentage (10% → 50% → 100%)
**Migration path:** Old lesson renderer remains live until all lessons migrated

### 12.2 Backward Compatibility

- Existing lessons continue to render via the current `LessonViewer` until their `stages_config` is defined
- New `LessonViewerV2` renders stage-based lessons; fallback to V1 when no config
- API versioning: `/api/v1/lessons/{id}` (current), `/api/v2/lessons/{id}` (new)
- In-progress lesson sessions are never invalidated

### 12.3 A/B Testing Framework

- Feature flags double as A/B experiment flags
- Track: completion rate, time spent, checkpoint scores, return rate
- Compare: new lesson flow vs old lesson flow
- Tool: PostHog or simple in-house event tracking

### 12.4 Phase 1→Phase 2 Gate: Learning Outcome Experiment

> **This is the single most important validation step in the entire roadmap.** Phase 2 (the generalized stage-based lesson engine) is only greenlit if this experiment produces a statistically significant positive result.

#### When
Built during Phase 1 (one hand-crafted stage-based lesson), run during the Phase 1→Phase 2 transition (Week 8–9).

#### Design

| Group | Lesson format | Content | Measurement |
|-------|--------------|---------|-------------|
| **Control** | Old markdown renderer | Lesson 01-greetings | Post-lesson quiz score |
| **Treatment** | Stage-based (9 stages, hand-built) | Same content | Post-lesson quiz score |
| **Both** | — | — | 7-day retention score |

Sample size: n ≥ 100 per group.

#### Pre-Committed Pass/Fail Threshold

Phase 2 is greenlit **only if** all three criteria are met:

```
1. Treatment mean quiz score ≥ control mean + 5% (p < 0.05)
2. Treatment completion rate ≥ control completion rate + 10%
3. 7-day retention: treatment ≥ 60% (not relative — absolute)
```

If the experiment fails (any threshold not met):
- **Do NOT build the generalized stage engine.**
- Instead: iterate on the hand-built lesson format, re-test, or invest in improving the existing markdown renderer with targeted fixes.
- Re-evaluate at the next milestone (v2.5 timeline).

This is the same gating pattern used for the Phase 3→5 pronunciation decision (§9.5). The principle: validate the learning format with a cheap prototype before engineering the generalized platform for it.

### 12.5 Offline Strategy

| Feature | Offline Support |
|---------|----------------|
| Lesson content | Cache last 5 completed + next 2 lessons |
| Audio (TTS) | Requires network (browser API) |
| Neural TTS audio | Pre-cache via Service Worker on Wi-Fi |
| Native audio | Pre-cache via Service Worker on Wi-Fi |
| SRS review | Fully offline; sync on reconnect |
| Quiz attempts | Cache questions; sync results |
| Checkpoints | Queue submissions; sync on reconnect |

**Implementation:** Service Worker + IndexedDB for lesson content and answers. `navigator.onLine` checks before API calls.

#### Storage Management

Audio files consume significant space. German audio at various qualities:

| Audio type | Per word | 1000 words | 5000 words |
|-----------|----------|-----------|-----------|
| Neural TTS (Opus 64kbps, ~2s) | ~16 KB | 16 MB | 80 MB |
| Neural TTS (MP3 128kbps, ~2s) | ~32 KB | 32 MB | 160 MB |
| Native recording (WAV 44.1kHz) | ~350 KB | 350 MB | 1.75 GB |

Browser storage quotas: Mobile Safari ~50 MB, Chrome mobile ~100 MB, desktop much higher.

**Smart fetch policy:**
- Prioritize caching audio for **due** and **new** SRS cards first
- Cache audio for the **current lesson + next 2 lessons**
- Cache audio for **mature** SRS cards last (they'll be evicted sooner)
- Evict oldest-accessed audio when storage budget is exceeded

**Auto-cleanup by SRS maturity:**
When a learner completes a unit and those cards reach a mature SRS state (status = "reviewing" with interval > 30 days), the system silently clears local audio files for those specific words. They're re-fetched from CDN only if needed during a future review.

**Storage budget dashboard (Settings page):**
```
Storage
├── Audio cache: 24 MB / 50 MB used
├── Lesson cache: 3 lessons cached
├── ⚡ Auto-manage: ON (clears mastered words after 30 days)
└── [Clear cache now]
```

### 12.6 Analytics Pipeline

| Event | Purpose |
|-------|---------|
| `lesson_started` | Track engagement |
| `stage_completed` | Measure stage-level drop-off |
| `word_clicked` | Vocabulary interaction heatmap |
| `checkpoint_score` | Comprehension by lesson section |
| `hint_requested` | Emma usage metrics |
| `lesson_completed` | Completion rate |
| `audio_played` | Audio engagement |

**Timing:** The analytics pipeline is instrumented in **Phase 0**, not Phase 2. Every leading indicator in §20 needs a pre-change baseline. Without Phase 0 instrumentation, there is nothing to compare post-launch numbers against. Even a crude version — logging `lesson_started`, `lesson_completed`, `session_duration`, and `quiz_score` to a simple `analytics_events` table — is sufficient to establish baselines before any learning engine changes ship.

**Events are sent in batches** to avoid overwhelming the API. `POST /analytics/batch` endpoint processes them.

### 12.7 Content Migration Strategy

> The biggest hidden cost. Manually splitting 25+ lesson markdown files into 7–10 interactive stages each is a massive editorial lift. This section addresses it.

#### Two-Pass Migration Script

Phase 2 requires every existing lesson to have a `stages_config`. Doing this by hand for 25+ lessons would take 2–3 weeks of editorial work. Instead, leverage the existing LLM infrastructure:

**Pass 1 — Parse (automated via LLM):**

A script reads each lesson markdown file and sends it to an LLM with a structured prompt:

```
Given this German lesson markdown, extract:
1. Dialogue lines (as individual entries with speaker + text)
2. Vocabulary items referenced in the lesson
3. Grammar topics covered
4. Exercises (split by type)
5. Natural checkpoint points (after dialogue, after grammar)

Output as JSON matching the stages_config schema.
```

The output is a draft `stages_config` + extracted entities.

**Pass 2 — Entity creation (semi-automated):**

The script takes the draft from Pass 1 and:
- Creates `dialogue_line` records in the DB for each extracted dialogue line
- Links vocab items to lesson stages
- Creates checkpoint question stubs (editor fills in the actual questions)
- Generates the final `stages_config` with real entity IDs

**Intermediate storage:** Add a `lesson_content_json` TEXT field to the Lesson model. The parsed structure lives here during migration. The stage config references **keys in this JSON** rather than DB foreign keys — cheaper to generate, easier to edit, no FK constraints during migration.

#### Human Review Step

Each auto-generated `stages_config` gets a human review pass:
- Editor opens the lesson in a preview tool
- Reorders stages if the LLM got the flow wrong
- Writes checkpoint questions (LLM generates drafts, editor refines)
- Approves or rejects

Estimated editorial effort: **2–3 hours per lesson** for review + refinement. ~75 hours total for 25 lessons.

**⚠️ Resourcing assumption:** The 75 editorial hours are scheduled to overlap Weeks 9–12 alongside Phase 2 engineering. This works **only if** the editor is a separate person from the engineering team. If the same person writes code and reviews lesson stages, the timeline extends by ~3 weeks (the editorial work serializes after engineering). A dedicated content editor or a subject-matter expert (someone who knows German and can assess lesson quality) should handle this review pass.

#### Phased Rollout

Don't migrate all lessons at once:
1. Migrate A1 lessons first (5 lessons) → ship to 10% of users
2. Measure completion rates + checkpoint scores
3. Tweak the stage selector + migration script
4. Migrate A2–B1 (next 10 lessons) → ship to 50%
5. Migrate B2–C1 (remaining 10 lessons) → full rollout

### 12.8 Lesson Authoring CLI

After migration, new lessons still need a `stages_config`. A CLI tool prevents this from becoming a bottleneck:

```bash
npm run create-lesson -- --type dialogue --title "Im Restaurant" --level A1 --unit 4
```

This generates:
- Markdown file with frontmatter + `stages:` config scaffold
- Placeholder exercises (3 fill-blank, 2 multiple-choice, 1 translation)
- Placeholder checkpoint questions (2 sets of 3)
- Empty dialogue line entries

The author fills in the blanks instead of starting from nothing.

```bash
npm run create-lesson -- --type grammar --title "Dative Case" --level A1 --topic dative-case
```

For grammar lessons, the CLI auto-selects the **discovery template** (declension template for dative) and pre-fills the stages with the correct template flow.

### 12.9 QA Strategy

Every feature must pass through these quality gates before shipping:

```
Unit Tests (backend: pytest, frontend: vitest)
       │
       ▼
Integration Tests (API endpoints, stage transitions)
       │
       ▼
Lesson Validation (schema check: does stages_config reference valid entities?)
       │
       ▼
Accessibility Audit (axe-core or manual: §17.6 checklist)
       │
       ▼
Performance Check (load time, API latency — §12.9 budget)
       │
       ▼
Manual Review (editor checks lesson flow on mobile + desktop)
       │
       ▼
Feature Flag Rollout (10% → 50% → 100%)
```

**Lesson validation script** — automated check run in CI for every lesson PR:
- All `stages_config` entity references resolve to existing records
- Minimum exercise count met (8–10 per lesson)
- At least 2 checkpoints present
- All audio files referenced exist
- Mobile character bar renders for dictation stages

No lesson ships to production without passing validation.

### 12.10 Performance Budget

Performance is treated as a feature. These budgets are enforced in CI:

| Metric | Budget | Tool |
|--------|--------|------|
| Lesson page load (first contentful paint) | ≤2s on 4G | Lighthouse CI |
| Stage transition (click → render) | ≤300ms | Custom trace |
| API response (checkpoint submit) | ≤500ms (p95) | k6 or PostHog |
| Audio playback start (neural TTS) | ≤1s (includes fetch) | Custom trace |
| AI hint response (Emma) | ≤3s (p95) | API monitoring |
| Bundle size (lesson renderer JS) | ≤150KB gzipped | Bundle analyzer |
| Total offline storage | ≤50MB mobile, ≤200MB desktop | Service Worker audit |

### 12.11 Monthly Cost Analysis

| Service | Phase | Cost at 1K users | Cost at 10K users | Cost at 100K users |
|---------|-------|-----------------|-------------------|--------------------|
| Neural TTS (ElevenLabs) | 0 | ~$2 | ~$15 | ~$150 |
| LLM hints (DeepSeek) | 3 | ~$5 | ~$40 | ~$350 |
| LLM encouragement | 3 | ~$2 | ~$15 | ~$120 |
| Speechace scoring | 5 | ~$50 | ~$500 | ~$5,000 |
| Native audio CDN | 5 | ~$5 | ~$40 | ~$350 |
| Database (MySQL) | All | ~$15 | ~$50 | ~$200 |
| Hosting (Render/API) | All | ~$15 | ~$50 | ~$200 |
| **Total** | | **~$94** | **~$710** | **~$6,370** |

**Key insight:** LLM costs are dominated by Speechace at scale. Cap per-user API calls or switch to a self-hosted model for scoring at >10K users.

### 12.12 Scalability Plan

Current roadmap assumes ~25 lessons. Future growth:

| Milestone | Lessons | Users | Infrastructure change |
|-----------|---------|-------|---------------------|
| Phase 0 end | ~10 | <50 | Single server + SQLite |
| Phase 2 end | ~30 | <500 | MySQL + CDN for audio |
| 6 months | ~100 | <5K | Read replicas, object cache |
| 12 months | 300+ | <50K | Horizontal API scaling, Redis |
| 24 months | Multi-language | 100K+ | Global CDN, dedicated ML infra |

**Content scaling:** Target 5 new lessons per month per language track. If rate can't be sustained, invest in template-based generation before hiring more editors.

### 12.13 Failure Recovery (Graceful Degradation)

The learner should never hit a dead end. Every external dependency has a fallback:

| Failure | Fallback | Degradation |
|---------|----------|-------------|
| Emma API (LLM) fails | Static fallback hint: "Try looking at the word endings." | Hints are generic instead of personalized |
| TTS audio fails (network) | "Audio unavailable" silently — text is always visible | No audio, but lesson continues |
| Neural TTS file missing | Browser TTS (Tier 2) | Slightly robotic audio |
| Native audio CDN down | Neural TTS → browser TTS (Tiers 1→2→3) | Gradually lower quality |
| Speechace fails | LLM pronunciation feedback (Phase 3 stopgap) | Binary feedback instead of phoneme-level |
| Translation fails | Cached translation from vocab map | No translation for unknown words |
| Checkpoint submit fails (offline) | Queue in IndexedDB; sync on reconnect | No feedback until sync |
| API unreachable | Cached lesson + SRS from Service Worker | No new content, but review works |
| LLM timeout during hint | Cached hint from `emma_cache` table | Generic hint instead of contextual |

Every loading state must show a skeleton or spinner within 200ms. No blank screens.

---

## 13. Product Milestones

Major releases for external communication and internal alignment:

| Milestone | Version | Timeline | What Ships |
|-----------|---------|----------|-----------|
| **Interactive Lessons** | v2.0 | Week 8 | Interactive dialogue, clickable vocabulary, neural TTS, universal pronunciation, analytics baseline |
| **Guided Learning** | v2.5 | Week 16 | Stage-based lessons, checkpoints, grammar discovery, mastery score, content migration complete |
| **AI Tutor Integration** | v3.0 | Week 20 | Emma in lessons, progressive hints, pronunciation feedback (LLM stopgap), lesson authoring CLI |
| **Adaptive Learning** | v3.5 | Week 24 | Weak concept injection, grammar SRS, vocabulary recycling, confidence scoring, prerequisite awareness |
| **Native Speaking** | v4.0 | Week 30 | Native audio (A1), pronunciation scoring (Speechace), conversation simulator, shadowing mode |
| **AI Language Coach** | v5.0 | Week 36 | Daily missions, achievements, full native audio (A1–C1), full adaptive curriculum, personalized learning path |

## 14. What We Are NOT Building

Explicit out-of-scope items to prevent scope creep:

| Feature | Reason | Status |
|---------|--------|--------|
| Video lessons | Out of scope — text + audio only | ❌ |
| Live teachers / tutoring | Requires scheduling infrastructure | ❌ |
| Marketplace / teacher platform | Marketplace dynamics outside our mission | ❌ |
| User-generated lessons | Quality control impossible at scale | ❌ |
| Language exchange / social features | Moderation overhead, distracts from structured learning | ❌ |
| Gamified world maps / leagues | Duolingo-style gamification doesn't align with our pedagogy | ❌ |
| Certificates / diploma | Credentialing is a separate product | ❌ |
| Multi-language support (French, Spanish, etc.) | Deutsch means German. Single language until German experience is excellent. | ❌ (vNext) |
| Mobile native apps (iOS/Android) | PWA-first. Native apps only if PWA engagement metrics justify it. | ❌ (vNext) |
| Offline downloads of all lessons | Storage constraints — only cache current + next 2 lessons | ❌ |

## 15. Prioritization Within Phases

Every phase uses P0/P1/P2 labels on deliverables to guide implementation when timelines slip:

| Priority | Meaning | What happens if timeline slips |
|----------|---------|-------------------------------|
| **P0 — Must ship** | Blocking dependency for next phase; without this, the next phase cannot start | Delay phase end date; do not cut |
| **P1 — Should ship** | High value but not blocking; can be deferred to a dot-release | Cut to a .1 release after phase ships |
| **P2 — Can wait** | Enhancement; nice-to-have that rounds out the experience | Drop from this phase entirely |

Example from Phase 2:

| Deliverable | Priority | Rationale |
|-------------|----------|-----------|
| Stage-based lesson renderer | P0 | Phase 3 (Emma integration) depends on stage renderer |
| Checkpoint system | P0 | Phase 3 hints depend on checkpoint context |
| Grammar discovery flow | P1 | High value but lessons can ship with direct explanation first |
| Dictation stage | P2 | Spelling practice is valuable but not blocking |
| Lesson mastery score | P1 | Drives engagement but can be calculated client-side initially |

## 16. Definition of Success Per Phase

Each phase is "done" when ALL criteria are met, not when the deliverables are built:

### Phase 0 (Quick Wins)

```
✓ Universal pronunciation exists for all A1 vocabulary
✓ Neural TTS audio files generated for all A1 vocabulary
✓ Click-to-speak works on any German word in lesson content
✓ All A1 lessons have ≥8 exercises each
✓ Analytics pipeline instruments lesson_started, lesson_completed, session_duration, quiz_score
✓ Baseline measurements recorded for all §20 metrics
```

### Phase 1 (Interactive Foundation)

```
✓ Dialogue lines are interactive (tap word → translation + audio)
✓ Every German word on the page is clickable
✓ Slow-playback mode works and is discoverable
✓ Listen-before-reading toggle functions
✓ Three-tier audio fallback chain operational
✓ Analytics events flowing for word_interactions and audio_played
```

### Phase 2 (Lesson Engine Redesign)

```
✓ Every A1 lesson migrated to stage-based format
✓ Stage renderer handles all 12 stage types
✓ Every lesson has ≥2 checkpoints (3 questions each)
✓ Lesson completion rate increased by ≥20% over baseline
✓ Grammar discovery exists for all A1 grammar topics
✓ Content validation script runs in CI
✓ Lesson authoring CLI produces valid lesson scaffolds
```

### Phase 3 (AI-Assisted)

```
✓ Emma appears in ≥3 touchpoints per lesson
✓ Progressive hint system works in grammar discovery
✓ Pronunciation feedback (LLM) correctly identifies obvious mispronunciations
✓ Hint → checkpoint pass rate correlation measurable
✓ User satisfaction with Emma hints ≥70%
```

### Phase 4 (Adaptive)

```
✓ Each lesson includes ≥1 previously weak concept
✓ Grammar injection respects prerequisite ordering
✓ Concept confidence correlates with SRS performance
✓ Unified confidence score exists for vocab + grammar
✓ Manual vocabulary recycling rule enforced in content pipeline
```

### Phase 5 (Premium)

```
✓ A1 vocabulary has professional native audio coverage
✓ Conversation simulator supports ≥5 real-world scenarios
✓ Pronunciation scoring (Speechace) gives phoneme-level feedback
✓ 30% of active users attempt ≥1 speaking exercise per week
✓ Daily missions drive ≥1 session/day engagement
✓ Storage auto-cleanup functions correctly on mobile
✓ Full content pipeline validated through 3 new lesson creations
```

---

## 17. Lesson Architecture

### 13.1 Stage Configuration

Each lesson has two new JSON fields on the Lesson model:

| Field | Purpose |
|-------|---------|
| `lesson_content_json` | Intermediate parsed structure — holds dialogue lines, vocab references, grammar topics as a JSON document. Used during migration and authoring. Stage configs reference keys in this JSON rather than DB foreign keys. |
| `stages_config` | The actual stage sequence for the lesson renderer. References entities by key in `lesson_content_json` or by DB ID. |

Example `stages_config`:

```json
{
  "stages": [
    { "type": "welcome", "duration_min": 1 },
    { "type": "listen_first", "duration_min": 2, "source": "dialogue_1" },
    { "type": "interactive_dialogue", "duration_min": 4, "dialogue_id": 1 },
    { "type": "vocab_explorer", "duration_min": 3, "words": [1, 2, 3, 4, 5, 6, 7, 8] },
    { "type": "checkpoint", "duration_min": 2, "questions": [1, 2, 3] },
    { "type": "grammar_discovery", "duration_min": 4, "topic": "personal-pronouns-nominative" },
    { "type": "guided_practice", "duration_min": 4, "exercise_ids": [1, 2, 3, 4, 5] },
    { "type": "mini_review", "duration_min": 3, "count": 5 },
    { "type": "summary", "duration_min": 1 }
  ]
}
```

### 13.2 Stage Selector Per Lesson Type

| Type | Stages |
|------|--------|
| **dialogue** | welcome, listen_first, interactive_dialogue, vocab_explorer, pronunciation, checkpoint, role_play, mini_review, summary |
| **grammar** | welcome, observe, discover, explain, practice, checkpoint, apply, mini_review, summary |
| **vocab** | welcome, listen, see, hear, match, type, checkpoint, recall, speak, summary |
| **mixed** | welcome, objectives, listen_first, interactive_dialogue, vocab_explorer, checkpoint, grammar_discovery, guided_practice, mini_review, summary |

### 13.3 Existing Lesson Migration

| Lesson | Type | Stages Count |
|--------|------|-------------|
| 01-greetings | dialogue | 9 |
| 02-introductions | dialogue | 9 |
| 03-numbers-colors | vocab | 10 |
| 04-family | mixed | 10 |
| 05-food-drinks | dialogue | 9 |

Each lesson markdown file gets a `stages:` frontmatter field. The curriculum loader syncs it to the DB.

Existing lessons are migrated via the **two-pass LLM migration script** (see §12.6). Estimated editorial effort: 2–3 hours per lesson for human review.

### 13.4 Optimal Lesson Length

| Metric | Target |
|--------|--------|
| Stages per lesson | 7–10 |
| Minutes per lesson | 8–15 |
| Interactions per lesson | 15–25 |
| Words introduced per lesson | 6–10 |
| Checkpoints per lesson | 2–3 |

### 13.5 Mobile Input for German Characters (ß, ä, ö, ü)

German typing on mobile requires special characters not on most keyboards. DictationStage and any typing exercise must handle this:

- **Character bar:** A persistent row above the keyboard showing ß, ä, ö, ü, Ä, Ö, Ü — tappable to insert
- **Auto-capitalize:** German nouns are always capitalized. The input should auto-suggest uppercase for words recognized as nouns (leveraging the vocabulary map from Phase 0)
- **Umlaut autocomplete:** Typing "a" followed by a vowel offers "ä" as a suggestion
- **Fallback:** Accept "ss" for "ß" (standard German convention) and "ae/oe/ue" for "ä/ö/ü"

Applies to: DictationStage, TypingRecall, and any free-text quiz input.

### 13.6 Accessibility

| Concern | Requirement | Phase |
|---------|-------------|-------|
| **Screen readers** | All interactive stages use semantic HTML + ARIA labels. Dynamic content (checkpoint feedback, Emma hints) announces changes via `aria-live` regions. | Phase 1+ |
| **Reduced motion** | The synthwave UI uses CSS animations (pulse, float, slide). Respect `prefers-reduced-motion: reduce` — disable all non-essential animations. Already partially handled in `globals.css`. Audit all new stage components. | Phase 0 |
| **Audio captions** | Any audio playback (dialogue, TTS, native recordings) must have a visible text transcript. DialogueBlock already shows the text; DictationStage and ListenFirst need explicit transcript display. | Phase 1 |
| **Color contrast** | The dark theme meets WCAG AA for body text. Verify checkpoint feedback (green correct / red wrong) also meets contrast requirements — consider adding icon + text labels as redundant encoding. | Phase 2 |
| **Focus management** | Stage transitions must move focus to the new stage heading. Checkpoint feedback, Emma popovers, and WordPopover must trap focus while open. | Phase 1 |
| **Keyboard navigation** | All interactions (drag-to-order, tap-to-reveal, flip-card) must have keyboard alternatives. Drag-to-order: up/down arrow buttons alongside drag handles. | Phase 2 |

---

## 18. Grammar SRS

### 13.1 Problem

Currently, only vocabulary has spaced repetition. Grammar concepts (case declensions, verb conjugations, preposition rules) are never reviewed, so learners forget them.

### 13.2 Solution

Add a `grammar_cards` table + independent SM-2 scheduling for grammar concepts. Grammar SRS is fully integrated with the adaptive learning system (see §10).

#### Unified Confidence Scoring

Both vocab SRS and grammar SRS write to a shared `concept_confidence` table:

```sql
concept_confidence (
  user_id,
  concept_type  -- 'vocab' | 'grammar'
  concept_id,   -- vocab_entry_id | grammar_topic_id
  score,         -- 0.0–1.0
  last_updated
)
```

This allows the adaptive system (Phase 4) to treat vocabulary and grammar identically for weak-concept injection.

#### Prerequisite Grammar Topics

Each grammar topic has a `prerequisite_topic_ids` field. For example:

| Grammar Topic | Prerequisites |
|--------------|---------------|
| Accusative case | Nominative case |
| Dative case | Accusative case |
| Genitive case | Dative case |
| Subjunctive II | Past tense, Subjunctive I |
| Adjective declension | Definite articles, Accusative case |

The adaptive system checks prerequisites before injecting weak grammar concepts (see §10.1 — Grammar Prerequisite Awareness).

#### Backend

| Item | Detail |
|------|--------|
| **New table** | `grammar_cards` (id, user_id, grammar_topic_id, next_review_at, interval_days, easiness_factor, repetitions, lapses, status) |
| **New endpoint** | `GET /srs/grammar/due` (cards due for review), `POST /srs/grammar/review` (submit rating) |
| **Migration** | `add_grammar_srs_tables` |

#### Frontend

| Component | What Changes |
|-----------|-------------|
| `ReviewSidebar` | Add "Grammar Review" section |
| `GrammarCard` | New component — shows a grammar prompt (e.g., "What case follows 'mit'?") with multiple choice |
| `ReviewPage` | Adds grammar cards to Today's Review |

#### Review Card Types

| Type | Example |
|------|---------|
| **Case drill** | "What case does 'mit' take?" → Dative (click to reveal) |
| **Conjugation drill** | "Conjugate 'haben' for 'ihr'" → "ihr habt" |
| **Declension drill** | "der Tisch → accusative" → "den Tisch" |
| **Sentence position** | "Where does the verb go?" → "Ich ___ (gehen) nach Hause." |

### 13.3 Scheduling

Grammar SRS spans two phases:

| Component | Phase | Weeks | What's built |
|-----------|-------|-------|-------------|
| Tables + SM-2 engine | Phase 2 | 12–14 | `grammar_cards` table, `POST /srs/grammar/review`, basic review page integration |
| Grammar discovery → card creation | Phase 2 | 14–16 | Grammar discovery stage auto-creates SRS cards when learner completes the stage |
| Adaptive integration | Phase 4 | 18–20 | Grammar cards feed into `concept_confidence`, weak grammar injection, prerequisite checking |
| Grammar review in mobile | Phase 4 | 20–22 | Grammar card input optimization for mobile (see §17.5) |

### 13.4 Integration Points

- Grammar discovery stage (Phase 2) → automatically creates grammar cards for the lesson's topics
- After completing a grammar-heavy lesson, learner sees "Grammar review: 3 cards added"
- Weak grammar concepts (Phase 4) are recycled into the adaptive review pool

---

## 19. Effort Estimates & Risk Register

### 19.1 Phase Effort Summary

| Track | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Total |
|-------|---------|---------|---------|---------|---------|---------|-------|
| **Backend** | 1 day | 1 wk | 2 wk | 2 wk | 2 wk | 3 wk | ~10 wk |
| **Frontend** | 3 days | 4 wk | 6 wk | 3 wk | 3 wk | 6 wk | ~23 wk |
| **Content/Editorial** | 2 days | — | ~75 hrs* | — | — | — | ~10 wk |
| **Eng Governance†** | 1 day | 2 days | 4 days | 2 days | 2 days | 3 days | ~2 wk |
| **External Cost** | $1.50 | — | — | LLM API | — | $5K–$50K | $5K–$50K |

\* 75 hours = 25 lessons × 3 hrs each for human review of auto-generated stage configs.
† Engineering Governance = QA pipeline setup, CI lesson validation, performance budget tooling, accessibility audit framework, cost monitoring, scalability planning, and failure-recovery stubs. Distributed across phases as each feature ships.

| Phase | Weeks | Eng Total | Content Total | Governance |
|-------|-------|-----------|---------------|------------|
| Phase 0 | 1–2 | ~1 wk | 2 days | 1 day |
| Phase 1 | 3–8 | 5 wk | — | 2 days |
| Phase 2 | 9–16 | 8 wk | ~10 wk (see timing note) | 4 days |
| Phase 3 | 5–20* | 5 wk | — | 2 days |
| Phase 4 | 17–24 | 5 wk | — | 2 days |
| Phase 5 | 25–36 | 9+ wk | — | 3 days |
| **Total** | **36 weeks** | **~33 eng weeks** | **~10 content weeks** | **~2 eng weeks** |

\* Phase 3 runs concurrently with Phases 1–2.

**Timing note on content track:** The 75 editorial hours are concentrated in Weeks 9–12 (migrating A1 first). This does NOT extend the overall timeline **only if** the editor is a separate person from the engineering team. If the same person writes code and reviews lesson stages, the timeline extends by ~3 weeks (the editorial work serializes after Phase 2 engineering finishes).

### 19.2 Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Pronunciation scoring accuracy is poor | High | Medium | Start with simple "Good/Needs Work" feedback before investing in full scoring |
| Native audio costs exceed budget | Medium | High | Phase-in by level (A1 first). Use TTS as default, native audio as premium. |
| LLM cost for Emma hints scales poorly | Medium | Medium | Aggressive caching. Use smaller/cheaper model for hints. Cap requests per user/day. |
| Stage-based lesson builder increases lesson creation time | Medium | High | Build authoring tools alongside the engine. Provide templates per lesson type. |
| Offline sync conflicts (e.g., completed lesson offline while checkpoint submitted) | Low | Medium | Use last-write-wins with server timestamp; no critical data should conflict |
| Browser TTS quality is poor on some platforms | High | Low | Already the case. Neural TTS bridge (Phase 0) mitigates this before native audio arrives in Phase 5. |
| Content migration bottleneck (25+ lessons → stages_config) | High | High | Two-pass LLM migration script + editorial review. Phased rollout: A1 first, then A2–C1. Don't wait until all lessons are migrated. |
| Offline audio storage exceeds mobile browser quota | Medium | Medium | Smart fetch policy (cache only due + upcoming words). Auto-cleanup by SRS maturity. Storage budget dashboard for user visibility. |

---

## 20. Success Metrics

### 15.1 Leading Indicators (Measurable week-over-week)

| Metric | Current Baseline | Target (6 mo) |
|--------|-----------------|---------------|
| Lesson completion rate | Unknown | ≥75% |
| Average session duration | Unknown | ≥12 min |
| Daily active users / sessions per week | Unknown | ≥4 sessions/week |
| Checkpoint pass rate (Phase 2+) | N/A | ≥70% on first attempt |
| Words tapped per lesson (Phase 1+) | N/A | ≥5 |
| Emma hint requests per lesson (Phase 3+) | N/A | ≥1 (paired with checkpoint pass rate) |
| Checkpoint pass rate after hint usage (Phase 3+) | N/A | ≥60% (disambiguates: high hints + low pass rate = lessons too hard) |
| Audio plays per lesson (Phase 1+) | Unknown | ≥3 |

### 15.2 Lagging Indicators (Measured monthly)

| Metric | Current Baseline | Target (12 mo) |
|--------|-----------------|----------------|
| Learner retention (30-day) | Unknown | ≥40% |
| Learner retention (90-day) | Unknown | ≥20% |
| A1→A2 progression rate | Unknown | ≥50% of starters |
| Average quiz score improvement | Unknown | +15% after 30 days |
| SRS card mature rate | Unknown | ≥60% of cards reach "reviewing" |

### 15.3 Qualitative Success Criteria

- Learners describe lessons as "interactive" not "reading"
- Emma feels like a teacher, not a chatbot tab
- New users can complete first lesson without external help
- Pronunciation feedback is accurate enough to improve learner speech

---

## 21. Final Outcome

Upon completion of this transformation, DeutschFlow will evolve from:

```
Premium User Interface
+ Static Lesson Content
```

into:

```
Premium User Interface
+ Interactive Learning Engine
+ Adaptive AI Tutor
+ Scientifically Structured Practice
+ Long-Term Memory Reinforcement
+ Native-Quality Audio
```

The end result is not merely a visually impressive application, but a comprehensive, learner-centered German education platform that combines exceptional design with an engaging, evidence-informed learning experience — indistinguishable from sitting beside an expert tutor who knows when to explain, when to challenge, when to encourage, and when to review.

---

*Version 2.0 — Revised with business objectives, learning philosophy, architecture overview (core model, dependency graph, data architecture, AI strategy, content pipeline, content standards), QA strategy, performance budget, monthly cost analysis, scalability plan, failure recovery, product milestones, out-of-scope definitions, P0/P1/P2 prioritization, and per-phase "Definition of Success" completion criteria.*
