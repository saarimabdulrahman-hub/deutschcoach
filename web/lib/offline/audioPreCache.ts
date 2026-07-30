/**
 * Smart audio pre-caching (Section 12.5). Proactively caches audio on Wi-Fi
 * using the priority order defined by the specification:
 *   1. Due SRS cards
 *   2. New SRS cards
 *   3. Current lesson
 *   4. Next 2 lessons
 *   5. Mature SRS cards (last)
 *
 * Also handles automatic cleanup of mature card audio and re-fetch on access.
 */

import { sanitizeAudioFilename } from "@/hooks/useSpeech";

const CACHE_NAME = "deutschcoach-audio-v1";
const AUDIO_BASE = "/audio/";

// ── Pre-cache a single audio file via the Service Worker cache ──────────

async function cacheAudioFile(filename: string): Promise<void> {
  try {
    const url = `${AUDIO_BASE}${filename}`;
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (!cached) {
      const response = await fetch(url);
      if (response.ok) cache.put(url, response);
    }
  } catch {
    // Silently fail — audio will be fetched on demand
  }
}

// ── Smart pre-cache with priority ordering ──────────────────────────────

export async function preCacheByPriority(
  dueWords: string[],
  newWords: string[],
  currentLessonWords: string[],
  nextLessonWords: string[],
  matureWords: string[],
): Promise<void> {
  const allWords = [
    ...dueWords.map((w) => ({ word: w, priority: 1 })),
    ...newWords.map((w) => ({ word: w, priority: 2 })),
    ...currentLessonWords.map((w) => ({ word: w, priority: 3 })),
    ...nextLessonWords.map((w) => ({ word: w, priority: 4 })),
    ...matureWords.map((w) => ({ word: w, priority: 5 })),
  ];

  // Process in priority order
  allWords.sort((a, b) => a.priority - b.priority);

  for (const entry of allWords) {
    const filename = sanitizeAudioFilename(entry.word) + ".mp3";
    await cacheAudioFile(filename);
  }
}

// ── Pre-cache single lesson vocabulary ──────────────────────────────────

export async function preCacheLesson(words: string[]): Promise<void> {
  for (const word of words) {
    const filename = sanitizeAudioFilename(word) + ".mp3";
    await cacheAudioFile(filename);
  }
}

// ── Mature audio cleanup ────────────────────────────────────────────────
// Removes audio for cards where:
//   - learner completed the unit
//   - card status is reviewing
//   - review interval exceeds 30 days

export async function cleanupMatureAudio(matureCardWords: string[]): Promise<number> {
  let removed = 0;
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const word of matureCardWords) {
      const filename = sanitizeAudioFilename(word) + ".mp3";
      const url = `${AUDIO_BASE}${filename}`;
      const cached = await cache.match(url);
      if (cached) {
        await cache.delete(url);
        removed++;
      }
    }
  } catch {
    // Silently fail
  }
  return removed;
}

// ── Check if audio is cached (for re-fetch decision) ────────────────────

export async function isAudioCached(word: string): Promise<boolean> {
  try {
    const filename = sanitizeAudioFilename(word) + ".mp3";
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(`${AUDIO_BASE}${filename}`);
    return !!cached;
  } catch {
    return false;
  }
}

// ── Re-fetch audio that was removed by cleanup ──────────────────────────

export async function ensureAudioCached(word: string): Promise<void> {
  const has = await isAudioCached(word);
  if (!has) {
    const filename = sanitizeAudioFilename(word) + ".mp3";
    await cacheAudioFile(filename);
  }
}
