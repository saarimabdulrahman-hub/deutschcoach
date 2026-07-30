"use client";

import { useMemo } from "react";
import type { CheckpointScore } from "./useCheckpoints";

// Unified confidence estimation (Section 10.1).
// Combines checkpoint accuracy, exercise accuracy, and SRS history
// into a single confidence score displayed as Low / Medium / High.

export type ConfidenceLevel = "low" | "medium" | "high";

export interface UseConfidenceReturn {
  score: number | null;     // 0-100
  level: ConfidenceLevel | null;
  label: string;            // "Low", "Medium", "High", or "—"
}

export function useConfidence(
  checkpointScores: CheckpointScore[],
  exerciseAccuracy: number | null,
  srsRatingHistory?: number[],
): UseConfidenceReturn {
  return useMemo(() => {
    const inputs: number[] = [];

    // Checkpoint accuracy
    if (checkpointScores.length > 0) {
      const avg = checkpointScores.reduce((s, c) => s + c.pct, 0) / checkpointScores.length;
      inputs.push(avg);
    }

    // Exercise accuracy
    if (exerciseAccuracy !== null) {
      inputs.push(exerciseAccuracy);
    }

    // SRS rating history (recent ratings, 0-5 scale mapped to 0-100)
    if (srsRatingHistory && srsRatingHistory.length > 0) {
      const recent = srsRatingHistory.slice(-10);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      inputs.push((avg / 5) * 100);
    }

    if (inputs.length === 0) return { score: null, level: null, label: "—" };

    const score = Math.round(inputs.reduce((a, b) => a + b, 0) / inputs.length);

    let level: ConfidenceLevel;
    if (score >= 75) level = "high";
    else if (score >= 45) level = "medium";
    else level = "low";

    const labels: Record<ConfidenceLevel, string> = { low: "Low", medium: "Medium", high: "High" };

    return { score, level, label: labels[level] };
  }, [checkpointScores, exerciseAccuracy, srsRatingHistory]);
}
