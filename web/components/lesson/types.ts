// Shared cross-cutting lesson types (Sprint 6.2E). Single source of truth so the
// shell, navigator and stages don't each redeclare the same prop shapes.

// A segment in the lesson progress bar.
export interface LessonStep {
  key: string;
  label: string;
  status?: "done" | "current" | "upcoming" | "skipped"; // optional; derived from currentStep otherwise
}

// A footer / primary (or secondary) action.
export interface LessonAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// The error prop shared by the shell and every stage.
export interface LessonError {
  message?: string;
  onRetry?: () => void;
}
