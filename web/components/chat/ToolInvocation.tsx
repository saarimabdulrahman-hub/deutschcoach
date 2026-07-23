/**
 * ToolInvocation — Tool execution visualization
 * States: pending → running → complete → error
 */

"use client";

type ToolState = "pending" | "running" | "complete" | "error";

interface ToolInvocationProps {
  toolName: string;
  state: ToolState;
  result?: string;
}

const stateStyles: Record<ToolState, { icon: string; color: string; label: string }> = {
  pending: { icon: "○", color: "var(--color-text-muted)", label: "Waiting..." },
  running: { icon: "◌", color: "var(--color-accent)", label: "Running..." },
  complete: { icon: "✓", color: "var(--color-success)", label: "Complete" },
  error: { icon: "✕", color: "var(--color-error)", label: "Error" },
};

export function ToolInvocation({ toolName, state, result }: ToolInvocationProps) {
  const s = stateStyles[state];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-2)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-hover-bg)",
        border: "1px solid var(--color-border-subtle)",
        fontSize: "var(--type-body-sm)",
        maxWidth: "75%",
      }}
    >
      <span style={{ color: s.color, fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: "var(--color-text-primary)", fontWeight: 500 }}>
          {toolName}
        </p>
        <p style={{ margin: "2px 0 0", color: s.color, fontSize: "var(--type-label-sm)" }}>
          {s.label}
        </p>
        {result && (
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: "var(--type-label-sm)" }}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
