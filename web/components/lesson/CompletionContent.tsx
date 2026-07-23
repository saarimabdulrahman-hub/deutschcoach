"use client";

import { useRouter } from "next/navigation";

// Celebration + Learning Summary (LESSON_WIREFRAMES Screens 10–12).
// "mode" controls which view is shown so one component handles both stages.

interface Props {
  mode: "celebration" | "summary";
  title: string;           // capability achieved
  wordCount: number;
  patternName?: string;
  nextTitle?: string;      // next lesson hint
  onNextLesson?: () => void;
  onFinish?: () => void;
}

export function CompletionContent({ mode, title, wordCount, patternName, nextTitle, onNextLesson, onFinish }: Props) {
  const router = useRouter();

  if (mode === "celebration") {
    return (
      <div className="max-w-sm mx-auto py-8 text-center">
        <p className="text-3xl mb-3">🎉</p>
        <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--color-text)" }}>Lesson complete!</h2>
        <p className="text-base mt-2" style={{ color: "var(--color-text-secondary)" }}>
          You can now {title.toLowerCase()}.
        </p>
        <button onClick={onFinish} className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto min-h-[48px]"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          See what you learned →
        </button>
      </div>
    );
  }

  // summary mode
  return (
    <div className="max-w-md mx-auto py-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>You learned</h2>
      <div className="mt-3 space-y-2">
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
