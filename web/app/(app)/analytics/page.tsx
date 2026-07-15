"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { AnalyticsLayout } from "@/components/layouts/AnalyticsLayout";
import { KPICard, ChartContainer, LineChart, BarChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";

const MOCK_LEARNING_DATA = [
  { day: "Mon", lessons: 2, vocab: 8, quiz: 70 },
  { day: "Tue", lessons: 1, vocab: 5, quiz: 85 },
  { day: "Wed", lessons: 3, vocab: 12, quiz: 90 },
  { day: "Thu", lessons: 0, vocab: 0, quiz: 0 },
  { day: "Fri", lessons: 2, vocab: 10, quiz: 75 },
  { day: "Sat", lessons: 4, vocab: 15, quiz: 95 },
  { day: "Sun", lessons: 1, vocab: 6, quiz: 80 },
];

export default function AnalyticsPage() {
  const { data: dash, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  const avg = dash?.avg_quiz_score ?? 0;
  const streak = dash?.streak ?? 0;
  const cardsDue = dash?.cards_due_today ?? 0;
  const progress = dash?.level_progress_pct ?? 0;

  return (
    <AnalyticsLayout
      filters={
        <>
          <span style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Analytics
          </span>
          <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)", marginLeft: "auto" }}>
            Last 7 days
          </span>
        </>
      }
      kpiStrip={
        <>
          <KPICard icon="🔥" label="Streak" value={streak} loading={isLoading} iconBg="rgba(245,158,11,0.14)" />
          <KPICard icon="📊" label="Avg Quiz" value={`${avg}%`} trend={avg > 70 ? { value: 5, positive: true } : { value: 2, positive: false }} loading={isLoading} iconBg="rgba(59,130,246,0.14)" />
          <KPICard icon="🃏" label="Cards Due" value={cardsDue} loading={isLoading} iconBg="rgba(168,85,247,0.14)" />
          <KPICard icon="🎯" label="Progress" value={`${progress}%`} loading={isLoading} iconBg="rgba(34,197,94,0.14)" />
        </>
      }
      chartGrid={
        <>
          <ChartContainer title="Lessons Completed" loading={isLoading}>
            <BarChart
              data={MOCK_LEARNING_DATA}
              xKey="day"
              bars={[{ key: "lessons", color: "#8b5cf6", label: "Lessons" }]}
            />
          </ChartContainer>

          <ChartContainer title="Vocabulary Learned" loading={isLoading}>
            <BarChart
              data={MOCK_LEARNING_DATA}
              xKey="day"
              bars={[{ key: "vocab", color: "#22c55e", label: "Words" }]}
            />
          </ChartContainer>

          <ChartContainer title="Quiz Accuracy Trend" loading={isLoading}>
            <LineChart
              data={MOCK_LEARNING_DATA}
              xKey="day"
              lines={[{ key: "quiz", color: "#f59e0b", label: "Accuracy %" }]}
            />
          </ChartContainer>

          <ChartContainer title="Learning Activity" loading={isLoading}>
            <BarChart
              data={MOCK_LEARNING_DATA}
              xKey="day"
              bars={[
                { key: "lessons", color: "#8b5cf6", label: "Lessons" },
                { key: "vocab", color: "#22c55e", label: "Vocabulary" },
              ]}
              stacked
            />
          </ChartContainer>
        </>
      }
    />
  );
}
