"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QuizSession, QuizQuestion, DashboardData, QuizResultOut } from "@/types";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { EmmaAIPanel } from "@/components/quiz/EmmaAIPanel";
import { useAutosave } from "@/hooks/useAutosave";
import { useToast } from "@/components/ui/Toast";
import { useRecovery } from "@/hooks/useRecovery";

type QuizState = "setup" | "active" | "results";

interface StoredAnswer { question_id: string; answer: string; }

// ── Quiz Mode Cards ──────────────────────────────────────────────────

const QUIZ_MODES = [
  {
    icon: <img src="/quiz-icon-lesson.png" alt="" style={{ width: "190px", height: "auto", display: "block", maxWidth: "none" }} />,
    label: "Current Lesson", desc: "Quiz yourself on today's material", difficulty: "Easy", diffBg: "#166534", diffText: "#4ADE80", borderColor: "#3B82F6", time: "~3 min", xp: "+50 XP", color: "#38BDF8",
  },
  {
    icon: <img src="/quiz-icon-weakwords.png" alt="" style={{ width: "190px", height: "auto", display: "block", maxWidth: "none" }} />,
    label: "Weak Words", desc: "Focus on words you forgot", difficulty: "Medium", diffBg: "#78350F", diffText: "#FBBF24", borderColor: "#EC4899", time: "~4 min", xp: "+60 XP", color: "#EC4899",
  },
  {
    icon: <img src="/quiz-icon-mixed.png" alt="" style={{ width: "190px", height: "auto", display: "block", maxWidth: "none" }} />,
    label: "Mixed Quiz", desc: "Random words from all decks", difficulty: "Medium", diffBg: "#78350F", diffText: "#FBBF24", borderColor: "#7C3AED", time: "~5 min", xp: "+75 XP", color: "#8B5CF6",
  },
  {
    icon: <img src="/quiz-icon-cefr.png" alt="" style={{ width: "190px", height: "auto", display: "block", maxWidth: "none" }} />,
    label: "CEFR Level", desc: "Pick a level to test", difficulty: "Medium", diffBg: "#78350F", diffText: "#FBBF24", borderColor: "#D4A017", time: "~5 min", xp: "+80 XP", color: "#FBBF24",
  },
  {
    icon: <img src="/quiz-icon-speed.png" alt="" style={{ width: "190px", height: "auto", display: "block", maxWidth: "none" }} />,
    label: "Speed Challenge", desc: "Answer as fast as you can", difficulty: "Hard", diffBg: "#7F1D1D", diffText: "#FB7185", borderColor: "#EA580C", time: "~2 min", xp: "+100 XP", color: "#F97316",
  },
];

