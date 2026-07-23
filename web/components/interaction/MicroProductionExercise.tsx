"use client";

import { useRef, useState } from "react";
import { useInteractionController } from "./useInteractionController";
import { QuestionCard, FeedbackPanel, HintBox, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Micro-production (EXERCISE_PATTERN_LIBRARY type 6). Short free text,
// character counter, local validation only (check against back as a model answer,
// not a strict match — this is production practice, not an exact-match test).

const MAX_LENGTH = 120;

interface Props { items: InteractionItem[]; }

export function MicroProductionExercise({ items }: Props) {
  const ctrl = useInteractionController({ mode: "reveal-answer", items });
  const current = ctrl.current;
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const phase = ctrl.phase;

  const reveal = () => { setRevealed(true); ctrl.reveal(); };
  const retry = () => { setRevealed(false); setValue(""); ctrl.retry(); inputRef.current?.focus(); };
  const goNext = () => { setRevealed(false); setValue(""); ctrl.goNext(); };

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Practice writing · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        {current.front && (
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>{current.front}</p>
        )}
        <input ref={inputRef} type="text" value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={revealed}
          maxLength={MAX_LENGTH}
          placeholder="Type your answer…"
          aria-label="Your sentence in German"
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--color-page-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", outline: "none" }}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{value.length}/{MAX_LENGTH}</span>
        </div>
        <HintBox hint={phase === "hint" ? (current.hint ?? undefined) : undefined} onRequest={!revealed && phase !== "hint" ? ctrl.requestHint : undefined} />
        <div className="flex items-center gap-2 mt-3">
          {!revealed ? (
            <button onClick={reveal} disabled={!value.trim()} type="button"
              className="min-h-[44px] px-5 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
              Show model answer
            </button>
          ) : null}
        </div>
      </QuestionCard>
      {revealed && current.back && (
        <FeedbackPanel correct message={`Model answer: ${current.back}`} onRetry={retry} onContinue={goNext} />
      )}
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext} canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
