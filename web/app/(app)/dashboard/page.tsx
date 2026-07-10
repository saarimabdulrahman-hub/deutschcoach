"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { StatPills } from "@/components/dashboard/StatPills";
import { ActionTiles } from "@/components/dashboard/ActionTiles";
import { WeakestWords } from "@/components/dashboard/WeakestWords";
import { ErrorState } from "@/components/ui/ErrorState";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const TIPS = [
  { emoji: "🧠", tip: "Review before bed — sleep helps your brain consolidate new vocabulary." },
  { emoji: "🎯", tip: "10 minutes every day beats 2 hours once a week. Consistency is key." },
  { emoji: "🗣️", tip: "Say new words out loud. Speaking activates different brain regions than reading." },
  { emoji: "📝", tip: "Write down new words by hand. It improves retention more than typing." },
  { emoji: "🎵", tip: "Listen to German music or podcasts — even if you don't understand everything." },
  { emoji: "🔄", tip: "Spaced repetition works! Trust the SRS schedule and review cards daily." },
  { emoji: "📺", tip: "Watch German shows with German subtitles, not English ones." },
  { emoji: "💬", tip: "Don't be afraid to make mistakes. Every error is a learning opportunity." },
];

function getTip() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[day % TIPS.length];
}

function ActivityItem({ type, description, timestamp }: { type: string; description: string; timestamp: string }) {
  const icons: Record<string, string> = {
    lesson: "📖", quiz: "✅", review: "🃏", streak: "🔥", vocab: "📝",
  };
  const time = new Date(timestamp);
  const relative = (() => {
    const diff = Date.now() - time.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-base flex-shrink-0">{icons[type] || "📌"}</span>
      <p className="flex-1 text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>{description}</p>
      <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{relative}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded shimmer" />
        <div className="h-4 w-40 rounded shimmer" />
      </div>
      <div className="h-48 sm:h-56 rounded-3xl shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="h-64 rounded-2xl shimmer" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const tip = getTip();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Welcome ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>
            {today}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
            {getGreeting()}, {firstName} <span className="inline-block">👋</span>
          </h1>
        </div>
        {data.streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#f59e0b" }}>
            <span className="text-lg">🔥</span>
            {data.streak} day{data.streak !== 1 ? "s" : ""} streak
          </div>
        )}
      </div>

      {/* ── Hero — Progress + Continue Learning ──── */}
      <HeroCard
        continueLesson={data.continue_lesson}
        levelProgressPct={data.level_progress_pct}
        streak={data.streak}
      />

      {/* ── Stat pills ───────────────────────────── */}
      <StatPills
        cardsDue={data.cards_due_today}
        quizAvg={data.avg_quiz_score}
        streak={data.streak}
        weakestWordCount={data.weakest_words.length}
      />

      {/* ── Activity + Actions ───────────────────── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl p-5 sm:p-6"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Recent Activity
            </h3>
            {data.recent_activity.length === 0 && (
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>No activity yet</span>
            )}
          </div>
          {data.recent_activity.length > 0 ? (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {data.recent_activity.slice(0, 5).map((item, i) => (
                <ActivityItem key={i} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                Your learning journey starts here
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Complete your first lesson to see activity
              </p>
              <button
                onClick={() => router.push("/curriculum")}
                className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                Browse Lessons
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions + Weakest Words */}
        <div className="space-y-6">
          <ActionTiles cardsDue={data.cards_due_today} quizAvg={data.avg_quiz_score} />
          <WeakestWords words={data.weakest_words} />
        </div>
      </div>

      {/* ── Tip ──────────────────────────────────── */}
      <div className="rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(30,41,59,0.5) 100%)",
          border: "1px solid var(--color-border)",
        }}>
        <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
            Tip of the Day
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.tip}</p>
        </div>
      </div>
    </div>
  );
}
