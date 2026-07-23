/**
 * AchievementList — Achievement badges (earned + locked)
 */

"use client";

interface Achievement {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
}

interface AchievementListProps {
  achievements: Achievement[];
}

export function AchievementList({ achievements }: AchievementListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h3 style={{ margin: 0, fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Achievements
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "var(--space-2)" }}>
        {achievements.map((a) => (
          <div
            key={a.id}
            style={{
              padding: "var(--space-3)", textAlign: "center", borderRadius: "var(--radius-md)",
              background: a.earned ? "var(--color-hover-bg)" : "var(--color-surface-1)",
              border: `1px solid ${a.earned ? "var(--color-active-bg)" : "var(--color-border-subtle)"}`,
              opacity: a.earned ? 1 : 0.5,
            }}
            title={a.earned ? a.label : "Locked"}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "4px" }}>{a.earned ? a.icon : "🔒"}</span>
            <span style={{ fontSize: "var(--type-label-sm)", fontWeight: 600, color: a.earned ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
