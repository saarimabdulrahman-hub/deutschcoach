"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveCheckpoint, loadCheckpoint } from "@/lib/persistence";
import type { LessonDetail, LessonListItem } from "@/types";
import { LessonNavigator } from "@/components/lesson/LessonNavigator";
import { DEFAULT_LESSON_STAGES, type LessonStageDef } from "@/components/lesson/lessonStages";
import type { LessonNavApi } from "@/components/lesson/useLessonNavigation";
import { LessonWelcome } from "@/components/lesson/LessonWelcome";
import { WarmupContent } from "@/components/lesson/WarmupContent";
import { DialogueContent } from "@/components/lesson/DialogueContent";
import { VocabularyContent } from "@/components/lesson/VocabularyContent";
import { GrammarContent } from "@/components/lesson/GrammarContent";
import { SpeakingPlaceholder } from "@/components/lesson/SpeakingPlaceholder";
import { CompletionContent } from "@/components/lesson/CompletionContent";
import { EmmaProvider, useEmma, EmmaUI } from "@/components/emma";
import { MatchingExercise } from "@/components/interaction/MatchingExercise";
import { FillInExercise } from "@/components/interaction/FillInExercise";
import { RecallExercise } from "@/components/interaction/RecallExercise";

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

  // Find next lesson for summary
  const nextLesson = allLessons?.find((l) => !l.completed);

  const renderStage = useCallback((stage: LessonStageDef, nav: LessonNavApi) => {
    if (!data) return null;

    switch (stage.key) {
      case "warm-welcome":
        return <LessonWelcome lesson={data.lesson} vocabCount={data.vocabulary.length} exerciseCount={data.exercises.length} onStart={nav.goNext} />;

      case "dialogue":
        return <DialogueContent
          sceneTitle={data.lesson.title}
          sceneDescription={data.lesson.description ?? undefined}
          lines={dialogueLines.length ? dialogueLines.map((dl) => ({
            id: dl.id, speaker: dl.speaker, german: dl.german, translation: dl.translation,
          })) : [{ id: 0, speaker: "Speaker", german: data.lesson.content?.slice(0, 100) ?? "[Content]", translation: "Read the lesson content." }]}
          loading={isLoading}
        />;

      case "vocabulary":
        return <VocabularyContent vocabulary={data.vocabulary} />;

      case "grammar":
        return <GrammarContent grammarTopics={data.grammar_topics} />;

      case "guided-practice":
        return <MatchingExercise pairs={data.vocabulary.map((v) => ({
          id: v.id, left: v.german, right: v.english,
        }))} />;

      case "interactive-exercise":
        return <FillInExercise items={data.exercises.map((e, i) => ({
          id: i, front: (e as any).question ?? "", back: (e as any).answer ?? "",
          hint: (e as any).hint ?? (e as any).question ? "Fill in the blank." : undefined,
        }))} />;

      case "speaking":
        return <SpeakingPlaceholder vocabulary={vocabWords} />;

      case "mini-review":
        return <RecallExercise items={data.vocabulary.map((v) => ({
          id: v.id, front: v.german, back: v.english,
        }))} />;

      case "celebration":
        return <CompletionContent mode="celebration"
          title={data.lesson.title}
          wordCount={data.vocabulary.length}
          patternName={data.grammar_topics?.[0]?.title}
          onFinish={nav.goNext}
        />;

      case "learning-summary":
        return <CompletionContent mode="summary"
          title={data.lesson.title}
          wordCount={data.vocabulary.length}
          patternName={data.grammar_topics?.[0]?.title}
          nextTitle={nextLesson?.title}
          onNextLesson={nextLesson ? () => router.push(`/lesson/${level}/${nextLesson.id}`) : undefined}
        />;

      default:
        return <p className="text-sm py-8 text-center" style={{ color: "var(--color-text-muted)" }}>Coming soon</p>;
    }
  }, [data, isLoading, dialogueLines, vocabWords, nextLesson, level, router]);

  return (
    <EmmaProvider>
      <LessonPageInner
        lessonTitle={`${level} · ${lesson?.title ?? "Lesson"}`}
        stages={DEFAULT_LESSON_STAGES}
        onExit={(reason: "save" | "discard") => {
          if (reason === "save") seedMutation.mutate();
          router.push("/curriculum");
        }}
        onFinish={() => seedMutation.mutate()}
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
  lessonTitle: string; stages: typeof DEFAULT_LESSON_STAGES;
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
    // Update Emma context.
    setContext({
      lessonTitle: lessonData.lesson.title,
      stage: key,
      stageLabel: stage?.label ?? key,
      vocabulary: lessonData.vocabulary.map((v) => v.german),
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
