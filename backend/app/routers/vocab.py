"""Vocabulary lookup endpoints (Phase 1). Batch word lookup with translation,
IPA, and audio. Also records word taps for analytics."""

from __future__ import annotations
import json
import logging
import os
from typing import Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.routers.auth_dependency import require_auth
from app.models.user import User
from app.models.vocab import VocabEntry
from app.models.word_interaction import WordInteraction
from app.schemas.vocab import VocabLookupRequest, VocabLookupResponse, VocabLookupItem

logger = logging.getLogger("deutschcoach.vocab")

router = APIRouter(prefix="/vocab", tags=["Vocabulary"])

# ── Pronunciation map ─────────────────────────────────────────────────────

_PRONUNCIATION_MAP: Dict[str, dict] = {}
_map_path = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "web", "public", "pronunciation-map.json"
)
try:
    with open(_map_path, encoding="utf-8") as f:
        _PRONUNCIATION_MAP = json.load(f)
    logger.info("Loaded %d pronunciation entries", len(_PRONUNCIATION_MAP))
except FileNotFoundError:
    logger.warning("pronunciation-map.json not found at %s", _map_path)
except json.JSONDecodeError:
    logger.warning("pronunciation-map.json at %s is invalid JSON", _map_path)


# ── Lookup ────────────────────────────────────────────────────────────────

@router.post("/lookup", response_model=VocabLookupResponse)
def vocab_lookup(
    body: VocabLookupRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    """Batch vocabulary lookup. Returns translation, IPA, and audio for each
    German word. Also records each lookup as a word interaction for analytics."""
    # Fetch all matching vocab entries in one query
    entries = (
        db.query(VocabEntry)
        .filter(VocabEntry.german.in_(body.words))
        .all()
    )
    entry_map = {e.german: e for e in entries}

    results: list[VocabLookupItem] = []
    interactions: list[WordInteraction] = []

    for word in body.words:
        entry = entry_map.get(word)
        pron = _PRONUNCIATION_MAP.get(word, {})

        results.append(VocabLookupItem(
            german=word,
            english=entry.english if entry else None,
            ipa=pron.get("ipa"),
            audio_url=entry.audio_url if entry else None,
        ))

        if entry:
            interactions.append(WordInteraction(
                user_id=user.id,
                vocab_entry_id=entry.id,
                lesson_id=entry.lesson_id,
            ))

    if interactions:
        db.add_all(interactions)
        db.commit()

    return VocabLookupResponse(results=results)
