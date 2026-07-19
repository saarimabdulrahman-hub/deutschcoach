"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ReviewSidebar } from "@/components/review/ReviewSidebar";
import type { DashboardData } from "@/types";

interface SRSStatsData {
  new: number; learning: number; reviewing: number; mastered: number;
  total_due_today: number;
}

const SECTION_INFO: Record<string, { title: string; desc: string }> = {
  "spaced-repetition": { title: "Spaced Repetition", desc: "The SM-2 algorithm optimises your review schedule so you remember more in less time." },
  flashcards: { title: "Flashcards", desc: "Review due flashcards and reinforce your vocabulary." },
  mistakes: { title: "Mistakes", desc: "Words you've missed before — review them to strengthen your memory." },
  "weak-words": { title: "Weak Words", desc: "Your most challenging vocabulary, prioritised for review." },
  bookmarks: { title: "Bookmarks", desc: "Saved words and exercises for quick access." },
};

export default function ReviewSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const info = SECTION_INFO[slug] || { title: slug, desc: "" };

  const { data: stats, isLoading } = useQuery<SRSStatsData>({
    queryKey: ["srs-stats"], queryFn: () => api.get("/srs/stats"), staleTime: 30_000,
  });

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  const streak = dash?.streak ?? 0;
  const total = stats ? stats.new + stats.learning + stats.reviewing + stats.mastered : 0;
  const retention = total > 0 ? Math.round((stats!.mastered / total) * 100) : 0;

  return (
    <div className="flex" style={{ gap: 0, margin: "0 -24px", minHeight: "calc(100vh - 72px)" }}>
      <ReviewSidebar activeItem={slug} streak={streak} />
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "#080611" }}>
        <div className="max-w-4xl space-y-6 pb-8">
          {/* ── SPACED REPETITION ── */}
          {slug === "spaced-repetition" && (
            <>
              {/* Header with icon, title + due badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0, marginTop: "4px" }}>
                    <path d="M5 6L14 9V22L5 19V6Z" fill="#A855F7" opacity="0.85"/>
                    <path d="M14 9L23 6V19L14 22V9Z" fill="#A855F7" opacity="0.65"/>
                    <path d="M14 9V22" stroke="rgba(255,255,255,.2)" strokeWidth="0.8"/>
                  </svg>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#FFF", margin: 0, lineHeight: 1.1 }}>Spaced Repetition</h1>
                    <p style={{ fontSize: "13px", color: "#B3B4C8", margin: "2px 0 0" }}>Smart review system that helps you remember better, for longer.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full px-4 py-2 flex-shrink-0" style={{ background: "rgba(168,85,247,.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "none", boxShadow: "0 0 20px rgba(168,85,247,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#C084FC" strokeWidth="1.2" fill="none"/><path d="M7 4.5V7l2 2" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#C084FC" }}>0 due today</span>
                </div>
              </div>

              {/* Hero Banner with bg image */}
              <div className="relative flex items-center overflow-hidden" style={{ borderRadius: "24px", minHeight: "220px", background: `url('/sr-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.04)" }}>
                {/* Left text */}
                <div className="px-8 py-6" style={{ flex: "0.45 1 0%", position: "relative", zIndex: 2 }}>
                  <h2 style={{ fontSize: "36px", fontWeight: 600, color: "#FFF", margin: 0, lineHeight: 1.1 }}>You&apos;re all set!</h2>
                  <p style={{ fontSize: "14px", color: "#B3B4C8", marginTop: "8px", lineHeight: 1.5, maxWidth: "280px" }}>Great job keeping up with your reviews.</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,.3)", marginTop: "4px" }}>Consistency is the key to fluency.</p>
                </div>
                {/* Center: brain is in the bg image */}
                <div style={{ flex: "0.55 1 0%" }} />
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-4 gap-5">
                {[
                  {
                    icon: <span style={{ fontSize: "48px", filter: "drop-shadow(0 0 14px rgba(249,115,22,.5))" }}>🔥</span>,
                    value: `${dash?.streak ?? 0}`, label: "DAY STREAK", desc: "Keep it going!", valueColor: "#FFF",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 16px rgba(157,77,255,.15)" }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="#9D4DFF" strokeWidth="2" fill="none"/><path d="M14 8v6l4 3" stroke="#9D4DFF" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>,
                    value: `${stats?.mastered ?? 0}`, label: "CARDS MASTERED", desc: "Words you know", valueColor: "#F6F6FA",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#221635" }}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,.04)" strokeWidth="3" fill="none"/>
                        <circle cx="16" cy="16" r="13" stroke="url(#ringG)" strokeWidth="3" fill="none" strokeDasharray={`${0.92 * 82} 82`} strokeLinecap="round" transform="rotate(-90 16 16)"/>
                        <defs><linearGradient id="ringG" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#EC4BAF"/><stop offset="50%" stopColor="#B13EFF"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
                      </svg>
                    </div>,
                    value: `${retention}%`, label: "RETENTION RATE", desc: "Excellent!", valueColor: "#F6F6FA",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 16px rgba(164,107,255,.12)" }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="20" rx="2" stroke="#A46BFF" strokeWidth="1.8" fill="none"/><line x1="3" y1="9" x2="25" y2="9" stroke="#A46BFF" strokeWidth="1.8"/></svg>
                    </div>,
                    value: "12", label: "LONGEST STREAK", desc: "days", valueColor: "#F6F6FA",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-start gap-4 p-5" style={{ borderRadius: "20px", background: "#151220", border: "1px solid rgba(168,85,247,.12)" }}>
                    <span style={{ filter: `drop-shadow(0 0 6px rgba(157,77,255,.2))` }}>{stat.icon}</span>
                    <div>
                      <p style={{ fontSize: "34px", fontWeight: 700, color: stat.valueColor, margin: 0, lineHeight: 1.1 }}>{stat.value}</p>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "#B14BFF", margin: "2px 0 0", letterSpacing: "0.5px" }}>{stat.label}</p>
                      <p style={{ fontSize: "12px", color: "#A0A0B5", margin: "4px 0 0" }}>{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Queue + How It Works (side by side) */}
              <div className="flex gap-5">
                {/* Review Queue (takes ~70%) */}
                <div className="flex-1 rounded-[20px] overflow-hidden" style={{ background: "#1B1730", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div className="flex items-center justify-between px-5 py-4">
                    <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#FFF", margin: 0 }}>Review Queue</h2>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)", color: "#FFF" }}>Study All</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.06)" }}>Filter</button>
                    </div>
                  </div>
                  <div className="px-5 py-2 flex items-center gap-3 text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,.25)", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ width: "24px" }} /><span className="flex-shrink-0" style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(168,85,247,.15)", background: "rgba(168,85,247,.04)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🔊</span>
                    <span style={{ flex: 1 }}>German Word</span>
                    <span style={{ flex: 1 }}>Translation</span>
                    <span style={{ width: "80px" }}>Next Review</span>
                    <span style={{ width: "60px", textAlign: "center" }}>Interval</span>
                    <span style={{ width: "60px", textAlign: "center" }}>Ease</span>
                    <span style={{ width: "20px" }} />
                  </div>
                  {[
                    { word: "der Fortschritt", trans: "progress", review: "Due now", interval: "1 day", ease: "Hard", easeColor: "#EF4444" },
                    { word: "die Gelegenheit", trans: "opportunity", review: "Due now", interval: "1 day", ease: "Medium", easeColor: "#F59E0B" },
                    { word: "entwickeln", trans: "develop", review: "Due now", interval: "1 day", ease: "Hard", easeColor: "#EF4444" },
                    { word: "Herausforderung", trans: "challenge", review: "Due now", interval: "1 day", ease: "Medium", easeColor: "#F59E0B" },
                    { word: "Veränderung", trans: "change", review: "Tomorrow", interval: "2 days", ease: "Easy", easeColor: "#22C55E" },
                  ].map((row, i) => (
                    <div key={i} className="px-5 flex items-center gap-3 text-sm" style={{ height: "68px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
                      <span className="flex-shrink-0" style={{ width: "18px", height: "18px", borderRadius: "4px", border: "1.5px solid rgba(168,85,247,.25)", background: "rgba(168,85,247,.05)", cursor: "pointer", display: "inline-block" }} />
                      <span className="flex-shrink-0" style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(168,85,247,.15)", background: "rgba(168,85,247,.04)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}>🔊</span>
                      <span style={{ flex: 1, color: "#FFF", fontWeight: 500 }}>{row.word}</span>
                      <span style={{ flex: 1, color: "#A8A4BC" }}>{row.trans}</span>
                      <span style={{ width: "80px", color: row.review === "Due now" ? "#EF4444" : "#A8A4BC", fontSize: "12px" }}>{row.review}</span>
                      <span style={{ width: "60px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,.4)" }}>{row.interval}</span>
                      <span style={{ width: "60px", textAlign: "center", fontSize: "11px", padding: "2px 8px", borderRadius: "999px", color: row.easeColor, background: `${row.easeColor}15` }}>{row.ease}</span>
                      <span style={{ width: "20px", color: "rgba(255,255,255,.2)" }}>⋮</span>
                    </div>
                  ))}
                </div>

                {/* How It Works — slim card (~30%) */}
                <div className="rounded-[20px] p-5 flex flex-col" style={{ width: "260px", background: "#1B1730", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ fontSize: "16px" }}>🎓</span>
                    <h2 style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: 0 }}>How It Works</h2>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    <svg style={{ position: "absolute", width: 0, height: 0 }}>
                      <defs>
                        <linearGradient id="numShine" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
                          <stop offset="18%" stopColor="#f9a8d4" stopOpacity="0.5"/>
                          <stop offset="45%" stopColor="#d946ef" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.12"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    {[
                      { num: "1", title: "Learn", desc: "New words introduced at optimal intervals." },
                      { num: "2", title: "Review", desc: "Recall words actively to strengthen memory." },
                      { num: "3", title: "Remember", desc: "Spaced repetition moves to long-term memory." },
                    ].map((step) => (
                      <div key={step.num} className="flex gap-3">
                        <div className="flex-shrink-0 relative" style={{ width: "38px", height: "38px" }}>
                          <svg width="38" height="38" viewBox="0 0 38 38" className="absolute inset-0">
                            <circle cx="19" cy="19" r="18" fill="none" stroke="url(#numShine)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 4px rgba(217,70,239,0.35))" }} />
                            <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center" style={{ color: "#A855F7", fontSize: "13px", fontWeight: 700 }}>
                            {step.num}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", margin: 0 }}>{step.title}</p>
                          <p style={{ fontSize: "11px", color: "#A8A4BC", margin: "2px 0 0", lineHeight: 1.3 }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pro Tip */}
                  <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.1)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ fontSize: "12px" }}>💡</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#FFF" }}>Pro Tip</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#A8A4BC", margin: 0, lineHeight: 1.3, paddingLeft: "20px" }}>Review daily — even 5 minutes helps.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {slug === "flashcards" && (
            <>
              {/* ── Hero Banner ── */}
              <div className="relative flex items-center overflow-hidden rounded-[20px]" style={{ minHeight: "220px", background: "linear-gradient(135deg, #171228, #1B1730)", border: "1px solid rgba(168,85,247,.08)" }}>
                <div className="px-8 py-6" style={{ flex: "0.35 1 0%", position: "relative", zIndex: 2 }}>
                  <div className="flex items-center justify-center" style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 20px rgba(139,92,246,.2)", marginBottom: "12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#8B5CF6" strokeWidth="1.8" fill="none"/><line x1="8" y1="7" x2="16" y2="7" stroke="#8B5CF6" strokeWidth="1.8"/><line x1="8" y1="12" x2="14" y2="12" stroke="#8B5CF6" strokeWidth="1.8"/></svg>
                  </div>
                  <h1 style={{ fontSize: "46px", fontWeight: 700, color: "#FFF", margin: 0, lineHeight: 1 }}>Flashcard Review</h1>
                  <p style={{ fontSize: "16px", color: "#A8A4BC", margin: "8px 0 0", lineHeight: 1.5 }}>Head to the Overview page to review your due cards.</p>
                </div>
                {/* Right: floating flashcards illustration */}
                <div className="flex-1 relative flex items-center justify-center" style={{ minHeight: "220px" }}>
                  <div style={{ position: "relative", width: "180px", height: "160px" }}>
                    {/* Orbit ring */}
                    <div className="absolute inset-4 rounded-full" style={{ border: "1.5px solid rgba(139,92,246,.12)" }} />
                    <div className="absolute inset-8 rounded-full" style={{ border: "1.5px solid rgba(236,73,153,.08)" }} />
                    {/* Floating cards */}
                    <div className="absolute" style={{ width: "80px", height: "56px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(139,92,246,.2), rgba(139,92,246,.06))", border: "1px solid rgba(139,92,246,.2)", transform: "rotate(-12deg)", left: "15%", top: "25%", backdropFilter: "blur(4px)" }}>
                      <span style={{ position: "absolute", top: "12px", left: "10px", fontSize: "8px", color: "rgba(139,92,246,.6)", fontWeight: 700 }}>A</span>
                    </div>
                    <div className="absolute" style={{ width: "80px", height: "56px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(236,73,153,.15), rgba(236,73,153,.04))", border: "1px solid rgba(236,73,153,.2)", transform: "rotate(8deg)", right: "15%", top: "30%", backdropFilter: "blur(4px)" }}>
                      <span style={{ position: "absolute", top: "12px", left: "10px", fontSize: "8px", color: "rgba(236,73,153,.6)", fontWeight: 700 }}>B</span>
                    </div>
                    {/* Ground glow */}
                    <div className="absolute" style={{ bottom: "-10%", left: "10%", right: "10%", height: "30px", background: "radial-gradient(ellipse, rgba(139,92,246,.12), transparent)", borderRadius: "50%" }} />
                    {/* Particles */}
                    <span className="absolute" style={{ top: "10%", right: "5%", width: "3px", height: "3px", borderRadius: "50%", background: "#C084FC", boxShadow: "0 0 6px rgba(192,132,252,.5)" }} />
                    <span className="absolute" style={{ bottom: "20%", left: "5%", width: "3px", height: "3px", borderRadius: "50%", background: "#EC4899", boxShadow: "0 0 4px rgba(236,73,153,.4)" }} />
                  </div>
                </div>
              </div>

              {/* ── Quick Start ── */}
              <div className="grid grid-cols-3 gap-5">
                {[
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#FFF" strokeWidth="1.8" fill="none"/><path d="M10 8l6 4-6 4V8z" fill="#FFF"/></svg>, title: "Review Due Cards", desc: "Continue where you left off", color: "#8B5CF6" },
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#FFF" strokeWidth="1.8" fill="none"/><rect x="7" y="5" width="10" height="2" rx="0.5" fill="#FFF"/></svg>, title: "Browse Decks", desc: "Explore all your decks", color: "#EC4899" },
                  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="#FFF" strokeWidth="1.8" fill="none"/></svg>, title: "Create New Deck", desc: "Add your own flashcards", color: "#C026D3" },
                ].map((card) => (
                  <button key={card.title} className="flex items-center gap-4 p-5 rounded-[18px] border-none cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: "#161322", border: "1px solid rgba(255,255,255,.04)" }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${card.color}15` }}>
                      {card.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ fontSize: "15px", fontWeight: 500, color: "#FFF", margin: 0 }}>{card.title}</p>
                      <p style={{ fontSize: "13px", color: "#A8A4BC", margin: "2px 0 0" }}>{card.desc}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>

              {/* ── Recently Studied ── */}
              <div className="rounded-[20px] overflow-hidden" style={{ background: "#161322", border: "1px solid rgba(255,255,255,.05)" }}>
                <div className="flex items-center justify-between px-6 py-4">
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#FFF", margin: 0 }}>Recently Studied</h2>
                  <button className="text-xs border-none cursor-pointer" style={{ color: "#8B5CF6", background: "none" }}>View all decks →</button>
                </div>
                {/* Table */}
                <div className="px-6 py-2 flex items-center gap-4 text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,.2)", borderTop: "1px solid rgba(255,255,255,.04)" }}>
                  <span style={{ width: "24px" }} />
                  <span style={{ flex: 1 }}>Deck Info</span>
                  <span style={{ width: "60px", textAlign: "center" }}>Cards</span>
                  <span style={{ width: "60px", textAlign: "center" }}>Mastery</span>
                  <span style={{ width: "80px", textAlign: "center" }}>Last Studied</span>
                  <span style={{ width: "20px" }} />
                </div>
                {[
                  { badge: "A1", badgeColor: "#22C55E", title: "A1 Beginner Essentials", sub: "Basic words and phrases", cards: "128", mastery: "92%", masteryColor: "#22C55E", last: "Today" },
                  { badge: "A2", badgeColor: "#60A5FA", title: "A2 Everyday German", sub: "Common expressions", cards: "96", mastery: "87%", masteryColor: "#22C55E", last: "Yesterday" },
                  { badge: "B1", badgeColor: "#8B5CF6", title: "B1 Intermediate", sub: "Complex conversations", cards: "72", mastery: "79%", masteryColor: "#FACC15", last: "2 days ago" },
                  { badge: "★", badgeColor: "#FACC15", title: "Favorites", sub: "Bookmarked flashcards", cards: "34", mastery: "94%", masteryColor: "#22C55E", last: "Today" },
                ].map((row, i) => (
                  <div key={i} className="px-6 flex items-center gap-4 text-sm" style={{ height: "72px", borderTop: "1px solid rgba(255,255,255,.04)", cursor: "pointer" }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "28px", height: "28px", borderRadius: "50%", background: `${row.badgeColor}15`, color: row.badgeColor, fontSize: "10px", fontWeight: 700 }}>{row.badge}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: 0 }}>{row.title}</p>
                      <p style={{ fontSize: "12px", color: "#A8A4BC", margin: "2px 0 0" }}>{row.sub}</p>
                    </div>
                    <span style={{ width: "60px", textAlign: "center", fontSize: "14px", color: "#FFF", fontWeight: 500 }}>{row.cards}</span>
                    <span style={{ width: "60px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: row.masteryColor }}>{row.mastery}</span>
                    <span style={{ width: "80px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,.4)" }}>{row.last}</span>
                    <span style={{ width: "20px", color: "rgba(255,255,255,.2)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>⋮</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {slug === "mistakes" && (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
              <p style={{ fontSize: "36px", marginBottom: "12px" }}>✖</p>
              <p style={{ fontSize: "14px", color: "#FFF", fontWeight: 600, margin: 0 }}>Mistakes Review</p>
              <p style={{ fontSize: "12px", color: "#A8A4BC", margin: "4px 0 0" }}>Review words you've previously missed to improve retention.</p>
            </div>
          )}

          {slug === "weak-words" && (
            <div className="rounded-2xl p-5" style={{ background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFF", margin: "0 0 12px" }}>Your Weak Words</p>
              {dash?.weakest_words?.length ? (
                <div className="space-y-2">
                  {dash.weakest_words.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(16,18,32,.5)", border: "1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>{w.german}</span>
                      <span style={{ fontSize: "12px", color: "#A8A4BC" }}>{w.english} · {w.lapses}× missed</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "#A8A4BC", margin: 0, textAlign: "center", padding: "20px" }}>No weak words — great work!</p>
              )}
            </div>
          )}

          {slug === "bookmarks" && (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#141629", border: "1px solid rgba(255,255,255,.05)" }}>
              <p style={{ fontSize: "36px", marginBottom: "12px" }}>🔖</p>
              <p style={{ fontSize: "14px", color: "#FFF", fontWeight: 600, margin: 0 }}>Bookmarks</p>
              <p style={{ fontSize: "12px", color: "#A8A4BC", margin: "4px 0 0" }}>Your saved words and exercises will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
