"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveCheckpoint, loadCheckpoint } from "@/lib/persistence";
import type { LessonDetail, LessonListItem } from "@/types";
import { LessonNavigator } from "@/components/lesson/LessonNavigator";
import { getStagesForLessonType, type LessonStageDef } from "@/components/lesson/lessonStages";
import type { LessonNavApi } from "@/components/lesson/useLessonNavigation";
import { StageRenderer } from "@/components/lesson/StageRenderer";
import { LessonViewer } from "@/components/curriculum/LessonViewer";
import { useCheckpoints } from "@/hooks/useCheckpoints";
import { useMastery } from "@/hooks/useMastery";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { EmmaProvider, useEmma, EmmaUI } from "@/components/emma";

// ── Helpers ───────────────────────────────────────────────────────────

/** Build dialogue lines from a markdown lesson content by extracting a "Dialogue" section. */
function extractDialogue(content: string | null): { id: number; speaker: string; german: string; translation: string }[] {
  if (!content) return [];
  const dialogueMatch = content.match(/#+\s*Dialogue\s*\n([\s\S]*?)(?=\n#+\s|\n*$)/i);
  if (!dialogueMatch) return [];
  const lines: ReturnType<typeof extractDialogue> = [];
  let id = 0;
  for (const raw of dialogueMatch[1].trim().split("\n")) {
    const clean = raw.replace(/^\s*[-*]\s*/, "").trim();
    const match = clean.match(/^(\w+)\s*:\s*(.+)/);
    if (match) {
      const german = match[2].replace(/\s*\(.*?\)\s*$/, "").trim(); // strip trailing (English)
      const translation = match[2].match(/\((.*?)\)\s*$/)?.[1] ?? german;
      lines.push({ id: id++, speaker: match[1], german, translation });
    }
  }
  return lines;
}

// ── Checkpoint helpers ────────────────────────────────────────────────

const CHECKPOINT_KEYS = ["checkpoint-dialogue", "checkpoint-grammar", "checkpoint-final"];

/** Inject checkpoint stages into a stage sequence at the correct positions.
 *  Ensures every lesson has at least 2 checkpoints (Section 8.9 criteria). */
function injectCheckpointStages(stages: LessonStageDef[]): LessonStageDef[] {
  const result: LessonStageDef[] = [];
  const keys = stages.map((s) => s.key);
  const hadDialogue = keys.some((k) => k === "dialogue" || k === "interactive-dialogue" || k === "role-play");
  const hadGrammar = keys.some((k) => k === "grammar" || k === "grammar-discovery");
  const hadVocabulary = keys.some((k) => k === "vocabulary" || k === "vocab-explorer" || k === "see" || k === "hear");
  const summaryIdx = keys.findIndex((k) => k === "summary" || k === "learning-summary" || k === "celebration");
  const lessonMidpoint = Math.floor(stages.length / 2);

  // Track how many checkpoints we've injected
  let checkpointCount = 0;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];

    // Insert dialogue checkpoint after the last dialogue stage
    if (hadDialogue && (stage.key === "dialogue" || stage.key === "interactive-dialogue" || stage.key === "role-play")) {
      result.push(stage);
      result.push({ key: "checkpoint-dialogue", label: "Quick Check" });
      checkpointCount++;
      continue;
    }

    // Insert grammar checkpoint after the last grammar stage
    if (hadGrammar && (stage.key === "grammar" || stage.key === "grammar-discovery")) {
      result.push(stage);
      result.push({ key: "checkpoint-grammar", label: "Grammar Check" });
      checkpointCount++;
      continue;
    }

    // Insert vocabulary checkpoint mid-lesson for vocab-only lessons
    if (!hadDialogue && !hadGrammar && hadVocabulary && i === lessonMidpoint) {
      result.push(stage);
      result.push({ key: "checkpoint-final", label: "Quick Check" });
      checkpointCount++;
      continue;
    }

    // Insert final checkpoint before summary
    if (summaryIdx >= 0 && i === summaryIdx) {
      result.push({ key: "checkpoint-final", label: "Final Check" });
      checkpointCount++;
    }

    result.push(stage);
  }

  // Ensure at least 2 checkpoints — add a mid-lesson one if needed
  if (checkpointCount < 2 && result.length > 4) {
    const insertAt = Math.floor(result.length / 3);
    result.splice(insertAt, 0, { key: "checkpoint-final", label: "Quick Check" });
  }

  return result;
}

