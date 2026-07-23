"use client";

import React from "react";

// Decorative waveform (Sprint 11). Visually indicates "sound is playing /
// recording." Structurally ready for real-time audio synchronisation — the
// `progress` prop (0..1) drives which bars are lit. With no real audio, it
// animates as breathing bars; with audio, a timer or Web Audio API drives it.

interface Props { active: boolean; progress?: number; bars?: number; }

export const Waveform = React.memo(function Waveform({ active, progress, bars = 24 }: Props) {
  const lit = active ? Math.round((progress ?? 0.5) * bars) : 0;
  return (
    <div className="flex items-center justify-center gap-[3px] h-10" role="img" aria-label={active ? "Audio waveform" : "Waveform (idle)"}>
      {Array.from({ length: bars }).map((_, i) => {
        const p = i < lit ? 1 : 0.3;
        const h = active ? 8 + Math.abs(i - bars / 2) * 1.8 : 6;
        return (
          <span key={i} className="block rounded-full transition-all duration-200"
            style={{
              width: 3, height: `${h}px`,
              background: "var(--color-accent-light)",
              opacity: p,
              transform: active ? `scaleY(${0.6 + Math.random() * 0.5})` : "scaleY(1)",
            }} />
        );
      })}
    </div>
  );
});
