"use client";

import { useMemo, useState } from "react";
import { useInteractionController } from "./useInteractionController";
import { QuestionCard, FeedbackPanel, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Matching (EXERCISE_PATTERN_LIBRARY type 2). Tap left → tap right to pair.
// Undo selection by re-tapping the left side. Mobile-friendly (no drag required).

interface Props {
  pairs: { id: string | number; left: string; right: string }[];
  /** Full set — each pair becomes one "item" in the controller. */
}

export function MatchingExercise({ pairs }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const items: InteractionItem[] = useMemo(() => pairs.map((p, i) => ({
    id: p.id, front: p.left, back: p.right,
    hint: matched[i] != null ? `Paired` : undefined,
  })), [pairs, matched]);

  const ctrl = useInteractionController({ mode: "flashcard", items });
  const [shuffledRight] = useState(() => [...pairs.map((p) => p.right)].sort(() => Math.random() - 0.5));

  const onLeftTap = (i: number) => {
    if (matched[i] != null) return; // already matched
    if (selectedLeft === i) { setSelectedLeft(null); return; }
    setSelectedLeft(i);
  };
  const onRightTap = (j: number) => {
    if (selectedLeft == null) return;
    const correct = pairs[selectedLeft].right === shuffledRight[j];
    if (correct) {
      setMatched((m) => ({ ...m, [selectedLeft!]: j }));
      setSelectedLeft(null);
      if (Object.keys(matched).length + 1 >= pairs.length) ctrl.submit();
    } else {
      setSelectedLeft(null); // let the pair reset
    }
  };

  const allDone = Object.keys(matched).length >= pairs.length;
  if (allDone) {
    return (
      <div className="max-w-sm mx-auto py-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>All matched</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Tap on the left, then the matching right · {Object.keys(matched).length} of {pairs.length} done
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <button key={i} onClick={() => onLeftTap(i)} disabled={matched[i] != null}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors"
              style={{
                background: matched[i] != null ? "rgba(34,197,94,0.12)" : selectedLeft === i ? "var(--color-hover-bg)" : "var(--color-card-bg)",
                color: matched[i] != null ? "#22c55e" : "var(--color-text-secondary)",
                border: matched[i] != null ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-border)",
                cursor: matched[i] != null ? "default" : "pointer",
              }}>
              {matched[i] != null ? "✓ " : ""}{p.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((text, j) => (
            <button key={j} onClick={() => onRightTap(j)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium text-left"
              style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
              {text}
            </button>
          ))}
        </div>
      </div>
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext} canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
