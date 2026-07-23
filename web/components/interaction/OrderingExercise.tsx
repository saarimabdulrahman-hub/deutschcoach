"use client";

import { useState, useCallback } from "react";
import { useInteractionController } from "./useInteractionController";
import { QuestionCard, FeedbackPanel, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Ordering (EXERCISE_PATTERN_LIBRARY type 3 — Build-the-sentence).
// Tap chips in the correct order. Reset resets the placement. Keyboard: Tab to
// chips, Enter to select.

interface Props { items: InteractionItem[]; /** each item has `front` as one word/chip */ }

export function OrderingExercise({ items }: Props) {
  const ctrl = useInteractionController({ mode: "flashcard", items });
  const current = ctrl.current;

  // Desired order = the words of `current.back` (the correct sentence)
  const correctTokens = (current.back ?? "").split(/\s+/).filter(Boolean);
  // Chips = shuffled tokens
  const [chips] = useState(() => [...correctTokens].sort(() => Math.random() - 0.5));

  const [placed, setPlaced] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([...chips]);

  const selectChip = useCallback((token: string) => {
    setRemaining((r) => r.filter((t) => t !== token));
    setPlaced((p) => [...p, token]);
  }, []);
  const undoPlace = useCallback((token: string) => {
    setPlaced((p) => p.filter((t) => t !== token));
    setRemaining((r) => [...r, token]);
  }, []);
  const reset = useCallback(() => {
    setPlaced([]); setRemaining([...chips]);
  }, [chips]);

  const placedCorrect = placed.join(" ") === correctTokens.join(" ");

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Put in order · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        <p className="text-base leading-relaxed mb-3" style={{ color: "var(--color-text)" }}>{current.front}</p>
        {/* Placed tokens (constructed sentence) */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[44px] p-2 rounded-xl" style={{ background: "var(--color-page-bg)", border: placedCorrect ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-border)" }}>
          {placed.map((t, i) => (
            <button key={t + i} onClick={() => undoPlace(t)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: placedCorrect ? "rgba(34,197,94,0.12)" : "var(--color-hover-bg)", color: placedCorrect ? "#22c55e" : "var(--color-text)", border: "1px solid var(--color-border)" }}>
              {t}
            </button>
          ))}
          {placed.length === 0 && <span className="text-xs self-center" style={{ color: "var(--color-text-muted)" }}>Tap chips below to build the sentence…</span>}
        </div>
        {/* Remaining chips */}
        <div className="flex flex-wrap gap-2">
          {remaining.map((t, i) => (
            <button key={t + i} onClick={() => selectChip(t)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={reset} className="mt-2 min-h-[44px] px-3 text-xs font-medium hover:underline" style={{ color: "var(--color-text-muted)" }}>Reset</button>
      </QuestionCard>
      {placedCorrect && (
        <FeedbackPanel correct message={`${correctTokens.join(" ")}`} onContinue={ctrl.goNext} />
      )}
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext} canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
