"use client";

import { useRouter } from "next/navigation";

interface ActionTilesProps {
  cardsDue: number;
  quizAvg: number;
}

const actions = [
  {
    key: "review",
    label: "Daily Review",
    desc: (due: number) => due > 0 ? `${due} card${due !== 1 ? "s" : ""} waiting` : "All caught up!",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: "/review",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    bg: "rgba(99,102,241,0.08)",
    badge: (due: number) => due > 0 ? `${due}` : null,
  },
  {
    key: "quiz",
    label: "Take a Quiz",
    desc: (due: number, avg: number) => avg > 0 ? `Your average: ${avg}%` : "Test your knowledge",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    href: "/quiz",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
    bg: "rgba(5,150,105,0.08)",
    badge: null,
  },
  {
    key: "chat",
    label: "AI Language Coach",
    desc: () => "Practice conversations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    href: "/chat",
    gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    bg: "rgba(14,165,233,0.08)",
    badge: null,
  },
];

export function ActionTiles({ cardsDue, quizAvg }: ActionTilesProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Quick Actions
      </p>
      {actions.map((action) => {
        const badge = action.badge ? action.badge(cardsDue) : null;
        return (
          <button
            key={action.key}
            onClick={() => router.push(action.href)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group relative overflow-hidden"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            {/* Color accent line on hover */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: action.gradient }}
            />

            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ background: action.bg, color: "var(--color-text)" }}
            >
              {action.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  {action.label}
                </span>
                {badge && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {action.desc(cardsDue, quizAvg)}
              </p>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
              style={{ color: "var(--color-text-muted)" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
