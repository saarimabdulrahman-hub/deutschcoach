/**
 * BarChart — Recharts bar chart wrapper
 */

"use client";

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BarChartProps {
  data: Record<string, any>[];
  xKey: string;
  bars: { key: string; color: string; label: string }[];
  height?: number;
  stacked?: boolean;
}

export function BarChart({ data, xKey, bars, height = 250, stacked }: BarChartProps) {
  const reduced = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={{ stroke: "var(--color-border-subtle)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
          }}
        />
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            fill={b.color}
            name={b.label}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
            isAnimationActive={!reduced}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
