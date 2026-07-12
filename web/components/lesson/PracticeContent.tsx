"use client";

import { useInteractionController } from "@/components/interaction/useInteractionController";
import { QuestionCard, FeedbackPanel, HintBox, PageNav } from "@/components/interaction/InteractionPrimitives";
import type { InteractionItem } from "@/components/interaction/types";

// Guided Practice + Interactive Exercise — thin wrapper over the interaction
// engine (Sprint 8.2). No bespoke index/reveal state.

export interface LessonExercise { type: string; question: string; answer: string; }

const LABEL: Record<string, string> = {
  "fill-blank": "Fill in the blank",
  "multiple-choice": "Choose the answer",
  "translate": "Translate",
};

function exToItem(ex: LessonExercise, i: number): InteractionItem {
  const lt = LABEL[ex.type] ?? ex.type ?? "Exercise";
  return {
    id: i,
    front: ex.question || "",
    back: ex.answer || "",
    meta: lt,
    hint: ex.type === "fill-blank" ? "Fill the gap with the correct word." : ex.type === "translate" ? "Type in German." : undefined,
    options: ex.type === "multiple-choice" ? [ex.answer] : undefined, // real distractors would come from API
  };
}

interface Props { exercises: LessonExercise[]; }

export function PracticeContent({ exercises }: Props) {
  const items: InteractionItem[] = exercises.length ? exercises.map(exToItem) : [{ id: "empty", front: "No exercises", back: "for this lesson" }];
  const ctrl = useInteractionController({ mode: "reveal-answer", items });

  if (!exercises.length) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No exercises for this lesson.</p>;
  }

  const current = ctrl.current;
  const typeLabel = LABEL[current.meta ?? ""] ?? current.meta ?? "Practice";
  const isRevealed = ctrl.phase === "revealed" || ctrl.phase === "completed";

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        {typeLabel} · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        {current.front && (
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>{current.front}</p>
        )}
        {!isRevealed && (
          <button onClick={ctrl.reveal}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
            Reveal Answer
          </button>
        )}
        <HintBox hint={ctrl.phase === "hint" ? current.hint : undefined} onRequest={ctrl.phase !== "hint" ? ctrl.requestHint : undefined} />
      </QuestionCard>
      {isRevealed && (
        <FeedbackPanel correct message={current.back ?? ""} onRetry={ctrl.retry} onContinue={ctrl.goNext} />
      )}
      <PageNav current={ctrl.index} total={ctrl.total}
        onPrev={ctrl.goPrev} onNext={ctrl.goNext}
        canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
