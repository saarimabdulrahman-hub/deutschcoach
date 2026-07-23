/**
 * useRecovery — Draft recovery hook
 * Checks localStorage for saved draft on mount.
 * Returns restore/dismiss actions.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "dc_autosave_";

interface UseRecoveryResult<T> {
  draft: T | null;
  hasDraft: boolean;
  restore: () => T | null;
  dismiss: () => void;
}

export function useRecovery<T>(key: string): UseRecoveryResult<T> {
  const [draft, setDraft] = useState<T | null>(null);
  const storageKey = `${STORAGE_PREFIX}${key}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        setDraft(parsed);
      }
    } catch {
      // Invalid JSON or storage unavailable
    }
  }, [storageKey]);

  const restore = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as T;
      localStorage.removeItem(storageKey);
      setDraft(null);
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey]);

  const dismiss = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch { /* ignore */ }
    setDraft(null);
  }, [storageKey]);

  return { draft, hasDraft: draft !== null, restore, dismiss };
}
