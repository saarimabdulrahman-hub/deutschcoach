"use client";

import React from "react";
import { useEmma } from "./EmmaContext";
import type { EmmaLessonContext } from "./EmmaContext";

// EmmaHintCard (Sprint 13). An inline contextual card that appears AT the point
// in the lesson where the learner might be stuck — NOT inside the chat panel.
// Callers place it inside a stage content component. When empty it renders null,
// so the card is invisible until a hint is requested via Emma.

interface Props { hint?: string; onDismiss?: () => void; }

export const EmmaHintCard = React.memo(function EmmaHintCard({ hint, onDismiss }: Props) {
  const { context, send } = useEmma();
  if (!hint) return null;

  return (
    <div className="mt-3 rounded-xl p-3" role="complementary" aria-label="Emma's hint"
      style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-badge-bg)" }}>
      <div className="flex items-start gap-2">
        <span className="text-base flex-shrink-0 mt-0.5">💡</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-light)" }}>Emma's hint</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{hint}</p>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={() => send("Explain more")} className="min-h-[36px] px-3 rounded-lg text-xs font-medium"
              style={{ color: "var(--color-accent-light)" }}>Explain more</button>
            {onDismiss && <button onClick={onDismiss} className="min-h-[36px] px-3 rounded-lg text-xs"
              style={{ color: "var(--color-text-muted)" }}>Dismiss</button>}
          </div>
        </div>
      </div>
    </div>
  );
});

// useLessonContext — thin re-export of Emma's context so stage components can
// update what Emma knows without needing the full chat API. Meets the Sprint 13
// requirement of a standalone lesson-context hook.
export function useLessonContext() {
  const { context, setContext } = useEmma();
  return { context, setContext } as const;
}

export type { EmmaLessonContext };
