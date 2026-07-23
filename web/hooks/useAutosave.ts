/**
 * useAutosave — Generic autosave hook
 * Saves data to localStorage at a set interval if data changed.
 * Flushes on unmount.
 */

"use client";

import { useRef, useEffect } from "react";

const STORAGE_PREFIX = "dc_autosave_";

export function useAutosave<T>(key: string, data: T, interval = 3000): void {
  const prevRef = useRef<string>("");
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const serialized = JSON.stringify(data);

    // Skip if data hasn't changed
    if (serialized === prevRef.current) return;
    prevRef.current = serialized;

    // Debounce save to interval
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
      } catch {
        // Storage quota exceeded or unavailable — silently fail
        console.warn("Autosave failed: storage unavailable");
      }
    }, interval);

    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [key, data, interval]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (prevRef.current) {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${key}`, prevRef.current);
        } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
