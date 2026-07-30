"use client";

import { useState } from "react";
import type { LessonDetail } from "@/types";
import { GrammarDiscoveryFlow } from "./GrammarDiscoveryFlow";
import type { InteractionItem } from "@/components/interaction/types";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { MatchingExercise } from "@/components/interaction/MatchingExercise";
import { FillInExercise } from "@/components/interaction/FillInExercise";
import { OrderingExercise } from "@/components/interaction/OrderingExercise";

// Grammar / Pattern Discovery — supports multiple interaction modes:
//   Discover  (interactive 5-step discovery flow per topic)
//   Match     (pair German examples with English)
//   Fill      (fill in the missing word from examples)
//   Order     (rearrange words into the correct sentence)

interface Props {
  grammarTopics: LessonDetail["grammar_topics"];
  /** Weak grammar slugs for adaptive confidence display (Section 10.3). */
  weakGrammar?: string[];
}

type GrammarMode = "discover" | "match" | "fill" | "order";
const MODES: { key: GrammarMode; label: string }[] = [
  { key: "discover", label: "Discover" },
  { key: "match", label: "Match" },
  { key: "fill", label: "Fill" },
  { key: "order", label: "Order" },
];

function buildMatchPairs(topics: LessonDetail["grammar_topics"]) {
  const pairs: { id: number; left: string; right: string }[] = [];
  if (!topics) return pairs;
  for (const g of topics) {
    const exs: any[] = Array.isArray(g.examples) ? g.examples : [];
    for (const ex of exs) {
      const de = (ex as any).de ?? (ex as any).german;
      const en = (ex as any).en ?? (ex as any).english;
      if (de && en) pairs.push({ id: pairs.length, left: de, right: en });
    }
  }
  return pairs;
}

/** Build fill-in items: hide a word from each German example. */
function buildFillItems(topics: LessonDetail["grammar_topics"]): InteractionItem[] {
  const items: InteractionItem[] = [];
  if (!topics) return items;
  for (const g of topics) {
    const exs: any[] = Array.isArray(g.examples) ? g.examples : [];
    for (const ex of exs) {
      const de = (ex.de ?? ex.german ?? "").trim();
      const en = (ex.en ?? ex.english ?? "").trim();
      if (!de || !en) continue;
      const words = de.split(/\s+/);
      if (words.length < 2) continue;
      const idx = Math.floor(Math.random() * words.length);
      const hidden = words[idx];
      words[idx] = "____";
      items.push({
        id: items.length,
        front: `${words.join(" ")} — ${en}`,
        back: hidden,
        hint: `Fill in the missing word (${hidden.length} letters)`,
      });
    }
  }
  return items.length ? items : [{ id: 0, front: "Match the examples", back: "Practice" }];
}

/** Build ordering items: shuffle German example sentences. */
function buildOrderItems(topics: LessonDetail["grammar_topics"]): InteractionItem[] {
  const items: InteractionItem[] = [];
  if (!topics) return items;
  for (const g of topics) {
    const exs: any[] = Array.isArray(g.examples) ? g.examples : [];
    for (const ex of exs) {
      const de = ((ex as any).de ?? (ex as any).german ?? "").trim();
      const en = ((ex as any).en ?? (ex as any).english ?? "").trim();
      if (!de || !en) continue;
      items.push({ id: items.length, front: en, back: de });
    }
  }
  return items.length ? items : [{ id: 0, front: "Order the sentence", back: "Ich lerne Deutsch." }];
}

export function GrammarContent({ grammarTopics, weakGrammar }: Props) {
  const [mode, setMode] = useState<GrammarMode>("discover");
  const [topicIndex, setTopicIndex] = useState(0);

  if (!grammarTopics?.length) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No grammar for this lesson.</p>;
  }

  // Exercise modes
  if (mode === "match") {
    const pairs = buildMatchPairs(grammarTopics);
    return (
      <div className="py-2">
        <ModeTabs modes={MODES} current={mode} onChange={setMode} />
        <div className="mt-3">
          <MatchingExercise pairs={pairs} />
        </div>
      </div>
    );
  }

  if (mode === "fill") {
    const fillItems = buildFillItems(grammarTopics);
    return (
      <div className="py-2">
        <ModeTabs modes={MODES} current={mode} onChange={setMode} />
        <div className="mt-3">
          <FillInExercise items={fillItems} />
        </div>
      </div>
    );
  }

  if (mode === "order") {
    const orderItems = buildOrderItems(grammarTopics);
    return (
      <div className="py-2">
        <ModeTabs modes={MODES} current={mode} onChange={setMode} />
        <div className="mt-3">
          <OrderingExercise items={orderItems} />
        </div>
      </div>
    );
  }

  // Default: Discover mode — interactive discovery flow per topic
  const currentTopic = grammarTopics[topicIndex];

  return (
    <div className="py-2">
      <ModeTabs modes={MODES} current={mode} onChange={setMode} />
      <div className="mt-3">
        <GrammarDiscoveryFlow
          key={currentTopic.slug ?? topicIndex}
          topic={currentTopic}
          onComplete={() => {
            if (topicIndex < grammarTopics.length - 1) {
              setTopicIndex((i) => i + 1);
            }
          }}
        />
        {/* Topic navigation */}
        {grammarTopics.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setTopicIndex((i) => Math.max(0, i - 1))}
              disabled={topicIndex === 0}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer disabled:opacity-30"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Previous topic
            </button>
            <span className="text-[11px] flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
              Topic {topicIndex + 1} of {grammarTopics.length}
              {weakGrammar?.includes(currentTopic.slug) && (
                <ConfidenceBadge level="low" size="sm" />
              )}
            </span>
            <button
              onClick={() => setTopicIndex((i) => Math.min(grammarTopics.length - 1, i + 1))}
              disabled={topicIndex >= grammarTopics.length - 1}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer disabled:opacity-30"
              style={{ color: "var(--color-text-muted)" }}
            >
              Next topic →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Reusable mode tab bar. */
function ModeTabs({ modes, current, onChange }: {
  modes: { key: string; label: string }[];
  current: string;
  onChange: (key: any) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--color-page-bg)" }}>
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className="flex-1 min-h-[36px] rounded-lg text-xs font-semibold border-none cursor-pointer transition-all"
          style={{
            background: m.key === current ? "var(--color-card-bg)" : "transparent",
            color: m.key === current ? "var(--color-text)" : "var(--color-text-muted)",
            boxShadow: m.key === current ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
