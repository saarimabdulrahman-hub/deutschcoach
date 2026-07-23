"use client";

import { useCallback, useState } from "react";
import type { AudioState } from "./types";

// Enhanced audio state machine (Sprint 11). Extends the 6.2C AudioState model
// with speed selection, recording state, and pronunciation feedback. Controlled
// — no real audio/recording yet; the states drive the UI.

export type PlaybackSpeed = 0.5 | 1 | 1.25;
export type RecordingPhase = "idle" | "requesting-permission" | "recording" | "processing" | "done" | "error";

export interface PronunciationNote {
  type: "encouragement" | "guidance";
  message: string;            // "Excellent!" · "Try stressing the second word."
  highlight?: string;         // the word or phrase to highlight
  highlightIndex?: number;    // which word in the sentence
}

export interface AudioEngineState {
  // Playback
  playbackState: AudioState;
  speed: PlaybackSpeed;
  setSpeed: (s: PlaybackSpeed) => void;

  // Recording
  recordingPhase: RecordingPhase;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;

  // Pronunciation feedback
  pronunciationNote: PronunciationNote | null;
  setPronunciationNote: (n: PronunciationNote | null) => void;

  // Reset
  reset: () => void;
}

export function useAudioEngine(initialState?: AudioState): AudioEngineState {
  const [playbackState, setPlaybackState] = useState<AudioState>(initialState ?? "idle");
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>("idle");
  const [pronunciationNote, setPronunciationNote] = useState<PronunciationNote | null>(null);

  const startRecording = useCallback(() => setRecordingPhase("recording"), []);
  const stopRecording = useCallback(() => { setRecordingPhase("processing"); setTimeout(() => setRecordingPhase("done"), 1000); }, []);
  const cancelRecording = useCallback(() => { setRecordingPhase("idle"); }, []);

  const reset = useCallback(() => {
    setPlaybackState("idle"); setSpeed(1); setRecordingPhase("idle"); setPronunciationNote(null);
  }, []);

  return {
    playbackState, speed, setSpeed,
    recordingPhase, startRecording, stopRecording, cancelRecording,
    pronunciationNote, setPronunciationNote,
    reset,
  };
}
