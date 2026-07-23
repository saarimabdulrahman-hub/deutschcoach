"use client";

import React, { useRef } from "react";
import { useRecorder } from "./useRecorder";
import { RecordingWaveform } from "./RecordingWaveform";
import { PronunciationFeedback, type PronunciationNote } from "./PronunciationFeedback";

// Complete speaking experience (Sprint 16). Composes mic recording, live waveform,
// audio playback, and coaching feedback. Always skippable, never scored.

interface Props {
  prompt?: string;                    // Emma's prompt — "Wie heißt du?"
  suggestion?: string;                // suggestion chip — "Ich heiße …"
  coachNote?: PronunciationNote | null;
  onSkip: () => void;
  onComplete?: (blob: Blob) => void;  // called when user is happy with recording
  maxDuration?: number;
}

export function SpeakingStage({ prompt, suggestion, coachNote, onSkip, onComplete, maxDuration = 15 }: Props) {
  const recorder = useRecorder(maxDuration);
  const audioRef = useRef<HTMLAudioElement>(null);

  const phase = recorder.phase;
  const blobUrl = (recorder.blob as any)?._url as string | undefined;

  // ── Permission denied ───────────────────────────────────────────────
  if (phase === "denied") {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <p className="text-2xl mb-2">🎤</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Microphone access needed</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          To practice speaking, allow microphone access in your browser settings, or type your answer below.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={recorder.retryRecording} className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Try again</button>
          <button onClick={onSkip} className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}>Skip for now</button>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{recorder.error || "Couldn't access the microphone."}</p>
        <div className="flex gap-2 justify-center mt-3">
          <button onClick={recorder.retryRecording} className="min-h-[44px] px-4 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-hover-bg)", color: "var(--color-accent-light)" }}>Try again</button>
          <button onClick={onSkip} className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}>Skip</button>
        </div>
      </div>
    );
  }

  // ── Recording ───────────────────────────────────────────────────────
  if (phase === "recording" || phase === "requesting") {
    return (
      <div className="max-w-sm mx-auto py-4 text-center">
        {prompt && <p className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>{prompt}</p>}
        {suggestion && <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Suggestion: {suggestion}</p>}

        {/* Pulsing ring */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--color-accent-light)" }} />
          <span className="absolute inset-2 rounded-full" style={{ background: "var(--color-accent-gradient)" }} />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">🎤</span>
        </div>

        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {phase === "requesting" ? "Requesting microphone…" : "Listening…"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {formatDuration(recorder.duration)} / {formatDuration(maxDuration)}
        </p>

        <RecordingWaveform analyser={recorder.analyser} active={phase === "recording"} />

        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={recorder.stopRecording} disabled={phase === "requesting"}
            className="min-h-[48px] px-6 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Done</button>
          <button onClick={recorder.cancelRecording} className="min-h-[48px] px-4 rounded-xl text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── Review (playback) ───────────────────────────────────────────────
  if (phase === "review" && recorder.blob) {
    return (
      <div className="max-w-sm mx-auto py-4 text-center">
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Listen to your recording</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>How does it sound? You can try again.</p>

        {blobUrl && (
          <audio ref={audioRef} controls src={blobUrl}
            className="w-full mt-3 rounded-xl" style={{ height: 40 }}
            aria-label="Your recording playback" />
        )}

        {coachNote && <PronunciationFeedback note={coachNote} sentence={prompt} />}

        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => onComplete?.(recorder.blob!)}
            className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Sounds good — continue</button>
          <button onClick={recorder.retryRecording}
            className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
            style={{ background: "var(--color-hover-bg)", color: "var(--color-accent-light)" }}>Try again</button>
          <button onClick={onSkip} className="min-h-[44px] px-4 rounded-xl text-sm"
            style={{ color: "var(--color-text-muted)" }}>Skip for now</button>
        </div>
      </div>
    );
  }

  // ── Idle — start screen ─────────────────────────────────────────────
  return (
    <div className="max-w-sm mx-auto py-4 text-center">
      <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center"
        style={{ background: "var(--color-card-bg)", border: "2px solid var(--color-border)" }}>
        <span className="text-2xl">🎤</span>
      </div>
      <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Practice speaking</p>
      {prompt && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{prompt}</p>}
      {suggestion && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Try: {suggestion}</p>}
      <div className="flex flex-col gap-2 mt-4">
        <button onClick={recorder.startRecording}
          className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Start recording</button>
        <button onClick={onSkip} className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
          style={{ color: "var(--color-text-muted)" }}>Skip for now</button>
      </div>
    </div>
  );
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
