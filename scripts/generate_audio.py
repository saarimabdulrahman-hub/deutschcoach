"""Generate neural TTS audio files for all curriculum vocabulary.

Reads all curriculum markdown files, generates MP3 audio via a neural TTS
API (OpenAI tts-1 or ElevenLabs), and saves files to web/public/audio/.

Usage:
    # OpenAI (default, ~$0.12 for all A1 vocab)
    python -X utf8 scripts/generate_audio.py

    # ElevenLabs
    python -X utf8 scripts/generate_audio.py --provider elevenlabs --key YOUR_KEY

    # ElevenLabs via env var
    export ELEVENLABS_API_KEY=your_key
    python -X utf8 scripts/generate_audio.py --provider elevenlabs
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import yaml

# ── Paths ────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_DIR = REPO_ROOT / "backend" / "data" / "curriculum"
AUDIO_DIR = REPO_ROOT / "web" / "public" / "audio"


# ── Vocabulary extraction ────────────────────────────────────────────────

def load_all_vocabulary() -> list[str]:
    """Walk curriculum markdown files and return all unique German words/phrases."""
    words: list[str] = []
    seen: set[str] = set()

    if not CURRICULUM_DIR.exists():
        print(f"Warning: curriculum directory not found at {CURRICULUM_DIR}")
        return words

    for level_dir in sorted(CURRICULUM_DIR.iterdir()):
        if not level_dir.is_dir():
            continue
        for md_file in sorted(level_dir.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            if not content.startswith("---"):
                continue
            parts = content.split("---", 2)
            if len(parts) < 3:
                continue
            fm = yaml.safe_load(parts[1])
            for entry in fm.get("vocabulary", []):
                german = entry.get("german", "").strip()
                if german and german not in seen:
                    seen.add(german)
                    words.append(german)

    return words


# ── Filename sanitization ───────────────────────────────────────────────

def sanitize_filename(word: str) -> str:
    """Convert a German word/phrase to a safe filename.

    - Lowercase
    - ß → ss, ä → ae, ö → oe, ü → ue
    - Spaces → hyphens
    - Remove non-alphanumeric chars (except hyphens)
    """
    s = word.lower()
    s = s.replace("ß", "ss")
    s = s.replace("ä", "ae")
    s = s.replace("ö", "oe")
    s = s.replace("ü", "ue")
    s = s.replace(" ", "-")
    # Remove everything except a-z, hyphens
    s = re.sub(r"[^a-z\-]", "", s)
    # Collapse multiple hyphens
    s = re.sub(r"-+", "-", s)
    # Strip leading/trailing hyphens
    s = s.strip("-")
    return s if s else "unknown"


# ── TTS providers ────────────────────────────────────────────────────────

def _call_openai(text: str, api_key: str) -> bytes:
    """Generate speech using OpenAI tts-1."""
    url = "https://api.openai.com/v1/audio/speech"
    body = json.dumps({
        "model": "tts-1",
        "input": text,
        "voice": "alloy",
        "response_format": "mp3",
    }).encode()
    req = urllib.request.Request(
        url, data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def _call_elevenlabs(text: str, api_key: str) -> bytes:
    """Generate speech using ElevenLabs Turbo v2."""
    url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"  # Rachel voice
    body = json.dumps({
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.3, "similarity_boost": 0.75},
    }).encode()
    req = urllib.request.Request(
        url, data=body,
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


# ── Main ─────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate neural TTS audio for curriculum vocabulary.")
    parser.add_argument(
        "--provider", choices=["openai", "elevenlabs"], default="openai",
        help="TTS provider (default: openai)",
    )
    parser.add_argument(
        "--key",
        help="API key. If omitted, reads from env: OPENAI_API_KEY or ELEVENLABS_API_KEY.",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print what would be generated without calling the API.",
    )
    args = parser.parse_args()

    # Resolve API key
    if args.key:
        api_key = args.key
    elif args.provider == "openai":
        api_key = os.environ.get("OPENAI_API_KEY", "")
    else:
        api_key = os.environ.get("ELEVENLABS_API_KEY", "")

    if not api_key and not args.dry_run:
        print(f"ERROR: No API key for {args.provider}.")
        print(f"  Pass --key or set {'OPENAI_API_KEY' if args.provider == 'openai' else 'ELEVENLABS_API_KEY'} env var.")
        sys.exit(1)

    print(f"Loading vocabulary from curriculum files...")
    words = load_all_vocabulary()
    print(f"  Found {len(words)} unique words/phrases.")
    print(f"  Provider: {args.provider}")
    if args.dry_run:
        print(f"  Mode: dry-run (no API calls)\n")

    # Ensure output directory exists
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Check which files already exist
    existing = 0
    generated = 0
    errors = 0

    for i, word in enumerate(words):
        filename = sanitize_filename(word) + ".mp3"
        outpath = AUDIO_DIR / filename

        if outpath.exists():
            existing += 1
            if (i + 1) % 25 == 0:
                print(f"  [{i+1}/{len(words)}] {existing} existing, {generated} new, {errors} errors")
            continue

        if args.dry_run:
            print(f"  Would generate: {word} → {filename}")
            generated += 1
            continue

        # Generate audio
        try:
            if args.provider == "openai":
                audio_data = _call_openai(word, api_key)
            else:
                audio_data = _call_elevenlabs(word, api_key)

            outpath.write_bytes(audio_data)
            generated += 1
            print(f"  ✓ {word} → {filename}")

        except Exception as exc:
            errors += 1
            print(f"  ✗ {word}: {exc}")

        if (i + 1) % 10 == 0:
            print(f"  [{i+1}/{len(words)}] {existing} existing, {generated} new, {errors} errors")

    # Summary
    print(f"\n{'='*50}")
    print(f"  Total vocabulary: {len(words)}")
    print(f"  Already existed:  {existing}")
    print(f"  Generated:        {generated}")
    print(f"  Errors:           {errors}")
    print(f"  Output directory: {AUDIO_DIR}")
    print(f"{'='*50}")

    if errors > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
