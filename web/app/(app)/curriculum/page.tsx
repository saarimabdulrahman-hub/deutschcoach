"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { CurriculumLevel, LessonListItem, DashboardData } from "@/types";
import { LevelPath } from "@/components/curriculum/LevelPath";
import { LessonCard } from "@/components/curriculum/LessonCard";
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

function MissionItem({ done, label, sublabel, onClick }: { done: boolean; label: string; sublabel: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/[0.03]"
      style={{ border: "1px solid var(--color-border)" }}
      aria-label={`${label}. ${sublabel}`}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
        style={{
          background: done ? "rgba(34,197,94,0.15)" : "var(--color-hover-bg)",
          color: done ? "#22c55e" : "var(--color-accent-light)",
          border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-border)",
        }}>
        {done ? "✓" : ""}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium" style={{ color: done ? "var(--color-text-muted)" : "var(--color-text)" }}>{label}</span>
        <span className="block text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{sublabel}</span>
      </span>
      <span className="text-sm flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>›</span>
    </button>
  );
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
            minHeight: 240,
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
              backgroundPosition: "45% 50%",
              opacity: 0.4,
            }} />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, rgba(16,10,36,0.55) 0%, rgba(16,10,36,0.15) 45%, transparent 65%, rgba(16,10,36,0.2) 85%, rgba(16,10,36,0.45) 100%)" }} />

          {/* ── Content row ───────────────────────────────────── */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 h-full">
            {/* LEFT: Lesson info + avatar + CTA (35%) */}
            <div className="flex-1 flex flex-col justify-center min-w-0" style={{ flexBasis: "35%" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "rgba(200,190,240,0.7)" }}>
                Continue Learning
              </p>
              {/* Avatar + name row */}
              <div className="flex items-center gap-3.5 mb-3.5">
                {/* Avatar — gradient circle with visible glow */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 0 0 5px rgba(109,59,255,0.25), 0 0 30px rgba(109,59,255,0.25)",
                  }}>
                  {(user?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "#fff" }}>{user?.name || "Student"}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{viewLevel} · {LEVEL_NAME[viewLevel] || viewLevel}</p>
                </div>
              </div>
              {/* Lesson title */}
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Current Lesson</p>
              <h1 id="continue-heading" className="text-[1.65rem] sm:text-[2rem] font-extrabold leading-[1.1] mb-2" style={{ color: "#fff" }}>
                {nextLesson.title}
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed mb-3 max-w-[340px]" style={{ color: "var(--color-text-secondary)" }}>{objective}</p>
              {/* Metadata row */}
              <div className="flex items-center gap-3 sm:gap-5 text-[11px] mb-4" style={{ color: "var(--color-text-muted)" }}>
                <span className="flex items-center gap-1">⏱ ~{MIN_PER_LESSON}m</span>
                <span className="flex items-center gap-1">📖 8 words</span>
                <span className="flex items-center gap-1">✍ grammar</span>
                <span className="flex items-center gap-1">📝 practice</span>
              </div>
              {/* CTA */}
              <button onClick={() => goLesson(nextLesson!.id)}
                className="px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-1.5 w-auto"
                style={{
                  background: "linear-gradient(135deg, #FF3CA6, #6D3BFF, #3B82F6)",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(255,60,166,0.35)",
                }}>
                Continue Lesson →
              </button>
            </div>

            {/* CENTER: Empty spacer (background image slot — ready for your image) */}

            {/* RIGHT: Progress widget (overlapping circle) */}
            <div className="hidden md:flex flex-col justify-center flex-shrink-0" style={{ flexBasis: "25%" }}>
              <div className="relative pt-14 pb-5 px-5 rounded-2xl"
                style={{
                  background: "rgba(20,20,35,0.75)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}>
                {/* Large circular progress — covers the top half of the card */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="relative w-[88px] h-[88px]">
                    {/* Glow ring behind the circle */}
                    <div className="absolute -inset-3 rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(109,59,255,0.5), transparent 70%)", filter: "blur(8px)" }} />
                    <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="44" cy="44" r="38" fill="none"
                        stroke="url(#heroPctGrad)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - (currentUnit ? currentUnit.completed / Math.max(currentUnit.total, 1) : 0))}
                        style={{ transition: "stroke-dashoffset 0.8s ease", filter: "drop-shadow(0 0 8px rgba(255,60,166,0.5))" }} />
                    </svg>
                    <span className="absolute inset-0 z-10 flex items-center justify-center text-lg font-extrabold" style={{ color: "#fff" }}>
                      {currentUnit ? Math.round((currentUnit.completed / Math.max(currentUnit.total, 1)) * 100) : 0}%
                    </span>
                  </div>
                </div>
                {/* Text + progress bar below the circle */}
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-center" style={{ color: "var(--color-text-muted)" }}>Unit Progress</p>
                <p className="text-xs font-bold text-center mb-3" style={{ color: "#fff" }}>
                  Unit {currentUnitNum || 1} of {units.length || 2}
                </p>
                {/* Progress bar — thicker, with glow */}
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentUnit ? Math.round((currentUnit.completed / Math.max(currentUnit.total, 1)) * 100) : 0}%`,
                      background: "linear-gradient(90deg, #FF3CA6, #6D3BFF)",
                      boxShadow: "0 0 8px rgba(255,60,166,0.4)",
                    }} />
                </div>
                <p className="text-[10px] mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {currentUnit?.completed ?? 0} of {currentUnit?.total ?? 0} lessons completed
                </p>
              </div>
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

      {/* ── 2. Today's Mission ──────────────────────────────────────── */}
      {nextLesson && (
        <section aria-labelledby="mission-heading">
          <h2 id="mission-heading" className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>Today's Mission</h2>
          <div className="rounded-2xl p-3 sm:p-4 space-y-2.5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <MissionItem done={false} label={`Complete Lesson ${nextLesson.order}: ${nextLesson.title}`}
              sublabel={`~${MIN_PER_LESSON} min · adds new words to your review deck`} onClick={() => goLesson(nextLesson!.id)} />
            <MissionItem done={cardsDue === 0}
              label={cardsDue > 0 ? `Review ${cardsDue} vocabulary card${cardsDue === 1 ? "" : "s"}` : "Vocabulary — all caught up"}
              sublabel={cardsDue > 0 ? "Reinforce what you've learned" : "No cards due right now"} onClick={() => router.push("/review")} />
            <MissionItem done={false} label="Practice speaking with Emma" sublabel="A few minutes of real conversation" onClick={() => router.push("/chat")} />
          </div>
        </section>
      )}

      {/* ── 3–5. Current Unit (title, description, progress, lessons) ── */}
      {lessonsLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : currentUnit ? (
        <section aria-labelledby="unit-heading">
          <div className="flex items-end justify-between gap-3 mb-1">
            <div className="min-w-0">
              <SectionLabel>Current Unit</SectionLabel>
              <h2 id="unit-heading" className="text-lg sm:text-xl font-bold" style={{ color: "var(--color-text)" }}>
                Unit {currentUnit.unit}{currentUnit.theme ? ` · ${currentUnit.theme}` : ""}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                {currentUnit.completed} of {currentUnit.total} lessons complete
              </p>
            </div>
            <span className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--color-accent-light)" }}>
              {Math.round((currentUnit.completed / currentUnit.total) * 100)}%
            </span>
          </div>
          {/* Lesson progress */}
          <div className="h-1.5 rounded-full mt-2 mb-4" style={{ background: "var(--color-border)", overflow: "hidden" }}>
            <div className="h-full rounded-full" style={{ width: `${(currentUnit.completed / currentUnit.total) * 100}%`, background: "var(--color-accent-gradient)" }} />
          </div>
          <div className="space-y-3">
            {currentUnit.lessons.map((l) => (
              <LessonCard key={l.id} id={l.id} title={l.title} level={viewLevel} unit={l.unit} order={l.order}
                topics={l.topics || []} completed={l.completed} isNext={nextLesson?.id === l.id} index={l.order} />
            ))}
          </div>
        </section>
      ) : lessons && lessons.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>{viewLevel} lessons are coming soon</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>We're building this level — check back shortly.</p>
        </div>
      ) : null}

      {/* ── 6–7. Unit Roadmap (this level's units; future units previewed) ── */}
      {units.length > 1 && (
        <section aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>{viewLevel} Roadmap</h2>
          <ul className="space-y-2">
            {units.map((u) => {
              const isCurrent = u.unit === currentUnit?.unit;
              const status = u.isComplete ? "Complete" : isCurrent ? "In progress" : "Up next";
              return (
                <li key={u.unit} className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: "var(--color-card-bg)", border: isCurrent ? "1px solid var(--color-accent)" : "1px solid var(--color-border)" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: u.isComplete ? "rgba(34,197,94,0.15)" : isCurrent ? "var(--color-hover-bg)" : "var(--color-page-bg)",
                      color: u.isComplete ? "#22c55e" : isCurrent ? "var(--color-accent-light)" : "var(--color-text-muted)",
                    }}>
                    {u.isComplete ? "✓" : u.unit}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      Unit {u.unit}{u.theme ? ` · ${u.theme}` : ""}
                    </span>
                    <span className="block text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {u.total} lesson{u.total === 1 ? "" : "s"} · ~{u.total * MIN_PER_LESSON} min · {status}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── 8. Future CEFR Levels (no fake locks; Coming Soon if empty) ── */}
      {levels && levels.length > 0 && (
        <section aria-labelledby="journey-heading">
          <h2 id="journey-heading" className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>Your CEFR Journey</h2>
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <LevelPath levels={levels} currentLevel={viewLevel} onSelect={setOverride} />
          </div>
        </section>
      )}

      {/* ── 9. Additional Learning Tools ────────────────────────────── */}
      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>More ways to practice</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Practice Words", icon: "🃏", href: "/review", desc: "Spaced repetition" },
            { label: "Take a Quiz", icon: "✅", href: "/quiz", desc: "Test yourself" },
            { label: "AI Chat", icon: "🗣️", href: "/chat", desc: "Practice speaking" },
            { label: "Grammar", icon: "📖", href: "/grammar", desc: "Browse topics" },
          ].map((item) => (
            <button key={item.label} onClick={() => router.push(item.href)}
              className="rounded-xl p-4 text-left transition-all hover:-translate-y-0.5"
              style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
              <span className="text-xl mb-2 block">{item.icon}</span>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
