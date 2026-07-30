"use client";

import { useState, useRef, useCallback } from "react";
import type { VocabEntry } from "@/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// Dictation stage — hear a word, then type it.
// Purpose: Practice listening and spelling.
// Interaction: Listen, Type.

interface DictationContentProps {
  vocabulary: VocabEntry[];
}

export function DictationContent({ vocabulary }: DictationContentProps) {
  const { speak, speaking } = useWordSpeech();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = vocabulary[currentIndex];
  const isDone = currentIndex >= vocabulary.length;

  const handlePlay = useCallback(() => {
    if (!word || speaking) return;
    setInput("");
    setResult(null);
    speak(word.german, "de-DE");
  }, [word, speaking, speak]);

  const handleCheck = useCallback(() => {
    if (!word) return;
    const normalized = input.trim().toLowerCase();
    const answer = word.german.toLowerCase();
    if (normalized === answer) {
      setResult("correct");
    } else {
      setResult("wrong");
    }
  }, [word, input]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setInput("");
    setResult(null);
    inputRef.current?.focus();
  }, []);

  if (!vocabulary.length) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        No words for dictation.
      </p>
    );
  }

  if (isDone) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          Dictation complete!
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          You practiced {vocabulary.length} words.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Dictation · {currentIndex + 1} of {vocabulary.length}
      </p>
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
      >
        <button
          onClick={handlePlay}
          disabled={speaking}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-none cursor-pointer disabled:opacity-40 transition-all hover:scale-105"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
          aria-label="Listen"
        >
          <SpeakIcon size={28} />
        </button>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          Listen, then type what you hear
        </p>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleCheck(); }}
          placeholder="Type here..."
          autoFocus
          className="w-full rounded-xl px-4 py-3 text-center text-lg font-medium outline-none"
          style={{
            background: "var(--color-page-bg)",
            color: "var(--color-text)",
            border: `2px solid ${
              result === "correct" ? "rgba(34,197,94,0.4)" :
              result === "wrong" ? "rgba(255,71,87,0.4)" :
              "var(--color-border)"
            }`,
          }}
        />

        {result === "correct" && (
          <p className="text-sm font-medium mt-2" style={{ color: "#4ADE80" }}>
            ✅ Correct!
          </p>
        )}
        {result === "wrong" && (
          <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Expected: <strong style={{ color: "var(--color-text)" }}>{word.german}</strong>
          </p>
        )}

        <div className="flex gap-2 mt-4 justify-center">
          <button
            onClick={handlePlay}
            disabled={speaking}
            className="px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer disabled:opacity-40"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
          >
            🔁 Replay
          </button>
          {input.trim() && !result && (
            <button
              onClick={handleCheck}
              className="px-5 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
              style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
            >
              Check
            </button>
          )}
          {result && (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer"
              style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
            >
              {currentIndex < vocabulary.length - 1 ? "Next →" : "Finish →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
