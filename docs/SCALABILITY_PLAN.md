# Scalability Plan

> Section 12.12 — Infrastructure evolution strategy and content scaling roadmap.

---

## Infrastructure Milestone Roadmap

### Phase 0 Milestone (Current)

**Repository assumptions:**
- ~10 lessons (A1–A2 curriculum)
- < 50 users (development / early alpha)

**Infrastructure:**
- **Single server** — monolithic deployment (FastAPI + Next.js on one host)
- **SQLite** — file-based database, zero configuration, suitable for development and single-user validation
- No CDN — audio served from application server directly
- No caching layer beyond browser HTTP cache
- Docker Compose for local development (see `docker-compose.yml` and `DEPLOY.md`)

**Migration trigger:** User base exceeds 50 or lesson count exceeds ~30.

---

### Phase 2 Milestone (Months 3–8)

**Repository assumptions:**
- ~30 lessons (A1–B1 curriculum)
- < 500 users (closed beta / early access)

**Infrastructure:**
- **MySQL** — replaces SQLite for concurrent write support and migration compatibility (Alembic migrations already configured for MySQL; see `backend/.env.example` for `DATABASE_URL`)
- **CDN for audio** — Cloudflare R2 or AWS S3 for native-quality audio delivery (see `backend/app/services/audio_service.py` for CDN configuration; `CDN_PROVIDER`, `CDN_BUCKET`, `CDN_ENDPOINT` env vars)
- Signed URL delivery via `GET /audio/{filename}` endpoint (see `backend/app/routers/audio.py`)

**Migration trigger:** Active user count exceeds 500 or lesson count exceeds ~30.

---

### Six-Month Milestone (Months 6–9)

**Repository assumptions:**
- ~100 lessons (A1–C1 curriculum)
- < 5,000 users (public beta)

**Infrastructure:**
- **Read replicas** — MySQL read replicas for analytics queries and lesson content serving; write master for session/checkpoint/SRS data
- **Object cache** — in-memory cache (e.g., Memcached or in-process cache) for:
  - Lesson content and `stages_config`
  - Grammar topic data
  - Emma prompt templates
  - Feature flag states
- Service Worker audio caching continues to reduce CDN bandwidth

**Migration trigger:** Active user count exceeds 5,000 or read-to-write ratio exceeds 10:1.

---

### Twelve-Month Milestone (Months 12–15)

**Repository assumptions:**
- 300+ lessons (full curriculum, multiple tracks)
- < 50,000 users (production)

**Infrastructure:**
- **Horizontal API scaling** — stateless FastAPI behind a load balancer (e.g., AWS ALB or Cloudflare Load Balancer); session affinity not required because lesson sessions are stateless (JWT auth, no server-side session store)
- **Redis** — replaces object cache for:
  - Distributed rate limiting (replaces the current in-memory `_rate_store` in `emma.py`)
  - Emma cache (LRU eviction for `emma_cache` instead of database lookups)
  - Session-related temporary data
  - Background task queue for audio processing and analytics batch flushing

**Migration trigger:** Active user count exceeds 50,000 or API response latency exceeds 500ms p95.

---

### Twenty-Four-Month Milestone (Months 24+)

**Repository assumptions:**
- Multi-language platform (German + additional languages)
- 100,000+ users

**Infrastructure:**
- **Global CDN** — multi-region CDN (Cloudflare + regional edge nodes) for:
  - Audio delivery with per-region caching
  - Lesson content at the edge
  - Static asset distribution
- **Dedicated ML infrastructure** — GPU-backed services for:
  - Real-time pronunciation scoring (Speechace or equivalent at scale)
  - LLM inference for Emma (dedicated endpoint rather than shared Anthropic API)
  - Potential future: adaptive learning model serving

**Migration trigger:** Multi-language launch or user base exceeds 100,000.

---

## Content Scaling Strategy

### Monthly Production Target

**Target:** **5 new lessons per month per language track.**

One lesson = complete scaffold with:
- Frontmatter (title, level, unit, topics, lesson_type, stages_config)
- Vocabulary entries (8–12 words)
- Grammar topics (1–2 topics with examples)
- Exercises (6 minimum: 3 fill-blank, 2 multiple-choice, 1 translate)
- Checkpoint questions (2 sets × 3 questions)
- Dialogue lines (4–6 speaker exchanges)
- Native audio recordings for all vocabulary (CDN upload)

### Escalation Rule

If the lesson production target of 5 lessons/month/language cannot be sustained:

1. **Invest in template-based lesson generation** (see `scripts/create-lesson.mjs` — the Lesson Authoring CLI)
   - Standardise lesson scaffolds
   - Automate frontmatter generation
   - Automate stage configuration
   - Auto-select grammar discovery templates based on topic
2. **Only then** invest in hiring additional editors

This order ensures that tooling improvements compound before headcount scales.

---

## Existing Infrastructure Summary

| Component | Current State | Scales To |
|-----------|---------------|-----------|
| **Database** | SQLite (`backend/deutschcoach.db`) | MySQL (via `DATABASE_URL`) |
| **Audio** | Local `/audio/` files + TTS fallback | Cloudflare R2 / AWS S3 CDN |
| **Cache** | Browser cache + Service Worker | Object cache → Redis |
| **API** | Single FastAPI process | Horizontal scale (stateless) |
| **Auth** | JWT (no server-side session) | No affinity needed |
| **LLM** | Anthropic API (shared) | Dedicated ML infrastructure |
| **Rate limiting** | In-memory dict | Redis-based distributed |
