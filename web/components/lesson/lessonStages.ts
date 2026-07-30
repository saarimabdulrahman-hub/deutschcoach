// Lesson stage registry (Sprint 6.2D / Phase 2 8.1). Lesson-type-specific stage
// sequences replace the single rigid flow. Each lesson selects a sequence based
// on its lesson_type field.

export interface LessonStageDef {
  key: string;            // stable id (used for routing/analytics/deep-link later)
  label: string;          // shown in progress + announced to screen readers
  ctaLabel?: string;      // overrides the default primary CTA for this stage
  optional?: boolean;     // skippable (e.g. Speaking) — renders as "skipped" if passed
  inProgress?: boolean;   // counts as a progress segment (default true)
}

// Default primary-CTA per stage — the bottom action updates automatically.
export const DEFAULT_STAGE_CTA: Record<string, string> = {
  "listen": "Listen",
  "dialogue": "Continue reading",
  "vocabulary": "Continue",
  "pronounce": "Practice",
  "role-play": "Start",
  "comprehension-check": "Check",
  "observe": "Observe",
  "discover": "Discover",
  "explain": "Got it",
  "practice": "Practice",
  "apply": "Apply",
  "mini-review": "Continue",
  "see": "Continue",
  "hear": "Listen",
  "match": "Match",
  "type": "Type",
  "recall": "Recall",
  "speak": "Speak",
  "welcome": "Start lesson",
  "objectives": "Continue",
  "interactive-dialogue": "Continue",
  "vocab-explorer": "Explore",
  "checkpoint": "Check",
  "grammar-discovery": "Discover",
  "guided-practice": "Practice",
  "summary": "Finish lesson",
};

// ── Lesson-type-specific stage sequences ──────────────────────────────
// Each maps to a lesson_type value returned by the backend.
// Counts must be between MIN_STAGES and MAX_STAGES (validated below).

const MIN_STAGES = 6;
const MAX_STAGES = 10;
const TARGET_AVERAGE = 7.5; // 7–8 target

export const DIALOGUE_STAGES: LessonStageDef[] = [
  { key: "listen", label: "Listen" },
  { key: "dialogue", label: "Dialogue" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "pronounce", label: "Pronounce" },
  { key: "role-play", label: "Role-play" },
  { key: "comprehension-check", label: "Comprehension Check" },
];

export const GRAMMAR_STAGES: LessonStageDef[] = [
  { key: "observe", label: "Observe" },
  { key: "discover", label: "Discover" },
  { key: "explain", label: "Explain" },
  { key: "practice", label: "Practice" },
  { key: "apply", label: "Apply" },
  { key: "mini-review", label: "Mini Review" },
];

export const VOCABULARY_STAGES: LessonStageDef[] = [
  { key: "listen", label: "Listen" },
  { key: "see", label: "See" },
  { key: "hear", label: "Hear" },
  { key: "match", label: "Match" },
  { key: "type", label: "Type" },
  { key: "recall", label: "Recall" },
  { key: "speak", label: "Speak" },
];

export const MIXED_STAGES: LessonStageDef[] = [
  { key: "welcome", label: "Welcome" },
  { key: "objectives", label: "Objectives" },
  { key: "interactive-dialogue", label: "Interactive Dialogue" },
  { key: "vocab-explorer", label: "Vocab Explorer" },
  { key: "checkpoint", label: "Checkpoint" },
  { key: "grammar-discovery", label: "Grammar Discovery" },
  { key: "guided-practice", label: "Guided Practice" },
  { key: "mini-review", label: "Mini Review" },
  { key: "summary", label: "Summary" },
];

// The default sequence (used when lesson_type is absent or unknown).
export const DEFAULT_LESSON_STAGES: LessonStageDef[] = MIXED_STAGES;

// ── Selector ─────────────────────────────────────────────────────────
// Returns the stage sequence for a given lesson type.

export function getStagesForLessonType(lessonType?: string): LessonStageDef[] {
  switch (lessonType) {
    case "dialogue":  return DIALOGUE_STAGES;
    case "grammar":   return GRAMMAR_STAGES;
    case "vocabulary": return VOCABULARY_STAGES;
    case "mixed":
    default:          return MIXED_STAGES;
  }
}

// ── Stage limit validation ────────────────────────────────────────────

function validateStageSequence(name: string, stages: LessonStageDef[]): void {
  const count = stages.length;
  if (count < MIN_STAGES) {
    throw new Error(
      `Stage sequence "${name}" has ${count} stages (minimum ${MIN_STAGES})`
    );
  }
  if (count > MAX_STAGES) {
    throw new Error(
      `Stage sequence "${name}" has ${count} stages (maximum ${MAX_STAGES})`
    );
  }
}

// Validate all sequences at module load time.
const _SEQUENCES: [string, LessonStageDef[]][] = [
  ["dialogue", DIALOGUE_STAGES],
  ["grammar", GRAMMAR_STAGES],
  ["vocabulary", VOCABULARY_STAGES],
  ["mixed", MIXED_STAGES],
];

let _totalStages = 0;
for (const [name, stages] of _SEQUENCES) {
  validateStageSequence(name, stages);
  _totalStages += stages.length;
}

const _average = _totalStages / _SEQUENCES.length;
if (_average < 7 || _average > 8) {
  console.warn(
    `Average stage count across all sequences is ${_average.toFixed(1)} ` +
    `(target: 7–8). Adjust sequences to meet the target.`
  );
}
