"use client";

import type { LessonStep } from "./types";

// Segmented lesson progress (Sprint 6.2A · per LESSON_WIREFRAMES Part A).
// Communicates structure + position + remaining WITHOUT a bare percentage:
// "Step X of Y", a segment per stage, plus the current stage name.
// Screen-reader + colorblind safe — the textual step/label carries the meaning,
// the bar is supplementary.

export type { LessonStep };

interface ProgressSegmentsProps {
  steps: LessonStep[];
  currentStep: number; // 1-based index of the active stage
}

function resolveStatus(step: LessonStep, i: number, current: number): NonNullable<LessonStep["status"]> {
  if (step.status) return step.status;
  if (i < current - 1) return "done";
  if (i === current - 1) return "current";
  return "upcoming";
}

export function ProgressSegments({ steps, currentStep }: ProgressSegmentsProps) {
  const total = steps.length || 1;
  const clamped = Math.min(Math.max(currentStep, 1), total);
  const currentLabel = steps[clamped - 1]?.label ?? "";

  return (
    <div role="group" aria-label={`Lesson progress: step ${clamped} of ${total}${currentLabel ? `, ${currentLabel}` : ""}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Step {clamped} of {total}
        </span>
        {currentLabel && (
          <span className="text-[11px] font-medium truncate ml-2" style={{ color: "var(--color-text-secondary)" }}>{currentLabel}</span>
        )}
      </div>
      <ol className="flex items-center gap-1">
        {steps.map((step, i) => {
          const status = resolveStatus(step, i, clamped);
          const filled = status === "done" || status === "current";
          return (
            <li key={step.key} className="flex-1" aria-current={status === "current" ? "step" : undefined}>
              <span className="sr-only">{step.label}: {status}</span>
              <span aria-hidden className="block h-1.5 rounded-full transition-colors duration-200"
                style={{
                  background: filled ? "var(--color-accent)" : "var(--color-border)",
                  opacity: status === "skipped" ? 0.4 : status === "upcoming" ? 0.6 : 1,
                  outline: status === "current" ? "1px solid var(--color-accent-light)" : "none",
                  outlineOffset: "1px",
                }} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
