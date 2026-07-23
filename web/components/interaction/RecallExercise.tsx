"use client";

import { useInteractionController } from "./useInteractionController";
import { QuestionCard, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Recall / Flashcard self-check (EXERCISE_PATTERN_LIBRARY type 5 extension).
// Flashcard mode with a self-assessment step ("Did you get it right?").

interface Props { items: InteractionItem[]; }

export function RecallExercise({ items }: Props) {
  const ctrl = useInteractionController({ mode: "flashcard", items });
  const phase = ctrl.phase;
  const isFlipped = phase === "revealed" || phase === "completed";

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Recall · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        <div className="text-center min-h-[140px] flex flex-col justify-center cursor-pointer"
          role="button" tabIndex={0}
          aria-label={`${ctrl.current.front}. Tap to reveal.`}
          onClick={isFlipped ? undefined : ctrl.reveal}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isFlipped) { e.preventDefault(); ctrl.reveal(); } }}>
          {!isFlipped ? (
            <>
              <p className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--color-text)" }}>{ctrl.current.front}</p>
              <p className="text-[11px] mt-3 opacity-60" style={{ color: "var(--color-text-muted)" }}>Think of the answer, then tap</p>
            </>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-medium" style={{ color: "var(--color-text)" }}>{ctrl.current.back}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button onClick={ctrl.retry} className="min-h-[44px] px-4 text-xs font-semibold rounded-xl"
                  style={{ color: "var(--color-accent-light)", background: "var(--color-hover-bg)" }}>Flip back</button>
                <button onClick={ctrl.submit} className="min-h-[44px] px-4 rounded-xl text-xs font-semibold"
                  style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>I got it</button>
              </div>
            </>
          )}
        </div>
      </QuestionCard>
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext}
        canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
