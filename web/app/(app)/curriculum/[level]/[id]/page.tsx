"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { LessonDetail, LessonListItem } from "@/types";
import { LessonViewer } from "@/components/curriculum/LessonViewer";
import { VocabPanel } from "@/components/curriculum/VocabPanel";
import { ReadAloudBar } from "@/components/curriculum/ReadAloudBar";
import { useSentenceSpeech, splitSentences } from "@/hooks/useSpeech";

// ── Sub-components ────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
      <span aria-hidden style={{ fontSize: "14px" }}>{icon}</span>
      {label}
    </div>
  );
}

const TOPIC_ICONS: Record<string, string> = {
  greetings: "👋",
  introductions: "🤝",
  "personal-pronouns": "👤",
  numbers: "🔢",
  colors: "🎨",
  adjectives: "✨",
  verbs: "🏃",
  nouns: "📦",
  grammar: "📐",
  culture: "🌍",
  travel: "✈️",
  food: "🍽️",
  family: "👨‍👩‍👧‍👦",
  shopping: "🛍️",
  directions: "🧭",
  time: "⏰",
  weather: "🌤️",
  hobbies: "🎯",
  work: "💼",
  school: "🎓",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  greetings: "Greet someone in German",
  introductions: "Introduce yourself and others",
  "personal-pronouns": "Use personal pronouns correctly",
  numbers: "Count and use numbers",
  colors: "Describe colors",
  adjectives: "Use adjectives in sentences",
  verbs: "Conjugate basic verbs",
  nouns: "Identify noun genders",
  grammar: "Understand grammar patterns",
  culture: "Learn cultural context",
  travel: "Handle travel situations",
  food: "Order food and drinks",
  family: "Talk about your family",
  shopping: "Shop and ask for prices",
  directions: "Ask for and give directions",
  time: "Tell time and discuss schedules",
  weather: "Describe the weather",
  hobbies: "Talk about your hobbies",
  work: "Discuss your profession",
  school: "Talk about education",
};

function getLessonEmoji(title: string, topics: string[] | null): string {
  if (!topics || topics.length === 0) return "📖";
  const t = topics[0].toLowerCase();
  return TOPIC_ICONS[t] ?? "📖";
}

