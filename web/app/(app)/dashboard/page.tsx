"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ErrorState, Skeleton } from "@/components/ui";
import { DashboardHero, PlanCard, KpiCard, ProgressRing } from "@/components/dashboard";

const GREETINGS = [
  { hi: "Guten Morgen", en: "Good morning" },
  { hi: "Guten Tag", en: "Good afternoon" },
  { hi: "Guten Abend", en: "Good evening" },
];
function getGreeting() { const h = new Date().getHours(); return h < 12 ? GREETINGS[0] : h < 18 ? GREETINGS[1] : GREETINGS[2]; }
function formatDate() { return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase(); }

// Premium glass card — matches sandbox preview style
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
  border: "1px solid rgba(186, 120, 255, 0.18)",
  borderRadius: 20,
  boxShadow: "0 0 35px rgba(168,85,247,.08)",
  transition: "transform .2s ease, border-color .2s ease",
};

// Review & Practice group — themed border/glow that shines INWARD (inset),
// lighter on the bottom side so it fades open rather than boxing in.
const reviewWrap: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
  border: "1px solid rgba(217,70,239,0.18)",
  borderRadius: 20,
  boxShadow: "inset 0 -2px 8px rgba(217,70,239,0.06), inset 0 0 16px rgba(217,70,239,0.14)",
};
// Subtle inner card for the review group
const reviewItem: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(186,120,255,0.12)",
  borderRadius: 14,
};

