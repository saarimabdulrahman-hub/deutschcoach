import Link from "next/link";
import { getLevelColor } from "@/lib/colors";

interface GrammarTopicCardProps {
  topic: {
    id: number; slug: string; title: string; level: string;
    content?: string | null;          // for word-count → reading time
    examples?: Record<string, string> | null;  // for example count
    related_lesson_ids?: number[] | null;      // for related lesson count
  };
  completed?: boolean;                // optional — when lesson completion is wired
}

function estimateReadingTime(content: string | null | undefined): number {
  if (!content) return 3;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 150)); // ~150 wpm
}

function exampleCount(examples: Record<string, string> | null | undefined): number {
  return examples ? Object.keys(examples).length : 0;
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  A1: { label: "Beginner", color: "#22c55e" },
  A2: { label: "Elementary", color: "#4ade80" },
  B1: { label: "Intermediate", color: "#f59e0b" },
  B2: { label: "Upper Int.", color: "#f97316" },
  C1: { label: "Advanced", color: "#ef4444" },
};

export function GrammarTopicCard({ topic, completed }: GrammarTopicCardProps) {
  const accent = getLevelColor(topic.level);
  const mins = estimateReadingTime(topic.content);
  const exCount = exampleCount(topic.examples);
  const relatedCount = topic.related_lesson_ids?.length ?? 0;
  const diff = DIFFICULTY_MAP[topic.level] ?? { label: topic.level, color: accent };

  return (
    <Link
      href={`/grammar/${topic.slug}`}
      className="block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 4px 18px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${accent}18`, color: accent }}>{topic.level}</span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: diff.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} />
            {diff.label}
          </span>
        </div>
        {completed && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
            ✓ Done
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-sm sm:text-base font-bold leading-snug mb-2 group-hover:text-indigo-300 transition-colors"
        style={{ color: "var(--color-text)" }}>{topic.title}</h3>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
        <span>~{mins} min read</span>
        {exCount > 0 && <span>{exCount} example{exCount !== 1 ? "s" : ""}</span>}
        {relatedCount > 0 && <span>{relatedCount} related lesson{relatedCount !== 1 ? "s" : ""}</span>}
      </div>
    </Link>
  );
}
