"use client";

import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  lesson: { id: number; title: string; level: string; unit: number; progress_pct: number } | null;
  levelPct: number;
}

function estimatedMinutes(progressPct: number): number {
  // Rough estimate: a lesson takes ~12 min. Already-completed portion scales down.
  return Math.max(2, Math.round(12 * (1 - progressPct / 100)));
}

// ── State: New Learner ──────────────────────────────────────────────
function NewLearnerHero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10"
      style={{
        background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 30%, #7c3aed 60%, #8b5cf6 100%)",
        color: "#fff",
      }}>
      {/* Radial glow */}
      <div className="absolute pointer-events-none"
        style={{ top: "-30%", right: "-10%", width: "60%", height: "150%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: "-20%", left: "5%", width: "40%", height: "60%",
          background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)" }} />

      {/* Brandenburg Gate silhouette — right side */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)",
        }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right" style={{ fontSize: "120px", lineHeight: "1", opacity: 0.5, filter: "blur(0.5px)" }}>
          🏛️
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-3">Welcome to DeutschFlow</p>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="flex-1 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">Your German learning journey starts here</h2>
            <p className="text-sm sm:text-base opacity-80 leading-relaxed">
              Structured lessons, smart flashcards, and an AI tutor — everything you need to go from zero to fluent.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-5 text-xs sm:text-sm opacity-70">
              <span>🌱 Beginner-friendly</span>
              <span className="opacity-30">|</span>
              <span>⏱ 10 min lessons</span>
              <span className="opacity-30">|</span>
              <span>📚 80+ lessons</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 flex-shrink-0">
            <p className="text-xs font-medium opacity-60">Ready to begin?</p>
            <button
              onClick={onStart}
              className="px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-105 flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
              }}>
              <span className="text-lg">🚀</span>
              Start Your First Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── State: Returning Learner (mid-progress) ─────────────────────────
function MidProgressHero({ lesson, onResume }: {
  lesson: NonNullable<Props["lesson"]>;
  onResume: () => void;
}) {
  const mins = estimatedMinutes(lesson.progress_pct);

  return (
    <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 surface-primary"
      style={{ border: "1px solid var(--color-border)" }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider glossy-accent"
            style={{ color: "#fff" }}>{lesson.level}</span>
          <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Unit {lesson.unit}</span>
        </div>
        <p className="text-base sm:text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-4">
          <ProgressBar value={lesson.progress_pct} height="h-1.5" className="max-w-[200px]" />
          <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
            {lesson.progress_pct}% done &middot; ~{mins} min left
          </span>
        </div>
      </div>
      <button
        onClick={onResume}
        className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 flex-shrink-0 glossy-accent"
        style={{ color: "#fff" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Resume Lesson
      </button>
    </div>
  );
}

// ── State: Nearly Complete (≥90%) ───────────────────────────────────
function NearlyCompleteHero({ lesson, onResume }: {
  lesson: NonNullable<Props["lesson"]>;
  onResume: () => void;
}) {
  const mins = estimatedMinutes(lesson.progress_pct);

  return (
    <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(124,58,237,0.02))",
        border: "1px solid rgba(124,58,237,0.15)",
      }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>{lesson.level}</span>
          <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Unit {lesson.unit}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(124,58,237,0.1)", color: "var(--color-brand-purple)" }}>
            Almost done!
          </span>
        </div>
        <p className="text-base sm:text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-4">
          <ProgressBar value={lesson.progress_pct} height="h-1.5" className="max-w-[200px]" />
          <span className="text-xs flex-shrink-0" style={{ color: "var(--color-brand-purple)" }}>
            {lesson.progress_pct}% done &middot; just ~{mins} min left
          </span>
        </div>
      </div>
      <button
        onClick={onResume}
        className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 flex-shrink-0 glossy-accent"
        style={{ color: "#fff" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Finish Lesson
      </button>
    </div>
  );
}

// ── State: Level Complete ───────────────────────────────────────────
function LevelCompleteHero({ levelPct, onNext }: { levelPct: number; onNext: () => void }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      style={{
        background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))",
        border: "1px solid rgba(34,197,94,0.15)",
      }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎉</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.15)", color: "var(--color-success)" }}>
            Level Complete
          </span>
        </div>
        <p className="text-base sm:text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>
          Congratulations! You've finished this level.
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          You're making excellent progress. Ready for the next challenge?
        </p>
      </div>
      <button
        onClick={onNext}
        className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 flex-shrink-0 glossy-accent"
        style={{ color: "#fff" }}>
        Continue to Next Level
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── State: Returning After Break ────────────────────────────────────
function ReturningAfterBreakHero({ levelPct, onResume }: { levelPct: number; onResume: () => void }) {
  return (
    <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
          Welcome back
        </p>
        <p className="text-base sm:text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>
          Continue your learning journey
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          You're {levelPct}% through your current level. Pick up where you left off.
        </p>
      </div>
      <button
        onClick={onResume}
        className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 flex-shrink-0 glossy-accent"
        style={{ color: "#fff" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Browse Lessons
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function ContinueCard({ lesson, levelPct }: Props) {
  const router = useRouter();

  // Determine state
  const hasLesson = !!lesson;
  const isNearlyComplete = hasLesson && lesson!.progress_pct >= 90;
  const isLevelComplete = !hasLesson && levelPct >= 100;
  const isNewLearner = !hasLesson && levelPct === 0;
  const isReturningAfterBreak = !hasLesson && levelPct > 0 && levelPct < 100;

  if (isNewLearner) {
    return <NewLearnerHero onStart={() => router.push("/curriculum")} />;
  }

  if (isLevelComplete) {
    return <LevelCompleteHero levelPct={levelPct} onNext={() => router.push("/curriculum")} />;
  }

  if (isNearlyComplete) {
    return (
      <NearlyCompleteHero
        lesson={lesson!}
        onResume={() => router.push(`/curriculum/${lesson!.level.toLowerCase()}/${lesson!.id}`)}
      />
    );
  }

  if (hasLesson) {
    return (
      <MidProgressHero
        lesson={lesson!}
        onResume={() => router.push(`/curriculum/${lesson!.level.toLowerCase()}/${lesson!.id}`)}
      />
    );
  }

  // Returning after break
  return <ReturningAfterBreakHero levelPct={levelPct} onResume={() => router.push("/curriculum")} />;
}
