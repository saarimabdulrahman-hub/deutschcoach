"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Achievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlocked_at: string | null;
}

// AchievementsGrid (Section 11.7). Displays achievement badges with progress.
// Shows locked/unlocked state and progress toward each achievement.

const ACHIEVEMENT_META: Record<string, { icon: string }> = {
  first_dialogue: { icon: "💬" },
  vocab_master: { icon: "📚" },
  grammar_apprentice: { icon: "📐" },
};

export function AchievementsGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/achievements").then((data: any) => {
      setAchievements(data.achievements ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Loading achievements…</p>
      </div>
    );
  }

  if (!achievements.length) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No achievements yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
        🏆 Achievements
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {achievements.map((a) => {
          const meta = ACHIEVEMENT_META[a.id] ?? { icon: "🏅" };
          const pct = a.target > 0 ? Math.min(100, Math.round((a.progress / a.target) * 100)) : 0;

          return (
            <div
              key={a.id}
              className="rounded-xl p-3 text-center transition-all"
              style={{
                background: a.unlocked ? "rgba(34,197,94,0.06)" : "var(--color-page-bg)",
                border: `1px solid ${a.unlocked ? "rgba(34,197,94,0.2)" : "var(--color-border)"}`,
                opacity: a.unlocked ? 1 : 0.6,
              }}
              title={a.unlocked ? a.description : `${a.description} (${pct}%)`}
            >
              <span className="text-2xl block mb-1">{a.unlocked ? meta.icon : "🔒"}</span>
              <p className="text-[10px] font-semibold truncate" style={{ color: a.unlocked ? "var(--color-text)" : "var(--color-text-muted)" }}>
                {a.label}
              </p>

              {/* Progress bar */}
              {!a.unlocked && (
                <div className="mt-1.5 h-1 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-accent-gradient)" }} />
                </div>
              )}
              {a.unlocked && (
                <p className="text-[9px] mt-1 font-medium" style={{ color: "#4ADE80" }}>✅ Unlocked</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
