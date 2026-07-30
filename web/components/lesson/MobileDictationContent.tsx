"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import type { VocabEntry } from "@/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// Mobile Dictation stage — hear a word, type it with on-screen German character
// buttons and autocomplete suggestions from the vocabulary list.
// Purpose: Specialized typing for German characters.
// Interaction: Type with autocomplete.

const GERMAN_CHARS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

interface MobileDictationContentProps {
  vocabulary: VocabEntry[];
}

export function MobileDictationContent({ vocabulary }: MobileDictationContentProps) {
  const { speak, speaking } = useWordSpeech();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = vocabulary[currentIndex];
  const isDone = currentIndex >= vocabulary.length;

  // Autocomplete suggestions filtered by current input
  const suggestions = useMemo(() => {
    if (!input.trim() || result) return [];
    const q = input.toLowerCase();
    return vocabulary
      .map((v) => v.german)
      .filter((g) => g.toLowerCase().startsWith(q) && g.toLowerCase() !== q)
      .slice(0, 5);
  }, [input, vocabulary, result]);

  const handlePlay = useCallback(() => {
    if (!word || speaking) return;
    setInput("");
    setResult(null);
    setShowSuggestions(false);
    speak(word.german, "de-DE");
  }, [word, speaking, speak]);

  const insertChar = useCallback((ch: string) => {
    const el = inputRef.current;
    if (el) {
      const start = el.selectionStart ?? input.length;
      const newVal = input.slice(0, start) + ch + input.slice(el.selectionEnd ?? start);
      setInput(newVal);
      setResult(null);
      requestAnimationFrame(() => {
        el.setSelectionRange(start + 1, start + 1);
        el.focus();
      });
    } else {
      setInput((prev) => prev + ch);
      setResult(null);
    }
  }, [input]);

  const selectSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleCheck = useCallback(() => {
    if (!word) return;
    if (input.trim().toLowerCase() === word.german.toLowerCase()) {
      setResult("correct");
    } else {
      setResult("wrong");
    }
    setShowSuggestions(false);
  }, [word, input]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setInput("");
    setResult(null);
    setShowSuggestions(false);
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
          Listen and type what you hear
        </p>

        {/* Input with autocomplete */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) handleCheck();
              if (e.key === "Escape") setShowSuggestions(false);
            }}
            placeholder="Type here..."
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
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
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 z-10 mt-1 rounded-xl overflow-hidden"
              style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium border-none cursor-pointer transition-colors"
                  style={{ color: "var(--color-text)", background: "transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* German character buttons */}
        <div className="flex gap-1.5 justify-center mt-3">
          {GERMAN_CHARS.map((ch) => (
            <button
              key={ch}
              onClick={() => insertChar(ch)}
              className="w-10 h-10 rounded-lg text-base font-semibold border cursor-pointer transition-colors hover:bg-white/5"
              style={{
                background: "var(--color-page-bg)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
              aria-label={`Insert ${ch}`}
            >
              {ch}
            </button>
          ))}
        </div>

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
