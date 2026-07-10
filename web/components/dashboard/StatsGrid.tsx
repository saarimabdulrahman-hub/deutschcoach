"use client";

import { useEffect, useState, useRef } from "react";
import type { DashboardData } from "@/types";

function CountUpValue({ value }: { value: number | string }) {
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

function StatCard({ label, value, suffix, icon, bg }: {
  label: string;
  value: number | string;
  suffix: string;
  icon: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0"
          style={{ background: bg }}
        >
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold flex items-baseline gap-0.5" style={{ color: "var(--color-text)" }}>
        <CountUpValue value={value} />
        {suffix && (
          <span className="text-xs sm:text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function LevelRing({ pct }: { pct: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-full aspect-square max-w-[80px] sm:max-w-[100px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke="url(#statsLevelGradient)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="statsLevelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text)" }}>{pct}%</span>
      </div>
    </div>
  );
}

export function StatsGrid({ data }: { data: DashboardData }) {
  const cards = [
    { label: "Streak", value: data.streak, suffix: " days", icon: "🔥", bg: "rgba(245,158,11,0.08)" },
    { label: "Cards Due", value: data.cards_due_today, suffix: "", icon: "🃏", bg: "rgba(99,102,241,0.08)" },
    { label: "Quiz Avg", value: data.avg_quiz_score, suffix: "%", icon: "✅", bg: "rgba(34,197,94,0.08)" },
  ];

  return (
    <>
      {/* Mobile + Tablet: 2x2 grid (3 KPI cards + level ring) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        {/* Level ring as a card in the grid on mobile/tablet */}
        <div
          className="rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-center items-center"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-3 text-center" style={{ color: "var(--color-text-muted)" }}>
            Level
          </p>
          <LevelRing pct={data.level_progress_pct} />
          <p className="text-[10px] sm:text-xs text-center mt-2" style={{ color: "var(--color-text-muted)" }}>
            {data.level_progress_pct < 25 ? "Getting started" : data.level_progress_pct < 75 ? "In progress" : "Almost there"}
          </p>
        </div>
      </div>

      {/* Desktop: 5-card flex row */}
      <div className="hidden lg:flex gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        <div
          className="flex-1 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-center"
          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-4 text-center" style={{ color: "var(--color-text-muted)" }}>
            Level
          </p>
          <LevelRing pct={data.level_progress_pct} />
          <p className="text-xs text-center mt-3" style={{ color: "var(--color-text-muted)" }}>
            {data.level_progress_pct < 25 ? "Getting started" : data.level_progress_pct < 75 ? "In progress" : "Almost there"}
          </p>
        </div>
      </div>
    </>
  );
}
