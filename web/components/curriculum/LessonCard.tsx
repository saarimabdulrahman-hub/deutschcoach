"use client";

import { useRouter } from "next/navigation";
import { Check } from "@/components/ui/Icons";

type LessonState = "completed" | "current" | "available" | "coming-soon" | "future";

interface LessonCardProps {
  id: number;
  title: string;
  level: string;
  unit: number;
  order: number;
  topics: string[];
  completed: boolean;
  isNext: boolean;
  index: number;
  minutes?: number;    // duration estimate; defaults to the documented placeholder (Sprint 5.3A)
  state?: LessonState; // optional explicit override for coming-soon / future
}

// Derive a plain-language learning OUTCOME from lesson topics (metadata only).
// Known topics map to a capability; unknown topics fall back to their own
// title-cased label — nothing is fabricated for data we don't have.
const OUTCOME_MAP: Record<string, string> = {
  greetings: "Greet people", introductions: "Introduce yourself",
  numbers: "Count in German", family: "Talk about your family",
  food: "Order food & drinks", restaurant: "Order food & drinks",
  articles: "Use der / die / das", pronouns: "Use personal pronouns",
  verbs: "Conjugate common verbs", conjugation: "Conjugate common verbs",
  questions: "Ask simple questions", time: "Tell the time", dates: "Talk about dates",
  colors: "Describe colours", directions: "Ask for directions",
  shopping: "Go shopping", travel: "Get around while travelling",
  work: "Talk about work", hobbies: "Talk about hobbies",
  weather: "Describe the weather", home: "Describe where you live",
};
const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
function outcomeFor(topics: string[]): string {
  if (!topics?.length) return "";
  return topics.slice(0, 2).map((t) => OUTCOME_MAP[t.toLowerCase()] || titleCase(t)).join(" · ");
}

const STATUS_LABEL: Record<LessonState, string> = {
  completed: "Completed", current: "Current", available: "Available",
  "coming-soon": "Coming soon", future: "Future unit",
};
const CTA: Record<LessonState, string> = {
  completed: "Review lesson", current: "Start lesson", available: "Open lesson",
  "coming-soon": "", future: "",
};
const ARIA_STATUS: Record<LessonState, string> = {
  completed: "Completed", current: "Your next lesson", available: "Available",
  "coming-soon": "Coming soon", future: "Future unit",
};

export function LessonCard({ id, title, level, unit, order, topics, completed, isNext, index, minutes = 10, state }: LessonCardProps) {
  void order; // part of the API shape; numbering uses `index`
  const router = useRouter();
  const s: LessonState = state ?? (completed ? "completed" : isNext ? "current" : "available");
  const interactive = s !== "coming-soon" && s !== "future";
  const go = () => { if (interactive) router.push(`/curriculum/${level.toLowerCase()}/${id}`); };
  const outcome = outcomeFor(topics);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Lesson ${index}: ${title}. ${outcome ? outcome + ". " : ""}${ARIA_STATUS[s]}. About ${minutes} minutes.`}
      aria-disabled={interactive ? undefined : true}
      onClick={go}
      onKeyDown={(e) => { if (interactive && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(); } }}
      className={`group relative rounded-2xl transition-all duration-200 ${interactive ? "hover:-translate-y-0.5" : ""}`}
      style={{
        cursor: interactive ? "pointer" : "default",
        background: s === "completed" ? "rgba(34,197,94,0.04)" : "var(--color-card-bg)",
        border:
          s === "current" ? "1.5px solid var(--color-accent)" :
          s === "completed" ? "1px solid rgba(34,197,94,0.14)" :
          "1px solid var(--color-border)",
        // Current lesson stands out through elevation + ring + border, not color alone
        boxShadow: s === "current" ? "0 6px 20px rgba(0,0,0,0.25), 0 0 0 3px rgba(124,58,237,0.12)" : "none",
        opacity: interactive ? 1 : 0.55,
      }}
    >
      {/* Left status bar — reinforces state without relying on color (paired with icon + label) */}
      {(s === "completed" || s === "current") && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: s === "completed" ? "#22c55e" : "var(--color-accent)" }} />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Badge: number (available) · check (completed) · play (current) */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: s === "completed" ? "rgba(34,197,94,0.15)" : s === "current" ? "var(--color-accent-gradient)" : "var(--color-hover-bg)",
              color: s === "completed" ? "#22c55e" : s === "current" ? "#fff" : "var(--color-accent-light)",
              border: s === "available" ? "1px solid var(--color-badge-bg)" : "none",
            }}>
            {s === "completed" ? <Check className="h-5 w-5" />
              : s === "current" ? <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              : <span className="text-sm font-bold">{String(index).padStart(2, "0")}</span>}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* 1. Title  +  3. Status */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold leading-snug ${s === "current" ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
                style={{ color: s === "completed" ? "var(--color-text-muted)" : "var(--color-text)" }}>
                {title}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                style={{
                  background: s === "completed" ? "rgba(34,197,94,0.1)" : s === "current" ? "var(--color-badge-bg)" : "var(--color-hover-bg)",
                  color: s === "completed" ? "#22c55e" : s === "current" ? "var(--color-badge-text)" : "var(--color-text-muted)",
                }}>
                {s === "completed" && <Check className="h-3 w-3" />}{STATUS_LABEL[s]}
              </span>
            </div>

            {/* 2. Learning outcome (what you'll be able to do) — hidden once completed */}
            {outcome && s !== "completed" && (
              <p className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{outcome}</p>
            )}

            {/* 4. Duration · 7. Unit · begin affordance */}
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-2 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              <span className="hidden sm:inline">Unit {unit}</span>
              <span className="hidden sm:inline" aria-hidden>·</span>
              <span>~{minutes} min</span>
              {interactive && CTA[s] && (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold" style={{ color: s === "current" ? "var(--color-accent-light)" : "var(--color-text-muted)" }}>
                    {CTA[s]} →
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
