/**
 * KPICard — Reusable KPI card with icon, value, trend
 * Reference: 12_DATA_VISUALIZATION_SYSTEM/004_KPI_Cards.md
 */

"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface KPICardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  iconBg?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function KPICard({ icon, label, value, trend, iconBg, loading, onClick }: KPICardProps) {
  if (loading) {
    return (
      <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-surface-1)", border: "1px solid var(--color-border-subtle)" }}>
        <Skeleton variant="text" lines={2} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 50%), var(--color-surface-1)",
        border: "1px solid var(--color-border-subtle)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease",
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--elevation-2)"; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "var(--radius-sm)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", flexShrink: 0,
          background: iconBg || "var(--color-hover-bg)",
        }}>
          {icon}
        </div>
        <span style={{ fontSize: "var(--type-label-sm)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
        <span style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: "var(--type-label-sm)", fontWeight: 600, color: trend.positive ? "var(--color-success)" : "var(--color-error)" }}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
