/**
 * AnalyticsLayout — Analytics Workspace layout per 03_LAYOUTS/004
 * Desktop: filters + KPI strip + chart grid + detail drawer
 * Tablet: simplified layout
 * Mobile: fully stacked
 */

"use client";

import { useState, type ReactNode } from "react";

interface AnalyticsLayoutProps {
  filters: ReactNode;
  kpiStrip: ReactNode;
  chartGrid: ReactNode;
  detailDrawer?: ReactNode;
}

export function AnalyticsLayout({ filters, kpiStrip, chartGrid, detailDrawer }: AnalyticsLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Global filters */}
      <div className="analytics-filters" style={{
        display: "flex", flexWrap: "wrap", gap: "var(--space-3)",
        alignItems: "center", padding: "var(--space-3)",
        borderRadius: "var(--radius-md)", background: "var(--color-surface-1)",
        border: "1px solid var(--color-border-subtle)",
      }}>
        {filters}
      </div>

      {/* KPI strip */}
      <div className="analytics-kpi" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "var(--space-3)",
      }}>
        {kpiStrip}
      </div>

      {/* Chart grid */}
      <div className="analytics-charts" style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "var(--space-4)",
      }}>
        {chartGrid}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .analytics-charts { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* Detail drawer */}
      {detailDrawer && drawerOpen && (
        <div style={{
          position: "fixed", right: 0, top: 0, bottom: 0, width: "400px", maxWidth: "100vw",
          zIndex: "var(--z-overlay)", background: "var(--color-surface-1)",
          borderLeft: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--elevation-3)", overflowY: "auto",
          animation: "slideInRight 0.2s ease-out",
        }}>
          <div style={{ padding: "var(--space-4)" }}>
            <button onClick={() => setDrawerOpen(false)}
              style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "20px", float: "right" }}>
              ✕
            </button>
            {detailDrawer}
          </div>
        </div>
      )}
    </div>
  );
}
