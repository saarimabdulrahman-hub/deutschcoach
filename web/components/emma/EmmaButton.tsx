"use client";

import React from "react";

// Floating Emma button (Sprint 13). Toggles the panel. Positioned above the
// sticky footer / mobile tab bar. Extracted from the 6.2B monolith.

interface Props { open: boolean; onClick: () => void; }

export const EmmaButton = React.memo(function EmmaButton({ open, onClick }: Props) {
  return (
    <button onClick={onClick} aria-label={open ? "Close Emma" : "Open Emma — your AI tutor"}
      title={open ? "Close Emma" : "Ask Emma"}
      className="fixed z-40 right-4 sm:right-6 rounded-full flex items-center justify-center shadow-lg transition-transform transition-colors duration-200 hover:scale-105 active:scale-95"
      style={{
        width: 52, height: 52,
        bottom: "calc(80px + env(safe-area-inset-bottom))",
        background: open ? "var(--color-card-bg)" : "var(--color-accent-gradient)",
        color: open ? "var(--color-accent-light)" : "#fff",
        border: open ? "2px solid var(--color-accent)" : "none",
        boxShadow: open ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(217,70,239,0.4)",
      }}>
      {open ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      )}
    </button>
  );
});
