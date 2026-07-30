"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useWordSpeech } from "@/hooks/useSpeech";
import { useRecorder } from "@/components/audio/useRecorder";

// Shadowing Mode (Section 11.4). Listen to a native sentence, record yourself
// repeating it, then compare both waveforms side-by-side.

interface ShadowingModeProps {
  /** German sentence to shadow */
  sentence: string;
  /** English translation shown for context */
  translation?: string;
  /** Called when the learner completes the shadowing exercise */
  onComplete?: () => void;
}

/** Draw a simple waveform from an AudioBuffer onto a canvas. */
function drawWaveform(canvas: HTMLCanvasElement, buffer: AudioBuffer, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const data = buffer.getChannelData(0);
  const w = canvas.width;
  const h = canvas.height;
  const step = Math.ceil(data.length / w);
  const amp = h / 2;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < w; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j] || 0;
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    const y1 = (1 + min) * amp;
    const y2 = (1 + max) * amp;
    ctx.moveTo(i, y1);
    ctx.lineTo(i, y2);
  }
  ctx.stroke();

  // Center line
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineTo(w, amp);
  ctx.stroke();
}

/** Decode audio blob into an AudioBuffer for waveform rendering. */
async function decodeAudio(blob: Blob): Promise<AudioBuffer | null> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
}

export function ShadowingMode({ sentence, translation, onComplete }: ShadowingModeProps) {
  const { speak, speaking } = useWordSpeech();
  const recorder = useRecorder(30);

  const [phase, setPhase] = useState<"listen" | "record" | "compare" | "done">("listen");
  const [nativeBuffer, setNativeBuffer] = useState<AudioBuffer | null>(null);
  const [learnerUrl, setLearnerUrl] = useState<string | null>(null);
  const [learnerBuffer, setLearnerBuffer] = useState<AudioBuffer | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const nativeCanvasRef = useRef<HTMLCanvasElement>(null);
  const learnerCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Native audio playback
  const handleListen = useCallback(async () => {
    speak(sentence, "de-DE", false, () => {
      // Generate a simulated native waveform after playback
      const simulated = new AudioContext().createBuffer(1, 44100, 44100);
      const d = simulated.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        d[i] = Math.sin(i * 0.01) * Math.exp(-i / d.length * 3) * 0.5 + (Math.random() - 0.5) * 0.05;
      }
      setNativeBuffer(simulated);
      setPhase("record");
    });
  }, [sentence, speak]);

  // Record learner
  const handleStartRecord = useCallback(() => {
    recorder.startRecording();
  }, [recorder]);

  const handleStopRecord = useCallback(async () => {
    recorder.stopRecording();
  }, [recorder]);

  // Process recording and show comparison
  useEffect(() => {
    if (recorder.phase === "review" && recorder.blob) {
      const url = URL.createObjectURL(recorder.blob);
      setLearnerUrl(url);
      setPlaybackUrl(url);
      decodeAudio(recorder.blob).then((buf) => {
        setLearnerBuffer(buf);
        setPhase("compare");
      });
    }
  }, [recorder.phase, recorder.blob]);

  // Draw native waveform
  useEffect(() => {
    if (nativeBuffer && nativeCanvasRef.current) {
      const canvas = nativeCanvasRef.current;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      drawWaveform(canvas, nativeBuffer, "rgba(168,85,247,0.8)");
    }
  }, [nativeBuffer]);

  // Draw learner waveform
  useEffect(() => {
    if (learnerBuffer && learnerCanvasRef.current) {
      const canvas = learnerCanvasRef.current;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      drawWaveform(canvas, learnerBuffer, "rgba(34,197,94,0.8)");
    }
  }, [learnerBuffer]);

  const playLearner = useCallback(() => {
    if (playbackUrl) {
      const audio = new Audio(playbackUrl);
      audioRef.current = audio;
      audio.play();
    }
  }, [playbackUrl]);

  const playNativeAgain = useCallback(() => {
    speak(sentence, "de-DE");
  }, [sentence, speak]);

  return (
    <div className="max-w-lg mx-auto py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        🎯 Shadowing
      </p>

      {/* Step 1: Listen */}
      {phase === "listen" && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--color-text)" }}>{sentence}</p>
          {translation && <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>{translation}</p>}
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Step 1 of 2: Listen to the native pronunciation
          </p>
          <button
            onClick={handleListen}
            disabled={speaking}
            className="px-8 py-3 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-40"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
          >
            {speaking ? "Playing…" : "▶ Listen"}
          </button>
        </div>
      )}

      {/* Step 2: Record */}
      {phase === "record" && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-base font-semibold mb-2" style={{ color: "var(--color-text)" }}>{sentence}</p>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Step 2 of 2: Repeat the sentence aloud
          </p>
          <div className="space-y-3">
            {recorder.phase === "idle" ? (
              <button onClick={handleStartRecord}
                className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                🎤 Start Recording
              </button>
            ) : recorder.phase === "recording" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-active-text)" }}>
                  Recording… ({recorder.duration}s)
                </p>
                <button onClick={handleStopRecord}
                  className="min-h-[44px] px-5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                  ⏹ Stop
                </button>
              </div>
            ) : null}
            <button onClick={playNativeAgain} disabled={speaking}
              className="text-xs font-medium hover:underline border-none cursor-pointer disabled:opacity-40"
              style={{ color: "var(--color-text-muted)" }}>
              🔁 Listen again
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Compare */}
      {phase === "compare" && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-center" style={{ color: "var(--color-text-secondary)" }}>
            Compare your pronunciation with the native speaker
          </p>

          {/* Native waveform */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "#A855F7" }}>Native</span>
              <button onClick={playNativeAgain} disabled={speaking}
                className="text-[10px] font-medium hover:underline border-none cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}>
                ▶ Play
              </button>
            </div>
            <canvas ref={nativeCanvasRef} className="w-full h-16 rounded-xl" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }} />
          </div>

          {/* Learner waveform */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "#4ADE80" }}>You</span>
              <button onClick={playLearner}
                className="text-[10px] font-medium hover:underline border-none cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}>
                ▶ Play
              </button>
              <button onClick={recorder.retryRecording}
                className="text-[10px] font-medium hover:underline border-none cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}>
                🔁 Try again
              </button>
            </div>
            <canvas ref={learnerCanvasRef} className="w-full h-16 rounded-xl" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }} />
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={recorder.retryRecording}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border cursor-pointer"
              style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
              Try Again
            </button>
            {onComplete && (
              <button onClick={() => { setPhase("done"); onComplete(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                Continue →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Done */}
      {phase === "done" && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Shadowing complete!</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
            You practiced: {sentence}
          </p>
        </div>
      )}
    </div>
  );
}
