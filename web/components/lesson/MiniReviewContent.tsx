"use client";

import { useState } from "react";
import type { VocabEntry } from "@/types";

// Mini Review (LESSON_WIREFRAMES Screen 9). Quick recognition/recall over the
// lesson's vocabulary — end on wins, never a scored quiz.

interface Props { vocabulary: VocabEntry[]; }

export function MiniReviewContent({ vocabulary }: Props) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  if (!vocabulary.length) return <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>No words to review.</p>;

  if (done) {
    return (
      <div className="max-w-sm mx-auto py-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Quick check complete</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Your {vocabulary.length} words are saved and ready for review.</p>
      </div>
    );
  }

  const word = vocabulary[idx];
  const isLast = idx >= vocabulary.length - 1;

  const advance = () => {
    if (isLast) { setDone(true); return; }
    setRevealed(false); setIdx((i) => i + 1);
  };

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Quick check · {idx + 1} of {vocabulary.length}
      </p>
      <div className="rounded-2xl p-5 text-center" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>{word.german}</p>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="mt-3 text-sm font-semibold hover:underline"
            style={{ color: "var(--color-accent-light)" }}>Tap to reveal</button>
        ) : (
          <p className="mt-2 text-base" style={{ color: "var(--color-text-secondary)" }}>{word.english}</p>
        )}
      </div>
      <div className="flex items-center justify-center mt-4 gap-4">
        {revealed && (
          <button onClick={advance} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {isLast ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
