/**
 * IndexedDB persistence (Section 12.5). Stores lesson content, answers,
 * and offline queues. Provides cache-first access with size tracking.
 */

const DB_NAME = "deutschcoach-offline";
const DB_VERSION = 1;
const MAX_LESSON_CACHE = 7;  // 5 completed + 2 next

interface DBSchema {
  lessons: { key: number; value: any; };
  answers: { key: string; value: any; };
  checkpoints: { key: string; value: any; };
  quizResults: { key: string; value: any; };
  audioMeta: { key: string; value: { key: string; size: number; accessed: number; level: string; }; };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("lessons")) {
        db.createObjectStore("lessons", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("answers")) {
        db.createObjectStore("answers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("checkpoints")) {
        db.createObjectStore("checkpoints", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("quizResults")) {
        db.createObjectStore("quizResults", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("audioMeta")) {
        db.createObjectStore("audioMeta", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Lesson caching ──────────────────────────────────────────────────────

export async function cacheLesson(lesson: any): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("lessons", "readwrite");
  tx.objectStore("lessons").put(lesson);

  // Enforce cache limit — remove oldest entries beyond MAX_LESSON_CACHE
  const count = await new Promise<number>((res) => {
    const c = tx.objectStore("lessons").count();
    c.onsuccess = () => res(c.result);
  });

  if (count > MAX_LESSON_CACHE) {
    const all = await getAllLessons();
    const sorted = all.sort((a, b) => (a.cachedAt || 0) - (b.cachedAt || 0));
    const toRemove = sorted.slice(0, sorted.length - MAX_LESSON_CACHE);
    for (const r of toRemove) {
      tx.objectStore("lessons").delete(r.id);
    }
  }
}

export async function getCachedLesson(id: number): Promise<any | null> {
  const db = await openDb();
  const tx = db.transaction("lessons", "readonly");
  return new Promise((res) => {
    const req = tx.objectStore("lessons").get(id);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => res(null);
  });
}

async function getAllLessons(): Promise<any[]> {
  const db = await openDb();
  const tx = db.transaction("lessons", "readonly");
  return new Promise((res) => {
    const req = tx.objectStore("lessons").getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => res([]);
  });
}

export async function getLessonCacheCount(): Promise<number> {
  const db = await openDb();
  const tx = db.transaction("lessons", "readonly");
  return new Promise((res) => {
    const req = tx.objectStore("lessons").count();
    req.onsuccess = () => res(req.result);
    req.onerror = () => res(0);
  });
}

// ── Answer caching ──────────────────────────────────────────────────────

export async function cacheAnswer(key: string, data: any): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("answers", "readwrite");
  tx.objectStore("answers").put({ id: key, ...data, cachedAt: Date.now() });
}

// ── Checkpoint queue ────────────────────────────────────────────────────

export async function queueCheckpoint(data: any): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("checkpoints", "readwrite");
  tx.objectStore("checkpoints").add({ id: `cp_${Date.now()}`, ...data, queuedAt: Date.now() });
}

export async function flushCheckpoints(): Promise<number> {
  const db = await openDb();
  const tx = db.transaction("checkpoints", "readonly");
  const all = await new Promise<any[]>((res) => {
    const req = tx.objectStore("checkpoints").getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => res([]);
  });

  let synced = 0;
  for (const cp of all) {
    try {
      const { api } = await import("@/lib/api");
      await api.post(`/lessons/${cp.lesson_id}/checkpoint`, cp);
      const writeTx = db.transaction("checkpoints", "readwrite");
      writeTx.objectStore("checkpoints").delete(cp.id);
      synced++;
    } catch { break; }
  }
  return synced;
}

export async function getQueuedCheckpointCount(): Promise<number> {
  const db = await openDb();
  const tx = db.transaction("checkpoints", "readonly");
  return new Promise((res) => {
    const req = tx.objectStore("checkpoints").count();
    req.onsuccess = () => res(req.result);
    req.onerror = () => res(0);
  });
}

// ── Audio metadata tracking for smart cache management ──────────────────

export async function trackAudioAccess(key: string, size: number, level: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("audioMeta", "readwrite");
  tx.objectStore("audioMeta").put({ key, size, accessed: Date.now(), level });
}

export async function evictOldestAudio(budgetBytes: number): Promise<number> {
  const db = await openDb();
  const tx = db.transaction("audioMeta", "readonly");
  const all: any[] = await new Promise((res) => {
    const req = tx.objectStore("audioMeta").getAll();
    req.onsuccess = () => res(req.result || []);
  });

  let total = all.reduce((s, a) => s + (a.size || 0), 0);
  let evicted = 0;
  const sorted = all.sort((a, b) => (a.accessed || 0) - (b.accessed || 0));

  for (const entry of sorted) {
    if (total <= budgetBytes) break;
    const writeTx = db.transaction("audioMeta", "readwrite");
    writeTx.objectStore("audioMeta").delete(entry.key);
    total -= entry.size || 0;
    evicted++;
  }
  return evicted;
}

// ── Storage usage ───────────────────────────────────────────────────────

export async function getStorageUsage(): Promise<{ audioCacheBytes: number; lessonCount: number; checkpointCount: number }> {
  const db = await openDb();
  const audioTx = db.transaction("audioMeta", "readonly");
  const audioMeta: any[] = await new Promise((res) => {
    const req = audioTx.objectStore("audioMeta").getAll();
    req.onsuccess = () => res(req.result || []);
  });
  const audioCacheBytes = audioMeta.reduce((s, a) => s + (a.size || 0), 0);
  const lessonCount = await getLessonCacheCount();
  const checkpointCount = await getQueuedCheckpointCount();
  return { audioCacheBytes, lessonCount, checkpointCount };
}

// ── Clear all ───────────────────────────────────────────────────────────

export async function clearOfflineData(): Promise<void> {
  const db = await openDb();
  for (const store of ["lessons", "answers", "checkpoints", "quizResults", "audioMeta"]) {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
  }
}
