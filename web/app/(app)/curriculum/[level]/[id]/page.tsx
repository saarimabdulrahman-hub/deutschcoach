"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { LessonDetail, LessonListItem } from "@/types";
import { LessonViewer } from "@/components/curriculum/LessonViewer";
import { VocabCard } from "@/components/curriculum/VocabCard";
import { useSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// ── Sub-components ────────────────────────────────────────────────────

function VocabSectionHeader({ vocabulary }: { vocabulary: Array<{ german: string }> }) {
  const { speak, speaking } = useSpeech();
  const readAll = () => speak(vocabulary.map(v => v.german).join(". "), "de-DE");

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "var(--color-active-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Vocabulary
        <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>{vocabulary.length} words</span>
      </h2>
      <span onClick={() => !speaking && readAll()} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") readAll(); }}
        title="Read all words aloud"
        style={{ color: "var(--color-text-muted)", cursor: "pointer", opacity: speaking ? 0.3 : 0.6, fontSize: "16px", userSelect: "none" }}>
        <SpeakIcon size={22} />
      </span>
    </div>
  );
}

function ExerciseCard({ index, question, answer, type }: { index: number; question: string; answer: string; type: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {index}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            {type || "Exercise"}
          </span>
        </div>
        {question && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>{question}</p>
        )}
        {answer && (
          <>
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
                Reveal Answer
              </button>
            ) : (
              <div className="p-3 rounded-lg animate-slide-in"
                style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-active-bg)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Answer</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{answer}</p>
              </div>
            )}
          </>
        )}
      </div>
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
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function LessonPage() {
  const params = useParams<{ level: string; id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const level = params.level;
  const id = params.id;

  const [showConfetti, setShowConfetti] = useState(false);

  const { data, isLoading, error } = useQuery<LessonDetail>({
    queryKey: ["lesson", level, id],
    queryFn: () => api.get(`/curriculum/${level}/${id}`),
    enabled: !!level && !!id,
  });

  // Fetch all lessons in current level for next/prev navigation
  const { data: allLessons } = useQuery<LessonListItem[]>({
    queryKey: ["curriculum", level.toUpperCase()],
    queryFn: () => api.get(`/curriculum/${level.toUpperCase()}`),
    enabled: !!level,
  });

  const seedMutation = useMutation({
    mutationFn: () => api.post("/srs/seed-lesson", { lesson_id: parseInt(id) }),
    onSuccess: () => {
      setShowConfetti(true);
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setTimeout(() => router.push("/review"), 1800);
    },
  });

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  if (isLoading) return <LessonSkeleton />;
  if (error || !data)
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>Failed to load lesson</p>
        <button onClick={() => router.push("/curriculum")} className="text-sm underline"
          style={{ color: "var(--color-active-text)" }}>
          Back to Learning Path
        </button>
      </div>
    );

  const { lesson, vocabulary, exercises } = data;

  // Find previous and next lessons
  const currentIdx = allLessons?.findIndex((l) => l.id === parseInt(id)) ?? -1;
  const prevLesson = currentIdx > 0 ? allLessons![currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && allLessons && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Sticky progress bar ────────────────── */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2" style={{ background: "var(--color-page-bg)" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push("/curriculum")}
            className="flex items-center gap-1 text-sm hover:text-slate-200 transition-colors flex-shrink-0"
            style={{ color: "var(--color-text-muted)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Learning Path
          </button>
          <div className="flex-1" />
          {prevLesson && (
            <button onClick={() => router.push(`/curriculum/${level}/${prevLesson.id}`)}
              className="text-xs font-medium hover:text-slate-200 transition-colors flex-shrink-0"
              style={{ color: "var(--color-text-muted)" }}>
              ← Prev
            </button>
          )}
          {nextLesson && (
            <button onClick={() => router.push(`/curriculum/${level}/${nextLesson.id}`)}
              className="text-xs font-medium hover:text-slate-200 transition-colors flex-shrink-0"
              style={{ color: "var(--color-text-muted)" }}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* ── Header ──────────────────────────────── */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {lesson.level}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "var(--color-card-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
            Unit {lesson.unit}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "var(--color-card-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
            ~10 min
          </span>
          {lesson.topics?.slice(0, 3).map((topic: string) => (
            <span key={topic} className="text-[10px] px-2 py-1 rounded-lg"
              style={{ background: "var(--color-page-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
              {topic}
            </span>
          ))}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{lesson.description}</p>
        )}
      </div>

      {/* ── Learning objectives ─────────────────── */}
      {lesson.topics && lesson.topics.length > 0 && (
        <div className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
          <span className="text-xl flex-shrink-0">🎯</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#a78bfa" }}>
              You'll learn to
            </p>
            <div className="flex flex-wrap gap-2">
              {lesson.topics.map((topic: string) => (
                <span key={topic} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(124,58,237,0.1)", color: "var(--color-text-secondary)", border: "1px solid rgba(124,58,237,0.15)" }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content + Vocab ────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson content */}
          <div className="rounded-2xl p-5 sm:p-6"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <LessonViewer content={lesson.content || ""} />
          </div>

          {/* Exercises */}
          {exercises && exercises.length > 0 && (
            <div className="rounded-2xl p-5 sm:p-6"
              style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "var(--color-active-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Exercises
                <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>{exercises.length} questions</span>
              </h2>
              <div className="space-y-3">
                {exercises.map((ex, i) => {
                  const question = typeof ex.question === "string" ? ex.question : "";
                  const answer = typeof ex.answer === "string" ? ex.answer : "";
                  const exType = typeof ex.type === "string" ? ex.type : "";
                  return (
                    <ExerciseCard key={i} index={i + 1} question={question} answer={answer} type={exType} />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-5 sm:p-6 sticky top-24"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <VocabSectionHeader vocabulary={vocabulary} />
            {vocabulary.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-2xl">📝</span>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>No vocabulary for this lesson</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vocabulary.map((v) => (
                  <VocabCard key={v.id} german={v.german} english={v.english}
                    example={v.example_sentence || undefined} pos={v.part_of_speech || undefined} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Complete / Next ─────────────────────── */}
      <div className="flex flex-col items-center pt-2 pb-8">
        {showConfetti ? (
          <div className="text-center space-y-4 animate-slide-in">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Lesson Complete!</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              You've learned {vocabulary.length} new words — they're now in your flashcard deck.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => router.push("/review")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "var(--color-accent-glow)" }}>
                🃏 Review Flashcards
              </button>
              {nextLesson && (
                <button onClick={() => router.push(`/curriculum/${level}/${nextLesson.id}`)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  Next: {nextLesson.title} →
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
              className="px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
              style={{ color: "var(--color-text)", background: "var(--color-accent-gradient)", boxShadow: "var(--color-accent-glow)" }}>
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
                  Complete & Add to Flashcards
                </span>
              )}
            </button>
            <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
              Adds {vocabulary.length} words to your spaced repetition deck
            </p>

            {/* Next lesson preview */}
            {nextLesson && (
              <button onClick={() => router.push(`/curriculum/${level}/${nextLesson.id}`)}
                className="mt-4 text-xs font-medium hover:underline" style={{ color: "var(--color-text-muted)" }}>
                Skip to next: {nextLesson.title} →
              </button>
            )}
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
