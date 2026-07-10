// Reusable progress bar — replaces duplicated thin gradient progress bars across the app.

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Height in Tailwind units, e.g. "h-1.5" or "h-2" */
  height?: string;
  /** Override the default accent gradient */
  color?: string;
  className?: string;
  /** Show percentage label next to the bar */
  showLabel?: boolean;
}

export function ProgressBar({ value, height = "h-1.5", color, className = "", showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const fill = color || "var(--color-accent-gradient)";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 ${height} rounded-full`} style={{ background: "var(--color-border)" }}>
        <div
          className={`${height} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: fill }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
