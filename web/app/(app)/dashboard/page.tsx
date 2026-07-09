"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { WeakestWords } from "@/components/dashboard/WeakestWords";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ErrorState } from "@/components/ui/ErrorState";

// ── Helpers ──────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const LANGUAGE_TIPS = [
  { emoji: "🧠", tip: "Review before bed — sleep helps your brain consolidate new vocabulary." },
  { emoji: "🎯", tip: "10 minutes every day beats 2 hours once a week. Consistency is key." },
  { emoji: "🗣️", tip: "Say new words out loud. Speaking activates different brain regions than reading." },
  { emoji: "📝", tip: "Write down new words by hand. It improves retention more than typing." },
  { emoji: "🎵", tip: "Listen to German music or podcasts — even if you don't understand everything." },
  { emoji: "🔄", tip: "Spaced repetition works! Trust the SRS schedule and review cards daily." },
  { emoji: "📺", tip: "Watch German shows with German subtitles, not English ones." },
  { emoji: "💬", tip: "Don't be afraid to make mistakes. Every error is a learning opportunity." },
];

function getTodaysTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return LANGUAGE_TIPS[dayOfYear % LANGUAGE_TIPS.length];
}

function LevelProgressRing({ pct }: { pct: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="url(#levelGradient)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <defs>
          <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{pct}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Complete</span>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded shimmer" />
        <div className="h-4 w-40 rounded shimmer" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="h-40 rounded-2xl shimmer" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl shimmer" />
        <div className="h-56 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────

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
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load dashboard data."}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
      />
    );

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const firstName = (user?.name || "Student").split(" ")[0];
  const tip = getTodaysTip();

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            {getGreeting()}, {firstName} <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <span className="text-base">🔥</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {data.streak} day{data.streak !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Stats + Level ring */}
      <div className="grid grid-cols-[1fr_180px] gap-4">
        <StatsGrid data={data} />
        <div className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Level Progress
          </p>
          <LevelProgressRing pct={data.level_progress_pct} />
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            {data.level_progress_pct === 0
              ? "Start a lesson to begin!"
              : data.level_progress_pct < 25
                ? "You're getting started!"
                : data.level_progress_pct < 50
                  ? "Making good progress!"
                  : data.level_progress_pct < 75
                    ? "Over halfway there!"
                    : "Almost complete! 🎉"}
          </p>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {data.continue_lesson ? (
            <ContinueLearning lesson={data.continue_lesson} />
          ) : (
            <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
              style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", minHeight: "140px" }}>
              <p className="text-3xl mb-2">📚</p>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                Ready to start learning?
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                Jump into your first lesson or try the AI chat.
              </p>
              <div className="flex gap-2">
                <button onClick={() => router.push("/curriculum")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                  Browse Lessons
                </button>
                <button onClick={() => router.push("/chat")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "var(--color-page-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  Try AI Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Quick Actions */}
        <div className="flex flex-col gap-2">
          {[
            { label: "Daily Review", icon: "🃏", href: "/review", subtitle: `${data.cards_due_today} cards due`, primary: data.cards_due_today > 0 },
            { label: "Take a Quiz", icon: "✅", href: "/quiz", subtitle: `Avg score: ${data.avg_quiz_score}%`, primary: false },
            { label: "AI Chat", icon: "🗣️", href: "/chat", subtitle: "Practice conversation", primary: false },
          ].map((action) => (
            <button key={action.label} onClick={() => router.push(action.href)}
              className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:-translate-y-0.5"
              style={{
                background: action.primary ? "var(--color-accent-gradient)" : "var(--color-card-bg)",
                border: action.primary ? "none" : "1px solid var(--color-border)",
              }}>
              <span className="text-xl flex-shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: action.primary ? "#fff" : "var(--color-text)" }}>
                  {action.label}
                </div>
                <div className="text-xs" style={{ color: action.primary ? "rgba(255,255,255,0.8)" : "var(--color-text-muted)" }}>
                  {action.subtitle}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0"
                style={{ color: action.primary ? "rgba(255,255,255,0.7)" : "var(--color-text-muted)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Tip of the day */}
      <div className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
            Tip of the Day
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.tip}</p>
        </div>
      </div>

      {/* Bottom row — Activity + Weakest Words */}
      <div className="grid grid-cols-2 gap-6">
        <RecentActivity items={data.recent_activity} />
        <WeakestWords words={data.weakest_words} />
      </div>
    </div>
  );
}
