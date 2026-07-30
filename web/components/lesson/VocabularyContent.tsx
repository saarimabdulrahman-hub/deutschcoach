"use client";

import type { VocabEntry } from "@/types";
import { useInteractionController } from "@/components/interaction/useInteractionController";
import { QuestionCard, ProgressDots, PageNav } from "@/components/interaction/InteractionPrimitives";
import type { InteractionItem } from "@/components/interaction/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// Vocabulary stage — thin wrapper over the interaction engine (Sprint 8.2).
// No longer maintains its own index/flip/prev/next state.

const DISPLAY_POS: Record<string, string> = { noun: "der/die/das · noun", verb: "verb", adjective: "adj.", greeting: "greeting", phrase: "phrase" };

function vocabToItems(vocab: VocabEntry[]): InteractionItem[] {
  return vocab.map((v) => ({
    id: v.id,
    front: v.german ?? "",
    back: v.english ?? "",
    meta: DISPLAY_POS[v.part_of_speech ?? ""] ?? v.part_of_speech ?? "",
    hint: v.gender ? `Gender: ${v.gender}` : undefined,
  }));
}

interface Props {
  vocabulary: VocabEntry[];
  /** Weak words to highlight (Section 10.1 adaptive injection). */
  weakWords?: string[];
}

export function VocabularyContent({ vocabulary, weakWords }: Props) {
  const { speak, speaking } = useWordSpeech();
  const items = vocabulary.length ? vocabToItems(vocabulary) : [{ id: "empty", front: "No vocabulary", back: "for this lesson" }];
  const ctrl = useInteractionController({ mode: "flashcard", items });

  if (!vocabulary.length) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No vocabulary for this lesson.</p>;
  }

  const front = ctrl.current.front;
  const back = ctrl.current.back ?? "";
  const meta = ctrl.current.meta ?? "";
  const isFlipped = ctrl.phase === "revealed";
  const isWeak = weakWords?.some((w) => w.toLowerCase() === front.toLowerCase());

  return (
    <div className="max-w-lg mx-auto py-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Tap to flip · {ctrl.index + 1} of {ctrl.total}
        </p>
        <div className="flex items-center gap-2">
          {isWeak && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,71,87,0.12)", color: "#FF6B77" }}>
              Review
            </span>
          )}
          <button
            onClick={() => !speaking && speak(ctrl.current.front, "de-DE")}
            disabled={speaking}
            className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer disabled:opacity-40"
            style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
            aria-label={`Listen to ${ctrl.current.front}`}
            title="Listen"
          >
            <SpeakIcon size={16} />
          </button>
          <ProgressDots total={ctrl.total} current={ctrl.index} completed={ctrl.completedCount} />
        </div>
      </div>

      <QuestionCard>
        <div className="text-center min-h-[160px] flex flex-col justify-center cursor-pointer"
          role="button" tabIndex={0} aria-label={`${front}. Tap to flip.`}
          onClick={isFlipped ? undefined : ctrl.reveal}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isFlipped) { e.preventDefault(); ctrl.reveal(); } }}>
          {/* FRONT */}
          {!isFlipped ? (
            <>
              <p className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--color-text)" }}>{front}</p>
              {meta && <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>{meta}</p>}
              <p className="text-[11px] mt-3 opacity-60" style={{ color: "var(--color-text-muted)" }}>Tap to flip</p>
            </>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-medium" style={{ color: "var(--color-text)" }}>{back}</p>
              <button onClick={ctrl.retry} className="mt-3 min-h-[44px] px-4 text-xs font-semibold hover:underline"
                style={{ color: "var(--color-accent-light)" }}>Flip back</button>
            </>
          )}
        </div>
      </QuestionCard>

      <PageNav current={ctrl.index} total={ctrl.total}
        onPrev={ctrl.goPrev} onNext={ctrl.goNext}
        canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
