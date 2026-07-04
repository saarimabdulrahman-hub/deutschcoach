# DeutschCoach — German Language Learning Platform

## Overview

DeutschCoach is a structured German learning app with a fixed curriculum (A1→C1),
deterministic grammar/vocab data, SM-2 spaced repetition, and Stripe subscriptions.
Unlike an LLM chat, it has real memory, real SRS scheduling, and never hallucinates
a conjugation or translation.

The platform backend serves both DeutschCoach (single-track German) and, later,
Idioma (multi-language marketplace). They share auth, payments, SRS, and quiz
infrastructure.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | FastAPI + SQLAlchemy 2.0 + SQLite | Familiar from car-guys-backend; Alembic migrations; Python NLP-ready |
| Frontend | Next.js 16, TypeScript, Tailwind v4 | Same as pitnest-plus; hybrid UI (tabs + command bar) |
| Auth | JWT (email + password), bcrypt hashing | Stateless, no session store needed |
| Payments | Stripe Checkout + Customer Portal | PCI-compliant; handles billing, invoices, cancellations |
| Database | SQLite (dev) → PostgreSQL (prod) | SQLAlchemy makes the swap a one-line config change |
| SRS | SM-2 algorithm (pure Python function) | Standard algorithm; per-card easiness, interval, due date |

## Architecture

```
german-tutor-chatbot/
├── backend/                    (FastAPI)
│   ├── main.py                 # App factory, CORS, router registration
│   ├── database.py             # SQLAlchemy engine, SessionLocal, Base
│   ├── alembic/                # DB migrations
│   ├── .env                    # JWT secret, Stripe keys, DB path
│   ├── data/
│   │   └── curriculum/         # Curated curriculum (Markdown + YAML frontmatter)
│   │       ├── a1/
│   │       ├── a2/
│   │       ├── b1/
│   │       ├── b2/
│   │       └── c1/
│   └── app/
│       ├── models/             # SQLAlchemy ORM models
│       ├── schemas/            # Pydantic request/response schemas
│       └── routers/            # auth, curriculum, srs, quiz, grammar, payments, dashboard
│
├── web/                        (Next.js 16)
│   ├── app/
│   │   ├── page.tsx            # Login (Netflix-style hero, email+password form)
│   │   ├── signup/             # Registration → tier selection → Stripe checkout
│   │   ├── (app)/              # Authenticated route group: dashboard, curriculum, srs, quiz, grammar, settings
│   │   └── api/                # (reserved for any client-side API needs)
│   ├── components/
│   │   ├── ui/                 # Shared: CommandBar, tabs, cards, modals
│   │   ├── dashboard/          # Streak, stats, continue-learning, weakest-words
│   │   ├── curriculum/         # Lesson viewer, lesson list, progress tracker
│   │   ├── srs/                # Flashcard reviewer, rating buttons (0-5)
│   │   ├── quiz/               # Question renderer, session flow, results
│   │   └── grammar/            # Topic browser, topic detail page
│   ├── lib/
│   │   └── api.ts              # Centralized fetch wrapper with JWT injection
│   └── types/
│       └── index.ts            # TypeScript interfaces (mirrors backend schemas)
│
├── packages/
│   └── shared/                 (npm workspace — shared between apps, built first)
│       ├── types/              # TypeScript interfaces (mirrors backend Pydantic schemas)
│       ├── ui/                 # Shared components (CommandBar, tabs, cards, modals)
│       └── curriculum/         # Curriculum data types + parsing utilities
│
└── docs/
```

## Auth & Onboarding Flow

### Login Page (always the first page, Netflix-style)

- Full-screen background with dark overlay gradient
- Tagline: "Deutsch lernen. Jeden Tag."
- Email + Password fields + "Login" button
- "Forgot password?" link
- "New to DeutschCoach? Sign up →" CTA for new users
- **Returning users never see signup/pricing noise** — they land, log in, go straight to dashboard

### New User Flow

1. **Registration**: Name, email, password → account created with JWT returned
2. **Tier Selection**: Three tier cards presented side-by-side:

| Tier | Level Range | Monthly | Annual (25% off) |
|------|-------------|---------|-------------------|
| Starter | A1 → A2 | $8/mo | $72/yr ($6/mo) |
| Plus | A1 → B1 | $12/mo | $108/yr ($9/mo) |
| Pro | A1 → C1 | $18/mo | $162/yr ($13.50/mo) |

- Monthly/Annual toggle recalculates prices in real time
- 7-day free trial on all plans
- Each tier restricts which lessons are unlocked

