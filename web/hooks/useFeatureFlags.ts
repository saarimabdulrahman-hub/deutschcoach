"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

// Feature flag system (Section 12.1). Resolves flags from:
//   1. localStorage (instant, for already-fetched values)
//   2. API (GET /flags — fresh from backend with rollout logic)
//
// Required flags: interactive-dialogue, stage-based-lessons,
//                 emma-in-lesson, adaptive-vocab, native-audio

const STORAGE_KEY = "deutschcoach-feature-flags";

export interface FeatureFlags {
  "interactive-dialogue": boolean;
  "stage-based-lessons": boolean;
  "emma-in-lesson": boolean;
  "adaptive-vocab": boolean;
  "native-audio": boolean;
  [key: string]: boolean;
}

const DEFAULTS: FeatureFlags = {
  "interactive-dialogue": true,
  "stage-based-lessons": true,
  "emma-in-lesson": true,
  "adaptive-vocab": true,
  "native-audio": true,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    // Initialize from localStorage for instant availability
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULTS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/flags").then((data: any) => {
      if (data?.flags) {
        const resolved: FeatureFlags = { ...DEFAULTS };
        for (const f of data.flags) {
          resolved[f.key] = f.enabled;
        }
        setFlags(resolved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
      }
    }).catch(() => {
      // API unavailable — keep localStorage defaults
    }).finally(() => setLoading(false));
  }, []);

  const isEnabled = useCallback((key: string): boolean => {
    return flags[key] ?? DEFAULTS[key] ?? false;
  }, [flags]);

  return { flags, loading, isEnabled };
}
