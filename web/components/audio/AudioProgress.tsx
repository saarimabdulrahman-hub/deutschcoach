"use client";

import React from "react";
import { type AudioState } from "./types";

// Non-interactive progress indicator (no seek — UI only). Driven by `progress`
// (0..1). Time labels are optional placeholders. This is the only frequently-
// updating piece during playback, so it is isolated + memoized to keep progress
// ticks from re-rendering the whole card.

interface AudioProgressProps {
  state: AudioState;
  progress?: number;        // 0..1
  label?: string;
  elapsedLabel?: string;    // optional placeholder e.g. "0:03"
  durationLabel?: string;   // optional placeholder e.g. "0:12"
}

export const AudioProgress = React.memo(function AudioProgress({ state, progress, label = "Audio", elapsedLabel, durationLabel }: AudioProgressProps) {
  const raw = progress ?? (state === "completed" ? 1 : 0);
  const pct = Math.round(Math.min(Math.max(raw, 0), 1) * 100);
  const showTime = !!(elapsedLabel || durationLabel);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div role="progressbar" aria-label={`${label} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
        className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-border)", overflow: "hidden" }}>
        <div className="h-full rounded-full transition-[width] duration-200"
          style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
      </div>
      {showTime && (
        <span className="text-[11px] tabular-nums flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
          {elapsedLabel ?? "0:00"}{durationLabel ? ` / ${durationLabel}` : ""}
        </span>
      )}
    </div>
  );
});
