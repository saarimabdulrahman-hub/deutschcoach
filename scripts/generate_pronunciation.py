"""Generate pronunciation data for all German vocabulary.

Reads all curriculum markdown files, generates IPA via epitran and
beginner-friendly pronunciation via rule-based conversion, then writes
a JSON lookup table consumed by the frontend VocabCard.

Usage:
    python -X utf8 scripts/generate_pronunciation.py
"""

import json
import re
from pathlib import Path

import epitran
import yaml

# ── Paths ────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_DIR = REPO_ROOT / "backend" / "data" / "curriculum"
OUTPUT_PATH = REPO_ROOT / "web" / "public" / "pronunciation-map.json"


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


# ── IPA generation ───────────────────────────────────────────────────────

_EPITRAN_CACHE: dict[str, str] = {}

def _get_epitran() -> epitran.Epitran:
    """Lazy-init epitran with German Latin script."""
    if not hasattr(_get_epitran, "_instance"):
        _get_epitran._instance = epitran.Epitran("deu-Latn")
    return _get_epitran._instance


def generate_ipa(word: str) -> str:
    """Generate IPA transcription using epitran."""
    if word not in _EPITRAN_CACHE:
        try:
            epi = _get_epitran()
            _EPITRAN_CACHE[word] = epi.transliterate(word).strip()
        except Exception as exc:
            print(f"  Warning: epitran failed for '{word}': {exc}")
            _EPITRAN_CACHE[word] = ""
    return _EPITRAN_CACHE[word]


# ── Beginner pronunciation (rule-based) ──────────────────────────────────

# Ordered replacement rules: first-match wins.
# Each rule is (pattern, replacement, optional_flags).
_PRONUNCIATION_RULES: list[tuple[str, str, int]] = [
    # Long vowel markers (do before vowel rules)
    (r"aa", "ah", 0),
    (r"ee", "eh", 0),
    (r"oo", "oh", 0),
    # Common German trigraphs and digraphs (longest first)
    (r"sch", "sh", re.IGNORECASE),
    (r"tsch", "ch", re.IGNORECASE),  # German "tsch" → English "ch"
    (r"chs", "ks", re.IGNORECASE),
    (r"ig(?=\s|$)", "ikh", re.IGNORECASE),  # -ig at end of word → "ikh"
    (r"ng", "ng", re.IGNORECASE),
    (r"pf", "pf", re.IGNORECASE),  # keep as-is, English speakers can approximate
    # Vowel combinations
    (r"eu", "oy", re.IGNORECASE),
    (r"äu", "oy", re.IGNORECASE),
    (r"ei", "eye", re.IGNORECASE),
    (r"ie", "ee", re.IGNORECASE),
    (r"au", "ow", re.IGNORECASE),
    (r"ai", "eye", re.IGNORECASE),
    # Umlauts
    (r"ö", "ur", re.IGNORECASE),
    (r"ä", "eh", re.IGNORECASE),
    (r"ü", "oo", re.IGNORECASE),
    # Consonants with different German pronunciation
    (r"z", "ts", re.IGNORECASE),
    (r"v", "f", re.IGNORECASE),
    (r"w", "v", re.IGNORECASE),
    (r"ß", "ss", 0),
    # Single consonants
    (r"j", "y", re.IGNORECASE),
    (r"qu", "kv", re.IGNORECASE),
    (r"sp(?=.)", "shp", re.IGNORECASE),
    (r"st(?=.)", "sht", re.IGNORECASE),
    # Final devoicing
    (r"d$", "t", re.IGNORECASE),
    (r"b$", "p", re.IGNORECASE),
    (r"g$", "k", re.IGNORECASE),
]


def _apply_rules(text: str) -> str:
    """Apply pronunciation rules in order, first-match wins per position.

    Uses a left-to-right scan to avoid overlapping rule matches.
    All rules are matched against slices of the input text.
    """
    result: list[str] = []
    # Normalize ß to ss for rule matching
    normalized = text.replace("ß", "ss")
    n = len(normalized)
    i = 0

    while i < n:
        matched = False
        remaining = normalized[i:]

        for pattern, replacement, flags in _PRONUNCIATION_RULES:
            if pattern == "ß":
                continue
            try:
                if flags & re.IGNORECASE:
                    m = re.match(re.compile(pattern, re.IGNORECASE), remaining)
                else:
                    m = re.match(pattern, remaining)
            except re.error:
                continue

            if m is not None and m.start() == 0:
                match_len = m.end() - m.start()
                if match_len > 0:
                    result.append(replacement)
                    i += match_len
                    matched = True
                    break

        if not matched:
            result.append(normalized[i].lower())
            i += 1

    return "".join(result)


