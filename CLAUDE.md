# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**DeutschCoach** — a full-stack German language learning platform with structured curriculum (A1–C1), SM-2 spaced repetition flashcards, auto-generated quizzes, AI-powered chat tutor, and Stripe subscription billing.

| Layer | Stack | Purpose |
|-------|-------|---------|
| `backend/` | FastAPI, SQLAlchemy 2.0, SQLite/MySQL, Alembic | REST API + AI chat + SRS engine |
| `web/` | Next.js 16, TypeScript, Tailwind v4, TanStack React Query | Learner-facing frontend |
| `packages/shared/` | TypeScript | Shared types + UI components |

The project is an **npm monorepo** (`"workspaces": ["packages/*", "web"]`).

## Common commands

### Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Database migrations
alembic upgrade head                # apply pending migrations
alembic revision --autogenerate -m "description"  # create a migration
alembic downgrade -1                # roll back one

# Tests
python -m pytest tests/ -v
```

### Frontend

```bash
cd web
npm run dev          # Next.js dev on port 3000 (configure .env.local for 3456)
npm run build        # production build
npm run lint         # ESLint
```

### Docker

```bash
docker compose up -d    # start all services (MySQL, backend, frontend)
docker compose down     # stop
```

Services: MySQL `:3306`, Backend `:8001`, Frontend `:3456`

## Architecture

### Backend (`backend/`)

```
backend/
├── main.py                    # FastAPI app, CORS, router registration, startup hook
├── database.py                # SQLAlchemy engine, SessionLocal, Base, get_db()
├── alembic/                   # migrations
├── data/curriculum/           # Markdown+YAML lesson files (A1–C1)
└── app/
    ├── models/                # 9 SQLAlchemy models
    ├── routers/               # 9 FastAPI routers
    ├── schemas/               # Pydantic request/response schemas
    ├── curriculum_loader.py   # Parses MD+YAML lesson files, syncs to DB at startup
    ├── quiz/generator.py      # In-memory quiz session generator
    └── srs/engine.py          # SM-2 spaced repetition algorithm (pure function)
```

- **Auth**: JWT (PyJWT + bcrypt). Dependency chain: `get_current_user` → `require_tier_access(level)`.
- **Subscription tiers**: free (A1), starter (A1–A2), plus (A1–B1), pro (A1–C1). Gated via `require_tier_access()` dependency.
- **Database**: Defaults to SQLite (dev), MySQL via `DATABASE_URL` env var (production).
- **Curriculum**: Lessons stored as Markdown with YAML frontmatter in `data/curriculum/{level}/{lesson}.md`. Synced to DB at startup via `curriculum_loader.py`.
- **AI Chat**: Uses Anthropic API (overridden in `.env` to DeepSeek's Anthropic-compatible endpoint).

### Frontend (`web/`)

```
web/
├── app/
│   ├── layout.tsx              # Root layout (Providers wrapper)
│   ├── page.tsx                # Login page
│   ├── signup/                 # Registration
│   ├── forgot-password/        # Password reset request
│   ├── reset-password/         # Password reset with token
│   └── (app)/                  # Authenticated route group
│       ├── layout.tsx          # Header + sidebar + nav
│       ├── dashboard/          # Stats, continue learning, weakest words
│       ├── curriculum/         # Level accordion → lesson detail
│       ├── chat/               # AI chat with scenarios
│       ├── quiz/               # Quiz setup → questions → results
│       ├── review/             # SRS flashcard review
│       ├── grammar/            # Grammar browser + detail
│       └── settings/           # Profile, subscription, preferences
├── components/                 # Feature components (auth, chat, quiz, srs, etc.)
├── contexts/
│   ├── AuthContext.tsx          # JWT auth (cookie + localStorage)
│   ├── Providers.tsx            # QueryClient + Theme + Auth providers
│   └── ThemeContext.tsx          # 15-color theme system
├── lib/api.ts                  # Fetch wrapper with JWT injection
├── middleware.ts               # Server-side route protection (cookie check)
└── types/index.ts              # Re-exports from @deutschcoach/shared
```

- **Auth flow**: `AuthContext` stores JWT in both `localStorage` and an `auth_token` cookie. The cookie enables server-side middleware to protect routes without an API call. Login page is at `/`.
- **Styling**: Tailwind CSS v4 with 15 theme variants (indigo, amber, emerald, rose, mono, ocean, sunset, forest, plum, steel, cherry, mint, lavender, copper, onyx). Dark mode via `.dark` class.
- **Theme**: CSS custom properties injected by `ThemeContext`, persisted in localStorage.
- **Data fetching**: TanStack React Query v5. `Providers.tsx` wraps the app with `QueryClientProvider`.

## Key conventions

- **Backend model pattern**: Inherit from `Base` (SQLAlchemy `declarative_base()`), define `__tablename__`, use `Column()` with explicit types, include `created_at`/`updated_at` timestamps.
- **Backend router pattern**: `APIRouter(prefix="/<entity>", tags=["<Entity>"])`, endpoints use `db: Session = Depends(get_db)` and `current_user: User = Depends(get_current_user)`.
- **Frontend component pattern**: One component file per feature area. Data tables use TanStack React Query. Modals for create/edit.
- **Migrations**: Always use Alembic. After editing/adding models: `cd backend && alembic revision --autogenerate -m "description"` then `alembic upgrade head`.
- **Curriculum format**: Each lesson is a `.md` file with YAML frontmatter (`title`, `topics`, `vocabulary`, `grammar`, `exercises`). New lessons sync to DB automatically on server start.
- **SRS**: SM-2 algorithm in `app/srs/engine.py`. Pure function `calculate_srs(card, rating)` with no DB side effects. Ratings 0–5 control interval growth and ease factor.
- **Password reset / SMTP**: `send_reset_email()` in `app/routers/auth.py` has a two-mode design: if `SMTP_HOST` is unset (dev), the reset link prints to the server console. When `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` are configured, it sends a real email via SMTP (TLS on port 587). All SMTP vars are documented in `backend/.env.example`.
- **Quiz sessions**: Stored in the `quiz_sessions` database table (migration `d8e9f0a1b2c3`). Sessions auto-expire after 1 hour and are swept on creation. Previously used an in-memory dict — the DB-backed store survives restarts and works across multiple workers.
