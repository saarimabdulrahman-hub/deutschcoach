/**
 * ReviewSidebar — Exclusive sidebar for the Review page.
 * Navigation, progress cards, and Emma AI Tutor.
 */

"use client";

import { useRouter } from "next/navigation";

interface ReviewSidebarProps {
  activeItem?: string;
  streak?: number;
}

// ── SVG Icons ────────────────────────────────────────────────────────

const ICONS = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor"/>
    </svg>
  ),
  "spaced-repetition": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 6V9L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  flashcards: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.45"/>
      <rect x="5.5" y="3.5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    </svg>
  ),
  mistakes: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  "weak-words": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 4L14 9L7 14V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M3 5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  bookmarks: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2V16L9 12.5L14 16V2H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
};

const REVIEW_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "spaced-repetition", label: "Spaced Repetition" },
  { id: "flashcards", label: "Flashcards" },
  { id: "mistakes", label: "Mistakes" },
  { id: "weak-words", label: "Weak Words" },
  { id: "bookmarks", label: "Bookmarks" },
];

// Mini weekly chart bars
const WEEK_BARS = [12, 24, 36, 28, 45, 58, 72];
const WEEK_LABELS = ["W", "T", "F", "S", "S", "M", "T"];

export function ReviewSidebar({ activeItem = "overview", streak = 0 }: ReviewSidebarProps) {
  const router = useRouter();

  return (
    <aside
      className="flex flex-col h-full overflow-y-auto hidden lg:flex"
      style={{
        width: "270px",
        minWidth: "270px",
        background: "rgba(8,10,24,.95)",
        borderRight: "1px solid rgba(255,255,255,.04)",
      }}
    >
      {/* ── REVIEW TOOLS ── */}
      <div className="px-5 mb-6">
        <nav className="flex flex-col gap-0.5">
          {REVIEW_ITEMS.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.id === "overview" ? "/review" : `/review/${item.id}`)}
                className="flex items-center gap-3 w-full text-left px-3 transition-all"
                style={{
                  height: "44px",
                  borderRadius: "10px",
                  background: isActive ? "rgba(168,85,247,.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderLeft: isActive ? "3px solid #EC4899" : "3px solid transparent",
                  boxShadow: isActive ? "0 0 16px rgba(168,85,247,.08)" : "none",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: isActive ? "#FFF" : "#A8A4BC" }}>
                  {ICONS[item.id as keyof typeof ICONS]}
                </span>
                <span style={{ fontSize: "13px", fontWeight: isActive ? 500 : 400, color: isActive ? "#FFF" : "#A8A4BC" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Emma AI Tutor Card ── */}
      <div className="px-5 mb-4">
        <div
          className="rounded-2xl p-5 flex flex-col items-center"
          style={{
            background: "rgba(16,18,32,.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,.04)",
          }}
        >
          {/* Avatar — large and centered */}
          <div className="rounded-full flex-shrink-0 flex items-center justify-center" style={{ width: "156px", height: "156px", boxShadow: "0 0 40px rgba(168,85,247,.3), 0 0 80px rgba(168,85,247,.1)", background: "rgba(168,85,247,.08)" }}>
            <div className="rounded-full overflow-hidden" style={{ width: "140px", height: "140px", border: "2px solid rgba(168,85,247,.3)" }}>
              <img src="/emma-avatar.webp" alt="Emma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
          {/* Name + title below avatar */}
          <p className="text-base font-semibold m-0 mt-4" style={{ color: "#FFF" }}>Emma</p>
          <p className="text-xs font-medium m-0 mt-0.5 mb-4" style={{ color: "rgba(168,85,247,.6)" }}>Your AI German Tutor</p>
          {/* CTA button */}
          <button
            onClick={() => router.push("/chat")}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)",
              color: "#FFF",
              boxShadow: "0 4px 20px rgba(168,85,247,.2)",
            }}
          >
            Chat with Emma
          </button>
        </div>
      </div>

      {/* ── Current Streak Card ── */}
      <div className="px-5 mb-6">
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "rgba(16,18,32,.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,.04)",
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[1.5px] mb-3" style={{ color: "rgba(255,255,255,.3)" }}>Current Streak</p>
          <div className="text-2xl mb-1" style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,.4))" }}>🔥</div>
          <p className="text-2xl font-semibold m-0" style={{ color: "#FFF" }}>{streak} Days</p>
          <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,.3)" }}>Keep it up!</p>

          {/* Mini chart — pink→violet rounded bars */}
          <div className="flex items-end gap-1 h-10">
            {WEEK_BARS.map((h, i) => {
              const maxH = Math.max(...WEEK_BARS);
              const pct = (h / maxH) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${pct}%`,
                      minHeight: "4px",
                      borderRadius: "3px 3px 0 0",
                      background: "linear-gradient(180deg, #EC4899 0%, #C84DE8 50%, #8B5CF6 100%)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {WEEK_LABELS.map((d, i) => (
              <span key={i} className="text-[8px]" style={{ color: "rgba(255,255,255,.2)" }}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
