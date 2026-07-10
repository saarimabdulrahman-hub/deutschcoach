"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ContinueHero } from "@/components/dashboard/ContinueHero";
import { ProgressStrip } from "@/components/dashboard/ProgressStrip";
import { QuickGrid } from "@/components/dashboard/QuickGrid";
import { ErrorState } from "@/components/ui/ErrorState";

// ── Helpers ──────────────────────────────────────────────────────────

const GREETINGS = [
  { hi: "Guten Morgen", emoji: "☀️", en: "Good morning" },
  { hi: "Guten Tag", emoji: "👋", en: "Good afternoon" },
  { hi: "Guten Abend", emoji: "🌙", en: "Good evening" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
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

// ── Sub-components ────────────────────────────────────────────────────

function ActivityTimeline({ items }: { items: { type: string; description: string; timestamp: string }[] }) {
  const router = useRouter();
  const icons: Record<string, string> = { lesson: "📖", quiz: "✅", review: "🃏", streak: "🔥", vocab: "📝" };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
          style={{ background: "rgba(124,58,237,0.08)" }}>🌱</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>No activity yet</p>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see your journey here</p>
        <button onClick={() => router.push("/curriculum")}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          Start Lesson &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.slice(0, 5).map((item, i) => {
        const time = new Date(item.timestamp);
        const diff = Date.now() - time.getTime();
        const mins = Math.floor(diff / 60000);
        const relative = mins < 1 ? "Just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;

        return (
          <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
            <span className="text-base flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-hover-bg)" }}>
              {icons[item.type] || "📌"}
            </span>
            <p className="flex-1 text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>{item.description}</p>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{relative}</span>
          </div>
        );
      })}
    </div>
  );
}

function WordCloud({ words }: { words: { id: number; german: string; english: string; lapses: number }[] }) {
  const router = useRouter();

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
          style={{ background: "rgba(236,72,153,0.08)" }}>📝</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>No vocabulary yet</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Words you learn will appear here</p>
      </div>
    );
  }

  const maxLapses = Math.max(...words.map(w => w.lapses), 1);

  return (
    <div className="space-y-1.5">
      {words.slice(0, 5).map((word) => {
        const intensity = word.lapses / maxLapses;
        return (
          <button
            key={word.id}
            onClick={() => router.push("/review")}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{word.german}</span>
              <span className="text-xs truncate opacity-50 hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>{word.english}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-16 h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, intensity * 100)}%`,
                    background: intensity > 0.6 ? "#ef4444" : intensity > 0.3 ? "#f59e0b" : "#22c55e",
                  }} />
              </div>
              <span className="text-[10px] font-bold w-5 text-right" style={{ color: "var(--color-text-muted)" }}>
                {word.lapses > 0 ? `${word.lapses}×` : "—"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded shimmer" />
        <div className="h-8 w-64 rounded shimmer" />
      </div>
      <div className="h-72 sm:h-80 rounded-[2rem] shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="h-40 rounded-2xl shimmer" />
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl shimmer" />
        <div className="h-56 rounded-2xl shimmer" />
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
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load dashboard data."}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
      />
    );

  const firstName = (user?.name || "Student").split(" ")[0];
  const greeting = getGreeting();
  const tip = getTip();
  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 sm:space-y-8 pb-4">
      {/* ── Welcome ──────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>
          {todayDate}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          <span className="text-lg sm:text-xl mr-2">{greeting.emoji}</span>
          {greeting.hi}, {firstName}
        </h1>
        <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          {greeting.en}. Ready to practice?
        </p>
      </div>

      {/* ── Continue Learning Hero ────────────── */}
      <ContinueHero lesson={data.continue_lesson} levelPct={data.level_progress_pct} />

      {/* ── Progress Strip ────────────────────── */}
      <ProgressStrip
        levelPct={data.level_progress_pct}
        cardsDue={data.cards_due_today}
        quizAvg={data.avg_quiz_score}
        streak={data.streak}
        activityTypes={data.recent_activity.map(a => a.type)}
      />

      {/* ── Quick Actions ─────────────────────── */}
      <QuickGrid cardsDue={data.cards_due_today} quizAvg={data.avg_quiz_score} />

      {/* ── Activity + Words ──────────────────── */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl p-5 sm:p-6"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              📅 Recent Activity
            </h3>
          </div>
          <ActivityTimeline items={data.recent_activity} />
        </div>

        {/* Vocabulary / Weakest Words */}
        <div className="rounded-2xl p-5 sm:p-6"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              📝 Words to Practice
            </h3>
            {data.weakest_words.length > 0 && (
              <button onClick={() => router.push("/review")} className="text-xs font-medium hover:underline"
                style={{ color: "var(--color-accent-light)" }}>
                Practice all &rarr;
              </button>
            )}
          </div>
          <WordCloud words={data.weakest_words} />
        </div>
      </div>

      {/* ── Tip ──────────────────────────────── */}
      <div className="rounded-2xl p-4 sm:p-5 flex items-start gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(30,41,59,0.3) 100%)",
          border: "1px solid var(--color-border)",
        }}>
        <span className="text-xl flex-shrink-0">{tip.emoji}</span>
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>
            Tip of the Day
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.tip}</p>
        </div>
      </div>
    </div>
  );
}
