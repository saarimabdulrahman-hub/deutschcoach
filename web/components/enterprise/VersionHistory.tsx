/**
 * VersionHistory — Timeline-style list of changes with restore
 * Reference: 14_ENTERPRISE_UX_PATTERNS/005_Version_History.md
 */

"use client";

interface VersionEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  summary: string;
}

interface VersionHistoryProps {
  versions: VersionEntry[];
  onRestore?: (versionId: string) => void;
}

export function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {versions.map((v, i) => (
        <div key={v.id} style={{ display: "flex", gap: "var(--space-3)", position: "relative" }}>
          {/* Timeline line */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: i === 0 ? "var(--color-accent)" : "var(--color-border-subtle)",
              border: i === 0 ? "2px solid var(--color-accent-glow)" : "2px solid transparent",
              zIndex: 1,
            }} />
            {i < versions.length - 1 && (
              <div style={{ width: "1px", flex: 1, background: "var(--color-border-subtle)" }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: "var(--type-body-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {v.action}
                </p>
                <p style={{ margin: "2px 0", fontSize: "var(--type-body-sm)", color: "var(--color-text-secondary)" }}>
                  {v.summary}
                </p>
                <p style={{ margin: 0, fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>
                  {v.user} · {v.date}
                </p>
              </div>
              {onRestore && i > 0 && (
                <button onClick={() => onRestore(v.id)}
                  style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-subtle)", background: "transparent", color: "var(--color-accent)", fontSize: "var(--type-label-sm)", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Restore
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
