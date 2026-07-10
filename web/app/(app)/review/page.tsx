"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SRSStats } from "@/components/srs/SRSStats";
import { FlashcardReviewer } from "@/components/srs/FlashcardReviewer";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";

interface SRSStatsData {
  new: number;
  learning: number;
  reviewing: number;
  mastered: number;
  total_due_today: number;
}

export default function ReviewPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery<SRSStatsData>({
    queryKey: ["srs-stats"],
    queryFn: () => api.get("/srs/stats"),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Review" />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load SRS stats."}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["srs-stats"] })}
        />
      ) : stats ? (
        <SRSStats data={stats} />
      ) : null}

      <FlashcardReviewer
        onDone={() => {
          queryClient.invalidateQueries({ queryKey: ["srs-stats"] });
        }}
      />
    </div>
  );
}
