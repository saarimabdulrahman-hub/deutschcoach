"use client";

import type { LessonDetail } from "@/types";
import { useInteractionController } from "@/components/interaction/useInteractionController";
import { QuestionCard, PageNav } from "@/components/interaction/InteractionPrimitives";
import type { InteractionItem } from "@/components/interaction/types";

// Grammar / Pattern Discovery — uses the interaction engine for expand/collapse
// (Sprint 8.2). No bespoke openIndex state.

interface Props { grammarTopics: LessonDetail["grammar_topics"]; }

function grammarToItems(topics: LessonDetail["grammar_topics"]): InteractionItem[] {
  if (!topics?.length) return [{ id: "empty", front: "No grammar", back: "for this lesson" }];
  return topics.map((g, i) => ({
    id: g.id ?? i,
    front: g.title,
    back: g.slug ?? "",
    meta: g.content ?? undefined,
    content: g.content ? (
      <div>
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
    ) : null,
  }));
}

export function GrammarContent({ grammarTopics }: Props) {
  const items = grammarToItems(grammarTopics);
  const ctrl = useInteractionController({ mode: "expand", items });
  const isExpanded = ctrl.phase === "revealed";

  if (!grammarTopics?.length) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No grammar for this lesson.</p>;
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Pattern {ctrl.index + 1} of {ctrl.total}
      </p>
      <QuestionCard>
        <button onClick={isExpanded ? ctrl.retry : ctrl.reveal} className="w-full text-left p-1 flex items-start justify-between gap-3"
          aria-expanded={isExpanded}>
          <div className="min-w-0">
            <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>{ctrl.current.front}</h3>
            {!isExpanded && ctrl.current.meta && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{ctrl.current.meta}</p>
            )}
          </div>
          <span className="text-lg flex-shrink-0 transition-transform duration-150"
            style={{ color: "var(--color-text-muted)", transform: isExpanded ? "rotate(90deg)" : "none" }}>›</span>
        </button>
        {isExpanded && ctrl.current.content && <div className="px-1 pb-3">{ctrl.current.content}</div>}
      </QuestionCard>
      <PageNav current={ctrl.index} total={ctrl.total}
        onPrev={ctrl.goPrev} onNext={ctrl.goNext}
        canPrev={ctrl.canGoPrev} canNext={ctrl.canGoNext} />
    </div>
  );
}
