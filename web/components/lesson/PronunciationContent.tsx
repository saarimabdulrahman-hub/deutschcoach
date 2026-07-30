"use client";

import { useState, useCallback } from "react";
import type { VocabEntry } from "@/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";
import { lookupIpa } from "@/lib/pronunciation";
import { useRecorder } from "@/components/audio/useRecorder";

// Pronunciation Practice stage — listen, repeat, record yourself.
// Purpose: Practice pronunciation.
// Interaction: Speak, Listen.

interface PronunciationContentProps {
  vocabulary: VocabEntry[];
}

export function PronunciationContent({ vocabulary }: PronunciationContentProps) {
  const { speak, speaking } = useWordSpeech();
  const recorder = useRecorder(15);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [recordingWord, setRecordingWord] = useState<string | null>(null);

  const handleRecord = useCallback((word: string) => {
    setRecordingWord(word);
    setActiveWord(null);
    if (recorder.phase === "recording") {
      recorder.stopRecording();
    } else {
      recorder.startRecording();
    }
  }, [recorder]);

  const playRecording = useCallback(() => {
    if (recorder.blob) {
      const url = URL.createObjectURL(recorder.blob);
      const audio = new Audio(url);
      audio.play();
    }
  }, [recorder.blob]);

  if (!vocabulary.length) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        No words to practice.
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Listen, then record yourself
      </p>
      <div className="space-y-2">
        {vocabulary.map((v) => {
          const ipa = lookupIpa(v.german);
          const isActive = activeWord === v.german;
          const isRecording = recordingWord === v.german && recorder.phase === "recording";
          const isReview = recordingWord === v.german && recorder.phase === "review";

          return (
            <div
              key={v.id}
              className="rounded-xl p-3 transition-all"
              style={{
                background: isActive || isRecording ? "rgba(168,85,247,0.06)" : "var(--color-card-bg)",
                border: `1px solid ${isRecording ? "rgba(255,71,87,0.3)" : isActive ? "rgba(168,85,247,0.2)" : "var(--color-border)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Listen button */}
                <button
                  onClick={() => {
                    if (speaking) return;
                    setActiveWord(v.german);
                    setRecordingWord(null);
                    speak(v.german, "de-DE", false, () => setActiveWord(null));
                  }}
                  disabled={speaking}
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border-none cursor-pointer disabled:opacity-40"
                  style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
                  aria-label={`Listen to ${v.german}`}
                >
                  <SpeakIcon size={18} />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                    {v.german}
                  </p>
                  {ipa && (
                    <p className="text-xs font-mono mt-0.5" style={{ color: "#C4B5FD" }}>
                      {ipa}
                    </p>
                  )}
                </div>

                <p className="text-sm text-right flex-shrink-0 mr-2" style={{ color: "var(--color-text-muted)" }}>
                  {v.english}
                </p>

                {/* Record button */}
                <button
                  onClick={() => handleRecord(v.german)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
                  style={{
                    background: isRecording ? "rgba(255,71,87,0.15)" : "rgba(168,85,247,0.06)",
                    color: isRecording ? "#FF6B77" : "var(--color-text-muted)",
                  }}
                  aria-label={isRecording ? "Stop recording" : `Record yourself saying ${v.german}`}
                >
                  {isRecording ? "⏹" : "🎤"}
                </button>
              </div>

              {/* Recording review */}
              {isReview && (
                <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Recorded ({recorder.duration}s)
                  </span>
                  <button onClick={playRecording}
                    className="text-xs font-medium px-3 py-1 rounded-lg border-none cursor-pointer"
                    style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}>
                    ▶ Play
                  </button>
                  <button onClick={recorder.retryRecording}
                    className="text-xs font-medium px-3 py-1 rounded-lg border-none cursor-pointer"
                    style={{ color: "var(--color-text-muted)" }}>
                    Re-record
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
