/**
 * Skeleton — Canonical primitive component
 * Variants: Text, Card, List, Table, Dashboard, Custom
 * Shimmer animation respects prefers-reduced-motion
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/020_Skeleton_Loader.md
 */

import type { CSSProperties, ReactNode } from "react";

type SkeletonVariant = "text" | "card" | "list" | "table" | "dashboard" | "custom";

interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Number of lines (for text variant) */
  lines?: number;
  className?: string;
  style?: CSSProperties;
  /** Custom content for 'custom' variant */
  children?: ReactNode;
}

function SkeletonLine({ width, height }: { width?: string; height?: string }) {
  return (
    <div
      className="shimmer"
      style={{
        height: height || "12px",
        width: width || "100%",
        borderRadius: "var(--radius-xs)",
      }}
    />
  );
}

function CardSkeleton() {
  return (
    <div
      style={{
        padding: "var(--space-4)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-1)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <SkeletonLine width="60%" height="14px" />
      <SkeletonLine width="40%" />
      <SkeletonLine width="80%" />
      <div style={{ height: "var(--space-2)" }} />
      <SkeletonLine width="100%" height="36px" />
    </div>
  );
}

function ListSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            className="shimmer"
            style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <SkeletonLine width="50%" height="12px" />
            <SkeletonLine width="30%" height="10px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-2) 0" }}>
        {[30, 50, 20].map((w, i) => (
          <SkeletonLine key={i} width={`${w}%`} height="12px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "var(--space-4)",
            padding: "var(--space-3) 0",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          {[30, 50, 20].map((w, j) => (
            <SkeletonLine key={j} width={`${w}%`} height="10px" />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      {/* Chart area */}
      <div
        className="shimmer"
        style={{
          height: "200px",
          borderRadius: "var(--radius-md)",
        }}
      />
      {/* Table area */}
      <TableSkeleton rows={3} />
    </div>
  );
}

export function Skeleton({ variant = "text", lines = 3, className, style, children }: SkeletonProps) {
  const baseStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
    ...style,
  };

  switch (variant) {
    case "card":
      return <CardSkeleton />;
    case "list":
      return <ListSkeleton lines={lines} />;
    case "table":
      return <TableSkeleton rows={lines} />;
    case "dashboard":
      return <DashboardSkeleton />;
    case "custom":
      return <div className={className} style={{ ...baseStyle, ...style }}>{children}</div>;
    case "text":
    default:
      return (
        <div className={className} style={baseStyle}>
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLine key={i} width={i === lines - 1 ? "60%" : "100%"} />
          ))}
        </div>
      );
  }
}
