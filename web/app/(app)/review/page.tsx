"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ReviewSidebar } from "@/components/review/ReviewSidebar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { DashboardData } from "@/types";
import { REVIEW_CATEGORIES, KEEP_PRACTICING_ITEMS } from "@/lib/reviewConfig";

interface SRSStatsData {
  new: number; learning: number; reviewing: number; mastered: number;
  total_due_today: number;
}

// ── Today's Review hero ──────────────────────────────────────────────

function TodayHero({ due, streak, estimatedMin, mastered, retention }: { due: number; streak: number; estimatedMin: number; mastered: number; retention: number }) {
  const hasCards = due > 0;
  return (
    <div
      className="flex items-center"
      style={{
        borderRadius: "24px",
        height: "180px",
        background: `url('/review-hero-bg.png') right center / cover no-repeat`,
        boxShadow: "0 8px 40px rgba(0,0,0,.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Left: Status + Stats ── */}
      <div className="flex items-center gap-6 px-8" style={{ width: "65%", position: "relative", zIndex: 1 }}>
        <div className="flex-shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-[1.5px] mb-2" style={{ color: "#A855F7" }}>Today's Review</p>
          <h1 className="font-medium m-0 leading-none" style={{ fontSize: "40px", color: "#FFF" }}>
            {hasCards ? `${due} card${due !== 1 ? "s" : ""} ready` : "All caught up!"}
            {!hasCards && <span style={{ marginLeft: "4px" }}>🎉</span>}
          </h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "#A8A4BC", maxWidth: "260px" }}>
            {hasCards
              ? `~${estimatedMin} min · spaced repetition keeps words in your long-term memory`
              : "No cards due right now. Come back later for more practice."}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="rounded-xl px-3.5 py-2.5 text-center" style={{ background: "rgba(16,18,32,.65)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="text-lg font-medium m-0" style={{ color: "#FFF" }}>🔥 {streak}</p>
            <p className="text-[10px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>Streak</p>
          </div>
          <div className="rounded-xl px-3.5 py-2.5 text-center" style={{ background: "rgba(16,18,32,.65)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="text-lg font-medium m-0" style={{ color: "#FFF" }}>{mastered}</p>
            <p className="text-[10px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>Mastered</p>
          </div>
          <div className="rounded-xl px-3.5 py-2.5 text-center" style={{ background: "rgba(16,18,32,.65)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="text-lg font-medium m-0" style={{ color: "#A855F7" }}>{retention}%</p>
            <p className="text-[10px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>Retention</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: stats, isLoading, error } = useQuery<SRSStatsData>({
    queryKey: ["srs-stats"], queryFn: () => api.get("/srs/stats"), staleTime: 30_000,
  });

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  const due = stats?.total_due_today ?? dash?.cards_due_today ?? 0;
  const streak = dash?.streak ?? 0;
  const mastered = stats?.mastered ?? 0;
  const total = (stats?.new ?? 0) + (stats?.learning ?? 0) + (stats?.reviewing ?? 0) + mastered;
  const retention = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const estimatedMin = Math.max(1, Math.round(due * 0.3));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["srs-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="flex" style={{ gap: 0, margin: "0 -24px", minHeight: "calc(100vh - 72px)" }}>
      {/* ── Sidebar ── */}
      <ReviewSidebar activeItem="overview" streak={streak} />

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "var(--color-background-primary)" }}>
        <div className="space-y-5 pb-8 max-w-4xl">
          {isLoading ? (
            <div className="space-y-5">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          ) : error ? (
            <ErrorState message={error instanceof Error ? error.message : "Failed to load review data."}
              onRetry={() => queryClient.invalidateQueries({ queryKey: ["srs-stats"] })} />
          ) : (
            <>
              {/* Page Header */}
              <div>
                <h1 className="font-medium m-0" style={{ fontSize: "36px", color: "#FFF" }}>Review Overview</h1>
                <p className="mt-1.5 mb-0" style={{ fontSize: "15px", color: "#A8A4BC" }}>Practice and remember what you've learned</p>
              </div>
              <TodayHero due={due} streak={streak} estimatedMin={estimatedMin} mastered={mastered} retention={retention} />

              {/* ── MAIN LAYOUT: Today's Review (26% tall) + Right Column (74%) ── */}
              <div className="flex gap-5">
                {/* ── LEFT: Today's Review (tall, spans both rows) ── */}
                <div className="flex flex-col p-6" style={{ flex: "0.26 1 0%", borderRadius: "18px", background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-medium uppercase tracking-[1px]" style={{ color: "#FFF" }}>Today's Review</p>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.2)" strokeWidth="1" fill="none"/>
                      <text x="8" y="9" textAnchor="middle" fill="rgba(255,255,255,.2)" fontSize="7" fontWeight="bold">i</text>
                    </svg>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative" style={{ width: "110px", height: "110px" }}>
                      <svg width="110" height="110" viewBox="0 0 110 110" className="absolute inset-0">
                        <circle cx="55" cy="55" r="45" stroke="#2E1E52" strokeWidth="6" fill="none"/>
                        <circle cx="55" cy="55" r="45" stroke="url(#progressGrad)" strokeWidth="6" fill="none"
                          strokeDasharray={`${Math.min(due, 50) / 50 * 283} 283`} strokeLinecap="round" transform="rotate(-90 55 55)"/>
                        <defs>
                          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#EC4899"/><stop offset="100%" stopColor="#A855F7"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="font-bold m-0 leading-none" style={{ fontSize: "48px", color: "#FFF" }}>{due}</p>
                        <p className="m-0 mt-1" style={{ fontSize: "15px", color: "#A8A4BC" }}>cards due</p>
                      </div>
                    </div>
                    <p className="text-xs mt-4" style={{ color: "#A8A4BC" }}>Estimated time</p>
                    <p className="text-sm font-semibold m-0" style={{ color: "#FFF" }}>{estimatedMin} min</p>
                  </div>

                  {/* Start Review CTA */}
                  <button onClick={() => router.push("/review/spaced-repetition")} className="w-full py-3 rounded-xl text-sm font-medium border-none cursor-pointer mt-4"
                    style={{
                      background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)",
                      color: "#FFF",
                      boxShadow: "0 4px 16px rgba(168,85,247,.2)",
                    }}>
                    Start Review →
                  </button>
                </div>

                {/* ── RIGHT COLUMN (74%) ── */}
                <div className="flex flex-col gap-5" style={{ flex: "0.74 1 0%" }}>
                  {/* Top Row: Review by Category */}
                  <div className="p-5" style={{ borderRadius: "18px", background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
                    <p className="text-[11px] font-medium uppercase tracking-[1px] mb-4" style={{ color: "#FFF" }}>Review by Category</p>
                    <div className="flex gap-3">
                      {REVIEW_CATEGORIES.map((cat) => (
                        <button key={cat.label}
                          className="flex-1 text-center transition-all hover:-translate-y-0.5"
                          style={{
                            borderRadius: "14px",
                            padding: "16px 12px",
                            background: cat.dashed ? "transparent" : "rgba(16,18,32,.6)",
                            border: cat.dashed ? "1.5px dashed rgba(255,255,255,.15)" : "1px solid rgba(255,255,255,.05)",
                            cursor: "pointer",
                            minHeight: "140px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <div style={{ marginBottom: "10px", fontSize: "28px" }}>{cat.icon}</div>
                          <p className="text-xs font-medium m-0" style={{ color: "#FFF" }}>{cat.label}</p>
                          {cat.dashed ? (
                            <p className="text-[11px] mt-1 m-0" style={{ color: "rgba(255,255,255,.2)" }}>Create deck</p>
                          ) : (
                            <p className="text-[11px] mt-1 m-0" style={{ color: "#A8A4BC" }}>
                              {cat.label === "Vocabulary" ? `${stats?.reviewing ?? "—"} cards due` :
                               cat.label === "Grammar" ? `${stats?.learning ?? "—"} cards due` :
                               cat.label === "Phrases" ? `${stats?.new ?? "—"} cards due` :
                               "— cards due"}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Weak Words + Recent Activity */}
                  <div className="flex gap-5">
                    {/* Weak Words */}
                    <div className="p-5 flex flex-col" style={{ flex: "0.5 1 0%", borderRadius: "18px", background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
                      <p className="text-[11px] font-medium uppercase tracking-[1px] mb-3" style={{ color: "#FFF" }}>Weak Words</p>
                      <div className="flex-1">
                      {dash?.weakest_words?.length ? (
                        <div className="space-y-0">
                          {dash.weakest_words.slice(0, 3).map((w, i) => {
                            const diff = w.lapses >= 3 ? "Hard" : w.lapses >= 2 ? "Medium" : "Easy";
                            const diffColor = diff === "Hard" ? "#EF4444" : diff === "Medium" ? "#F59E0B" : "#22C55E";
                            return (
                              <div key={w.id}>
                                <div className="flex items-center justify-between py-3">
                                  <span className="text-sm" style={{ color: "#FFF" }}>{w.german}</span>
                                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: diffColor, background: `${diffColor}15` }}>{diff}</span>
                                </div>
                                {i < Math.min(dash.weakest_words.length, 3) - 1 && (
                                  <div style={{ height: "1px", background: "rgba(255,255,255,.05)" }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs py-6 text-center" style={{ color: "rgba(255,255,255,.3)" }}>No weak words</p>
                      )}
                      </div>
                      <button onClick={() => router.push("/review/weak-words")} className="w-full py-2.5 rounded-xl text-xs font-medium border-none cursor-pointer mt-auto"
                        style={{ background: "rgba(168,85,247,.15)", color: "#A855F7" }}>
                        Review Weak Words
                      </button>
                    </div>

                    {/* Recent Activity — roadmap-style timeline */}
                    <div className="p-5 flex flex-col" style={{ flex: "0.5 1 0%", borderRadius: "18px", background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
                      <p className="text-[11px] font-medium uppercase tracking-[1px] mb-4" style={{ color: "#FFF" }}>Recent Activity</p>
                      <div className="relative mb-4 flex-1">
                        {/* Continuous vertical line */}
                        <div className="absolute left-[9px] top-0 bottom-0 w-[2px] rounded-full"
                          style={{ background: "linear-gradient(180deg, rgba(168,85,247,.3) 0%, rgba(168,85,247,.05) 100%)" }} />
                        {(dash?.recent_activity?.length ? dash.recent_activity : []).map((item, i) => {
                          const timeAgo = (() => {
                            const diff = Date.now() - new Date(item.timestamp).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            return `${Math.floor(hrs / 24)}d ago`;
                          })();
                          const color = item.type === "quiz" ? "#EC4899" : item.type === "lesson_completed" ? "#84CC16" : "#8B5CF6";
                          return (
                          <div key={i} className="flex gap-4 relative" style={{ minHeight: 52 }}>
                            <div className="relative flex-shrink-0 flex items-start pt-[5px]">
                              <div className="relative rounded-full flex-shrink-0 z-10"
                                style={{ width: 20, height: 20, background: `${color}25`, border: `1px solid ${color}40` }}>
                                <div className="absolute rounded-full"
                                  style={{ width: 8, height: 8, left: 5, top: 5, background: color, border: "none" }} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex items-center" style={{ height: 52 }}>
                              <div className="min-w-0 mr-2">
                                <p className="text-[13px] font-medium truncate leading-tight mb-0.5" style={{ color: "#FFF" }}>{item.description}</p>
                                <p className="text-[12px] truncate leading-tight" style={{ color: "#A8A4BC" }}>{timeAgo} · {item.type}</p>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                        {(!dash?.recent_activity || dash.recent_activity.length === 0) && (
                          <p className="text-xs py-6 text-center" style={{ color: "rgba(255,255,255,.3)" }}>No recent activity</p>
                        )}
                      </div>
                      <button onClick={() => router.push("/review/mistakes")} className="w-full py-2.5 rounded-xl text-xs font-medium border-none cursor-pointer mt-auto"
                        style={{ background: "rgba(168,85,247,.15)", color: "#A855F7" }}>
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM SECTION: Keep Practicing ── */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[1px] mb-3" style={{ color: "#FFF" }}>Keep Practicing</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                  {KEEP_PRACTICING_ITEMS.map((item) => (
                    <button key={item.label}
                      onClick={() => router.push(item.href)}
                      className="p-5 text-left transition-all hover:-translate-y-0.5 cursor-pointer group"
                      style={{ borderRadius: "18px", background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: item.gradient, fontSize: "20px" }}>
                        {item.emoji}
                      </div>
                      <p className="text-sm font-medium m-0" style={{ color: "#FFF" }}>{item.label}</p>
                      <p className="text-xs mt-1 m-0" style={{ color: "#A8A4BC" }}>{item.desc}</p>
                      <span className="text-xs mt-2 block font-medium" style={{ color: "#A855F7" }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
