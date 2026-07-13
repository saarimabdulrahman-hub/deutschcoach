"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { CurriculumLevel, LessonListItem, DashboardData } from "@/types";
import { LevelPath } from "@/components/curriculum/LevelPath";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

// ── Constants / derivations ──────────────────────────────────────────
const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_NAME: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced",
};
// Assumption: the API exposes no per-lesson duration yet, so we derive a flat
// estimate. Replace with a real field when available (see notes / future sprint).
const MIN_PER_LESSON = 10;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Derive a readable unit theme from its lessons' topics (no unit-title field yet).
function unitTheme(lessons: LessonListItem[]): string {
  const topics = Array.from(new Set(lessons.flatMap((l) => l.topics || []))).slice(0, 2).map(titleCase);
  return topics.join(" & ");
}

interface UnitGroup {
  unit: number; lessons: LessonListItem[]; total: number; completed: number; isComplete: boolean; theme: string;
}
function groupUnits(lessons: LessonListItem[]): UnitGroup[] {
  const map = new Map<number, LessonListItem[]>();
  for (const l of [...lessons].sort((a, b) => a.order - b.order)) {
    if (!map.has(l.unit)) map.set(l.unit, []);
    map.get(l.unit)!.push(l);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([unit, ls]) => ({
    unit, lessons: ls, total: ls.length,
    completed: ls.filter((l) => l.completed).length,
    isComplete: ls.every((l) => l.completed), theme: unitTheme(ls),
  }));
}

// The learner's true current level: continue_lesson wins, else first incomplete.
function computeCurrentLevel(levels: CurriculumLevel[], dash?: DashboardData): string {
  if (dash?.continue_lesson?.level) return dash.continue_lesson.level;
  const ordered = LEVEL_ORDER.map((c) => levels.find((l) => l.level === c)).filter(Boolean) as CurriculumLevel[];
  const inc = ordered.find((l) => l.lesson_count > 0 && l.completed_count < l.lesson_count);
  if (inc) return inc.level;
  return ordered.find((l) => l.lesson_count > 0)?.level || "A1";
}

function CurriculumSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 rounded-2xl shimmer" />
      <div className="h-32 rounded-2xl shimmer" />
      <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
    </div>
  );
}

// ── Small building blocks (reuse existing design tokens only) ─────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{children}</p>;
}

