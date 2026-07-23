"use client";

import { useRef, useState } from "react";
import { useInteractionController } from "./useInteractionController";
import { QuestionCard, FeedbackPanel, HintBox, PageNav } from "./InteractionPrimitives";
import type { InteractionItem } from "./types";

// Fill-in-the-blank (EXERCISE_PATTERN_LIBRARY type 4). Type the answer;
// tolerant matching (case-insensitive, whitespace-trim, umlaut 2-letter accept).
// Reveal/retry/hint supported.

function tolerantMatch(input: string, expected: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase()
    .replace(/ü/g, "ue").replace(/ö/g, "oe").replace(/ä/g, "ae")
    .replace(/ß/g, "ss").replace(/ẞ/g, "ss").replace(/\s+/g, " ");
  return norm(input) === norm(expected);
}

interface Props { items: InteractionItem[]; }

export function FillInExercise({ items }: Props) {
  const ctrl = useInteractionController({ mode: "reveal-answer", items });
  const current = ctrl.current;
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phase = ctrl.phase;

  const check = () => {
    const expected = current.back ?? "";
    if (tolerantMatch(value, expected)) {
      setFeedback({ correct: true, message: `Genau — ${expected}` });
      ctrl.submit();
    } else {
      setFeedback({ correct: false, message: `Almost — it's "${expected}"` });
      ctrl.reveal();
    }
  };

  const retry = () => { setFeedback(null); setValue(""); ctrl.retry(); inputRef.current?.focus(); };
  const resetOnNext = () => { setFeedback(null); setValue(""); ctrl.goNext(); };

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Fill in the blank · {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        {current.front && <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>{current.front}</p>}
        <input ref={inputRef} type="text" value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !feedback) check(); }}
          disabled={!!feedback}
          placeholder="Type your answer…"
          aria-label="Your answer"
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--color-page-bg)", color: "var(--color-text)", border: feedback ? (feedback.correct ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-border)") : "1px solid var(--color-border)", outline: "none" }}
        />
        <HintBox hint={phase === "hint" ? (current.hint ?? undefined) : undefined} onRequest={!feedback && phase !== "hint" ? ctrl.requestHint : undefined} />
        {!feedback && (
          <button onClick={check} disabled={!value.trim()} type="button"
            className="mt-3 min-h-[44px] px-5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
            Check
          </button>
        )}
      </QuestionCard>
      {feedback && (
        <FeedbackPanel correct={feedback.correct} message={feedback.message} onRetry={!feedback.correct ? retry : undefined} onContinue={resetOnNext} />
      )}
      <PageNav current={ctrl.index} total={ctrl.total} onPrev={ctrl.goPrev} onNext={ctrl.goNext} canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
