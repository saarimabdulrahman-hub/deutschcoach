"use client";

import { useState, useCallback, useMemo } from "react";
import { useProgressiveHints, type HintLevel } from "@/hooks/useProgressiveHints";
import { EmmaHintCard } from "@/components/emma/EmmaHintCard";
import { MatchingExercise } from "@/components/interaction/MatchingExercise";
import { OrderingExercise } from "@/components/interaction/OrderingExercise";
import { FillInExercise } from "@/components/interaction/FillInExercise";
import { getGrammarTemplate } from "./grammarTemplates";
import { fetchEmmaGrammarExplanation } from "@/lib/emmaApi";

// Grammar Discovery Flow (Section 8.7). Replaces passive text blocks with a
// structured 5-step discovery experience: Observe → Identify → Experiment →
// Explanation → Practice. Adapts based on topic suitability. Driven by the
// topic's template and slug from lesson configuration.

type DiscoveryStep = "observe" | "identify" | "experiment" | "explanation" | "practice";
type Suitability = "full" | "hints" | "skip";
type GrammarTopicData = { id?: any; slug?: string; title?: string; content?: string | null; examples?: any[] | any };

/** Determine discovery suitability from a grammar topic's slug and title. */
function detectSuitability(topic: GrammarTopicData): Suitability {
  const slug = (topic.slug ?? "").toLowerCase();
  const title = (topic.title ?? "").toLowerCase();

  if (slug.includes("preposition") || slug.includes("weak") ||
      title.includes("preposition") || title.includes("weak noun")) {
    return "skip";
  }
  if (slug.includes("position") || slug.includes("time-manner") ||
      title.includes("sentence position") || title.includes("verb position")) {
    return "hints";
  }
  return "full";
}

/** Resolve the grammar template from lesson configuration (explicit) or infer. */
function resolveTemplate(topic: GrammarTopicData): string {
  return getGrammarTemplate(topic.slug, topic.title);
}

/** Build example-based hints for progressive revelation. */
function buildHints(topic: GrammarTopicData): HintLevel[] {
  const title = topic.title ?? "";
  return [
    { level: 1, text: `Look at the pattern in the example sentences. What changes?` },
    { level: 2, text: `Pay attention to how "${title}" affects the words around it.` },
    { level: 3, text: `In this pattern, the word endings signal the grammatical relationship.` },
    { level: 4, text: `"${title}" in German. ${topic.content?.slice(0, 150) ?? "Review the rule below for details."}` },
  ];
}

/** Build observe examples from grammar topic examples. */
function buildExamples(topic: GrammarTopicData): { de: string; en: string }[] {
  const raw: any[] = Array.isArray(topic.examples) ? topic.examples : [];
  return raw.filter((ex) =>
    typeof ex?.de === "string" && typeof ex?.en === "string"
  );
}

interface GrammarDiscoveryFlowProps {
  topic: GrammarTopicData;
  /** Optional explicit template override from lesson configuration. If omitted, inferred from slug. */
  template?: string;
  onComplete: () => void;
}

