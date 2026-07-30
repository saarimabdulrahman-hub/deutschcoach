"""Audio delivery service (Section 11.1). CDN-backed signed URL generation for
native-quality German audio recordings. Supports Cloudflare R2 and AWS S3 with
local file fallback for development."""

import os
import hmac
import hashlib
import base64
import time
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("deutschcoach.audio")

# ── Configuration ────────────────────────────────────────────────────────

CDN_PROVIDER = os.getenv("CDN_PROVIDER", "local")  # "local" | "r2" | "s3"
CDN_BUCKET = os.getenv("CDN_BUCKET", "")
CDN_ENDPOINT = os.getenv("CDN_ENDPOINT", "")
CDN_ACCESS_KEY = os.getenv("CDN_ACCESS_KEY", "")
CDN_SECRET_KEY = os.getenv("CDN_SECRET_KEY", "")
CDN_PUBLIC_URL = os.getenv("CDN_PUBLIC_URL", "")
AUDIO_SIGNING_SECRET = os.getenv("AUDIO_SIGNING_SECRET", "change-me")
AUDIO_BASE_DIR = Path(__file__).parent.parent.parent / "web" / "public" / "audio"

# Phased rollout: which CEFR levels have native audio available
NATIVE_AUDIO_LEVELS = os.getenv("NATIVE_AUDIO_LEVELS", "A1").split(",")


def has_native_audio(level: str) -> bool:
    """Check if native audio is available for a CEFR level (phased rollout)."""
    return level.upper() in [l.strip().upper() for l in NATIVE_AUDIO_LEVELS]


def generate_signed_url(filename: str, expires_in: int = 3600) -> Optional[str]:
    """Generate a signed URL for an audio file.
    Returns None if the file doesn't exist in any storage backend."""
    if not filename:
        return None

    if CDN_PROVIDER == "local":
        return _local_signed_url(filename)
    elif CDN_PROVIDER == "r2":
        return _r2_signed_url(filename, expires_in)
    elif CDN_PROVIDER == "s3":
        return _s3_signed_url(filename, expires_in)
    return _local_signed_url(filename)


def _local_signed_url(filename: str) -> Optional[str]:
    """Serve audio from the local filesystem (dev fallback)."""
    filepath = AUDIO_BASE_DIR / filename
    if filepath.exists():
        # Return a direct path for local development
        return f"/audio/{filename}"
    return None


def _r2_signed_url(filename: str, expires_in: int) -> Optional[str]:
    """Generate a Cloudflare R2 signed URL."""
    if not CDN_ENDPOINT or not CDN_SECRET_KEY:
        return _local_signed_url(filename)
    expiry = int(time.time()) + expires_in
    url = f"{CDN_ENDPOINT}/{CDN_BUCKET}/{filename}"
    signature = _hmac_sha256(CDN_SECRET_KEY, f"GET\n{expiry}\n/{CDN_BUCKET}/{filename}")
    return f"{url}?expires={expiry}&signature={signature}"


def _s3_signed_url(filename: str, expires_in: int) -> Optional[str]:
    """Generate an AWS S3 signed URL (query-string auth)."""
    if not CDN_PUBLIC_URL or not CDN_SECRET_KEY:
        return _local_signed_url(filename)
    expiry = int(time.time()) + expires_in
    url = f"{CDN_PUBLIC_URL}/{filename}"
    signature = _hmac_sha256(CDN_SECRET_KEY, f"GET\n{expiry}\n/{filename}")
    return f"{url}?expires={expiry}&signature={signature}"


def _hmac_sha256(key: str, message: str) -> str:
    return base64.urlsafe_b64encode(
        hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
