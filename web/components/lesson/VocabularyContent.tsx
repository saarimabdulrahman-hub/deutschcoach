"use client";

import { useState } from "react";
import type { VocabEntry } from "@/types";

// Vocabulary stage — flip cards in chunked sets (LESSON_WIREFRAMES Screen 4).
// Renders inside LessonShell's content slot. Real vocabulary from the API.

interface Props { vocabulary: VocabEntry[]; }

const DISPLAY_POS: Record<string, string> = { noun: "der/die/das · noun", verb: "verb", adjective: "adj.", greeting: "greeting", phrase: "phrase" };

export function VocabularyContent({ vocabulary }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const max = vocabulary.length;
  if (!max) return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No vocabulary for this lesson.</p>;

  const current = vocabulary[index];
  const pos = current.part_of_speech ?? "";
  const setsLabel = max <= 6 ? `Set 1 of 1` : `Set ${Math.ceil((index + 1) / 6)} of ${Math.ceil(max / 6)}`;

  const goNext = () => { setFlipped(false); setIndex((i) => (i + 1) % max); };
  const goPrev = () => { setFlipped(false); setIndex((i) => (i - 1 + max) % max); };

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Your words &middot; {setsLabel}
      </p>
      <div role="button" tabIndex={0} aria-label={`${current.german}. Tap to flip.`}
        onClick={() => setFlipped((f) => !f)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
        className="mt-3 rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[180px] flex flex-col justify-center"
        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        {!flipped ? (
          <>
            <p className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--color-text)" }}>{current.german}</p>
            <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
              {DISPLAY_POS[pos] || pos} {current.gender ? `(${current.gender})` : ""}
            </p>
            <p className="text-[11px] mt-3 opacity-60" style={{ color: "var(--color-text-muted)" }}>Tap to flip</p>
          </>
        ) : (
          <>
            <p className="text-xl sm:text-2xl font-medium" style={{ color: "var(--color-text)" }}>{current.english}</p>
            {current.example_sentence && <p className="text-sm mt-2 italic" style={{ color: "var(--color-text-secondary)" }}>{current.example_sentence}</p>}
            {current.plural_form && <p className="text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>Plural: {current.plural_form}</p>}
          </>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={goPrev} aria-label="Previous word" className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg" style={{ color: "var(--color-text-muted)" }}>‹</button>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--color-text-muted)" }}>{index + 1} / {max}</span>
        <button onClick={goNext} aria-label="Next word" className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg" style={{ color: "var(--color-text-muted)" }}>›</button>
      </div>
    </div>
  );
}