// ── Page ──────────────────────────────────────────────────────────────
export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [override, setOverride] = useState<string | null>(null); // explicit "jump ahead" level

  const { user } = useAuth();
  const { data: levels, isLoading, error } = useQuery<CurriculumLevel[]>({
    queryKey: ["curriculum"], queryFn: () => api.get("/curriculum"),
  });
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  const currentLevel = levels ? computeCurrentLevel(levels, dashboard) : "A1";
  const viewLevel = override ?? currentLevel;

  const { data: lessons, isLoading: lessonsLoading } = useQuery<LessonListItem[]>({
    queryKey: ["curriculum", viewLevel], queryFn: () => api.get(`/curriculum/${viewLevel}`),
    enabled: !!levels,
  });

  if (isLoading) return <CurriculumSkeleton />;
  if (error)
    return <ErrorState message={error instanceof Error ? error.message : "Failed to load curriculum."}
      onRetry={() => queryClient.invalidateQueries({ queryKey: ["curriculum"] })} />;

  const units = lessons ? groupUnits(lessons) : [];
  const totalCompleted = levels?.reduce((s, l) => s + l.completed_count, 0) || 0;
  const isFreshStart = totalCompleted === 0;

  // Next lesson for the viewed level (continue_lesson wins when on the current level)
  const cont = dashboard?.continue_lesson;
  let nextLesson: LessonListItem | undefined;
  if (cont && cont.level === viewLevel) nextLesson = lessons?.find((l) => l.id === cont.id);
  if (!nextLesson) nextLesson = lessons?.find((l) => !l.completed);
  const levelDone = !!lessons && lessons.length > 0 && lessons.every((l) => l.completed);

  const currentUnitNum = nextLesson?.unit ?? units[units.length - 1]?.unit;
  const currentUnit = units.find((u) => u.unit === currentUnitNum);
  const objective = nextLesson
    ? (nextLesson.topics?.length ? `Learn ${nextLesson.topics.slice(0, 3).join(", ")}.` : `Continue your ${LEVEL_NAME[viewLevel] || viewLevel} journey.`)
    : "";
  const goLesson = (id: number) => router.push(`/curriculum/${viewLevel.toLowerCase()}/${id}`);
  const cardsDue = dashboard?.cards_due_today ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* ── 1. Continue Learning Hero (3-column: info · castle · progress) ── */}
      {nextLesson ? (
        <section aria-labelledby="continue-heading"
          className="relative rounded-[22px] p-5 sm:p-6 overflow-hidden"
          style={{
            background: "linear-gradient(120deg, #100A24 0%, #1B1437 40%, #1B1437 60%, #100A24 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            minHeight: 200,
          }}>
          {/* ── Background layers ─────────────────────────────── */}
          {/* Purple ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 65% 50%, rgba(109,59,255,0.25) 0%, transparent 55%), radial-gradient(ellipse at 60% 60%, rgba(255,60,166,0.10) 0%, transparent 40%)" }} />
          {/* Hero background image */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/learn-hero.webp')",
              backgroundSize: "cover",
              backgroundPosition: "38% 50%",
              opacity: 0.4,
            }} />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, rgba(16,10,36,0.55) 0%, rgba(16,10,36,0.15) 45%, transparent 65%, rgba(16,10,36,0.2) 85%, rgba(16,10,36,0.45) 100%)" }} />

          {/* ── Content row ───────────────────────────────────── */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 h-full">
            {/* LEFT: Lesson info + avatar + CTA (35%) */}
            <div className="flex-1 flex flex-col justify-center min-w-0" style={{ flexBasis: "35%" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(200,190,240,0.7)" }}>
                Continue Learning
              </p>
              {/* Avatar (biggest) + lesson title stack */}
              <div className="flex items-center gap-5 mb-4">
                {/* Avatar — 80px */}
                <div className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 0 0 6px rgba(109,59,255,0.25), 0 0 36px rgba(109,59,255,0.25)",
                  }}>
                  👩‍🏫
                </div>
                {/* Lesson title stack beside avatar */}
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold" style={{ color: "var(--color-active-text)" }}>
                    Lesson {nextLesson.order}
                  </p>
                  <h1 id="continue-heading" className="text-[2.2rem] sm:text-[2.6rem] font-extrabold leading-[1.05]" style={{ color: "#fff" }}>
                    {nextLesson.title}
                  </h1>
                  <p className="text-sm sm:text-base mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    {(nextLesson.topics || []).slice(0, 3).join(" · ")}
                  </p>
                </div>
              </div>
              {/* Metadata row */}
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                <span>⏱ ~{MIN_PER_LESSON}m</span>
                <span>📖 8 words</span>
                <span>✍ grammar</span>
                <span>📝 practice</span>
              </div>
              {/* CTA */}
              <button onClick={() => goLesson(nextLesson!.id)}
                className="px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-1.5 self-start"
                style={{
                  background: "linear-gradient(135deg, #FF3CA6, #6D3BFF, #3B82F6)",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(255,60,166,0.35)",
                  width: "fit-content",
                }}>
                Continue Lesson →
              </button>
            </div>

          </div>

          {/* SVG gradient for progress ring */}
          <svg width="0" height="0" aria-hidden>
            <defs>
              <linearGradient id="heroPctGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF3CA6" />
                <stop offset="100%" stopColor="#6D3BFF" />
              </linearGradient>
            </defs>
          </svg>
        </section>
      ) : levelDone ? (
        <section aria-labelledby="continue-heading" className="rounded-2xl p-5 sm:p-6"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <SectionLabel>Milestone reached</SectionLabel>
          <h1 id="continue-heading" className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
            🎉 {viewLevel} · {LEVEL_NAME[viewLevel]} complete
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
            Every lesson in this level is done. Keep the vocabulary fresh, or explore the next level below.
          </p>
          <button onClick={() => router.push("/review")}
            className="mt-4 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            Review your vocabulary
          </button>
        </section>
      ) : null}

      {/* ── 2. 2-Column: Today's Mission + Unit | Roadmap ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Main learning area — 70% */}
        <div className="flex-1 min-w-0 space-y-6" style={{ flexBasis: "70%" }}>
          {/* Today's Mission — glass-effect outer card with ambient glow */}
          {nextLesson && (
            <section aria-labelledby="mission-heading" className="relative rounded-[20px] p-6 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(20,16,50,0.85), rgba(25,20,55,0.75))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(109,59,255,0.06) inset",
              }}>
              {/* Subtle purple glow behind the card */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(109,59,255,0.08) 0%, transparent 60%)" }} />
              <div className="relative z-10">
                <h2 id="mission-heading" className="text-[22px] font-extrabold mb-5" style={{ color: "#FFFFFF" }}>Today's Mission</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: "📖", iconBg: "rgba(168,85,247,0.15)", iconColor: "#A855F7", glow: "rgba(168,85,247,0.08)", title: `Complete Lesson ${nextLesson.order}`, subtitle: nextLesson.title, meta: `~${MIN_PER_LESSON} min`, onClick: () => goLesson(nextLesson!.id) },
                    { icon: "🃏", iconBg: "rgba(255,180,60,0.15)", iconColor: "#E19C18", glow: "rgba(255,180,60,0.06)", title: cardsDue > 0 ? `Review ${cardsDue} cards` : "Vocabulary — all caught up", subtitle: cardsDue > 0 ? "Reinforce what you've learned" : "No cards due right now", meta: cardsDue > 0 ? "~2 min" : "✓", onClick: () => router.push("/review") },
                    { icon: "🎤", iconBg: "rgba(34,197,94,0.13)", iconColor: "#22C55E", glow: "rgba(34,197,94,0.05)", title: "Practice speaking", subtitle: "Chat with Emma — your AI coach", meta: "~2 min", onClick: () => router.push("/chat") },
                  ].map((m, i) => (
                    <button key={i} onClick={m.onClick}
                      className="text-left rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3.5 group relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.05)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                      }}>
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `radial-gradient(ellipse at 20% 50%, ${m.glow}, transparent 70%)` }} />
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative z-10"
                        style={{ background: m.iconBg, color: m.iconColor }}>
                        {m.icon}
                      </div>
                      <div className="min-w-0 relative z-10">
                        <p className="text-[15px] font-bold mb-0.5 truncate" style={{ color: "#FFFFFF" }}>{m.title}</p>
                        <p className="text-[12px] truncate" style={{ color: "#9CA3AF" }}>{m.subtitle}</p>
                        <span className="text-[10px] font-semibold mt-1.5 block" style={{ color: "#6B7280" }}>{m.meta}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Current Unit */}
          {lessonsLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : currentUnit ? (
            <section aria-labelledby="unit-heading">
              <h2 id="unit-heading" className="text-[22px] font-extrabold mb-2" style={{ color: "#FFFFFF" }}>
                Unit {currentUnit.unit}{currentUnit.theme ? ` · ${currentUnit.theme}` : ""}
              </h2>
              <p className="text-sm mb-5" style={{ color: "#9CA3AF" }}>
                {currentUnit.completed} of {currentUnit.total} lessons complete · {Math.round((currentUnit.completed / currentUnit.total) * 100)}%
              </p>
              {/* Lessons — 4-column layout */}
              <div className="space-y-2.5">
                {currentUnit.lessons.map((l) => {
                  const isActive = nextLesson?.id === l.id;
                  const isComp = l.completed;
                  return (
                    <div key={l.id} role="button" tabIndex={0}
                      onClick={() => router.push(`/curriculum/${viewLevel.toLowerCase()}/${l.id}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/curriculum/${viewLevel.toLowerCase()}/${l.id}`); } }}
                      className="flex items-center gap-5 rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group relative overflow-hidden"
                      style={{
                        background: isActive
                          ? "linear-gradient(180deg, rgba(217,70,239,0.08), rgba(109,59,255,0.04))"
                          : "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
                        border: isActive ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.04)",
                        boxShadow: isActive ? "0 0 30px rgba(217,70,239,0.08), 0 0 0 1px rgba(168,85,247,0.15) inset" : "0 4px 12px rgba(0,0,0,0.15)",
                      }}>
                      {isActive && (
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at 5% 50%, rgba(109,59,255,0.06), transparent 60%)" }} />
                      )}
                      {/* Number circle */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10"
                        style={{
                          background: isComp ? "rgba(34,197,94,0.12)" : isActive ? "linear-gradient(180deg, #FFB547, #D97706)" : "transparent",
                          color: isComp ? "#22C55E" : isActive ? "#fff" : "#6B7280",
                          border: (!isComp && !isActive) ? "1px solid rgba(255,255,255,0.06)" : "none",
                          boxShadow: isActive ? "0 0 14px rgba(255,180,60,0.18)" : "none",
                        }}>
                        {isComp ? "✓" : l.order}
                      </div>
                      {/* Lesson info */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="text-[15px] font-semibold truncate" style={{ color: isComp ? "#6B7280" : "#D1D5DB" }}>{l.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>{(l.topics || []).slice(0, 3).join(" · ")}</p>
                      </div>
                      {/* Duration */}
                      <span className="text-xs flex-shrink-0 hidden sm:block relative z-10" style={{ color: "#6B7280" }}>~{MIN_PER_LESSON} min</span>
                      {/* Status chip */}
                      <span className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full relative z-10"
                        style={{
                          background: isComp ? "rgba(34,197,94,0.1)" : isActive ? "linear-gradient(90deg, #C026FF, #8B5CF6)" : "rgba(255,255,255,0.03)",
                          color: isComp ? "#22C55E" : isActive ? "#fff" : "#6B7280",
                          border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
                          boxShadow: isActive ? "0 0 12px rgba(217,70,239,0.2)" : "none",
                        }}>
                        {isComp ? "Completed" : isActive ? "Current" : "Locked"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : lessons && lessons.length === 0 ? (
            <div className="rounded-[20px] p-8 text-center"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}>
              <div className="text-4xl mb-3">📚</div>
              <p className="text-sm font-medium mb-1" style={{ color: "#FFFFFF" }}>{viewLevel} lessons are coming soon</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>We're building this level — check back shortly.</p>
            </div>
          ) : null}
        </div>

        {/* RIGHT: Roadmap — vertical timeline with individual lessons */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ flexBasis: "30%" }}>
          <div className="rounded-[16px] p-5 flex-1 flex flex-col"
            style={{
              background: "#12162B",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            }}>
            <h3 className="text-sm font-bold mb-5" style={{ color: "#F8FAFC" }}>Roadmap</h3>

            {/* Timeline items */}
            <div className="flex-1">
              {currentUnit?.lessons.map((l, i) => {
                const isActive = nextLesson?.id === l.id;
                const isComp = l.completed;
                const isLast = i === currentUnit.lessons.length - 1;
                return (
                  <div key={l.id} className="flex gap-3">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div className="rounded-full flex-shrink-0"
                        style={{
                          width: 12, height: 12,
                          background: isComp ? "#22C55E" : isActive ? "#8B5CF6" : "#374151",
                          boxShadow: isActive ? "0 0 8px rgba(139,92,246,0.5)" : isComp ? "0 0 4px rgba(34,197,94,0.3)" : "none",
                        }} />
                      {!isLast && (
                        <div style={{ width: 2, flex: 1, minHeight: 28, background: "linear-gradient(180deg, #6D28D9, rgba(109,40,217,0.15))" }} />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 min-w-0 flex items-center justify-between ${isLast ? "" : "pb-5"}`}>
                      <div className="min-w-0 mr-2">
                        <p className="text-[13px] font-semibold truncate" style={{ color: isComp ? "#6B7280" : "#F8FAFC" }}>
                          Lesson {l.order}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "#6B7280" }}>
                          {l.title}
                        </p>
                      </div>
                      {/* Status badge */}
                      <span className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: isComp ? "rgba(34,197,94,0.1)" : isActive ? "#8B5CF6" : "#374151",
                          color: isComp ? "#22C55E" : isActive ? "#F8FAFC" : "#6B7280",
                        }}>
                        {isComp ? "Done" : isActive ? "Current" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Review node (orange accent, always last) */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className="rounded-full flex-shrink-0"
                    style={{ width: 12, height: 12, background: "#F59E0B", boxShadow: "0 0 4px rgba(245,158,11,0.3)" }} />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="min-w-0 mr-2">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "#9CA3AF" }}>Unit {currentUnitNum} Review</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "#6B7280" }}>Review everything</p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#374151", color: "#6B7280" }}>Locked</span>
                </div>
              </div>
            </div>

            {/* Full-width CTA */}
            <button onClick={() => setOverride(units[0]?.unit ? viewLevel : viewLevel)}
              className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-110"
              style={{ background: "#4C1D95", color: "#F8FAFC" }}>
              View Full Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* ── Complete Journey (premium, layered) ── */}
      {levels && levels.length > 0 && (
        <section aria-labelledby="journey-heading">
          <h2 id="journey-heading" className="text-[22px] font-extrabold mb-5" style={{ color: "#FFFFFF" }}>Complete Journey</h2>
          <div className="rounded-[20px] p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20,16,50,0.8), rgba(18,14,45,0.65))",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(109,59,255,0.04) inset",
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(109,59,255,0.06), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(255,60,166,0.04), transparent 50%)" }} />
            <div className="relative z-10">
              <LevelPath levels={levels} currentLevel={viewLevel} onSelect={setOverride} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
