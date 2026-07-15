/**
 * Grid — Responsive grid system (12/8/4 columns).
 * Desktop: 12 columns | Tablet: 8 columns | Mobile: 4 columns
 * Spacing: canonical spacing tokens
 */

import type { CSSProperties, ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  /** Number of columns on desktop (1-12). Default: auto-fill */
  cols?: number;
  /** Gap between items (uses spacing tokens) */
  gap?: string;
  className?: string;
  style?: CSSProperties;
}

export function Grid({ children, cols, gap = "var(--space-4)", className = "", style }: GridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : "repeat(auto-fill, minmax(280px, 1fr))",
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface GridItemProps {
  children: ReactNode;
  /** Number of columns to span on desktop */
  span?: number;
  className?: string;
  style?: CSSProperties;
}

export function GridItem({ children, span = 1, className = "", style }: GridItemProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: `span ${span}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
