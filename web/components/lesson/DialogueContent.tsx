"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { DialogueCard, type DialogueLine } from "./DialogueCard";

// Dialogue CONTENT only (Sprint 6.2E refactor) — the shell-free body that renders
// into a LessonShell content slot. Use this with LessonNavigator (which owns the
// shell); `DialogueStage` wraps it for standalone use. Markup is unchanged from
// the original 6.2B DialogueStage body.

export type { DialogueLine };

export interface DialogueContentProps {
  sceneTitle: string;
  sceneDescription?: string;
  guidance?: string;
  lines: DialogueLine[];
  loading?: boolean;
  audioDisabled?: boolean;
  onReplayLine?: (id: DialogueLine["id"]) => void;
  onSlowLine?: (id: DialogueLine["id"]) => void;
}

const DEFAULT_GUIDANCE = "Listen to each line, then reveal the English if you need it.";

export function DialogueContent({
  sceneTitle, sceneDescription, guidance = DEFAULT_GUIDANCE, lines, loading, audioDisabled, onReplayLine, onSlowLine,
}: DialogueContentProps) {
  // Stable tone per unique speaker (alternating), derived from the data — no hardcoded names.
  const speakerOrder: string[] = [];
  for (const l of lines) if (!speakerOrder.includes(l.speaker)) speakerOrder.push(l.speaker);
  const toneFor = (speaker: string): "primary" | "neutral" =>
    speakerOrder.indexOf(speaker) % 2 === 0 ? "primary" : "neutral";

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{sceneTitle}</h2>
      {sceneDescription && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{sceneDescription}</p>}
      {guidance && <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>{guidance}</p>}

      <div role="list" aria-label="Conversation" className="space-y-3 sm:space-y-4 mt-5">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--color-card-bg)" }} aria-hidden>
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-3/4 rounded" />
                  </div>
                </div>
              </div>
            ))
          : lines.map((line) => (
              <DialogueCard key={line.id} line={line} tone={toneFor(line.speaker)}
                audioState={audioDisabled ? "disabled" : "idle"} onReplay={onReplayLine} onSlow={onSlowLine} />
            ))}
      </div>
    </div>
  );
}
