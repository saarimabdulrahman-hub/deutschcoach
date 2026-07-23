"use client";

import type { LessonDetail } from "@/types";

// Screen 1 — Lesson Preview (LESSON_WIREFRAMES). The capability-first intro.
// Rendered inside LessonShell's content slot.

interface Props {
  lesson: LessonDetail["lesson"];
  vocabCount?: number;     // real vocabulary count from data.vocabulary
  exerciseCount?: number;  // real exercise count from data.exercises
  onStart: () => void;
}

const mins = 8; // documented placeholder (Sprint 5.3A)
const LEVEL_NAME: Record<string, string> = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Int.", C1: "Advanced" };

export function LessonWelcome({ lesson, vocabCount, exerciseCount, onStart }: Props) {
  const levelLabel = LEVEL_NAME[lesson.level] ?? lesson.level;
  const vc = vocabCount ?? lesson.topics?.length ?? 0;
  const ec = exerciseCount ?? 0;
  return (
    <div className="max-w-lg mx-auto py-4">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
        {lesson.level} · {levelLabel} · Unit {lesson.unit} · ~{mins} min
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-2" style={{ color: "var(--color-text)" }}>
        {lesson.title}
      </h2>
      {lesson.description && (
        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>{lesson.description}</p>
      )}
      {/* In this lesson checklist */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>In this lesson:</p>
        <ul className="space-y-1.5" style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
          <li className="flex items-center gap-2">🗣 A short real dialogue</li>
          {vc > 0 && <li className="flex items-center gap-2">📇 {vc} vocabulary words</li>}
          {ec > 0 && <li className="flex items-center gap-2">✎ {ec} practice exercises</li>}
          {lesson.topics?.length > 0 && (
            <li className="flex items-center gap-2">✦ {lesson.topics.slice(0, 2).join(", ")}</li>
          )}
        </ul>
      </div>
      <button onClick={onStart} className="mt-6 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold w-full sm:w-auto min-h-[48px]"
        style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
        Start lesson →
      </button>
    </div>
  );
}
