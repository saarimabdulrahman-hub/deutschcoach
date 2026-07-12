"use client";

import type { LessonDetail } from "@/types";

// Screen 1 — Lesson Preview (LESSON_WIREFRAMES). The capability-first intro.
// Rendered inside LessonShell's content slot.

interface Props { lesson: LessonDetail["lesson"]; onStart: () => void; }

export function LessonWelcome({ lesson, onStart }: Props) {
  const levelName: Record<string, string> = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Int.", C1: "Advanced" };
  const mins = 8; // documented placeholder (Sprint 5.3A)
  return (
    <div className="max-w-lg mx-auto py-4">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
        {lesson.level} · Unit {lesson.unit} · ~{mins} min
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-2" style={{ color: "var(--color-text)" }}>
        {lesson.title}
      </h2>
      {lesson.description && (
        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>{lesson.description}</p>
      )}
      {/* In this lesson checklist */}
      {(lesson.topics?.length > 0 || !lesson.description) && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>In this lesson:</p>
          <ul className="space-y-1.5" style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
            <li className="flex items-center gap-2">🗣 A short real dialogue</li>
            <li className="flex items-center gap-2">📇 {lesson.topics?.length || "new"} vocabulary items</li>
            {lesson.topics?.length > 0 && <li className="flex items-center gap-2">✦ {lesson.topics.slice(0, 2).join(", ")}</li>}
            <li className="flex items-center gap-2">✎ Quick practice exercises</li>
          </ul>
        </div>
      )}
      <button onClick={onStart} className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold w-full sm:w-auto"
        style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
        Start lesson →
      </button>
    </div>
  );
}
