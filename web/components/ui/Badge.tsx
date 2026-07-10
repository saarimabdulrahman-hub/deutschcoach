// Reusable badge/pill/chip — replaces the 20+ duplicated rounded-full spans across the app.

import type { CSSProperties, ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
}

const styles: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: "var(--color-active-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-badge-bg)" },
  accent:  { bg: "var(--color-accent-gradient)", color: "#fff", border: "none" },
  success: { bg: "rgba(34,197,94,0.1)", color: "var(--color-success)", border: "1px solid rgba(34,197,94,0.2)" },
  warning: { bg: "rgba(245,158,11,0.1)", color: "var(--color-warning)", border: "1px solid rgba(245,158,11,0.2)" },
  error:   { bg: "var(--color-error-bg)", color: "var(--color-error-text)", border: "1px solid var(--color-error-border)" },
  outline: { bg: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" },
};

const sizeClasses = { sm: "text-[10px] px-2 py-0.5", md: "text-xs px-2.5 py-1" };

export function Badge({ children, variant = "default", size = "md", className = "", style }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]} ${className}`}
      style={{ background: s.bg, color: s.color, border: s.border, ...style }}
    >
      {children}
    </span>
  );
}
