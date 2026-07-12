// Interaction engine types (Sprint 8.2). Configuration-driven — new interaction
// types register here rather than branching in components.

/** The phase a single interaction item is in. */
export type InteractionPhase =
  | "idle"       // not yet attempted
  | "answering"  // learner is currently interacting
  | "hint"       // a hint has been requested
  | "revealed"   // answer shown after attempt or reveal
  | "completed"  // item finished (correct or revealed)
  | "skipped";   // learner chose to skip

/** High-level interaction modes. The controller's behaviour adapts per mode. */
export type InteractionMode =
  | "recognition"       // multiple-choice — pick the correct option
  | "flashcard"         // flip to reveal (vocabulary, review)
  | "expand"            // expand/collapse a content block (grammar)
  | "reveal-answer";    // self-check exercises

/** One item the engine operates on. */
export interface InteractionItem {
  id: string | number;
  front: string;           // the prompt / German / question
  back?: string;           // the answer / English / explanation
  meta?: string;           // optional sublabel (pos, type badge, etc.)
  hint?: string;           // optional hint text
  options?: string[];      // for recognition / MCQ
  correct?: string;        // for recognition
  content?: React.ReactNode; // for expand-type (grammar)
}

export interface InteractionControllerConfig {
  mode: InteractionMode;
  items: InteractionItem[];
  initialIndex?: number;
  onComplete?: (index: number) => void;
  onReveal?: (index: number) => void;
  onSkip?: (index: number) => void;
}
