"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ErrorState } from "@/components/ui/ErrorState";
import { GateScene } from "@/components/dashboard/GateScene";
import { ReadingArt } from "@/components/dashboard/ReadingArt";

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

// Shiny elevated card — for KPI and stat cells
const shinyCard: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 50%), #111127",
  border: "1px solid rgba(186, 120, 255, 0.22)",
  borderRadius: 16,
  boxShadow: "0 0 35px rgba(168,85,247,.08)",
};

// ═══════════════════════════════════════════════════════════════════
// HERO — Cinematic centerpiece with Brandenburg Gate at center
// ═══════════════════════════════════════════════════════════════════
function Hero() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-[20px] h-[250px] sm:h-[290px] lg:h-[310px]"
      style={{
        border: "1px solid rgba(123,63,251,0.15)",
        boxShadow: "0 0 80px rgba(123,63,251,0.12), 0 0 40px rgba(139,70,255,0.06), 0 4px 20px rgba(0,0,0,0.5)",
        background: "linear-gradient(170deg, #050420 0%, #0c062d 25%, #110940 55%, #0c062d 75%, #050420 100%)",
      }}>
      {/* 1. Stronger ambient purple — luminous, not black */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 58% 25%, rgba(139,70,255,0.22) 0%, transparent 45%), radial-gradient(ellipse at 60% 40%, rgba(162,75,255,0.14) 0%, transparent 40%), radial-gradient(ellipse at 75% 50%, rgba(123,63,251,0.1) 0%, transparent 35%), radial-gradient(ellipse at 35% 50%, rgba(139,70,255,0.08) 0%, transparent 35%), radial-gradient(ellipse at 55% 55%, rgba(213,108,255,0.06) 0%, transparent 30%)" }} />

      {/* Hand-built neon Brandenburg Gate scene (replaces /gate.png) */}
      <GateScene />

      {/* Light purple tint — barely tints, lets image dominate */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(50,15,100,0.25) 0%, rgba(30,8,60,0.15) 35%, rgba(20,5,50,0.1) 60%, rgba(50,15,100,0.2) 100%)" }} />
      {/* Edge darkening — left for text readability, right soft */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(4,4,20,0.6) 0%, rgba(4,4,20,0.15) 30%, transparent 55%, transparent 75%, rgba(4,4,20,0.15) 90%, rgba(4,4,20,0.5) 100%)" }} />
      {/* Bottom gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(4,4,20,0.55) 0%, transparent 45%)" }} />
      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 50px 15px rgba(0,0,0,0.35)" }} />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full w-full px-6 sm:px-8 lg:px-10">
        {/* 3. Left text — blends with purple atmosphere */}
        <div className="flex-1 max-w-[460px]">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(220,200,255,0.55)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>Welcome to DeutschFlow</p>
          <h2 className="text-[1.4rem] sm:text-[1.7rem] lg:text-[2.1rem] font-extrabold leading-[1.04] mb-2.5"
            style={{ color: "#fff", textShadow: "0 2px 12px rgba(80,40,160,0.6)" }}>
            Your{" "}
            <span style={{ background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "none" }}>German learning</span>
            <br />journey starts here
          </h2>
          <p className="text-[11px] sm:text-xs leading-relaxed max-w-sm"
            style={{ color: "rgba(200,180,240,0.5)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            Structured lessons, smart flashcards, and an AI tutor—everything you need to go from zero to fluent.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3.5 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>✓ Beginner-friendly</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>⏱ 10 min lessons</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>📚 80+ lessons</span>
          </div>
        </div>

        <div className="flex-1 hidden sm:block" />

        {/* 4+5. CTA — stronger glass, fuller button */}
        <div className="hidden lg:flex items-center rounded-2xl p-7 w-[290px] flex-shrink-0"
          style={{
            background: "rgba(10,14,30,0.28)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(123,63,251,0.25)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 40px rgba(123,63,251,0.1)",
          }}>
          <div className="w-full">
            <p className="text-base font-bold mb-2.5" style={{ color: "#fff" }}>Ready to begin?</p>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Start your first lesson and track your progress.</p>
            <button onClick={() => router.push("/curriculum")}
              className="w-full px-6 py-4 rounded-xl text-sm font-bold glossy-accent flex items-center justify-center gap-2">
              Start Your First Lesson
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function PlanCard({ icon, iconBg, iconColor, title, subtitle, footer, href }: {
  icon: string; iconBg: string; iconColor: string; title: string; subtitle: string; footer: string; href: string;
}) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(href)}
      className="text-left rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 w-full" style={cardStyle}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate" style={{ color: "#fff" }}>{title}</p>
          <p className="text-[13px] truncate" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
          <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: iconColor }}>{footer}</p>
        </div>
        <span className="text-lg flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>›</span>
      </div>
    </button>
  );
}

