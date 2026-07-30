"use client";

import { useState } from "react";

// Checkpoint stage — quick comprehension check during the lesson.
// Purpose: Verify understanding before moving on.
// Interaction: Multiple choice, Fill.

interface CheckQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface CheckpointContentProps {
  questions: CheckQuestion[];
}

export function CheckpointContent({ questions }: CheckpointContentProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const correctCount = questions.filter(
    (q, i) => answers[i] === q.correctIndex
  ).length;
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

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
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Quick Check
      </p>
      <div
        className="rounded-xl p-4"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
      >
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi}>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrong = submitted && isSelected && oi !== q.correctIndex;

                  let bg = "transparent";
                  let border = "rgba(168,85,247,0.12)";
                  if (isCorrect) { bg = "rgba(34,197,94,0.08)"; border = "rgba(34,197,94,0.25)"; }
                  if (isWrong) { bg = "rgba(255,71,87,0.08)"; border = "rgba(255,71,87,0.25)"; }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all border cursor-pointer disabled:cursor-default"
                      style={{
                        background: bg || (isSelected ? "rgba(168,85,247,0.08)" : "transparent"),
                        border: `1px solid ${border}`,
                        color: isCorrect ? "#4ADE80" : isWrong ? "#FF6B77" : "var(--color-text-secondary)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!submitted && allAnswered && (
          <button
            onClick={() => setSubmitted(true)}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
          >
            Check Answers
          </button>
        )}

        {submitted && (
          <p className="mt-3 text-sm font-medium" style={{ color: correctCount === questions.length ? "#4ADE80" : "var(--color-text-secondary)" }}>
            {correctCount} of {questions.length} correct
          </p>
        )}
      </div>
    </div>
  );
}
