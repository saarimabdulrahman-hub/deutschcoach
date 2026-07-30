"use client";

import { useCallback, useState, useRef } from "react";
import { useRecorder } from "@/components/audio/useRecorder";
import { useWordSpeech } from "@/hooks/useSpeech";
import { fetchEmmaPronunciation } from "@/lib/emmaApi";

/** Basic pronunciation evaluation — uses recorded audio when available.
 *  Sends audio to the dedicated endpoint; falls back to text-only.
 *  Phase 5 will swap the backend implementation without changing this interface. */
async function basicPronunciationFeedback(audioBlob?: Blob | null, lessonText?: string): Promise<{ feedback: string }> {
  try {
    const text = lessonText || "Hallo";
    let result;
    if (audioBlob) {
      // Send audio to the dedicated endpoint (multipart upload).
      // Use fetch directly to avoid api.ts forcing JSON Content-Type.
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const base = typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL || (window.location.hostname !== "localhost" ? "https://deutschcoach-hjs0.onrender.com" : "http://localhost:8001"))
        : "http://localhost:8001";
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("lesson_text", text);
      const res = await fetch(`${base}/emma/pronounce/audio`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      result = await res.json();
    } else {
      result = await fetchEmmaPronunciation(text);
    }
    const isGood = ((result as any).feedback?.toLowerCase().includes("good"));
    return { feedback: isGood ? "Good!" : "Try again" };
  } catch {
    return { feedback: "Try again" };
  }
}

// Speaking Practice stage — record and playback your own voice.
// Purpose: Speak German phrases aloud.
// Interaction: Record, Playback.

interface Props { vocabulary?: string[]; }

export function SpeakingPlaceholder({ vocabulary }: Props) {
  const { speak, speaking } = useWordSpeech();
  const recorder = useRecorder(30);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pronFeedback, setPronFeedback] = useState<{ feedback: string } | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const suggestion = vocabulary?.length ? `Try: ${vocabulary.slice(0, 3).join(", ")}` : "";

  const handleStartRecording = useCallback(() => {
    setPlaybackUrl(null);
    recorder.startRecording();
  }, [recorder]);

  const handleStopRecording = useCallback(() => {
    recorder.stopRecording();
  }, [recorder]);

  const handlePlayRecording = useCallback(() => {
    if (recorder.blob) {
      const url = URL.createObjectURL(recorder.blob);
      setPlaybackUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    }
  }, [recorder.blob]);

  const playPrompt = useCallback(() => {
    if (vocabulary?.length) {
      speak(vocabulary.slice(0, 3).join(". "), "de-DE");
    }
  }, [vocabulary, speak]);

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text)" }}>
        Practice speaking
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        Use your new words in a short conversation. No mic? Just type.
      </p>

      {/* Prompt */}
      <div className="mt-4 rounded-2xl p-4 sm:p-5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Emma: <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>Hallo! Wie heißt du?</span>
        </p>

        {/* Text input alternative */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>Type:</span>
          <input placeholder="Ich heiße …"
            className="flex-1 rounded-lg px-3 py-2.5 text-sm"
            style={{ background: "var(--color-page-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
        </div>

        {suggestion && <p className="text-[11px] mt-2" style={{ color: "var(--color-text-muted)" }}>{suggestion}</p>}
      </div>

      {/* Recording controls */}
      <div className="mt-4 rounded-2xl p-4 sm:p-5 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>
          Or record yourself speaking
        </p>

        {recorder.phase === "idle" || recorder.phase === "denied" ? (
          <button onClick={handleStartRecording}
            className="min-h-[48px] px-6 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            🎤 Start Recording
          </button>
        ) : recorder.phase === "recording" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Recording… ({recorder.duration}s)
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={handleStopRecording}
                className="min-h-[44px] px-5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                ⏹ Stop
              </button>
              <button onClick={recorder.cancelRecording}
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : recorder.phase === "review" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: "var(--color-active-text)" }}>
              ✅ Recorded ({recorder.duration}s)
            </p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={handlePlayRecording}
                className="min-h-[44px] px-5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)" }}>
                ▶ Play Recording
              </button>
              <button onClick={recorder.retryRecording}
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}>
                Re-record
              </button>
            </div>
            {playbackUrl && (
              <audio ref={audioRef} src={playbackUrl} controls className="w-full mt-2" style={{ height: 32 }} />
            )}
            {/* Pronunciation feedback */}
            {!pronFeedback && !loadingFeedback && (
              <button
                onClick={async () => {
                  setLoadingFeedback(true);
                  const prompt = vocabulary?.slice(0, 3).join(", ") || "Hallo";
                  const result = await basicPronunciationFeedback(recorder.blob, prompt);
                  setPronFeedback(result);
                  setLoadingFeedback(false);
                }}
                className="min-h-[36px] px-4 rounded-lg text-xs font-medium border-none cursor-pointer"
                style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
              >
                💡 Get pronunciation feedback
              </button>
            )}
            {loadingFeedback && (
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Evaluating…</p>
            )}
            {pronFeedback && (
              <p className="text-sm font-semibold mt-1" style={{ color: pronFeedback.feedback === "Good!" ? "#4ADE80" : "var(--color-text-secondary)" }}>
                {pronFeedback.feedback === "Good!" ? "✅ Good!" : "🔄 Try again"}
              </p>
            )}
          </div>
        ) : recorder.phase === "error" ? (
          <div className="space-y-2">
            <p className="text-sm" style={{ color: "var(--color-error-text)" }}>
              {recorder.error || "Recording failed"}
            </p>
            <button onClick={recorder.retryRecording}
              className="min-h-[44px] px-4 rounded-xl text-sm font-medium"
              style={{ color: "var(--color-accent-light)" }}>
              Try again
            </button>
          </div>
        ) : null}

        {(recorder.phase === "idle" || recorder.phase === "review") && (
          <button onClick={playPrompt} disabled={speaking}
            className="mt-2 text-xs font-medium hover:underline border-none cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}>
            🔁 Hear the prompt again
          </button>
        )}
      </div>
    </div>
  );
}
