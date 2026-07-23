/**
 * ChartContainer — Wrapper with title, loading/empty/error states
 */

"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  error?: string;
  onRetry?: () => void;
  height?: number;
}

export function ChartContainer({ title, children, loading, empty, error, onRetry, height = 250 }: ChartContainerProps) {
  return (
    <div style={{
      padding: "var(--space-4)",
      borderRadius: "var(--radius-md)",
      background: "var(--color-surface-1)",
      border: "1px solid var(--color-border-subtle)",
    }}>
      <h3 style={{ margin: 0, marginBottom: "var(--space-3)", fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </h3>

      {loading ? (
        <Skeleton variant="custom" style={{ height }}>
          <div style={{ height: "100%", display: "flex", alignItems: "flex-end", gap: "var(--space-2)", padding: "var(--space-2)" }}>
            {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
              <div key={i} className="shimmer" style={{ flex: 1, height: `${h}%`, borderRadius: "var(--radius-xs)" }} />
            ))}
          </div>
        </Skeleton>
      ) : empty ? (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "var(--type-body-sm)" }}>
          No data available
        </div>
      ) : error ? (
        <div style={{ height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}>
          <span style={{ color: "var(--color-error-text)", fontSize: "var(--type-body-sm)" }}>{error}</span>
          {onRetry && (
            <button onClick={onRetry} style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: "var(--type-label-sm)", fontWeight: 600 }}>
              Retry
            </button>
          )}
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}