3. **Stripe Checkout**: Redirect to Stripe-hosted checkout (PCI-compliant)
4. **Welcome → Dashboard**: Post-payment redirect, student sees their dashboard

## Database Schema

```
User
├── id (PK, autoincrement)
├── email (unique, indexed)
├── password_hash
├── name
├── subscription_tier (enum: free|starter|plus|pro)
├── stripe_customer_id
├── stripe_subscription_id
├── trial_ends_at (datetime, nullable — NULL = trial expired or never had one)
├── daily_streak (int, default 0)
├── last_active_date (date)
├── target_level (enum: A1..C1, default A1)
├── settings (JSON: reminders_enabled, daily_goal_cards, quiz_size)
├── created_at
└── updated_at

Lesson
├── id (PK)
├── level (enum: A1..C1)
├── unit (int)
├── order (int within unit)
├── title
├── description
├── content (Markdown)
├── topics (JSON string array)
├── prerequisite_lesson_id (FK → Lesson, nullable)
├── created_at
└── updated_at

VocabEntry
├── id (PK)
├── lesson_id (FK → Lesson)
├── german
├── english
├── part_of_speech
├── gender (m|f|n|null)
├── plural_form (nullable)
├── example_sentence
├── audio_url (nullable)
├── difficulty_rank (1-5)
├── created_at
└── updated_at

GrammarTopic
├── id (PK)
├── slug (unique)
├── title
├── level (enum: A1..C1)
├── content (Markdown)
├── examples (JSON)
├── related_lesson_ids (JSON)
├── created_at
└── updated_at

SRSState
├── id (PK)
├── user_id (FK → User, indexed)
├── vocab_entry_id (FK → VocabEntry)
├── easiness_factor (float, default 2.5)
├── interval_days (int, default 0)
├── repetitions (int, default 0)
├── lapses (int, default 0)
├── next_review_at (datetime, indexed)
├── last_reviewed_at (datetime, nullable)
├── status (enum: new|learning|reviewing|mastered, default new)
├── created_at
└── updated_at
UNIQUE(user_id, vocab_entry_id)

QuizResult
├── id (PK)
├── user_id (FK → User, indexed)
├── quiz_type (enum: translate|fill-blank|multiple-choice|conjugate|mixed)
├── score_pct (float)
├── questions_total (int)
├── questions_correct (int)
├── missed_vocab_ids (JSON)
├── created_at

LessonProgress
├── id (PK)
├── user_id (FK → User, indexed)
├── lesson_id (FK → Lesson)
├── completed_at (datetime, nullable — null = in progress)
├── quiz_score (float, nullable)
UNIQUE(user_id, lesson_id)

UserVocabNote (custom flashcards)
├── id (PK)
├── user_id (FK → User, indexed)
├── german
├── english
├── notes (nullable)
├── created_at

PasswordResetToken
├── id (PK)
├── user_id (FK → User)
├── token (unique, indexed)
├── expires_at (datetime)
├── used (bool, default false)
```

## Curriculum Structure

Lessons live as Markdown files with YAML frontmatter in `backend/data/curriculum/`,
organized by level:

```
data/curriculum/
├── a1/01-greetings.md
├── a1/02-introductions.md
├── ...
├── a2/01-at-the-restaurant.md
├── ...
├── b1/01-job-interviews.md
├── ...
├── b2/...
└── c1/...
```

Each file contains machine-readable frontmatter (vocabulary, grammar slugs, exercises)
and a human-readable Markdown body (dialogue, explanations, practice). The API loads
all `.md` files at startup, parses frontmatter, and syncs to the database when new
lessons are detected.

## SM-2 Spaced Repetition Engine

Pure function in `app/srs/engine.py`: `calculate_srs(card: SRSState, rating: int) -> SRSState`

- Rating scale: 0 (complete blackout) to 5 (perfect recall)
- Rating ≥ 3: increment repetitions, grow interval (1→6→interval*ease), adjust ease factor
- Rating < 3 (lapse): reset repetitions to 0, interval to 1 day, reduce ease by 0.2 (min 1.3)
- Status progression: new → learning → reviewing → mastered (5+ successful reps)
- `next_review_at = now + interval_days`

Daily review: query `SRSState WHERE next_review_at <= now() AND user_id = ?`,
present one card at a time (German → tap to reveal English), student rates 0-5.

Vocab enters SRS when:
- Completing a lesson (all vocab entries seeded as "new")
- Missing a word in a quiz (seeded or interval reset)
- Student adds a custom card

