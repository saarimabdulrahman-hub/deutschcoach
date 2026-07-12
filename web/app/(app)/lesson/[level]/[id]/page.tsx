"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { LessonDetail, LessonListItem } from "@/types";
import { LessonNavigator } from "@/components/lesson/LessonNavigator";
import { DEFAULT_LESSON_STAGES, type LessonStageDef } from "@/components/lesson/lessonStages";
import type { LessonNavApi } from "@/components/lesson/useLessonNavigation";
import { LessonWelcome } from "@/components/lesson/LessonWelcome";
import { WarmupContent } from "@/components/lesson/WarmupContent";
import { DialogueContent } from "@/components/lesson/DialogueContent";
import { VocabularyContent } from "@/components/lesson/VocabularyContent";
import { GrammarContent } from "@/components/lesson/GrammarContent";
import { PracticeContent } from "@/components/lesson/PracticeContent";
import { SpeakingPlaceholder } from "@/components/lesson/SpeakingPlaceholder";
import { MiniReviewContent } from "@/components/lesson/MiniReviewContent";
import { CompletionContent } from "@/components/lesson/CompletionContent";

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

/** Build a content-characterisation string for continuing lessons. */
function vocabTitle(words: string[]): string { return words.slice(0, 3).join(", "); }

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
        return <LessonWelcome lesson={data.lesson} onStart={nav.goNext} />;

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
      case "interactive-exercise":
        return <PracticeContent exercises={data.exercises.map((e, i) => ({
          type: (e as any).type ?? "exercise",
          question: (e as any).question ?? "",
          answer: (e as any).answer ?? "",
        }))} />;

      case "speaking":
        return <SpeakingPlaceholder vocabulary={vocabWords} />;

      case "mini-review":
        return <MiniReviewContent vocabulary={data.vocabulary} />;

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
    <LessonNavigator
      lessonTitle={`${level} · ${lesson?.title ?? "Lesson"}`}
      stages={DEFAULT_LESSON_STAGES}
      onExit={(reason) => {
        if (reason === "save") seedMutation.mutate();
        router.push("/curriculum");
      }}
      onFinish={() => seedMutation.mutate()}
      renderStage={renderStage}
      loading={isLoading}
      error={error ? { message: error instanceof Error ? error.message : "Failed to load lesson", onRetry: () => queryClient.invalidateQueries({ queryKey: ["lesson", level, id] }) } : null}
    />
  );
}
