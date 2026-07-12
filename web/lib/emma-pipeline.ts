// Emma Context Pipeline (Sprint 17). Pure TypeScript — no React, no components.
// Assembles structured, serializable context from lesson data and compresses
// large lists so Emma's prompt always fits under the token budget. Versioned.

import type { LessonDetail, VocabEntry } from "@/types";
import type { LessonStageDef } from "@/components/lesson/lessonStages";
import type { EmmaMessage } from "@/components/emma/EmmaContext";

// ── Schema version ──────────────────────────────────────────────────────
export const EMMA_PIPELINE_VERSION = "1.0";

// ── Compressed list ─────────────────────────────────────────────────────
export interface CompressedList<T> {
  items: T[];
  total: number;
  omitted: number;
  strategy: "head" | "tail" | "sample";
}

export function compressList<T>(items: T[], max: number): CompressedList<T> {
  const total = items.length;
  if (total <= max) return { items, total, omitted: 0, strategy: "head" };
  return { items: items.slice(0, max), total, omitted: total - max, strategy: "head" };
}

// ── Vocab word (subset of VocabEntry, serialization-safe) ──────────────
export interface VocabWord {
  g: string;   // german
  e: string;   // english
  p?: string;  // part of speech
}

export function toVocabWord(v: VocabEntry): VocabWord {
  return { g: v.german, e: v.english, p: v.part_of_speech ?? undefined };
}

// ── Context types ───────────────────────────────────────────────────────

export interface LessonContext {
  id: number;
  title: string;
  level: string;
  unit: number;
  topics: string[];
  description: string | null;
}

export interface StageContext {
  key: string;
  label: string;
  step: number;        // 1-based, among progress stages
  totalSteps: number;
}

export interface DialogueContext extends StageContext {
  speakers: string[];
  lineCount: number;
  firstLines: string[];
}

export interface VocabularyContext extends StageContext {
  words: CompressedList<VocabWord>;
}

export interface GrammarContext extends StageContext {
  pattern: string;
  rule: string;
  examples: string[];
  relatedTopics: string[];
}

export interface ExerciseContext extends StageContext {
  exerciseType: string;
  question: string;
  expectedAnswer: string;
  expectedMistakes: string[];
  hint: string | null;
  learnerAnswer: string | null;
}

export interface SpeakingContext extends StageContext {
  prompt: string;
  suggestion: string;
  vocabInScope: string[];
}

export interface ReviewContext extends StageContext {
  itemCount: number;
  sampleItems: string[];
}

export interface ConversationContext {
  recentMessages: { role: "learner" | "emma"; text: string }[];
  messageCount: number;
  lastLearnerMessage: string | null;
}

// ── The unified context (what Emma receives) ────────────────────────────

export interface EmmaFullContext {
  schemaVersion: string;
  lesson: LessonContext;
  stage: StageContext;
  stageDetail: // one of the specialized contexts, keyed by stage
    | { type: "dialogue"; data: DialogueContext }
    | { type: "vocabulary"; data: VocabularyContext }
    | { type: "grammar"; data: GrammarContext }
    | { type: "exercise"; data: ExerciseContext }
    | { type: "speaking"; data: SpeakingContext }
    | { type: "review"; data: ReviewContext }
    | { type: "other"; data: StageContext };
  vocabulary: CompressedList<VocabWord>;
  grammar: GrammarContext | null;
  exercise: ExerciseContext | null;
  conversation: ConversationContext;
  progress: { completed: number; total: number; pct: number };
}

// ── Builder functions (pure — no side effects, no network, no React) ───

export function buildLessonContext(lesson: LessonDetail["lesson"]): LessonContext {
  return {
    id: lesson.id,
    title: lesson.title,
    level: lesson.level,
    unit: lesson.unit,
    topics: lesson.topics ?? [],
    description: lesson.description ?? null,
  };
}

export function buildStageContext(stages: LessonStageDef[], currentKey: string, currentIndex: number): StageContext {
  const current = stages.find((s) => s.key === currentKey);
  const progressStages = stages.filter((s) => s.inProgress !== false);
  const step = progressStages.findIndex((s) => s.key === currentKey) + 1;
  return {
    key: currentKey,
    label: current?.label ?? currentKey,
    step: step > 0 ? step : 1,
    totalSteps: progressStages.length || stages.length,
  };
}

export function buildExerciseContext(
  stage: StageContext,
  exercise: { type?: string; question?: string; answer?: string } | null,
  learnerAnswer?: string,
): ExerciseContext | null {
  if (!exercise) return null;
  const exType = exercise.type ?? "unknown";
  const expectedMistakes = exType === "fill-blank"
    ? ["wrong verb form", "word order", "missing article"]
    : exType === "translate"
      ? ["word order (V2)", "umlaut"]
      : ["wrong option"];
  return {
    ...stage,
    exerciseType: exType,
    question: exercise.question ?? "",
    expectedAnswer: exercise.answer ?? "",
    expectedMistakes,
    hint: exType === "fill-blank" ? "Think about the verb ending." : null,
    learnerAnswer: learnerAnswer ?? null,
  };
}

