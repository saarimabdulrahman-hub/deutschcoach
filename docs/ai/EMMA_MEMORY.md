# Emma — Memory & Context Model
**Version:** 1.0 · **Updated:** 2026-07-13 · **Status:** Active
**Source:** emma_prompts.py (compress_history) · emma-pipeline.ts (ConversationContext) · EMMA_CONTEXT_SCHEMA.md

> What Emma remembers, what she forgets, and why. Designed for a stateless LLM backend where the client sends the full history on every request.

---

## 1. Conversation memory (short-term)
Emma receives the **last N messages** of the current conversation on every request. This is her short-term memory.

- **Stored:** client-side in `EmmaContext.messages[]` (React state). Sent to the backend in `EmmaChatMessage[]` via `EmmaRequest.history`.
- **Compression:** the backend's `compress_history()` keeps messages that fit under a ~3000-token budget (oldest dropped first). The frontend `EmmaConversation` component also uses `content-visibility: auto` for messages beyond index 30 to reduce rendering cost.
- **Lifetime:** survives stage changes within a lesson, and browser tab refresh within the same lesson (if the lesson page is a SPA route). **Lost on full page refresh** (no persistence yet).

## 2. Lesson memory (what Emma knows about this lesson)
On every message, Emma receives the full `EmmaFullContext` — see EMMA_CONTEXT_SCHEMA.md. This is her lesson memory:

| She remembers | She does NOT remember |
|---|---|
| Lesson title, level, unit | Previous lessons' vocabulary (unless in the conversation) |
| Current stage and progress | The learner's overall curriculum position |
| Lesson vocabulary (first 15 words) | Vocabulary from past lessons |
| Current grammar pattern + examples | Grammar from past lessons |
| Current exercise question + expected answer | Past exercise results |
| The last learner answer (if submitted) | Historical accuracy rates |
| Expected mistakes for this exercise | The learner's individual weak areas (future: SRS data) |

## 3. Session memory (what persists across Emma opens)
Within a single lesson session, Emma remembers the full conversation history. Closing and reopening the panel does not clear the chat. Moving between stages does not clear the chat. The chat is only cleared when the learner taps "New chat" or leaves the lesson entirely. *(Source: EmmaContext.tsx — messages[] state persists across setContext updates)*

## 4. Long-term memory (what persists across sessions)
**Nothing — by design (v1).** Emma is stateless between lessons. When the learner starts a new lesson, Emma's conversation starts fresh with the seed message.

**Future (not yet implemented):**
- Conversation persistence in the backend (`EmmaConversation` DB model).
- Cross-lesson vocabulary awareness (Emma knows the learner already studied *Hallo* in Lesson 1).
- Weak-area tracking from SRS data (Emma knows the learner struggles with *du/Sie*).

## 5. Context window strategy
The total token budget for each LLM call is managed as follows:

| Component | Token budget (est.) |
|---|---|
| System prompt (persona + rules) | ~250 |
| Lesson context preamble | ~200–400 |
| Seed assistant message | ~25 |
| Compressed history | ~3000 (adaptive) |
| Current learner message | ~50 |
| **Total** | **~3500–3800** |

The Anthropic model is called with `max_tokens: 500` for the response. The total prompt + response is well under the model's context window (100K+ tokens).

## 6. What is remembered (decision table)
| Data | Stored? | Where? | Lifetime |
|---|---|---|---|
| Current conversation messages | ✅ | `EmmaContext.messages[]` + `EmmaRequest.history` | Lesson session |
| Lesson context (title, stage, vocab, grammar) | ✅ | `EmmaContext.context` (updated on stage change) | Lesson session |
| Learner's name / profile | ❌ | — | — |
| Past lessons completed | ❌ | — | Future: SRS data |
| Pronunciation attempts | ❌ | — | Future: speech backend |
| Off-topic conversations Emma redirected | ❌ | — | — |

## 7. What is forgotten (by design)
- **Everything from previous lessons.** Each lesson is a clean slate — Emma doesn't carry baggage from past sessions. This is intentional for v1: it keeps the context window small and avoids the complexity of long-term learner modeling. The trade-off is that Emma can't say "Last lesson you struggled with *du/Sie* — let's practice that again."
- **Learner identity.** Emma doesn't know the learner's name, age, location, or any PII. The context does not include user profile fields. *(Privacy by design)*

## 8. Privacy considerations
- No PII is ever sent to Emma's backend. The `EmmaLessonContext` contains only lesson metadata and de-identified conversation text.
- No conversation data is persisted on the server (v1). Messages exist only in the client's React state and the in-flight API request.
- If conversation persistence is added in the future, it must be opt-in with clear disclosure, and all stored messages must be deletable by the user.
