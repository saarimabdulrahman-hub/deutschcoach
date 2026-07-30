/**
 * ComprehensionCheck — multiple-choice quiz after a dialogue section.
 *
 * Renders 2-3 questions about the dialogue content to verify understanding.
 * Learner selects an answer and gets immediate correct/incorrect feedback.
 * All questions are in English so the learner's German comprehension
 * is tested without requiring English production.
 */

"use client";

import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface ComprehensionCheckProps {
  questions: Question[];
}

export function ComprehensionCheck({ questions }: ComprehensionCheckProps) {
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

  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
        style={{ color: "var(--color-active-text)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Comprehension Check
      </p>

      <div className="space-y-3">
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
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 border cursor-pointer disabled:cursor-default"
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
          className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
        >
          Check Answers
        </button>
      )}

      {submitted && (
        <p className="mt-3 text-sm font-medium" style={{ color: correctCount === questions.length ? "#4ADE80" : "var(--color-text-secondary)" }}>
          {correctCount} of {questions.length} correct
          {correctCount === questions.length ? " 🎉" : ""}
        </p>
      )}
    </div>
  );
}
