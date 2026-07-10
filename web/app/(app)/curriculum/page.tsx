"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CurriculumLevel, LessonListItem } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

function LevelAccordion({ level }: { level: CurriculumLevel }) {
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: lessons, isLoading } = useQuery<LessonListItem[]>({
    queryKey: ["curriculum", level.level],
    queryFn: () => api.get(`/curriculum/${level.level}`),
    enabled: expanded,
  });

  useEffect(() => {
    if (expanded && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [expanded, lessons, isLoading]);

  const progressPct =
    level.lesson_count > 0
      ? Math.round((level.completed_count / level.lesson_count) * 100)
      : 0;

  const isComplete = progressPct === 100;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span
            className="text-2xl font-bold"
            style={{ color: isComplete ? "var(--color-success)" : "var(--color-accent-light)" }}
          >
            {level.level}
          </span>
          <div>
            <p className="font-semibold text-lg" style={{ color: "var(--color-text)" }}>{level.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 rounded-full h-1.5" style={{ background: "var(--color-page-bg)" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background: isComplete
                      ? "var(--color-success)"
                      : "var(--color-accent-gradient)",
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {level.completed_count}/{level.lesson_count}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: isComplete ? "var(--color-success)" : "var(--color-accent-light)" }}>
            {progressPct}%
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            style={{ color: "var(--color-text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable content with animation */}
      <div
        ref={contentRef}
        style={{
          maxHeight,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
          borderTop: expanded ? "1px solid var(--color-border)" : "none",
        }}
      >
        <div className="p-2">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {lessons?.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  onClick={() =>
                    router.push(`/curriculum/${level.level.toLowerCase()}/${lesson.id}`)
                  }
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  {/* Number badge */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: lesson.completed
                        ? "rgba(34,197,94,0.15)"
                        : "var(--color-hover-bg)",
                      color: lesson.completed
                        ? "var(--color-success)"
                        : "var(--color-accent-light)",
                      border: `1px solid ${
                        lesson.completed
                          ? "rgba(34,197,94,0.3)"
                          : "var(--color-badge-bg)"
                      }`,
                    }}
                  >
                    {lesson.completed ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      String(idx + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-indigo-300 transition-colors" style={{ color: "var(--color-text)" }}>
                      {lesson.title}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {lesson.topics?.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--color-page-bg)", color: "var(--color-text-muted)" }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        lesson.completed
                          ? "text-green-400"
                          : "text-indigo-400"
                      }`}
                      style={{
                        background: lesson.completed
                          ? "rgba(34,197,94,0.1)"
                          : "var(--color-active-bg)",
                        border: `1px solid ${
                          lesson.completed
                            ? "rgba(34,197,94,0.2)"
                            : "var(--color-badge-bg)"
                        }`,
                      }}
                    >
                      {lesson.completed ? "Done" : "Start"}
                    </span>
                  </div>
                </div>
              ))}

              {lessons?.length === 0 && (
                <p className="p-4 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
                  No lessons available for this level.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CurriculumSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const {
    data: levels,
    isLoading,
    error,
  } = useQuery<CurriculumLevel[]>({
    queryKey: ["curriculum"],
    queryFn: () => api.get("/curriculum"),
  });

  if (isLoading) return <CurriculumSkeleton />;
  if (error)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load curriculum."}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["curriculum"] })}
      />
    );

  const levelInfo: Record<string, { name: string; desc: string; emoji: string }> = {
    A1: { name: "Beginner", desc: "Introduce yourself, order food, ask for directions", emoji: "🌱" },
    A2: { name: "Elementary", desc: "Travel, daily routines, shopping, simple conversations", emoji: "🌿" },
    B1: { name: "Intermediate", desc: "Job interviews, media, relationships, opinions", emoji: "🌳" },
    B2: { name: "Upper Intermediate", desc: "Politics, culture, science — express complex ideas", emoji: "🎯" },
    C1: { name: "Advanced", desc: "Academic writing, literary analysis, formal debate", emoji: "🏆" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Curriculum</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Master German step by step, from absolute beginner to advanced fluency</p>
      </div>

      {/* Level descriptions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {["A1", "A2", "B1", "B2", "C1"].map((lvl) => {
          const info = levelInfo[lvl];
          const isFirst = lvl === "A1";
          return (
            <div
              key={lvl}
              className="rounded-xl p-4 text-center transition-all"
              style={{
                background: isFirst ? "var(--color-hover-bg)" : "var(--color-card-bg)",
                border: isFirst ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
              }}
            >
              <div className="text-2xl mb-1">{info.emoji}</div>
              <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{lvl} — {info.name}</div>
              <div className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{info.desc}</div>
              {isFirst && (
                <div className="text-xs font-bold mt-2 px-2 py-0.5 rounded-full inline-block" style={{ background: "var(--color-accent)", color: "#fff" }}>
                  Start here
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {levels?.map((level) => (
          <LevelAccordion key={level.level} level={level} />
        ))}
        {levels?.length === 0 && (
          <EmptyState
            icon="📚"
            title="No lessons available"
            description="There are no curriculum levels available right now. Check back soon for new content!"
          />
        )}
      </div>
    </div>
  );
}
