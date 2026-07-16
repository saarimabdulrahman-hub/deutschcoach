/**
 * Offline Storage — localStorage wrapper with typed get/set, TTL
 * Cache-first, network-fallback strategy
 * Reference: 05_INTERACTION_PATTERNS/009_Offline_And_Sync_Flow.md
 */

const PREFIX = "dc_offline_";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number; // ms
}

export function setCache<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  try {
    const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl: ttlMs };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Quota exceeded or unavailable
  }
}

export function getCache<T>(key: string): { data: T; fresh: boolean } | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    const fresh = Date.now() - entry.cachedAt < entry.ttl;
    return { data: entry.data, fresh };
  } catch {
    return null;
  }
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(`${PREFIX}${key}`);
    } else {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch { /* ignore */ }
}

export function hasCache(key: string): boolean {
  return getCache(key) !== null;
}
