"use client";

import { useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";

// A/B testing framework (Section 12.3). Tracks experiment metrics using
// the existing feature flag system and analytics infrastructure.
//
// Required metrics:
//   completion rate  — lesson_completed / lesson_started
//   time spent       — time_spent events
//   checkpoint scores — checkpoint_results
//   return rate       — subsequent lesson_started after completion

interface ExperimentConfig {
  /** The experiment name (e.g. "lesson-flow") */
  experimentName: string;
  /** The variant the user is assigned to (e.g. "legacy" or "stage-based") */
  variant: string;
  /** The lesson ID being taken */
  lessonId?: number;
}

export function useExperiment({ experimentName, variant, lessonId }: ExperimentConfig) {
  const startTimeRef = useRef<number>(Date.now());
  const sessionRef = useRef<string | null>(null);

  // Record lesson start with experiment variant
  useEffect(() => {
    if (!lessonId) return;
    startTimeRef.current = Date.now();
    sessionRef.current = `exp-${experimentName}-${lessonId}-${Date.now()}`;

    api.post("/analytics/event", {
      event_type: "lesson_started",
      lesson_id: lessonId,
      payload: {
        experiment: experimentName,
        variant,
        session_id: sessionRef.current,
      },
    }).catch(() => {});
  }, [experimentName, variant, lessonId]);

  // Track completion
  const trackComplete = useCallback(() => {
    if (!lessonId || !sessionRef.current) return;

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    api.post("/analytics/event", {
      event_type: "lesson_completed",
      lesson_id: lessonId,
      payload: {
        experiment: experimentName,
        variant,
        session_id: sessionRef.current,
        time_spent_sec: timeSpent,
      },
    }).catch(() => {});

    // Track time spent separately for analysis
    api.post("/analytics/event", {
      event_type: "time_spent",
      lesson_id: lessonId,
      payload: {
        experiment: experimentName,
        variant,
        session_id: sessionRef.current,
        seconds: timeSpent,
      },
    }).catch(() => {});
  }, [experimentName, variant, lessonId]);

  // Track checkpoint scores
  const trackCheckpoint = useCallback((checkpointId: string, correct: number, total: number) => {
    if (!lessonId || !sessionRef.current) return;

    api.post("/analytics/event", {
      event_type: "checkpoint_result",
      lesson_id: lessonId,
      stage: checkpointId,
      payload: {
        experiment: experimentName,
        variant,
        session_id: sessionRef.current,
        correct,
        total,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    }).catch(() => {});
  }, [experimentName, variant, lessonId]);

  return { trackComplete, trackCheckpoint };
}
