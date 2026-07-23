"use client";

import React from "react";
import type { RecordingPhase } from "./useAudioEngine";

// Speaking / recording UI (Sprint 11). The state machine for the "Talk to Emma"
// experience. No real microphone — phases are UI-state only. Always shows Skip
// and never gates progress.

interface Props {
  phase: RecordingPhase;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function SpeakingUI({ phase, onStart, onStop, onCancel, disabled }: Props) {
  if (phase === "done") {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Recorded</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Your audio is ready. Continue when you're ready.</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Couldn't access the microphone.</p>
        <div className="flex gap-2 justify-center mt-3">
          <button onClick={onStart} className="min-h-[44px] px-4 rounded-xl text-sm font-semibold" style={{ background: "var(--color-hover-bg)", color: "var(--color-accent-light)" }}>Try again</button>
          <button onClick={onCancel} className="min-h-[44px] px-4 rounded-xl text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Skip</button>
        </div>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="max-w-sm mx-auto py-4 text-center">
        {/* Pulsing listening ring */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--color-accent-light)" }} />
          <span className="absolute inset-2 rounded-full" style={{ background: "var(--color-accent-gradient)" }} />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">🎤</span>
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Listening…</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Speak your sentence</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={onStop} className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Done</button>
          <button onClick={onCancel} className="min-h-[48px] px-4 rounded-xl text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}>Cancel</button>
        </div>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: "var(--color-hover-bg)" }}>
          <span className="w-5 h-5 rounded-full animate-spin" style={{ border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent-light)" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Processing your speech…</p>
      </div>
    );
  }

  // idle / requesting-permission — the start screen
  return (
    <div className="max-w-sm mx-auto py-4 text-center">
      <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-card-bg)", border: "2px solid var(--color-border)" }}>
        <span className="text-2xl">🎤</span>
      </div>
      <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Practice speaking</p>
      <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>No mic? Just type in the box above and skip recording.</p>
      <div className="flex flex-col gap-2 mt-4">
        <button onClick={onStart} disabled={disabled}
          className="min-h-[48px] px-6 rounded-xl text-sm font-semibold disabled:opacity-4"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          {phase === "requesting-permission" ? "Allow microphone…" : "Start recording"}
        </button>
        <button onClick={onCancel} className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
          style={{ color: "var(--color-text-muted)" }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
