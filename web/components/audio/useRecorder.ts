"use client";

import { useCallback, useRef, useState } from "react";

// Actual microphone integration (Sprint 16). getUserMedia + MediaRecorder +
// Web Audio AnalyserNode for live waveform. Exposes recording state, blob for
// playback, and analyser node for visualisation.

export type RecorderPhase =
  | "idle" | "requesting" | "denied" | "recording" | "paused"
  | "review"   // recording stopped — blob available for playback
  | "error";

export interface RecorderState {
  phase: RecorderPhase;
  blob: Blob | null;
  analyser: AnalyserNode | null;       // for live waveform visualisation
  duration: number;                     // recording duration in seconds
  error: string | null;
}

export function useRecorder(maxDuration = 30) {
  const [state, setState] = useState<RecorderState>({ phase: "idle", blob: null, analyser: null, duration: 0, error: null });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    cleanup();
    chunksRef.current = [];
    setState((s) => ({ ...s, phase: "requesting", error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // small = faster, fewer bars
      source.connect(analyser);
      audioCtxRef.current = audioCtx;

      // MediaRecorder for audio capture
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setState({ phase: "review", blob, analyser: null, duration: state.duration, error: null });
        // store URL on blob for playback
        (blob as any)._url = url;
      };
      recorder.onerror = () => setState({ phase: "error", blob: null, analyser: null, duration: 0, error: "Recording failed" });

      recorder.start(250); // timeslice for ondataavailable
      mediaRecorderRef.current = recorder;
      setState({ phase: "recording", blob: null, analyser, duration: 0, error: null });

      // Duration timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setState((prev) => {
          if (seconds >= maxDuration && mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop(); // auto-stop
          }
          return { ...prev, duration: seconds };
        });
      }, 1000);
    } catch (err: any) {
      const denied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      setState({ phase: denied ? "denied" : "error", blob: null, analyser: null, duration: 0, error: denied ? "Microphone permission denied" : err.message });
    }
  }, [cleanup, maxDuration, state.duration]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    // analyser stays active until cleanup — keeps waveform live during review
  }, []);

  const cancelRecording = useCallback(() => {
    cleanup();
    setState({ phase: "idle", blob: null, analyser: null, duration: 0, error: null });
  }, [cleanup]);

  const retryRecording = useCallback(() => { cancelRecording(); startRecording(); }, [cancelRecording, startRecording]);

  const reset = useCallback(() => { cleanup(); setState({ phase: "idle", blob: null, analyser: null, duration: 0, error: null }); }, [cleanup]);

  return { ...state, startRecording, stopRecording, cancelRecording, retryRecording, reset, cleanup };
}
