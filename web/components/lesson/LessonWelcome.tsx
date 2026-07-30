"use client";

import { useState, useEffect } from "react";
import type { LessonDetail } from "@/types";
import { api } from "@/lib/api";

// Screen 1 — Lesson Preview (LESSON_WIREFRAMES). The capability-first intro.
// Rendered inside LessonShell's content slot.
// Includes prerequisite review (Section 10.3 adaptive).

interface Props {
  lesson: LessonDetail["lesson"];
  vocabCount?: number;
  exerciseCount?: number;
  onStart: () => void;
}

const mins = 8;
const LEVEL_NAME: Record<string, string> = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Int.", C1: "Advanced" };

export function LessonWelcome({ lesson, vocabCount, exerciseCount, onStart }: Props) {
  const levelLabel = LEVEL_NAME[lesson.level] ?? lesson.level;
  const vc = vocabCount ?? lesson.topics?.length ?? 0;
  const ec = exerciseCount ?? 0;

  // ── Prerequisite review (Section 10.3) ────────────────────────────────
  const [prereqs, setPrereqs] = useState<{ prereq_type: string; label: string; current_confidence: number | null; min_confidence: number; satisfied: boolean }[]>([]);
  const [loadingPrereqs, setLoadingPrereqs] = useState(false);

  useEffect(() => {
    if (!lesson.id) return;
    setLoadingPrereqs(true);
    api.get(`/adaptive/prerequisites/${lesson.id}`)
      .then((data: any) => {
        setPrereqs(data.prerequisites ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingPrereqs(false));
  }, [lesson.id]);

  const unsatisfied = prereqs.filter((p) => !p.satisfied);

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

      {/* Prerequisite review section */}
      {loadingPrereqs && (
        <div className="mt-4 rounded-xl p-3" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Checking prerequisites…</p>
        </div>
      )}
      {!loadingPrereqs && unsatisfied.length > 0 && (
        <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(255,71,87,0.04)", border: "1px solid rgba(255,71,87,0.15)" }}>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#FF6B77" }}>
            <span>📋</span> Review before this lesson
          </p>
          <div className="space-y-1.5">
            {unsatisfied.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <span>{p.label}</span>
                <span className="font-medium" style={{ color: p.current_confidence !== null && p.current_confidence >= 0.5 ? "#4ADE80" : "#FF6B77" }}>
                  {p.current_confidence !== null ? `${Math.round(p.current_confidence * 100)}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
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
