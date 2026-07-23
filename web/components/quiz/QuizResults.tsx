"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizResultOut } from "@/types";

interface QuizResultsProps {
  results: QuizResultOut;
  onRetry: () => void;
}

function ScoreCircle({ pct }: { pct: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color = pct >= 80 ? "var(--color-success)" : pct >= 50 ? "var(--color-warning)" : "var(--color-error-text)";
  const bgColor =
    pct >= 80
      ? "rgba(34,197,94,0.08)"
      : pct >= 50
        ? "rgba(245,158,11,0.08)"
        : "var(--color-error-bg)";

  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Background glow */}
      <div
        className="absolute inset-4 rounded-full blur-xl opacity-20"
        style={{ background: color }}
      />
      <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 130 130">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
        />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>{Math.round(pct)}%</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Score</div>
        </div>
      </div>
    </div>
  );
}

export function QuizResults({ results, onRetry }: QuizResultsProps) {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const wrongCount = results.questions_total - results.questions_correct;
  const wrongItems = results.results.filter((r) => !r.correct);
  const correctItems = results.results.filter((r) => r.correct);

  function toggleExpand(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const emoji =
    results.score_pct >= 90
      ? "&#127942;"
      : results.score_pct >= 70
        ? "&#127881;"
        : results.score_pct >= 50
          ? "&#128170;"
          : "&#128170;";

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-4" dangerouslySetInnerHTML={{ __html: emoji }} />
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Quiz Complete!</h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {results.questions_correct} of {results.questions_total} correct
          {wrongCount > 0 && (
            <span style={{ color: "var(--color-error-text)" }}> ({wrongCount} missed)</span>
          )}
        </p>
      </div>

      {/* Score donut */}
      <ScoreCircle pct={results.score_pct} />

      {/* Per-question breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>Review Answers</h3>

        {/* Wrong answers first */}
        {wrongItems.map((item) => (
          <div
            key={item.question_id}
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--color-error-bg)",
              border: "1px solid var(--color-error-border)",
            }}
          >
            <button
              onClick={() => toggleExpand(item.question_id)}
              className="w-full flex items-center justify-between p-4 text-left text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg" style={{ color: "var(--color-error-text)" }}>&#10007;</span>
                <span style={{ color: "var(--color-text-secondary)" }}>Your answer: {item.your_answer || "(no answer)"}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${expandedItems.has(item.question_id) ? "rotate-180" : ""}`} style={{ color: "var(--color-text-muted)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedItems.has(item.question_id) && (
              <div className="px-4 pb-4 space-y-1" style={{ borderTop: "1px solid var(--color-error-bg)" }}>
                <p className="text-sm pt-3" style={{ color: "var(--color-success)" }}>
                  Correct: {item.correct_answer}
                </p>
                {item.feedback && (
                  <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>{item.feedback}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Correct answers (collapsed) */}
        {correctItems.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm hover:text-slate-300 transition-colors py-2 select-none" style={{ color: "var(--color-text-muted)" }}>
              Show {correctItems.length} correct answer{correctItems.length !== 1 ? "s" : ""}
            </summary>
            <div className="space-y-2 mt-2">
              {correctItems.map((item) => (
                <div
                  key={item.question_id}
                  className="rounded-xl p-3 text-sm"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: "var(--color-success)" }}>&#10003;</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>{item.your_answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {wrongCount > 0 && (
          <button
            onClick={() => router.push("/review")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "var(--color-warning)",
              boxShadow: "0 4px 14px rgba(245,158,11,0.25)",
              color: "var(--color-text)",
            }}
          >
            Review Missed
          </button>
        )}
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "var(--color-accent-gradient)",
            boxShadow: "0 4px 14px var(--color-accent-glow)",
            color: "var(--color-text)",
          }}
        >
          Another Quiz
        </button>
      </div>
    </div>
  );
}
