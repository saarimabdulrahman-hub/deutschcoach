"use client";

import React from "react";

// Shared base for every audio control (Sprint 6.2C) — one place owns size,
// focus, hover, pressed, and disabled styling so the individual buttons don't
// duplicate layout logic. 44px touch target; visible focus via global rule.

interface AudioControlButtonProps {
  label: string;            // full, descriptive aria-label (e.g. "Replay Anna's line")
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;         // highlighted/pressed (e.g. 0.5× on)
  ariaPressed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AudioControlButton({ label, onClick, disabled, active, ariaPressed, children, className }: AudioControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={ariaPressed}
      className={`inline-flex items-center justify-center rounded-lg min-w-11 h-11 px-2 transition-transform active:scale-95 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed ${className || ""}`}
      style={{
        color: active ? "var(--color-accent-light)" : "var(--color-text-muted)",
        background: active ? "var(--color-hover-bg)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

// Token-based spinner (respects reduced-motion via the global rule).
export function AudioSpinner() {
  return (
    <span aria-hidden className="inline-block w-4 h-4 rounded-full animate-spin"
      style={{ border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent-light)" }} />
  );
}
