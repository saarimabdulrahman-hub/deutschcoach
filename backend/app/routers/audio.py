"""Audio delivery endpoint (Section 11.1). Signed URL delivery for native-quality
German audio recordings. Falls back gracefully when files don't exist."""

from __future__ import annotations
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from app.routers.auth_dependency import require_auth
from app.services.audio_service import generate_signed_url, has_native_audio

logger = logging.getLogger("deutschcoach.audio")
router = APIRouter(prefix="/audio", tags=["Audio"])


class AudioUrlResponse(BaseModel):
    url: str | None = None
    available: bool = False
    source: str = "tts"  # "native" | "tts"


@router.get("/{filename}", response_model=AudioUrlResponse)
def get_audio_url(
    filename: str,
    slow: bool = False,
    _=Depends(require_auth),
):
    """Get a signed audio URL for a vocabulary word or phrase.
    Supports dual-speed native recordings:
      - Normal: {filename} (e.g. hallo.mp3)
      - Slow:   {name}_slow.ext  (e.g. hallo_slow.mp3)

    Falls back to normal speed if slow recording doesn't exist,
    then to TTS if no native recording is available."""
    if not filename:
        raise HTTPException(status_code=400, detail="Filename required")

    # Try slow-speed variant first when requested
    if slow:
        slow_filename = _slow_variant(filename)
        slow_url = generate_signed_url(slow_filename)
        if slow_url:
            return AudioUrlResponse(url=slow_url, available=True, source="native")

    # Normal-speed recording
    signed_url = generate_signed_url(filename)
    if signed_url:
        return AudioUrlResponse(url=signed_url, available=True, source="native")

    return AudioUrlResponse(available=False, source="tts")


def _slow_variant(filename: str) -> str:
    """Append _slow before the extension: hallo.mp3 → hallo_slow.mp3"""
    dot = filename.rfind(".")
    if dot == -1:
        return f"{filename}_slow"
    return f"{filename[:dot]}_slow{filename[dot:]}"
