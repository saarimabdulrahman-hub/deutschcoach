"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GrammarTopicCard } from "@/components/grammar/GrammarTopicCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import Link from "next/link";

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1"] as const;
const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1"];

interface GrammarTopic {
  id: number; slug: string; title: string; level: string;
  content?: string | null;
  examples?: Record<string, string> | null;
  related_lesson_ids?: number[] | null;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "#33E676", A2: "#2C8DFF", B1: "#F9A321", B2: "#F44BCF", C1: "#8A4DFF",
};
const LEVEL_NAMES: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Int.", C1: "Advanced",
};

const LESSON_ICONS = ["👥", "📅", "📖", "⭐", "💬", "🛡", "⚡", "→"];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <Skeleton className="h-4 w-16 rounded mb-3" />
          <Skeleton className="h-5 w-3/4 rounded mb-2" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function GrammarPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [level, setLevel] = useState<string>("All");
  // Selected lesson for right panel
  const [selectedLesson, setSelectedLesson] = useState<GrammarTopic | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const params = new URLSearchParams();
  if (debouncedQuery) params.set("q", debouncedQuery);
  if (level !== "All") params.set("level", level);

  const { data: topics = [], isLoading: loading, error: fetchError } = useQuery<GrammarTopic[]>({
    queryKey: ["grammar", debouncedQuery, level],
    queryFn: () => api.get(`/grammar?${params.toString()}`),
  });

  const grouped = useMemo(() => {
    if (level !== "All" || debouncedQuery) return null;
    const map: Record<string, GrammarTopic[]> = {};
    for (const t of topics) {
      const lvl = CEFR_ORDER.includes(t.level) ? t.level : "Other";
      if (!map[lvl]) map[lvl] = [];
      map[lvl].push(t);
    }
    return CEFR_ORDER.filter((l) => map[l]?.length).map((l) => ({ level: l, topics: map[l] }));
  }, [topics, level, debouncedQuery]);

  const allGrouped = useMemo(() => {
    const map: Record<string, GrammarTopic[]> = {};
    for (const t of topics) {
      const lvl = CEFR_ORDER.includes(t.level) ? t.level : "Other";
      if (!map[lvl]) map[lvl] = [];
      map[lvl].push(t);
    }
    return CEFR_ORDER.filter((l) => map[l]?.length).map((l) => ({ level: l, topics: map[l] }));
  }, [topics]);

  return (
    <div style={{ background: "#080814", minHeight: "calc(100vh - 72px)", margin: "-24px", padding: "16px" }}>
      {/* ── HERO IMAGE ── */}
      <div style={{ width: "100%", height: "200px", overflow: "hidden", marginBottom: "8px", borderRadius: "12px", position: "relative" }}>
        <img src="/grammar-hero-bg.png" alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(1.08) drop-shadow(0 0 30px rgba(138,77,255,.15))" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(138,77,255,.06), transparent 60%)", pointerEvents: "none" }} />
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "rgba(255,255,255,.3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search grammar topics…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#101627", border: "1px solid rgba(255,255,255,.08)", color: "#FFF" }}
            onFocus={(e) => { e.target.style.borderColor = "#8A4DFF"; e.target.style.boxShadow = "0 0 0 3px rgba(138,77,255,.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,.08)"; e.target.style.boxShadow = "none"; }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {LEVELS.map((lvl) => (
            <button key={lvl} onClick={() => setLevel(lvl)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-none cursor-pointer"
              style={{
                background: level === lvl ? (lvl === "All" ? "linear-gradient(135deg, #8A4DFF, #F44BCF)" : LEVEL_COLORS[lvl]) : "rgba(255,255,255,.04)",
                color: level === lvl ? "#fff" : "rgba(255,255,255,.4)",
                boxShadow: level === lvl ? `0 0 12px ${lvl === "All" ? "rgba(138,77,255,.4)" : LEVEL_COLORS[lvl] + "40"}` : "none",
              }}>{lvl}</button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: TWO-COLUMN LAYOUT ── */}
      {loading ? <SkeletonGrid /> : fetchError ? (
        <ErrorState message={fetchError instanceof Error ? fetchError.message : "Failed to load grammar topics."} onRetry={() => queryClient.invalidateQueries({ queryKey: ["grammar"] })} />
      ) : topics.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.08)" }}>
          <p className="text-3xl mb-3">📖</p>
          <p className="text-sm font-semibold" style={{ color: "#FFF" }}>No grammar topics found</p>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* ── LEFT PANEL: Knowledge Map (~44%) ── */}
          <div className="flex flex-col" style={{ width: "44%" }}>
            {/* Knowledge Map Container */}
            <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "#0D1020", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 8px 40px rgba(0,0,0,.25)" }}>
              {/* Center glow */}
              <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "300px", height: "200px", background: "radial-gradient(ellipse, rgba(44,141,255,.04), transparent)", pointerEvents: "none" }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#FFF" }}>Grammar Knowledge Map</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.2)", cursor: "pointer" }}>ⓘ</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border-none cursor-pointer" style={{ border: "1px solid rgba(138,77,255,.3)", color: "#A78BFA", background: "transparent" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polygon points="2,1 9,5 2,9" fill="#A78BFA"/></svg>
                  How it works
                </button>
              </div>

              {/* CEFR Rows */}
              <div className="space-y-4">
                {[
                  {
                    lvl: "A1", color: "#33E676", name: "Beginner", progress: "5/5 ★", topics: [
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7" r="3" stroke="#33E676" strokeWidth="2" fill="none"/><circle cx="16" cy="7" r="3" stroke="#33E676" strokeWidth="2" fill="none"/><path d="M3 18c0-4 3-7 7-7s7 3 7 7" stroke="#33E676" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Verbs Basics", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="7" cy="7" r="3" stroke="#33E676" strokeWidth="2" fill="none"/><circle cx="15" cy="7" r="3" stroke="#33E676" strokeWidth="2" fill="none"/><path d="M2 18c0-4 3-7 7-7s7 3 7 7" stroke="#33E676" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Pronouns", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="13" rx="2" stroke="#33E676" strokeWidth="2" fill="none"/><line x1="3" y1="9" x2="19" y2="9" stroke="#33E676" strokeWidth="2"/><rect x="6" y="11" width="3" height="3" rx="0.5" stroke="#33E676" strokeWidth="1" fill="none"/><rect x="11" y="11" width="3" height="3" rx="0.5" stroke="#33E676" strokeWidth="1" fill="none"/></svg>, label: "Articles", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4" width="16" height="14" rx="2" stroke="#33E676" strokeWidth="2" fill="none"/><rect x="5" y="2" width="3" height="3" rx="0.5" fill="#33E676"/><rect x="14" y="2" width="3" height="3" rx="0.5" fill="#33E676"/><line x1="3" y1="9" x2="19" y2="9" stroke="#33E676" strokeWidth="2"/></svg>, label: "Present Tense", status: "current" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="6" width="16" height="4" rx="2" stroke="#33E676" strokeWidth="2" fill="none"/><rect x="3" y="12" width="16" height="4" rx="2" stroke="#33E676" strokeWidth="2" fill="none"/></svg>, label: "Word Order", status: "not_started" },
                    ]
                  },
                  {
                    lvl: "A2", color: "#2C8DFF", name: "Elementary", progress: "3/8 ★", topics: [
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="7" cy="7" r="3" stroke="#2C8DFF" strokeWidth="2" fill="none"/><circle cx="15" cy="7" r="3" stroke="#2C8DFF" strokeWidth="2" fill="none"/><path d="M2 18c0-4 3-7 7-7s7 3 7 7" stroke="#2C8DFF" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Modal Verbs", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="4" y="5" width="14" height="13" rx="2" stroke="#2C8DFF" strokeWidth="2" fill="none"/><path d="M11 5V9L14 11" stroke="#2C8DFF" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Cases", status: "current" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4L13.5 9H19L14.5 12.5L16.5 18L11 14.5L5.5 18L7.5 12.5L3 9H8.5L11 4Z" stroke="#2C8DFF" strokeWidth="2" strokeLinejoin="round" fill="none"/></svg>, label: "Adjectives", status: "current" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="6" width="7" height="10" rx="1.5" stroke="#2C8DFF" strokeWidth="2" fill="none"/><rect x="12" y="4" width="7" height="14" rx="1.5" stroke="#2C8DFF" strokeWidth="2" fill="none"/><path d="M10 11L12 11" stroke="#2C8DFF" strokeWidth="2"/></svg>, label: "Comparatives", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "More Topics", status: "locked" },
                    ]
                  },
                  {
                    lvl: "B1", color: "#F9A321", name: "Intermediate", progress: "2/8 ★", topics: [
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 14c0-3 2-5.5 5-5.5s5 2.5 5 5.5" stroke="#F9A321" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="10" cy="7" r="2.5" stroke="#F9A321" strokeWidth="2" fill="none"/><path d="M14 16c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" stroke="#F9A321" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Indirect Speech", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="6" cy="7" r="2.5" stroke="#F9A321" strokeWidth="2" fill="none"/><circle cx="16" cy="7" r="2.5" stroke="#F9A321" strokeWidth="2" fill="none"/><path d="M2 17c0-3 2.5-5.5 5.5-5.5S13 14 13 17" stroke="#F9A321" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Subjunctive I", status: "current" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="6" cy="7" r="2.5" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><circle cx="16" cy="7" r="2.5" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M2 17c0-3 2.5-5.5 5.5-5.5S13 14 13 17" stroke="rgba(255,255,255,.15)" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Past Tense", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Relative Clauses", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Passive Voice", status: "locked" },
                    ]
                  },
                  {
                    lvl: "B2", color: "#F44BCF", name: "Upper Int.", progress: "1/10 ★", topics: [
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="6" height="6" rx="1" stroke="#F44BCF" strokeWidth="2" fill="none"/><rect x="13" y="5" width="6" height="6" rx="1" stroke="#F44BCF" strokeWidth="2" fill="none"/><rect x="3" y="13" width="6" height="6" rx="1" stroke="#F44BCF" strokeWidth="2" fill="none"/><rect x="13" y="13" width="6" height="6" rx="1" stroke="#F44BCF" strokeWidth="2" fill="none"/></svg>, label: "Conjunctions", status: "completed" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="6" cy="7" r="2.5" stroke="#F44BCF" strokeWidth="2" fill="none"/><circle cx="16" cy="7" r="2.5" stroke="#F44BCF" strokeWidth="2" fill="none"/><path d="M2 17c0-3 2.5-5.5 5.5-5.5S13 14 13 17" stroke="#F44BCF" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>, label: "Complex Sentences", status: "current" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Participial Constructions", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Gerund & Infinitive", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Advanced Verbs", status: "locked" },
                    ]
                  },
                  {
                    lvl: "C1", color: "#8A4DFF", name: "Advanced", progress: "0/10 ★", topics: [
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Nominal Style", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Subjunctive II", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Rhetorical Devices", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Academic Grammar", status: "locked" },
                      { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="5" y="8" width="12" height="10" rx="2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/><path d="M8 8V6a3 3 0 016 0v2" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none"/></svg>, label: "Literary Analysis", status: "locked" },
                    ]
                  },
                ].map(({ lvl, color, name, progress, topics }) => (
                  <div key={lvl} className="flex items-start gap-4">
                    {/* Level Node */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: "64px" }}>
                      <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center" style={{ border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}25`, background: `${color}06` }}>
                        <span style={{ fontSize: "15px", fontWeight: 800, color }}>{lvl}</span>
                      </div>
                      <span style={{ fontSize: "9px", marginTop: "3px", color: "rgba(255,255,255,.45)" }}>{name}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: `${color}CC` }}>{progress}</span>
                    </div>
                    {/* Topic Nodes + Connection */}
                    <div className="flex-1 flex items-start gap-2 relative" style={{ paddingTop: "8px", minHeight: "90px" }}>
                      {/* Connection line */}
                      <div style={{ position: "absolute", left: "0", right: "0", top: "32px", height: "1px", borderTop: `1.5px dashed ${color}25`, pointerEvents: "none" }} />
                      {topics.map((topic) => {
                        const isCompleted = topic.status === "completed";
                        const isCurrent = topic.status === "current";
                        const isLocked = topic.status === "locked";
                        return (
                          <div key={topic.label} className="flex-1 flex flex-col items-center gap-1.5" style={{ position: "relative", zIndex: 1 }}>
                            <button
                              onClick={() => setSelectedLesson({ id: 0, slug: lvl.toLowerCase(), title: topic.label, level: lvl, content: `Study the ${topic.label.toLowerCase()} for ${lvl} level.` })}
                              className="rounded-full flex items-center justify-center transition-all border-none cursor-pointer"
                              style={{
                                width: "48px", height: "48px",
                                background: isCompleted ? `${color}18` : isCurrent ? `${color}10` : "transparent",
                                border: `2px solid ${isCompleted ? color : isCurrent ? `${color}80` : "rgba(255,255,255,.08)"}`,
                                boxShadow: isCompleted ? `0 0 14px ${color}30` : isCurrent ? `0 0 12px ${color}25` : "none",
                                opacity: isLocked ? 0.35 : 1,
                              }}>
                              <div style={{ opacity: isLocked ? 1 : 1 }}>
                                {topic.icon}
                              </div>
                            </button>
                            {/* Topic label */}
                            <span style={{ fontSize: "9px", color: isLocked ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.6)", textAlign: "center", lineHeight: 1.2, maxWidth: "60px" }}>{topic.label}</span>
                            {/* Status indicator */}
                            <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{
                              background: isCompleted ? "#33E676" : isCurrent ? "#2C8DFF" : "rgba(255,255,255,.08)",
                              boxShadow: isCompleted ? "0 0 6px rgba(51,230,118,.5)" : isCurrent ? "0 0 6px rgba(44,141,255,.4)" : "none",
                            }}>
                              {isCompleted && <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 3l1.5 1.5L5 1.5" stroke="#0D1020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                {[
                  { color: "#33E676", label: "Completed" },
                  { color: "#2C8DFF", label: "In Progress" },
                  { color: "#F9A321", label: "Not Started" },
                  { label: "🔒 Locked", icon: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.icon ? (
                      <span style={{ fontSize: "10px" }}>🔒</span>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 4px ${item.color}50` }} />
                    )}
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,.35)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Lesson Workspace (~56%) ── */}
          <div className="flex flex-col" style={{ width: "56%" }}>
            {selectedLesson ? (
              <>
                {/* Back + Bookmark + Share */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setSelectedLesson(null)} className="text-xs border-none cursor-pointer" style={{ color: "rgba(255,255,255,.4)", background: "none" }}>← Back to Map</button>
                  <div className="flex gap-2">
                    <button onClick={() => { if (selectedLesson) navigator.clipboard.writeText(`${window.location.origin}/grammar/${selectedLesson.slug}`); }} className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer" style={{ border: "1px solid rgba(138,77,255,.3)", color: "#8A4DFF", background: "transparent" }}>🔖 Bookmark</button>
                    <button onClick={() => { if (selectedLesson) navigator.clipboard.writeText(`${window.location.origin}/grammar/${selectedLesson.slug}`); }} className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer" style={{ border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.4)" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 4L4 10M10 4L10 8M10 4H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>

                {/* Hero */}
                <div className="flex items-start gap-4 mb-6 p-5 rounded-2xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(51,230,118,.12)", boxShadow: "0 0 12px rgba(51,230,118,.1)" }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2" stroke="#33E676" strokeWidth="1.5" fill="none"/><line x1="3" y1="8" x2="19" y2="8" stroke="#33E676" strokeWidth="1.5"/><circle cx="7" cy="13" r="1.5" fill="#33E676"/><circle cx="11" cy="13" r="1.5" fill="#33E676"/><circle cx="15" cy="13" r="1.5" fill="#33E676"/></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold m-0" style={{ color: "#FFF" }}>{selectedLesson.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${LEVEL_COLORS[selectedLesson.level] || "#8A4DFF"}20`, color: LEVEL_COLORS[selectedLesson.level] || "#8A4DFF" }}>{selectedLesson.level}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${LEVEL_COLORS[selectedLesson.level] || "#8A4DFF"}15`, color: LEVEL_COLORS[selectedLesson.level] || "#8A4DFF" }}>{LEVEL_NAMES[selectedLesson.level] || selectedLesson.level}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(138,77,255,.12)", color: "#8A4DFF" }}>Verb Fundamentals</span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: "#A8A4BC", lineHeight: 1.5 }}>
                      {selectedLesson.content?.slice(0, 120) || "Master the fundamentals of German grammar through structured lessons."}
                    </p>
                  </div>
                </div>

                {/* Progress + CTA */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,.3)" }}>Mastery Progress</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#33E676" }}>75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                      <div className="h-full rounded-full" style={{ width: "75%", background: "linear-gradient(90deg, #33E676, #2C8DFF)" }} />
                    </div>
                  </div>
                  <Link href={`/grammar/${selectedLesson.slug}`}>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #F44BCF, #8A4DFF)", color: "#FFF", boxShadow: "0 4px 20px rgba(138,77,255,.3)" }}>
                      Continue Learning →
                    </button>
                  </Link>
                </div>

                {/* Related Topics — from API */}
                <div className="space-y-2 mb-6">
                  {topics.slice(0, 5).length > 0 ? topics.slice(0, 5).map((topic) => (
                    <div key={topic.slug || topic.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: "rgba(44,141,255,.12)",
                      }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: "#2C8DFF", boxShadow: "0 0 6px rgba(44,141,255,.4)" }} />
                      </div>
                      <span className="flex-1 text-sm" style={{ color: "#FFF" }}>{topic.title}</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,.2)" }}>{topic.level}</span>
                      <Link href={`/grammar/${topic.slug}`} className="px-3 py-1 rounded-lg text-[10px] font-medium border-none cursor-pointer" style={{ background: "linear-gradient(135deg, #F44BCF, #8A4DFF)", color: "#FFF", textDecoration: "none" }}>View</Link>
                    </div>
                  )) : (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,.2)", padding: "12px 0", textAlign: "center" }}>No topics loaded</p>
                  )}
                </div>

                {/* Bottom Info Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Key Grammar Points */}
                  <div className="p-4 rounded-xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)" }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: "#FFF" }}>Key Grammar Points</p>
                    <div className="space-y-2">
                      {topics.slice(0, 4).map((topic) => (
                        <div key={topic.slug || topic.id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#8A4DFF" }} />
                          <span className="text-xs" style={{ color: "rgba(255,255,255,.5)" }}>{topic.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Examples — from selected topic */}
                  <div className="p-4 rounded-xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)" }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: "#FFF" }}>Examples</p>
                    {selectedLesson?.content ? (
                      <p className="text-xs m-0" style={{ color: "#A8A4BC" }}>{selectedLesson.content.slice(0, 120)}...</p>
                    ) : (
                      <p className="text-xs m-0" style={{ color: "rgba(255,255,255,.3)" }}>Select a topic to see examples.</p>
                    )}
                  </div>

                  {/* You'll Master */}
                  <div className="p-4 rounded-xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)" }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: "#FFF" }}>You'll Master</p>
                    <div className="space-y-2">
                      {[
                        { icon: "⚡", label: "Fast recall" },
                        { icon: "💬", label: "Daily speaking" },
                        { icon: "👥", label: "Conversations" },
                      ].map((skill) => (
                        <div key={skill.label} className="flex items-center gap-2">
                          <span style={{ fontSize: "14px" }}>{skill.icon}</span>
                          <span style={{ fontSize: "10px", color: "#A8A4BC" }}>{skill.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No lesson selected — show all topics */
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl" style={{ background: "#101627", border: "1px solid rgba(255,255,255,.06)", padding: "40px" }}>
                <span style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📖</span>
                <p className="text-sm font-semibold m-0" style={{ color: "#FFF" }}>Select a lesson</p>
                <p className="text-xs mt-1" style={{ color: "#A8A4BC" }}>Click on a topic node to view its details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
