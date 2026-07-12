"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QuizSession, QuizQuestion, DashboardData } from "@/types";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Skeleton } from "@/components/ui/Skeleton";

type QuizState = "setup" | "active" | "results";

interface QuizResultOut {
  score_pct: number; questions_total: number; questions_correct: number;
  results: { question_id: string; correct: boolean; your_answer: string; correct_answer: string; feedback?: string | null }[];
}

interface StoredAnswer { question_id: string; answer: string; }

// ── Quiz Stats Panel ──────────────────────────────────────────────────

function QuizStats({ dash }: { dash?: DashboardData }) {
  const avg = dash?.avg_quiz_score ?? 0;
  const streak = dash?.streak ?? 0;
  const cardsDue = dash?.cards_due_today ?? 0;

  if (!dash) {
    return (
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Your Stats</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xl sm:text-2xl font-extrabold" style={{ color: avg > 0 ? "var(--color-accent-light)" : "var(--color-text-muted)" }}>{avg}%</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>Avg Accuracy</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--color-text)" }}>🔥 {streak}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>Review Streak</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--color-text)" }}>{dash.weakest_words?.length ?? 0}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>Weak Words</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}>
          <p className="text-xl sm:text-2xl font-extrabold" style={{ color: cardsDue > 0 ? "var(--color-warning)" : "var(--color-text-muted)" }}>{cardsDue}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>Cards Due</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResultOut | null>(null);
  const [lastSource, setLastSource] = useState<string>("current-lesson");

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  const handleStart = useCallback((session: QuizSession) => {
    setSessionId(session.session_id); setQuestions(session.questions);
    setCurrentIndex(0); setAnswers([]); setResults(null); setState("active");
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    const question = questions[currentIndex];
    if (!question) return;
    const newAnswer: StoredAnswer = { question_id: String(question.id), answer };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= questions.length) submitQuiz(newAnswers);
    else setCurrentIndex((i) => i + 1);
  }, [currentIndex, questions, answers]);

  async function submitQuiz(finalAnswers: StoredAnswer[]) {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const result = await api.post<QuizResultOut>(`/quiz/${sessionId}/submit`, { answers: finalAnswers });
      setResults(result); setState("results");
    } catch {
      setResults({ score_pct: 0, questions_total: questions.length, questions_correct: 0,
        results: finalAnswers.map((a) => ({ question_id: a.question_id, correct: false, your_answer: a.answer, correct_answer: "Unknown", feedback: "Submission error. Please try again." })) });
      setState("results");
    } finally { setSubmitting(false); }
  }

  const handleRetry = useCallback(() => {
    setState("setup"); setSessionId(null); setQuestions([]); setAnswers([]); setResults(null);
  }, []);

  // ── Setup state ──────────────────────────────────────────────────────
  if (state === "setup") {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--color-hover-bg)" }}>✅</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Quiz</h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Test your knowledge — pick a quiz and see how you're doing</p>
          </div>
        </div>
        <QuizSetup onStart={handleStart} onSource={setLastSource} />
        <QuizStats dash={dash} />
      </div>
    );
  }

  // ── Active state ─────────────────────────────────────────────────────
  if (state === "active" && questions.length > 0) {
    if (submitting) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 animate-spin mx-auto mb-4" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Submitting your answers…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--color-hover-bg)" }}>✅</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Quiz</h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <QuestionCard question={questions[currentIndex]} onAnswer={handleAnswer}
          questionNumber={currentIndex + 1} totalQuestions={questions.length} />
      </div>
    );
  }

  // ── Results state ────────────────────────────────────────────────────
  if (state === "results" && results) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--color-hover-bg)" }}>✅</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Quiz Results</h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{results.score_pct}% · {results.questions_correct}/{results.questions_total} correct</p>
          </div>
        </div>
        <QuizResults results={results} onRetry={handleRetry} />
        <QuizStats dash={dash} />
      </div>
    );
  }

  return (
    <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
      Something went wrong.{" "}
      <button onClick={handleRetry} className="underline" style={{ color: "var(--color-active-text)" }}>Start over</button>
    </div>
  );
}
