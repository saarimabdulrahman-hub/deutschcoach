"use client";

import React from "react";

// Pre-formulated action chips (Sprint 13). Tapping one sends that prompt to Emma.
// All 44px targets accessible via keyboard.

export interface QuickAction { label: string; prompt: string; }

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "Explain this", prompt: "Explain grammar" },
  { label: "Give example", prompt: "Give another example" },
  { label: "Pronounce", prompt: "Pronounce this" },
  { label: "Why correct?", prompt: "Why is this correct?" },
  { label: "I'm stuck", prompt: "I'm stuck" },
  { label: "Translate", prompt: "Translate" },
];

interface Props {
  actions?: QuickAction[];
  onAction: (prompt: string) => void;
}

export const EmmaQuickActions = React.memo(function EmmaQuickActions({ actions = DEFAULT_ACTIONS, onAction }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick actions">
      {actions.map((a) => (
        <button key={a.label} onClick={() => onAction(a.prompt)} type="button"
          className="min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-white/10"
          style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-badge-bg)" }}>
          {a.label}
        </button>
      ))}
    </div>
  );
});
