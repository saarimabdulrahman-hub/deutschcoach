"use client";

import { useState, useCallback } from "react";

// Checkpoint scoring hook (Section 8.3). Records per-checkpoint scores for
// future lesson mastery calculation. Pure React state — no persistence yet.

export interface CheckpointScore {
  checkpointId: string;
  correct: number;
  total: number;
  pct: number;
}

export interface UseCheckpointsReturn {
  scores: CheckpointScore[];
  recordScore: (checkpointId: string, correct: number, total: number) => void;
  /** Aggregate percentage across all checkpoints (0–100, or null if none). */
  aggregatePct: number | null;
}

export function useCheckpoints(): UseCheckpointsReturn {
  const [scores, setScores] = useState<CheckpointScore[]>([]);

  const recordScore = useCallback((checkpointId: string, correct: number, total: number) => {
    setScores((prev) => {
      const existing = prev.findIndex((s) => s.checkpointId === checkpointId);
      const entry: CheckpointScore = {
        checkpointId,
        correct,
        total,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const aggregatePct =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.pct, 0) / scores.length)
      : null;

  return { scores, recordScore, aggregatePct };
}
