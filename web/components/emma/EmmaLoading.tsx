"use client";

import React from "react";

// Typing indicator — three animated dots (Sprint 13). Shows Emma is responding.
// Respects the global prefers-reduced-motion rule (dots fall back to static).

interface Props { label?: string; }

const DOT_CLASS = "w-1.5 h-1.5 rounded-full";

export const EmmaLoading = React.memo(function EmmaLoading({ label = "Emma is typing" }: Props) {
  return (
    <div className="flex justify-start" role="status" aria-label={label}>
      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider mr-2" style={{ color: "var(--color-accent-light)" }}>Emma</span>
        <span className="inline-flex gap-1" aria-hidden>
          <span className={DOT_CLASS} style={{ background: "var(--color-text-muted)", animationDelay: "0ms" }} />
          <span className={DOT_CLASS} style={{ background: "var(--color-text-muted)", animationDelay: "150ms", animation: "bounce 0.6s infinite" }} />
          <span className={DOT_CLASS} style={{ background: "var(--color-text-muted)", animationDelay: "300ms", animation: "bounce 0.6s infinite" }} />
        </span>
      </div>
    </div>
  );
});
