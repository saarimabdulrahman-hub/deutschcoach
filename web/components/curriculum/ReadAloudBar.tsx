"use client";

import { useState, useMemo } from "react";
import { Play, Pause, Stop } from "@/components/ui/Icons";

interface ReadAloudBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  activeIndex: number;
  totalSentences: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplay: (index: number) => void;
  disabled?: boolean;
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ReadAloudBar({
  isPlaying, isPaused, activeIndex, totalSentences,
  onPlay, onPause, onResume, onStop, onReplay,
  disabled,
}: ReadAloudBarProps) {
  const [speed, setSpeed] = useState(1);
  const speeds = [0.75, 1, 1.25] as const;

  const progressPct = totalSentences > 0 ? Math.round(((activeIndex + 1) / totalSentences) * 100) : 0;

  // Estimate duration: ~3s per sentence at 1x speed
  const avgSecPerSentence = 3;
  const totalSeconds = totalSentences * avgSecPerSentence;
  const currentSeconds = isPlaying || isPaused ? (activeIndex + 1) * avgSecPerSentence : 0;

  const totalDuration = useMemo(() => formatDuration(totalSeconds), [totalSeconds]);
  const currentDuration = useMemo(() => formatDuration(currentSeconds), [currentSeconds]);

  const isStopped = !isPlaying && !isPaused;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 space-y-4"
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0" aria-hidden>🎧</span>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Listen to the Lesson
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Emma will read this lesson naturally
          </p>
        </div>
      </div>

      {/* ── Play/Pause + Duration + Stop ────────── */}
      <div className="flex items-center gap-4">
        {/* Large circular play/pause button */}
        {isStopped ? (
          <button
            onClick={onPlay}
            disabled={disabled}
            title="Read lesson aloud"
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}
          >
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        ) : isPaused ? (
          <button
            onClick={onResume}
            title="Resume reading"
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95"
            style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}
          >
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={onPause}
            title="Pause reading"
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95"
            style={{ background: "var(--color-accent-gradient)", color: "#fff", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}
          >
            <Pause className="h-6 w-6" />
          </button>
        )}

        {/* Duration display */}
        <div className="flex flex-col">
          <span className="text-lg font-semibold tabular-nums leading-tight" style={{ color: "var(--color-text)" }}>
            {isStopped ? totalDuration : currentDuration}
          </span>
          {!isStopped && (
            <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
              of {totalDuration}
            </span>
          )}
        </div>

        {/* Stop button — pushed to the right */}
        {(isPlaying || isPaused) && (
          <button
            onClick={onStop}
            title="Stop reading"
            className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Stop className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Progress Bar ────────────────────────── */}
      <div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              background: isPaused ? "var(--color-warning)" : "var(--color-accent-gradient)",
            }}
          />
        </div>
      </div>

      {/* ── Speed controls + Sentence status ────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Speed buttons */}
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              disabled={disabled}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: speed === s ? "var(--color-accent-gradient)" : "transparent",
                color: speed === s ? "#fff" : "var(--color-text-muted)",
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Sentence status + replay */}
        <div className="flex items-center gap-2">
          {isPlaying && !isPaused ? (
            <>
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Speaking {activeIndex + 1}/{totalSentences}
              </span>
              <button
                onClick={() => onReplay(activeIndex)}
                title="Replay current sentence"
                className="text-xs font-medium hover:underline transition-all"
                style={{ color: "var(--color-accent-light)" }}
              >
                Replay
              </button>
            </>
          ) : isPaused ? (
            <span className="text-xs font-medium" style={{ color: "var(--color-warning)" }}>
              Paused · {activeIndex + 1}/{totalSentences}
            </span>
          ) : (
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              {totalSentences} {totalSentences === 1 ? "sentence" : "sentences"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
