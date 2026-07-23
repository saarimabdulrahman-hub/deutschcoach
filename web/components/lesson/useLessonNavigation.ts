"use client";

import { useCallback, useMemo, useState } from "react";
import type { LessonStep } from "./ProgressSegments";
import { type LessonStageDef, DEFAULT_STAGE_CTA } from "./lessonStages";

// The lesson navigation state machine (Sprint 6.2D). Pure logic — no UI, no
// persistence, no routing — so it is trivially unit-testable and future-safe.
// Progress advances only when a stage is completed (goNext).

export interface UseLessonNavigationArgs {
  stages: LessonStageDef[];
  initialStageKey?: string;      // resume point (from props — no persistence here)
  initialCompleted?: string[];   // resume: stages already done
  onStageChange?: (key: string, index: number) => void;
  onComplete?: (key: string) => void;
  onFinish?: () => void;
}

export interface LessonNavApi {
  stages: LessonStageDef[];
  currentStage: LessonStageDef | null;
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  completedKeys: string[];
  isCompleted: (key: string) => boolean;
  steps: LessonStep[];     // for the shell's ProgressSegments
  currentStep: number;     // 1-based
  ctaLabel: string;        // auto CTA for the current stage
  goNext: () => void;      // complete current, then advance (or finish if last)
  goBack: () => void;      // previous stage (does not un-complete)
  goTo: (key: string) => void; // jump (resume / deep-link); unknown key is ignored
  error: string | null;    // structural error (no/invalid stage)
}

export function useLessonNavigation({
  stages, initialStageKey, initialCompleted = [], onStageChange, onComplete, onFinish,
}: UseLessonNavigationArgs): LessonNavApi {
  const startIndex = useMemo(() => {
    if (initialStageKey) {
      const i = stages.findIndex((s) => s.key === initialStageKey);
      if (i >= 0) return i;
    }
    return 0;
  }, [initialStageKey, stages]);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialCompleted));

  const error =
    stages.length === 0 ? "This lesson has no stages."
      : currentIndex < 0 || currentIndex >= stages.length ? "This lesson stage is unavailable."
      : null;
  const currentStage = error ? null : stages[currentIndex] ?? null;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= stages.length - 1;

  const isCompleted = useCallback((key: string) => completed.has(key), [completed]);

  const goTo = useCallback((key: string) => {
    const i = stages.findIndex((s) => s.key === key);
    if (i < 0) return; // unknown stage → graceful no-op (stay put)
    setCurrentIndex(i);
    onStageChange?.(key, i);
  }, [stages, onStageChange]);

  const goNext = useCallback(() => {
    const cur = stages[currentIndex];
    if (!cur) return;
    setCompleted((prev) => (prev.has(cur.key) ? prev : new Set(prev).add(cur.key)));
    onComplete?.(cur.key);
    if (currentIndex >= stages.length - 1) { onFinish?.(); return; }
    const ni = currentIndex + 1;
    setCurrentIndex(ni);
    onStageChange?.(stages[ni].key, ni);
  }, [currentIndex, stages, onComplete, onFinish, onStageChange]);

  const goBack = useCallback(() => {
    if (currentIndex <= 0) return;
    const ni = currentIndex - 1;
    setCurrentIndex(ni);
    onStageChange?.(stages[ni].key, ni);
  }, [currentIndex, stages, onStageChange]);

  // Progress segments — only stages that count toward progress.
  const { steps, currentStep } = useMemo(() => {
    const prog = stages.filter((s) => s.inProgress !== false);
    const curKey = currentStage?.key;
    const built: LessonStep[] = prog.map((s) => {
      const fullIdx = stages.findIndex((x) => x.key === s.key);
      let status: LessonStep["status"];
      if (completed.has(s.key)) status = "done";
      else if (s.key === curKey) status = "current";
      else if (fullIdx < currentIndex) status = s.optional ? "skipped" : "done";
      else status = "upcoming";
      return { key: s.key, label: s.label, status };
    });
    const curProgIdx = prog.findIndex((s) => s.key === curKey);
    return { steps: built, currentStep: curProgIdx >= 0 ? curProgIdx + 1 : prog.length };
  }, [stages, completed, currentStage, currentIndex]);

  const ctaLabel = currentStage
    ? currentStage.ctaLabel ?? DEFAULT_STAGE_CTA[currentStage.key] ?? (isLast ? "Finish lesson" : "Continue")
    : "Continue";

  return {
    stages, currentStage, currentIndex, isFirst, isLast,
    completedKeys: useMemo(() => [...completed], [completed]),
    isCompleted, steps, currentStep, ctaLabel, goNext, goBack, goTo, error,
  };
}
