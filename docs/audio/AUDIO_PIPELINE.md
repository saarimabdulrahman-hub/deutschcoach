# DeutschFlow — Audio Asset Production Pipeline

**Version:** 1.0 · **Updated:** 2026-07-13 · **Status:** Active
**Scope:** Production spec for generating, versioning, caching, and serving every audio asset in DeutschFlow. No implementation — this is the blueprint.

---

## 0. Design goal

Every german text element in every lesson — dialogue lines, vocabulary words, example sentences, grammar examples — should have a corresponding audio file that is **generated once, cached, versioned, and served from a predictable URL**. No runtime TTS for production learners. Native recordings are the gold standard; high-quality TTS is the fallback pipeline.

---

## 1. Folder convention

```
web/public/audio/
├── lessons/
│   └── {level}/              # a1, a2, b1, b2, c1
│       └── {lesson-id}/      # matches the lesson's database id
│           ├── dialogue/
│           │   ├── line-01.mp3
│           │   ├── line-02.mp3
│           │   └── full.mp3   # entire dialogue read-through
│           ├── vocabulary/
│           │   ├── {word-id}.mp3   # e.g. 42.mp3 — matches vocab_entry.id
│           │   └── manifest.json   # { "42": "Hallo.mp3", … }
│           ├── examples/
│           │   └── {hash}.mp3      # hash of the example sentence text (sha256, first 12 chars)
│           └── grammar/
│               └── {slug}.mp3      # grammar topic slug (e.g. "personal-pronouns")
└── common/
    ├── alphabet/
    │   ├── a.mp3 … z.mp3
    │   └── special/
    │       ├── ae.mp3   # ä
    │       ├── oe.mp3   # ö
    │       ├── ue.mp3   # ü
    │       └── ss.mp3   # ß
    └── numbers/
        ├── 0.mp3 … 20.mp3
        └── tens/
            ├── 30.mp3 … 90.mp3
            └── 100.mp3
```

**Rules:**
- All paths use **lowercase**.
- Lesson ids are **integers** (matching the DB primary key).
- Vocabulary audio is keyed by `vocab_entry.id` so it survives lesson reordering.
- Example sentence audio is keyed by a **content hash** so the same sentence across lessons shares one file.
- The `manifest.json` maps vocab ids to actual filenames for the frontend.

---

## 2. Asset naming convention

| Asset type | Naming | Example |
|---|---|---|
| Dialogue line | `line-{NN}.mp3` (zero-padded) | `line-01.mp3` |
| Full dialogue | `full.mp3` | |
| Vocabulary word | `{vocab-entry-id}.mp3` | `42.mp3` |
| Example sentence | `{sha256-12}.mp3` | `a3f8b2c1d4e5.mp3` |
| Grammar | `{slug}.mp3` | `personal-pronouns.mp3` |
| Alphabet letter | `{letter}.mp3` | `a.mp3`, `ae.mp3` |
| Number | `{number}.mp3` | `17.mp3` |

---

## 3. Provider configuration

Three TTS providers supported, plus a native-recording ingestion path. Provider selection is lesson-level, controlled by a `provider` field in the pipeline config.

### Google Cloud TTS (recommended default for automated pipeline)

```yaml
provider: google
voice: de-DE-Wavenet-A       # female, warm, natural
gender: FEMALE
speaking_rate: 0.95           # slightly slower for A1–A2
pitch: 0.0
audio_format: MP3
sample_rate: 24000
# env vars:
#   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

**Dialogue:** `de-DE-Wavenet-A` at rate 0.95. "Full.mp3" is also rendered at rate 0.85 for a 0.5× variant.
**Vocabulary:** `de-DE-Wavenet-A` at rate 0.9 (slightly slower — learners are meeting the word for the first time).
**Grammar examples:** `de-DE-Wavenet-B` (male voice — distinct from the dialogue voice).

### Azure Cognitive Services

```yaml
provider: azure
voice: de-DE-KatjaNeural
style: newscast-casual
rate: 0.95
# env vars:
#   AZURE_SPEECH_KEY=…
#   AZURE_SPEECH_REGION=westeurope
```

### ElevenLabs (premium, for key phrases / marketing)

```yaml
provider: elevenlabs
voice_id: {ELEVENLABS_VOICE_ID}
model: eleven_multilingual_v2
stability: 0.5
# env var: ELEVENLABS_API_KEY
```

### Native recordings (ingestion, not generation)

```yaml
provider: native
source_dir: ./recordings/a1/lesson-01/   # manual placement
# Files must follow the folder convention above.
# The pipeline validates their presence but does not overwrite them.
```

---

## 4. Generation pipeline

A single CLI script (`scripts/audio/generate.ts`) drives the pipeline:

```
generate.ts --lesson {id} [--provider google|azure|elevenlabs] [--dry-run]
```

### Pipeline stages

```
1. LOAD lesson data
   ↓   GET /curriculum/{level}/{id}  →  LessonDetail
   ↓   or read from backend/data/curriculum/{level}/{id}.md
   │
2. PLAN
   ↓   Compute the file list: what needs generating, what already exists.
   ↓   Respect the .audiocache and --force flag.
   │
3. GENERATE (parallel, concurrency=4)
   ↓   ┌─ dialogue/line-01.mp3  → Google TTS
   ↓   ├─ dialogue/line-02.mp3  → Google TTS
   ↓   ├─ vocabulary/42.mp3     → Google TTS
   ↓   └─ …                     → Google TTS
   │
