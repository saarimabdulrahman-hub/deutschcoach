"use client";

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

export function ReadAloudBar({
  isPlaying, isPaused, activeIndex, totalSentences,
  onPlay, onPause, onResume, onStop, onReplay,
  disabled,
}: ReadAloudBarProps) {
  const progressPct = totalSentences > 0 ? Math.round(((activeIndex + 1) / totalSentences) * 100) : 0;

  return (
    <div className="rounded-2xl p-3 sm:p-4 flex items-center gap-3"
      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      {/* Play/Pause/Resume */}
      {!isPlaying && !isPaused ? (
        <button
          onClick={onPlay}
          disabled={disabled}
          title="Read lesson aloud"
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          <Play className="h-5 w-5" />
        </button>
      ) : isPaused ? (
        <button
          onClick={onResume}
          title="Resume reading"
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          <Play className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={onPause}
          title="Pause reading"
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
          <Pause className="h-5 w-5" />
        </button>
      )}

      {/* Stop */}
      {(isPlaying || isPaused) && (
        <button
          onClick={onStop}
          title="Stop reading"
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}>
          <Stop className="h-4 w-4" />
        </button>
      )}

      {/* Progress + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {!isPlaying && !isPaused
              ? "Read lesson aloud"
              : isPaused
                ? "Paused"
                : `Speaking ${activeIndex + 1}/${totalSentences}`}
          </span>
          {isPlaying && (
            <button
              onClick={() => onReplay(activeIndex)}
              title="Replay current sentence"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--color-accent-light)" }}>
              Replay
            </button>
          )}
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              background: isPaused ? "#f59e0b" : "var(--color-accent-gradient)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