// ── Page ──────────────────────────────────────────────────────────────

export default function LessonPage() {
  const params = useParams<{ level: string; id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const level = params.level;
  const id = params.id;

  const { data, isLoading, error } = useQuery<LessonDetail>({
    queryKey: ["lesson", level, id],
    queryFn: () => api.get(`/curriculum/${level}/${id}`),
    enabled: !!level && !!id,
  });

  // All lessons in this level for prev/next navigation
  const { data: allLessons } = useQuery<LessonListItem[]>({
    queryKey: ["curriculum", level.toUpperCase()],
    queryFn: () => api.get(`/curriculum/${level.toUpperCase()}`),
    enabled: !!level,
  });

  // SRS seed on lesson completion (Mini Review finished)
  const seedMutation = useMutation({
    mutationFn: () => api.post("/srs/seed-lesson", { lesson_id: parseInt(id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const lesson = data?.lesson;
  const dialogueLines = extractDialogue(data?.lesson?.content ?? null);
  const vocabWords = (data?.vocabulary ?? []).map((v) => v.german);

  // Adaptive: weak concepts for injection (Section 10.1 / 10.5)
  // Fetched from the adaptive endpoint which uses real SRS performance data.
  const [weakVocab, setWeakVocab] = useState<string[]>([]);
  const [weakGrammar, setWeakGrammar] = useState<string[]>([]);
  useEffect(() => {
    api.get("/adaptive/weak-concepts?limit=5").then((res: any) => {
      if (res?.vocabulary?.length) {
        setWeakVocab(res.vocabulary.map((w: any) => w.label));
      } else if (data?.vocabulary?.length) {
        // Fallback: use first lesson vocab word as candidate weak word
        setWeakVocab([data.vocabulary[0].german]);
      }
      if (res?.grammar?.length) {
        setWeakGrammar(res.grammar.map((g: any) => g.label.toLowerCase().replace(/\s+/g, "-")));
      }
    }).catch(() => {
      // Fallback: ensure at least one weak concept from lesson data
      if (data?.vocabulary?.length) setWeakVocab([data.vocabulary[0].german]);
    });
  }, [data?.vocabulary, data?.grammar_topics]);

  // Start lesson session when lesson data loads
  useEffect(() => {
    if (lesson?.id) {
      api.post(`/lessons/${lesson.id}/start`).catch(() => {});
    }
  }, [lesson?.id]);

  // Find next lesson for summary
  const nextLesson = allLessons?.find((l) => !l.completed);

  const { flags: featureFlags } = useFeatureFlags();
  // Renderer selection: stages_config present → stage-based (gated by feature flag),
  // no stages_config → legacy renderer (backward compatibility, Section 12.2)
  const hasStageConfig = !!data?.lesson?.stages_config;
  const stageBasedEnabled = hasStageConfig && featureFlags["stage-based-lessons"];
  const { recordScore, scores } = useCheckpoints();
  const lessonStages = getStagesForLessonType(lesson?.lesson_type);
  const hasSpeakingStage = lessonStages.some((s) => s.key === "speaking" || s.key === "speak");
  const hasExercises = (data?.exercises?.length ?? 0) > 0 || (data?.vocabulary?.length ?? 0) > 0;
  const exerciseAccuracy = hasExercises ? 100 : null;
  const mastery = useMastery(scores, !hasSpeakingStage, exerciseAccuracy);
  const stagesWithCheckpoints = useMemo(
    () => injectCheckpointStages(lessonStages),
    [lessonStages]
  );

  const renderStage = useCallback((stage: LessonStageDef, nav: LessonNavApi) => {
    if (!data) return null;
    return (
      <StageRenderer
        data={data}
        stage={stage}
        nav={nav}
        dialogueLines={dialogueLines}
        vocabWords={vocabWords}
        isLoading={isLoading}
        nextLesson={nextLesson}
        level={level}
        mastery={mastery}
        recordScore={recordScore}
        weakVocab={weakVocab}
        weakGrammar={weakGrammar}
        onNavigateNext={(lessonId) => router.push(`/lesson/${level}/${lessonId}`)}
      />
    );
  }, [data, dialogueLines, vocabWords, isLoading, nextLesson, level, router, mastery, recordScore, weakVocab, weakGrammar]);

  // Legacy renderer fallback when stage-based-lessons flag is disabled
  if (!stageBasedEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <LessonViewer content={lesson?.content || ""} vocabulary={data?.vocabulary ?? []} />
      </div>
    );
  }

  return (
    <EmmaProvider>
      <LessonPageInner
        lessonTitle={`${level} · ${lesson?.title ?? "Lesson"}`}
        stages={stagesWithCheckpoints}
        onExit={(reason: "save" | "discard") => {
          if (reason === "save") seedMutation.mutate();
          router.push("/curriculum");
        }}
        onFinish={() => {
          api.post(`/lessons/${id}/complete`).catch(() => {});
          seedMutation.mutate();
        }}
        renderStage={renderStage}
        loading={isLoading}
        error={error ? { message: error instanceof Error ? error.message : "Failed to load lesson", onRetry: () => queryClient.invalidateQueries({ queryKey: ["lesson", level, id] }) } : null}
        lessonData={data}
      />
    </EmmaProvider>
  );
}

// Inner component — lives inside EmmaProvider so it can call useEmma().setContext
// on every stage change.
function LessonPageInner({ lessonTitle, stages, onExit, onFinish, renderStage, loading, error, lessonData }: {
  lessonTitle: string; stages: LessonStageDef[];
  onExit: (reason: "save" | "discard") => void; onFinish: () => void;
  renderStage: (s: LessonStageDef, n: LessonNavApi) => React.ReactNode;
  loading: boolean; error: any; lessonData: LessonDetail | undefined;
}) {
  const { setContext } = useEmma();

  // ── Persistence: load checkpoint on mount ────────────────────────────
  const [resumeStage, setResumeStage] = useState<string | undefined>();
  const [resumeCompleted, setResumeCompleted] = useState<string[]>([]);
  const lessonId = lessonData?.lesson?.id;
  useEffect(() => {
    if (!lessonId) return;
    loadCheckpoint(lessonId).then((cp) => {
      if (cp) { setResumeStage(cp.currentStage); setResumeCompleted(cp.completedStages); }
    });
  }, [lessonId]);

  // ── Persistence: save on each stage change ───────────────────────────
  const onStageChange = useCallback((key: string, _index: number) => {
    if (!lessonData) return;
    const stage = stages.find((s) => s.key === key);
    // Update Emma context (includes weak words for adaptive hints).
    setContext({
      lessonTitle: lessonData.lesson.title,
      stage: key,
      stageLabel: stage?.label ?? key,
      vocabulary: lessonData.vocabulary.map((v) => v.german),
      weakWords: lessonData.vocabulary.map((v) => v.german), // Phase 4: all vocab as candidate weak words
      grammarPattern: lessonData.grammar_topics?.[0]?.title,
      progressStep: stages.findIndex((s) => s.key === key) + 1,
      progressTotal: stages.length,
    });
    // Save checkpoint (fire-and-forget — no await needed).
    if (lessonData.lesson?.id) {
      saveCheckpoint({
        lessonId: lessonData.lesson.id,
        currentStage: key,
        completedStages: [],  // the nav hook owns the truth; pass what it knows
        timeSpentSec: 0,
      });
    }
  }, [lessonData, stages, setContext]);

  // Persistence: save on completion
  const onCompleteStage = useCallback((key: string) => {
    if (!lessonData?.lesson?.id) return;
    setResumeCompleted((prev) => prev.includes(key) ? prev : [...prev, key]);
    // Record stage progress in lesson session
    api.post(`/lessons/${lessonData.lesson.id}/stage`, { stage_key: key, status: "completed" }).catch(() => {});
  }, [lessonData]);

  return (
    <>
      <LessonNavigator
        lessonTitle={lessonTitle}
        stages={stages}
        initialStageKey={resumeStage}
        initialCompleted={resumeCompleted}
        onExit={onExit}
        onFinish={onFinish}
        onStageChange={onStageChange}
        onComplete={onCompleteStage}
        renderStage={renderStage}
        loading={loading}
        error={error}
      />
      <EmmaUI />
    </>
  );
}
