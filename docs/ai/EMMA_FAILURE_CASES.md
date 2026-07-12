# Emma — Failure Cases & Recovery
**Version:** 1.0 · **Updated:** 2026-07-13 · **Status:** Active
**Source:** emma router (app/routers/emma.py) · emma_prompts.py · EMMA_PERSONALITY.md

> Every known failure mode, its expected behavior, and the recovery strategy. Emma must degrade gracefully — never crash, never leave the learner stranded.

---

## 1. Known limitations (by design)

| Limitation | Why | Mitigation |
|---|---|---|
| Emma doesn't remember past lessons | Stateless v1 architecture | Lesson context provides everything needed for the current lesson |
| Emma can't hear or analyze pronunciation | No speech backend | Text-based speaking stage; pronunciation guidance is qualitative |
| Emma's responses are not personalized | No long-term learner model | Rich lesson context compensates — she knows exactly what's being studied |
| Emma's response time may vary | Depends on LLM latency | Typing indicator shown during wait; 45s timeout for streaming |

## 2. Expected failures & recovery

### F1 — LLM API timeout
- **Symptom:** Emma's response takes >45 seconds.
- **Recovery:** Backend returns SSE `error` event: *"Emma is taking too long — try again in a moment."* The frontend typing indicator stops. The learner can retry the message.
- **Retry:** 2 retries with exponential backoff (0.5s, 1s). If all retries fail, a generic error is shown.
- *(Source: app/routers/emma.py `_stream_anthropic` timeout handling)*

### F2 — LLM API returns an error
- **Symptom:** Anthropic returns 4xx/5xx.
- **Recovery:** Backend logs the full error server-side, returns a generic `"The AI service is temporarily unavailable. Please try again later."` to the client. No raw error details are exposed.
- *(Source: app/routers/emma.py non-streaming response handler)*

### F3 — ANTHROPIC_API_KEY not configured
- **Symptom:** Emma backend starts without a key.
- **Recovery:** HTTP 503 — `"Emma is not configured — set ANTHROPIC_API_KEY in backend/.env."` The frontend Emma button still renders; sending a message shows this error. The v1 local response generator on the frontend continues to work as a fallback.
- *(Source: app/routers/emma.py + EmmaContext.tsx `generateEmmaResponse`)*

### F4 — Rate limit exceeded
- **Symptom:** User sends >20 messages in 60 seconds.
- **Recovery:** HTTP 429 — `"Too many messages. Wait a moment and try again."` The in-memory rate store resets after the window passes.
- *(Source: app/routers/emma.py `_check_rate`)*

### F5 — Empty lesson context
- **Symptom:** Emma receives a message with no lesson title, no stage, no vocabulary.
- **Recovery:** The context preamble renders a generic fallback: `"The learner is in a DeutschFlow lesson. Help them with their German."` Emma can still provide general German help but won't be lesson-specific.
- *(Source: emma_prompts.py `_format_context` fallback)*

### F6 — Conversation history too long
- **Symptom:** The learner has sent 50+ messages in one session.
- **Recovery:** `compress_history()` keeps only the most recent messages under the token budget (~3000 tokens). Older messages are silently dropped. The context `messageCount` field tells Emma the total count.
- *(Source: emma_prompts.py `compress_history`)*

### F7 — Offline (no internet)
- **Symptom:** The frontend can't reach `POST /emma/chat`.
- **Recovery:** The v1 local response generator (`generateEmmaResponse` in EmmaContext.tsx) handles the 6 quick actions + fallback. Emma is still functional — just without the full LLM. The frontend typing indicator still shows during the 800ms simulated delay.
- *(Source: EmmaContext.tsx `send()` method)*

## 3. Fallback messages (Emma's voice during failures)

| Situation | Emma says |
|---|---|
| LLM unavailable (offline / error) | *"I'm having trouble connecting right now. I can still help with the basics — try one of the quick actions below. 🌱"* |
| Timeout | *"That took a bit longer than expected. Try asking again — sometimes a shorter question helps."* |
| Rate limited | *"Whoa — let's slow down a moment. I'm still here. Try again in a few seconds."* |
| Empty context | *"I'm not sure which lesson you're on — but I'm happy to help with any German question. What are you working on?"* |

*(Source: EMMA_PERSONALITY.md "warm, calm, never leaves the learner stranded")*

## 4. Timeout behavior
| Phase | Timeout | What happens |
|---|---|---|
| Streaming connection | 45s | Error event pushed; typing indicator stops |
| Non-streaming request | 30s | HTTP 504 returned; retry available |
| Rate limit window | 60s | HTTP 429; auto-resets after window |
| Client-side response simulation | 800ms | Typing indicator; local response appears |

*(Source: app/routers/emma.py timeout/retry config)*

## 5. Missing context handling
When the lesson context is partially missing:

| Missing field | Emma's behavior |
|---|---|
| No vocabulary | Doesn't reference specific words; stays general |
| No grammar pattern | Explains concepts without naming a specific pattern |
| No exercise | Doesn't reference "this question"; offers general help |
| No stage label | Uses "this lesson" as fallback |
| No progress | Doesn't mention "step X of Y" |

Emma **never crashes or returns an error** due to missing context fields. The prompt engine gracefully degrades — each field is optional in the preamble assembly.

## 6. Empty lesson handling
When a learner opens Emma before a lesson is loaded (edge case — the lesson page always provides context):
- The context preamble is: `"The learner is in a DeutschFlow lesson. Help them with their German."`
- Emma introduces herself and asks what the learner is working on.
- The quick actions still work (they don't depend on context).

## 7. Escalation behavior
Emma never escalates to a human — there is no human-in-the-loop. If Emma cannot help, she says so honestly: *"I'm not sure about that — let's focus on what we do know. Want to look at the current exercise together?"*
