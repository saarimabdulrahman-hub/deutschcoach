"use client";

import type { LessonDetail } from "@/types";
import { MatchingExercise } from "@/components/interaction/MatchingExercise";
import { FillInExercise } from "@/components/interaction/FillInExercise";

// Grammar Practice stage (Section 10.3). Inline weak grammar concept practice.
// Renders matching and fill-in exercises derived from grammar topic examples.
// Supports adaptive grammar reinforcement by consuming weak grammar topics.

interface GrammarPracticeProps {
  grammarTopics: LessonDetail["grammar_topics"];
  /** Weak grammar topic slugs to prioritize */
  weakGrammar?: string[];
}

export function GrammarPractice({ grammarTopics, weakGrammar }: GrammarPracticeProps) {
  if (!grammarTopics?.length) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>
        No grammar practice available.
      </p>
    );
  }

  // Prioritize weak grammar topics, then include all topics
  const sorted = [...grammarTopics].sort((a, b) => {
    const aWeak = weakGrammar?.includes(a.slug) ?? false;
    const bWeak = weakGrammar?.includes(b.slug) ?? false;
    if (aWeak && !bWeak) return -1;
    if (!aWeak && bWeak) return 1;
    return 0;
  });

  // Build matching pairs from examples
  const matchPairs: { id: number; left: string; right: string }[] = [];
  const fillItems: { id: number; front: string; back: string; hint?: string }[] = [];

  for (const topic of sorted) {
    const exs: any[] = Array.isArray(topic.examples) ? topic.examples : [];
    for (const ex of exs) {
      const de = ex.de ?? ex.german;
      const en = ex.en ?? ex.english;
      if (de && en) {
        if (matchPairs.length < 8) {
          matchPairs.push({ id: matchPairs.length, left: de, right: en });
        }
        // Build fill items from multi-word examples
        const words = (de as string).split(/\s+/);
        if (words.length >= 2 && fillItems.length < 4) {
          const idx = Math.floor(Math.random() * words.length);
          const hidden = words[idx];
          words[idx] = "____";
          fillItems.push({
            id: fillItems.length,
            front: `${words.join(" ")} — ${en}`,
            back: hidden,
            hint: `Fill the gap in this ${topic.slug} example`,
          });
        }
      }
    }
  }

  // Fallback when no examples are available
  if (matchPairs.length === 0 && fillItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-2">
        <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
          Practice grammar concepts from this lesson.
        </p>
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Review the grammar patterns you've learned by creating your own sentences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2 space-y-6">
      {/* Weak grammar indicator */}
      {weakGrammar && weakGrammar.length > 0 && (
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent-light)" }}>
          🎯 Focus: {weakGrammar.length} topic{weakGrammar.length > 1 ? "s" : ""} to review
        </p>
      )}

      {/* Matching exercise */}
      {matchPairs.length >= 2 && (
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
            Match the examples
          </p>
          <MatchingExercise pairs={matchPairs} />
        </div>
      )}

      {/* Fill-in exercise */}
      {fillItems.length >= 2 && (
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
            Fill in the missing word
          </p>
          <FillInExercise items={fillItems} />
        </div>
      )}
    </div>
  );
}
