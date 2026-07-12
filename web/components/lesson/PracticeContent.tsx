"use client";

import { useState } from "react";

// Guided Practice + Interactive Exercise (LESSON_WIREFRAMES Screens 6–7).
// Real exercises from the API. Each has a reveal-answer flow with supportive
// feedback — no scoring, never blocks.

export interface LessonExercise { type: string; question: string; answer: string; }

interface Props { exercises: LessonExercise[]; }

const LABEL: Record<string, string> = {
  "fill-blank": "Fill in the blank",
  "multiple-choice": "Choose the answer",
  "translate": "Translate",
};

export function PracticeContent({ exercises }: Props) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const max = exercises.length;
  if (!max) return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No exercises for this lesson.</p>;

  const ex = exercises[idx];
  const typeLabel = LABEL[ex.type] ?? ex.type ?? "Exercise";

  const advance = () => { setRevealed(false); setAnswered(false); setIdx((i) => Math.min(i + 1, max - 1)); };
  const prev = () => { setRevealed(false); setAnswered(false); setIdx((i) => Math.max(i - 1, 0)); };

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        {typeLabel} · {idx + 1} of {max}
      </p>
      <div className="mt-3 rounded-2xl p-5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        {ex.question && (
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>{ex.question}</p>
        )}
        {ex.type === "fill-blank" && !revealed && (
          <div className="mb-3 p-3 rounded-xl" style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {ex.answer.replace(/[a-zA-ZäöüßÄÖÜẞ]+/g, "___") || "___"}
          </div>
        )}
        <div className="flex items-center gap-2">
          {!revealed ? (
            <button onClick={() => { setRevealed(true); setAnswered(true); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
              Reveal Answer
            </button>
          ) : (
            <div className="w-full p-3 rounded-xl" style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-active-bg)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Answer</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{ex.answer}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <button onClick={prev} disabled={idx === 0} aria-label="Previous exercise" className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg disabled:opacity-30" style={{ color: "var(--color-text-muted)" }}>‹</button>
        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{idx + 1} of {max}</span>
        {idx < max - 1 ? (
          <button onClick={advance} aria-label="Next exercise" className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg" style={{ color: "var(--color-text-muted)" }}>›</button>
        ) : answered ? (
          <button onClick={advance} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>All done</button>
        ) : <span aria-hidden className="w-11" />}
      </div>
    </div>
  );
}
