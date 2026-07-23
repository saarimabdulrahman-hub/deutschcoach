# DeutschFlow — Vocabulary Guidelines

**Version:** 1.0 · **Updated:** 2026-07-12 · **Status:** Active · **Sprint:** 6.3A

> How vocabulary is chosen, introduced, practiced, and retained. Consistent with LESSON_BLUEPRINT and the engine's flip-card + SM-2 capabilities.

---

## 1. How words are introduced
**In context first, isolated second.** Words appear inside the lesson's dialogue (comprehensible input), then the Vocabulary stage isolates them as flip cards. A learner never meets a word cold on a flashcard before hearing it used.

**Card anatomy** (engine already supports flip + audio):
- **Front:** German word *with article* (der/die/das for nouns) + part of speech + 🔊.
- **Back:** English translation + one **example sentence from the dialogue** + 🔊.
- Microcopy: "Just meet these words — you'll review them later." (removes memorize-now pressure).

---

## 2. How many & how ordered
- **8–12 per lesson**, chunked into **sets of ≤6** (working memory).
- **Ordering:** (1) words needed for the capability first, (2) concrete before abstract, (3) high-frequency before low, (4) cognates/transparent words early to build momentum ("Kaffee", "Name").
- **Nouns carry gender from first exposure** — never teach a noun without its article (prevents the #1 beginner gap).

---

## 3. Support (visual / audio / translation)

| Support | Policy | Rationale |
|---|---|---|
| **Audio** | Every word has 🔊 (normal + 0.5×). Native audio when available; high-quality TTS interim (PRODUCT_AUDIT). | Pronunciation is table-stakes. |
| **Visual** | Optional illustrative image for concrete nouns; never required. Emoji only if it genuinely disambiguates. | Dual-coding aids memory; but "no cartoon/childish" (PRODUCT_VISION). |
| **Translation** | **One-tap reveal, collapsed by default** (engine's translation toggle). Always available, never forced. | Lowers anxiety without creating translation dependence. |

**Translation policy:** default hidden → the learner attempts recognition first (retrieval), reveals only if needed. This is the errorless-safety-net applied to vocabulary.

---

## 4. Review schedule (SM-2)
- On lesson completion, all words → SRS (`seed-lesson`), status **New**.
- SM-2 ratings 0–5 drive intervals; missed exercise words seeded at a **lower initial ease** (surface sooner).
- **Spiral:** each subsequent lesson's warm-up pulls 2–3 due/known words (spacing + interleaving).
- No streak-punishment for missed reviews (Guided-not-Gated); overdue cards simply resurface.

---

## 5. Difficulty progression
- A1: concrete, high-frequency nouns/phrases (greetings, numbers, food).
- A2: verbs + everyday adjectives; introduce plural forms explicitly.
- B1+: abstract nouns, collocations, register (formal/informal *du/Sie*).
- Multi-word chunks ("Freut mich", "Wie geht's?") taught as single units at A1 — usable immediately, decomposed later.

---

## 6. Decision table — word inclusion
| Question | Include? |
|---|---|
| Needed to perform this lesson's capability? | Yes (priority) |
| High-frequency (top-N for level)? | Yes |
| Appears in the dialogue? | Yes |
| Only there to "fill" the count? | **No** — cut it |
| Noun without a clear gender/plural? | Fix the data, then include |

## 7. Assumptions & trade-offs
- **Assumption:** the lesson data carries german/english/pos/gender/plural/example (matches existing schema).
- **Trade-off:** hiding translations by default slightly slows first-pass reading but builds durable recall — we accept it, with the one-tap escape hatch.
- **Edge case:** false friends ("bekommen" ≠ "become") get an explicit "watch out" note on the card back (see FEEDBACK/GRAMMAR common-mistakes).
