"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { AnalyticsLayout } from "@/components/layouts/AnalyticsLayout";
import { KPICard, ChartContainer, LineChart, BarChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useQueryClient } from "@tanstack/react-query";

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const { data: dash, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });

  // Derive chart data from dashboard (until dedicated analytics endpoint exists)
  const score = dash?.avg_quiz_score ?? 0;
  const learningData = [
    { day: "Score", lessons: dash?.cards_due_today ?? 0, vocab: dash?.streak ?? 0, quiz: score },
  ];

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load analytics." onRetry={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })} />;
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
                data={learningData}
                xKey="day"
                bars={[{ key: "lessons", color: "#8b5cf6", label: "Lessons" }]}
              />
            </ChartContainer>

            <ChartContainer title="Vocabulary Learned" loading={isLoading}>
              <BarChart
                data={learningData}
                xKey="day"
                bars={[{ key: "vocab", color: "#22c55e", label: "Words" }]}
              />
            </ChartContainer>

            <ChartContainer title="Quiz Accuracy Trend" loading={isLoading}>
              <LineChart
                data={learningData}
                xKey="day"
                lines={[{ key: "quiz", color: "#f59e0b", label: "Accuracy %" }]}
              />
            </ChartContainer>

            <ChartContainer title="Learning Activity" loading={isLoading}>
              <BarChart
                data={learningData}
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
