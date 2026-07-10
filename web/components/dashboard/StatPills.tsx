"use client";

import { useRouter } from "next/navigation";

interface StatPillsProps {
  cardsDue: number;
  quizAvg: number;
  streak: number;
  weakestWordCount: number;
}

export function StatPills({ cardsDue, quizAvg, streak, weakestWordCount }: StatPillsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Cards Due — featured CTA when cards are waiting */}
      {cardsDue > 0 ? (
        <button
          onClick={() => router.push("/review")}
          className="col-span-2 lg:col-span-1 flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.25)" }}>
            🃏
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight" style={{ color: "#a5b4fc" }}>{cardsDue}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#818cf8" }}>
              Cards to review
            </p>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.08)" }}>
            🃏
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>0</p>
            <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Cards to review
            </p>
          </div>
        </div>
      )}

      {/* Quiz Score */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "rgba(34,197,94,0.08)" }}>
          ✅
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
            {quizAvg > 0 ? `${quizAvg}%` : "—"}
          </p>
          <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Quiz avg
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: streak > 0 ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.04)" }}>
          🔥
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight" style={{ color: streak > 0 ? "#f59e0b" : "var(--color-text)" }}>
            {streak}
          </p>
          <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Day streak
          </p>
        </div>
      </div>

      {/* Words to Practice — different visual treatment */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "rgba(236,72,153,0.08)" }}>
          🎯
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
            {weakestWordCount}
          </p>
          <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Words to practice
          </p>
        </div>
      </div>
    </div>
  );
}
