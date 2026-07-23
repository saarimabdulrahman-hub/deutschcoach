"use client";

import React, { useState } from "react";
import { ReplayButton } from "@/components/audio/ReplayButton";
import { SlowPlaybackButton } from "@/components/audio/SlowPlaybackButton";
import { type AudioState, isAudioBlocked } from "@/components/audio/types";

// One line of a conversation, as a calm, highly-readable card (Sprint 6.2B).
// The German dominates; speaker/pronunciation are secondary; translation stays
// collapsed and visually separated. Audio controls come from the shared audio
// system (Sprint 6.2C) — no bespoke audio buttons live here. React.memo so a
// single line's audio change doesn't re-render the rest of the conversation.

export interface DialogueLine {
  id: string | number;
  speaker: string;
  german: string;
  pronunciation?: string;
  translation: string;
  completed?: boolean;
}

interface DialogueCardProps {
  line: DialogueLine;
  tone?: "primary" | "neutral";   // speaker differentiation using existing tokens only
  audioState?: AudioState;        // drives the shared audio controls (default "idle")
  slow?: boolean;                 // 0.5× engaged for this line
  onReplay?: (id: DialogueLine["id"]) => void; // UI-only; no real playback this sprint
  onSlow?: (id: DialogueLine["id"]) => void;   // UI-only
}

export const DialogueCard = React.memo(function DialogueCard({ line, tone = "neutral", audioState = "idle", slow, onReplay, onSlow }: DialogueCardProps) {
  const [open, setOpen] = useState(false); // translation collapsed by default
  const initial = line.speaker.trim().charAt(0).toUpperCase() || "?";
  const transId = `dlg-trans-${line.id}`;
  const audioLabel = `${line.speaker}'s line`;
  const audioDisabled = isAudioBlocked(audioState) || audioState === "loading" || audioState === "buffering";

  return (
    <article role="listitem" className="rounded-2xl p-4 sm:p-5"
      style={{ background: "var(--color-card-bg)", opacity: line.completed ? 0.88 : 1 }}>
      <div className="flex gap-3 sm:gap-4">
        {/* Speaker avatar (decorative — name is the accessible label) */}
        <div aria-hidden className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5"
          style={{
            background: tone === "primary" ? "var(--color-hover-bg)" : "var(--color-page-bg)",
            color: tone === "primary" ? "var(--color-accent-light)" : "var(--color-text-muted)",
            border: tone === "primary" ? "none" : "1px solid var(--color-border)",
          }}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Speaker name + shared audio controls */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
              {line.speaker}
              {line.completed && (<><span aria-hidden style={{ color: "#22c55e" }}>✓</span><span className="sr-only">, read</span></>)}
            </span>
            <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1">
              <ReplayButton label={audioLabel} disabled={audioDisabled} onReplay={onReplay ? () => onReplay(line.id) : undefined} />
              <SlowPlaybackButton label={audioLabel} active={slow} disabled={audioDisabled} onToggle={onSlow ? () => onSlow(line.id) : undefined} />
            </div>
          </div>

          {/* German — the dominant element */}
          <p className="text-lg sm:text-xl font-medium leading-relaxed" style={{ color: "var(--color-text)" }}>{line.german}</p>

          {/* Pronunciation — subtle, optional */}
          {line.pronunciation && (
            <p className="text-sm italic mt-1" style={{ color: "var(--color-text-muted)" }}>{line.pronunciation}</p>
          )}

          {/* Translation toggle (collapsed by default) */}
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={transId}
            className="mt-2.5 -ml-1 px-1 min-h-[44px] inline-flex items-center gap-1 text-xs font-medium rounded hover:underline"
            style={{ color: "var(--color-accent-light)" }}>
            {open ? "Hide translation" : "Show translation"}
            <span aria-hidden className="inline-block transition-transform duration-150" style={{ transform: open ? "rotate(90deg)" : "none" }}>›</span>
          </button>
          {open && (
            <p id={transId} className="text-sm mt-1 pt-2.5" style={{ color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)" }}>
              {line.translation}
            </p>
          )}
        </div>
      </div>
    </article>
  );
});
