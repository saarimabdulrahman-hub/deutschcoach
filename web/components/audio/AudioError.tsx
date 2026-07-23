"use client";

import React from "react";

// Compact inline audio error with an optional retry. Distinct from the app-wide
// ErrorState (which is a full-block empty/error state) — this sits inside a
// control row, so it must stay small.

interface AudioErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const AudioError = React.memo(function AudioError({ message = "Audio unavailable", onRetry }: AudioErrorProps) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
      <span role="status">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="min-h-11 px-2 rounded-lg font-semibold hover:bg-white/5"
          style={{ color: "var(--color-accent-light)" }} aria-label="Retry loading audio">
          Retry
        </button>
      )}
    </span>
  );
});