function getLessonTranslation(title: string, topics: string[] | null): string {
  const translations: Record<string, string> = {
    "Erste Begegnungen": "First Encounters",
    "Wer bist du?": "Who Are You?",
    "Im Unterricht": "In the Classroom",
    "Meine Familie": "My Family",
    "Essen und Trinken": "Food and Drink",
    "Einkaufen gehen": "Going Shopping",
    "Mein Zuhause": "My Home",
    "Freizeit und Hobbys": "Free Time and Hobbies",
    "Unterwegs": "On the Go",
    "Körper und Gesundheit": "Body and Health",
    "Ich lerne Deutsch": "I'm Learning German",
    "Mein Tag": "My Day",
    "Wetter und Jahreszeiten": "Weather and Seasons",
    "Reisen und Urlaub": "Travel and Vacation",
    "Arbeit und Beruf": "Work and Profession",
    "Feste und Feiern": "Celebrations and Parties",
    "Deutschland entdecken": "Discovering Germany",
    "Medien und Technik": "Media and Technology",
    "Umwelt und Natur": "Environment and Nature",
    "Zukunft und Pläne": "Future and Plans",
  };
  return translations[title] ?? `Learn ${topics?.join(", ").replace(/-/g, " ") ?? "German"}`;
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

  // ⚠️ All hooks must be called before any conditional returns
  const lesson = data?.lesson;
  const vocabulary = data?.vocabulary ?? [];
  const exercises = data?.exercises ?? [];
  const currentIdx = allLessons?.findIndex((l) => l.id === parseInt(id)) ?? -1;
  const prevLesson = currentIdx > 0 ? allLessons![currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && allLessons && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const lessonText = useMemo(() => {
    const parts: string[] = [];
    if (lesson?.description) parts.push(lesson.description);
    if (lesson?.content) parts.push(lesson.content);
    return parts.join(". ");
  }, [lesson?.description, lesson?.content]);

  const lessonSentences = useMemo(() => splitSentences(lessonText), [lessonText]);
  const speech = useSentenceSpeech();

  if (isLoading) return <LessonSkeleton />;
  if (error || !data || !lesson)
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

  const handleReadAloud = () => {
    speech.speakSentences(lessonSentences, "de-DE");
  };

  return (
    <div className="space-y-6">
      {/* ── Sticky progress bar ────────────────── */}
      <div className="sticky top-14 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2" style={{ background: "var(--color-page-bg)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push("/curriculum")}
            className="flex items-center gap-1 text-sm hover:text-slate-200 transition-colors flex-shrink-0"
            style={{ color: "var(--color-text-muted)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Roadmap
          </button>
          <span className="text-xs font-medium hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>
            Unit {lesson.unit} · Lesson {currentIdx + 1} of {allLessons?.length ?? "—"}
          </span>
          <div className="flex-1" />
          {prevLesson && (
            <button onClick={() => router.push(`/curriculum/${level}/${prevLesson.id}`)}
              className="text-xs font-medium hover:text-slate-200 transition-colors flex-shrink-0 flex items-center gap-1"
              style={{ color: "var(--color-text-muted)" }}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>
          )}
          {nextLesson && (
            <button onClick={() => router.push(`/curriculum/${level}/${nextLesson.id}`)}
              className="text-xs font-medium hover:text-slate-200 transition-colors flex-shrink-0 flex items-center gap-1"
              style={{ color: "var(--color-text-muted)" }}>
              Next
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Hero Section ─────────────────────────── */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{
        background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(236,72,153,0.04) 50%, rgba(15,12,30,1) 100%)",
        border: "1px solid rgba(168,85,247,0.12)",
      }}>
        <div className="flex flex-col lg:flex-row">
          {/* ── Left: Text content ── */}
          <div className="flex-1 p-6 sm:p-8">
            {/* Level badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                {lesson.level}
              </span>
              {lesson.topics?.slice(0, 1).map((topic: string) => {
                const icon = TOPIC_ICONS[topic.toLowerCase()] ?? "📖";
                return (
                  <span key={topic} className="text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    style={{ background: "var(--color-card-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                    <span aria-hidden>{icon}</span>
                    {topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ")}
                  </span>
                );
              })}
            </div>

            {/* Title + translation */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
              {lesson.title}
            </h1>
            <p className="text-sm sm:text-base mt-1.5 font-medium" style={{ color: "var(--color-text-muted)" }}>
              {/* Generate a contextual translation from the topics */}
              {getLessonTranslation(lesson.title, lesson.topics)}
            </p>

            {/* Description */}
            {lesson.description && (
              <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-[480px]" style={{ color: "var(--color-text-secondary)" }}>
                {lesson.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mt-5">
              <StatChip icon="📚" label={`${vocabulary.length} ${vocabulary.length === 1 ? "Word" : "Words"}`} />
              <StatChip icon="📝" label={`${exercises.length} ${exercises.length === 1 ? "Exercise" : "Exercises"}`} />
              <StatChip icon="💬" label="1 Dialogue" />
              {data?.grammar_topics && data.grammar_topics.length > 0 && (
                <StatChip icon="📐" label={`${data.grammar_topics.length} Grammar`} />
              )}
              <StatChip icon="⏱" label={`~${Math.max(5, vocabulary.length * 2 + exercises.length * 2)} min`} />
            </div>

            {/* CTA */}
            <button onClick={() => {
              // Scroll to lesson content — the page starts with the hero
              document.getElementById("lesson-content")?.scrollIntoView({ behavior: "smooth" });
            }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 border-none cursor-pointer"
              style={{
                background: "var(--color-accent-gradient)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Begin Lesson
            </button>
          </div>

          {/* ── Right: Illustration ── */}
          <div className="hidden lg:flex w-[260px] flex-shrink-0 items-center justify-center p-6">
            <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{
              background: "radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%)",
            }}>
              <div className="text-center">
                <div className="text-7xl mb-3" aria-hidden>{getLessonEmoji(lesson.title, lesson.topics)}</div>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                  {lesson.level} · Unit {lesson.unit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Objectives ──────────────────── */}
      {lesson.topics && lesson.topics.length > 0 && (
        <div className="rounded-2xl p-5 sm:p-6 mb-6" style={{
          background: "var(--color-card-bg)",
          border: "1px solid var(--color-border)",
        }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Today's Objectives
          </h2>
          <div className="space-y-2.5">
            {lesson.topics.map((topic: string) => {
              const obj = OBJECTIVE_LABELS[topic.toLowerCase()] ?? `Learn ${topic}`;
              return (
                <div key={topic} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{obj}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Read Aloud ─────────────────────────── */}
      <ReadAloudBar
        isPlaying={speech.isPlaying}
        isPaused={speech.isPaused}
        activeIndex={speech.activeIndex}
        totalSentences={lessonSentences.length}
        onPlay={handleReadAloud}
        onPause={speech.pause}
        onResume={speech.resume}
        onStop={speech.stop}
        onReplay={speech.replaySentence}
        disabled={lessonSentences.length === 0}
      />

      {/* ── Main content + Vocab ────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {/* Lesson content */}
          <div id="lesson-content" className="rounded-2xl p-5 sm:p-6"
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
        <div>
          <VocabPanel vocabulary={vocabulary} />
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
