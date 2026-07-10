"use client";

import { useRouter } from "next/navigation";

interface Props {
  levelPct: number;
  streak: number;
  cardsDue: number;
  quizAvg: number;
  weakestCount: number;
}

function Ring({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="progGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#progGradient)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 6px rgba(124,58,237,0.2))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>{pct}%</span>
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          complete
        </span>
      </div>
    </div>
  );
}

function InsightRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-lg flex-shrink-0 w-7 text-center">{icon}</span>
      <div className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

function milestoneMessage(pct: number): string {
  if (pct >= 100) return "Level complete — advance to the next level!";
  if (pct >= 75) return "Almost there — just a few more lessons";
  if (pct >= 50) return "Over halfway — keep the momentum";
  if (pct >= 25) return "Making great progress";
  return "You're getting started — keep going!";
}

export function ProgressOverview({ levelPct, streak, cardsDue, quizAvg, weakestCount }: Props) {
  const router = useRouter();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Your Progress
      </p>

      <div className="rounded-2xl p-5 sm:p-6 surface-elevated"
        style={{ border: "1px solid var(--color-border)" }}>

        {/* Top: Ring + summary */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 mb-5 sm:mb-6">
          <Ring pct={levelPct} />

          <div className="flex-1 text-center sm:text-left">
            <p className="text-base sm:text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>
              {levelPct === 0
                ? "Ready to begin"
                : levelPct >= 100
                  ? "Level mastered!"
                  : `${milestoneMessage(levelPct)}`}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {levelPct === 0
                ? "Start your first lesson to see your progress here"
                : levelPct >= 100
                  ? "You've completed every lesson in this level. Time to advance."
                  : `You're ${levelPct}% through your current CEFR level.`}
            </p>

            {/* Milestone bar */}
            {levelPct > 0 && levelPct < 100 && (
              <div className="mt-3 max-w-xs">
                <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${levelPct}%`, background: "var(--color-accent-gradient)" }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>0%</span>
                  <span className="text-[10px] font-semibold" style={{ color: "var(--color-brand-purple)" }}>
                    Next: {levelPct >= 75 ? "Complete level" : levelPct >= 50 ? "75%" : "50%"}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>100%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-4" style={{ borderColor: "var(--color-border)" }} />

        {/* Bottom: Narrative insights */}
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {/* Streak */}
          <InsightRow icon="🔥">
            {streak > 0 ? (
              <>
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>{streak}-day streak</span>
                {" — "}come back tomorrow to keep it going
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>No streak yet</span>
                {" — "}practice today to start one
              </>
            )}
          </InsightRow>

          {/* Cards due */}
          <InsightRow icon="🃏">
            {cardsDue > 0 ? (
              <>
                <span style={{ color: "var(--color-accent-light)", fontWeight: 600 }}>{cardsDue} card{cardsDue !== 1 ? "s" : ""}</span>
                {" ready for review "}
                <span style={{ color: "var(--color-text-muted)" }}>
                  (~{Math.max(1, Math.round(cardsDue / 5))} min)
                </span>
                {" — "}
                <button onClick={() => router.push("/review")} className="hover:underline"
                  style={{ color: "var(--color-accent-light)" }}>
                  start now
                </button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>All caught up</span>
                {" — no cards due right now"}
              </>
            )}
          </InsightRow>

          {/* Quiz accuracy */}
          <InsightRow icon="✅">
            {quizAvg > 0 ? (
              <>
                <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Quiz average: {quizAvg}%</span>
                {" — "}
                {quizAvg >= 80 ? "you're doing great!" : quizAvg >= 60 ? "steady improvement" : "keep practicing — you'll get there"}
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>No quizzes yet</span>
                {" — "}
                <button onClick={() => router.push("/quiz")} className="hover:underline"
                  style={{ color: "var(--color-accent-light)" }}>
                  take your first quiz
                </button>
              </>
            )}
          </InsightRow>

          {/* Vocabulary */}
          <InsightRow icon="📝">
            {weakestCount > 0 ? (
              <>
                <span style={{ color: "#f472b6", fontWeight: 600 }}>{weakestCount} word{weakestCount !== 1 ? "s" : ""}</span>
                {" to practice — "}
                <button onClick={() => router.push("/review")} className="hover:underline"
                  style={{ color: "var(--color-accent-light)" }}>
                  review now
                </button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>No vocabulary yet</span>
                {" — complete a lesson to build your word bank"}
              </>
            )}
          </InsightRow>
        </div>
      </div>
    </div>
  );
}
