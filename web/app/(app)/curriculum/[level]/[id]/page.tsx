"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { LessonDetail } from "@/types";
import { LessonViewer } from "@/components/curriculum/LessonViewer";
import { VocabCard } from "@/components/curriculum/VocabCard";
import { useSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

function VocabSectionHeader({ vocabulary }: { vocabulary: Array<{ german: string }> }) {
  const { speak, speaking } = useSpeech();

  const readAll = () => {
    const text = vocabulary.map(v => v.german).join(". ");
    speak(text, "de-DE");
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "var(--color-active-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Vocabulary
        <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
          {vocabulary.length} words
        </span>
      </h2>
      <span
        onClick={() => !speaking && readAll()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") readAll(); }}
        title="Read all words aloud"
        style={{ color: "var(--color-text-muted)", cursor: "pointer", opacity: speaking ? 0.3 : 0.6, fontSize: "16px", userSelect: "none" }}
      ><SpeakIcon size={22} /></span>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 rounded shimmer" />
      <div className="flex gap-2">
        <div className="h-6 w-12 rounded shimmer" />
        <div className="h-6 w-16 rounded shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-4 rounded w-full shimmer" />
        <div className="h-4 rounded w-3/4 shimmer" />
        <div className="h-4 rounded w-5/6 shimmer" />
      </div>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ level: string; id: string }>();
  const router = useRouter();
  const level = params.level;
  const id = params.id;

  const [completedSections, setCompletedSections] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data, isLoading, error } = useQuery<LessonDetail>({
    queryKey: ["lesson", level, id],
    queryFn: () => api.get(`/curriculum/${level}/${id}`),
    enabled: !!level && !!id,
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post("/srs/seed-lesson", { lesson_id: parseInt(id) }),
    onSuccess: () => {
      setShowConfetti(true);
      setTimeout(() => {
        router.push("/review");
      }, 1500);
    },
  });

  // Clean up confetti
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (isLoading) return <LessonSkeleton />;
  if (error || !data)
    return (
      <div className="text-center py-12">
        <div className="mb-4" style={{ color: "var(--color-error-text)" }}>Failed to load lesson</div>
        <button
          onClick={() => router.back()}
          className="hover:text-indigo-300 underline text-sm" style={{ color: "var(--color-active-text)" }}
        >
          Go back
        </button>
      </div>
    );

  const { lesson, vocabulary, exercises } = data;

  const totalSections = (exercises?.length || 0) + (vocabulary?.length > 0 ? 1 : 0) + 1;
  const progressPct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Sticky lesson progress */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2" style={{ background: "var(--color-page-bg)" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/curriculum")}
            className="flex items-center gap-1 text-sm hover:text-slate-200 transition-colors flex-shrink-0" style={{ color: "var(--color-text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "var(--color-accent-gradient)",
              }}
            />
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{progressPct}%</span>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider"
            style={{ background: "var(--color-active-bg)", color: "var(--color-active-text)" }}
          >
            {lesson.level}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md"
            style={{ background: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            Unit {lesson.unit}
          </span>
          {lesson.topics?.slice(0, 2).map((topic: string) => (
            <span
              key={topic}
              className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: "var(--color-page-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >
              {topic}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{lesson.description}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            <LessonViewer content={lesson.content || ""} />
          </div>

          {/* Exercises */}
          {exercises && exercises.length > 0 && (
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
              ref={(el) => {
                if (el && completedSections < 2) setCompletedSections(2);
              }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "var(--color-active-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Exercises
              </h2>
              <div className="space-y-3">
                {exercises.map((ex, i) => {
                  const question = typeof ex.question === "string" ? ex.question : "";
                  const answer = typeof ex.answer === "string" ? ex.answer : "";
                  const exType = typeof ex.type === "string" ? ex.type : "";
                  return (
                    <div
                      key={i}
                      className="p-4 rounded-xl"
                      style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "var(--color-accent)", color: "var(--color-text)" }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                          {exType || "Exercise"}
                        </span>
                      </div>
                      {question ? (
                        <p className="mb-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{question}</p>
                      ) : null}
                      {answer ? (
                        <details className="text-sm group">
                          <summary className="cursor-pointer font-medium hover:text-indigo-300 transition-colors select-none" style={{ color: "var(--color-active-text)" }}>
                            Show answer
                          </summary>
                          <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-active-bg)" }}>
                            <p className="leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{answer}</p>
                          </div>
                        </details>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary sidebar */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            <VocabSectionHeader vocabulary={vocabulary} />
            {vocabulary.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No vocabulary for this lesson.</p>
            ) : (
              <div className="space-y-2">
                {vocabulary.map((v) => (
                  <VocabCard
                    key={v.id}
                    german={v.german}
                    english={v.english}
                    example={v.example_sentence || undefined}
                    pos={v.part_of_speech || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Lesson button */}
      <div className="flex flex-col items-center pt-4 pb-8">
        {showConfetti ? (
          /* Success state after completion */
          <div className="text-center space-y-4 animate-slide-in">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Lesson Complete!</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              You've learned {vocabulary.length} new words. They're now in your flashcard deck.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.push("/review")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "var(--color-accent-glow)" }}
              >
                🃏 Review Flashcards
              </button>
              <button
                onClick={() => router.push("/curriculum")}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
              >
                📚 Next Lesson
              </button>
            </div>
          </div>
        ) : (
          /* Pre-completion state */
          <>
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
              style={{ color: "var(--color-text)", background: "var(--color-accent-gradient)", boxShadow: "var(--color-accent-glow)" }}
            >
              {seedMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                  Saving progress...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Complete & Review Vocabulary
                </span>
              )}
            </button>
            <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
              Completing this lesson adds {vocabulary.length} words to your flashcard deck
            </p>
          </>
        )}
        {seedMutation.isError && (
          <p className="text-center text-sm mt-3" style={{ color: "var(--color-error-text)" }}>
            {(seedMutation.error as Error).message || "Failed to complete lesson"}
          </p>
        )}
      </div>
    </div>
  );
}
