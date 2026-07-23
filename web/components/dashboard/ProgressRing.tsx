"use client";

interface ProgressRingProps {
  pct: number;
}

export function ProgressRing({ pct }: ProgressRingProps) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="ringShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#f9a8d4" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#d946ef" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#ringShine)" strokeWidth="1.6" style={{ filter: "drop-shadow(0 0 3px rgba(217,70,239,0.4))" }} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#prg)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 6px rgba(123,63,251,0.3))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: "#fff" }}>{pct}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--color-text-muted)" }}>Complete</span>
      </div>
    </div>
  );
}
