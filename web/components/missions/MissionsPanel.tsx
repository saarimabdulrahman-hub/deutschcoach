"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Mission {
  id: string;
  label: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
}

interface StreakInfo {
  streak: number;
  streak_bonus: number;
}

// MissionsPanel (Section 11.7). Displays daily missions with progress.
// Designed to fit in a sidebar or dashboard context.

const MISSION_ICONS: Record<string, string> = {
  complete_lesson: "📖",
  review_cards: "🃏",
  practice_speaking: "🎤",
};

export function MissionsPanel() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ streak: 0, streak_bonus: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/missions/daily").then((data: any) => {
      setMissions(data.missions ?? []);
      setStreak({ streak: data.streak ?? 0, streak_bonus: data.streak_bonus ?? 0 });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loading missions…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
          📋 Daily Missions
        </h3>
        {streak.streak > 0 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24" }}>
            🔥 {streak.streak} day{streak.streak !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {missions.map((m) => {
          const pct = m.target > 0 ? Math.round((m.progress / m.target) * 100) : 0;
          return (
            <div key={m.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{MISSION_ICONS[m.id] ?? "🎯"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: m.completed ? "#4ADE80" : "var(--color-text)" }}>
                    {m.completed ? "✅ " : ""}{m.label}
                  </p>
                </div>
                <span className="text-[10px] font-medium flex-shrink-0" style={{ color: m.completed ? "#4ADE80" : "var(--color-text-muted)" }}>
                  {m.progress}/{m.target}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, pct)}%`, background: m.completed ? "rgba(34,197,94,0.6)" : "var(--color-accent-gradient)" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {streak.streak_bonus > 0 && (
        <p className="text-[10px] mt-2 font-medium" style={{ color: "#FBBF24" }}>
          🔥 Streak bonus: +{streak.streak_bonus} XP
        </p>
      )}
    </div>
  );
}
