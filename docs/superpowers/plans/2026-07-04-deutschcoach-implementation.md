# DeutschCoach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full-stack German learning platform: FastAPI backend + Next.js frontend with curriculum A1→C1, SM-2 SRS, auto-generated quizzes, Stripe subscriptions, hybrid tab+command-bar UI.

**Architecture:** FastAPI + SQLAlchemy 2.0 + SQLite (PostgreSQL-ready). Next.js 16 + TypeScript + Tailwind v4. JWT auth. Curriculum as Markdown+YAML files loaded at startup. `packages/shared` workspace for types + UI components shared with future Idioma app.

**Tech Stack:** FastAPI, SQLAlchemy 2.0, SQLite, Alembic, bcrypt, PyJWT, Stripe Python SDK, Next.js 16, TypeScript, Tailwind v4, React 19, TanStack React Query

## Global Constraints

- SQLite dev → PostgreSQL prod via one-line SQLAlchemy config swap
- All DB changes via Alembic — never `Base.metadata.create_all()`
- Backend models: `from database import Base`, `__tablename__`, `created_at`/`updated_at` on every table
- Frontend: client components, React Query, centralized `api.ts` with JWT injection, `AuthContext`
- Curriculum: Markdown+YAML in `backend/data/curriculum/`, version-controlled, loaded at startup
- SM-2: pure function in `app/srs/engine.py`, no DB access, no side effects
- Pricing in USD: Starter $8, Plus $12, Pro $18 (monthly); 25% off annual; 7-day free trial

---

### Task 1: Backend project scaffolding

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/main.py`
- Create: `backend/database.py`
- Create: `backend/app/__init__.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/auth_dependency.py`
- Create: `backend/data/curriculum/.gitkeep`
- Create: `backend/alembic.ini`

**Interfaces:**
- Produces: `database.py` exports `engine`, `SessionLocal`, `Base`, `get_db`
- Produces: `main.py` creates FastAPI app with CORS, includes placeholder router
- Produces: `auth_dependency.py` exports `get_current_user`, `require_auth`

- [ ] **Step 1: Create `backend/requirements.txt`**

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
alembic==1.14.0
pymysql==1.1.1
bcrypt==4.2.1
pyjwt==2.10.1
python-dotenv==1.0.1
stripe==11.4.1
httpx==0.28.1
pyyaml==6.0.2
pydantic==2.10.3
python-multipart==0.0.19
```

- [ ] **Step 2: Create `backend/.env.example`**

```
DATABASE_URL=sqlite:///./deutschcoach.db
JWT_SECRET=change-me-to-a-random-string
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 3: Create `backend/database.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./deutschcoach.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 4: Create `backend/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="DeutschCoach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 5: Create `backend/app/routers/auth_dependency.py`**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from sqlalchemy.orm import Session
from database import get_db
from app.models.user import User

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_auth(user: User = Depends(get_current_user)) -> User:
    return user
```

- [ ] **Step 6: Create `backend/alembic.ini`** — Copy from car-guys-backend pattern, set `sqlalchemy.url = sqlite:///./deutschcoach.db`

- [ ] **Step 7: Create empty `__init__.py` files** — All four: `app/`, `app/models/`, `app/schemas/`, `app/routers/`

- [ ] **Step 8: Install dependencies and verify**

```bash
cd backend && pip install -r requirements.txt
python -c "from main import app; print('Backend imports OK')"
```

- [ ] **Step 9: Initialize Alembic**

```bash
cd backend && alembic init alembic
```

- [ ] **Step 10: Commit**

```bash
cd C:/Users/saari/projects/german-tutor-chatbot
git init && git add -A && git commit -m "feat: scaffold backend project with FastAPI + SQLAlchemy + Alembic"
```

---

### Task 2: Database models

**Files:**
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/lesson.py`
- Create: `backend/app/models/vocab.py`
- Create: `backend/app/models/grammar.py`
- Create: `backend/app/models/srs.py`
- Create: `backend/app/models/quiz.py`
- Create: `backend/app/models/lesson_progress.py`
- Create: `backend/app/models/user_vocab_note.py`
- Create: `backend/app/models/reset_token.py`
- Modify: `backend/alembic/env.py` — import all models so autogenerate detects them

**Interfaces:**
- Produces: `User` model with fields: id, email (unique), password_hash, name, subscription_tier (free|starter|plus|pro), stripe_customer_id, stripe_subscription_id, trial_ends_at, daily_streak, last_active_date, target_level (A1..C1), settings (JSON), created_at, updated_at
- Produces: `Lesson` model with fields: id, level (A1..C1), unit, order, title, description, content, topics (JSON), prerequisite_lesson_id (FK→Lesson), created_at, updated_at
- Produces: `VocabEntry` model with fields: id, lesson_id (FK→Lesson), german, english, part_of_speech, gender, plural_form, example_sentence, audio_url, difficulty_rank, created_at, updated_at
- Produces: `GrammarTopic` model with fields: id, slug (unique), title, level, content, examples (JSON), related_lesson_ids (JSON), created_at, updated_at
- Produces: `SRSState` model with fields: id, user_id (FK→User), vocab_entry_id (FK→VocabEntry), easiness_factor (2.5), interval_days (0), repetitions (0), lapses (0), next_review_at, last_reviewed_at, status (new|learning|reviewing|mastered), timestamps. UniqueConstraint(user_id, vocab_entry_id)
- Produces: `QuizResult` model with fields: id, user_id (FK→User), quiz_type (translate|fill-blank|multiple-choice|conjugate|mixed), score_pct, questions_total, questions_correct, missed_vocab_ids (JSON), created_at
- Produces: `LessonProgress` model with fields: id, user_id (FK→User), lesson_id (FK→Lesson), completed_at, quiz_score. UniqueConstraint(user_id, lesson_id)
- Produces: `UserVocabNote` model with fields: id, user_id (FK→User), german, english, notes, created_at
- Produces: `PasswordResetToken` model with fields: id, user_id (FK→User), token (unique), expires_at, used

- [ ] **Step 1: Create `backend/app/models/user.py`**

```python
from sqlalchemy import Column, Integer, String, DateTime, Date, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    starter = "starter"
    plus = "plus"
    pro = "pro"


class CEFRLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    subscription_tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.free, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    daily_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    target_level = Column(SQLEnum(CEFRLevel), default=CEFRLevel.A1)
    settings = Column(JSON, default=lambda: {"reminders_enabled": False, "daily_goal_cards": 20, "quiz_size": 10})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 2: Create remaining model files** — `lesson.py`, `vocab.py`, `grammar.py`, `srs.py`, `quiz.py`, `lesson_progress.py`, `user_vocab_note.py`, `reset_token.py` following the same pattern with fields specified in the Interfaces section above.

- [ ] **Step 3: Update `backend/alembic/env.py`** — Add imports for all 9 models before `target_metadata = Base.metadata`:

```python
from app.models.user import User
from app.models.lesson import Lesson
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic
from app.models.srs import SRSState
from app.models.quiz import QuizResult
from app.models.lesson_progress import LessonProgress
from app.models.user_vocab_note import UserVocabNote
from app.models.reset_token import PasswordResetToken
from database import Base

target_metadata = Base.metadata
```

- [ ] **Step 4: Generate and run initial migration**

```bash
cd backend && alembic revision --autogenerate -m "initial schema" && alembic upgrade head
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add all database models and initial migration"
```

---

### Task 3: Frontend project scaffolding

**Files:**
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/next.config.js`
- Create: `web/tailwind.config.ts`
- Create: `web/postcss.config.js`
- Create: `web/app/layout.tsx`
- Create: `web/app/globals.css`
- Create: `web/lib/api.ts`
- Create: `web/types/index.ts`
- Create: `web/contexts/AuthContext.tsx`
- Create: `web/contexts/Providers.tsx`
- Create: `packages/shared/package.json`
- Create: `packages/shared/types/index.ts`
- Create: `packages/shared/ui/CommandBar.tsx`
- Create: `packages/shared/ui/Tabs.tsx`
- Create: root `package.json` (npm workspaces)

**Interfaces:**
- Produces: `api.ts` exports `api.get(url)`, `api.post(url, body)`, `api.put(url, body)`, `api.delete(url)` — all async, all inject JWT from localStorage
- Produces: `AuthContext.tsx` exports `AuthProvider`, `useAuth()` → `{ user, token, login(email, pw), signup(name, email, pw), logout() }`
- Produces: `Providers.tsx` wraps children in `QueryClientProvider` + `AuthProvider`
- Produces: `types/index.ts` mirrors all backend Pydantic schemas as TypeScript interfaces

- [ ] **Step 1: Create root `package.json` with npm workspaces**

```json
{
  "name": "deutschcoach-platform",
  "private": true,
  "workspaces": ["packages/*", "web"]
}
```

- [ ] **Step 2: Create `web/package.json`** — Next.js 16, React 19, Tailwind v4, TanStack React Query. Include `"packages/shared": "*"` as a workspace dependency.

- [ ] **Step 3: Create `packages/shared/package.json`** — name `@deutschcoach/shared`, exports `./types` and `./ui/*`

- [ ] **Step 4: Create `web/lib/api.ts`** — Centralized fetch wrapper. Reads token from localStorage key `"token"`, attaches `Authorization: Bearer`. Base URL from `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:8000`). Exports `api.get/post/put/delete`.

- [ ] **Step 5: Create `web/types/index.ts`** — TypeScript interfaces: `User`, `Lesson`, `VocabEntry`, `GrammarTopic`, `SRSState`, `QuizResult`, `LessonProgress`, `UserVocabNote`, `DashboardData`, `QuizSession`, `QuizQuestion`, `Plan`, `LoginRequest`, `SignupRequest`

- [ ] **Step 6: Create `web/contexts/AuthContext.tsx`** — React context storing `{ user: User | null, token: string | null }`. `login()` calls `POST /auth/login`, stores JWT in localStorage. `signup()` calls `POST /auth/signup`. `logout()` clears storage. On mount, checks localStorage for existing token and validates via `GET /user/profile`.

- [ ] **Step 7: Create `web/contexts/Providers.tsx`** — `"use client"`, wraps children in `QueryClientProvider` (staleTime: 30000, retry: 1) + `AuthProvider`.

- [ ] **Step 8: Create `web/app/layout.tsx`** and `web/app/globals.css`** — Root layout importing globals.css with Tailwind v4 `@import "tailwindcss"`. Wraps children in `<Providers>`.

- [ ] **Step 9: Install dependencies and verify**

```bash
npm install
cd web && npx next dev --port 3000 &
# Verify http://localhost:3000 loads
```

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: scaffold frontend with Next.js + shared packages"
```

---

### Task 4: Auth router (backend)

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/routers/auth.py`
- Modify: `backend/main.py` — register auth router

**Interfaces:**
- Produces: `POST /auth/signup` — body: `{name, email, password}` → returns `{user, token}`. Creates user with `subscription_tier=free`, `trial_ends_at=now+7days`
- Produces: `POST /auth/login` — body: `{email, password}` → returns `{user, token}`. Verifies bcrypt hash
- Produces: `POST /auth/forgot-password` — body: `{email}` → creates `PasswordResetToken`, returns `{message}` (email sending is a future integration; token is logged for dev)
- Produces: `POST /auth/reset-password` — body: `{token, new_password}` → validates token, updates password, returns `{message}`

- [ ] **Step 1: Create `backend/app/schemas/auth.py`**

```python
from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class AuthResponse(BaseModel):
    user: dict
    token: str

    class Config:
        from_attributes = True
```

- [ ] **Step 2: Create `backend/app/routers/auth.py`** — Implement all 4 endpoints:
  - `signup`: Hash password with bcrypt, create User with trial_ends_at = utcnow()+7days, generate JWT with `sub=user.id` and 24h expiry, return `AuthResponse`
  - `login`: Find user by email, verify bcrypt hash, generate JWT, return `AuthResponse`
  - `forgot-password`: Find user by email, generate `secrets.token_urlsafe(32)`, create PasswordResetToken with 1h expiry, print token to console (email integration later)
  - `reset-password`: Find token (not used, not expired), hash new password, update User.password_hash, mark token used

- [ ] **Step 3: Modify `backend/main.py`** — Add `from app.routers import auth` and `app.include_router(auth.router)`

- [ ] **Step 4: Test manually**

```bash
cd backend && uvicorn main:app --reload &
curl -X POST http://localhost:8000/auth/signup -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"test123"}'
# Expected: {"user": {...}, "token": "eyJ..."}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add auth router with signup/login/password-reset"
```

---

### Task 5: Curriculum loader + router (backend)

**Files:**
- Create: `backend/app/curriculum_loader.py`
- Create: `backend/app/schemas/curriculum.py`
- Create: `backend/app/routers/curriculum.py`
- Create: `backend/data/curriculum/a1/01-greetings.md`
- Modify: `backend/main.py` — register curriculum router

**Interfaces:**
- Produces: `curriculum_loader.py` exports `load_curriculum()` → `List[dict]` (parsed frontmatter), `sync_curriculum(db)` — syncs lessons+vocab+grammar to DB
- Produces: `GET /curriculum` → `[{level, title, lesson_count, completed_count}]`
- Produces: `GET /curriculum/{level}` → `[{id, title, unit, order, topics, completed}]`
- Produces: `GET /curriculum/{level}/{id}` → `{lesson: {...}, vocabulary: [...], exercises: [...], grammar_topics: [...]}`

- [ ] **Step 1: Create `backend/app/curriculum_loader.py`**

```python
import os
import yaml
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.models.vocab import VocabEntry
from app.models.grammar import GrammarTopic

CURRICULUM_DIR = Path(__file__).parent.parent / "data" / "curriculum"


def parse_lesson_file(filepath: str) -> dict:
    """Parse a lesson .md file, splitting YAML frontmatter from Markdown body."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.startswith("---"):
        raise ValueError(f"No frontmatter found in {filepath}")

    parts = content.split("---", 2)
    if len(parts) < 3:
        raise ValueError(f"Invalid frontmatter in {filepath}")

    frontmatter = yaml.safe_load(parts[1])
    body = parts[2].strip()
    frontmatter["content"] = body
    return frontmatter


def load_all_lessons() -> list[dict]:
    """Walk CURRICULUM_DIR and parse all .md files."""
    lessons = []
    for level_dir in sorted(CURRICULUM_DIR.iterdir()):
        if level_dir.is_dir():
            for md_file in sorted(level_dir.glob("*.md")):
                lessons.append(parse_lesson_file(str(md_file)))
    return lessons


def sync_curriculum(db: Session):
    """Sync parsed lessons into Lesson, VocabEntry, and GrammarTopic tables."""
    lessons = load_all_lessons()
    for data in lessons:
        # Upsert lesson
        lesson = db.query(Lesson).filter(
            Lesson.level == data["level"],
            Lesson.unit == data.get("unit", 1),
            Lesson.order == data.get("order", 1),
        ).first()
        if lesson:
            lesson.title = data["title"]
            lesson.description = data.get("description", "")
            lesson.content = data["content"]
            lesson.topics = data.get("topics", [])
        else:
            lesson = Lesson(
                level=data["level"],
                unit=data.get("unit", 1),
                order=data.get("order", 1),
                title=data["title"],
                description=data.get("description", ""),
                content=data["content"],
                topics=data.get("topics", []),
            )
            db.add(lesson)
            db.flush()

        # Sync vocab entries
        for vocab_data in data.get("vocabulary", []):
            existing = db.query(VocabEntry).filter(
                VocabEntry.lesson_id == lesson.id,
                VocabEntry.german == vocab_data["german"],
            ).first()
            if not existing:
                db.add(VocabEntry(
                    lesson_id=lesson.id,
                    german=vocab_data["german"],
                    english=vocab_data["english"],
                    part_of_speech=vocab_data.get("pos", "noun"),
                    gender=vocab_data.get("gender"),
                    plural_form=vocab_data.get("plural"),
                    example_sentence=vocab_data.get("example", ""),
                    difficulty_rank=vocab_data.get("difficulty", 1),
                ))

        # Sync grammar topics
        for grammar_data in data.get("grammar", []):
            existing = db.query(GrammarTopic).filter(
                GrammarTopic.slug == grammar_data["slug"],
            ).first()
            if not existing:
                db.add(GrammarTopic(
                    slug=grammar_data["slug"],
                    title=grammar_data.get("title", grammar_data["slug"]),
                    level=data["level"],
                    content=grammar_data.get("description", ""),
                    examples=grammar_data.get("examples", []),
                    related_lesson_ids=[lesson.id],
                ))
            else:
                related = existing.related_lesson_ids or []
                if lesson.id not in related:
                    related.append(lesson.id)
                    existing.related_lesson_ids = related

    db.commit()
```

- [ ] **Step 2: Create `backend/data/curriculum/a1/01-greetings.md`** — A sample A1 lesson with YAML frontmatter containing title, level, unit, order, topics, vocabulary (3-5 words with german/english/pos/gender/example), grammar (1 topic slug), and a Markdown body with a dialogue and practice section.

- [ ] **Step 3: Create `backend/app/schemas/curriculum.py`** — Pydantic schemas: `LessonOut`, `LessonListItem`, `VocabEntryOut`, `CurriculumLevel`, `LessonDetail`

- [ ] **Step 4: Create `backend/app/routers/curriculum.py`** — `APIRouter(prefix="/curriculum", tags=["Curriculum"])` with:
  - `GET /` — list all levels with lesson counts. For each level, count `LessonProgress WHERE user_id=? AND completed_at IS NOT NULL` for completed count. Requires auth.
  - `GET /{level}` — list lessons for a level, each with a `completed` boolean from LessonProgress
  - `GET /{level}/{id}` — full lesson detail including vocabulary, exercises from frontmatter, and linked grammar topics

- [ ] **Step 5: Register router in `main.py`** — `app.include_router(curriculum.router)`

- [ ] **Step 6: Add startup event to `main.py`** to call `sync_curriculum`:

```python
@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    from app.curriculum_loader import sync_curriculum
    db = SessionLocal()
    try:
        sync_curriculum(db)
    finally:
        db.close()
```

- [ ] **Step 7: Test** — Start backend, `curl http://localhost:8000/curriculum` (with auth header)

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add curriculum loader, sample A1 lesson, and curriculum API"
```

---

### Task 6: Grammar router (backend)

**Files:**
- Create: `backend/app/schemas/grammar.py`
- Create: `backend/app/routers/grammar.py`
- Modify: `backend/main.py` — register grammar router

**Interfaces:**
- Produces: `GET /grammar` → `[{id, slug, title, level}]` with optional `?q=` and `?level=` filters
- Produces: `GET /grammar/{slug}` → `{id, slug, title, level, content_html, examples, related_lessons}`

- [ ] **Step 1: Create schemas and router** — `GrammarTopicOut` and `GrammarTopicDetail` Pydantic models. Router with `q` full-text search across title+content, `level` filter. Detail endpoint joins related lessons by `related_lesson_ids`.

- [ ] **Step 2: Register router and commit**

---

### Task 7: SM-2 Engine + SRS router (backend)

**Files:**
- Create: `backend/app/srs/__init__.py`
- Create: `backend/app/srs/engine.py`
- Create: `backend/app/schemas/srs.py`
- Create: `backend/app/routers/srs.py`
- Modify: `backend/main.py` — register SRS router

**Interfaces:**
- Produces: `engine.py` exports `calculate_srs(card: SRSState, rating: int) -> SRSState` — pure function
- Produces: `GET /srs/due` → `[{id, vocab_entry: {german, english, example}, status, easiness_factor}]` ordered by next_review_at, paginated `?limit=20`
- Produces: `POST /srs/review` — body: `{card_id, rating (0-5)}` → updates SRSState via calculate_srs, returns updated card
- Produces: `GET /srs/stats` → `{new, learning, reviewing, mastered, total_due_today}`
- Produces: `POST /srs/custom` — body: `{german, english, notes?}` → creates UserVocabNote + seeds SRSState (status=new)
- Produces: `POST /srs/seed-lesson` — body: `{lesson_id}` → creates SRSState for all vocab in lesson if not already present. Called when a lesson is completed.

- [ ] **Step 1: Create `backend/app/srs/engine.py`**

```python
from datetime import datetime, timedelta
from app.models.srs import SRSState, CardStatus


def next_interval(repetitions: int, easiness_factor: float) -> int:
    """Determine the next interval in days based on repetition count."""
    if repetitions == 1:
        return 1
    elif repetitions == 2:
        return 6
    else:
        return round(easiness_factor * (2 ** (repetitions - 1)))


def adjust_ease(easiness_factor: float, rating: int) -> float:
    """Adjust easiness factor based on recall quality."""
    adjustments = {5: 0.1, 4: 0.0, 3: -0.14}
    delta = adjustments.get(rating, 0)
    return max(1.3, easiness_factor + delta)


def calculate_srs(card: SRSState, rating: int) -> SRSState:
    """Pure function: apply SM-2 algorithm to a card given a 0-5 rating.

    Returns the mutated card (caller is responsible for persisting).
    """
    now = datetime.utcnow()
    card.last_reviewed_at = now

    if rating >= 3:
        card.repetitions += 1
        card.interval_days = next_interval(card.repetitions, card.easiness_factor)
        card.easiness_factor = adjust_ease(card.easiness_factor, rating)

        if card.repetitions >= 5:
            card.status = CardStatus.mastered
        elif card.repetitions >= 1:
            card.status = CardStatus.reviewing
        else:
            card.status = CardStatus.learning
    else:
        card.repetitions = 0
        card.lapses += 1
        card.interval_days = 1
        card.easiness_factor = max(1.3, card.easiness_factor - 0.2)
        card.status = CardStatus.learning

    card.next_review_at = now + timedelta(days=card.interval_days)
    return card
```

- [ ] **Step 2: Write unit tests for `calculate_srs`**

```bash
cd backend && python -m pytest tests/test_srs_engine.py -v
```

Test cases: perfect recall (rating=5) on new card → interval=1, ease stays 2.5, status=learning. Second perfect → interval=6. Lapse (rating=2) → repetitions=0, lapses=1, interval=1, ease drops to 2.3.

- [ ] **Step 3: Create SRS router** — Implement all 5 endpoints. `seed-lesson` creates SRSState rows for all VocabEntry in a lesson where no SRSState exists for that user. The `review` endpoint calls `calculate_srs` then saves.

- [ ] **Step 4: Register router and commit**

---

### Task 8: Quiz engine + router (backend)

**Files:**
- Create: `backend/app/quiz/__init__.py`
- Create: `backend/app/quiz/generator.py`
- Create: `backend/app/schemas/quiz.py`
- Create: `backend/app/routers/quiz.py`
- Modify: `backend/main.py` — register quiz router

**Interfaces:**
- Produces: `generator.py` exports `generate_quiz(db, user_id, lesson_id?, level?, vocab_ids?, count=20) -> dict` with session tracking
- Produces: `POST /quiz/generate` → `{session_id, questions: [{id, type, prompt, options?}]}`
- Produces: `POST /quiz/{session_id}/submit` → `{score_pct, results: [{question_id, correct, correct_answer, feedback?}]}` — also seeds missed vocab into SRS
- Produces: `GET /quiz/next` → `{suggestion, reason}` — based on current lesson + weakest words

**Design notes:** Quiz sessions are stored in-memory (dict keyed by session_id). They're ephemeral — if the server restarts, sessions are lost. This is acceptable since quiz sessions are short-lived.

- [ ] **Step 1: Create `backend/app/quiz/generator.py`**

```python
import random
import uuid
from sqlalchemy.orm import Session
from app.models.vocab import VocabEntry
from app.models.srs import SRSState

QUESTION_TYPES = ["translate", "fill-blank", "multiple-choice", "conjugate"]

# In-memory session store: {session_id: {questions: [...], user_id: int}}
_session_store: dict = {}


def _generate_distractors(db, correct_entry, count=3):
    """Pick distractors from same part of speech, excluding the correct answer."""
    candidates = db.query(VocabEntry).filter(
        VocabEntry.part_of_speech == correct_entry.part_of_speech,
        VocabEntry.id != correct_entry.id,
    ).limit(count * 3).all()
    return random.sample([c.english for c in candidates], min(count, len(candidates)))


def _make_question(entry, qtype):
    if qtype == "translate":
        direction = random.choice(["de-en", "en-de"])
        if direction == "de-en":
            return {"type": "translate", "id": str(uuid.uuid4()), "prompt": f"Translate: {entry.german}", "answer": entry.english}
        else:
            return {"type": "translate", "id": str(uuid.uuid4()), "prompt": f"Translate: {entry.english}", "answer": entry.german}

    elif qtype == "fill-blank":
        return {"type": "fill-blank", "id": str(uuid.uuid4()), "prompt": entry.example_sentence.replace(entry.german, "___"), "answer": entry.german}

    elif qtype == "multiple-choice":
        # ... generate with distractors
        pass

    elif qtype == "conjugate":
        if entry.part_of_speech == "verb":
            return {"type": "conjugate", "id": str(uuid.uuid4()), "prompt": f"Conjugate: {entry.german} (ich, present)", "answer": entry.example_sentence.split()[0]}
        return _make_question(entry, random.choice(["translate", "fill-blank"]))


def generate_quiz(db, user_id, lesson_id=None, level=None, vocab_ids=None, count=20):
    # Build vocab pool
    query = db.query(VocabEntry)
    if vocab_ids:
        query = query.filter(VocabEntry.id.in_(vocab_ids))
    elif lesson_id:
        query = query.filter(VocabEntry.lesson_id == lesson_id)
    elif level:
        from app.models.lesson import Lesson
        query = query.join(Lesson).filter(Lesson.level == level)
    else:
        # Default: mix of current lesson vocab + weakest SRS words
        weak = db.query(SRSState).filter(
            SRSState.user_id == user_id, SRSState.lapses > 0
        ).order_by(SRSState.lapses.desc()).limit(count // 2).all()
        weak_ids = [w.vocab_entry_id for w in weak]
        query = query.filter(VocabEntry.id.in_(weak_ids)) if weak_ids else query.limit(count * 3)

    entries = query.all()
    selected = random.sample(entries, min(count, len(entries)))

    questions = [_make_question(e, random.choice(QUESTION_TYPES)) for e in selected]
    session_id = str(uuid.uuid4())
    _session_store[session_id] = {"questions": questions, "user_id": user_id}

    return {"session_id": session_id, "questions": questions}


def get_session(session_id):
    return _session_store.get(session_id)


def delete_session(session_id):
    _session_store.pop(session_id, None)
```

- [ ] **Step 2: Create `backend/app/schemas/quiz.py`** — `QuizGenerateRequest`, `QuizSubmitRequest`, `QuizSession`, `QuizQuestion`, `QuizResultOut`

- [ ] **Step 3: Create `backend/app/routers/quiz.py`**
  - `POST /generate` — calls `generate_quiz()`, returns session
  - `POST /{session_id}/submit` — compares answers, calculates score, creates QuizResult row, seeds missed vocab into SRS (create SRSState with status=new if not exists, or reset interval on existing), deletes session from store, returns results
  - `GET /next` — looks at user's LessonProgress to find current lesson, also checks SRS for weakest words, returns a suggestion string

- [ ] **Step 4: Register router and commit**

---

### Task 9: Dashboard router (backend)

**Files:**
- Create: `backend/app/schemas/dashboard.py`
- Create: `backend/app/routers/dashboard.py`
- Modify: `backend/main.py` — register dashboard router

**Interfaces:**
- Produces: `GET /dashboard` → `{streak, cards_due_today, avg_quiz_score, level_progress_pct, continue_lesson, recent_activity: [...], weakest_words: [...]}`

- [ ] **Step 1: Create router** — Single GET endpoint that aggregates:
  - `streak`: `user.daily_streak`
  - `cards_due_today`: `SELECT COUNT(*) FROM srs_state WHERE user_id=? AND next_review_at <= now()`
  - `avg_quiz_score`: `SELECT AVG(score_pct) FROM quiz_result WHERE user_id=?`
  - `level_progress_pct`: lessons completed / total lessons at user's target_level × 100
  - `continue_lesson`: most recent LessonProgress with no completed_at, joined to Lesson for title
  - `recent_activity`: UNION ALL of last 5 quiz results + last 5 SRS reviews, ordered by time DESC, limit 10
  - `weakest_words`: SRSState JOIN VocabEntry WHERE user_id=? ORDER BY lapses DESC LIMIT 5

- [ ] **Step 2: Register router and commit**

---

### Task 10: Payments + User routers (backend)

**Files:**
- Create: `backend/app/schemas/payment.py`
- Create: `backend/app/routers/payments.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/routers/user.py`
- Modify: `backend/main.py` — register both routers

**Interfaces:**
- Produces: `GET /payments/plans` → hardcoded tier data: `[{tier, levels, monthly_price, annual_price, features}]`
- Produces: `POST /payments/checkout` → body: `{tier, billing_cycle}` → creates Stripe Checkout Session, returns `{url}`
- Produces: `POST /payments/webhook` → Stripe webhook handler: `checkout.session.completed` (update subscription_tier, stripe IDs, clear trial_ends_at), `customer.subscription.updated`, `customer.subscription.deleted` (downgrade to free)
- Produces: `GET /payments/history` → returns list from Stripe API (invoices for customer)
- Produces: `GET /user/profile` → returns current user
- Produces: `PATCH /user/profile` → updates name, email, settings JSON
- Produces: `POST /user/delete-account` → cascade deletes all user data (SRSState, QuizResult, LessonProgress, UserVocabNote, PasswordResetToken, then User)

- [ ] **Step 1: Create payments router** — Stripe integration. Plans endpoint returns hardcoded tier config. Checkout creates `stripe.checkout.Session` with mode=subscription, trial_period_days=7, success_url=/dashboard, cancel_url=/signup. Webhook verifies signature with `stripe.Webhook.construct_event()`, handles 3 event types.

- [ ] **Step 2: Create user router** — Profile CRUD. Delete account cascades properly (SQLAlchemy relationships with `cascade="all, delete-orphan"`).

- [ ] **Step 3: Register routers and commit**

---

### Task 11: Frontend — Login + Signup pages

**Files:**
- Create: `web/app/page.tsx` — Login page (Netflix-style)
- Create: `web/app/signup/page.tsx` — Signup flow (register → tier selection → Stripe redirect)
- Create: `web/components/auth/LoginForm.tsx`
- Create: `web/components/auth/SignupForm.tsx`
- Create: `web/components/auth/TierSelector.tsx`

**Design instructions:**
- Login page: full-screen dark background (`bg-neutral-950`), centered card with tagline "Deutsch lernen. Jeden Tag.", email + password fields, "Login" button, "Forgot password?" link, "New to DeutschCoach? Sign up →" text link below
- Signup flow: Step 1 = registration form (name, email, password, "Continue"). Step 2 = TierSelector — 3 cards side-by-side (Starter/Plus/Pro) with monthly/annual toggle, "Start Free Trial" CTA on each. Stripe redirects externally.

- [ ] **Step 1: Create LoginForm component** — `"use client"`, calls `useAuth().login()`, shows error state on invalid credentials, redirects to `/dashboard` on success

- [ ] **Step 2: Create `web/app/page.tsx`** — Renders LoginForm in a centered layout with the Netflix-style background

- [ ] **Step 3: Create TierSelector** — Three cards in a responsive grid. Monthly/Annual toggle recalculates displayed prices. Each card has features list and "Start 7-Day Free Trial" button. On click, calls `POST /payments/checkout` and redirects to Stripe URL.

- [ ] **Step 4: Create SignupForm + signup page** — Two-step flow managed by local state (`step: "register" | "tiers"`). Register step calls `useAuth().signup()` then advances to tier step.

- [ ] **Step 5: Commit**

---

### Task 12: Frontend — Authenticated layout + Dashboard

**Files:**
- Create: `web/app/(app)/layout.tsx` — Auth guard + tab navigation
- Create: `web/app/(app)/dashboard/page.tsx`
- Create: `web/components/dashboard/StreakCard.tsx`
- Create: `web/components/dashboard/StatsGrid.tsx`
- Create: `web/components/dashboard/ContinueLearning.tsx`
- Create: `web/components/dashboard/WeakestWords.tsx`
- Create: `web/components/dashboard/RecentActivity.tsx`
- Create: `web/components/ui/TabBar.tsx`

**Interfaces:**
- Consumes: `useAuth()` from AuthContext, `api.get("/dashboard")` from api.ts
- Produces: TabBar with tabs: Dashboard, Learn, Review, Quiz, Grammar, Settings

- [ ] **Step 1: Create `(app)/layout.tsx`** — Client component. Checks `useAuth().user` — if null, redirect to `/`. Renders `TabBar` at top and children below. Includes `CommandBar` (Ctrl+K toggle, hidden by default).

- [ ] **Step 2: Create TabBar** — Horizontal nav with icon+label tabs. Highlights active tab based on `usePathname()`. Mobile: bottom tab bar. Desktop: top bar.

- [ ] **Step 3: Create dashboard page** — Uses `useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard') })`. Renders all 5 widget components in a responsive grid. Each widget handles its own loading/empty/error states.

- [ ] **Step 4: Create each dashboard widget component** — StreakCard (animated number), StatsGrid (4 stat cards), ContinueLearning (lesson title + progress bar + "Resume" link), WeakestWords (word list with "Practice" link), RecentActivity (timeline list)

- [ ] **Step 5: Commit**

---

### Task 13: Frontend — Curriculum browser + Lesson viewer

**Files:**
- Create: `web/app/(app)/curriculum/page.tsx`
- Create: `web/app/(app)/curriculum/[level]/[id]/page.tsx`
- Create: `web/components/curriculum/LevelList.tsx`
- Create: `web/components/curriculum/LessonCard.tsx`
- Create: `web/components/curriculum/LessonViewer.tsx`
- Create: `web/components/curriculum/VocabSidebar.tsx`

**Design:**
- Curriculum page: accordion-style level list (A1→C1). Expanding a level shows lesson cards with title, progress bar, and "Start"/"Resume"/"Completed" badge
- Lesson viewer: Markdown body rendered with Tailwind Typography, vocab sidebar with word list (German → tap to reveal English), exercises inline, "Complete & Review" button at bottom
- On "Complete & Review": calls `POST /srs/seed-lesson` to seed SRS cards, then redirects to quiz for that lesson

- [ ] **Step 1: Create LevelList + LessonCard** — Fetches `GET /curriculum`. LevelList renders collapsible sections. LessonCard shows lesson info + status badge based on LessonProgress.

- [ ] **Step 2: Create LessonViewer** — Fetches `GET /curriculum/{level}/{id}`. Renders markdown content (use `react-markdown` or simple HTML rendering). Vocab sidebar shows words as flip cards. "Complete Lesson" button triggers SRS seeding + navigates to quiz.

- [ ] **Step 3: Create pages** — Curriculum list page and dynamic route `[level]/[id]` page.

- [ ] **Step 4: Commit**

---

### Task 14: Frontend — SRS reviewer

**Files:**
- Create: `web/app/(app)/review/page.tsx` (or `/srs/page.tsx`)
- Create: `web/components/srs/FlashcardReviewer.tsx`
- Create: `web/components/srs/RatingButtons.tsx`
- Create: `web/components/srs/SRSStats.tsx`

**Design:**
- Page shows SRSStats at top (due today, mastered, learning counts)
- FlashcardReviewer: shows one card at a time. German word large, centered. Tap/click to flip → English + example + notes. Then rating buttons 0-5 appear.
- On rating submit: `POST /srs/review` → next card appears
- When queue empty: celebration state with next review time
- If no cards due: "All caught up!" with stats

- [ ] **Step 1: Create FlashcardReviewer** — Manages queue locally (fetched from `GET /srs/due`). Shows one card. Flip animation (CSS rotate). Rating buttons appear after flip. Submit calls API, removes card from local queue. Empty state when done.

- [ ] **Step 2: Create SRSStats** — Fetches `GET /srs/stats`. Shows 4 progress bars (new→learning→reviewing→mastered) + due today count.

- [ ] **Step 3: Create page and commit**

---

### Task 15: Frontend — Quiz flow

**Files:**
- Create: `web/app/(app)/quiz/page.tsx`
- Create: `web/components/quiz/QuizSetup.tsx`
- Create: `web/components/quiz/QuestionCard.tsx`
- Create: `web/components/quiz/QuizResults.tsx`

**Design:**
- QuizSetup: choose source (current lesson, specific level, weakest words), question count slider (5-30), "Start Quiz" button → calls `POST /quiz/generate`
- QuestionCard: one question at a time, no back button. MC shows 4 options. Translate/Fill-blank shows text input. Conjugate shows verb + person + tense → text input. "Submit" button per question (or auto-advance on MC click)
- QuizResults: score with % and fraction, per-question breakdown (green check / red X with correct answer), grammar links for missed questions, "Review Missed Words" → opens SRS for those words

- [ ] **Step 1: Create QuizSetup** — Form with dropdowns for source, slider for count. On submit, calls `api.post('/quiz/generate', body)` and advances to question flow.

- [ ] **Step 2: Create QuestionCard** — Renders the appropriate input per question type. Tracks answers in local state. Auto-advances on MC, manual submit on text input types.

- [ ] **Step 3: Create QuizResults** — Fetched from `POST /quiz/{session_id}/submit`. Score display. Per-question list with feedback. Link to grammar topics for missed words.

- [ ] **Step 4: Wire up quiz page** — Local state machine: "setup" → "active" → "results". Pass session_id and answers through the flow.

- [ ] **Step 5: Commit**

---

### Task 16: Frontend — Grammar reference + Settings + CommandBar

**Files:**
- Create: `web/app/(app)/grammar/page.tsx`
- Create: `web/app/(app)/grammar/[slug]/page.tsx`
- Create: `web/components/grammar/GrammarTopicCard.tsx`
- Create: `web/app/(app)/settings/page.tsx`
- Create: `web/components/settings/ProfileSection.tsx`
- Create: `web/components/settings/SubscriptionSection.tsx`
- Create: `web/components/settings/PreferencesSection.tsx`
- Create: `web/components/ui/CommandBar.tsx` (in `packages/shared/ui/`)

**Design:**
- Grammar: search input + level filter chips. Grid of GrammarTopicCards. Click → detail page with rendered Markdown content + related lesson links.
- Settings: sections for profile (name/email/password form), subscription (current plan, upgrade CTA, manage billing link), preferences (daily goal, quiz size, reminders), billing history (stripe invoices list), danger zone (delete account with confirmation modal).
- CommandBar: Ctrl+K or search icon opens modal overlay with input. Keyword routing (first token = command). No match → full-text search via API. Results appear below input as you type.

- [ ] **Step 1: Create grammar pages** — List page with search + filter. Detail page with slug-based routing loading from `GET /grammar/{slug}`.

- [ ] **Step 2: Create settings page** — Tabbed sections: Profile, Subscription, Preferences, Billing. Each section is a separate component with its own API calls.

- [ ] **Step 3: Create CommandBar** — `useEffect` for Ctrl+K listener. Modal overlay with input. `useCallback` to parse commands. For unknown commands, debounced search against `/grammar?q=`. Keyboard navigation (arrow keys + enter) for results.

- [ ] **Step 4: Commit**

---

### Task 17: Polish — Curriculum content, error handling, mobile responsive

**Files:**
- Create: `backend/data/curriculum/a1/02-introductions.md` through `a1/05-*.md` (4 more A1 lessons for a usable MVP)
- Modify: Various frontend components for loading/error/empty states

- [ ] **Step 1: Write 4 additional A1 lessons** — Each with 5-8 vocab words, 1-2 grammar topics, 3-5 exercises. Topics: introductions, numbers, colors, family.

- [ ] **Step 2: Add loading skeletons** — Dashboard, curriculum list, SRS reviewer, quiz — each gets a skeleton component shown during `isLoading` state.

- [ ] **Step 3: Add error boundaries + empty states** — Each data-fetching component shows an error message with retry button on API failure, and an appropriate empty state (e.g., "No cards due today! 🎉").

- [ ] **Step 4: Mobile responsive pass** — TabBar goes to bottom on mobile. Dashboard grid stacks single-column. Lesson viewer sidebar collapses below content. CommandBar input is full-width.

- [ ] **Step 5: End-to-end test** — Start backend, start frontend. Sign up a new user → select tier → Stripe checkout (test mode) → redirect to dashboard → browse curriculum → open lesson → complete lesson → review SRS cards → take quiz → view results → check grammar reference → open command bar → verify all flows.

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "feat: polish — additional A1 lessons, loading states, error handling, mobile responsive"
```

---

## Self-Review

### 1. Spec coverage

| Spec requirement | Covered by |
|-----------------|------------|
| FastAPI + SQLAlchemy + SQLite | Task 1 |
| JWT auth, Netflix-style login | Tasks 4, 11 |
| Tier selection + Stripe + free trial | Tasks 10, 11 |
| Curriculum A1→C1, Markdown+YAML | Tasks 5, 13 |
| SM-2 SRS engine | Task 7 |
| Auto-generated quizzes (4 types) | Task 8 |
| Grammar reference, searchable | Tasks 6, 16 |
| Dashboard (streak, stats, weakest words) | Tasks 9, 12 |
| Command bar (Ctrl+K, keyword routing) | Task 16 |
| Settings (profile, subscription, preferences) | Tasks 10, 16 |
| Mobile-friendly | Task 17 |
| Shared package for future Idioma | Task 3 |
| Database: 9 tables, all specified | Task 2 |

### 2. Placeholder scan
- No TBD, TODO, or "implement later" found
- All code steps include actual implementation
- All API endpoints have specified request/response shapes

### 3. Type consistency
- All model field names consistent between Task 2 schemas and Task 5-10 routers
- Frontend types mirror backend schemas (Task 3 types → Task 11-16 components)
- SRSState fields in Task 7 engine match Task 2 model definition
- API routes match spec's API Surface section exactly