function KpiCard({ icon, iconBg, iconColor, value, unit, label }: {
  icon: string; iconBg: string; iconColor: string; value: string | number; unit: string; label: string;
}) {
  return (
    <div className="rounded-xl p-2.5 flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 50%), #111127", border: "1px solid rgba(186,120,255,0.18)", borderRadius: 14, boxShadow: "0 0 35px rgba(168,85,247,.06)" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-6 h-6 rounded-[7px] flex items-center justify-center text-xs" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <p className="text-[11px] uppercase tracking-[.06em] font-medium" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      </div>
      <p className="text-2xl font-bold leading-none" style={{ color: "#fff" }}>{value}<span className="text-sm ml-0.5" style={{ color: "var(--color-text-muted)" }}>{unit}</span></p>
    </div>
  );
}

function StatCell({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl p-3 transition-all duration-250 hover:-translate-y-0.5"
      style={{ background: "rgba(30, 20, 65, 0.45)", border: "1px solid rgba(190, 170, 240, 0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", backdropFilter: "blur(4px)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "rgba(139,70,255,0.15)", border: "1px solid rgba(190,170,240,0.12)" }}>{icon}</div>
        <p className="text-base font-bold" style={{ color: "#fff" }}>{value}</p>
      </div>
      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: "rgba(210,200,240,0.5)" }}>{label}</p>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r=44; const circ=2*Math.PI*r; const off=circ-(pct/100)*circ;
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs><linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899"/><stop offset="50%" stopColor="#d946ef"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#prg)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{transition:"stroke-dashoffset 1s ease",filter:"drop-shadow(0 0 6px rgba(123,63,251,0.3))"}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{color:"#fff"}}>{pct}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{color:"var(--color-text-muted)"}}>Complete</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (<div className="space-y-5"><div className="flex gap-4"><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded shimmer"/><div className="h-8 w-64 rounded shimmer"/></div><div className="flex gap-3">{[...Array(2)].map((_,i)=><div key={i} className="h-20 w-36 rounded-2xl shimmer"/>)}</div></div><div className="h-[290px] rounded-[20px] shimmer"/><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i)=><div key={i} className="h-32 rounded-2xl shimmer"/>)}</div><div className="h-72 rounded-2xl shimmer"/><div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i)=><div key={i} className="h-48 rounded-2xl shimmer"/>)}</div></div>);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<DashboardData>({ queryKey: ["dashboard"], queryFn: () => api.get("/dashboard") });
  if (isLoading) return <Skeleton />;
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
              <div className="h-full rounded-full" style={{width:`${data.level_progress_pct}%`,background:"linear-gradient(135deg,#ec4899,#d946ef,#8b5cf6)"}}/>
            </div>
            <p className="text-[10px] mt-1" style={{color:"var(--color-text-muted)"}}>120 / 300 XP to A2</p>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────── */}
      <Hero />

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
        <p className="text-sm font-medium uppercase tracking-[.13em] mb-2.5" style={{ color: "var(--color-text-muted)" }}>Your Progress</p>
        <div className="grid grid-cols-[260px_1fr_260px] gap-2 items-stretch hidden lg:grid">
          {/* Left: Progress ring card */}
          <div className="rounded-[20px] p-3.5 flex flex-col items-center text-center justify-center gap-1" style={cardStyle}>
            <ProgressRing pct={data.level_progress_pct} />
            <p className="text-base font-bold" style={{ color: "#fff" }}>{data.level_progress_pct===0?"Ready to begin":`${data.level_progress_pct}% complete`}</p>
            <p className="text-sm max-w-[210px]" style={{ color: "var(--color-text-muted)" }}>Start your first lesson to see your progress here.</p>
            <button onClick={()=>router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-1.5"
              style={{background:"transparent",color:"var(--color-accent-light)",border:"1px solid var(--color-accent)"}}>View Roadmap</button>
          </div>
          {/* Center: KPI Grid 3x2 */}
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            <KpiCard icon="📘" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/6)):0}`} unit="/ 80" label="Lessons Completed"/>
            <KpiCard icon="🌿" iconBg="rgba(34,197,94,.14)" iconColor="#22C55E" value={`${data.weakest_words.length>0?data.weakest_words.length*5:0}`} unit="" label="Vocabulary Learned"/>
            <KpiCard icon="🧩" iconBg="rgba(168,85,247,.14)" iconColor="#A855F7" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/12)):0}`} unit=" topics" label="Grammar Topics"/>
            <KpiCard icon="🎯" iconBg="rgba(245,158,11,.14)" iconColor="#F59E0B" value={data.avg_quiz_score>0?`${data.avg_quiz_score}%`: "0%"} unit="" label="Quiz Accuracy"/>
            <KpiCard icon="🕒" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.cards_due_today}`} unit="" label="Cards to Review"/>
            <KpiCard icon="⏱" iconBg="rgba(56,189,248,.14)" iconColor="#38BDF8" value={data.level_progress_pct>0?`${Math.max(1,Math.round(data.level_progress_pct/6)*10)}m`:"0m"} unit="" label="Study Time"/>
          </div>
          {/* Right: Review & Practice */}
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] p-4 flex items-center gap-3 flex-1" style={cardStyle}>
              <div className="iconbox w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(245,158,11,.14)",color:"#F59E0B"}}>🃏</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Flashcards Complete</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Nothing due — excellent work!</p></div>
              <span className="text-lg" style={{color:"var(--color-text-muted)"}}>›</span>
            </div>
            <div className="rounded-[20px] p-4 flex items-center gap-3 flex-1" style={cardStyle}>
              <div className="iconbox w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,.14)",color:"#A855F7"}}>🎯</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Discover Your Level</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Find out what you already know</p></div>
              <span className="text-lg" style={{color:"var(--color-text-muted)"}}>›</span>
            </div>
          </div>
        </div>
        {/* Mobile: stacked layout */}
        <div className="lg:hidden space-y-3">
          <div className="rounded-[20px] p-5 flex flex-col items-center text-center gap-2" style={cardStyle}>
            <ProgressRing pct={data.level_progress_pct} />
            <p className="text-base font-bold" style={{ color: "#fff" }}>{data.level_progress_pct===0?"Ready to begin":`${data.level_progress_pct}% complete`}</p>
            <button onClick={()=>router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{background:"transparent",color:"var(--color-accent-light)",border:"1px solid var(--color-accent)"}}>View Roadmap</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KpiCard icon="📘" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/6)):0}`} unit="/ 80" label="Lessons Completed"/>
            <KpiCard icon="🌿" iconBg="rgba(34,197,94,.14)" iconColor="#22C55E" value={`${data.weakest_words.length>0?data.weakest_words.length*5:0}`} unit="" label="Vocabulary Learned"/>
            <KpiCard icon="🧩" iconBg="rgba(168,85,247,.14)" iconColor="#A855F7" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/12)):0}`} unit=" topics" label="Grammar Topics"/>
            <KpiCard icon="🎯" iconBg="rgba(245,158,11,.14)" iconColor="#F59E0B" value={data.avg_quiz_score>0?`${data.avg_quiz_score}%`: "0%"} unit="" label="Quiz Accuracy"/>
            <KpiCard icon="🕒" iconBg="rgba(59,130,246,.14)" iconColor="#3B82F6" value={`${data.cards_due_today}`} unit="" label="Cards to Review"/>
            <KpiCard icon="⏱" iconBg="rgba(56,189,248,.14)" iconColor="#38BDF8" value={data.level_progress_pct>0?`${Math.max(1,Math.round(data.level_progress_pct/6)*10)}m`:"0m"} unit="" label="Study Time"/>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] p-4 flex items-center gap-3" style={cardStyle}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(245,158,11,.14)",color:"#F59E0B"}}>🃏</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Flashcards Complete</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Nothing due</p></div>
            </div>
            <div className="rounded-[20px] p-4 flex items-center gap-3" style={cardStyle}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(168,85,247,.14)",color:"#A855F7"}}>🎯</div>
              <div className="flex-1"><p className="text-[15px] font-semibold" style={{color:"#fff"}}>Discover Your Level</p><p className="text-xs mt-0.5" style={{color:"var(--color-text-muted)"}}>Find out what you know</p></div>
            </div>
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
        <div className="rounded-[20px] p-4 flex items-center gap-3" style={cardStyle}>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(245,158,11,.14)", color: "#F59E0B" }}>💡</div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Tip of the Day</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>Review before bed — sleep helps your brain consolidate new vocabulary.</p>
            <button onClick={()=>router.push("/curriculum")} className="text-xs font-medium hover:underline self-start" style={{ color: "var(--color-accent-light)" }}>Browse lessons →</button>
          </div>
          {/* Reading art — woman reading in bed at night */}
          <div className="hidden sm:block flex-shrink-0" aria-hidden="true">
            <ReadingArt />
          </div>
        </div>
      </div>
    </div>
  );
}
