"use client";

import { useRouter } from "next/navigation";

interface Props {
  lesson: { id: number; title: string; level: string; unit: number; progress_pct: number } | null;
  levelPct: number;
}

export function ContinueHero({ lesson, levelPct }: Props) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-[2rem] min-h-[280px] sm:min-h-[320px] flex flex-col justify-end"
      style={{
        background: "linear-gradient(160deg, #0f0f23 0%, #1a1040 30%, #1e293b 70%, #0f172a 100%)",
        border: "1px solid rgba(124,58,237,0.15)",
      }}>
      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{ top: -120, left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 60%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: -80, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)" }} />

      {/* Decorative elements */}
      <div className="absolute top-8 right-8 sm:top-10 sm:right-10 opacity-20" style={{ color: "var(--color-text-muted)" }}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 p-6 sm:p-10">
        {/* Level badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider mb-4 sm:mb-6"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "#a78bfa",
          }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
          {lesson ? lesson.level : "A1"} LEVEL
        </div>

        {lesson ? (
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
                Continue Learning
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3" style={{ color: "var(--color-text)" }}>
                {lesson.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <span>Unit {lesson.unit}</span>
                <span className="opacity-30">&middot;</span>
                <span>{lesson.progress_pct}% complete</span>
                <span className="opacity-30">&middot;</span>
                <span>~10 min remaining</span>
              </div>

              {/* Mini progress bar */}
              <div className="mt-5 w-full max-w-sm h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${lesson.progress_pct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa, #f59e0b)" }} />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => router.push(`/curriculum/${lesson.level.toLowerCase()}/${lesson.id}`)}
                className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume
              </button>
              <button
                onClick={() => router.push("/review")}
                className="px-5 py-3.5 rounded-2xl text-sm font-medium transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--color-text-secondary)", border: "1px solid rgba(255,255,255,0.06)" }}>
                🃏 Review
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
              Your First Lesson
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3" style={{ color: "var(--color-text)" }}>
              Start speaking German<br />today
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Structured A1–C1 lessons, smart flashcards, and an AI tutor — everything you need to become fluent.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              <span>🌱 Beginner-friendly</span>
              <span>📚 80+ lessons</span>
              <span>⏱ 10 min/day</span>
              <span>🎯 CEFR aligned</span>
            </div>
            <button
              onClick={() => router.push("/curriculum")}
              className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
              }}>
              <span className="text-lg">🚀</span>
              Start Learning — It's Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