function DashboardSkeleton() {
  return (<div className="space-y-5"><Skeleton variant="dashboard" /></div>);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<DashboardData>({ queryKey: ["dashboard"], queryFn: () => api.get("/dashboard") });
  if (isLoading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error instanceof Error ? error.message : "Failed to load dashboard data."} onRetry={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })} />;
  const firstName = (user?.name || "Student").split(" ")[0];
  const greeting = getGreeting();

  return (
    <div className="space-y-3 pb-4 dashboard-shell" style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* ── Greeting + Stats ───────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{formatDate()}</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--color-text)" }}>{greeting.hi}, {firstName}! 👋</h1>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>Kleine Schritte jeden Tag, große Fortschritte fürs Leben.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="rounded-2xl py-2.5 px-3.5 flex flex-col justify-center min-w-[110px]" style={cardStyle}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[8px] flex items-center justify-center text-xs" style={{background:"rgba(245,158,11,.14)",color:"#F59E0B"}}>🔥</div>
              <span className="text-[10px] font-medium uppercase tracking-[.08em]" style={{color:"var(--color-text-muted)"}}>Day Streak</span>
            </div>
            <p className="text-2xl font-bold mt-1.5 leading-none" style={{color:"#fff"}}>{data.streak}</p>
            <p className="text-[10px] mt-0.5" style={{color:"var(--color-text-muted)"}}>{data.streak>0?"Keep going!":"Start today!"}</p>
          </div>
          <div className="rounded-2xl py-2.5 px-3.5 flex flex-col justify-center min-w-[210px]" style={cardStyle}>
            <span className="text-[10px] font-medium uppercase tracking-[.08em] mb-1.5" style={{color:"var(--color-text-muted)"}}>Current Level</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[10px] font-extrabold" style={{background:"linear-gradient(135deg,#ec4899,#d946ef,#8b5cf6)",color:"#fff"}}>A1</div>
              <b className="text-[13px]" style={{color:"#fff"}}>A1 Beginner</b>
            </div>
            <div className="w-full h-1 rounded-full mt-1.5" style={{background:"#2A2A45",overflow:"hidden"}}>
              <div className="h-full rounded-full" style={{width:`${data.level_progress_pct}%`,background:"linear-gradient(90deg,#ec4899,#f472b6,#d946ef,#8b5cf6)",boxShadow:"0 0 8px rgba(217,70,239,0.5)"}}/>
            </div>
            <p className="text-[10px] mt-1" style={{color:"var(--color-text-muted)"}}>Progress to A2</p>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────── */}
      <DashboardHero />

      {/* ── Today's Plan ──────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "var(--color-text-muted)" }}>Today's Plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PlanCard icon="📘" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" title="Your First Lesson" subtitle="Greetings & Introductions" footer="~10 min · Beginner-friendly"
            href={data.continue_lesson ? `/curriculum/${data.continue_lesson.level.toLowerCase()}/${data.continue_lesson.id}` : "/curriculum"} />
          <PlanCard icon="Aa" iconBg="rgba(168,85,247,.14)" iconColor="#A855F7" title="German Grammar" subtitle="Understand how sentences work" footer="Start with articles & pronouns" href="/grammar" />
          <PlanCard icon="🎤" iconBg="rgba(217,70,239,.14)" iconColor="#D946EF" title="Practice Speaking" subtitle="Chat with Emma — your AI coach" footer="No experience needed" href="/chat" />
        </div>
      </div>

      {/* ── Your Progress | KPI Grid | Review  (midRow) ── */}
      <div>
        <div className="grid grid-cols-[260px_1fr_260px] gap-2 items-stretch hidden lg:grid">
          {/* Left: Progress ring card (heading inside) */}
          <div className="rounded-[20px] p-3.5 flex flex-col gap-2" style={cardStyle}>
            <p className="text-[11px] font-semibold uppercase tracking-[.13em]" style={{ color: "var(--color-text-muted)" }}>Your Progress</p>
            <div className="flex flex-col items-center text-center justify-center gap-1 flex-1">
              <ProgressRing pct={data.level_progress_pct} />
              <p className="text-base font-bold" style={{ color: "#fff" }}>{data.level_progress_pct===0?"Ready to begin":`${data.level_progress_pct}% complete`}</p>
              <p className="text-sm max-w-[210px]" style={{ color: "var(--color-text-muted)" }}>Start your first lesson to see your progress here.</p>
              <button onClick={()=>router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-1.5"
                style={{background:"transparent",color:"var(--color-accent-light)",border:"1px solid var(--color-accent)"}}>View Roadmap</button>
            </div>
          </div>
          {/* Center: KPI Grid 3x2 */}
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            <KpiCard icon="📘" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.level_progress_pct}%`} unit="" label="Level Progress"/>
            <KpiCard icon="🌿" iconBg="rgba(34,197,94,.14)" iconColor="#22C55E" value={`${data.weakest_words.length}`} unit="" label="Words in Review"/>
            <KpiCard icon="🧩" iconBg="rgba(168,85,247,.14)" iconColor="#A855F7" value={data.level_progress_pct > 0 ? "✓" : "—"} unit="" label="Grammar Topics"/>
            <KpiCard icon="🎯" iconBg="rgba(245,158,11,.14)" iconColor="#F59E0B" value={data.avg_quiz_score>0?`${data.avg_quiz_score}%`: "0%"} unit="" label="Quiz Accuracy"/>
            <KpiCard icon="🕒" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.cards_due_today}`} unit="" label="Cards to Review"/>
            <KpiCard icon="⏱" iconBg="rgba(56,189,248,.14)" iconColor="#38BDF8" value={data.continue_lesson ? `L${data.continue_lesson.unit}` : "—"} unit="" label="Current Unit"/>
          </div>
          {/* Right: Review & Practice (heading + inner-glow wrapper) */}
          <div className="rounded-[20px] p-3.5 flex flex-col gap-2.5" style={reviewWrap}>
            <p className="text-[11px] font-semibold uppercase tracking-[.13em]" style={{ color: "var(--color-text-muted)" }}>Review & Practice</p>
            <div className="flex flex-col gap-2.5 flex-1">
              <button onClick={() => router.push("/review")} className="rounded-[14px] p-3.5 flex items-center gap-3 flex-1 text-left cursor-pointer hover:brightness-110 transition-all duration-200 w-full border-none"
              style={{...reviewItem, background: "rgba(255,255,255,0.03)"}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(245,158,11,.14)",color:"#F59E0B"}}>🃏</div>
                <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Flashcards Complete</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Nothing due — excellent work!</p></div>
                <span className="text-lg" style={{color:"var(--color-text-muted)"}}>›</span>
              </button>
              <button onClick={() => router.push("/curriculum")} className="rounded-[14px] p-3.5 flex items-center gap-3 flex-1 text-left cursor-pointer hover:brightness-110 transition-all duration-200 w-full border-none"
              style={{...reviewItem, background: "rgba(255,255,255,0.03)"}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,.14)",color:"#A855F7"}}>🎯</div>
                <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Discover Your Level</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Find out what you already know</p></div>
                <span className="text-lg" style={{color:"var(--color-text-muted)"}}>›</span>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile: stacked layout */}
        <div className="lg:hidden space-y-3">
          <div className="rounded-[20px] p-5 flex flex-col gap-2" style={cardStyle}>
            <p className="text-[11px] font-semibold uppercase tracking-[.13em]" style={{ color: "var(--color-text-muted)" }}>Your Progress</p>
            <div className="flex flex-col items-center text-center gap-2">
              <ProgressRing pct={data.level_progress_pct} />
              <p className="text-base font-bold" style={{ color: "#fff" }}>{data.level_progress_pct===0?"Ready to begin":`${data.level_progress_pct}% complete`}</p>
              <button onClick={()=>router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{background:"transparent",color:"var(--color-accent-light)",border:"1px solid var(--color-accent)"}}>View Roadmap</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KpiCard icon="📘" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.level_progress_pct}%`} unit="" label="Level Progress"/>
            <KpiCard icon="🌿" iconBg="rgba(34,197,94,.14)" iconColor="#22C55E" value={`${data.weakest_words.length}`} unit="" label="Words in Review"/>
            <KpiCard icon="🧩" iconBg="rgba(168,85,247,.14)" iconColor="#A855F7" value={data.level_progress_pct > 0 ? "✓" : "—"} unit="" label="Grammar Topics"/>
            <KpiCard icon="🎯" iconBg="rgba(245,158,11,.14)" iconColor="#F59E0B" value={data.avg_quiz_score>0?`${data.avg_quiz_score}%`: "0%"} unit="" label="Quiz Accuracy"/>
            <KpiCard icon="🕒" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.cards_due_today}`} unit="" label="Cards to Review"/>
            <KpiCard icon="⏱" iconBg="rgba(56,189,248,.14)" iconColor="#38BDF8" value={data.continue_lesson ? `L${data.continue_lesson.unit}` : "—"} unit="" label="Current Unit"/>
          </div>
          <div className="rounded-[20px] p-3.5 flex flex-col gap-2.5" style={reviewWrap}>
            <p className="text-[11px] font-semibold uppercase tracking-[.13em]" style={{ color: "var(--color-text-muted)" }}>Review & Practice</p>
            <button onClick={() => router.push("/review")} className="rounded-[14px] p-3.5 flex items-center gap-3 text-left cursor-pointer hover:brightness-110 transition-all duration-200 w-full border-none"
              style={{...reviewItem, background: "rgba(255,255,255,0.03)"}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(245,158,11,.14)",color:"#F59E0B"}}>🃏</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Flashcards Complete</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Nothing due</p></div>
            </button>
            <button onClick={() => router.push("/curriculum")} className="rounded-[14px] p-3.5 flex items-center gap-3 text-left cursor-pointer hover:brightness-110 transition-all duration-200 w-full border-none"
              style={{...reviewItem, background: "rgba(255,255,255,0.03)"}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,.14)",color:"#A855F7"}}>🎯</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Discover Your Level</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Find out what you know</p></div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Activity + Tip side by side ─── */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-[20px] p-4 flex flex-col gap-3" style={cardStyle}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(59,130,246,.14)", color: "#3B82F6" }}>📋</div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Recent Activity</p>
          </div>
          <div className="text-center">
            <span className="text-3xl mb-3 block">🌱</span>
            <p className="text-sm font-semibold mb-1" style={{ color: "#fff" }}>Your journey begins</p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see activity here.</p>
            <button onClick={()=>router.push("/curriculum")} className="px-5 py-2 rounded-xl text-xs font-bold glossy-accent">Start Lesson →</button>
          </div>
        </div>
        <div className="rounded-[20px] relative overflow-hidden flex items-center p-4"
          style={{
            ...cardStyle,
            backgroundImage: "url('/tip.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          {/* Subtle dark overlay so text is legible */}
          <div className="absolute inset-0 pointer-events-none rounded-[20px]" style={{ background: "linear-gradient(135deg, rgba(3,2,12,0.72) 0%, rgba(3,2,12,0.30) 50%, rgba(3,2,12,0.35) 100%)" }} />
          <div className="relative z-10 flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(245,158,11,.14)", color: "#F59E0B" }}>💡</div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Tip of the Day</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Review before bed — sleep helps your brain consolidate new vocabulary.</p>
            <button onClick={()=>router.push("/curriculum")} className="text-xs font-medium hover:underline self-start" style={{ color: "var(--color-accent-light)" }}>Browse lessons →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
