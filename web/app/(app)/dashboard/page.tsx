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

// ── Hero ────────────────────────────────────────────────────
function Hero() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-[20px] h-[260px] sm:h-[280px] flex items-center"
      style={{ border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 40px rgba(123,63,251,0.1)" }}>
      {/* Layer 1: Deep space background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(170deg, #06061a 0%, #0c0828 20%, #140a40 40%, #1a0d50 55%, #140a40 70%, #0c0828 85%, #06061a 100%)" }} />
      {/* Layer 2: Nebula texture — scattered radial blobs */}
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(162,75,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 55% 60%, rgba(123,63,251,0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 45%, rgba(213,108,255,0.06) 0%, transparent 35%)" }} />

      {/* Layer 3: Large glowing moon */}
      <div className="absolute pointer-events-none" style={{ right: "22%", top: "8%", width: 140, height: 140 }}>
        {/* Outer glow */}
        <div className="absolute rounded-full" style={{ inset: -30, background: "radial-gradient(circle, rgba(213,108,255,0.15) 0%, rgba(162,75,255,0.06) 30%, transparent 60%)", filter: "blur(12px)" }} />
        {/* Moon body */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.08) 0%, rgba(213,108,255,0.06) 30%, rgba(162,75,255,0.04) 60%, rgba(123,63,251,0.02) 100%)" }} />
        {/* Bright core */}
        <div className="absolute rounded-full" style={{ left: "30%", top: "25%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)" }} />
      </div>

      {/* Layer 4: Volumetric light rays from moon */}
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{ background: "conic-gradient(from 200deg at 72% 20%, rgba(213,108,255,0.15) 0deg, transparent 60deg, rgba(162,75,255,0.08) 120deg, transparent 200deg, rgba(213,108,255,0.1) 280deg, transparent 360deg)" }} />

      {/* Layer 5: Twinkling stars — dense field */}
      {Array.from({length:35}).map((_,i) => {
        const x = (i*37+13)%100; const y = (i*53+7)%90;
        const size = i%4===0?2.5:i%7===0?1.5:1;
        const alpha = [0.2,0.35,0.25,0.5,0.3,0.4,0.2,0.15][i%8];
        return (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{ left:`${x}%`, top:`${y}%`, width:size, height:size, background:`rgba(255,255,255,${alpha})`,
              animation: `twinkle ${2+(i%4)}s ease-in-out ${i*0.25}s infinite` }} />
        );
      })}

      {/* Layer 6: Brandenburg Gate silhouette — right-aligned */}
      <div className="absolute right-0 bottom-0 w-[38%] h-[90%] pointer-events-none hidden sm:block" style={{ opacity: 0.12 }}>
        <svg viewBox="0 0 200 300" className="absolute right-0 bottom-0 h-[140%]" preserveAspectRatio="xMaxYMax slice">
          <defs><linearGradient id="gateGrad" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5"/><stop offset="40%" stopColor="#fff" stopOpacity="0.15"/><stop offset="100%" stopColor="#fff" stopOpacity="0.02"/></linearGradient></defs>
          <g stroke="url(#gateGrad)" strokeWidth="2.5" fill="none">
            <polygon points="12,50 100,-5 188,50" fill="rgba(255,255,255,0.02)"/>
            <line x1="8" y1="50" x2="192" y2="50" strokeWidth="3.5"/>
            <line x1="8" y1="145" x2="192" y2="145" strokeWidth="3.5"/>
            <line x1="16" y1="50" x2="16" y2="145"/><line x1="42" y1="50" x2="42" y2="145"/>
            <line x1="70" y1="50" x2="70" y2="145"/><line x1="96" y1="50" x2="96" y2="145"/>
            <line x1="104" y1="50" x2="104" y2="145"/><line x1="130" y1="50" x2="130" y2="145"/>
            <line x1="158" y1="50" x2="158" y2="145"/><line x1="184" y1="50" x2="184" y2="145"/>
            <rect x="72" y="72" width="56" height="73" fill="rgba(255,255,255,0.03)" stroke="none"/>
          </g>
        </svg>
      </div>

      {/* Layer 7: Atmospheric fog — purple mist at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(123,63,251,0.1) 0%, rgba(162,75,255,0.04) 40%, transparent 100%)" }} />
      {/* Fog right side behind gate */}
      <div className="absolute bottom-0 right-0 w-[45%] h-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 80%, rgba(162,75,255,0.08) 0%, transparent 60%)" }} />

      {/* Layer 8: Vignette — darkens edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.5), inset 0 0 30px 10px rgba(0,0,0,0.3)" }} />

      {/* Content + Glass CTA */}
      <div className="relative z-10 flex items-center w-full px-6 sm:px-10 lg:px-14">
        <div className="flex-1 max-w-xl">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>Welcome to DeutschFlow</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] mb-4" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            Your German learning<br />journey starts here
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.45)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
            Structured lessons, smart flashcards, and an AI tutor—everything you need to go from zero to fluent.
          </p>
          <div className="flex items-center gap-5 mt-5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span>✓ Beginner-friendly</span> <span className="opacity-30">|</span> <span>⏱ 10 min lessons</span> <span className="opacity-30">|</span> <span>📚 80+ lessons</span>
          </div>
        </div>
        {/* Glass CTA panel — stronger glass effect */}
        <div className="hidden lg:block ml-auto rounded-2xl p-6 w-[280px] flex-shrink-0"
          style={{
            background: "rgba(16,20,38,0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(123,63,251,0.08)",
          }}>
          <p className="text-base font-bold mb-1.5" style={{ color: "#fff" }}>Ready to begin?</p>
          <p className="text-xs mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>Start your first lesson and see your progress here.</p>
          <button onClick={() => router.push("/curriculum")}
            className="w-full px-6 py-3 rounded-xl text-sm font-bold glossy-accent flex items-center justify-center gap-2">
            Start Your First Lesson
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <style>{`@keyframes twinkle{0%,100%{opacity:0.15}50%{opacity:1}}`}</style>
    </div>
  );
}

