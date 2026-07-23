"use client";

import { useState, useEffect, useCallback } from "react";
import { useInteractionController } from "./useInteractionController";
import { QuestionCard, AnswerOption, FeedbackPanel, HintBox, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Multiple-choice exercise (EXERCISE_PATTERN_LIBRARY type 1 — Recognition).
// Presents a question with 3-4 options; the controller tracks the phase.
// Keyboard-accessible: options are buttons; Tab/Arrow + Enter select.

interface Props { items: InteractionItem[]; }

export function RecognitionExercise({ items }: Props) {
  const ctrl = useInteractionController({ mode: "recognition", items });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const current = ctrl.current;
  const phase = ctrl.phase;
  const isAnswered = phase === "revealed" || phase === "completed";

  // Reset selected answer when navigating to a new item
  useEffect(() => {
    setSelectedAnswer(null);
  }, [ctrl.index]);

  const handleSelect = useCallback((opt: string) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    ctrl.submit();
  }, [isAnswered, ctrl]);

  const handleRetry = useCallback(() => {
    setSelectedAnswer(null);
    ctrl.retry();
  }, [ctrl]);

  if (!items.length) return null;

  const correctAnswer = current.correct;
  const isCorrect = isAnswered && selectedAnswer !== null && selectedAnswer === correctAnswer;

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Choose the answer · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        {current.front && <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>{current.front}</p>}
        <div className="space-y-2">
          {(current.options ?? []).map((opt, i) => {
            const isThisCorrect = !!correctAnswer && opt === correctAnswer;
            const isThisSelected = selectedAnswer === opt;
            const showCorrect = isAnswered && isThisCorrect;
            const showWrong = isAnswered && isThisSelected && !isThisCorrect;
            return (
              <AnswerOption key={i}
                selected={isThisSelected || undefined}
                correct={showCorrect || (showWrong ? false : undefined)}
                onClick={isAnswered ? undefined : () => handleSelect(opt)}
                disabled={isAnswered}>
                {opt}
              </AnswerOption>
            );
          })}
        </div>
        <HintBox hint={phase === "hint" ? (current.hint ?? undefined) : undefined} onRequest={!isAnswered && phase !== "hint" ? ctrl.requestHint : undefined} />
      </QuestionCard>
      {isAnswered && (
        <FeedbackPanel
          correct={isCorrect}
          message={isCorrect
            ? `✓ Correct! ${current.back ?? ""}`
            : `✗ That's not right. The answer is: ${correctAnswer ?? "—"} ${current.back ?? ""}`}
          onRetry={isCorrect ? undefined : handleRetry}
          onContinue={ctrl.goNext}
        />
      )}
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext} canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
