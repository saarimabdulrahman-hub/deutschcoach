// Lesson persistence service (Sprint 21). Online via /checkpoint API with
// localStorage fallback for offline. Simple last-write-wins conflict model
// (server is authoritative; local queue replays on reconnect).

import { api } from "./api";

const LS_PREFIX = "dc_checkpoint_";

interface Checkpoint {
  lessonId: number;
  currentStage: string;
  completedStages: string[];
  timeSpentSec: number;
  updatedAt?: string;
}

// ── Core API ────────────────────────────────────────────────────────────

export async function saveCheckpoint(cp: Checkpoint): Promise<void> {
  const payload = {
    current_stage: cp.currentStage,
    completed_stages: cp.completedStages,
    time_spent_sec: cp.timeSpentSec,
  };
  try {
    await api.post(`/checkpoint/${cp.lessonId}`, payload);
    // Clear local fallback on successful server write.
    clearLocalCheckpoint(cp.lessonId);
  } catch {
    // Offline — save locally to replay later.
    setLocalCheckpoint(cp);
    queueReplay(cp.lessonId);
  }
}

export async function loadCheckpoint(lessonId: number): Promise<Checkpoint | null> {
  try {
    const res = await api.get<{ has_checkpoint: boolean; checkpoint: any }>(`/checkpoint/${lessonId}/resume`);
    if (res?.has_checkpoint && res.checkpoint) {
      const server: Checkpoint = {
        lessonId: res.checkpoint.lesson_id,
        currentStage: res.checkpoint.current_stage,
        completedStages: res.checkpoint.completed_stages ?? [],
        timeSpentSec: res.checkpoint.time_spent_sec ?? 0,
        updatedAt: res.checkpoint.updated_at,
      };
      return server;
    }
    // No server checkpoint — check local fallback.
    const local = getLocalCheckpoint(lessonId);
    return local ?? null;
  } catch {
    return getLocalCheckpoint(lessonId) ?? null;
  }
}

export async function resetCheckpoint(lessonId: number): Promise<void> {
  try { await api.delete(`/checkpoint/${lessonId}`); } catch { /* offline — clear locally */ }
  clearLocalCheckpoint(lessonId);
}

// ── localStorage fallback ──────────────────────────────────────────────

function storageKey(lessonId: number) { return `${LS_PREFIX}${lessonId}`; }

function setLocalCheckpoint(cp: Checkpoint): void {
  try { localStorage.setItem(storageKey(cp.lessonId), JSON.stringify(cp)); } catch { /* quota exceeded */ }
}

function getLocalCheckpoint(lessonId: number): Checkpoint | null {
  try {
    const raw = localStorage.getItem(storageKey(lessonId));
    if (!raw) return null;
    return JSON.parse(raw) as Checkpoint;
  } catch { return null; }
}

function clearLocalCheckpoint(lessonId: number): void {
  try { localStorage.removeItem(storageKey(lessonId)); } catch { /* ignore */ }
}

// ── Replay queue (offline → online) ────────────────────────────────────

const REPLAY_KEY = "dc_replay_queue";
let _replaying = false;

function queueReplay(lessonId: number): void {
  const q = getReplayQueue();
  if (!q.includes(lessonId)) { q.push(lessonId); saveReplayQueue(q); }
  if (typeof navigator !== "undefined" && navigator.onLine && !_replaying) flushReplay();
}

function getReplayQueue(): number[] {
  try { return JSON.parse(localStorage.getItem(REPLAY_KEY) ?? "[]") as number[]; } catch { return []; }
}

function saveReplayQueue(q: number[]): void {
  try { localStorage.setItem(REPLAY_KEY, JSON.stringify(q)); } catch { /* ignore */ }
}

export async function flushReplay(): Promise<void> {
  if (_replaying) return;
  _replaying = true;
  const q = getReplayQueue();
  while (q.length > 0) {
    const lessonId = q[0];
    const local = getLocalCheckpoint(lessonId);
    if (!local) { q.shift(); continue; }
    try {
      await saveCheckpoint(local); // will clear the local fallback on success
      q.shift();
    } catch { break; /* still offline — stop and retry later */ }
  }
  saveReplayQueue(q);
  _replaying = false;
}

// Listen for connectivity recovery.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => { flushReplay(); });
}

// ── Conflict resolution ────────────────────────────────────────────────
// Simple model: server always wins. `resolveCheckpoint` merges a local
// checkpoint into a server one (useful for cross-device: you were further on
// device A, device B has an older checkpoint — server A wins via timestamp).

export function resolveCheckpoint(local: Checkpoint | null, server: Checkpoint | null): Checkpoint | null {
  if (!local && !server) return null;
  if (!local) return server;
  if (!server) return local;
  // Server is authoritative — keep the server checkpoint.
  // Future: merge completedStages so progress on either device is preserved.
  const merged = new Set([...(server.completedStages ?? []), ...(local.completedStages ?? [])]);
  return { ...server, completedStages: [...merged] };
}
