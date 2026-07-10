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
      <div className="text-center py-6">
        <div className="text-3xl mb-2">🌱</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>Your journey begins</p>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see activity here</p>
        <button onClick={() => router.push("/curriculum")}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          Start Lesson &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
      {items.slice(0, 5).map((item, i) => {
        const time = new Date(item.timestamp);
        const diff = Date.now() - time.getTime();
        const mins = Math.floor(diff / 60000);
        const relative = mins < 1 ? "Just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;

        return (
          <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="text-base flex-shrink-0">{icons[item.type] || "📌"}</span>
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
      <div className="text-center py-6">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>Build your vocabulary</p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Words you learn will appear here for practice</p>
      </div>
    );
  }

  const maxLapses = Math.max(...words.map(w => w.lapses), 1);

  return (
    <div className="space-y-1">
      {words.slice(0, 5).map((word) => {
        const intensity = word.lapses / maxLapses;
        return (
          <button
            key={word.id}
            onClick={() => router.push("/review")}
            className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-left hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{word.german}</span>
              <span className="text-xs truncate opacity-50 hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>{word.english}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-12 h-1 rounded-full" style={{ background: "var(--color-border)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, intensity * 100)}%`,
                    background: intensity > 0.6 ? "var(--color-error-text)" : intensity > 0.3 ? "var(--color-warning)" : "var(--color-success)",
                  }} />
              </div>
              <span className="text-[10px] font-bold w-4 text-right" style={{ color: "var(--color-text-muted)" }}>
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
      {/* 1. Continue Learning */}
      <div className="h-24 sm:h-28 rounded-2xl shimmer" />
      {/* 2. Today's Plan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
      {/* 3. Progress */}
      <div className="h-48 rounded-2xl shimmer" />
      {/* 4. Review & Practice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
      {/* 5. Activity */}
      <div className="h-56 rounded-2xl shimmer" />
      {/* 6. Achievements */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl shimmer" />
        ))}
      </div>
      {/* 7. Insights */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl shimmer" />
        <div className="h-32 rounded-2xl shimmer" />
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
  const hasStarted = data.level_progress_pct > 0 || !!data.continue_lesson || data.streak > 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-4">
      {/* ── Welcome ──────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>
          {todayDate}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          <span className="text-lg sm:text-xl mr-2">{greeting.emoji}</span>
          {greeting.hi}, {firstName}
        </h1>
      </div>

      {/* 1. Continue Learning — primary action, most prominent */}
      <ContinueCard lesson={data.continue_lesson} levelPct={data.level_progress_pct} />

      {/* 2. Today's Learning Plan — intelligent recommendations */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
          Today's Learning Plan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Lesson card — always shows specific lesson name */}
          <button onClick={() => router.push(data.continue_lesson ? `/curriculum/${data.continue_lesson.level.toLowerCase()}/${data.continue_lesson.id}` : "/curriculum")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.08)" }}>📖</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                  {data.continue_lesson ? `Continue: ${data.continue_lesson.title}` : "Your First Lesson"}
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {data.continue_lesson
                ? `Pick up where you left off in Unit ${data.continue_lesson.unit}`
                : "Greetings & Introductions — learn to say hello"}
            </p>
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: "var(--color-brand-purple)" }}>
              {data.continue_lesson
                ? `${data.continue_lesson.progress_pct}% complete — finish today`
                : "~10 min · Beginner-friendly"}
            </p>
          </button>

          {/* Grammar card — level-specific recommendation */}
          <button onClick={() => router.push("/grammar")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(168,85,247,0.08)" }}>📖</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                  {data.continue_lesson ? `${data.continue_lesson.level} Grammar` : "German Grammar"}
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {data.continue_lesson
                ? `Explore topics from your ${data.continue_lesson.level} lessons`
                : "Understand how German sentences work"}
            </p>
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: "var(--color-brand-purple)" }}>
              {data.continue_lesson ? "Review grammar from your current level" : "Start with articles and pronouns"}
            </p>
          </button>

          {/* AI chat card — scenario suggestion */}
          <button onClick={() => router.push("/chat")}
            className="text-left rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(56,189,248,0.08)" }}>🗣️</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                  Practice Speaking
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {data.continue_lesson
                ? `Try using ${data.continue_lesson.level} vocabulary in conversation`
                : "Chat with Emma — your AI language coach"}
            </p>
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: "var(--color-brand-purple)" }}>
              {data.continue_lesson ? "Apply what you've learned" : "No experience needed — Emma guides you"}
            </p>
          </button>
        </div>
      </div>

      {/* 3. Learning Progress — ring + stats, full width, prominent */}
      <ProgressOverview
        levelPct={data.level_progress_pct}
        streak={data.streak}
        cardsDue={data.cards_due_today}
        quizAvg={data.avg_quiz_score}
        weakestCount={data.weakest_words.length}
      />

      {/* 4. Review & Practice — dedicated section, not mixed with learning */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Review & Practice
          </p>
          {data.cards_due_today > 0 && (
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              ~{Math.max(1, Math.round(data.cards_due_today / 5))} min
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={() => router.push("/review")}
            className="text-left rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 group flex items-center gap-4"
            style={{
              background: data.cards_due_today > 0
                ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.03))"
                : "var(--color-card-bg)",
              border: data.cards_due_today > 0 ? "1px solid rgba(99,102,241,0.2)" : "1px solid var(--color-border)",
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: data.cards_due_today > 0 ? "rgba(99,102,241,0.15)" : "var(--color-hover-bg)" }}>
              🃏
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {data.cards_due_today > 0 ? "Daily Flashcard Review" : "Flashcards Complete"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: data.cards_due_today > 0 ? "var(--color-accent-light)" : "var(--color-text-muted)" }}>
                {data.cards_due_today > 0
                  ? `${data.cards_due_today} card${data.cards_due_today !== 1 ? "s" : ""} waiting — ~${Math.max(1, Math.round(data.cards_due_today / 5))} min to complete`
                  : "Nothing due — excellent work today!"}
              </p>
            </div>
          </button>
          <button onClick={() => router.push("/quiz")}
            className="text-left rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 group flex items-center gap-4"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.08)" }}>✅</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {data.avg_quiz_score > 0 ? "Knowledge Quiz" : "Discover Your Level"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {data.avg_quiz_score > 0
                  ? `Your average: ${data.avg_quiz_score}% — ${data.avg_quiz_score >= 80 ? "you're acing it!" : data.avg_quiz_score >= 60 ? "keep improving!" : "practice makes perfect"}`
                  : "Find out what you already know"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Recent Activity — time-based feed */}
      <Card className="p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-muted)" }}>
          📅 Recent Activity
        </h3>
        <ActivityTimeline items={data.recent_activity} />
      </Card>

      {/* 6. Achievements & Milestones */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: data.streak > 0
              ? "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))"
              : "var(--color-card-bg)",
            border: data.streak > 0 ? "1px solid rgba(245,158,11,0.15)" : "1px solid var(--color-border)",
          }}>
          <span className="text-3xl flex-shrink-0">{data.streak > 0 ? "🔥" : "💤"}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: data.streak > 0 ? "#f59e0b" : "var(--color-text)" }}>
              {data.streak > 0 ? `${data.streak}-Day Streak` : "Start Your Streak"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {data.streak > 0
                ? "Keep the momentum going!"
                : "Practice today to begin your streak"}
            </p>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4 surface-primary"
          style={{
            border: data.level_progress_pct >= 100
              ? "1px solid rgba(34,197,94,0.2)"
              : data.level_progress_pct >= 50
                ? "1px solid rgba(124,58,237,0.12)"
                : "1px solid var(--color-border)",
          }}>
          <span className="text-3xl flex-shrink-0">
            {data.level_progress_pct >= 100 ? "🏆" : data.level_progress_pct >= 50 ? "🎯" : "🌱"}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {data.level_progress_pct >= 100
                ? "Level Complete!"
                : data.level_progress_pct >= 50
                  ? "Halfway There"
                  : "Getting Started"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {data.level_progress_pct >= 100
                ? "Advance to the next level"
                : data.level_progress_pct > 0
                  ? `${data.level_progress_pct}% through your current level`
                  : "Complete your first lesson"}
            </p>
          </div>
        </div>
      </div>

      {/* 7. Learning Insights — words + tip merged */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6">
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
        </Card>

        <div className="rounded-2xl p-4 sm:p-5 flex items-start gap-3"
          style={{
            background: "radial-gradient(ellipse at 0% 50%, rgba(124,58,237,0.04) 0%, transparent 60%), var(--color-card-bg)",
            border: "1px solid rgba(124,58,237,0.08)",
          }}>
          <span className="text-xl flex-shrink-0">{tip.emoji}</span>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>
              Tip of the Day
            </p>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.tip}</p>
            <button onClick={() => router.push("/curriculum")}
              className="text-xs font-medium mt-2 hover:underline" style={{ color: "var(--color-accent-light)" }}>
              Browse lessons &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
