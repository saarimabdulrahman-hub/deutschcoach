"use client";

import { useRouter } from "next/navigation";
import { Check, Book } from "@/components/ui/Icons";

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
}

export function LessonCard({ id, title, level, unit, order, topics, completed, isNext, index }: LessonCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/curriculum/${level.toLowerCase()}/${id}`)}
      className={`group relative rounded-2xl transition-all duration-200 cursor-pointer`}
      style={{
        background: completed
          ? "rgba(34,197,94,0.04)"
          : isNext
            ? "var(--color-card-bg)"
            : "var(--color-card-bg)",
        border: completed
          ? "1px solid rgba(34,197,94,0.12)"
          : isNext
            ? "1px solid var(--color-accent)"
            : "1px solid var(--color-border)",
        boxShadow: isNext ? "0 0 0 3px rgba(124,58,237,0.12)" : "none",
      }}
    >
      {/* Progress indicator line — shows completion on the left edge */}
      {completed && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "#22c55e" }} />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Number / Check badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
            style={{
              background: completed
                ? "rgba(34,197,94,0.15)"
                : isNext
                  ? "var(--color-accent-gradient)"
                  : "var(--color-hover-bg)",
              color: completed ? "#22c55e" : isNext ? "#fff" : "var(--color-accent-light)",
              border: !completed && !isNext ? "1px solid var(--color-badge-bg)" : "none",
            }}
          >
            {completed ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-sm font-bold">{String(index).padStart(2, "0")}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: "var(--color-hover-bg)", color: "var(--color-text-muted)" }}>
                Unit {unit}
              </span>
              <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                ~10 min
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold leading-snug mb-2 group-hover:text-indigo-300 transition-colors"
              style={{ color: completed ? "var(--color-text-muted)" : "var(--color-text)" }}>
              {title}
            </h3>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {topics.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{ background: "var(--color-page-bg)", color: "var(--color-text-muted)" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            {completed ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                Done
              </span>
            ) : isNext ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full transition-all group-hover:shadow-lg"
                style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                Start
              </span>
            ) : (
              <Book className="h-5 w-5 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: "var(--color-text-muted)" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
