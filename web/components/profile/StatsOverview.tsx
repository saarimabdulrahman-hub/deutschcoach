/**
 * StatsOverview — Learning statistics cards
 */

"use client";

import { KPICard } from "@/components/charts/KPICard";

interface StatsOverviewProps {
  lessonsCompleted?: number;
  streak?: number;
  avgQuizScore?: number;
  vocabularyLearned?: number;
  loading?: boolean;
}

export function StatsOverview({ lessonsCompleted = 0, streak = 0, avgQuizScore = 0, vocabularyLearned = 0, loading }: StatsOverviewProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
      <KPICard icon="📘" label="Lessons" value={lessonsCompleted} loading={loading} iconBg="rgba(59,130,246,0.14)" />
      <KPICard icon="🔥" label="Streak" value={streak} loading={loading} iconBg="rgba(245,158,11,0.14)" />
      <KPICard icon="📊" label="Avg Quiz" value={`${avgQuizScore}%`} loading={loading} iconBg="rgba(168,85,247,0.14)" />
      <KPICard icon="🌿" label="Vocabulary" value={vocabularyLearned} loading={loading} iconBg="rgba(34,197,94,0.14)" />
    </div>
  );
}
