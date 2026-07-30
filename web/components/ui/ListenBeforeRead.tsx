/**
 * ListenBeforeRead — hides lesson text until audio playback completes.
 *
 * When active, the section text is replaced by a "Play audio" prompt.
 * After the learner clicks play and the audio finishes, the text is revealed.
 * Supports slow and normal playback speed.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

interface ListenBeforeReadProps {
  text: string;
  lang?: string;
  label?: string;
  children?: React.ReactNode;
  /** Called when the user exits listen-before-read mode. */
  onDone?: () => void;
}

export function ListenBeforeRead({
  text,
  lang = "de-DE",
  label = "Listen before reading",
  children,
  onDone,
}: ListenBeforeReadProps) {
  const { speak, speaking } = useWordSpeech();
  const [mode, setMode] = useState<"hidden" | "playing" | "revealed">("hidden");
  const [slow, setSlow] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handlePlay = useCallback(() => {
    if (speaking) return;
    setMode("playing");
    speak(text, lang, slow, () => {
      if (mountedRef.current) setMode("revealed");
    });
  }, [text, lang, slow, speak, speaking]);

  const handleSlowToggle = useCallback(() => {
    setSlow((s) => !s);
  }, []);

  // Hidden state — show play prompt
  if (mode === "hidden") {
    return (
      <div
        className="rounded-xl p-5 text-center transition-all"
        style={{ background: "rgba(168,85,247,0.04)", border: "1px dashed rgba(168,85,247,0.2)" }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-muted)" }}>
          🎧 {label}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handlePlay}
            disabled={speaking}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer disabled:opacity-40"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
            aria-label="Play audio"
          >
            <SpeakIcon size={18} />
            Play
          </button>
          <button
            onClick={handleSlowToggle}
            className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all border cursor-pointer"
            style={{
              background: slow ? "rgba(168,85,247,0.1)" : "transparent",
              color: slow ? "var(--color-accent-light)" : "var(--color-text-muted)",
              borderColor: slow ? "rgba(168,85,247,0.2)" : "var(--color-border)",
            }}
            aria-label="Toggle slow speed"
          >
            0.5×
          </button>
        </div>
      </div>
    );
  }

  // Playing state — show spinner
  if (mode === "playing") {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{ background: "rgba(168,85,247,0.04)", border: "1px dashed rgba(168,85,247,0.2)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--color-accent)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Listening...</span>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>
          Text will appear automatically
        </p>
      </div>
    );
  }

  // Revealed state — show children (the lesson content) or fallback text
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--color-active-text)" }}>
          <span>📖</span>
          Text revealed
        </span>
        <button
          onClick={() => setMode("hidden")}
          className="text-[11px] underline border-none cursor-pointer"
          style={{ color: "var(--color-text-muted)" }}
        >
          Play again
        </button>
        {onDone && (
          <button
            onClick={onDone}
            className="ml-auto text-[11px] px-2 py-0.5 rounded border-none cursor-pointer"
            style={{ color: "var(--color-text-muted)", background: "rgba(255,255,255,0.04)" }}
            aria-label="Exit listen before read mode"
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
