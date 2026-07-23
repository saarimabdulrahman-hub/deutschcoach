"use client";

import { LessonShell } from "./LessonShell";
import type { LessonStep, LessonError } from "./types";
import { DialogueContent, type DialogueContentProps } from "./DialogueContent";
import type { DialogueLine } from "./DialogueCard";

// The Dialogue stage (Sprint 6.2B; refactored 6.2E). A thin wrapper that renders
// DialogueContent inside a LessonShell — kept for standalone use. When used with
// LessonNavigator (which owns the shell), render <DialogueContent> directly.
// Output is unchanged from the original.

export type { DialogueLine };

interface DialogueStageProps extends DialogueContentProps {
  // Shell configuration (forwarded — no layout logic duplicated)
  lessonTitle: string;
  steps: LessonStep[];
  currentStep: number;
  onBack?: () => void;
  onExit?: () => void;
  confirmExit?: boolean;
  onContinue: () => void;
  continueLabel?: string;
  error?: LessonError | null;
}

export function DialogueStage({
  lessonTitle, steps, currentStep, onBack, onExit, confirmExit, onContinue, continueLabel = "Continue",
  loading, error, ...content
}: DialogueStageProps) {
  return (
    <LessonShell
      title={lessonTitle}
      steps={steps}
      currentStep={currentStep}
      onBack={onBack}
      onExit={onExit}
      confirmExit={confirmExit}
      error={error}
      primaryAction={{ label: continueLabel, onClick: onContinue, disabled: loading || !!error }}
    >
      <DialogueContent loading={loading} {...content} />
    </LessonShell>
  );
}