export function buildConversationContext(messages?: EmmaMessage[]): ConversationContext {
  const msgs = messages ?? [];
  const recent = msgs.slice(-8).map((m) => ({ role: m.role as "learner" | "emma", text: m.text.slice(0, 200) }));
  const lastLearner = msgs.filter((m) => m.role === "learner").pop()?.text ?? null;
  return {
    recentMessages: recent,
    messageCount: msgs.length,
    lastLearnerMessage: lastLearner,
  };
}

// ── Pipeline assembly (the single entry point) ─────────────────────────

export interface PipelineParams {
  lesson: LessonDetail["lesson"];
  allStages: LessonStageDef[];
  currentStageKey: string;
  currentIndex: number;
  vocab: VocabEntry[];
  grammarTopics: { title?: string; content?: string; examples?: Record<string, string>[] }[];
  currentExercise?: { type?: string; question?: string; answer?: string } | null;
  learnerAnswer?: string;
  messages?: EmmaMessage[];
  dialogueLines?: { speaker: string; german: string }[];
  speakingPrompt?: string;
  speakingSuggestion?: string;
}

export function assemblePipeline(params: PipelineParams): EmmaFullContext {
  const lesson = buildLessonContext(params.lesson);
  const stage = buildStageContext(params.allStages, params.currentStageKey, params.currentIndex);
  const vocab = compressList(params.vocab.map(toVocabWord), 15);

  // Grammar
  const gTopic = params.grammarTopics?.[0];
  const grammar: GrammarContext | null = gTopic
    ? {
        ...stage,
        pattern: gTopic.title ?? "grammar",
        rule: gTopic.content?.slice(0, 200) ?? "",
        examples: (gTopic.examples ?? []).map((ex) => Object.values(ex).join(" ")).slice(0, 3),
        relatedTopics: params.grammarTopics.slice(1).map((g) => g.title ?? ""),
      }
    : null;

  // Exercise
  const exercise = buildExerciseContext(stage, params.currentExercise ?? null, params.learnerAnswer);

  // Stage detail (specialized per key)
  let stageDetail: EmmaFullContext["stageDetail"];
  switch (params.currentStageKey) {
    case "dialogue":
      stageDetail = {
        type: "dialogue",
        data: { ...stage, speakers: [...new Set((params.dialogueLines ?? []).map((d) => d.speaker))], lineCount: (params.dialogueLines ?? []).length, firstLines: (params.dialogueLines ?? []).slice(0, 3).map((d) => d.german) },
      };
      break;
    case "vocabulary":
      stageDetail = { type: "vocabulary", data: { ...stage, words: vocab } };
      break;
    case "grammar":
      stageDetail = { type: "grammar", data: grammar ?? { ...stage, pattern: "", rule: "", examples: [], relatedTopics: [] } };
      break;
    case "guided-practice":
    case "interactive-exercise":
      stageDetail = { type: "exercise", data: exercise ?? { ...stage, exerciseType: "unknown", question: "", expectedAnswer: "", expectedMistakes: [], hint: null, learnerAnswer: null } };
      break;
    case "speaking":
      stageDetail = { type: "speaking", data: { ...stage, prompt: params.speakingPrompt ?? "Practice speaking", suggestion: params.speakingSuggestion ?? "Give it a try", vocabInScope: params.vocab.slice(0, 10).map((v) => v.german) } };
      break;
    case "mini-review":
      stageDetail = { type: "review", data: { ...stage, itemCount: params.vocab.length, sampleItems: params.vocab.slice(0, 5).map((v) => v.german) } };
      break;
    default:
      stageDetail = { type: "other", data: stage };
  }

  const conversation = buildConversationContext(params.messages);

  return {
    schemaVersion: EMMA_PIPELINE_VERSION,
    lesson,
    stage,
    stageDetail,
    vocabulary: vocab,
    grammar,
    exercise,
    conversation,
    progress: { completed: params.currentIndex, total: params.allStages.length, pct: Math.round((params.currentIndex / Math.max(params.allStages.length, 1)) * 100) },
  };
}

// ── Serialization helper ────────────────────────────────────────────────

export function serializeContext(ctx: EmmaFullContext): string {
  return JSON.stringify(ctx);
}

export function deserializeContext(json: string): EmmaFullContext | null {
  try { return JSON.parse(json) as EmmaFullContext; } catch { return null; }
}

// ── Quick context for the Emma frontend context model ──────────────────

export function toEmmaLessonContext(params: PipelineParams) {
  const pipeline = assemblePipeline(params);
  const firstGrammarTitle = pipeline.grammar?.pattern;
  const vocabWords = params.vocab.map((v) => v.german);
  return {
    lessonTitle: pipeline.lesson.title,
    stage: pipeline.stage.key,
    stageLabel: pipeline.stage.label,
    vocabulary: vocabWords,
    grammarPattern: firstGrammarTitle,
    currentExercise: pipeline.exercise?.question ?? undefined,
    progressStep: pipeline.stage.step,
    progressTotal: pipeline.stage.totalSteps,
  };
}
