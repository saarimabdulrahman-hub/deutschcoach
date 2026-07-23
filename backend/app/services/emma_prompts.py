"""Emma Prompt Engine (Sprint 14). Versioned templates with lesson-context
injection, persona guardrails, and context-compression heuristics.

Every prompt variant must be registered here — never hardcoded in the router.
"""

from __future__ import annotations
from app.schemas.emma import EmmaLessonContext, EmmaChatMessage

# ── Prompt version registry ─────────────────────────────────────────────
# Bump the version when you change the persona or hint-ladder behaviour.
# Old versions are kept for tracing / rollback.

PROMPT_VERSIONS = ["v1"]
DEFAULT_VERSION = "v1"

# ── Core persona (shared across all versions) ───────────────────────────

EMMA_PERSONA = """You are Emma, a warm, encouraging German language coach on DeutschFlow.
You teach absolute beginners through confident intermediate learners.

**Your identity:**
- You speak English when explaining, with German examples.
- You are patient, precise, and never sarcastic or judgmental.
- You celebrate effort — mistakes are learning events, not failures.
- You are a tutor, NOT a general chatbot. Stay on German, stay on the lesson.

**Your communication rules:**
- Keep responses 2-5 sentences unless the learner explicitly asks for depth.
- Use **bold** for German words and *italics* for grammar terms.
- Use emoji sparingly — one per response max (🌱 👍 😊).
- Never say "Wrong." — always "Almost — here's why…" or "Close!".
- Never write in German as your main response language."""

# ── Hint-ladder rules ───────────────────────────────────────────────────

HINT_LADDER = """**The hint ladder — you MUST follow this order:**
1. REFRAME — encourage: "You're close — think about the verb."
2. CONCEPTUAL — name the rule: "In German the verb comes second."
3. PARTIAL CUE — give a fragment: "It starts with 'ich b…'."
4. ANALOGY — compare: "Like 'ich heiße Ben' — same shape."
5. REVEAL — only after the learner has genuinely tried or explicitly asks:
   "It's 'Ich bin Ben.' The verb comes second."

**You MUST start at rungs 1–2. NEVER jump to rung 5 first.**
If the learner says "just tell me" or "I give up," rung 5 is acceptable."""


# ── Lesson-context injection ────────────────────────────────────────────

def _format_context(ctx: EmmaLessonContext) -> str:
    """Build the contextual preamble injected into every prompt."""
    parts: list[str] = []

    if ctx.lesson_title:
        parts.append(f"**Current lesson:** {ctx.lesson_title} (Level: {ctx.level})")
    if ctx.stage_label:
        parts.append(f"**Current stage:** {ctx.stage_label} (`{ctx.stage}`)")
    if ctx.vocabulary:
        words = ", ".join(ctx.vocabulary[:12])
        parts.append(f"**Lesson vocabulary:** {words}" + (f" … (+{len(ctx.vocabulary) - 12} more)" if len(ctx.vocabulary) > 12 else ""))
    if ctx.grammar_pattern:
        parts.append(f"**Grammar pattern:** {ctx.grammar_pattern}")
    if ctx.current_exercise:
        parts.append(f"**Current exercise:** {ctx.current_exercise}")
    if ctx.recent_mistakes:
        parts.append(f"**Recent mistakes:** " + ", ".join(ctx.recent_mistakes[:5]))
    if ctx.progress_step and ctx.progress_total:
        parts.append(f"**Progress:** step {ctx.progress_step} of {ctx.progress_total}")

    if not parts:
        return "The learner is in a DeutschFlow lesson. Help them with their German."

    return "\n".join(parts)


# ── History compression ─────────────────────────────────────────────────

def compress_history(history: list[EmmaChatMessage], max_tokens_est: int = 3000) -> list[EmmaChatMessage]:
    """Keep the last ~N messages; drop the middle if too long.
    Conservative estimate: ~1 token per word for German (compound words
    are less token-efficient than English)."""
    if not history:
        return []
    total = sum(len(m.text.split()) for m in history)
    if total <= max_tokens_est:
        return history
    # Keep the most recent messages that fit under the budget.
    kept: list[EmmaChatMessage] = []
    running = 0
    for m in reversed(history):
        est = len(m.text.split())  # ~1 token per word (conservative for German)
        if running + est > max_tokens_est and kept:
            break
        kept.insert(0, m)
        running += est
    return kept


# ── Prompt builders (versioned) ─────────────────────────────────────────

def build_system_prompt(version: str = DEFAULT_VERSION) -> str:
    """Return the system-level prompt (persona + rules). Same for all versions."""
    return EMMA_PERSONA + "\n\n" + HINT_LADDER


def build_emma_messages(
    user_message: str,
    context: EmmaLessonContext,
    history: list[EmmaChatMessage],
    version: str = DEFAULT_VERSION,
) -> list[dict]:
    """Build the full message array for the API call."""
    ctx_block = _format_context(context)
    compressed = compress_history(history)

    preamble = (
        f"{ctx_block}\n\n"
        "Remember: you are Emma, a German tutor. Stay on this lesson's content. "
        "Follow the hint ladder — never reveal the answer first. "
        "Reply in English with German examples. 2-5 sentences.\n\n"
        "---\n"
        "Now the conversation continues."
    )

    messages: list[dict] = [{"role": "user", "content": preamble}]

    # Inject compressed history first (if any), then seed only for fresh conversations.
    for m in compressed:
        role = "assistant" if m.role == "emma" else "user"
        content = m.text
        if role == "user":
            content = f"[reply in English only] {content}"
        messages.append({"role": role, "content": content})

    # Seed Emma's first response only for fresh conversations (no history).
    if not compressed:
        messages.append({
            "role": "assistant",
            "content": "Hi! I'm Emma, your German coach. I'll explain things clearly and help you through — without handing you the answer. What are you wondering about? 🌱",
        })

    # Append the current learner message.
    messages.append({"role": "user", "content": f"[reply in English only] {user_message}"})

    return messages