// ── Plan Card ────────────────────────────────────────────────
function PlanCard({ icon, iconBg, title, subtitle, footer, href }: {
  icon: string; iconBg: string; title: string; subtitle: string; footer: string; href: string;
}) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(href)}
      className="text-left rounded-2xl p-5 transition-all duration-250 hover:-translate-y-1 w-full"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 30%), var(--color-card-bg)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: iconBg, border: "1px solid rgba(255,255,255,0.04)" }}>{icon}</div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>{title}</p>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>{footer}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

// ── Stat Cell ────────────────────────────────────────────────
function StatCell({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl p-4 transition-all duration-250 hover:-translate-y-1"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 30%), var(--color-card-alt)",
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3"
        style={{ background: "rgba(123,63,251,0.08)", border: "1px solid rgba(123,63,251,0.08)" }}>{icon}</div>
      <p className="text-lg font-bold mb-0.5" style={{ color: "var(--color-text)" }}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{label}</p>
    </div>
  );
}

// ── Progress Ring ────────────────────────────────────────────
function ProgressRing({ pct }: { pct: number }) {
  const r = 58; const circ = 2 * Math.PI * r; const off = circ - (pct / 100) * circ;
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
        <defs><linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7B3FFB" /><stop offset="100%" stopColor="#A24BFF" /></linearGradient></defs>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="url(#prg)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 8px rgba(123,63,251,0.3))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: "#fff" }}>{pct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--color-text-muted)" }}>Complete</span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() { return (<div className="space-y-6"><div className="flex gap-4"><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded shimmer" /><div className="h-8 w-64 rounded shimmer" /></div><div className="flex gap-3">{[...Array(2)].map((_,i)=><div key={i} className="h-20 w-36 rounded-2xl shimmer" />)}</div></div><div className="h-[220px] rounded-[20px] shimmer" /><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[...Array(3)].map((_,i)=><div key={i} className="h-32 rounded-2xl shimmer" />)}</div><div className="h-80 rounded-2xl shimmer" /><div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i)=><div key={i} className="h-56 rounded-2xl shimmer" />)}</div></div>); }

// ── Main ──────────────────────────────────────────────────────
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
    <div className="space-y-5 sm:space-y-6 pb-4 dashboard-shell" style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* ── Greeting + Stats ───────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>{formatDate()}</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--color-text)" }}>{greeting.hi}, {firstName}! 👋</h1>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>Kleine Schritte jeden Tag, große Fortschritte fürs Leben.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="rounded-2xl p-4 flex items-center gap-3 min-w-[140px]"
            style={{ background: "var(--color-card-elevated)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <span className="text-2xl">🔥</span>
            <div><p className="text-xl font-bold" style={{ color: "#fff" }}>{data.streak}</p><p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Day Streak</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{data.streak > 0 ? "Keep going!" : "Start today!"}</p></div>
          </div>
          <div className="rounded-2xl p-4 flex flex-col justify-center min-w-[160px]"
            style={{ background: "var(--color-card-elevated)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Current Level</p>
            <div className="flex items-center gap-2 mb-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>A1</span><span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>A1 Beginner</span></div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}><div className="h-full rounded-full" style={{ width: `${data.level_progress_pct}%`, background: "var(--color-accent-gradient)" }} /></div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-muted)" }}>120 / 300 XP to A2</p>
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────── */}
      <Hero />

      {/* ── Today's Plan ──────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>Today's Plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PlanCard icon="📖" iconBg="rgba(77,163,255,0.1)" title="Your First Lesson" subtitle="Greetings & Introductions" footer="10 min · Beginner-friendly" href={data.continue_lesson ? `/curriculum/${data.continue_lesson.level.toLowerCase()}/${data.continue_lesson.id}` : "/curriculum"} />
          <PlanCard icon="Aa" iconBg="rgba(162,75,255,0.1)" title="German Grammar" subtitle="Understand how sentences work" footer="Start with articles & pronouns" href="/grammar" />
          <PlanCard icon="🗣️" iconBg="rgba(45,229,115,0.1)" title="Practice Speaking" subtitle="Chat with Emma — your AI coach" footer="No experience needed" href="/chat" />
        </div>
      </div>

      {/* ── Your Progress ─────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>Your Progress</p>
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-8">
            <ProgressRing pct={data.level_progress_pct} />
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>{data.level_progress_pct === 0 ? "Ready to begin" : `${data.level_progress_pct}% complete`}</p>
              <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>Start your first lesson to see your progress here.</p>
              <button onClick={() => router.push("/curriculum")} className="px-5 py-2 rounded-xl text-sm font-medium transition-all" style={{ background: "transparent", color: "var(--color-accent-light)", border: "1px solid var(--color-accent)" }}>View Roadmap</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCell icon="📖" value={`${data.level_progress_pct > 0 ? Math.max(1, Math.round(data.level_progress_pct / 6)) : 0} / 80`} label="Lessons Completed" />
            <StatCell icon="📝" value={`${data.weakest_words.length > 0 ? data.weakest_words.length * 5 : 0} words`} label="Vocabulary Learned" />
            <StatCell icon="📖" value={`${data.level_progress_pct > 0 ? Math.max(1, Math.round(data.level_progress_pct / 10)) : 0} topics`} label="Grammar Topics" />
            <StatCell icon="✅" value={`${data.avg_quiz_score > 0 ? data.avg_quiz_score : 0}%`} label="Quiz Accuracy" />
            <StatCell icon="🃏" value={`${data.cards_due_today} cards`} label="Cards to Review" />
            <StatCell icon="⏱" value={`${data.level_progress_pct > 0 ? Math.max(1, Math.round(data.level_progress_pct / 6) * 10) : 0}m`} label="Study Time" />
          </div>
        </div>
      </div>

      {/* ── Review + Activity ─────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Review & Practice</p>
          <div className="flex items-center gap-3 group cursor-pointer"><div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,63,251,0.1)" }}>🃏</div><div className="flex-1"><p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Flashcards Complete</p><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Nothing due — excellent work!</p></div><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></div>
          <div className="flex items-center gap-3 group cursor-pointer"><div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(46,213,115,0.1)" }}>🎯</div><div className="flex-1"><p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Discover Your Level</p><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Find out what you already know</p></div><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></div>
        </div>
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>Recent Activity</p>
          <div className="text-center py-6"><span className="text-3xl mb-3 block">🌱</span><p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>Your journey begins</p><p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>Complete your first lesson to see activity here.</p>
            <button onClick={() => router.push("/curriculum")} className="px-5 py-2.5 rounded-xl text-sm font-bold glossy-accent">Start Lesson &rarr;</button></div>
        </div>
      </div>

      {/* ── Tip of the Day ────────────────── */}
      <div className="rounded-2xl p-5 sm:p-6 flex items-center gap-6 relative overflow-hidden" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-muted)" }}>Tip of the Day</p>
          <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>Review before bed — sleep helps your brain consolidate new vocabulary.</p>
          <button onClick={() => router.push("/curriculum")} className="text-xs font-medium hover:underline" style={{ color: "var(--color-accent-light)" }}>Browse lessons →</button>
        </div>
        <div className="hidden sm:block flex-shrink-0" style={{ width: 80, height: 80 }}>
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="10" y="50" width="60" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
            <rect x="14" y="42" width="16" height="10" rx="5" fill="rgba(162,75,255,0.15)" />
            <rect x="30" y="38" width="38" height="16" rx="8" fill="rgba(123,63,251,0.1)" />
            <circle cx="26" cy="28" r="10" fill="rgba(255,255,255,0.08)" />
            <rect x="28" y="30" width="16" height="12" rx="2" fill="rgba(162,75,255,0.2)" transform="rotate(-5 36 36)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
