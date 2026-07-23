"use client";

import React from "react";

// Pronunciation coaching (Sprint 11). Never numeric — only encouraging messages.
// Callers set a PronunciationNote from useAudioEngine and this renders it.

export interface PronunciationNote {
  type: "encouragement" | "guidance";
  message: string;            // "Excellent!" · "Try stressing the second word."
  highlight?: string;         // word or phrase to highlight
  highlightIndex?: number;
}

interface Props {
  note: PronunciationNote | null;
  sentence?: string;           // the full sentence (for word-highlight rendering)
}

export const PronunciationFeedback = React.memo(function PronunciationFeedback({ note, sentence }: Props) {
  if (!note) return null;
  const isEncouragement = note.type === "encouragement";

  // Highlight a word within the sentence using a styled span.
  const renderSentence = () => {
    if (!sentence || note.highlightIndex == null) return sentence;
    const words = sentence.split(" ");
    return words.map((w, i) => (
      <span key={i} style={{
        color: i === note.highlightIndex ? "var(--color-text)" : "var(--color-text-muted)",
        fontWeight: i === note.highlightIndex ? 700 : 400,
        textDecoration: i === note.highlightIndex ? "underline" : "none",
        textDecorationColor: "var(--color-accent-light)",
        textUnderlineOffset: "4px",
      }}>{w}{i < words.length - 1 ? " " : ""}</span>
    ));
  };

  return (
    <div className="rounded-xl p-3 mt-3" role="status" aria-live="polite"
      style={{
        background: isEncouragement ? "rgba(34,197,94,0.07)" : "var(--color-hover-bg)",
        border: isEncouragement ? "1px solid rgba(34,197,94,0.15)" : "1px solid var(--color-border)",
      }}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-base">{isEncouragement ? "🌟" : "🎯"}</span>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{note.message}</p>
      </div>
      {note.highlight && (
        <p className="text-sm font-medium mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          {note.highlight}
        </p>
      )}
      {sentence && note.highlightIndex != null && (
        <p className="text-sm mt-1.5" aria-label={`Sentence with highlighted word at position ${note.highlightIndex + 1}`}>
          {renderSentence()}
        </p>
      )}
      {!note.highlight && sentence && (
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{sentence}</p>
      )}
    </div>
  );
});
