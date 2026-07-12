"use client";

import { useState } from "react";
import type { LessonDetail } from "@/types";

// Grammar / Pattern Discovery stage (LESSON_WIREFRAMES Screen 5). Shows one
// grammar topic with a compact table + examples. Expandable "Explain more."

interface Props { grammarTopics: LessonDetail["grammar_topics"]; }

export function GrammarContent({ grammarTopics }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!grammarTopics?.length) return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No grammar for this lesson.</p>;

  return (
    <div className="max-w-lg mx-auto py-2 space-y-4">
      {grammarTopics.map((g, i) => (
        <div key={g.id ?? i}>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Pattern {i + 1}
          </p>
          <div className="rounded-2xl overflow-hidden mt-1.5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3"
              aria-expanded={openIndex === i}>
              <div className="min-w-0">
                <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>{g.title}</h3>
                {g.content && <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{g.content}</p>}
              </div>
              <span className="text-lg flex-shrink-0 transition-transform duration-150" style={{ color: "var(--color-text-muted)", transform: openIndex === i ? "rotate(90deg)" : "none" }}>›</span>
            </button>
            {openIndex === i && g.content && (
              <div className="px-4 sm:px-5 pb-4">
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{g.content}</p>
                {g.examples?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Examples</p>
                    {g.examples.map((ex, j) => (
                      <div key={j} className="flex gap-2 text-sm">
                        {Object.entries(ex).map(([k, v]) => (
                          <span key={k} style={{ color: k === "de" || k === "german" ? "var(--color-text)" : "var(--color-text-secondary)" }}>
                            {k !== "de" && k !== "german" ? `${k}: ` : ""}{v}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