## Quiz Engine

Auto-generated from the vocab database. Four question types:
- **Translate**: German ↔ English
- **Fill-in-blank**: Sentence with missing word, conjugation hint in parentheses
- **Multiple choice**: Correct answer + 3 distractors from same-lesson vocab
- **Conjugate**: Given verb + person + tense, provide correct form

Session flow:
1. `POST /quiz/generate` → returns session_id + question list
2. Student answers one at a time (no back button)
3. `POST /quiz/{session_id}/submit` → returns score + per-question feedback + grammar links
4. Side effects: QuizResult created, missed vocab fed into SRS

MC distractors: drawn from same part-of-speech + similar difficulty, never random.

## Grammar Reference

Searchable, filterable by level. Each topic has:
- Slug-based URL (`/grammar/akkusativ`)
- Markdown content with tables + examples
- Related lesson links (bidirectional — lessons also link to grammar topics)
- Linked from quiz feedback ("Wrong article — review Accusative")

## Dashboard

Single API call (`GET /dashboard`) returns all widgets:
- Daily streak (incremented on first activity each day)
- Cards due today (count from SRSState)
- Average quiz score (from QuizResult)
- Level progress (% of lessons completed in current level)
- "Continue Learning" — most recent in-progress lesson
- Recent activity (union of quiz results, lesson completions, SRS reviews)
- Weakest words (top 5 by SRS lapses)

## Command Bar (Quick Actions)

Ctrl+K or tap search icon. Keyword routing — no ML, no LLM:
- `quiz <topic>` — generate a quiz
- `translate <word>` — German ↔ English lookup
- `conjugate <verb>` — conjugation table
- `grammar <topic>` — jump to grammar reference
- `review` — start SRS session
- `lesson <number>` — jump to lesson
- `add "german" "english"` — custom flashcard

First token = command, rest = argument. No match → full-text search across lessons,
grammar, and vocab.

## Settings

- Profile: name, email, change password
- Subscription: current plan, upgrade/downgrade, Stripe Customer Portal, cancel
- Preferences: daily card goal, quiz size, reminder toggle + time
- Billing history: list of past invoices
- Danger zone: delete account (cascade all user data)

## API Surface

```
POST   /auth/signup              # Name, email, password → JWT
POST   /auth/login               # Email, password → JWT
POST   /auth/forgot-password     # Email → sends reset link
POST   /auth/reset-password      # Token + new password → JWT

GET    /dashboard                # All dashboard widgets in one call

GET    /curriculum               # List all levels + lesson tree
GET    /curriculum/{level}       # Lessons for a level
GET    /curriculum/{level}/{id}  # Single lesson with vocab + exercises

GET    /grammar                  # List/search grammar topics (?q=&level=)
GET    /grammar/{slug}           # Single grammar topic

GET    /quiz/next                # Suggested next quiz (current lesson + weak words)
POST   /quiz/generate            # Generate: { lesson_id?, level?, vocab_ids?, count }
POST   /quiz/{session_id}/submit # Submit answers → score + feedback + SRS updates

GET    /srs/due                  # Cards due (paginated, ?limit=)
POST   /srs/review               # Submit rating: { card_id, rating (0-5) }
GET    /srs/stats                # Counts by status: new, learning, reviewing, mastered
POST   /srs/custom               # Add custom flashcard: { german, english, notes }

GET    /payments/plans           # Available plans + pricing
POST   /payments/checkout        # Create Stripe checkout session → redirect URL
POST   /payments/webhook         # Stripe webhook (plan change, cancel, invoice)
GET    /payments/history         # Billing history

GET    /user/profile             # Get profile
PATCH  /user/profile             # Update name, email, preferences
POST   /user/delete-account      # Cascade delete
```

## Pricing Tiers

| Tier | Level Range | Monthly | Annual (25% off) | Trial |
|------|-------------|---------|-------------------|-------|
| Starter | A1 → A2 | $8/mo | $72/yr | 7 days |
| Plus | A1 → B1 | $12/mo | $108/yr | 7 days |
| Pro | A1 → C1 | $18/mo | $162/yr | 7 days |

## Future: Idioma Marketplace

The same backend serves Idioma later:
- Add Course, Section, Enrollment, InstructorPayout models
- Add instructor role + Stripe Connect
- Idioma frontend reuses `packages/shared` for UI components + types
- Curriculum data format is shared — DeutschCoach lessons become Idioma course content