def generate_beginner_pron(word: str) -> str:
    """Generate beginner-friendly pronunciation guide using rule-based conversion.

    Handles multi-word phrases by processing each word separately
    and joining with a hyphen.
    """
    words = word.strip().split()
    parts: list[str] = []
    for w in words:
        pron = _apply_rules(w)
        # Capitalize first letter for readability
        if len(pron) > 1:
            pron = pron[0].upper() + pron[1:]
        elif pron:
            pron = pron[0].upper()
        parts.append(pron)
    return "-".join(parts)


# ── Main ─────────────────────────────────────────────────────────────────

def main() -> None:
    print("Loading vocabulary from curriculum files...")
    words = load_all_vocabulary()
    print(f"  Found {len(words)} unique words/phrases.")

    print("Generating IPA transcriptions via epitran...")
    pronunciation_map: dict[str, dict[str, str]] = {}
    for i, word in enumerate(words):
        ipa = generate_ipa(word)
        beginner_pron = generate_beginner_pron(word)
        pronunciation_map[word] = {
            "ipa": ipa,
            "beginnerPron": beginner_pron,
        }
        if (i + 1) % 25 == 0:
            print(f"  Processed {i + 1}/{len(words)}...")

    print(f"Generating beginner pronunciation via rules...")
    print(f"  Total processed: {len(words)} words.")

    # Write output
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(pronunciation_map, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Pronunciation map written to: {OUTPUT_PATH}")
    print(f"  Words covered: {len(pronunciation_map)}")

    # Quick stats
    with_ipa = sum(1 for v in pronunciation_map.values() if v["ipa"])
    with_beginner = sum(1 for v in pronunciation_map.values() if v["beginnerPron"])
    print(f"  With IPA: {with_ipa}")
    print(f"  With beginner pronunciation: {with_beginner}")

    # Validate all words have complete pronunciation data
    errors = []
    for word, entry in pronunciation_map.items():
        if not entry.get("ipa"):
            errors.append(f"  Missing IPA: {word}")
        if not entry.get("beginnerPron"):
            errors.append(f"  Missing beginner pronunciation: {word}")

    if errors:
        print(f"\n⚠  {len(errors)} validation error(s):")
        for err in errors:
            print(err)
        return False
    print("\n✓ All words have complete pronunciation data.")
    return True


def validate() -> bool:
    """Validate that all curriculum vocabulary exists in the generated pronunciation map.

    Reads the existing map from disk (does not regenerate). Exits with non-zero
    code if any word is missing or has incomplete data. Intended for CI use.

    Usage:
        python -X utf8 scripts/generate_pronunciation.py --validate
    """
    words = load_all_vocabulary()
    if not OUTPUT_PATH.exists():
        print(f"ERROR: Pronunciation map not found at {OUTPUT_PATH}")
        print("  Run `python -X utf8 scripts/generate_pronunciation.py` first.")
        return False

    with open(OUTPUT_PATH, encoding="utf-8") as f:
        pronunciation_map = json.load(f)

    missing: list[str] = []
    incomplete: list[str] = []

    for word in words:
        entry = pronunciation_map.get(word)
        if entry is None:
            missing.append(word)
        elif not entry.get("ipa") or not entry.get("beginnerPron"):
            incomplete.append(word)

    if missing:
        print(f"ERROR: {len(missing)} word(s) missing from pronunciation map:")
        for w in missing:
            print(f"  {w}")
    if incomplete:
        print(f"ERROR: {len(incomplete)} word(s) have incomplete pronunciation data:")
        for w in incomplete:
            print(f"  {w}")
    if not missing and not incomplete:
        print(f"✓ All {len(words)} vocabulary entries present with complete pronunciation data.")
        return True

    return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--validate":
        success = validate()
    else:
        success = main()

    if not success:
        sys.exit(1)
