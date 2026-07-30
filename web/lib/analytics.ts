/**
 * Batched analytics pipeline (Section 12.6). Buffers events and sends them
 * in batches to POST /analytics/events. All Phase 0-5 event types are defined
 * here so baseline collection works before any learning engine changes.
 *
 * Events are flushed on page unload or when the buffer reaches 20 entries.
 */

import { api } from "./api";

export type AnalyticsEvent =
  | "lesson_started"
  | "stage_completed"
  | "word_clicked"
  | "checkpoint_score"
  | "hint_requested"
  | "lesson_completed"
  | "audio_played"
  | "session_duration"
  | "quiz_score";

interface EventPayload {
  event_type: AnalyticsEvent;
  lesson_id?: number;
  stage?: string;
  payload?: Record<string, unknown>;
  client_ts?: string;
}

const BUFFER: EventPayload[] = [];
const FLUSH_THRESHOLD = 20;
const FLUSH_INTERVAL_MS = 10000; // flush every 10s as fallback

let flushTimer: ReturnType<typeof setInterval> | null = null;

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    if (BUFFER.length > 0) flush();
  }, FLUSH_INTERVAL_MS);
}

function stopFlushTimer() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

export function track(event: EventPayload): void {
  BUFFER.push({ ...event, client_ts: new Date().toISOString() });
  startFlushTimer();

  if (BUFFER.length >= FLUSH_THRESHOLD) {
    flush();
  }
}

export async function flush(): Promise<void> {
  if (BUFFER.length === 0) return;

  const batch = BUFFER.splice(0, FLUSH_THRESHOLD);
  try {
    await api.post("/analytics/events", { events: batch });
  } catch {
    // Re-queue on failure (put back at front)
    BUFFER.unshift(...batch);
    stopFlushTimer();
  }
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (BUFFER.length > 0) {
      // Use sendBeacon for reliable delivery during page unload
      const token = localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const body = JSON.stringify({ events: BUFFER });
      try {
        navigator.sendBeacon(
          `${base}/analytics/events`,
          new Blob([body], { type: "application/json" }),
        );
      } catch { /* ignore */ }
    }
  });
}
