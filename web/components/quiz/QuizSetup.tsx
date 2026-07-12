"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { QuizSession } from "@/types";

type SourceOption = "current-lesson" | "level" | "weakest";

interface QuizSetupProps { onStart: (session: QuizSession) => void; onSource?: (src: string) => void; }

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

interface QuizCategory {
  key: SourceOption | "mixed" | "speed";
  label: string; icon: string; desc: string; duration: string; difficulty: "Easy" | "Medium" | "Hard";
  color: string;
}

const CATEGORIES: QuizCategory[] = [
  { key: "current-lesson", label: "Current Lesson", icon: "📖", desc: "Quiz yourself on your active lesson vocabulary", duration: "~3 min", difficulty: "Easy", color: "var(--color-accent)" },
  { key: "weakest", label: "Weak Words", icon: "🎯", desc: "Focus on the words you struggle with most", duration: "~4 min", difficulty: "Medium", color: "var(--color-warning)" },
  { key: "level", label: "CEFR Level", icon: "🏆", desc: "Pick a level and test your knowledge", duration: "~5 min", difficulty: "Medium", color: "var(--color-accent-light)" },
  { key: "mixed", label: "Mixed Quiz", icon: "🔄", desc: "Random words from everything you've learned", duration: "~5 min", difficulty: "Medium", color: "var(--color-active-text)" },
  { key: "speed", label: "Speed Challenge", icon: "⚡", desc: "Answer fast — beat your best time", duration: "~2 min", difficulty: "Hard", color: "#f43f5e" },
];

const DIFFICULTY_DOT: Record<string, string> = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#f43f5e" };

export function QuizSetup({ onStart, onSource }: QuizSetupProps) {
  const [selected, setSelected] = useState<QuizCategory>(CATEGORIES[0]);
  const [level, setLevel] = useState<string>("A1");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true); setError(null);
    try {
      const body: Record<string, unknown> = { count };
      if (selected.key === "level") body.level = level;
      if (selected.key === "speed") { body.count = Math.min(count, 15); }
      // mixed → no source filter on backend; weakest → handled by /quiz/generate
      const session = await api.post<QuizSession>("/quiz/generate", body);
      onStart(session);
      onSource?.(selected.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz category cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Choose your quiz</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const active = selected.key === cat.key;
            return (
              <button key={cat.key} type="button" onClick={() => setSelected(cat)}
                className="text-left rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: active ? "var(--color-card-bg)" : "var(--color-card-bg)",
                  border: active ? `2px solid ${cat.color}` : "1px solid var(--color-border)",
                  boxShadow: active ? `0 0 0 3px ${cat.color}22` : "none",
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: active ? `${cat.color}18` : "var(--color-hover-bg)", border: active ? `1px solid ${cat.color}33` : "none" }}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-bold" style={{ color: "var(--color-text)" }}>{cat.label}</p>
                      {active && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cat.color, color: "#fff" }}>Selected</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{cat.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span style={{ color: "var(--color-text-muted)" }}>{cat.duration}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: DIFFICULTY_DOT[cat.difficulty] }} />
                        {cat.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level selector (only for CEFR Level quiz) */}
      {selected.key === "level" && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--color-text-muted)" }}>CEFR Level</label>
          <div className="flex gap-2">
            {LEVELS.map((lvl) => (
              <button key={lvl} type="button" onClick={() => setLevel(lvl)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: level === lvl ? "var(--color-accent-gradient)" : "var(--color-card-bg)",
                  color: level === lvl ? "#fff" : "var(--color-text-secondary)",
                  border: level === lvl ? "none" : "1px solid var(--color-border)",
                  boxShadow: level === lvl ? "0 4px 14px var(--color-accent-glow)" : "none",
                }}>{lvl}</button>
            ))}
          </div>
        </div>
      )}

      {/* Question count */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Questions</span>
        <button type="button" onClick={() => setCount(Math.max(5, count - 5))} disabled={count <= 5}
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg disabled:opacity-30"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>−</button>
        <span className="text-2xl font-extrabold tabular-nums w-10 text-center" style={{ color: "var(--color-text)" }}>{count}</span>
        <button type="button" onClick={() => setCount(Math.min(30, count + 5))} disabled={count >= 30}
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg disabled:opacity-30"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>+</button>
      </div>

      {error && (
        <div className="text-sm p-4 rounded-xl flex items-center gap-3" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" }}>
          ⚠ {error}
        </div>
      )}

      {/* Primary CTA */}
      <button onClick={handleStart} disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
        style={{ background: "var(--color-accent-gradient)", boxShadow: "0 4px 20px var(--color-accent-glow)", color: "#fff" }}>
        {loading ? (
          <><span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} /> Generating…</>
        ) : (
          <>Start {selected.label} →</>
        )}
      </button>
    </div>
  );
}
