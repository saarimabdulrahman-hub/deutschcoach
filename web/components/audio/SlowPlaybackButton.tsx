"use client";

import React from "react";
import { AudioControlButton } from "./AudioControlButton";

// Half-speed toggle. `active` reflects whether slow playback is engaged and is
// announced via aria-pressed.

interface SlowPlaybackButtonProps {
  label?: string;
  active?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

export const SlowPlaybackButton = React.memo(function SlowPlaybackButton({ label = "audio", active, onToggle, disabled }: SlowPlaybackButtonProps) {
  return (
    <AudioControlButton
      label={active ? `Play ${label} at normal speed` : `Play ${label} at half speed`}
      ariaPressed={!!active}
      active={active}
      onClick={onToggle}
      disabled={disabled}
    >
      <span className="text-[11px] font-bold">0.5×</span>
    </AudioControlButton>
  );
});
