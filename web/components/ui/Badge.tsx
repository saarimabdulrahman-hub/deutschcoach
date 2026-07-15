/**
 * Badge — Canonical primitive component
 * Sizes: XS, SM, MD
 * Variants: Default, Accent, Success, Warning, Error, Info, Outline
 * Radius: radius-pill (999px)
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/006_Badge.md
 */

import type { CSSProperties, ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "error" | "info" | "outline";
type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  style?: CSSProperties;
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: { background: "var(--color-badge-bg)", color: "var(--color-badge-text)", border: "1px solid var(--color-badge-bg)" },
  accent: { background: "var(--color-accent-gradient)", color: "#fff", border: "none" },
  success: { background: "rgba(46,213,115,0.1)", color: "var(--color-success)", border: "1px solid rgba(46,213,115,0.2)" },
  warning: { background: "rgba(243,156,18,0.1)", color: "var(--color-warning)", border: "1px solid rgba(243,156,18,0.2)" },
  error: { background: "var(--color-error-bg)", color: "var(--color-error-text)", border: "1px solid var(--color-error-border)" },
  info: { background: "rgba(77,163,255,0.1)", color: "var(--color-info)", border: "1px solid rgba(77,163,255,0.2)" },
  outline: { background: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-border-subtle)" },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
  xs: { fontSize: "var(--type-caption)", padding: "1px 6px", lineHeight: "1.2" },
  sm: { fontSize: "var(--type-label-sm)", padding: "2px 8px" },
  md: { fontSize: "var(--type-label-md)", padding: "2px 10px" },
};

export function Badge({ children, variant = "default", size = "md", className = "", style }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--radius-pill)",
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
