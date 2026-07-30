"use client";

import type { ConfidenceLevel } from "@/hooks/useConfidence";

// Confidence badge (Section 10.1). Displays learner confidence as Low / Medium / High.
// Used in lesson stages to show adaptive concept strength.

interface ConfidenceBadgeProps {
  level: ConfidenceLevel | null;
  /** Optional score to show in tooltip */
  score?: number | null;
  size?: "sm" | "md";
}

const STYLES: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "rgba(34,197,94,0.12)", color: "#4ADE80", label: "High" },
  medium: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24", label: "Medium" },
  low:    { bg: "rgba(255,71,87,0.12)", color: "#FF6B77", label: "Low" },
};

export function ConfidenceBadge({ level, score, size = "sm" }: ConfidenceBadgeProps) {
  if (!level) return null;

  const style = STYLES[level];
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding = size === "sm" ? "2px 8px" : "3px 10px";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider"
      style={{
        fontSize,
        padding,
        background: style.bg,
        color: style.color,
      }}
      title={score !== null && score !== undefined ? `${score}%` : style.label}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />
      {style.label}
    </span>
  );
}
