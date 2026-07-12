from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
import logging
from dotenv import load_dotenv

from app.routers import auth, curriculum, grammar, quiz, srs, dashboard, payments, user, chat, emma, analytics

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


@app.get("/health")
def health():
    return {"status": "ok"}
