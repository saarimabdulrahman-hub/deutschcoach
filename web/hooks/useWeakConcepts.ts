"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

// Adaptive weak concept selection (Section 10.1).
// Pulls weak vocabulary from SRS (low ease factor / high lapses) and
// infers weak grammar from checkpoint performance.

export interface WeakConcept {
  type: "vocabulary" | "grammar";
  id: number | string;
  label: string;
  strength: number; // 0-100 (lower = weaker)
}

export interface UseWeakConceptsReturn {
  weakVocabulary: WeakConcept[];
  weakGrammar: WeakConcept[];
  allWeak: WeakConcept[];
  loading: boolean;
}

export function useWeakConcepts(lessonId?: number): UseWeakConceptsReturn {
  const [weakVocab, setWeakVocab] = useState<WeakConcept[]>([]);
  const [weakGrammar, setWeakGrammar] = useState<WeakConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch weakest words from dashboard (already sorted by lapses)
        const dash = await api.get<{ weakest_words: { id: number; german: string; english: string; lapses: number }[] }>("/dashboard");

        if (cancelled) return;
        const vocab: WeakConcept[] = (dash.weakest_words ?? []).map((w) => ({
          type: "vocabulary" as const,
          id: w.id,
          label: w.german,
          strength: Math.max(0, 100 - w.lapses * 20),
        }));
        setWeakVocab(vocab);

        // Fetch checkpoint results for weak grammar inference
        if (lessonId) {
          try {
            const mastery = await api.get<{ categories: Record<string, { score: number | null; status: string }> }>(`/lessons/${lessonId}/mastery`);
            if (!cancelled && mastery.categories) {
              const grammar = mastery.categories["grammarApplication"];
              if (grammar && grammar.score !== null && grammar.score < 70) {
                setWeakGrammar([{
                  type: "grammar" as const,
                  id: "grammar-application",
                  label: "Grammar Application",
                  strength: grammar.score,
                }]);
              }
            }
          } catch {
            // No mastery data yet — skip grammar weakness
          }
        }
      } catch {
        // Dashboard unavailable — skip
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId]);

  return {
    weakVocabulary: weakVocab,
    weakGrammar,
    allWeak: [...weakVocab, ...weakGrammar],
    loading,
  };
}
