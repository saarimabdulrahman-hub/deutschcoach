"use client";

import React from "react";
import { AudioSpinner } from "./AudioControlButton";

// Inline loading/buffering indicator with a screen-reader announcement.

interface AudioLoadingProps {
  label?: string;
}

export const AudioLoading = React.memo(function AudioLoading({ label = "audio" }: AudioLoadingProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <AudioSpinner />
      <span className="sr-only" role="status" aria-live="polite">Loading {label}</span>
    </span>
  );
});