// ── Page ──────────────────────────────────────────────────────────────

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResultOut | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedMode, setSelectedMode] = useState<string>("Current Lesson");

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"),
  });

  useAutosave("quiz-answers", { sessionId, currentIndex, answers, state });
  const { addToast } = useToast();

  const { hasDraft, restore, dismiss } = useRecovery<{
    sessionId: string; currentIndex: number; answers: StoredAnswer[]; questions: QuizQuestion[];
  }>("quiz-answers");

  const handleStart = useCallback((session: QuizSession) => {
    setSessionId(session.session_id); setQuestions(session.questions);
    setCurrentIndex(0); setAnswers([]); setResults(null); setState("active");
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    const question = questions[currentIndex];
    if (!question) return;
    const newAnswer: StoredAnswer = { question_id: String(question.id), answer };
    const newAnswers = [...answers];
    // Replace if re-answering, otherwise append
    if (currentIndex < newAnswers.length) {
      newAnswers[currentIndex] = newAnswer;
    } else {
      newAnswers.push(newAnswer);
    }
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
      dismiss();
    } catch {
      addToast({ title: "Submission failed", message: "Could not submit quiz answers. Please try again.", variant: "error" });
      setResults({ score_pct: 0, questions_total: questions.length, questions_correct: 0,
        results: finalAnswers.map((a) => ({ question_id: a.question_id, correct: false, your_answer: a.answer, correct_answer: "Unknown", feedback: "Submission error. Please try again." })) });
      setState("results");
    } finally { setSubmitting(false); }
  }

  const handleRetry = useCallback(() => {
    setState("setup"); setSessionId(null); setQuestions([]); setAnswers([]); setResults(null);
    dismiss();
  }, [dismiss]);

  const [generating, setGenerating] = useState(false);

  async function handleGenerateQuiz() {
    setGenerating(true);
    try {
      let body: Record<string, unknown> = { count: questionCount };
      if (selectedMode === "CEFR Level") body.level = dash?.continue_lesson?.level || "A1";
      if (selectedMode === "Speed Challenge") body.count = Math.min(questionCount, 15);
      const session = await api.post<QuizSession>("/quiz/generate", body);
      handleStart(session);
    } catch {
      addToast({ title: "Quiz generation failed", message: "Could not create quiz. Please try again.", variant: "error" });
    } finally { setGenerating(false); }
  }

  const handleQuizRestore = useCallback(() => {
    const draft = restore();
    if (draft) {
      setSessionId(draft.sessionId); setCurrentIndex(draft.currentIndex);
      setAnswers(draft.answers); setQuestions(draft.questions); setState("active");
    }
  }, [restore]);

  // ── Setup state (Quiz Hub) ──
  if (state === "setup") {
    return (
      <div className="space-y-6 pb-8">
        {/* ── HERO SECTION ── */}
        <div
          className="relative flex items-center overflow-hidden"
          style={{
            borderRadius: "24px",
            minHeight: "320px",
            background: `url('/quiz-hero-bg.png') right center / cover no-repeat`,
            boxShadow: "0 8px 40px rgba(0,0,0,.3)",
          }}
        >
          {/* Left: Text (≈60%) */}
          <div className="relative z-10 px-8 sm:px-12 py-8" style={{ flex: "0.6 1 0%" }}>
            <p className="text-xs font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "#A855F7" }}>Quiz Hub</p>
            <h1 className="font-extrabold m-0 leading-tight" style={{ fontSize: "54px", color: "#F8FAFC" }}>
              Ready to <span style={{ background: "linear-gradient(135deg, #A855F7, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>challenge</span> yourself?
            </h1>
            <p className="mt-3" style={{ fontSize: "18px", fontWeight: 500, color: "#A8A4BC", maxWidth: "440px", lineHeight: 1.6 }}>
              Pick a quiz mode and strengthen your German skills with personalized practice.
            </p>

            {/* Feature cards — horizontal, ~72px tall */}
            <div className="flex gap-3 mt-7">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><defs><linearGradient id="bolt" x1="0" y1="0" x2="18" y2="18"><stop offset="0%" stopColor="#FF5FA2"/><stop offset="100%" stopColor="#EC4899"/></linearGradient></defs><path d="M10 2L7 8H11L9 16L14 8H10L12 2Z" fill="url(#bolt)" filter="url(#g)"/><defs><filter id="g"><feGaussianBlur stdDeviation="0.5"/></filter></defs></svg>, label: "5 Quiz Modes", desc: "For every goal", glow: "rgba(236,72,153,.35)" },
                { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="#EC4899" strokeWidth="1.5" fill="none"/><circle cx="9" cy="9" r="3.5" stroke="#F472B6" strokeWidth="1.5" fill="none"/><circle cx="9" cy="9" r="1.2" fill="#FFF"/><line x1="9" y1="9" x2="14" y2="4" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: "Adaptive Difficulty", desc: "Just for you", glow: "rgba(236,72,153,.3)" },
                { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><defs><linearGradient id="gold" x1="0" y1="0" x2="18" y2="18"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs><path d="M9 2L10 6.5H15L11 9.5L12.5 14L9 11L5.5 14L7 9.5L3 6.5H8L9 2Z" fill="url(#gold)" filter="url(#g2)"/><defs><filter id="g2"><feGaussianBlur stdDeviation="0.5"/></filter></defs></svg>, label: "XP Rewards", desc: "Earn while you learn", glow: "rgba(251,191,36,.3)" },
              ].map((badge) => (
                <div key={badge.label} className="flex-1 flex items-center gap-3 rounded-xl px-4" style={{ height: "72px", background: "rgba(16,18,32,.6)", border: "1px solid rgba(255,255,255,.04)" }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(10,12,24,.5)", boxShadow: `0 0 12px ${badge.glow}` }}>
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold m-0" style={{ color: "#FFF" }}>{badge.label}</p>
                    <p className="text-[11px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,.3)" }}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Artwork (≈42%) — trophy in bg image + floating elements */}
          <div className="flex-1 relative h-full overflow-hidden" style={{ minHeight: "320px" }}>
            {/* Radial glow behind trophy */}
            <div className="absolute" style={{ right: "10%", top: "50%", transform: "translateY(-50%)", width: "420px", height: "320px", background: "radial-gradient(ellipse, rgba(168,85,247,.15) 0%, rgba(139,92,246,.08) 30%, transparent 60%)", pointerEvents: "none" }} />

            {/* Daily Goal pill */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "rgba(16,18,32,.7)", border: "1px solid rgba(168,85,247,.2)" }}>
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,.5)" }}>Daily Goal</span>
              <span className="text-sm font-bold" style={{ color: "#FFF" }}>🔥 7 / 20 XP</span>
            </div>

            {/* Circular neon platform under trophy */}
            <div className="absolute" style={{ bottom: "8%", right: "18%", width: "160px", height: "40px" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(139,92,246,.35) 0%, rgba(168,85,247,.15) 40%, transparent 70%)" }} />
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,.2) 0%, transparent 50%)", transform: "scale(0.7)" }} />
            </div>

            {/* Lightning Bolt Card — above trophy */}
            <div className="absolute flex items-center justify-center" style={{ top: "12%", right: "28%", width: "70px", height: "70px", borderRadius: "16px", background: "rgba(91,33,182,.7)", border: "1px solid rgba(168,85,247,.2)", transform: "rotate(12deg)", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: "24px", transform: "rotate(-12deg)", filter: "drop-shadow(0 0 6px rgba(167,139,250,.5))" }}>⚡</span>
            </div>

            {/* Learning Card — left of trophy */}
            <div className="absolute flex items-center justify-center" style={{ bottom: "28%", left: "12%", width: "68px", height: "68px", borderRadius: "16px", background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.1)", transform: "rotate(-10deg)", backdropFilter: "blur(8px)" }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="16" height="20" rx="2" stroke="#A78BFA" strokeWidth="1.5" fill="none"/><rect x="6" y="6" width="12" height="2" rx="1" fill="#A78BFA" opacity="0.5"/><rect x="6" y="10" width="8" height="2" rx="1" fill="#A78BFA" opacity="0.3"/><rect x="6" y="14" width="10" height="2" rx="1" fill="#A78BFA" opacity="0.3"/></svg>
            </div>

            {/* Question Card — far right */}
            <div className="absolute flex items-center justify-center" style={{ bottom: "20%", right: "8%", width: "70px", height: "70px", borderRadius: "16px", background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.08)", transform: "rotate(18deg)", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: "26px", fontWeight: "bold", transform: "rotate(-18deg)", color: "rgba(192,132,252,.6)" }}>?</span>
            </div>

            {/* Floating stars */}
            <span className="absolute" style={{ top: "10%", right: "15%", fontSize: "5px", color: "#C084FC", opacity: 0.6 }}>✦</span>
            <span className="absolute" style={{ top: "25%", right: "40%", fontSize: "4px", color: "#C084FC", opacity: 0.4 }}>✦</span>
            <span className="absolute" style={{ bottom: "35%", right: "20%", fontSize: "6px", color: "#C084FC", opacity: 0.5 }}>✦</span>
            <span className="absolute" style={{ top: "40%", right: "5%", fontSize: "3px", color: "#C084FC", opacity: 0.3 }}>✦</span>
          </div>
        </div>

        {/* ── CONTINUE QUIZ BANNER ── */}
        {hasDraft && (
          <div className="flex items-center gap-5" style={{ borderRadius: "20px", height: "86px", padding: "20px", background: "#121423", border: "1px solid rgba(255,255,255,.06)", position: "relative", overflow: "hidden" }}>
            {/* Subtle purple radial glow */}
            <div className="absolute" style={{ left: "30%", top: "50%", transform: "translate(-50%,-50%)", width: "200px", height: "100px", background: "radial-gradient(ellipse, rgba(168,85,247,.06), transparent)", pointerEvents: "none" }} />
            {/* Premium glass icon */}
            <div className="flex-shrink-0 relative" style={{ width: "50px", height: "50px" }}>
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,.3) 0%, rgba(168,85,247,.15) 40%, transparent 70%)", transform: "scale(1.3)" }} />
              {/* Circular background */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(ellipse at 40% 35%, #A855F7, #6D28D9)", boxShadow: "0 0 20px rgba(168,85,247,.25)" }}>
                {/* Inner glass highlight */}
                <div className="absolute rounded-full" style={{ top: "8px", left: "8px", width: "16px", height: "10px", background: "rgba(255,255,255,.08)", transform: "rotate(-30deg)" }} />
                {/* Floppy disk icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 0 4px rgba(255,255,255,.18))" }}>
                  <rect x="4" y="2" width="16" height="20" rx="2" fill="#F3F4F6"/>
                  <rect x="4" y="2" width="16" height="20" rx="2" stroke="#F3F4F6" strokeWidth="0.5"/>
                  <rect x="6" y="3" width="12" height="6" rx="1" fill="#A78BFA"/>
                  <rect x="8" y="12" width="8" height="8" rx="1.5" fill="#7C3AED"/>
                  <rect x="5" y="2" width="3" height="2" rx="0.5" fill="#FFF" opacity="0.4"/>
                  <line x1="10" y1="14.5" x2="14" y2="14.5" stroke="#F3F4F6" strokeWidth="0.8" strokeLinecap="round"/>
                  <line x1="10" y1="16.5" x2="13" y2="16.5" stroke="#F3F4F6" strokeWidth="0.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            {/* Text */}
            <div className="flex-1" style={{ position: "relative", zIndex: 1 }}>
              <p className="m-0" style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>Continue your previous quiz</p>
              <p className="m-0 mt-0.5" style={{ fontSize: "14px", color: "#A8A4BC" }}>
                German Basics • Question {currentIndex + 1} of {questions.length} • <span style={{ color: "#22C55E" }}>●</span> Easy
              </p>
            </div>
            {/* Continue button */}
            <button onClick={handleQuizRestore} className="flex-shrink-0 border-none cursor-pointer text-sm font-semibold flex items-center justify-center gap-2"
              style={{ width: "160px", height: "48px", borderRadius: "14px", background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)", color: "#FFF", boxShadow: "0 4px 20px rgba(168,85,247,.2)" }}>
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Close button */}
            <button onClick={dismiss} className="flex-shrink-0 border-none cursor-pointer p-1" style={{ background: "none", color: "#C9C9D8", fontSize: "18px", opacity: 0.6 }}>✕</button>
          </div>
        )}

        {/* ── CHOOSE YOUR QUIZ MODE ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium m-0" style={{ color: "#FFF" }}>Choose your quiz mode</p>
          <button onClick={() => setSelectedMode("Current Lesson")} className="text-xs border-none cursor-pointer" style={{ color: "#A855F7", background: "none" }}>(?) How it works</button>
        </div>

        {/* 5 Quiz Mode Cards — premium glassmorphism */}
        <div className="flex gap-4">
          {QUIZ_MODES.map((mode, idx) => (
            <button
              key={mode.label}
              onClick={() => setSelectedMode(mode.label)}
              className="flex-1 flex flex-col text-left cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                borderRadius: "18px", padding: "10px 12px", minHeight: "auto",
                background: `radial-gradient(ellipse at 50% 25%, ${mode.borderColor}12, #0E1020 70%)`,
                border: selectedMode === mode.label ? "1px solid #1D4ED8" : `1px solid ${mode.borderColor}50`,
                boxShadow: selectedMode === mode.label ? "0 8px 32px rgba(0,0,0,.35), 0 0 30px rgba(59,130,246,.2), inset 0 1px 0 rgba(255,255,255,.04)" : `0 8px 32px rgba(0,0,0,.35), 0 0 30px ${mode.borderColor}12, inset 0 1px 0 rgba(255,255,255,.04)`,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Ambient purple backlight */}
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, rgba(168,85,247,.06), transparent 70%)`, pointerEvents: "none" }} />

              {/* Selected badge */}
              {selectedMode === mode.label && (
                <div className="absolute z-10 flex items-center justify-center"
                  style={{ top: "10px", right: "10px", padding: "3px 9px", borderRadius: "999px", background: "linear-gradient(90deg, #4F7DFF, #6C5CFF)", boxShadow: "0 0 12px rgba(99,102,241,.25)" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#FFF", letterSpacing: "0.2px" }}>Selected</span>
                </div>
              )}

              {/* Icon */}
              <div className="mb-1 flex justify-center relative" style={{ height: "130px", display: "flex", alignItems: "center", justifyContent: "center", filter: `drop-shadow(0 0 30px ${mode.borderColor}60) drop-shadow(0 0 60px ${mode.borderColor}35) drop-shadow(0 0 90px ${mode.borderColor}15)` }}>
                {mode.icon}
              </div>
              {/* Title */}
              <p className="text-sm font-bold m-0" style={{ color: "#F8FAFC" }}>{mode.label}</p>
              {/* Description */}
              <p className="text-xs mt-0.5 mb-2" style={{ color: "#C8C6D0", lineHeight: 1.3, flex: 1 }}>{mode.desc}</p>
              {/* Difficulty badge */}
              <div className="mb-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: mode.diffText, background: mode.diffBg, boxShadow: `0 0 10px ${mode.diffBg}50` }}>{mode.difficulty}</span>
              </div>
              {/* Time + XP */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium" style={{ color: "#F97316" }}>⏱ {mode.time}</span>
                <span className="text-[11px] font-semibold" style={{ color: mode.color, filter: `drop-shadow(0 0 4px ${mode.color}40)` }}>⭐ {mode.xp}</span>
              </div>
              {/* Bottom footer */}
              <div className="w-full py-1.5 rounded-lg text-center text-[11px] font-medium" style={{ background: "rgba(10,12,24,.5)", border: "1px solid rgba(255,255,255,.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)", color: "rgba(255,255,255,.35)" }}>
                20 Questions
              </div>
            </button>
          ))}
        </div>

        {/* ── START QUIZ ACTION BAR (3-column) ── */}
        <div className="flex gap-3" style={{ height: "72px" }}>
          {/* Left: Number of Questions (30%) */}
          <div className="flex flex-col justify-center px-4 relative" style={{ flex: "0.3 1 0%", borderRadius: "16px", background: "linear-gradient(180deg, #161B30, #141827)", border: "1px solid rgba(160,140,200,.08)", boxShadow: "0 4px 20px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.02)" }}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1" style={{ position: "relative", zIndex: 1 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2.5" x2="10" y2="2.5" stroke="#A89FBF" strokeWidth="1.2" strokeLinecap="round"/><line x1="2" y1="6" x2="10" y2="6" stroke="#A89FBF" strokeWidth="1.2" strokeLinecap="round"/><line x1="2" y1="9.5" x2="10" y2="9.5" stroke="#A89FBF" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#C7CBD8", whiteSpace: "nowrap" }}>Number of questions</span>
            </div>
            {/* Selection container — compact */}
            <div className="flex items-center justify-between px-2 py-1.5" style={{ borderRadius: "8px", background: "#111422", border: "1px solid rgba(160,140,200,.05)" }}>
              {[5, 10, 15, 20, 30].map((n) => (
                <button key={n} onClick={() => setQuestionCount(n)} className="border-none cursor-pointer text-center leading-none transition-all" style={{ width: n === questionCount ? "26px" : "auto", height: n === questionCount ? "26px" : "auto", borderRadius: n === questionCount ? "999px" : "0", background: n === questionCount ? "radial-gradient(ellipse at 40% 30%, #7C6BFF, #6A4DFF, #5536E8)" : "transparent", color: n === questionCount ? "#FFF" : "rgba(255,255,255,.35)", fontSize: "12px", fontWeight: 500, boxShadow: n === questionCount ? "0 0 16px rgba(90,68,255,.5), inset 0 1px 0 rgba(255,255,255,.12)" : "none", lineHeight: "26px", padding: 0 }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Center: Start Quiz CTA (40%) */}
          <button onClick={handleGenerateQuiz} disabled={generating} className="flex flex-col items-center justify-center border-none relative overflow-hidden cursor-pointer" style={{ flex: "0.4 1 0%", height: "72px", borderRadius: "14px", background: "linear-gradient(90deg, #FF3F8F, #F73DB6, #C448FF, #7A5DFF)", boxShadow: "0 4px 30px rgba(255,63,143,.35), 0 0 60px rgba(196,72,255,.12), inset 0 1px 0 rgba(255,255,255,.15)" }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)" }} />
            <div style={{ position: "absolute", top: "2px", left: "20%", right: "20%", height: "18px", background: "radial-gradient(ellipse at center, rgba(255,255,255,.06), transparent)", pointerEvents: "none" }} />
            {/* Arrow — absolutely positioned right center */}
            <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10H17M17 10L12 5M17 10L12 15" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/></svg>
            </div>
            <div className="flex flex-col items-center pr-10" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "20px", filter: "drop-shadow(0 0 8px rgba(255,216,74,.6))" }}>⚡</span>
                <span style={{ fontSize: "22px", fontWeight: 600, color: "#FFF", letterSpacing: "-0.3px" }}>Start Quiz</span>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,.75)", marginTop: "4px", letterSpacing: "1.5px", position: "relative", paddingLeft: "20px" }}>{questionCount}Q &nbsp;<span style={{ color: "#FBBF24" }}>•</span>&nbsp; ~{Math.round(questionCount * 0.5)}m &nbsp;<span style={{ color: "#FBBF24" }}>•</span>&nbsp; +{questionCount * 5}XP</p>
            </div>
          </button>

          {/* Right: Estimated Time (30%) */}
          <div className="flex items-center gap-3 px-4 relative overflow-hidden" style={{ flex: "0.3 1 0%", borderRadius: "14px", background: "radial-gradient(ellipse at 80% 30%, rgba(126,107,255,.06), #141827 70%)", border: "1px solid rgba(160,140,200,.07)", boxShadow: "0 4px 20px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.02)" }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(126,107,255,.12)", boxShadow: "0 0 16px rgba(126,107,255,.15), inset 0 1px 0 rgba(255,255,255,.04)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#7E6BFF" strokeWidth="1.5" fill="none"/><path d="M9 6V9L11.5 11.5" stroke="#7E6BFF" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div>
              <p className="m-0" style={{ fontSize: "10px", fontWeight: 500, color: "#A0A4B8", letterSpacing: "0.3px" }}>Time</p>
              <p className="m-0 mt-0.5" style={{ fontSize: "20px", fontWeight: 700, color: "#FFF", lineHeight: 1 }}>~{Math.round(questionCount * 0.5)}m</p>
            </div>
          </div>
        </div>

        {/* ── STATISTICS ROW (5 KPI cards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {[
            {
              icon: <div style={{ position: "relative", width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="96" height="96" viewBox="0 0 96 96" fill="none" style={{ position: "absolute" }}><circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,.06)" strokeWidth="6" fill="none"/><circle cx="48" cy="48" r="38" stroke="#22C55E" strokeWidth="6" fill="none" strokeDasharray={`${((dash?.avg_quiz_score ?? 0) / 100) * 239} 239`} strokeLinecap="round" transform="rotate(-90 48 48)"/></svg><span style={{ fontSize: "20px", fontWeight: 800, color: "#FFF" }}>{dash?.avg_quiz_score ?? 0}%</span></div>,
              label: "Accuracy", value: null, sub: <>↑ <span style={{color:"#FFF"}}>8% this week</span></>, subColor: "#22C55E",
            },
            {
              icon: <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="starG2" x1="4" y1="4" x2="60" y2="60"><stop offset="0%" stopColor="#D8B4FE"/><stop offset="30%" stopColor="#A855F7"/><stop offset="100%" stopColor="#6B21A8"/></linearGradient></defs><path d="M32 6L37 20L52 20L40 28L44 42L32 34L20 42L24 28L12 20H27Z" fill="url(#starG2)"/><path d="M32 12L35 22L46 22L38 28L40 38L32 32L24 38L26 28L18 22H29Z" fill="rgba(255,255,255,.15)"/></svg>,
              label: "Day Streak", value: String(dash?.streak ?? 0), sub: "Keep it going!", subColor: "#FFF",
            },
            {
              icon: <span style={{ fontSize: "48px", filter: "drop-shadow(0 0 12px rgba(249,115,22,.5))" }}>🔥</span>,
              label: "Current Streak", value: `${dash?.streak ?? 0}`, sub: "days in a row", subColor: "#FFF",
            },
            {
              icon: <svg width="56" height="64" viewBox="0 0 56 64"><defs><linearGradient id="sh" x1="0" y1="0" x2="56" y2="64"><stop offset="0" stopColor="#FCD34D"/><stop offset="1" stopColor="#B45309"/></linearGradient></defs><path d="M28 4L52 20L44 38L50 60L28 50L6 60L12 38L4 20Z" fill="url(#sh)"/><path d="M28 12L44 24L38 36L42 52L28 44L14 52L18 36L12 24Z" fill="rgba(255,255,255,.15)"/></svg>,
              label: "Cards Due", value: String(dash?.cards_due_today ?? 0), sub: "Review today", subColor: "#FFF",
            },
            {
              icon: <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="chG3" x1="4" y1="4" x2="60" y2="60"><stop offset="0%" stopColor="#C084FC"/><stop offset="100%" stopColor="#6B21A8"/></linearGradient></defs><rect x="10" y="42" width="8" height="14" rx="2" fill="url(#chG3)" opacity="0.3"/><rect x="21" y="32" width="8" height="24" rx="2" fill="url(#chG3)" opacity="0.5"/><rect x="32" y="16" width="8" height="40" rx="2" fill="url(#chG3)"/><rect x="43" y="34" width="8" height="22" rx="2" fill="url(#chG3)" opacity="0.45"/><circle cx="36" cy="16" r="4" fill="#C084FC"/></svg>,
              label: "Avg Quiz Score", value: `${dash?.avg_quiz_score ?? 0}%`, sub: "Overall average", subColor: "#FFF",
            },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-3 text-center" style={{ borderRadius: "14px", background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,.04), #0F1420 80%)", border: "1px solid rgba(160,140,200,.07)", boxShadow: "0 2px 12px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.02)" }}>
              <p className="text-xs m-0 mb-2 uppercase tracking-[1px] font-semibold" style={{ color: "#FFF" }}>{stat.label}</p>
              <div className="mb-2 flex justify-center" style={{ filter: "drop-shadow(0 0 12px rgba(168,85,247,.35))" }}><div style={{ position: "relative" }}><div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(ellipse, rgba(168,85,247,.08), transparent 70%)", borderRadius: "50%" }} />{stat.icon}</div></div>
              {stat.value !== null && <p className="text-lg font-bold m-0" style={{ color: "#FFF" }}>{stat.value}</p>}
              <p className="text-[10px] mt-0.5 m-0 font-medium" style={{ color: stat.subColor }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── THREE-COLUMN ANALYTICS SECTION ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* ── Today's Challenge ── */}
          <div className="flex flex-col rounded-2xl" style={{ background: "#131829", border: "1px solid rgba(255,255,255,.05)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "16px" }}>🏆</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>Today's Challenge</span>
              </div>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "999px", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)" }}>
                {(() => { const n = new Date(); const m = new Date(n); m.setHours(24,0,0,0); const r = m.getTime() - n.getTime(); return `${Math.floor(r/3600000)}h ${Math.floor((r%3600000)/60000)}m left`; })()}
              </span>
            </div>
            {/* Challenge List */}
            <div className="px-5 flex-1 space-y-3 mb-4">
              {(() => {
                const s = dash?.streak ?? 0;
                const challenges = [
                  { task: "Complete 1 quiz today", done: (dash?.avg_quiz_score ?? 0) > 0 },
                  { task: "Score 70% or higher", done: (dash?.avg_quiz_score ?? 0) >= 70 },
                  { task: s > 0 ? `Extend your ${s}-day streak` : "Start your first streak", done: s > 0 },
                ];
                return challenges.map((c) => (
                <div key={c.task} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: "12px", filter: "drop-shadow(0 0 4px rgba(251,191,36,.3))", opacity: c.done ? 0.5 : 1 }}>{c.done ? "✅" : "⭐"}</span>
                    <span style={{ fontSize: "12px", color: c.done ? "rgba(255,255,255,.3)" : "#A8A4BC", textDecoration: c.done ? "line-through" : "none" }}>{c.task}</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: c.done ? "#22C55E" : "#EC4899" }}>{c.done ? "Done!" : "+40 XP"}</span>
                </div>
                ));
              })()}
            </div>
            {/* Progress Bar */}
            <div className="px-5 mb-4">
              <div className="rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,.05)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(() => { const s = dash?.streak ?? 0; const sc = (dash?.avg_quiz_score ?? 0) > 0; const done = [sc, (dash?.avg_quiz_score ?? 0) >= 70, s > 0].filter(Boolean).length; return Math.round((done/3)*100); })()}%`, background: "linear-gradient(90deg, #EC4899, #8B5CF6)" }} />
              </div>
            </div>
            {/* Reward Footer */}
            <div className="mt-auto rounded-b-2xl px-5 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, rgba(139,92,246,.15), rgba(236,73,153,.08))", borderTop: "1px solid rgba(255,255,255,.04)" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>🎁</span>
                <span style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,.5)" }}>Challenge Reward</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#A855F7" }}>+{(() => { const s = dash?.streak ?? 0; const sc = (dash?.avg_quiz_score ?? 0) > 0; return [sc, (dash?.avg_quiz_score ?? 0) >= 70, s > 0].filter(Boolean).length * 40; })()} XP</span>
            </div>
          </div>

          {/* ── AI Recommendation ── */}
          <div className="flex flex-col rounded-2xl relative overflow-hidden" style={{ background: `url('/quiz-ai-bg.png') right center / cover no-repeat`, border: "1px solid rgba(255,255,255,.05)" }}>
            <div className="px-5 pt-4 pb-3 flex-1 flex flex-col" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: "16px" }}>✨</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>AI Recommendation</span>
              </div>
              <p style={{ fontSize: "12px", color: "#A8A4BC", marginBottom: "8px" }}>We think you should try</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#EC4899", marginBottom: "6px" }}>Weak Words Quiz</p>
              <p style={{ fontSize: "11px", color: "#A8A4BC", lineHeight: 1.5, maxWidth: "70%" }}>Practice the words you struggle with most to improve your vocabulary retention.</p>
            </div>
            {/* CTA */}
            <div className="px-5 pb-4" style={{ position: "relative", zIndex: 1 }}>
              <button onClick={() => { setSelectedMode("Weak Words"); handleGenerateQuiz(); }} className="px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer"
                style={{ background: "linear-gradient(90deg, #EC4899, #A855F7)", color: "#FFF" }}>
                Practice Now →
              </button>
            </div>
          </div>

          {/* ── Recent Performance ── */}
          <div className="flex flex-col rounded-2xl" style={{ background: "#131829", border: "1px solid rgba(255,255,255,.05)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>Recent Performance</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,.3)" }}>Last 7d ▼</span>
            </div>
            {/* Performance Chart */}
            <div className="px-5 flex-1 flex flex-col justify-center">
              <div className="flex items-end gap-1.5 h-20 mb-1">
                {(dash?.avg_quiz_score ? [dash.avg_quiz_score, dash.avg_quiz_score * 0.9, dash.avg_quiz_score * 0.85, dash.avg_quiz_score * 0.95, dash.avg_quiz_score] : [0, 0, 0, 0, 0]).map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div className="w-full rounded-t-sm transition-all" style={{
                      height: `${h}%`,
                      background: i === 6 ? "linear-gradient(180deg, #EC4899, #8B5CF6)" : "rgba(168,85,247,.15)",
                      position: "relative",
                    }}>
                      {i === 6 && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{ background: "#EC4899", boxShadow: "0 0 6px rgba(236,73,153,.5)" }} />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-0.5 mb-2">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <span key={i} style={{ fontSize: "9px", color: i === 6 ? "#EC4899" : "rgba(255,255,255,.2)" }}>{d}</span>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,.4)" }}>Average Accuracy</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#A855F7" }}>{dash?.avg_quiz_score ?? 86}%</span>
            </div>
          </div>
        </div>

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
      <div className="flex gap-6 pb-8 items-start">
        <EmmaAIPanel
                  greeting={
                    currentIndex === 0
                      ? "Los geht's!"
                      : currentIndex >= questions.length - 1
                        ? "Last one!"
                        : undefined
                  }
                  encouragement={
                    currentIndex === 0
                      ? "Let's start strong!"
                      : currentIndex >= questions.length - 1
                        ? "Finish strong, you're almost there!"
                        : undefined
                  }
                  tip={questions[currentIndex]?.hint || undefined}
                />
        <div className="flex-1 min-w-0" style={{ background: "#0F1120", borderRadius: "20px", padding: "24px" }}>
          <div className="space-y-6">
            <QuestionCard
              question={questions[currentIndex]}
              onAnswer={handleAnswer}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />

            {/* Action Row */}
            <div className="flex items-center gap-3">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                className="flex items-center gap-2.5 text-base font-semibold transition-all duration-200 flex-shrink-0"
                style={{
                  width: "140px", height: "50px", borderRadius: "12px",
                  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)",
                  color: currentIndex === 0 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.6)",
                  cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Previous
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex >= questions.length - 1 || answers.length <= currentIndex}
                className="flex items-center justify-center gap-2 text-base font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{
                  width: "220px", height: "50px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #6D28FF, #FF3EA5)",
                  boxShadow: "0 0 30px rgba(109,40,255,.3), 0 0 60px rgba(255,62,165,.12)",
                  color: "#FFF",
                }}
              >
                <span>Next Question</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {/* Bottom Stats */}
            <div className="flex items-center overflow-hidden" style={{ height: "72px", borderRadius: "16px", background: "#111322", border: "1px solid rgba(255,255,255,.04)" }}>
              {[
                { icon: "🔥", value: dash?.streak ?? "7", label: "Day Streak" },
                { icon: "⭐", value: "120", label: "This Lesson" },
                { icon: "🎯", value: `${dash?.avg_quiz_score ?? 85}%`, label: "Accuracy" },
                { icon: "📈", value: dash?.continue_lesson?.level ?? "A1", label: "Current Level" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex-1 flex items-center justify-center gap-3"
                  style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,.04)" : "none", height: "100%" }}>
                  <span style={{ fontSize: "22px" }}>{stat.icon}</span>
                  <div>
                    <p className="m-0" style={{ fontSize: "22px", fontWeight: 700, color: "#FFF" }}>{stat.value}</p>
                    <p className="m-0" style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,.35)" }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
