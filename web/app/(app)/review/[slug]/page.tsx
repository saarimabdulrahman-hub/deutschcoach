"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ReviewSidebar } from "@/components/review/ReviewSidebar";
import type { DashboardData, SRSCardOut } from "@/types";
import {
  HOW_IT_WORKS_STEPS,
  FLASHCARD_QUICK_START,
  WEAK_WORD_STATS,
} from "@/lib/reviewConfig";

function easeLabel(ef: number): { label: string; color: string } {
  if (ef >= 2.5) return { label: "Easy", color: "#22C55E" };
  if (ef >= 2.0) return { label: "Medium", color: "#F59E0B" };
  return { label: "Hard", color: "#EF4444" };
}

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
  const router = useRouter();
  const slug = params.slug as string;
  const info = SECTION_INFO[slug] || { title: slug, desc: "" };

  const { data: stats, isLoading } = useQuery<SRSStatsData>({
    queryKey: ["srs-stats"], queryFn: () => api.get("/srs/stats"), staleTime: 30_000,
  });

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  const { data: dueCards } = useQuery<SRSCardOut[]>({
    queryKey: ["srs-due"], queryFn: () => api.get("/srs/due"), staleTime: 30_000,
  });

  const { data: bookmarks } = useQuery<{ id: number; german: string; english: string; notes: string | null; created_at: string; updated_at: string }[]>({
    queryKey: ["bookmarks"], queryFn: () => api.get("/user/bookmarks"), staleTime: 30_000,
  });

  const { data: mistakes } = useQuery<{ vocab_id: number; german: string; english: string; miss_count: number; lapses: number; status: string; user_answer?: string; correct_answer?: string }[]>({
    queryKey: ["quiz-mistakes"], queryFn: () => api.get("/quiz/mistakes"), staleTime: 30_000,
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [mistakeFilter, setMistakeFilter] = useState<string>("All");
  const [mistakeSort, setMistakeSort] = useState<string>("Recent");
  const [sortOpen, setSortOpen] = useState(false);

  const PRO_TIPS = [
    "Review daily — even 5 minutes helps.",
    "The SM-2 algorithm spaces reviews optimally: harder cards appear more often, easier ones less.",
    "Sleep after reviewing — your brain consolidates memories during deep sleep.",
    "Say words out loud during review — multi-sensory learning improves retention by 40%.",
    "Review your weakest words first thing in the morning when your mind is fresh.",
    "Don't skip days — consistency beats cramming for long-term memory.",
    "Use example sentences to remember words in context, not just translations.",
  ];

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % PRO_TIPS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [PRO_TIPS.length]);

  const streak = dash?.streak ?? 0;
  const total = stats ? stats.new + stats.learning + stats.reviewing + stats.mastered : 0;
  const retention = total > 0 ? Math.round((stats!.mastered / total) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row" style={{ gap: 0, margin: "0 -24px", minHeight: "calc(100vh - 72px)" }}>
      <ReviewSidebar activeItem={slug} streak={streak} />
      <div className="flex-1 overflow-y-auto p-6" style={{ background: "#080611" }}>
        <div className="max-w-4xl space-y-6 pb-8">
          {/* ── SPACED REPETITION ── */}
          {slug === "spaced-repetition" && (
            <>
              {/* Header with icon, title + due badge */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 h-full">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0, marginTop: "4px" }}>
                    <path d="M5 6L14 9V22L5 19V6Z" fill="#A855F7" opacity="0.85"/>
                    <path d="M14 9L23 6V19L14 22V9Z" fill="#A855F7" opacity="0.65"/>
                    <path d="M14 9V22" stroke="rgba(255,255,255,.2)" strokeWidth="0.8"/>
                  </svg>
                  <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.1 }}>Spaced Repetition</h1>
                    <p style={{ fontSize: "13px", color: "#B3B4C8", margin: "2px 0 0" }}>Smart review system that helps you remember better, for longer.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full px-4 py-2 flex-shrink-0" style={{ background: "rgba(168,85,247,.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "none", boxShadow: "0 0 20px rgba(168,85,247,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#C084FC" strokeWidth="1.2" fill="none"/><path d="M7 4.5V7l2 2" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#C084FC" }}>{stats?.total_due_today ?? 0} due today</span>
                </div>
              </div>

              {/* Hero Banner with bg image */}
              <div className="relative flex items-center overflow-hidden" style={{ borderRadius: "24px", minHeight: "220px", background: `url('/sr-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.04)" }}>
                {/* Left text */}
                <div className="px-8 py-6" style={{ flex: "0.45 1 0%", position: "relative", zIndex: 2 }}>
                  <h2 style={{ fontSize: "36px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.1 }}>You&apos;re all set!</h2>
                  <p style={{ fontSize: "14px", color: "#B3B4C8", marginTop: "8px", lineHeight: 1.5, maxWidth: "280px" }}>Great job keeping up with your reviews.</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,.3)", marginTop: "4px" }}>Consistency is the key to fluency.</p>
                </div>
                {/* Center: brain is in the bg image */}
                <div style={{ flex: "0.55 1 0%" }} />
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5">
                {[
                  {
                    icon: <span style={{ fontSize: "48px", filter: "drop-shadow(0 0 14px rgba(249,115,22,.5))" }}>🔥</span>,
                    value: `${dash?.streak ?? 0}`, label: "DAY STREAK", desc: "Keep it going!", valueColor: "#FFF",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="#9D4DFF" strokeWidth="2" fill="none"/><path d="M14 8v6l4 3" stroke="#9D4DFF" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>,
                    value: `${stats?.mastered ?? 0}`, label: "CARDS MASTERED", desc: "Words you know", valueColor: "#F6F6FA",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)", background: "#221635" }}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,.04)" strokeWidth="3" fill="none"/>
                        <circle cx="16" cy="16" r="13" stroke="url(#ringG)" strokeWidth="3" fill="none" strokeDasharray={`${(retention / 100) * 82} 82`} strokeLinecap="round" transform="rotate(-90 16 16)"/>
                        <defs><linearGradient id="ringG" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#EC4BAF"/><stop offset="50%" stopColor="#B13EFF"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
                      </svg>
                    </div>,
                    value: `${retention}%`, label: "RETENTION RATE", desc: retention >= 80 ? "Excellent!" : "Keep going!", valueColor: "#F6F6FA",
                  },
                  {
                    icon: <div className="flex items-center justify-center" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="4" width="22" height="20" rx="2" stroke="#A46BFF" strokeWidth="1.8" fill="none"/><line x1="3" y1="9" x2="25" y2="9" stroke="#A46BFF" strokeWidth="1.8"/></svg>
                    </div>,
                    value: `${dash?.streak ?? 0}`, label: "LONGEST STREAK", desc: "days", valueColor: "#F6F6FA",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-start gap-4 p-5" style={{ borderRadius: "20px", background: "#151220", border: "1px solid rgba(168,85,247,.12)" }}>
                    <span style={{ filter: `drop-shadow(0 0 6px rgba(157,77,255,.2))` }}>{stat.icon}</span>
                    <div>
                      <p style={{ fontSize: "34px", fontWeight: 500, color: stat.valueColor, margin: 0, lineHeight: 1.1 }}>{stat.value}</p>
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
                      <button onClick={() => router.push("/review")} className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)", color: "#FFF" }}>Study All</button>
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setFilterOpen(!filterOpen)} className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer flex items-center gap-1" style={{ background: filterOpen ? "rgba(168,85,247,.15)" : "rgba(255,255,255,.05)", color: filterOpen ? "#C084FC" : "rgba(255,255,255,.5)", border: `1px solid ${filterOpen ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.06)"}` }}>
                          Filter: {activeFilter} ▾
                        </button>
                        {filterOpen && (
                          <div className="absolute right-0 mt-1 rounded-xl py-1 z-50" style={{ minWidth: "140px", background: "#1B1730", border: "1px solid rgba(168,85,247,.2)", boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
                            {["All", "New", "Learning", "Reviewing", "Hard", "Medium", "Easy"].map((f) => (
                              <button key={f} onClick={() => { setActiveFilter(f); setFilterOpen(false); }}
                                className="w-full text-left px-4 py-2 text-xs border-none cursor-pointer hover:bg-white/5 transition-colors"
                                style={{ background: activeFilter === f ? "rgba(168,85,247,.1)" : "transparent", color: activeFilter === f ? "#C084FC" : "rgba(255,255,255,.6)" }}>
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                  {(dueCards?.length ? dueCards.filter((card) => {
                    if (activeFilter === "All") return true;
                    if (activeFilter === "Hard" || activeFilter === "Medium" || activeFilter === "Easy") {
                      return easeLabel(card.easiness_factor).label === activeFilter;
                    }
                    return card.status.toLowerCase() === activeFilter.toLowerCase();
                  }) : []).map((card, i) => {
                    const ease = easeLabel(card.easiness_factor);
                    const isDue = card.interval_days <= 0 ? "Due now" : "Later";
                    return (
                    <div key={card.id} className="px-5 flex items-center gap-3 text-sm" style={{ height: "68px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
                      <span className="flex-shrink-0" style={{ width: "18px", height: "18px", borderRadius: "4px", border: "1.5px solid rgba(168,85,247,.25)", background: "rgba(168,85,247,.05)", cursor: "pointer", display: "inline-block" }} />
                      <span className="flex-shrink-0" style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid rgba(168,85,247,.15)", background: "rgba(168,85,247,.04)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}>🔊</span>
                      <span style={{ flex: 1, color: "#FFF", fontWeight: 500 }}>{card.vocab_entry?.german ?? "—"}</span>
                      <span style={{ flex: 1, color: "#A8A4BC" }}>{card.vocab_entry?.english ?? "—"}</span>
                      <span style={{ width: "80px", color: isDue === "Due now" ? "#EF4444" : "#A8A4BC", fontSize: "12px" }}>{isDue}</span>
                      <span style={{ width: "60px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,.4)" }}>{card.interval_days}d</span>
                      <span style={{ width: "60px", textAlign: "center", fontSize: "11px", padding: "2px 8px", borderRadius: "999px", color: ease.color, background: `${ease.color}15` }}>{ease.label}</span>
                      <span style={{ width: "20px", color: "rgba(255,255,255,.2)" }}>⋮</span>
                    </div>
                    );
                  })}
                </div>

                {/* How It Works — slim card (~30%) */}
                <div className="rounded-[20px] p-5 flex flex-col" style={{ width: "260px", background: "#1B1730", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span style={{ fontSize: "16px" }}>🎓</span>
                    <h2 style={{ fontSize: "14px", fontWeight: 400, color: "#FFF", margin: 0 }}>How It Works</h2>
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
                    {HOW_IT_WORKS_STEPS.map((step) => (
                      <div key={step.num} className="flex gap-3">
                        <div className="flex-shrink-0 relative" style={{ width: "38px", height: "38px" }}>
                          <svg width="38" height="38" viewBox="0 0 38 38" className="absolute inset-0">
                            <circle cx="19" cy="19" r="18" fill="none" stroke="url(#numShine)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 4px rgba(217,70,239,0.35))" }} />
                            <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center" style={{ color: "#A855F7", fontSize: "13px", fontWeight: 500 }}>
                            {step.num}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: 0 }}>{step.title}</p>
                          <p style={{ fontSize: "11px", color: "#A8A4BC", margin: "2px 0 0", lineHeight: 1.3 }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pro Tip */}
                  <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.1)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ fontSize: "12px" }}>💡</span>
                      <span style={{ fontSize: "11px", fontWeight: 500, color: "#FFF" }}>Pro Tip</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#A8A4BC", margin: 0, lineHeight: 1.3, paddingLeft: "20px", transition: "opacity 0.5s ease" }}>{PRO_TIPS[tipIndex]}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {slug === "flashcards" && (
            <>
              {/* ── Hero Banner ── */}
              <div className="relative flex items-center overflow-hidden rounded-[20px]" style={{ minHeight: "220px", background: `url('/flashcards-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.04)" }}>
                <div className="px-8 py-6" style={{ flex: "0.35 1 0%", position: "relative", zIndex: 2 }}>
                  <div className="flex items-center justify-center" style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 20px rgba(139,92,246,.2)", marginBottom: "12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#8B5CF6" strokeWidth="1.8" fill="none"/><line x1="8" y1="7" x2="16" y2="7" stroke="#8B5CF6" strokeWidth="1.8"/><line x1="8" y1="12" x2="14" y2="12" stroke="#8B5CF6" strokeWidth="1.8"/></svg>
                  </div>
                  <h1 style={{ fontSize: "46px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1 }}>Flashcard Review</h1>
                  <p style={{ fontSize: "16px", color: "#A8A4BC", margin: "8px 0 0", lineHeight: 1.5 }}>Head to the Overview page to review your due cards.</p>
                </div>
                <div className="flex-1 relative" style={{ minHeight: "220px" }} />
              </div>

              {/* ── Quick Start ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-5">
                {FLASHCARD_QUICK_START.map((card) => (
                  <button key={card.title} className="flex items-center gap-4 p-5 rounded-[18px] border-none cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: "#161322", border: "1px solid rgba(255,255,255,.04)" }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${card.color}08`, backdropFilter: "blur(8px)", border: `1px solid ${card.color}20` }}>
                      <span style={{ fontSize: "20px" }}>{card.emoji}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ fontSize: "15px", fontWeight: 400, color: "#FFF", margin: 0 }}>{card.title}</p>
                      <p style={{ fontSize: "13px", color: "#A8A4BC", margin: "2px 0 0" }}>{card.desc}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>

              {/* ── Recently Studied ── */}
              <div className="flex items-center justify-between mb-3">
                <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#FFF", margin: 0 }}>Recently Studied</h2>
                <button onClick={() => router.push("/review/flashcards")} className="text-xs border-none cursor-pointer" style={{ color: "#8B5CF6", background: "none" }}>View all decks →</button>
              </div>
              <div className="rounded-[20px] overflow-hidden" style={{ background: "#161322", border: "1px solid rgba(255,255,255,.05)" }}>
                {(() => {
                  const decks = [
                    ...(dash?.continue_lesson ? [{
                      badge: dash.continue_lesson.level, badgeColor: "#22C55E",
                      title: dash.continue_lesson.title, sub: `Unit ${dash.continue_lesson.unit}`,
                      cards: "—", mastery: `${dash.continue_lesson.progress_pct}%`, masteryColor: "#22C55E" as string, last: "In progress",
                    }] : []),
                    ...(dash?.weakest_words?.length ? [{
                      badge: "SRS", badgeColor: "#8B5CF6",
                      title: "Spaced Repetition", sub: `${dash.cards_due_today} cards due`,
                      cards: `${dash.cards_due_today}`, mastery: `${dash.avg_quiz_score}%`, masteryColor: dash.avg_quiz_score >= 80 ? "#22C55E" as string : "#FACC15" as string, last: "Now",
                    }] : []),
                  ];

                  if (decks.length === 0) {
                    return (
                      <div style={{ padding: "40px 24px", textAlign: "center" }}>
                        <p style={{ fontSize: "14px", color: "#FFF", margin: "0 0 4px" }}>No decks yet</p>
                        <p style={{ fontSize: "12px", color: "#A8A4BC", margin: 0 }}>Complete your first lesson to see your study history here.</p>
                      </div>
                    );
                  }

                  return decks.map((row, i) => (
                  <div key={i} className="px-6 flex items-center gap-4 text-sm" style={{ height: "72px", borderTop: i > 0 ? "1px solid rgba(255,255,255,.04)" : "none", cursor: "pointer" }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${row.badgeColor}15`, border: `1.5px solid ${row.badgeColor}30`, color: row.badgeColor, fontSize: "12px", fontWeight: 500 }}>{row.badge}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 400, color: "#FFF", margin: 0 }}>{row.title}</p>
                      <p style={{ fontSize: "12px", color: "#A8A4BC", margin: "2px 0 0" }}>{row.sub}</p>
                    </div>
                    <span style={{ width: "60px", textAlign: "center", fontSize: "14px", color: "#FFF", fontWeight: 400 }}>{row.cards}</span>
                    <span style={{ width: "60px", textAlign: "center", fontSize: "14px", fontWeight: 500, color: row.masteryColor }}>{row.mastery}</span>
                    <span style={{ width: "80px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,.4)" }}>{row.last}</span>
                  </div>
                  ));
                })()}
              </div>
            </>
          )}

          {slug === "mistakes" && (
            <>
              {/* ── Hero Banner ── */}
              <div className="relative flex items-center overflow-hidden rounded-[20px]" style={{ minHeight: "220px", background: `url('/mistakes-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.04)" }}>
                <div className="px-8 py-6" style={{ flex: "0.55 1 0%", position: "relative", zIndex: 2 }}>
                  <div className="flex items-center justify-center" style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#221635", boxShadow: "0 0 20px rgba(139,92,246,.2)", marginBottom: "12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#EC4899" strokeWidth="1.5" fill="none"/><path d="M9 9l6 6M15 9l-6 6" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <h1 style={{ fontSize: "42px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1 }}>Mistakes Review</h1>
                  <p style={{ fontSize: "15px", color: "#A8A4BC", margin: "8px 0 0", lineHeight: 1.5 }}>Review words you've previously missed to improve retention.</p>
                </div>
                <div className="flex-1 relative" style={{ minHeight: "220px" }} />
              </div>

              {/* ── Statistics Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5">
                {[
                  { value: mistakes?.length ?? 0, label: "Total Mistakes", desc: "Unique words missed", color: "#8B5CF6", pct: 60 },
                  { value: mistakes?.filter(m => m.lapses > 2).length ?? 0, label: "Needs Review", desc: "High priority words", color: "#EC4899", pct: 40 },
                  { value: `${dash?.avg_quiz_score ?? 0}%`, label: "Retention Impact", desc: "Avg quiz accuracy", color: "#8B5CF6", pct: (dash?.avg_quiz_score ?? 0) },
                  { value: dash?.streak ?? 0, label: "Day Streak", desc: "Review streak", color: "#EC4899", pct: Math.min(100, (dash?.streak ?? 0) * 10) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[18px] p-4 relative overflow-hidden" style={{ background: "#16162A", border: "1px solid rgba(255,255,255,.04)" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center justify-center" style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${stat.color}12` }}>
                        <span style={{ color: stat.color, fontSize: "20px" }}>●</span>
                      </div>
                      <span style={{ fontSize: "24px", fontWeight: 500, color: "#FFF", lineHeight: 1 }}>{stat.value}</span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "#FFF", margin: "4px 0 0" }}>{stat.label}</p>
                    <p style={{ fontSize: "10px", color: "#A8A4BC", margin: "2px 0 0" }}>{stat.desc}</p>
                    {/* Progress bar */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgba(255,255,255,.04)" }}>
                      <div style={{ width: `${stat.pct}%`, height: "100%", background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Filter Row ── */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {["All", "High Priority", "Medium", "Low"].map((f) => {
                    const isActive = mistakeFilter === f;
                    return (
                    <button key={f} onClick={() => setMistakeFilter(f)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border-none cursor-pointer transition-all"
                      style={{ background: isActive ? "linear-gradient(135deg, #8B5CF6, #EC4899)" : "rgba(255,255,255,.04)", color: isActive ? "#FFF" : "rgba(255,255,255,.4)" }}>{f}</button>
                    );
                  })}
                </div>
                <div style={{ position: "relative" }}>
                  <div onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    style={{ background: sortOpen ? "rgba(168,85,247,.1)" : "rgba(255,255,255,.04)", border: `1px solid ${sortOpen ? "rgba(168,85,247,.3)" : "rgba(255,255,255,.06)"}`, color: "rgba(255,255,255,.5)" }}>
                    Sort: {mistakeSort} <span style={{ marginLeft: "4px" }}>▾</span>
                  </div>
                  {sortOpen && (
                    <div className="absolute right-0 mt-1 rounded-xl py-1 z-50" style={{ minWidth: "140px", background: "#1B1730", border: "1px solid rgba(168,85,247,.2)", boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
                      {["Recent", "Most Missed", "Least Missed"].map((s) => (
                        <button key={s} onClick={() => { setMistakeSort(s); setSortOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs border-none cursor-pointer hover:bg-white/5 transition-colors"
                          style={{ background: mistakeSort === s ? "rgba(168,85,247,.1)" : "transparent", color: mistakeSort === s ? "#C084FC" : "rgba(255,255,255,.6)" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Mistake Table ── */}
              <div className="rounded-[20px] overflow-hidden" style={{ background: "#16162A", border: "1px solid rgba(255,255,255,.05)" }}>
                {(() => {
                  const filtered = mistakes?.length ? mistakes
                    .filter((m) => {
                      if (mistakeFilter === "All") return true;
                      if (mistakeFilter === "High Priority") return m.lapses > 2;
                      if (mistakeFilter === "Medium") return m.lapses >= 1 && m.lapses <= 2;
                      if (mistakeFilter === "Low") return m.lapses === 0;
                      return true;
                    })
                    .sort((a, b) => {
                      if (mistakeSort === "Most Missed") return b.miss_count - a.miss_count;
                      if (mistakeSort === "Least Missed") return a.miss_count - b.miss_count;
                      return 0;
                    }) : [];

                  if (filtered.length === 0) {
                    return (
                      <div style={{ padding: "48px 24px", textAlign: "center" }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display: "block", margin: "0 auto 12px" }}>
                          <circle cx="24" cy="24" r="22" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.4" />
                          <circle cx="24" cy="24" r="18" stroke="#A855F7" strokeWidth="1" fill="none" opacity="0.25" strokeDasharray="4 6" />
                          <path d="M24 14v12M24 30v1" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        </svg>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: "0 0 4px" }}>
                          {!mistakes || mistakes.length === 0 ? "No mistakes yet!" : "No results for this filter"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#A8A4BC", margin: 0 }}>
                          {!mistakes || mistakes.length === 0 ? "Take a quiz to start tracking your progress." : "Try a different filter."}
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((m, i) => {
                    const priority = m.lapses > 2 ? "#EC4899" : m.lapses > 0 ? "#F59E0B" : "#22C55E";
                    return (
                  <div key={m.vocab_id} className="flex items-center gap-4 px-5" style={{ height: "80px", borderTop: i > 0 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                    <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: priority, boxShadow: `0 0 6px ${priority}50`, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: 0 }}>{m.german}</p>
                        <p style={{ fontSize: "12px", color: "#A8A4BC", margin: "2px 0 0" }}>{m.english}</p>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", margin: "0 0 2px" }}>You wrote:</p>
                      <p style={{ fontSize: "13px", color: "#EC4899", textDecoration: "line-through", margin: 0 }}>{m.user_answer || "—"}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", margin: "0 0 2px" }}>Correct:</p>
                      <p style={{ fontSize: "13px", color: "#22C55E", margin: 0 }}>{m.correct_answer || m.german}</p>
                    </div>
                    <span style={{ width: "80px", fontSize: "12px", color: "rgba(255,255,255,.3)" }}>{m.miss_count} miss{m.miss_count !== 1 ? "es" : ""}</span>
                    <button onClick={() => router.push("/review")} className="px-4 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "linear-gradient(90deg, #8B5CF6, #EC4899)", color: "#FFF", boxShadow: "0 0 12px rgba(139,92,246,.2)" }}>Review</button>
                    <span style={{ color: "rgba(255,255,255,.2)", cursor: "pointer", fontSize: "18px" }}>⋮</span>
                  </div>
                    );
                  });
                })()}
              </div>
            </>
          )}

          {slug === "weak-words" && (
            <>
              {/* ── Page Header ── */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 h-full">
                  <div className="flex items-center justify-center" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.15)", boxShadow: "0 0 10px rgba(168,85,247,.08)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l6 4-6 4V3z" fill="#A855F7"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "18px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>Weak Words</p>
                    <p style={{ fontSize: "12px", color: "#A1A1AA", margin: "1px 0 0" }}>Smart analysis of vocabulary that needs reinforcement.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(16,18,32,.7)", border: "1px solid rgba(74,222,128,.2)", height: "28px" }}>
                  <span style={{ fontSize: "10px", color: "#22C55E" }}>●</span>
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "#FFF" }}>0 weak words</span>
                </div>
              </div>

              {/* ── Hero Banner (bg image + text overlay) ── */}
              <div className="relative overflow-hidden" style={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,.04)", height: "210px" }}>
                <img src="/weakwords-hero.png" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="absolute inset-0 flex items-end pb-7 px-8" style={{ zIndex: 2 }}>
                  <div style={{ width: "35%" }}>
                    {(() => {
                      const wc = dash?.weakest_words?.length ?? 0;
                      const h2 = wc === 0 ? "Great job!" : wc <= 2 ? "Almost there!" : "Keep practicing!";
                      const sub = wc === 0 ? "No weak words found" : `${wc} weak word${wc !== 1 ? "s" : ""} found`;
                      const desc = wc === 0 ? "Your memory is performing exceptionally well."
                        : wc <= 2 ? "Just a few words need a little more practice."
                        : "Focus on these words to strengthen your vocabulary.";
                      return (<>
                    <h2 style={{ fontSize: "34px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.1 }}>{h2}</h2>
                    <p style={{ fontSize: "24px", fontWeight: 500, color: wc === 0 ? "#A855F7" : "#F59E0B", margin: "8px 0 0" }}>{sub}</p>
                    <p style={{ fontSize: "15px", color: "#B7B8C4", margin: "10px 0 0", lineHeight: 1.4, maxWidth: "280px" }}>{desc}</p>
                      </>);
                    })()}
                  </div>
                </div>
              </div>

              {/* ── KPI STATISTICS ROW ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
                {/* Card 1 — Memory Accuracy */}
                <div className="rounded-[16px] p-4" style={{ height: "110px", background: "linear-gradient(180deg, #18162E, #121426)", border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
                  <div className="flex items-center gap-3 h-full">
                    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: "60px", height: "60px", borderRadius: "50%", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <circle cx="30" cy="30" r="23" stroke="#2A2840" strokeWidth="5" fill="none"/>
                        <circle cx="30" cy="30" r="23" stroke="url(#memG)" strokeWidth="5" fill="none" strokeDasharray={`${((dash?.avg_quiz_score ?? 0) / 100) * 144.5} 144.5`} strokeLinecap="round" transform="rotate(-90 30 30)" filter="url(#memGlow)"/>
                        <defs><linearGradient id="memG" x1="0" y1="0" x2="60" y2="60"><stop offset="0%" stopColor="#D946EF"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
                      </svg>
                      <span style={{ position: "absolute", fontSize: "11px", fontWeight: 600, color: "#FFF" }}>{dash?.avg_quiz_score ?? 0}%</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "22px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{dash?.avg_quiz_score ?? 0}%</p>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "2px 0 0" }}>Memory Accuracy</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>Avg quiz score</p>
                    </div>
                  </div>
                </div>
                {/* Card 2 — Mastered Words */}
                <div className="rounded-[16px] p-4" style={{ height: "110px", background: "linear-gradient(180deg, #18162E, #121426)", border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
                  <div className="flex items-center gap-3 h-full">
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #5B2E16, #7A431D)", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="starGrad" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#FFD35C"/><stop offset="100%" stopColor="#F59E0B"/></linearGradient></defs><path d="M12 2l2.5 6.5H21l-5.5 4.5 2 7L12 15l-5.5 5 2-7L3 8.5h6.5L12 2z" fill="url(#starGrad)" filter="url(#sG)"/><defs><filter id="sG"><feGaussianBlur stdDeviation="0.5"/></filter></defs></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: "22px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{stats?.mastered ?? 0}</p>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "2px 0 0" }}>Mastered Words</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>Vocabulary retained</p>
                    </div>
                  </div>
                </div>
                {/* Card 3 — Strong Words */}
                <div className="rounded-[16px] p-4" style={{ height: "110px", background: "linear-gradient(180deg, #18162E, #121426)", border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
                  <div className="flex items-center gap-3 h-full">
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#31124B", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3l7 4.5v5.5l-7 5-7-5V7.5l7-4.5z" stroke="#B86EFF" strokeWidth="1.5" fill="none"/><path d="M8 11.5l2 2 4-4" stroke="#B86EFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: "22px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{Math.max(0, (stats?.mastered ?? 0) - (dash?.weakest_words?.length ?? 0))}</p>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "2px 0 0" }}>Strong Words</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>Never forgotten</p>
                    </div>
                  </div>
                </div>
                {/* Card 4 — Learning Confidence */}
                <div className="rounded-[16px] p-4" style={{ height: "110px", background: "linear-gradient(180deg, #18162E, #121426)", border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
                  <div className="flex items-center gap-3 h-full">
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #4D1D88, #7C3AED)", boxShadow: "0 0 24px #A855F7, 0 0 50px rgba(168,85,247,.3)" }}>
                      <svg width="22" height="24" viewBox="0 0 22 24" fill="none"><defs><linearGradient id="lGrad" x1="0" y1="0" x2="22" y2="24"><stop offset="0%" stopColor="#F4C8FF"/><stop offset="100%" stopColor="#D946EF"/></linearGradient></defs><path d="M12 2L4 13h6l-1 9 9-12h-6l1-8z" fill="url(#lGrad)" filter="url(#lG)"/><defs><filter id="lG"><feGaussianBlur stdDeviation="0.5"/></filter></defs></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: "20px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{(dash?.avg_quiz_score ?? 0) >= 85 ? "Excellent" : (dash?.avg_quiz_score ?? 0) >= 70 ? "Good" : (dash?.avg_quiz_score ?? 0) >= 50 ? "Fair" : "Growing"}</p>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "2px 0 0" }}>Learning Confidence</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "1px 0 0" }}>Based on quiz scores</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ANALYTICS ROW (40/60) ── */}
              <div className="flex gap-3">
                {/* Memory Distribution (40%) */}
                <div className="rounded-[16px] p-6" style={{ width: "40%", background: "linear-gradient(180deg, #16142B, #111322)", border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "#FFF", margin: "0 0 18px" }}>Memory Distribution</p>
                  <div className="flex items-center gap-6">
                    {(() => {
                      const totalCards = (stats?.new ?? 0) + (stats?.learning ?? 0) + (stats?.reviewing ?? 0) + (stats?.mastered ?? 0);
                      const strongPct = totalCards > 0 ? Math.round((stats?.mastered ?? 0) / totalCards * 100) : 0;
                      const normalPct = totalCards > 0 ? Math.round((stats?.learning ?? 0) / totalCards * 100) : 0;
                      const reviewPct = totalCards > 0 ? 100 - strongPct - normalPct : 0;
                      const circ = 2 * Math.PI * 45;
                      const dashStrong = (strongPct / 100) * circ;
                      const dashNormal = (normalPct / 100) * circ;
                      const dashReview = (reviewPct / 100) * circ;
                      const rotNormal = -90 + (strongPct / 100) * 360;
                      const rotReview = rotNormal + (normalPct / 100) * 360;
                      const items = [
                        { color: "#22C55E", label: "Strong Memory", pct: `${strongPct}%` },
                        { color: "#8B5CF6", label: "Normal", pct: `${normalPct}%` },
                        { color: "#F59E0B", label: "Needs Review", pct: `${reviewPct}%` },
                      ];
                      return (<>
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                      <circle cx="60" cy="60" r="45" stroke="rgba(255,255,255,0.06)" strokeWidth="24" fill="none" />
                      {dashStrong > 0 && <circle cx="60" cy="60" r="45" stroke="#22C55E" strokeWidth="24" fill="none" strokeDasharray={`${dashStrong} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" />}
                      {dashNormal > 0 && <circle cx="60" cy="60" r="45" stroke="#8B5CF6" strokeWidth="24" fill="none" strokeDasharray={`${dashNormal} ${circ}`} strokeLinecap="round" transform={`rotate(${rotNormal} 60 60)`} />}
                      {dashReview > 0 && <circle cx="60" cy="60" r="45" stroke="#F59E0B" strokeWidth="24" fill="none" strokeDasharray={`${dashReview} ${circ}`} strokeLinecap="round" transform={`rotate(${rotReview} 60 60)`} />}
                    </svg>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.label} className="flex items-center gap-3 h-full">
                          <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: item.color }} />
                          <span style={{ fontSize: "13px", color: "#A1A1AA", flex: 1 }}>{item.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "#FFF" }}>{item.pct}</span>
                        </div>
                      ))}
                    </div>
                      </>);
                    })()}
                  </div>
                </div>

                {/* Emma's Insight (60%) */}
                <div className="rounded-[16px] p-6 relative overflow-hidden flex-1" style={{ minHeight: "200px", background: `url('/emma-insight-bg.png') right center / cover no-repeat`, border: "1px solid rgba(255,255,255,.05)", boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "0 0 12px", position: "relative", zIndex: 1 }}>Emma&apos;s Insight</p>
                  <div className="flex items-center gap-3 h-full" style={{ position: "relative", zIndex: 1 }}>
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(168,85,247,.3)", boxShadow: "0 0 20px rgba(168,85,247,.15)" }}>
                      <img src="/emma-avatar.webp" alt="Emma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, paddingRight: "160px" }}>
                      {(() => {
                        const score = dash?.avg_quiz_score ?? 0;
                        const streak = dash?.streak ?? 0;
                        const mastered = stats?.mastered ?? 0;
                        const weakCount = dash?.weakest_words?.length ?? 0;
                        const total = (stats?.new ?? 0) + (stats?.learning ?? 0) + (stats?.reviewing ?? 0) + mastered;
                        const retention = total > 0 ? Math.round((mastered / total) * 100) : 0;

                        const insights: { color: string; line1: string; line2: string }[] = [];

                        if (score > 0) {
                          var adj = score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Steady";
                          insights.push({ color: "#22C55E", line1: adj + " recall — " + score + "% avg", line2: "quiz accuracy" });
                        } else {
                          insights.push({ color: "#A855F7", line1: "Take a quiz to measure", line2: "your recall accuracy" });
                        }

                        if (retention > 0) {
                          insights.push({ color: "#22C55E", line1: retention + "% retention rate —", line2: mastered + " cards mastered" });
                        } else {
                          insights.push({ color: "#A855F7", line1: "Start reviewing cards", line2: "to build retention" });
                        }

                        if (streak > 0) {
                          insights.push({ color: "#22C55E", line1: streak + "-day streak — review", line2: "daily for long-term retention" });
                        } else {
                          insights.push({ color: "#A855F7", line1: "Review daily for long", line2: "term retention" });
                        }

                        return insights.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 2 ? "14px" : 0 }}>
                        <span style={{ color: item.color, fontSize: "10px", marginTop: "4px" }}>●</span>
                        <div>
                          <p style={{ fontSize: "12px", color: "#A1A1AA", lineHeight: 1.5, margin: 0 }}>{item.line1}</p>
                          <p style={{ fontSize: "12px", color: "#A1A1AA", lineHeight: 1.5, margin: 0 }}>{item.line2}</p>
                        </div>
                      </div>
                        ));
                      })()}
                        </div>
                      </div>
                    </div>
                </div>

              {/* ── Weak Word List Header (outside card) ── */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#FFF" }}>Weak Word List</span>
                  <span className="flex items-center justify-center" style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.15)", color: "rgba(255,255,255,.4)", fontSize: "9px", fontWeight: 500, cursor: "pointer" }}>i</span>
                </div>
                {/* Toolbar */}
                <div className="flex items-center gap-3 h-full">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "210px", height: "34px", borderRadius: "10px", background: "#111322", border: "1px solid rgba(255,255,255,.05)", padding: "0 10px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="#8B5CF6" strokeWidth="1" fill="none" opacity="0.7"/><path d="M8.5 8.5L11 11" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round" opacity="0.7"/></svg>
                    <input placeholder="Search weak words..." style={{ border: "none", background: "transparent", outline: "none", color: "#FFF", fontSize: "11px", width: "100%" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", height: "34px", borderRadius: "10px", background: "#111322", border: "1px solid rgba(255,255,255,.05)", padding: "0 10px", cursor: "pointer" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 2h8l-3 3.5V8L4 9V5.5L1 2z" stroke="#8B5CF6" strokeWidth="1" fill="none"/></svg>
                    <span style={{ fontSize: "11px", color: "#8F93A7" }}>All Difficulties</span>
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,.2)", marginLeft: "2px" }}>▾</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "34px", borderRadius: "10px", background: "#111322", border: "1px solid rgba(255,255,255,.05)", padding: "0 10px", cursor: "pointer" }}>
                    <span style={{ fontSize: "11px", color: "#8F93A7" }}>Newest</span>
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,.2)" }}>▾</span>
                  </div>
                </div>
              </div>

              {/* ── CTA Card ── */}
              <div className="rounded-[16px] overflow-hidden" style={{ background: "linear-gradient(135deg, #111322, #15142A)", border: "1px solid rgba(255,255,255,.04)", boxShadow: "0 10px 25px rgba(0,0,0,.45)" }}>
                <div className="relative flex items-center overflow-hidden" style={{ height: "150px", background: `url('/weakwords-cta-bg.png') center / cover no-repeat` }}>
                  {/* Left illustration (40%) */}
                  <div style={{ width: "40%", height: "100%", position: "relative" }} />
                  {/* Right content + buttons (60%) */}
                  <div className="flex items-center gap-5" style={{ width: "60%", zIndex: 1, paddingRight: "24px" }}>
                    <div>
                      {(() => {
                        const score = dash?.avg_quiz_score ?? 0;
                        const weakCount = dash?.weakest_words?.length ?? 0;
                        const mastered = stats?.mastered ?? 0;
                        let title = "Start Learning";
                        let line1 = "Begin your first lesson to build your vocabulary.";
                        let line2 = "Every word you learn brings you closer to fluency.";
                        let starColor = "#A855F7";

                        if (mastered > 0 || score > 0) {
                          if (score >= 85 && weakCount === 0) {
                            title = "Excellent Memory"; starColor = "#FFD35C";
                            line1 = "Your review system hasn't detected any weak vocabulary.";
                            line2 = "Keep studying consistently for long-term retention.";
                          } else if (score >= 70) {
                            title = "Good Progress"; starColor = "#A855F7";
                            line1 = `You have ${weakCount} weak word${weakCount !== 1 ? "s" : ""} to focus on.`;
                            line2 = "Regular review will help strengthen your memory.";
                          } else if (score >= 50) {
                            title = "Steady Growth"; starColor = "#8B5CF6";
                            line1 = `${weakCount} weak word${weakCount !== 1 ? "s" : ""} need${weakCount === 1 ? "s" : ""} attention.`;
                            line2 = "Try reviewing daily to boost your retention rate.";
                          } else {
                            title = "Room to Grow"; starColor = "#EC4899";
                            line1 = `You have ${weakCount} word${weakCount !== 1 ? "s" : ""} flagged as weak.`;
                            line2 = "Focus on your weakest words to see rapid improvement.";
                          }
                        }

                        return (<>
                      <p style={{ fontSize: "18px", fontWeight: 500, color: "#FFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ background: `linear-gradient(135deg, ${starColor}, #FBBF24)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 4px ${starColor}40)` }}>✦</span>
                        {title}
                      </p>
                      <p style={{ fontSize: "11px", color: "#A1A1AA", margin: "4px 0 0", lineHeight: 1.4 }}>{line1}</p>
                      <p style={{ fontSize: "11px", color: "#A1A1AA", margin: 0, lineHeight: 1.4 }}>{line2}</p>
                        </>);
                      })()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0, paddingLeft: "32px" }}>
                      <button onClick={() => router.push("/review")} className="flex items-center justify-center gap-1.5 border-none cursor-pointer" style={{ width: "140px", height: "32px", borderRadius: "8px", background: "linear-gradient(90deg, #7C3AED, #D946EF)", color: "#FFF", fontSize: "12px", fontWeight: 500, boxShadow: "0 0 18px rgba(168,85,247,.2)", whiteSpace: "nowrap" }}>
                        ← Continue →
                      </button>
                      <button onClick={() => router.push("/quiz")} className="flex items-center justify-center gap-1.5 border-none cursor-pointer" style={{ width: "140px", height: "32px", borderRadius: "8px", background: "#18182E", border: "1px solid rgba(255,255,255,.05)", color: "#FFF", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 3.5l4-2 4 2v4l-4 2-4-2V3.5z" stroke="#A855F7" strokeWidth="1" fill="none"/><path d="M5.5 5l3-1.5M5.5 5v4" stroke="#A855F7" strokeWidth="1" fill="none"/></svg>
                        Practice
                      </button>
                      <button onClick={() => router.push("/curriculum")} className="flex items-center justify-center gap-1.5 border-none cursor-pointer" style={{ width: "140px", height: "32px", borderRadius: "8px", background: "#18182E", border: "1px solid rgba(255,255,255,.05)", color: "#FFF", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1.5" y="1.5" width="8" height="9" rx="1.5" stroke="#A855F7" strokeWidth="1" fill="none"/></svg>
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {slug === "bookmarks" && (
            <>
              {/* Page Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.15)", boxShadow: "0 0 12px rgba(168,85,247,.08)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 3v18l6-4 6 4V3H6z" stroke="#A855F7" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>
                </div>
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: 500, color: "#FFF", margin: 0, lineHeight: 1.2 }}>Bookmarks</h1>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "2px 0 0" }}>Your saved words and exercises will appear here.</p>
                </div>
              </div>

              {/* Hero Banner */}
              <div className="relative flex items-center overflow-hidden" style={{ borderRadius: "22px", minHeight: "190px", background: `url('/bookmarks-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 8px 40px rgba(0,0,0,.3)" }}>
                {/* Left section (40%) */}
                <div className="px-8 py-6" style={{ width: "50%", zIndex: 2 }}>
                  <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#F8FAFC", margin: 0, lineHeight: 1.1 }}>Save what matters</h2>
                  <p style={{ fontSize: "16px", color: "#A6A8B6", margin: "10px 0 20px", lineHeight: 1.5, maxWidth: "340px" }}>Bookmark important words, phrases, and exercises to revisit them anytime.</p>
                  {/* 3 Stat Cards */}
                  <div className="flex gap-3">
                    {[
                      { value: bookmarks?.length ?? 0, label: "Total saved items" },
                      { value: bookmarks?.length ? 1 : 0, label: "Collections" },
                      { value: dash?.streak ? `${dash.streak}d streak` : "Today", label: "Keep learning!" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "rgba(16,18,32,.65)", border: "1px solid rgba(255,255,255,.06)" }}>
                        <span style={{ color: "#A855F7", display: "block", marginBottom: "4px", fontSize: "16px" }}>●</span>
                        <p style={{ fontSize: "18px", fontWeight: 700, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{stat.value}</p>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,.35)", margin: "2px 0 0" }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right illustration (60%) — bg image */}
                <div className="flex-1 relative" style={{ minHeight: "190px" }} />
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 flex-1 max-w-md px-3" style={{ height: "34px", borderRadius: "10px", background: "#101223", border: "1px solid rgba(255,255,255,.05)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="4" stroke="#A855F7" strokeWidth="1" fill="none" opacity="0.6"/><path d="M8.5 8.5L11 11" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" opacity="0.6"/></svg>
                  <input placeholder="Search bookmarks..." style={{ border: "none", background: "transparent", outline: "none", color: "#FFF", fontSize: "11px", width: "100%" }} />
                </div>
                <div className="flex items-center gap-1.5 px-3" style={{ height: "34px", borderRadius: "10px", background: "#101223", border: "1px solid rgba(255,255,255,.05)", cursor: "pointer" }}>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>All Types</span>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,.2)" }}>▾</span>
                </div>
                <div className="flex items-center gap-1.5 px-3" style={{ height: "34px", borderRadius: "10px", background: "#101223", border: "1px solid rgba(255,255,255,.05)", cursor: "pointer" }}>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Newest First</span>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,.2)" }}>▾</span>
                </div>
              </div>

              {/* Bookmarked Items — horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: "thin" }}>
                {!bookmarks?.length ? (
                  <div className="flex-1 text-center py-10">
                    <p style={{ fontSize: "14px", color: "#FFF", margin: "0 0 4px" }}>No bookmarks yet</p>
                    <p style={{ fontSize: "12px", color: "#A8A4BC", margin: 0 }}>Save words and phrases from lessons to see them here.</p>
                  </div>
                ) : (
                bookmarks.map((b) => ({
                  type: "SAVED" as const, color: "#7C5CFF", title: b.german, sub: b.english,
                  content: { type: "notes" as const, text: b.notes || "No notes" },
                  level: "—", time: new Date(b.updated_at || b.created_at).toLocaleDateString(),
                })).map((item, i) => (
                  <div key={i} className="flex-shrink-0 rounded-[18px] p-4 transition-all hover:-translate-y-1" style={{ width: "220px", background: "linear-gradient(180deg, #171A2A, #111322)", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#FFF", padding: "2px 8px", borderRadius: "999px", background: `${item.color}20`, border: `1px solid ${item.color}30`, textTransform: "uppercase", letterSpacing: "0.3px" }}>{item.type}</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 3v18l6-4 6 4V3H6z" fill={item.color} opacity="0.9"/></svg>
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#F8FAFC", margin: 0, lineHeight: 1.2 }}>{item.title}</p>
                    <p style={{ fontSize: "11px", color: "#A8ABB8", margin: "3px 0 8px" }}>{item.sub}</p>
                    {item.content.type === "notes" && (
                      <div className="mb-3 px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,255,255,.03)" }}>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,.25)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</p>
                        <p style={{ fontSize: "11px", color: "#D1D5DB", margin: 0, lineHeight: 1.4 }}>{item.content.text}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize: "9px", fontWeight: 600, padding: "1px 6px", borderRadius: "999px", background: "rgba(168,85,247,.08)", color: "#A855F7" }}>{item.level}</span>
                      <span style={{ fontSize: "9px", color: "#7F8495" }}>{item.time}</span>
                    </div>
                  </div>
                ))
                )}
              </div>

              {/* Bottom Grid: Collections + Bookmark Types + Recent Activity */}
              <div className="flex gap-4">
                {/* Collections */}
                <div className="flex-1 rounded-[16px] p-4" style={{ background: "#151827", border: "1px solid rgba(255,255,255,.04)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: "0 0 12px" }}>Collections</p>
                  {bookmarks?.length ? (
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="10" height="9" rx="1.5" stroke="#A855F7" strokeWidth="1" fill="none"/></svg>
                        <span style={{ fontSize: "12px", color: "#FFF" }}>My Saved Words</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#A8A4BC" }}>{bookmarks.length}</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", textAlign: "center", padding: "12px 0" }}>No collections</p>
                  )}
                  <button onClick={() => router.push("/chat")} className="w-full mt-3 py-2 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ border: "1px dashed rgba(168,85,247,.2)", color: "#A855F7", background: "transparent" }}>+ Create New Collection</button>
                </div>

                {/* Bookmark Types */}
                <div className="flex-1 rounded-[16px] p-5 flex flex-col" style={{ background: "#151827", border: "1px solid rgba(255,255,255,.04)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: "0 0 16px" }}>Bookmark Types</p>
                  {bookmarks?.length ? (
                    <div className="flex items-center gap-6 flex-1">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.06)" strokeWidth="22" fill="none" />
                        <circle cx="50" cy="50" r="36" stroke="#A855F7" strokeWidth="22" fill="none" strokeDasharray={`${Math.min(bookmarks.length * 20, 226)} 226`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                      </svg>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#A855F7" }} />
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Saved words</span>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>{bookmarks.length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", textAlign: "center", padding: "20px 0" }}>Add bookmarks to see types</p>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="flex-1 rounded-[16px] p-4" style={{ background: "#151827", border: "1px solid rgba(255,255,255,.04)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF", margin: "0 0 12px" }}>Recent Activity</p>
                  <div className="space-y-3">
                    {bookmarks?.length ? bookmarks.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span style={{ color: "#A855F7", fontSize: "14px" }}>●</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "11px", fontWeight: 500, color: "#FFF", margin: 0 }}>Saved: {b.german}</p>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", margin: 0 }}>{b.english}</p>
                        </div>
                      </div>
                    )) : (
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", textAlign: "center", padding: "20px 0" }}>No recent activity</p>
                    )}
                  </div>
                  <button onClick={() => router.push("/review")} className="mt-3 text-xs border-none cursor-pointer" style={{ color: "#A855F7", background: "none" }}>View All Activity →</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
