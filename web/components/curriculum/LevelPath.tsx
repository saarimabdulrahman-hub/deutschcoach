"use client";

interface LevelPathProps {
  levels: { level: string; title: string; lesson_count: number; completed_count: number }[];
  currentLevel: string;
  onSelect: (level: string) => void;
}

function MiniRing({ pct, size }: { pct: number; size: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isDone = pct >= 100;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="3" />
        {pct > 0 && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={isDone ? "#22c55e" : "url(#pathGradient)"} strokeWidth="3"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isDone ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-[10px] font-bold" style={{ color: "var(--color-text-muted)" }}>{pct}%</span>
        )}
      </div>
    </div>
  );
}

export function LevelPath({ levels, currentLevel, onSelect }: LevelPathProps) {
  const levelMeta: Record<string, { emoji: string; name: string }> = {
    A1: { emoji: "🌱", name: "Beginner" },
    A2: { emoji: "🌿", name: "Elementary" },
    B1: { emoji: "🌳", name: "Intermediate" },
    B2: { emoji: "🎯", name: "Upper Int." },
    C1: { emoji: "🏆", name: "Advanced" },
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
      <svg className="hidden sm:block absolute" width="0" height="0">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {levels.map((lvl, i) => {
        const pct = lvl.lesson_count > 0 ? Math.round((lvl.completed_count / lvl.lesson_count) * 100) : 0;
        const isCurrent = lvl.level === currentLevel;
        const isCompleted = pct >= 100;
        const isComingSoon = lvl.lesson_count === 0; // no fake locks — either it has content or it's coming soon

        return (
          <div key={lvl.level} className="flex-1 flex sm:flex-col items-center gap-3 sm:gap-2 relative">
            {/* Connector line between milestones */}
            {i < levels.length - 1 && (
              <div className="hidden sm:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5"
                style={{ background: isCompleted ? "#22c55e" : "var(--color-border)", zIndex: 0 }} />
            )}

            <button
              onClick={() => !isComingSoon && onSelect(lvl.level)}
              disabled={isComingSoon}
              className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 p-2 sm:p-0 transition-all hover:scale-105 disabled:cursor-default"
              aria-label={`${lvl.level} — ${levelMeta[lvl.level]?.name}${isComingSoon ? " (coming soon)" : ""}`}
            >
              {/* Milestone circle */}
              <div className="rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  width: 48, height: 48,
                  background: isCompleted ? "rgba(34,197,94,0.15)" :
                    isCurrent ? "rgba(124,58,237,0.2)" :
                    isComingSoon ? "var(--color-border)" : "var(--color-card-bg)",
                  border: isCompleted ? "2px solid rgba(34,197,94,0.4)" :
                    isCurrent ? "2px solid rgba(124,58,237,0.5)" :
                    "1px solid var(--color-border)",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
                  opacity: isComingSoon ? 0.5 : 1,
                }}
              >
                <span className="text-xl">{levelMeta[lvl.level]?.emoji || "📚"}</span>
              </div>

              {/* Label */}
              <div className="text-left sm:text-center">
                <p className="text-sm font-bold leading-tight" style={{
                  color: "var(--color-text)",
                  opacity: isComingSoon ? 0.5 : 1,
                }}>
                  {lvl.level}
                </p>
                <p className="text-[10px] leading-tight hidden sm:block" style={{
                  color: "var(--color-text-muted)",
                }}>
                  {isComingSoon ? "Coming soon" : (levelMeta[lvl.level]?.name || lvl.title)}
                </p>
              </div>
            </button>

            {/* Mini progress ring — desktop only, hidden for coming-soon */}
            {!isComingSoon && (
              <div className="hidden sm:block">
                <MiniRing pct={pct} size={32} />
              </div>
            )}

            {/* Mobile: inline progress fraction */}
            <span className="sm:hidden text-xs" style={{ color: "var(--color-text-muted)" }}>
              {isComingSoon ? "Soon" : `${lvl.completed_count}/${lvl.lesson_count}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
