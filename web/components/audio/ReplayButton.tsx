"use client";

import React from "react";
import { AudioControlButton } from "./AudioControlButton";

// Replay the current clip from the start. Label is descriptive per the spec
// ("Replay Anna's line", not just "Replay").

interface ReplayButtonProps {
  label?: string;
  onReplay?: () => void;
  disabled?: boolean;
}

const ReplayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 00-14.9-3M4 15a8 8 0 0014.9 3" />
  </svg>
);

export const ReplayButton = React.memo(function ReplayButton({ label = "audio", onReplay, disabled }: ReplayButtonProps) {
  return (
    <AudioControlButton label={`Replay ${label}`} onClick={onReplay} disabled={disabled}>
      <ReplayIcon />
    </AudioControlButton>
  );
});
