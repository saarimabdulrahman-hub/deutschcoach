"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

const TYPE_LABELS: Record<string, string> = {
  translate: "Translate",
  "fill-blank": "Fill in the Blank",
  conjugate: "Conjugate",
  "multiple-choice": "Multiple Choice",
};

export function QuestionCard({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [textValue, setTextValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const isMultipleChoice = question.type === "multiple-choice";
  const typeLabel = TYPE_LABELS[question.type] || question.type;
  const subtitle = isMultipleChoice
    ? "Choose the correct answer"
    : "Type your answer below";

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!textValue.trim()) return;
    onAnswer(textValue.trim());
    setTextValue("");
  }

  function handleOptionClick(option: string) {
    setSelectedOption(option);
    setTimeout(() => {
      onAnswer(option);
      setSelectedOption(null);
    }, 300);
  }

  return (
    <div className="space-y-6">
      {/* ── Progress Header ── */}
      <div style={{ paddingLeft: "24px", paddingRight: "8px" }}>
        {/* Row 1: label + type badge */}
        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#D7D8E2" }}>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: "var(--color-active-bg)", color: "var(--color-active-text)" }}
          >
            {typeLabel}
          </span>
        </div>

        {/* Row 2: Segmented Neon Progress Bar */}
        <div className="flex items-center" style={{ gap: "0" }}>
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isCompleted = i < questionNumber - 1;
            const isActive = i === questionNumber - 1;
            const isNext = i === questionNumber;

            return (
              <div key={i} className="flex items-center" style={{ flex: i > 0 ? 1 : "none", minWidth: 0 }}>
                {i > 0 && (
                  <div
                    className="flex-1 transition-all duration-400"
                    style={{
                      height: "3px",
                      borderRadius: "2px",
                      background: i < questionNumber
                        ? "linear-gradient(90deg, #D946EF, #8B5CF6)"
                        : isNext
                          ? "linear-gradient(90deg, rgba(139,92,246,.4), #23233D)"
                          : "#1E1E35",
                      boxShadow: i < questionNumber
                        ? "0 0 6px rgba(217,70,239,.25), 0 0 12px rgba(139,92,246,.12)"
                        : isNext
                          ? "0 0 4px rgba(139,92,246,.15)"
                          : "none",
                      minWidth: "8px",
                      margin: "0 5px",
                    }}
                  />
                )}
                <div
                  className="flex-shrink-0 rounded-full transition-all duration-400"
                  style={{
                    width: isActive ? "10px" : "8px",
                    height: isActive ? "10px" : "8px",
                    background: isActive
                      ? "#A855F7"
                      : isCompleted
                        ? "#A855F7"
                        : isNext
                          ? "rgba(139,92,246,.25)"
                          : "rgba(72,45,110,.35)",
                    boxShadow: isActive
                      ? "0 0 6px rgba(168,85,247,.7), 0 0 12px rgba(168,85,247,.45), 0 0 24px rgba(168,85,247,.25)"
                      : isCompleted
                        ? "0 0 4px rgba(168,85,247,.3), 0 0 8px rgba(168,85,247,.12)"
                        : isNext
                          ? "0 0 3px rgba(139,92,246,.15)"
                          : "none",
                    animation: isActive ? "quizNodePulse 1.2s ease-in-out infinite" : "none",
                  }}
                />
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes quizNodePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        `}</style>
      </div>

      {/* ── Question Card ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "18px",
          background: "linear-gradient(180deg, #131528, #0F1120)",
          border: "1px solid rgba(168,85,247,.10)",
          boxShadow: "0 20px 50px rgba(0,0,0,.45)",
        }}
      >
        {/* ── Hero Banner (150px) ── */}
        <div
          className="relative flex items-center overflow-hidden"
          style={{
            height: "150px",
            padding: "0 28px",
            background:
              "url('/quiz-question-hero.png') var(--hero-bg-x, 25%) var(--hero-bg-y, 60%) / 110% auto no-repeat, linear-gradient(180deg, #16132B, #111322)",
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-10 right-10 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,.4), rgba(236,73,153,.4), transparent)" }}
          />

          {/* Flowing neon wave at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(180deg, transparent, rgba(168,85,247,.035))" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,.08), transparent)", opacity: 0.6 }}
          />

          {/* ── Question Text ── */}
          <div className="flex flex-col justify-center relative z-10 flex-1" style={{ paddingLeft: "25%" }}>
            <h2
              className="leading-tight m-0"
              style={{ fontSize: "36px", fontWeight: 600, color: "#FFF", lineHeight: 1.15 }}
            >
              {question.prompt}
            </h2>
            <p className="m-0 mt-1" style={{ fontSize: "17px", fontWeight: 400, color: "#A7A9B8" }}>
              {subtitle}
            </p>
          </div>

          {/* Fine grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 3px)",
            }}
          />
        </div>

        {/* ── Answer Section ── */}
        <div style={{ padding: "16px 20px 20px" }}>
          {/* Multiple Choice */}
          {isMultipleChoice && question.options && (
            <div className="flex flex-col" style={{ gap: "10px" }}>
              {question.options.map((option, i) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(option)}
                    className="w-full flex items-center text-left cursor-pointer transition-all duration-200"
                    style={{
                      height: "58px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      background: isSelected
                        ? "linear-gradient(135deg, #2A164A, #38165C)"
                        : "#111322",
                      border: isSelected
                        ? "1px solid #A855F7"
                        : "1px solid rgba(255,255,255,.05)",
                      boxShadow: isSelected
                        ? "0 0 24px rgba(168,85,247,.30), inset 0 1px 0 rgba(255,255,255,.04)"
                        : "none",
                      color: "#FFFFFF",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "rgba(168,85,247,.15)";
                        e.currentTarget.style.background = "rgba(168,85,247,.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,.05)";
                        e.currentTarget.style.background = "#111322";
                      }
                    }}
                  >
                    {/* Letter Badge (34×34) */}
                    <span
                      className="flex items-center justify-center flex-shrink-0 font-bold"
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        fontSize: "16px",
                        background: isSelected
                          ? "linear-gradient(135deg, #6D28FF, #A855F7)"
                          : "#0E1020",
                        color: "#FFFFFF",
                        border: isSelected
                          ? "1px solid #A855F7"
                          : "1px solid rgba(168,85,247,.25)",
                        marginRight: "14px",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>

                    {/* Answer Text */}
                    <span className="flex-1" style={{ fontSize: "18px", fontWeight: 500 }}>
                      {option}
                    </span>

                    {/* Selection Indicator (22px) */}
                    <span
                      className="flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-200"
                      style={{
                        width: "22px",
                        height: "22px",
                        border: isSelected
                          ? "2px solid #A855F7"
                          : "2px solid rgba(255,255,255,.15)",
                        background: isSelected ? "#A855F7" : "transparent",
                        boxShadow: isSelected ? "0 0 10px rgba(168,85,247,.35)" : "none",
                      }}
                    >
                      {isSelected && (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2 5.5L4.5 8L9 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input for translate / fill-blank / conjugate */}
          {!isMultipleChoice && (
            <form onSubmit={handleTextSubmit} className="flex gap-3">
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Type your answer..."
                autoFocus
                className="flex-1 outline-none transition-all duration-200"
                style={{
                  height: "58px",
                  padding: "0 20px",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: 500,
                  background: "#111322",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "#FFFFFF",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(168,85,247,.4)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,85,247,.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={!textValue.trim()}
                className="px-8 text-base font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  height: "58px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6D28FF, #FF3EA5)",
                  boxShadow: "0 0 24px rgba(109,40,255,.25)",
                  color: "#FFFFFF",
                }}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
