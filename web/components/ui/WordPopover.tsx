/**
 * WordPopover — inline popover for German word details.
 *
 * Displays English translation, IPA, audio button, and example sentence
 * when a learner clicks a German word in lesson content.
 *
 * Positioned inline below the clicked word. Not a modal.
 */

"use client";

import { useRef, useEffect, useState } from "react";
import type { VocabEntry } from "@/types";
import { lookupIpa, lookupBeginnerPron } from "@/lib/pronunciation";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";
import { useEmma } from "@/components/emma/EmmaContext";

interface WordPopoverProps {
  word: string;
  vocabEntry?: VocabEntry;
  onClose: () => void;
  /** Reference element to position below */
  anchorEl: HTMLElement;
}

export function WordPopover({ word, vocabEntry, onClose, anchorEl }: WordPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { speak, speaking } = useWordSpeech();
  const emma = useEmma();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const rect = anchorEl.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: Math.max(8, rect.left + window.scrollX - 8),
    });
  }, [anchorEl]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Don't close if the click is on the anchor word itself
        if (!anchorEl.contains(e.target as Node)) {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, anchorEl]);

  const ipa = lookupIpa(word);
  const beginnerPron = lookupBeginnerPron(word);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Details for ${word}`}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 50,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(168,85,247,0.08)",
        padding: "12px 16px",
        minWidth: "200px",
        maxWidth: "320px",
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      {/* German word + audio */}
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text)" }}>{word}</span>
        <button
          onClick={() => !speaking && speak(word, "de-DE")}
          disabled={speaking}
          aria-label={`Listen to ${word}`}
          className="flex items-center justify-center w-7 h-7 rounded-lg border-none cursor-pointer transition-colors"
          style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
        >
          <SpeakIcon size={16} />
        </button>
      </div>

      {/* English translation */}
      {vocabEntry?.english && (
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
          {vocabEntry.english}
        </p>
      )}

      {/* IPA + beginner pron row */}
      {(ipa || beginnerPron) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
          {ipa && (
            <span style={{ fontSize: "13px", color: "#C4B5FD", fontFamily: "monospace" }}>{ipa}</span>
          )}
          {beginnerPron && (
            <span style={{ fontSize: "12px", color: "#A78BFA" }}>{beginnerPron}</span>
          )}
        </div>
      )}

      {/* Example sentence */}
      {vocabEntry?.example_sentence && (
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "6px", marginTop: "2px" }}>
          {vocabEntry.example_sentence}
        </p>
      )}

      {/* Ask Emma action (Phase 3 Emma integration) */}
      <button
        onClick={() => {
          emma.setOpen(true);
          emma.send(`Explain the word "${word}" — what does it mean and how do I use it in a sentence?`);
          onClose();
        }}
        className="w-full mt-2 min-h-[36px] rounded-lg text-xs font-medium border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all"
        style={{ background: "rgba(168,85,247,0.06)", color: "var(--color-accent-light)" }}
        aria-label={`Ask Emma about ${word}`}
      >
        <span>💡</span>
        Ask Emma: how is this word used?
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
