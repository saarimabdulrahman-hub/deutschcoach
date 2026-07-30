"use client";

import { useState } from "react";
import { useEmma } from "@/components/emma/EmmaContext";

// Checkpoint stage — 2–3 questions assessing recently covered material.
// Purpose: Verify understanding, provide immediate feedback with explanations.
// Interaction: Multiple choice, immediate feedback.

export interface CheckpointQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CheckpointStageProps {
  title: string;
  questions: CheckpointQuestion[];
  onComplete: (correct: number, total: number) => void;
}

export function CheckpointStage({ title, questions, onComplete }: CheckpointStageProps) {
  const emma = useEmma();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedIdx, setSubmittedIdx] = useState<Set<number>>(new Set());

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submittedIdx.has(qIdx)) return; // lock in once answered
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setSubmittedIdx((prev) => new Set(prev).add(qIdx));
  };

  const allAnswered = questions.every((_, i) => submittedIdx.has(i));
  const correctCount = questions.filter(
    (q, i) => answers[i] === q.correctIndex
  ).length;

  if (!questions.length) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No checkpoint questions available.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {title}
      </p>
      <div
        className="rounded-xl p-4 space-y-5"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
      >
        {questions.map((q, qi) => {
          const isAnswered = submittedIdx.has(qi);
          const selected = answers[qi];
          const isCorrect = isAnswered && selected === q.correctIndex;
          const isWrong = isAnswered && !isCorrect;

          return (
            <div key={qi}>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isRight = isAnswered && oi === q.correctIndex;
                  const isWrong = isAnswered && isSelected && oi !== q.correctIndex;

                  let bg = "transparent";
                  let border = "rgba(168,85,247,0.12)";
                  if (isRight) { bg = "rgba(34,197,94,0.08)"; border = "rgba(34,197,94,0.25)"; }
                  if (isWrong) { bg = "rgba(255,71,87,0.08)"; border = "rgba(255,71,87,0.25)"; }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border cursor-pointer"
                      style={{
                        background: bg || (isSelected ? "rgba(168,85,247,0.08)" : "transparent"),
                        border: `1px solid ${border}`,
                        color: isRight ? "#4ADE80" : isWrong ? "#FF6B77" : "var(--color-text-secondary)",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {isRight && <span>✅</span>}
                        {isWrong && <span>❌</span>}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation shown immediately after answering */}
              {isAnswered && (
                <div
                  className="mt-2 p-2.5 rounded-lg text-xs leading-relaxed"
                  style={{
                    background: isCorrect ? "rgba(34,197,94,0.04)" : "rgba(168,85,247,0.04)",
                    border: `1px solid ${isCorrect ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.12)"}`,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {isCorrect ? "✅ " : ""}{q.explanation}
                </div>
              )}
              {/* Emma hint after incorrect answer (Section 9.3) */}
              {isAnswered && isWrong && (
                <button
                  onClick={() => {
                    emma.setOpen(true);
                    emma.send(`I need help with: "${q.question}". I chose "${selected !== undefined ? q.options[selected] : ""}" but it was wrong. Can you explain?`);
                  }}
                  className="mt-1.5 text-xs font-medium hover:underline border-none cursor-pointer"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  Need a hint? → Emma&apos;s hint
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue button — shown when all questions answered */}
      {allAnswered && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
            {correctCount} of {questions.length} correct
          </p>
          <button
            onClick={() => onComplete(correctCount, questions.length)}
            className="px-6 py-3 rounded-xl text-sm font-semibold border-none cursor-pointer"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
