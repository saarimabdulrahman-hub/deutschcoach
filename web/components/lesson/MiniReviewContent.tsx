"use client";

import type { VocabEntry } from "@/types";
import { useInteractionController } from "@/components/interaction/useInteractionController";
import { QuestionCard, PageNav } from "@/components/interaction/InteractionPrimitives";
import type { InteractionItem } from "@/components/interaction/types";

// Mini Review — thin wrapper over the interaction engine (Sprint 8.2).
// No bespoke index/reveal/done state.

function reviewItems(vocab: VocabEntry[]): InteractionItem[] {
  return vocab.map((v) => ({ id: v.id, front: v.german ?? "", back: v.english ?? "" }));
}

interface Props { vocabulary: VocabEntry[]; }

export function MiniReviewContent({ vocabulary }: Props) {
  const items = reviewItems(vocabulary);
  const ctrl = useInteractionController({ mode: "flashcard", items });
  const isRevealed = ctrl.phase === "revealed" || ctrl.phase === "completed";
  const isDone = ctrl.isDone;

  if (isDone) {
    return (
      <div className="max-w-sm mx-auto py-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Quick check complete</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Your {ctrl.total} words are saved and ready for review.
        </p>
      </div>
    );
  }

  if (!vocabulary.length) {
    return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>No words to review.</p>;
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Quick check · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        <div className="text-center min-h-[120px] flex flex-col justify-center cursor-pointer"
          role="button" tabIndex={0} aria-label={`${ctrl.current.front}. Tap to reveal.`}
          onClick={isRevealed ? undefined : ctrl.reveal}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isRevealed) { e.preventDefault(); ctrl.reveal(); } }}>
          <p className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>{ctrl.current.front}</p>
          {!isRevealed ? (
            <p className="text-[11px] mt-3 opacity-60" style={{ color: "var(--color-text-muted)" }}>Tap to reveal</p>
          ) : (
            <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>{ctrl.current.back}</p>
          )}
        </div>
      </QuestionCard>
      <PageNav current={ctrl.index} total={ctrl.total}
        onPrev={ctrl.goPrev} onNext={ctrl.goNext}
        canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext}
        doneLabel={ctrl.isLast && isRevealed ? "Finish" : undefined} />
    </div>
  );
}
