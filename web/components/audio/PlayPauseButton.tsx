"use client";

import React from "react";
import { AudioControlButton, AudioSpinner } from "./AudioControlButton";
import { type AudioState, isAudioBusy, isAudioBlocked } from "./types";

// Play / Pause toggle. Shows a spinner while loading/buffering, a pause glyph
// while playing, a play glyph otherwise. Controlled — click calls onPlay/onPause.

interface PlayPauseButtonProps {
  state: AudioState;
  label?: string;      // context, e.g. "Anna's line" → "Play Anna's line"
  onPlay?: () => void;
  onPause?: () => void;
  disabled?: boolean;
}

const PlayIcon = () => (<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>);
const PauseIcon = () => (<svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>);

export const PlayPauseButton = React.memo(function PlayPauseButton({ state, label = "audio", onPlay, onPause, disabled }: PlayPauseButtonProps) {
  const busy = isAudioBusy(state);
  const playing = state === "playing";
  const blocked = disabled || isAudioBlocked(state) || busy;
  return (
    <AudioControlButton label={playing ? `Pause ${label}` : `Play ${label}`} disabled={blocked} onClick={playing ? onPause : onPlay}>
      {busy ? <AudioSpinner /> : playing ? <PauseIcon /> : <PlayIcon />}
    </AudioControlButton>
  );
});
