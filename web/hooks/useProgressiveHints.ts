"use client";

import { useState, useCallback } from "react";

// Progressive hint system (Section 8.7). Four levels that progressively reveal
// more information. Learners can always ignore hints and continue independently.

export interface HintLevel {
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface UseProgressiveHintsReturn {
  currentLevel: number;
  currentHint: string | null;
  allHints: HintLevel[];
  advanceHint: () => void;
  resetHints: () => void;
  hasMore: boolean;
}

export function useProgressiveHints(hints: HintLevel[]): UseProgressiveHintsReturn {
  const [level, setLevel] = useState(0);

  const advanceHint = useCallback(() => {
    setLevel((prev) => Math.min(prev + 1, hints.length));
  }, [hints.length]);

  const resetHints = useCallback(() => {
    setLevel(0);
  }, []);

  return {
    currentLevel: level,
    currentHint: level > 0 && level <= hints.length ? hints[level - 1].text : null,
    allHints: hints,
    advanceHint,
    resetHints,
    hasMore: level < hints.length,
  };
}
