"use client";

import React from "react";
import { type AudioState, AUDIO_STATE_LABEL } from "./types";

// Screen-reader status for the current audio state, with an optional visible
// label. Always renders a polite live region so state changes are announced
// (Playing / Paused / Played / Buffering / Audio unavailable).

interface AudioStatusProps {
  state: AudioState;
  visible?: boolean;   // also show the label visually (default: SR only)
}

export const AudioStatus = React.memo(function AudioStatus({ state, visible }: AudioStatusProps) {
  const text = AUDIO_STATE_LABEL[state];
  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">{text}</span>
      {visible && <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{text}</span>}
    </>
  );
});
