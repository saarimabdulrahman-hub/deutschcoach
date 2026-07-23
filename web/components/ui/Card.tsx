/**
 * Card — Canonical primitive component
 * Variants: Basic, Interactive, Selectable, Media, Analytics, Pricing, Glass
 * States: Default, Hover, Focus, Active, Selected, Disabled, Loading
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/005_Card.md
 */

import type { CSSProperties, ReactNode } from "react";

type CardVariant = "basic" | "interactive" | "selectable" | "media" | "analytics" | "pricing" | "glass";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, CSSProperties> = {
  basic: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-1)",
  },
  interactive: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-1)",
    cursor: "pointer",
    transition: "transform var(--duration-fast) ease-out, box-shadow var(--duration-fast) ease-out",
  },
  selectable: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-1)",
    cursor: "pointer",
    transition: "all var(--duration-fast) ease-out",
  },
  media: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-2)",
    overflow: "hidden",
  },
  analytics: {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-1)",
    padding: "var(--space-4)",
  },
  pricing: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), var(--color-surface-1)",
    border: "1px solid var(--color-border-strong)",
    boxShadow: "var(--elevation-2)",
    textAlign: "center",
  },
  glass: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
    border: "1px solid rgba(186, 120, 255, 0.18)",
    boxShadow: "0 0 35px rgba(168,85,247,.06)",
    backdropFilter: "blur(4px)",
  },
};

export function Card({
  children,
  variant = "basic",
  selected,
  disabled,
  loading,
  className = "",
  style,
  onClick,
}: CardProps) {
  const El = onClick ? "button" : "div";

  const resolvedStyle: CSSProperties = {
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    ...variantStyles[variant],
    ...(selected ? { borderColor: "var(--color-accent)", boxShadow: "0 0 0 1px var(--color-accent)" } : {}),
    ...(disabled ? { opacity: 0.4, pointerEvents: "none" as const } : {}),
    ...(loading ? { opacity: 0.7 } : {}),
    ...(variant === "glass" ? { borderRadius: "var(--radius-lg)" } : {}),
    ...style,
  };

  return (
    <El
      className={className}
      style={resolvedStyle}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={(e) => {
        if (variant === "interactive" && !disabled) {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--elevation-2)";
        }
        if (variant === "selectable" && !disabled) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "interactive" && !disabled) {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--elevation-1)";
        }
        if (variant === "selectable" && !disabled && !selected) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
        }
      }}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="shimmer" style={{ height: "12px", width: "60%", borderRadius: "var(--radius-xs)" }} />
          <div className="shimmer" style={{ height: "8px", width: "40%", borderRadius: "var(--radius-xs)" }} />
          <div className="shimmer" style={{ height: "32px", width: "100%", borderRadius: "var(--radius-sm)", marginTop: "var(--space-2)" }} />
        </div>
      ) : (
        children
      )}
    </El>
  );
}
