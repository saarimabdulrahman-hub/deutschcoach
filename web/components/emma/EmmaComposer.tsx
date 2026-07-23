"use client";

import React, { useRef, useEffect } from "react";

// Input bar + send button (Sprint 13). Enter to send, safe-area aware padding.
// Auto-focuses when the panel opens (caller passes `autoFocus`).

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const EmmaComposer = React.memo(function EmmaComposer({ value, onChange, onSend, disabled, autoFocus }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="flex-shrink-0 px-3 py-2.5 flex items-center gap-2"
      style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-page-bg)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
      <input ref={ref} type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Ask Emma…" aria-label="Message Emma"
        className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm"
        style={{ background: "var(--color-card-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", outline: "none" }} />
      <button type="submit" disabled={!value.trim() || disabled} aria-label="Send"
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
        style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </form>
  );
});
