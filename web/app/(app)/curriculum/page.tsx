"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CurriculumLevel, LessonListItem } from "@/types";
import { LevelPath } from "@/components/curriculum/LevelPath";
import { LessonCard } from "@/components/curriculum/LessonCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

function CurriculumSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded shimmer" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 h-16 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<string>("A1");

  const { data: levels, isLoading, error } = useQuery<CurriculumLevel[]>({
    queryKey: ["curriculum"],
    queryFn: () => api.get("/curriculum"),
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<LessonListItem[]>({
    queryKey: ["curriculum", activeLevel],
    queryFn: () => api.get(`/curriculum/${activeLevel}`),
    enabled: !!activeLevel,
  });

  if (isLoading) return <CurriculumSkeleton />;
  if (error)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load curriculum."}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["curriculum"] })}
      />
    );

  const currentLvl = levels?.find((l) => l.level === activeLevel);
  const totalLessons = levels?.reduce((s, l) => s + l.lesson_count, 0) || 0;
  const totalCompleted = levels?.reduce((s, l) => s + l.completed_count, 0) || 0;
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Find first incomplete lesson to highlight as "next"
  const nextLesson = lessons?.find((l) => !l.completed);

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* ── Header ──────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>
              Your Learning Path
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              {totalCompleted > 0 ? `${overallPct}% complete` : "Let's get started"}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
              {totalCompleted > 0
                ? `${totalCompleted} of ${totalLessons} lessons done — keep going!`
                : "Master German step by step, from absolute beginner to advanced fluency"}
            </p>
          </div>
          {totalCompleted > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#a78bfa" }}>
              <span className="text-lg">📚</span>
              {totalCompleted}/{totalLessons} lessons
            </div>
          )}
        </div>

        {/* ── Level Path Milestones ──────────────── */}
        {levels && levels.length > 0 && (
          <div className="rounded-2xl p-4 sm:p-6"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <LevelPath
              levels={levels}
              currentLevel={activeLevel}
              onSelect={setActiveLevel}
            />
          </div>
        )}
      </div>

      {/* ── Current Level Lessons ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {activeLevel} Lessons
            </h2>
            {currentLvl && (
              <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                {currentLvl.completed_count} of {currentLvl.lesson_count} completed
              </p>
            )}
          </div>

          {/* Level selector pills */}
          {levels && levels.length > 0 && (
            <div className="hidden sm:flex gap-1.5">
              {levels.map((lvl) => (
                <button
                  key={lvl.level}
                  onClick={() => setActiveLevel(lvl.level)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: activeLevel === lvl.level ? "var(--color-active-bg)" : "transparent",
                    color: activeLevel === lvl.level ? "var(--color-active-text)" : "var(--color-text-muted)",
                  }}
                >
                  {lvl.level}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lesson list */}
        {lessonsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                level={activeLevel}
                unit={lesson.unit}
                order={lesson.order}
                topics={lesson.topics || []}
                completed={lesson.completed}
                isNext={!lesson.completed && nextLesson?.id === lesson.id}
                index={idx + 1}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="text-4xl mb-3">📚</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              No lessons available for {activeLevel}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Check back soon for new content
            </p>
          </div>
        )}
      </div>

      {/* ── Quick shortcuts ──────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Practice Words", icon: "🃏", href: "/review", desc: "Spaced repetition" },
          { label: "Take a Quiz", icon: "✅", href: "/quiz", desc: "Test yourself" },
          { label: "AI Chat", icon: "🗣️", href: "/chat", desc: "Practice speaking" },
          { label: "Grammar", icon: "📖", href: "/grammar", desc: "Browse topics" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            <span className="text-xl mb-2 block">{item.icon}</span>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
