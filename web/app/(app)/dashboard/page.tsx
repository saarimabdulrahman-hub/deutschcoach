"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ErrorState } from "@/components/ui/ErrorState";

const GREETINGS = [
  { hi: "Guten Morgen", en: "Good morning" },
  { hi: "Guten Tag", en: "Good afternoon" },
  { hi: "Guten Abend", en: "Good evening" },
];
function getGreeting() { const h = new Date().getHours(); return h < 12 ? GREETINGS[0] : h < 18 ? GREETINGS[1] : GREETINGS[2]; }
function formatDate() { return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase(); }

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, transparent 70%), var(--color-card-bg)",
  border: "1px solid rgba(190, 170, 240, 0.15)",
  borderRadius: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3), 0 1px 0 0 rgba(255,255,255,0.04) inset",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

// ═══════════════════════════════════════════════════════════════════
// HERO — Cinematic centerpiece with Brandenburg Gate at center
// ═══════════════════════════════════════════════════════════════════
function Hero() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-[20px] h-[190px] sm:h-[210px]"
      style={{
        border: "1px solid rgba(123,63,251,0.15)",
        boxShadow: "0 0 80px rgba(123,63,251,0.12), 0 0 40px rgba(139,70,255,0.06), 0 4px 20px rgba(0,0,0,0.5)",
        background: "linear-gradient(170deg, #050420 0%, #0c062d 25%, #110940 55%, #0c062d 75%, #050420 100%)",
      }}>
      {/* 1. Stronger ambient purple — luminous, not black */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 58% 25%, rgba(139,70,255,0.22) 0%, transparent 45%), radial-gradient(ellipse at 60% 40%, rgba(162,75,255,0.14) 0%, transparent 40%), radial-gradient(ellipse at 75% 50%, rgba(123,63,251,0.1) 0%, transparent 35%), radial-gradient(ellipse at 35% 50%, rgba(139,70,255,0.08) 0%, transparent 35%), radial-gradient(ellipse at 55% 55%, rgba(213,108,255,0.06) 0%, transparent 30%)" }} />

      {/* 7. Planet/moon — follows gate position */}
      <div className="absolute pointer-events-none" style={{ left:"58%",top:"10%",width:100,height:100,transform:"translateX(-50%)" }}>
        <div className="absolute rounded-full" style={{ inset:-30,background:"radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(213,180,255,0.08) 20%, transparent 55%)",filter:"blur(12px)" }} />
        <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle at 55% 40%, rgba(255,255,255,0.06) 0%, rgba(200,170,255,0.03) 35%, transparent 65%)" }} />
      </div>

      {/* Gate image — fills width, gate visible in center-right */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/gate.png?v=2')",
          backgroundSize: "85% auto",
          backgroundPosition: "58% 35%",
          backgroundRepeat: "no-repeat",
        }} />

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
            Your German learning<br />journey starts here
          </h2>
          <p className="text-[11px] sm:text-xs leading-relaxed max-w-sm"
            style={{ color: "rgba(200,180,240,0.5)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            Structured lessons, smart flashcards, and an AI tutor—everything you need to go from zero to fluent.
          </p>
          <div className="flex items-center gap-5 mt-3 text-[10px] sm:text-[11px]"
            style={{ color: "rgba(180,160,220,0.4)" }}>
            <span>✓ Beginner-friendly</span><span className="opacity-25">|</span>
            <span>⏱ 10 min lessons</span><span className="opacity-25">|</span>
            <span>📚 80+ lessons</span>
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

function PlanCard({ icon, iconBg, title, subtitle, footer, href }: {
  icon: string; iconBg: string; title: string; subtitle: string; footer: string; href: string;
}) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(href)}
      className="text-left rounded-2xl p-5 transition-all duration-250 hover:-translate-y-1 w-full" style={cardStyle}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: iconBg, border: "1px solid rgba(255,255,255,0.04)" }}>{icon}</div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>{title}</p>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>{footer}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

