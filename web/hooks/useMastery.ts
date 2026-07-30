"use client";

import { useMemo } from "react";
import type { CheckpointScore } from "./useCheckpoints";

// Lesson mastery calculation (Section 8.4). Consumes checkpoint scores and
// exercise data to produce category-level and overall mastery percentages.
// Kept isolated so future phases can extend the formula without redesign.

export interface MasteryResult {
  /** 0–100 or null when no data */
  overall: number | null;
  categories: {
    dialogueComprehension: number | null;
    vocabularyRecall: number | null;
    grammarApplication: number | null;
    speaking: number | "skipped" | null;
  };
}

export function useMastery(
  checkpointScores: CheckpointScore[],
  speakingSkipped: boolean,
  exerciseAccuracy: number | null = null,
): MasteryResult {
  return useMemo(() => {
    const find = (id: string) =>
      checkpointScores.find((s) => s.checkpointId === id)?.pct ?? null;

    const dialogueComprehension = find("checkpoint-dialogue");
    const grammarApplication = find("checkpoint-grammar");

    // Vocabulary recall uses the final checkpoint (which reviews lesson vocabulary)
    const vocabularyRecall = find("checkpoint-final");

    const speaking: MasteryResult["categories"]["speaking"] = speakingSkipped
      ? "skipped"
      : null; // null means no data; future phases can inject a real score

    // Overall = simple average of checkpoint category scores + exercise accuracy
    const available = [
      dialogueComprehension,
      grammarApplication,
      vocabularyRecall,
      exerciseAccuracy, // exercise completion accuracy
      speaking !== "skipped" && speaking !== null ? speaking : null,
    ].filter((s): s is number => s !== null);

    const overall = available.length > 0
      ? Math.round(available.reduce((a, b) => a + b, 0) / available.length)
      : null;

    return {
      overall,
      categories: { dialogueComprehension, vocabularyRecall, grammarApplication, speaking },
    };
  }, [checkpointScores, speakingSkipped, exerciseAccuracy]);
}