4. VALIDATE
   ↓   Every planned file exists and is > 0 bytes.
   ↓   Optional: compare file hash to stored manifest to detect drift.
   │
5. WRITE MANIFEST
   ↓   vocabulary/manifest.json  ← { vocab_id → filename }
   │
6. CACHE KEY
   ↓   Write .audiocache/{lesson-id}.json  ← { filename → source hash }
```

### Concurrency

Max **4 parallel** TTS requests (providers rate-limit). Dialogue lines are ordered; vocabulary and examples can be parallelised freely.

### Dry-run

`--dry-run` prints the plan without generating. Use it in CI to verify that all assets *would* be generatable before merging a lesson.

---

## 5. Cache invalidation

Every audio file's cache key = `sha256(content + provider + voice + speed)`.

### `.audiocache/` directory

```
.audiocache/
├── a1-01.json    # { "dialogue/line-01.mp3": "abc123…", "vocabulary/42.mp3": "def456…", … }
└── a1-02.json
```

**Regeneration rules:**
| Condition | Action |
|---|---|
| Cache file missing | Full regeneration |
| Cache key matches (hash unchanged) | **Skip** — file is current |
| Cache key differs (content/voice/speed changed) | **Regenerate** that file |
| `--force` flag | Regenerate everything regardless |
| Provider changed (e.g. google → azure) | Regenerate everything — different voice |

### Content-driven invalidation

When a lesson is edited (dialogue line changed, vocab word added), re-running the pipeline on that lesson regenerates only the changed items. The cache makes unchanged items instant.

---

## 6. Fallback strategy (runtime)

When the frontend requests an audio URL that doesn't exist:

| Priority | Source | When used |
|---|---|---|
| 1 | `web/public/audio/` pre-generated file | Normal operation |
| 2 | Browser `speechSynthesis` (TTS fallback) | File missing, offline, or pre-generation pending |
| 3 | Silent / disabled audio control | TTS unavailable (e.g. older browser) |

The frontend `AudioPlayer` already supports this fallback chain (Sprint 15 `AudioEngine.speak()` method). The URL is tried first; if it 404s or the network is offline, TTS kicks in. This means a lesson can ship *before* its audio assets are generated and still provide audio (via browser TTS), with pre-generated files replacing TTS as they arrive.

---

## 7. Automation (CI/CD integration)

### On lesson merge (GitHub Actions)

```yaml
# .github/workflows/audio-generate.yml
on:
  pull_request:
    paths:
      - 'backend/data/curriculum/**'
  push:
    branches: [master]
    paths:
      - 'backend/data/curriculum/**'

jobs:
  audio:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: scripts/audio/generate.ts --provider google --dry-run  # PR: verify plan
      - if: github.event_name == 'push'
        run: scripts/audio/generate.ts --provider google            # master: generate
      - uses: actions/upload-artifact@v4
        with:
          name: audio-assets
          path: web/public/audio/
```

### Manual generation

```bash
# Generate audio for a single lesson
scripts/audio/generate.ts --lesson 1 --provider google

# Regenerate everything for A1
scripts/audio/generate.ts --level a1 --provider google --force

# Generate with native recordings (validate only)
scripts/audio/generate.ts --lesson 1 --provider native
```

---

## 8. Frontend integration

The URL for any audio asset is predictable:

```ts
function audioUrl(lessonId: number, type: "dialogue" | "vocabulary" | "example" | "grammar", key: string | number): string {
  const base = `/audio/lessons/a1/${lessonId}`; // level derived from lesson data
  switch (type) {
    case "dialogue": return `${base}/dialogue/line-${String(key).padStart(2, "0")}.mp3`;
    case "vocabulary": return `${base}/vocabulary/${key}.mp3`;
    case "example": return `${base}/examples/${key}.mp3`; // key = sha256-12
    case "grammar": return `${base}/grammar/${key}.mp3`;
  }
}
```

The frontend `AudioPlayer` calls `audioUrl()` to get the primary URL, then falls back to TTS via `AudioEngine.speak()` if the file doesn't exist.

The `vocabulary/manifest.json` is fetched once per lesson on mount to populate the URL map.

---

## 9. Quality gates

Before audio is marked "production-ready" for a lesson:

- [ ] Every file > 0 bytes.
- [ ] `manifest.json` exists and is valid JSON.
- [ ] Dialogue line count matches the lesson's dialogue.
- [ ] Vocab count in manifest matches `vocabulary.length` from the API.
- [ ] At least one native speaker has spot-checked 3+ random files from the batch.
- [ ] The lesson's `.audiocache` file is committed (enables CI diff detection on future edits).

---

## 10. Known limitations & trade-offs

1. **No real-time TTS in production** — pre-generation is chosen for quality/consistency. The browser TTS fallback bridges the gap during development.
2. **Manifest.json must be committed** — it's the frontend's map. Omitting it means vocabulary audio won't resolve.
3. **Filename collision for examples** — two identical example sentences across lessons share one file (by hash). This is intentional (deduplication), but means editing that sentence changes *both* lessons' audio. Acceptable — the sentences are identical.
4. **Google TTS is not free** — ~$16 per 1M characters (WaveNet). For a 50-lesson A1 curriculum, estimate ~$3–5 for vocabulary + dialogue. ElevenLabs is pricier (~$1/lesson). Choose provider based on budget; quality differences at A1 are small.
5. **Native recordings scale linearly with content** — 50 lessons × 10 vocab words × 2 takes = 1000+ recordings. The pipeline supports native ingestion but does not automate recording — that's a separate production workflow.
