"use client";

import { useRouter } from "next/navigation";
import type { MasteryResult } from "@/hooks/useMastery";
import { useEmma } from "@/components/emma/EmmaContext";

// Lesson mastery summary shown after lesson completion (Section 8.4).
// Displays overall mastery percentage and category-level breakdown.

interface LessonMasterySummaryProps {
  title: string;
  mastery: MasteryResult;
  wordCount: number;
  patternName?: string;
  nextTitle?: string;
  onNextLesson?: () => void;
}

function CategoryBar({ label, pct, color }: { label: string; pct: number | "skipped" | null; color: string }) {
  const displayPct = typeof pct === "number" ? pct : 0;
  const displayLabel = pct === "skipped" ? "Skipped" : pct !== null ? `${pct}%` : "—";

  return (
    <div className="rounded-xl p-3" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: pct === "skipped" ? "var(--color-text-muted)" : "var(--color-text)" }}>
          {displayLabel}
        </span>
      </div>
      {typeof pct === "number" ? (
        <div className="h-2 rounded-full" style={{ background: "var(--color-border)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${displayPct}%`, background: color }} />
        </div>
      ) : pct === "skipped" ? (
        <div className="h-2 rounded-full" style={{ background: "var(--color-border)" }}>
          <div className="h-full rounded-full" style={{ width: "100%", background: "rgba(168,85,247,0.12)" }} />
        </div>
      ) : null}
    </div>
  );
}

function Rings({ pct }: { pct: number | null }) {
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const offset = pct !== null ? circumference - (pct / 100) * circumference : circumference;

  return (
    <div className="relative w-32 h-32 mx-auto mb-2">
      <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden>
        {/* Background ring */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="8" />
        {/* Progress ring */}
        {pct !== null && (
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="url(#mastery-grad)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 64 64)"
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        )}
        <defs>
          <linearGradient id="mastery-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-extrabold" style={{ color: "var(--color-text)" }}>
          {pct !== null ? `${pct}%` : "—"}
        </span>
        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Mastery</span>
      </div>
    </div>
  );
}

export function LessonMasterySummary({
  title, mastery, wordCount, patternName, nextTitle, onNextLesson,
}: LessonMasterySummaryProps) {
  const router = useRouter();
  const emma = useEmma();

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="text-center mb-6">
        <Rings pct={mastery.overall} />
        <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {wordCount} {wordCount === 1 ? "word" : "words"} · {mastery.overall !== null ? `${mastery.overall}% mastery` : "complete"}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
          Category Breakdown
        </p>
        <CategoryBar label="Dialogue Comprehension" pct={mastery.categories.dialogueComprehension} color="#A855F7" />
        <CategoryBar label="Vocabulary Recall" pct={mastery.categories.vocabularyRecall} color="#EC4899" />
        <CategoryBar label="Grammar Application" pct={mastery.categories.grammarApplication} color="#8B5CF6" />
        <CategoryBar label="Speaking" pct={mastery.categories.speaking} color="#22C55E" />
      </div>

      {/* Emma encouragement (Phase 3) */}
      <div className="mt-4 rounded-xl p-3" style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-badge-bg)" }}>
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-0.5">👩‍🏫</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{ color: "var(--color-accent-light)" }}>Emma says</p>
            <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {mastery.overall !== null && mastery.overall >= 80
                ? "Great job! You've really mastered this lesson. Keep the momentum going! 🌟"
                : mastery.overall !== null && mastery.overall >= 50
                ? "Good work! You're making solid progress. Review the areas you found tricky and you'll have it down. 💪"
                : "You've completed the lesson — that's the important part! Every attempt builds your German skills. Try reviewing with flashcards to strengthen what you learned. 🌱"}
            </p>
            <button
              onClick={() => {
                emma.setOpen(true);
                emma.send("I just finished the lesson. Any tips on what I should focus on next?");
              }}
              className="mt-1 text-xs font-medium hover:underline border-none cursor-pointer"
              style={{ color: "var(--color-accent-light)" }}
            >
              Ask Emma for tips →
            </button>
          </div>
        </div>
      </div>

      {/* Achievement summary */}
      <div className="mt-4 space-y-2">
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <span className="text-lg">📇</span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text)" }}>{wordCount} words</strong> added to your reviews
          </span>
        </div>
        {patternName && (
          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <span className="text-lg">✦</span>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "var(--color-text)" }}>{patternName}</strong> pattern
            </span>
          </div>
        )}
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <span className="text-lg">🗣</span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text)" }}>1 conversation</strong> practiced
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        {onNextLesson && (
          <button onClick={onNextLesson} className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {nextTitle ? `Next: ${nextTitle} →` : "Next lesson →"}
          </button>
        )}
        <button onClick={() => router.push("/review")} className="flex-1 px-6 py-3 rounded-xl text-sm font-medium"
          style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
          Review words
        </button>
      </div>
    </div>
  );
}
