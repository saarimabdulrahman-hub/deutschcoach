"use client";

import { useRouter } from "next/navigation";

interface ContinueLesson {
  id: number;
  title: string;
  level: string;
  unit: number;
  progress_pct: number;
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 62;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="heroRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke="url(#heroRingGradient)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 0 8px rgba(124,58,237,0.3))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
          {pct}%
        </span>
        <span className="text-xs font-medium uppercase tracking-widest mt-1" style={{ color: "var(--color-text-muted)" }}>
          complete
        </span>
      </div>
    </div>
  );
}

export function HeroCard({
  continueLesson,
  levelProgressPct,
  streak,
}: {
  continueLesson: ContinueLesson | null;
  levelProgressPct: number;
  streak: number;
}) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(30,41,59,0.95) 40%, rgba(30,41,59,1) 100%)",
        border: "1px solid var(--color-border)",
      }}>
      {/* Subtle glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -80, right: -80, width: 300, height: 300,
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        {/* Progress ring */}
        <ProgressRing pct={levelProgressPct} />

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          {/* Level badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }} />
            {continueLesson ? continueLesson.level : "A1"} Level
          </div>

          {continueLesson ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                {continueLesson.title}
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Unit {continueLesson.unit} &middot; {continueLesson.progress_pct}% done &middot; ~10 min remaining
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/curriculum/${continueLesson.level.toLowerCase()}/${continueLesson.id}`)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: "var(--color-accent-gradient)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                  }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resume Lesson
                </button>
                <button
                  onClick={() => router.push("/review")}
                  className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  🃏 Review Flashcards
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                Begin Your Journey
              </h2>
              <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Start learning German with structured A1–C1 lessons, smart flashcards, and AI-powered practice.
              </p>
              <div className="flex items-center gap-4 mb-6 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <span>🌱 A1 Beginner</span>
                <span>&middot;</span>
                <span>📚 16 lessons</span>
                <span>&middot;</span>
                <span>⏱ ~10 min each</span>
              </div>
              <button
                onClick={() => router.push("/curriculum")}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
                style={{
                  background: "var(--color-accent-gradient)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                }}>
                <span className="text-lg">🚀</span>
                Start Learning
              </button>
            </>
          )}

          {/* Streak badge — inline */}
          <div className="inline-flex items-center gap-1.5 mt-6 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: streak > 0 ? "rgba(245,158,11,0.15)" : "var(--color-card-bg)",
              color: streak > 0 ? "#f59e0b" : "var(--color-text-muted)",
              border: streak > 0 ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--color-border)",
            }}>
            🔥 {streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""} streak!` : "Start your streak today"}
          </div>
        </div>
      </div>
    </div>
  );
}
