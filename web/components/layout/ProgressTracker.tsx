/**
 * ProgressTracker — Progress bar with smooth fill animation
 * Uses accent gradient, announces changes to screen readers
 */

"use client";

interface ProgressTrackerProps {
  percent: number;
  /** Optional label shown next to bar */
  label?: string;
}

export function ProgressTracker({ percent, label }: ProgressTrackerProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "6px var(--space-4)",
        background: "var(--color-surface-1)",
        borderBottom: "1px solid var(--color-border-subtle)",
        flexShrink: 0,
      }}
    >
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clamped}% complete`}
        style={{
          flex: 1,
          height: "6px",
          borderRadius: "var(--radius-pill)",
          background: "var(--color-border-subtle)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: "var(--radius-pill)",
            background: "var(--color-accent-gradient)",
            transition: "width 0.3s ease",
            boxShadow: "0 0 6px var(--color-accent-glow)",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          {label}
        </span>
      )}
      <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-accent-text)", fontWeight: 600, whiteSpace: "nowrap" }}>
        {clamped}%
      </span>
    </div>
  );
}
