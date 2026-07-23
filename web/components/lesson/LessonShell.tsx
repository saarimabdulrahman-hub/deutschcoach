"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressSegments, type LessonStep } from "./ProgressSegments";
import { ExitConfirmSheet } from "./ExitConfirmSheet";
import type { LessonAction, LessonError } from "./types";

// Reusable, content-agnostic Lesson Shell (Sprint 6.2A · LESSON_WIREFRAMES Part A).
// Every lesson stage renders inside this frame so the learner never feels they
// navigated to a new page — only `children` change. The shell owns the sticky
// header (back / title / objective / exit + progress), the scrollable content
// slot, and the sticky thumb-zone footer CTA. It knows nothing about lesson data.

export type { LessonStep };
export type { LessonAction };

export interface LessonShellProps {
  // Header
  title: string;
  objective?: string;
  onBack?: () => void;        // shows the back control when provided
  onExit?: () => void;        // shows the exit (✕) control when provided
  confirmExit?: boolean;      // confirm before calling onExit

  // Progress
  steps: LessonStep[];
  currentStep: number;        // 1-based

  // Content slot
  children?: React.ReactNode;

  // Footer actions
  primaryAction?: LessonAction;
  secondaryAction?: LessonAction;

  // Shell states
  loading?: boolean;
  error?: LessonError | null;
  empty?: React.ReactNode;
  offline?: boolean;

  // Accessibility
  ariaLabel?: string;
  announce?: string;          // mirrored to the polite live region
}

const IconBack = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Spinner = () => (
  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden />
);

export function LessonShell({
  title, objective, onBack, onExit, confirmExit,
  steps, currentStep, children,
  primaryAction, secondaryAction,
  loading, error, empty, offline,
  ariaLabel, announce,
}: LessonShellProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [live, setLive] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Land keyboard/SR users at the top of the lesson on first mount (shell persists across stages).
  useEffect(() => { headingRef.current?.focus(); }, []);

  // Announce stage changes politely — no focus steal.
  useEffect(() => {
    const label = steps[Math.min(Math.max(currentStep, 1), steps.length || 1) - 1]?.label;
    setLive(`Step ${currentStep} of ${steps.length}${label ? `, ${label}` : ""}`);
  }, [currentStep, steps]);
  useEffect(() => { if (announce) setLive(announce); }, [announce]);

  const requestExit = () => {
    if (!onExit) return;
    if (confirmExit) setConfirmOpen(true); else onExit();
  };

  // Esc = exit (matches the ✕), unless the confirm sheet already owns the key.
  useEffect(() => {
    if (!onExit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmOpen) { e.preventDefault(); requestExit(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, confirmOpen, confirmExit]);

  return (
    <section aria-label={ariaLabel || `Lesson: ${title}`} className="flex flex-col">
      {/* ── Sticky header (sits just below the app header) ── */}
      <header className="sticky top-14 sm:top-[72px] z-20"
        style={{ background: "var(--color-page-bg)", borderBottom: "1px solid var(--color-border)" }}>
        {offline && (
          <div role="status" className="text-center text-[11px] py-1"
            style={{ background: "var(--color-hover-bg)", color: "var(--color-text-secondary)" }}>
            Offline — your progress is saved
          </div>
        )}
        <div className="px-4 sm:px-6 pt-2.5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            {onBack ? (
              <button onClick={onBack} aria-label="Go back" className="w-11 h-11 -ml-2 flex items-center justify-center rounded-lg hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}><IconBack /></button>
            ) : <span aria-hidden className="w-9" />}

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 ref={headingRef} tabIndex={-1} className="text-sm font-bold truncate outline-none" style={{ color: "var(--color-text)" }}>{title}</h1>
              {objective && <p className="text-[11px] truncate" style={{ color: "var(--color-text-muted)" }}>{objective}</p>}
            </div>

            {onExit ? (
              <button onClick={requestExit} aria-label="Exit lesson" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}><IconClose /></button>
            ) : <span aria-hidden className="w-9" />}
          </div>

          <ProgressSegments steps={steps} currentStep={currentStep} />
        </div>
      </header>

      {/* ── Scrollable content slot (shell is agnostic to what renders here) ── */}
      <div role="region" aria-label="Lesson content" className="flex-1 px-4 sm:px-6 py-5">
        {loading ? (
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState message={error.message || "Something went wrong."} onRetry={error.onRetry} />
        ) : (children ?? empty ?? null)}
      </div>

      {/* ── Sticky thumb-zone footer CTA (safe-area aware) ── */}
      {(primaryAction || secondaryAction) && (
        <footer className="sticky bottom-16 sm:bottom-0 z-20 px-4 sm:px-6 py-3"
          style={{
            background: "var(--color-page-bg)",
            borderTop: "1px solid var(--color-border)",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}>
          <div className="flex items-center gap-3">
            {secondaryAction && (
              <button onClick={secondaryAction.onClick} disabled={secondaryAction.disabled}
                className="min-h-[44px] px-5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button onClick={primaryAction.onClick} disabled={primaryAction.disabled || primaryAction.loading}
                aria-busy={primaryAction.loading || undefined}
                className="flex-1 min-h-[48px] px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
                {primaryAction.loading && <Spinner />}{primaryAction.label}
              </button>
            )}
          </div>
        </footer>
      )}

      {/* Polite SR announcer for stage changes / ad-hoc messages */}
      <div className="sr-only" role="status" aria-live="polite">{live}</div>

      {onExit && (
        <ExitConfirmSheet open={confirmOpen}
          onKeep={() => setConfirmOpen(false)}
          onLeave={() => { setConfirmOpen(false); onExit(); }} />
      )}
    </section>
  );
}
