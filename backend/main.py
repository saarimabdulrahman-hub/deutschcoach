from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
import logging
from dotenv import load_dotenv

from app.routers import auth, curriculum, grammar, quiz, srs, dashboard, payments, user, chat, emma, analytics, checkpoint, search, vocab, lessons, adaptive, audio, pronunciation, missions, flags, experiment, migration

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("deutschcoach")


class CORSHandler(BaseHTTPMiddleware):
    """Allow all origins — mirrors the request Origin header back."""
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            # Preflight response
            response = Response(status_code=204)
            response.headers["Access-Control-Allow-Methods"] = "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Max-Age"] = "600"
        else:
            response = await call_next(request)

        origin = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: sync curriculum to DB. Shutdown: no-op."""
    from database import SessionLocal
    from app.curriculum_loader import sync_curriculum

    db = SessionLocal()
    try:
        sync_curriculum(db)
        logger.info("Curriculum synced successfully")
    except Exception:
        logger.exception("Failed to sync curriculum")
    finally:
        db.close()

    yield  # Application runs here


app = FastAPI(title="DeutschCoach API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSHandler)

app.include_router(auth.router)
app.include_router(curriculum.router)
app.include_router(grammar.router)
app.include_router(quiz.router)
app.include_router(srs.router)
app.include_router(dashboard.router)
app.include_router(payments.router)
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(emma.router)
app.include_router(analytics.router)
app.include_router(checkpoint.router)
app.include_router(search.router)
app.include_router(vocab.router)
app.include_router(lessons.router)
app.include_router(adaptive.router)
app.include_router(audio.router)
app.include_router(pronunciation.router)
app.include_router(missions.router)
app.include_router(flags.router)
app.include_router(experiment.router)
app.include_router(migration.router)

# ── Specification-defined endpoint aliases (Section 11.6) ──────────────
# These delegate to existing handlers so both path conventions work.
from app.routers.pronunciation import score_pronunciation
from app.routers.missions import get_missions, get_achievements
from fastapi import HTTPException, Depends
from database import get_db
from sqlalchemy.orm import Session
from app.routers.auth_dependency import require_auth
from app.models.lesson import Lesson
from app.models.user import User
from app.routers.curriculum import _lesson_to_dict

app.post("/speaking/score")(score_pronunciation)
app.get("/missions/daily")(get_missions)
app.get("/achievements")(get_achievements)

# ── API versioning (Section 12.2 backward compatibility) ─────────────────
@app.get("/api/v1/lessons/{lesson_id}")
@app.get("/api/v2/lessons/{lesson_id}")
def get_lesson_api(lesson_id: int, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    """Return lesson detail by ID. Both v1 and v2 coexist for migration compatibility.
    v1 uses the current response format; v2 returns the same data (backward compatible)."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"lesson": _lesson_to_dict(lesson)}


@app.get("/health")
def health():
    return {"status": "ok"}
