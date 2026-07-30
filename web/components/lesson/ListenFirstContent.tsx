"use client";

import { useState, useCallback } from "react";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// Listen First stage — hear the dialogue before seeing any text.
// Purpose: Audio-only exposure to new content.
// Interaction: Listen only.

interface ListenFirstContentProps {
  /** Full dialogue text to play */
  dialogueText: string;
  /** Called when the learner is done listening */
  onContinue?: () => void;
}

export function ListenFirstContent({ dialogueText, onContinue }: ListenFirstContentProps) {
  const { speak, speaking } = useWordSpeech();
  const [listened, setListened] = useState(false);

  const handlePlay = useCallback(() => {
    if (speaking) return;
    speak(dialogueText, "de-DE", false, () => {
      setListened(true);
    });
  }, [dialogueText, speak, speaking]);

  return (
    <div className="max-w-lg mx-auto py-8 text-center">
      <div
        className="rounded-2xl p-8"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
      >
        <span className="text-4xl block mb-4" aria-hidden>🎧</span>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Listen First
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Listen to the full dialogue. Don&apos;t worry about understanding everything yet
          — just get used to the sounds.
        </p>

        {!listened ? (
          <button
            onClick={handlePlay}
            disabled={speaking}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer disabled:opacity-40"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
            aria-label="Listen to dialogue"
          >
            {speaking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                Playing...
              </span>
            ) : (
              <>
                <SpeakIcon size={20} />
                Play Dialogue
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: "var(--color-active-text)" }}>
              ✅ You&apos;ve listened to the dialogue
            </p>
            {onContinue && (
              <button
                onClick={onContinue}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
              >
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
