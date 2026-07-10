"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { QuizSession, QuizQuestion } from "@/types";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { PageHeader } from "@/components/ui/PageHeader";

type QuizState = "setup" | "active" | "results";

interface QuizResultOut {
  score_pct: number;
  questions_total: number;
  questions_correct: number;
  results: {
    question_id: string;
    correct: boolean;
    your_answer: string;
    correct_answer: string;
    feedback?: string | null;
  }[];
}

interface StoredAnswer {
  question_id: string;
  answer: string;
}

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [results, setResults] = useState<QuizResultOut | null>(null);

  const handleStart = useCallback((session: QuizSession) => {
    setSessionId(session.session_id);
    setQuestions(session.questions);
    setCurrentIndex(0);
    setAnswers([]);
    setResults(null);
    setState("active");
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      const question = questions[currentIndex];
      if (!question) return;

      const newAnswer: StoredAnswer = {
        question_id: String(question.id),
        answer,
      };

      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      if (currentIndex + 1 >= questions.length) {
        submitQuiz(newAnswers);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentIndex, questions, answers]
  );

  async function submitQuiz(finalAnswers: StoredAnswer[]) {
    if (!sessionId) return;

    setSubmitting(true);
    try {
      const result = await api.post<QuizResultOut>(
        `/quiz/${sessionId}/submit`,
        { answers: finalAnswers }
      );
      setResults(result);
      setState("results");
    } catch {
      setResults({
        score_pct: 0,
        questions_total: questions.length,
        questions_correct: 0,
        results: finalAnswers.map((a) => ({
          question_id: a.question_id,
          correct: false,
          your_answer: a.answer,
          correct_answer: "Unknown — submission failed",
          feedback: "Quiz submission encountered an error. Please try again.",
        })),
      });
      setState("results");
    } finally {
      setSubmitting(false);
    }
  }

  const handleRetry = useCallback(() => {
    setState("setup");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setResults(null);
  }, []);

  if (state === "setup") {
    return (
      <div className="space-y-6">
        <PageHeader title="Quiz" />
        <QuizSetup onStart={handleStart} />
      </div>
    );
  }

  if (state === "active" && questions.length > 0) {
    const question = questions[currentIndex];

    if (submitting) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Submitting your answers...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PageHeader title="Quiz" />
        <QuestionCard
          question={question}
          onAnswer={handleAnswer}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />
      </div>
    );
  }

  if (state === "results" && results) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quiz" />
        <QuizResults results={results} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
      Something went wrong.{" "}
      <button onClick={handleRetry} className="underline" style={{ color: "var(--color-active-text)" }}>
        Start over
      </button>
    </div>
  );
}
