// Reusable card wrapper — enforces design system border radius and surface colors.
// Use this instead of repeating rounded-2xl + background + border on every div.

import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Use for larger border radius (hero cards) */
  variant?: "default" | "hero";
  /** Adds hover lift animation */
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", style, variant = "default", hover, onClick }: CardProps) {
  const radius = variant === "hero" ? "rounded-[2rem]" : "rounded-2xl";
  const hoverClass = hover ? "transition-all duration-200 hover:-translate-y-0.5 cursor-pointer" : "";
  const El = onClick ? "button" : "div";

  return (
    <El
      className={`${radius} ${hoverClass} surface-primary ${className}`}
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
        ...style,
      }}
      onClick={onClick as any}
    >
      {children}
    </El>
  );
}