function StatCell({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl p-3 transition-all duration-250 hover:-translate-y-0.5"
      style={{ background: "rgba(20, 15, 50, 0.4)", border: "1px solid rgba(180, 160, 230, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", backdropFilter: "blur(2px)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(180,160,230,0.1)" }}>{icon}</div>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>{value}</p>
      </div>
      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{label}</p>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r=58; const circ=2*Math.PI*r; const off=circ-(pct/100)*circ;
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
        <defs><linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7B3FFB"/><stop offset="100%" stopColor="#A24BFF"/></linearGradient></defs>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke="url(#prg)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{transition:"stroke-dashoffset 1s ease",filter:"drop-shadow(0 0 8px rgba(123,63,251,0.3))"}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{color:"#fff"}}>{pct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{color:"var(--color-text-muted)"}}>Complete</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (<div className="space-y-5"><div className="flex gap-4"><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded shimmer"/><div className="h-8 w-64 rounded shimmer"/></div><div className="flex gap-3">{[...Array(2)].map((_,i)=><div key={i} className="h-20 w-36 rounded-2xl shimmer"/>)}</div></div><div className="h-[270px] rounded-[20px] shimmer"/><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i)=><div key={i} className="h-32 rounded-2xl shimmer"/>)}</div><div className="h-72 rounded-2xl shimmer"/><div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i)=><div key={i} className="h-48 rounded-2xl shimmer"/>)}</div></div>);
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
    <div className="space-y-4 pb-4 dashboard-shell" style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* ── Greeting + Stats ───────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{formatDate()}</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--color-text)" }}>{greeting.hi}, {firstName}! 👋</h1>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>Kleine Schritte jeden Tag, große Fortschritte fürs Leben.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="rounded-2xl p-4 flex items-center gap-3 min-w-[140px]" style={cardStyle}>
            <span className="text-2xl">🔥</span>
            <div><p className="text-xl font-bold" style={{ color: "#fff" }}>{data.streak}</p><p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Day Streak</p><p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{data.streak>0?"Keep going!":"Start today!"}</p></div>
          </div>
          <div className="rounded-2xl p-4 flex flex-col justify-center min-w-[160px]" style={cardStyle}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Current Level</p>
            <div className="flex items-center gap-2 mb-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>A1</span><span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>A1 Beginner</span></div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}><div className="h-full rounded-full" style={{ width: `${data.level_progress_pct}%`, background: "var(--color-accent-gradient)" }}/></div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-muted)" }}>120 / 300 XP to A2</p>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────── */}
      <Hero />

      {/* ── Today's Plan ──────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>Today's Plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PlanCard icon="📖" iconBg="rgba(77,163,255,0.1)" title="Your First Lesson" subtitle="Greetings & Introductions" footer="10 min · Beginner-friendly"
            href={data.continue_lesson ? `/curriculum/${data.continue_lesson.level.toLowerCase()}/${data.continue_lesson.id}` : "/curriculum"} />
          <PlanCard icon="Aa" iconBg="rgba(162,75,255,0.1)" title="German Grammar" subtitle="Understand how sentences work" footer="Start with articles & pronouns" href="/grammar" />
          <PlanCard icon="🗣️" iconBg="rgba(45,229,115,0.1)" title="Practice Speaking" subtitle="Chat with Emma — your AI coach" footer="No experience needed" href="/chat" />
        </div>
      </div>

      {/* ── Your Progress ─────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>Your Progress</p>
        <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6" style={cardStyle}>
          <ProgressRing pct={data.level_progress_pct} />
          <div className="flex-1 w-full">
            <div className="text-center sm:text-left mb-5">
              <p className="text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>{data.level_progress_pct===0?"Ready to begin":`${data.level_progress_pct}% complete`}</p>
              <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>Start your first lesson to see your progress here.</p>
              <button onClick={()=>router.push("/curriculum")} className="px-5 py-2 rounded-xl text-sm font-medium transition-all" style={{background:"transparent",color:"var(--color-accent-light)",border:"1px solid var(--color-accent)"}}>View Roadmap</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <StatCell icon="📖" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/6)):0} / 80`} label="Lessons Completed"/>
              <StatCell icon="📝" value={`${data.weakest_words.length>0?data.weakest_words.length*5:0} words`} label="Vocabulary Learned"/>
              <StatCell icon="📖" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/10)):0} topics`} label="Grammar Topics"/>
              <StatCell icon="✅" value={`${data.avg_quiz_score>0?data.avg_quiz_score:0}%`} label="Quiz Accuracy"/>
              <StatCell icon="🃏" value={`${data.cards_due_today} cards`} label="Cards to Review"/>
              <StatCell icon="⏱" value={`${data.level_progress_pct>0?Math.max(1,Math.round(data.level_progress_pct/6)*10):0}m`} label="Study Time"/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Review + Activity ─────────────── */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={cardStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Review & Practice</p>
          <div className="flex items-center gap-3 group cursor-pointer"><div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,63,251,0.1)" }}>🃏</div><div className="flex-1"><p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Flashcards Complete</p><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Nothing due — excellent work!</p></div><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg></div>
          <div className="flex items-center gap-3 group cursor-pointer"><div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(46,213,115,0.1)" }}>🎯</div><div className="flex-1"><p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Discover Your Level</p><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Find out what you already know</p></div><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg></div>
        </div>
        <div className="rounded-2xl p-5 sm:p-6 text-center" style={cardStyle}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4 text-left" style={{ color: "var(--color-text-muted)" }}>Recent Activity</p>
          <span className="text-4xl mb-4 block">🌱</span>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>Your journey begins</p>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see activity here.</p>
          <button onClick={()=>router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-bold glossy-accent">Start Lesson →</button>
        </div>
      </div>

      {/* ── Tip of the Day ────────────────── */}
      <div className="rounded-2xl p-5 sm:p-6 flex items-center gap-6" style={cardStyle}>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>Tip of the Day</p>
          <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>Review before bed — sleep helps your brain consolidate new vocabulary.</p>
          <button onClick={()=>router.push("/curriculum")} className="text-xs font-medium hover:underline" style={{ color: "var(--color-accent-light)" }}>Browse lessons →</button>
        </div>
        <div className="hidden sm:block flex-shrink-0" style={{ width: 80, height: 80 }}>
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="10" y="50" width="60" height="6" rx="3" fill="rgba(255,255,255,0.06)"/>
            <rect x="14" y="42" width="16" height="10" rx="5" fill="rgba(162,75,255,0.15)"/>
            <rect x="30" y="38" width="38" height="16" rx="8" fill="rgba(123,63,251,0.1)"/>
            <circle cx="26" cy="28" r="10" fill="rgba(255,255,255,0.08)"/>
            <rect x="28" y="30" width="16" height="12" rx="2" fill="rgba(162,75,255,0.2)" transform="rotate(-5 36 36)"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
