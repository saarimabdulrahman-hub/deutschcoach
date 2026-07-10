"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ContinueCard } from "@/components/dashboard/ContinueCard";
import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";

const GREETINGS = [
  { hi: "Guten Morgen", emoji: "👋", en: "Good morning" },
  { hi: "Guten Tag", emoji: "👋", en: "Good afternoon" },
  { hi: "Guten Abend", emoji: "👋", en: "Good evening" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
}

const TIPS = [
  { emoji: "🧠", tip: "Review before bed — sleep helps your brain consolidate new vocabulary.", illustration: "📖" },
  { emoji: "🎯", tip: "10 minutes every day beats 2 hours once a week. Consistency is key.", illustration: "🎯" },
  { emoji: "🗣️", tip: "Say new words out loud. Speaking activates different brain regions than reading.", illustration: "🗣️" },
  { emoji: "📝", tip: "Write down new words by hand. It improves retention more than typing.", illustration: "✍️" },
  { emoji: "🎵", tip: "Listen to German music or podcasts — even if you don't understand everything.", illustration: "🎧" },
  { emoji: "🔄", tip: "Spaced repetition works! Trust the SRS schedule and review cards daily.", illustration: "🔄" },
  { emoji: "📺", tip: "Watch German shows with German subtitles, not English ones.", illustration: "📺" },
  { emoji: "💬", tip: "Don't be afraid to make mistakes. Every error is a learning opportunity.", illustration: "💬" },
];

function getTip() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[day % TIPS.length];
}

// ── Skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2"><div className="h-8 w-64 rounded shimmer" /><div className="h-4 w-48 rounded shimmer" /></div>
        <div className="flex gap-3">{[...Array(2)].map((_, i) => (<div key={i} className="h-20 w-36 rounded-2xl shimmer" />))}</div>
      </div>
      <div className="h-64 rounded-[2rem] shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-24 rounded-2xl shimmer" />))}</div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="h-72 rounded-2xl shimmer" />
        <div className="space-y-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-32 rounded-2xl shimmer" />))}</div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error || !data)
    return (<ErrorState message={error instanceof Error ? error.message : "Failed to load dashboard data."} onRetry={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })} />);

  const firstName = (user?.name || "Student").split(" ")[0];
  const greeting = getGreeting();
  const tip = getTip();
  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 pb-4">
      {/* ── Header Row: Greeting + Stats ──────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{todayDate}</p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
            {greeting.hi}, {firstName} <span className="inline-block">{greeting.emoji}</span>
          </h1>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            Kleine Schritte jeden Tag, große Fortschritte fürs Leben.
          </p>
        </div>

        {/* Header stat widgets */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="rounded-2xl p-4 flex items-center gap-3 min-w-[140px]"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <span className="text-2xl">{data.streak > 0 ? "🔥" : "💤"}</span>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: data.streak > 0 ? "#f59e0b" : "var(--color-text)" }}>{data.streak}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Day Streak</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {data.streak > 0 ? "Keep going!" : "Start today!"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-4 flex flex-col justify-center min-w-[160px]"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Current Level</p>
            <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              {data.continue_lesson ? `${data.continue_lesson.level} ${data.continue_lesson.level === "A1" ? "Beginner" : ""}` : "A1 Beginner"}
            </p>
            <div className="mt-2">
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                <div className="h-full rounded-full" style={{ width: `${data.level_progress_pct}%`, background: "var(--color-accent-gradient)" }} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                {data.level_progress_pct} / 300 XP to {data.continue_lesson?.level === "A1" ? "A2" : "next level"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────── */}
      <ContinueCard lesson={data.continue_lesson} levelPct={data.level_progress_pct} />

      {/* ── Today's Plan ─────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Today's Plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Lesson */}
          <button onClick={() => router.push(data.continue_lesson ? `/curriculum/${data.continue_lesson.level.toLowerCase()}/${data.continue_lesson.id}` : "/curriculum")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>📖</div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {data.continue_lesson ? `Continue: ${data.continue_lesson.title}` : "Your First Lesson"}
              </p>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {data.continue_lesson ? `Pick up where you left off in Unit ${data.continue_lesson.unit}` : "Greetings & Introductions — learn to say hello"}
            </p>
          </button>

          {/* Grammar */}
          <button onClick={() => router.push("/grammar")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-bold"
                style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>Aa</div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>German Grammar</p>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {data.continue_lesson ? `Explore ${data.continue_lesson.level} grammar topics` : "Understand how German sentences work"}
            </p>
          </button>

          {/* AI Chat */}
          <button onClick={() => router.push("/chat")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6" }}>🗣️</div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Practice Speaking</p>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Chat with Emma — your AI language coach
            </p>
          </button>
        </div>
      </div>

      {/* ── Progress + Sidebar ────────────────── */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <ProgressOverview
          levelPct={data.level_progress_pct}
          streak={data.streak}
          cardsDue={data.cards_due_today}
          quizAvg={data.avg_quiz_score}
          weakestCount={data.weakest_words.length}
        />

        {/* Right sidebar: Review + Activity + Tip */}
        <div className="space-y-4">
          {/* Review & Practice */}
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>Review & Practice</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: data.cards_due_today > 0 ? "rgba(99,102,241,0.12)" : "rgba(34,197,94,0.1)" }}>
                  {data.cards_due_today > 0 ? "🃏" : "✅"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {data.cards_due_today > 0 ? "Flashcard Review" : "Flashcards Complete"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {data.cards_due_today > 0 ? `${data.cards_due_today} cards waiting` : "Nothing due — excellent work!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.1)" }}>✅</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {data.avg_quiz_score > 0 ? "Knowledge Quiz" : "Discover Your Level"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {data.avg_quiz_score > 0 ? `Average: ${data.avg_quiz_score}%` : "Find out what you already know"}
                  </p>
                </div>
                <button onClick={() => router.push("/quiz")} className="text-xs font-medium hover:underline flex-shrink-0"
                  style={{ color: "var(--color-accent-light)" }}>Start &rarr;</button>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Recent Activity</h3>
            {data.recent_activity.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-2xl">🌱</span>
                <p className="text-sm font-medium mt-2 mb-1" style={{ color: "var(--color-text)" }}>Your journey begins</p>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see activity here</p>
                <button onClick={() => router.push("/curriculum")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Start Lesson &rarr;</button>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recent_activity.slice(0, 4).map((item, i) => {
                  const t = new Date(item.timestamp);
                  const diff = Date.now() - t.getTime();
                  const mins = Math.floor(diff / 60000);
                  const rel = mins < 1 ? "Just now" : mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-xs flex-shrink-0">{item.type === "lesson" ? "📖" : item.type === "quiz" ? "✅" : item.type === "review" ? "🃏" : "📌"}</span>
                      <span className="flex-1 truncate" style={{ color: "var(--color-text-secondary)" }}>{item.description}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{rel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Tip of the Day */}
          <div className="rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at 100% 50%, rgba(124,58,237,0.06) 0%, transparent 60%), var(--color-card-bg)",
              border: "1px solid var(--color-border)",
            }}>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Tip of the Day</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.tip}</p>
              <button onClick={() => router.push("/curriculum")}
                className="text-xs font-medium mt-2 hover:underline" style={{ color: "var(--color-accent-light)" }}>Browse lessons &rarr;</button>
            </div>
            <span className="text-3xl flex-shrink-0 opacity-30">{tip.illustration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
