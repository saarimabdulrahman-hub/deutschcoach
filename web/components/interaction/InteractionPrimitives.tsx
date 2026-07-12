"use client";

// Shared interaction primitives (Sprint 8.2). All use design-system tokens only.
// Keyboard-operable, 44px targets, aria-labelled. No bespoke styling.

// ── QuestionCard ──────────────────────────────────────────────────────
export function QuestionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${className ?? ""}`}
      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      {children}
    </div>
  );
}

// ── AnswerOption (button chip) ────────────────────────────────────────
export function AnswerOption({
  children, selected, correct, onClick, disabled,
}: { children: React.ReactNode; selected?: boolean; correct?: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button"
      className="w-full text-left min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: correct === true ? "rgba(34,197,94,0.12)" : selected ? "var(--color-hover-bg)" : "var(--color-page-bg)",
        color: correct === true ? "#22c55e" : "var(--color-text-secondary)",
        border: correct === true ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--color-border)",
        cursor: disabled ? "default" : "pointer",
      }}>
      {children}
    </button>
  );
}

// ── FeedbackPanel ─────────────────────────────────────────────────────
export function FeedbackPanel({ correct, message, onRetry, onContinue }: {
  correct: boolean; message: string; onRetry?: () => void; onContinue?: () => void;
}) {
  return (
    <div className="mt-3 p-3 rounded-xl" role="status" aria-live="polite"
      style={{ background: correct ? "rgba(34,197,94,0.07)" : "var(--color-hover-bg)", border: correct ? "1px solid rgba(34,197,94,0.15)" : "1px solid var(--color-border)" }}>
      <p className="text-sm flex items-center gap-2">
        <span aria-hidden>{correct ? "✓" : "✗"}</span>
        <span style={{ color: "var(--color-text-secondary)" }}>{message}</span>
      </p>
      {(onRetry || onContinue) && (
        <div className="flex gap-2 mt-2">
          {onRetry && <button onClick={onRetry} className="min-h-[44px] px-4 rounded-xl text-xs font-semibold" style={{ color: "var(--color-accent-light)" }}>Try again</button>}
          {onContinue && <button onClick={onContinue} className="min-h-[44px] px-4 rounded-xl text-xs font-semibold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>Continue</button>}
        </div>
      )}
    </div>
  );
}

// ── ProgressDots ──────────────────────────────────────────────────────
export function ProgressDots({ total, current, completed = 0 }: { total: number; current: number; completed?: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="group" aria-label={`Item ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="block rounded-full transition-colors duration-150"
          style={{
            width: 6, height: 6,
            background: i < completed ? "var(--color-accent)" : i === current ? "var(--color-accent-light)" : "var(--color-border)",
          }} />
      ))}
      <span className="sr-only">{current + 1} of {total}</span>
    </div>
  );
}

// ── ContinueButton ────────────────────────────────────────────────────
export function ContinueButton({ onClick, label = "Continue", disabled }: { onClick?: () => void; label?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button"
      className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
      {label}
    </button>
  );
}

// ── HintBox ───────────────────────────────────────────────────────────
export function HintBox({ hint, onRequest }: { hint?: string; onRequest?: () => void }) {
  if (!hint && !onRequest) return null;
  return (
    <div className="mt-2">
      {onRequest && !hint && (
        <button onClick={onRequest} className="min-h-[44px] px-3 rounded-lg text-xs font-medium hover:underline"
          style={{ color: "var(--color-accent-light)" }}>💡 Show hint</button>
      )}
      {hint && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>💡 {hint}</p>}
    </div>
  );
}

// ── RetryButton ───────────────────────────────────────────────────────
export function RetryButton({ onClick, label = "Try again" }: { onClick?: () => void; label?: string }) {
  return (
    <button onClick={onClick} type="button"
      className="min-h-[44px] px-4 rounded-xl text-xs font-semibold" style={{ color: "var(--color-accent-light)" }}>
      {label}
    </button>
  );
}

// ── PageNav (prev/next with counter) ──────────────────────────────────
export function PageNav({ current, total, onPrev, onNext, canNext, canPrev, doneLabel }: {
  current: number; total: number; onPrev?: () => void; onNext?: () => void; canNext?: boolean; canPrev?: boolean; doneLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={onPrev} disabled={!canPrev} aria-label="Previous item"
        className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg disabled:opacity-30" style={{ color: "var(--color-text-muted)" }}>‹</button>
      <span className="text-[11px] tabular-nums" style={{ color: "var(--color-text-muted)" }}>{current + 1} / {total}</span>
      {canNext ? (
        <button onClick={onNext} aria-label="Next item"
          className="w-11 h-11 rounded-lg hover:bg-white/5 flex items-center justify-center text-lg" style={{ color: "var(--color-text-muted)" }}>›</button>
      ) : doneLabel ? (
        <button onClick={onNext} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>{doneLabel}</button>
      ) : <span aria-hidden className="w-11" />}
    </div>
  );
}
