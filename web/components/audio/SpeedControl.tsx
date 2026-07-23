"use client";

import React from "react";

// Speed selector — 0.5×, 1×, 1.25× (Sprint 11). Chip-style, 44px targets,
// active state via accent. Purely presentational — setSpeed is a caller callback.

export type PlaybackSpeed = 0.5 | 1 | 1.25;
const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.25];

interface Props { speed: PlaybackSpeed; onSet: (s: PlaybackSpeed) => void; disabled?: boolean; }

export const SpeedControl = React.memo(function SpeedControl({ speed, onSet, disabled }: Props) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
      {SPEEDS.map((s) => (
        <button key={s} onClick={() => onSet(s)} disabled={disabled} type="button"
          aria-pressed={speed === s}
          aria-label={`${s}× speed`}
          className="min-h-[36px] px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{
            background: speed === s ? "var(--color-accent-gradient)" : "var(--color-hover-bg)",
            color: speed === s ? "#fff" : "var(--color-text-muted)",
            border: speed === s ? "none" : "1px solid var(--color-border)",
            opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer",
          }}>
          {s}×
        </button>
      ))}
    </div>
  );
});
