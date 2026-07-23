/**
 * LineChart — Recharts line chart wrapper
 */

"use client";

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface LineChartProps {
  data: Record<string, any>[];
  xKey: string;
  lines: { key: string; color: string; label: string }[];
  height?: number;
}

export function LineChart({ data, xKey, lines, height = 250 }: LineChartProps) {
  const reduced = useReducedMotion();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            name={l.label}
            strokeWidth={2}
            dot={false}
            isAnimationActive={!reduced}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
