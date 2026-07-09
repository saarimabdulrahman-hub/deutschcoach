"use client";

import { useEffect, useState, useRef } from "react";
import type { DashboardData } from "@/types";

function CountUpValue({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const numValue = typeof value === "string" ? parseInt(value) : value;
    if (isNaN(numValue)) { setDisplayValue(numValue as any); return; }
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const duration = 1000;
          const start = performance.now();
          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(Math.round(numValue * eased));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{typeof value === "string" && isNaN(parseInt(value)) ? value : displayValue}</span>;
}

export function StatsGrid({ data }: { data: DashboardData }) {
  const cards = [
    {
      label: "Streak",
      value: data.streak,
      suffix: " days",
      icon: "🔥",
      bg: "rgba(245,158,11,0.08)",
      color: "#f59e0b",
    },
    {
      label: "Cards Due",
      value: data.cards_due_today,
      suffix: "",
      icon: "🃏",
      bg: "rgba(99,102,241,0.08)",
      color: "#6366f1",
    },
    {
      label: "Quiz Average",
      value: data.avg_quiz_score,
      suffix: "%",
      icon: "✅",
      bg: "rgba(34,197,94,0.08)",
      color: "#22c55e",
    },
    {
      label: "Progress",
      value: data.level_progress_pct,
      suffix: "%",
      icon: "📊",
      bg: "rgba(139,92,246,0.08)",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: card.bg }}
            >
              {card.icon}
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              {card.label}
            </span>
          </div>
          <div className="text-3xl font-bold flex items-baseline gap-0.5" style={{ color: "var(--color-text)" }}>
            <CountUpValue value={card.value} />
            {card.suffix && (
              <span className="text-sm font-medium" style={{ color: card.color }}>{card.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
