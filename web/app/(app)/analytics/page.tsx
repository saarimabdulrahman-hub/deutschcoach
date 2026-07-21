"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { AnalyticsLayout } from "@/components/layouts/AnalyticsLayout";
import { KPICard, ChartContainer, LineChart, BarChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Placeholder — replace when backend analytics endpoint is available
const EMPTY_LEARNING_DATA: { day: string; lessons: number; vocab: number; quiz: number }[] = [];

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
        EMPTY_LEARNING_DATA.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "var(--space-8)" }}>
            <EmptyState
              icon="📊"
              title="Analytics coming soon"
              description="Detailed learning analytics with daily breakdowns will be available in a future update. Your KPI stats above are live."
            />
          </div>
        ) : (
          <>
            <ChartContainer title="Lessons Completed" loading={isLoading}>
              <BarChart
                data={EMPTY_LEARNING_DATA}
                xKey="day"
                bars={[{ key: "lessons", color: "#8b5cf6", label: "Lessons" }]}
              />
            </ChartContainer>

            <ChartContainer title="Vocabulary Learned" loading={isLoading}>
              <BarChart
                data={EMPTY_LEARNING_DATA}
                xKey="day"
                bars={[{ key: "vocab", color: "#22c55e", label: "Words" }]}
              />
            </ChartContainer>

            <ChartContainer title="Quiz Accuracy Trend" loading={isLoading}>
              <LineChart
                data={EMPTY_LEARNING_DATA}
                xKey="day"
                lines={[{ key: "quiz", color: "#f59e0b", label: "Accuracy %" }]}
              />
            </ChartContainer>

            <ChartContainer title="Learning Activity" loading={isLoading}>
              <BarChart
                data={EMPTY_LEARNING_DATA}
                xKey="day"
                bars={[
                  { key: "lessons", color: "#8b5cf6", label: "Lessons" },
                  { key: "vocab", color: "#22c55e", label: "Vocabulary" },
                ]}
                stacked
              />
            </ChartContainer>
          </>
        )
      }
    />
  );
}