export function GrammarDiscoveryFlow({ topic, template: explicitTemplate, onComplete }: GrammarDiscoveryFlowProps) {
  const template = explicitTemplate ?? resolveTemplate(topic);
  const suitability = detectSuitability(topic);
  const hints = useProgressiveHints(buildHints(topic));
  const examples = useMemo(() => buildExamples(topic), [topic]);

  // For "skip" suitability: go straight to Explanation → Practice
  const initialStep: DiscoveryStep = suitability === "skip" ? "explanation" : "observe";
  const [step, setStep] = useState<DiscoveryStep>(initialStep);
  const [identifyAnswer, setIdentifyAnswer] = useState<number | null>(null);
  const [explanationShown, setExplanationShown] = useState(false);

  const handleNext = useCallback(() => {
    switch (step) {
      case "observe": setStep("identify"); break;
      case "identify": setStep("experiment"); break;
      case "experiment": setStep("explanation"); break;
      case "explanation": setStep("practice"); break;
      case "practice": onComplete(); break;
    }
  }, [step, onComplete]);

  // Build practice items from examples + topic content
  const practicePairs = useMemo(() => {
    const pairs: { id: number; left: string; right: string }[] = [];
    for (const ex of examples.slice(0, 5)) {
      pairs.push({ id: pairs.length, left: ex.de, right: ex.en });
    }
    // Add content-based pairs if not enough examples
    if (pairs.length < 3 && topic.content) {
      const sentences = topic.content.split(/[.!?]+/).filter(Boolean).slice(0, 3);
      for (const s of sentences) {
        pairs.push({ id: pairs.length, left: s.trim(), right: "Practice sentence" });
      }
    }
    return pairs;
  }, [examples, topic.content]);

  const orderItems = useMemo(() => examples.slice(0, 3).map((ex, i) => ({
    id: i, front: ex.en, back: ex.de,
  })), [examples]);

  const fillItems = useMemo(() => examples.slice(0, 4).map((ex, i) => {
    const words = ex.de.split(/\s+/);
    if (words.length < 2) return { id: i, front: ex.de, back: ex.en };
    const idx = Math.floor(Math.random() * words.length);
    const hidden = words[idx];
    words[idx] = "____";
    return { id: i, front: `${words.join(" ")} — ${ex.en}`, back: hidden };
  }), [examples]);

  const [emmaExplanation, setEmmaExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  if (!topic) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No grammar topic.</p>;
  }

  return (
    <div className="max-w-lg mx-auto py-2 space-y-4">
      {/* Step indicator */}
      <div className="flex gap-1.5">
        {(["observe", "identify", "experiment", "explanation", "practice"] as const).map((s, i) => {
          const stepIdx = ["observe", "identify", "experiment", "explanation", "practice"].indexOf(step);
          const isActive = i === stepIdx;
          const isDone = i < stepIdx;
          return (
            <div key={s} className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: isDone ? "var(--color-accent-gradient)" : isActive ? "var(--color-accent)" : "var(--color-border)" }} />
          );
        })}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Step {["observe", "identify", "experiment", "explanation", "practice"].indexOf(step) + 1} of 5 · {topic.title}
      </p>

      {/* Step: Observe — show highlighted example sentences */}
      {step === "observe" && (
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-text)" }}>Observe</h3>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            Read these examples. Pay attention to the highlighted pattern.
          </p>
          <div className="space-y-3">
            {examples.slice(0, 4).map((ex, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "var(--color-page-bg)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{ex.de}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{ex.en}</p>
              </div>
            ))}
            {examples.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {topic.content?.slice(0, 200) ?? "Study the grammar pattern below."}
              </p>
            )}
          </div>
          <button onClick={handleNext} className="mt-4 min-h-[44px] px-5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step: Identify — multiple choice */}
      {step === "identify" && (
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-text)" }}>What do you notice?</h3>
          {suitability === "hints" && hints.currentHint && (
            <EmmaHintCard hint={hints.currentHint} onDismiss={hints.resetHints} />
          )}
          <div className="space-y-2">
            {[
              `The pattern of "${topic.title}" in these examples`,
              "All sentences have the exact same structure",
              "The vocabulary is all the same",
              "Nothing is different",
            ].map((opt, oi) => {
              const isSelected = identifyAnswer === oi;
              const isCorrect = oi === 0;
              return (
                <button
                  key={oi}
                  onClick={() => setIdentifyAnswer(oi)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm border cursor-pointer transition-all"
                  style={{
                    background: isSelected ? "rgba(168,85,247,0.08)" : "transparent",
                    borderColor: isSelected ? "rgba(168,85,247,0.25)" : "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {opt}
                  {identifyAnswer !== null && oi === 0 && " ✅"}
                  {identifyAnswer !== null && oi === identifyAnswer && oi !== 0 && " — try again"}
                </button>
              );
            })}
          </div>
          {suitability === "full" && (
            <button
              onClick={hints.advanceHint}
              className="mt-2 text-xs font-medium hover:underline border-none cursor-pointer"
              style={{ color: "var(--color-text-muted)" }}
            >
              💡 Need a hint? ({hints.currentLevel}/4)
            </button>
          )}
          {identifyAnswer === 0 && (
            <button onClick={handleNext} className="mt-3 min-h-[44px] px-5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
              Continue →
            </button>
          )}
        </div>
      )}

      {/* Step: Experiment — drag-to-order */}
      {step === "experiment" && (
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-text)" }}>Experiment</h3>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            Rearrange the words to form a correct German sentence.
          </p>
          {orderItems.length > 0 ? (
            <OrderingExercise items={orderItems.slice(0, 1)} />
          ) : (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Use the examples above to practice constructing sentences.
            </p>
          )}
          {suitability === "full" && (
            <button
              onClick={hints.advanceHint}
              className="mt-2 text-xs font-medium hover:underline border-none cursor-pointer"
              style={{ color: "var(--color-text-muted)" }}
            >
              💡 Need a hint? ({hints.currentLevel}/4)
            </button>
          )}
          <button onClick={handleNext} className="mt-3 min-h-[44px] px-5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            See the rule →
          </button>
        </div>
      )}

      {/* Step: Explanation — show grammar rule */}
      {step === "explanation" && (
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-text)" }}>{topic.title}</h3>
          {topic.content && (
            <div className="rounded-lg p-3 mb-3" style={{ background: "var(--color-page-bg)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {topic.content}
              </p>
            </div>
          )}
          {Array.isArray(topic.examples) && topic.examples.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Examples</p>
              {(topic.examples as any[]).map((ex: any, i: number) => (
                <div key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-text)" }}>{ex.de ?? ex.german}</span>
                  <span>{ex.en ?? ex.english}</span>
                </div>
              ))}
            </div>
          )}
          {/* Emma explanation card */}
          <EmmaHintCard
            hint={`Here's how "${topic.title}" works in German: ${topic.content?.slice(0, 200) ?? "Review the examples above to understand this pattern."}`}
          />
          {/* Ask Emma for a deeper explanation (Section 9.2) */}
          {!emmaExplanation && !loadingExplanation && (
            <button
              onClick={async () => {
                setLoadingExplanation(true);
                const result = await fetchEmmaGrammarExplanation(
                  topic.slug ?? "",
                  topic.title ?? "",
                  topic.content
                );
                setEmmaExplanation(result);
                setLoadingExplanation(false);
              }}
              className="w-full min-h-[36px] rounded-lg text-xs font-medium border-none cursor-pointer mt-2"
              style={{ background: "rgba(168,85,247,0.06)", color: "var(--color-accent-light)" }}
            >
              💡 Ask Emma to explain this
            </button>
          )}
          {loadingExplanation && (
            <p className="text-xs mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>Emma is thinking…</p>
          )}
          {emmaExplanation && (
            <div className="rounded-xl p-3 mt-2" style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-badge-bg)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-light)" }}>Emma explains</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{emmaExplanation}</p>
            </div>
          )}
          <button onClick={handleNext} className="mt-3 min-h-[44px] px-5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {suitability === "skip" ? "Practice →" : "Got it →"}
          </button>
        </div>
      )}

      {/* Step: Practice — 3-5 exercises */}
      {step === "practice" && (
        <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-text)" }}>Practice</h3>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            Apply what you&apos;ve learned.
          </p>

          {/* Matching exercise */}
          {practicePairs.length >= 2 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>Match the German examples</p>
              <MatchingExercise pairs={practicePairs} />
            </div>
          )}

          {/* Fill-in exercise */}
          {fillItems.length >= 2 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>Fill in the missing word</p>
              <FillInExercise items={fillItems} />
            </div>
          )}

          {/* Emma practice feedback */}
          <EmmaHintCard
            hint={`Great work practicing "${topic.title}"! Try creating your own sentences using this pattern.`}
          />

          <button onClick={handleNext} className="mt-3 min-h-[44px] px-5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            Complete
          </button>
        </div>
      )}
    </div>
  );
}
