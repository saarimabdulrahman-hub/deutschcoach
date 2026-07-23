// Lesson stage registry (Sprint 6.2D). Navigation metadata only — no lesson
// content. Consumers may pass their own stage list; this is the canonical
// default from LESSON_FLOW.

export interface LessonStageDef {
  key: string;            // stable id (used for routing/analytics/deep-link later)
  label: string;          // shown in progress + announced to screen readers
  ctaLabel?: string;      // overrides the default primary CTA for this stage
  optional?: boolean;     // skippable (e.g. Speaking) — renders as "skipped" if passed
  inProgress?: boolean;   // counts as a progress segment (default true)
}

// Default primary-CTA per stage — the bottom action updates automatically.
export const DEFAULT_STAGE_CTA: Record<string, string> = {
  "warm-welcome": "Start lesson",
  "dialogue": "Continue reading",
  "vocabulary": "Continue",
  "grammar": "Got it",
  "guided-practice": "Practice",
  "interactive-exercise": "Check answer",
  "speaking": "Continue",
  "mini-review": "Continue",
  "celebration": "See summary",
  "learning-summary": "Finish lesson",
};

// Canonical order. The 8 learning stages are progress segments; Celebration and
// Learning Summary are post-lesson (inProgress: false → the bar reads complete).
export const DEFAULT_LESSON_STAGES: LessonStageDef[] = [
  { key: "warm-welcome", label: "Warm-up" },
  { key: "dialogue", label: "Dialogue" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
  { key: "guided-practice", label: "Practice" },
  { key: "interactive-exercise", label: "Exercise" },
  { key: "speaking", label: "Speaking", optional: true },
  { key: "mini-review", label: "Review" },
  { key: "celebration", label: "Celebration", inProgress: false },
  { key: "learning-summary", label: "Summary", inProgress: false },
];
