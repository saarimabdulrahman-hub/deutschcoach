"use client";

import React from "react";
import { type AudioState, isAudioBlocked } from "./types";
import { PlayPauseButton } from "./PlayPauseButton";
import { ReplayButton } from "./ReplayButton";
import { SlowPlaybackButton } from "./SlowPlaybackButton";
import { AudioProgress } from "./AudioProgress";
import { AudioStatus } from "./AudioStatus";
import { AudioError } from "./AudioError";

// The single, reusable full audio player bar (Sprint 6.2C). Composes the shared
// controls; consumers that only need one control (e.g. DialogueCard uses Replay
// + Slow) import those directly instead of the whole bar. Controlled/UI-only.

interface AudioPlayerProps {
  state: AudioState;
  label?: string;
  progress?: number;
  elapsedLabel?: string;
  durationLabel?: string;
  slow?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  onToggleSlow?: () => void;
  onRetry?: () => void;
  showReplay?: boolean;
  showSlow?: boolean;
  showProgress?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const AudioPlayer = React.memo(function AudioPlayer({
  state, label = "audio", progress, elapsedLabel, durationLabel, slow,
  onPlay, onPause, onReplay, onToggleSlow, onRetry,
  showReplay = true, showSlow = true, showProgress = true, showStatus = true, className,
}: AudioPlayerProps) {
  if (state === "error") {
    return <div className={className}><AudioError message="Audio unavailable" onRetry={onRetry} /></div>;
  }
  const blocked = isAudioBlocked(state) || state === "loading";
  return (
    <div className={`flex items-center gap-2 ${className || ""}`} role="group" aria-label={`${label} player`}>
      <PlayPauseButton state={state} label={label} onPlay={onPlay} onPause={onPause} />
      {showReplay && <ReplayButton label={label} onReplay={onReplay} disabled={blocked} />}
      {showProgress && <AudioProgress state={state} progress={progress} label={label} elapsedLabel={elapsedLabel} durationLabel={durationLabel} />}
      {showSlow && <SlowPlaybackButton label={label} active={slow} onToggle={onToggleSlow} disabled={blocked} />}
      {showStatus && <AudioStatus state={state} />}
    </div>
  );
});
