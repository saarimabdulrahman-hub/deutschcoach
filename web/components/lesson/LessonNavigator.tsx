"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LessonShell } from "./LessonShell";
import { ExitConfirmSheet } from "./ExitConfirmSheet";
import { useLessonNavigation, type LessonNavApi } from "./useLessonNavigation";
import type { LessonStageDef } from "./lessonStages";
import type { LessonAction, LessonError } from "./types";

// Lesson navigation & progression (Sprint 6.2D). Owns a SINGLE, persistent
// LessonShell and swaps only the stage content (via `renderStage`) so the frame
// never remounts. It computes the auto-updating CTA, wires Back, guards browser/
// mobile back, and drives the accessible exit flow. Content-agnostic, no backend.

export type { LessonNavApi };

interface LessonNavigatorProps {
  lessonTitle: string;
  stages: LessonStageDef[];
  initialStageKey?: string;      // resume
  initialCompleted?: string[];   // resume
  renderStage: (stage: LessonStageDef, nav: LessonNavApi) => React.ReactNode;

  onExit: (reason: "save" | "discard") => void; // leave the lesson (consumer routes away)
  onFinish?: () => void;         // last stage completed
  onStageChange?: (key: string, index: number) => void;
  onComplete?: (key: string) => void;

  // A stage that needs a custom CTA (e.g. "Check answer" before "Continue") passes this.
  primaryAction?: Partial<LessonAction> | null;

  loading?: boolean;
  error?: LessonError | null;
  allowDiscard?: boolean;        // show "Discard progress" in the exit sheet
  useHistory?: boolean;          // integrate browser/gesture back (default true)
}

export function LessonNavigator({
  lessonTitle, stages, initialStageKey, initialCompleted, renderStage,
  onExit, onFinish, onStageChange, onComplete, primaryAction,
  loading, error, allowDiscard, useHistory = true,
}: LessonNavigatorProps) {
  const nav = useLessonNavigation({ stages, initialStageKey, initialCompleted, onStageChange, onComplete, onFinish });
  const [exitOpen, setExitOpen] = useState(false);
  const requestExit = useCallback(() => setExitOpen(true), []);

  // Browser back / mobile back-gesture guard. Keeps the learner in the lesson:
  // back goes to the previous stage; back on the first stage asks to exit.
  // A future routed lesson replaces this with real per-stage routes.
  const navRef = useRef(nav); navRef.current = nav;
  const exitRef = useRef(requestExit); exitRef.current = requestExit;
  useEffect(() => {
    if (!useHistory || typeof window === "undefined") return;
    window.history.pushState({ lessonNav: true }, "");
    const onPop = () => {
      window.history.pushState({ lessonNav: true }, ""); // stay on the lesson
      const n = navRef.current;
      if (n.isFirst) exitRef.current();
      else n.goBack();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [useHistory]);

  const shellError = error ?? (nav.error ? { message: nav.error } : null);

  const resolvedPrimary = {
    label: primaryAction?.label ?? nav.ctaLabel,
    onClick: primaryAction?.onClick ?? nav.goNext,
    disabled: primaryAction?.disabled || loading || !!shellError,
    loading: primaryAction?.loading,
  };

  return (
    <>
      <LessonShell
        title={lessonTitle}
        steps={nav.steps}
        currentStep={nav.currentStep}
        onBack={nav.isFirst ? undefined : nav.goBack}
        onExit={requestExit}
        confirmExit={false}     // the navigator owns the richer exit sheet
        loading={loading}
        error={shellError}
        primaryAction={resolvedPrimary}
        announce={nav.currentStage ? `${nav.currentStage.label}. Step ${nav.currentStep} of ${nav.steps.length}.` : undefined}
      >
        {nav.currentStage ? renderStage(nav.currentStage, nav) : null}
      </LessonShell>

      <ExitConfirmSheet
        open={exitOpen}
        onKeep={() => setExitOpen(false)}
        onSaveExit={() => { setExitOpen(false); onExit("save"); }}
        onDiscard={allowDiscard ? () => { setExitOpen(false); onExit("discard"); } : undefined}
      />
    </>
  );
}
