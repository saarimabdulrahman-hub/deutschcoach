/**
 * VocabCard — Interactive pronunciation and vocabulary card
 *
 * Displays German word with IPA, beginner pronunciation, English meaning,
 * category badge, audio playback with waveform, speaking practice button,
 * card status, and bookmark.
 *
 * Progressive disclosure: primary focus is German word → pronunciation →
 * meaning → Listen → Practice. Everything else is visually secondary.
 *
 * Reference: DeutschFlow Design Bible — Vocabulary Card Redesign
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { useWordSpeech } from "@/hooks/useSpeech";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";

// ── Types ─────────────────────────────────────────────────────────────────

export type CardStatus = "new" | "learning" | "mastered";

export interface VocabCardProps {
  german: string;
  english: string;
  ipa?: string;
  beginnerPron?: string;
  category?: string;
  status?: CardStatus;
  bookmarked?: boolean;
  /** Pronunciation confidence 0–100, or undefined when unavailable */
  mastery?: number;
  onBookmarkToggle?: () => void;
  onPractice?: (word: string) => void;
}

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<CardStatus, { label: string; bg: string; color: string }> = {
  new:       { label: "NEW",       bg: "rgba(59,130,246,0.12)", color: "#60A5FA" },
  learning:  { label: "LEARNING",  bg: "rgba(168,85,247,0.12)", color: "#C084FC" },
  mastered:  { label: "MASTERED",  bg: "rgba(34,197,94,0.12)",  color: "#4ADE80" },
};

// ── Waveform animation ─────────────────────────────────────────────────────

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-[2px]" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 3,
            height: active ? `${Math.max(4, i * 3)}px` : 4,
            background: active ? "var(--color-accent)" : "currentColor",
            opacity: active ? 1 : 0.35,
            transition: "height 0.15s ease, background 0.2s ease, opacity 0.2s ease",
            animationName: active ? "waveform-pulse" : undefined,
            animationDuration: active ? `${0.3 + i * 0.08}s` : undefined,
            animationTimingFunction: active ? "ease-in-out" : undefined,
            animationIterationCount: active ? "infinite" : undefined,
            animationDirection: active ? "alternate" : undefined,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </span>
  );
}

// ── IPA display ────────────────────────────────────────────────────────────

function IpaDisplay({ ipa }: { ipa: string }) {
  return (
    <p className="text-sm font-medium tracking-wide" style={{ color: "#C4B5FD" }}>
      {ipa}
    </p>
  );
}

// ── Beginner pronunciation ────────────────────────────────────────────────

function BeginnerPron({ text }: { text: string }) {
  return (
    <p className="text-xs leading-relaxed" style={{ color: "#A78BFA" }}>
      {text}
    </p>
  );
}

// ── Mastery ring ─────────────────────────────────────────────────
//
// 24px circular progress ring showing pronunciation confidence.
// Defaults to "—" when no data is available (not yet wired to backend).

function MasteryRing({ value }: { value?: number }) {
  const r = 10;
  const circumference = 2 * Math.PI * r;
  const dashOffset = value != null
    ? circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
    : circumference;

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: 24, height: 24 }}
      title={value != null ? `Pronunciation: ${value}%` : "Pronunciation confidence — coming soon"}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Background track */}
        <circle cx="12" cy="12" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        {/* Progress arc */}
        <circle
          cx="12" cy="12" r={r}
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 12 12)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span
        className="absolute text-[8px] font-semibold leading-none"
        style={{ color: "var(--color-text-muted)" }}
      >
        {value != null ? value : "—"}
      </span>
    </span>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────

export function VocabCard({
  german,
  english,
  ipa,
  beginnerPron,
  category,
  status,
  bookmarked = false,
  mastery,
  onBookmarkToggle,
  onPractice,
}: VocabCardProps) {
  const [hovered, setHovered] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const { speak, speaking } = useWordSpeech();
  const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleListen = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (speaking || audioPlaying) return;
    setAudioPlaying(true);
    speak(german, "de-DE");
    // Auto-reset after typical playback duration
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => setAudioPlaying(false), 2000);
  }, [german, speak, speaking, audioPlaying]);

  const handlePractice = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onPractice?.(german);
  }, [german, onPractice]);

  const st = status ? STATUS_STYLE[status] : null;

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: "var(--color-card-bg)",
        border: `1px solid ${hovered ? "rgba(168,85,247,0.35)" : "var(--color-border)"}`,
        boxShadow: hovered
          ? "0 4px 20px rgba(168,85,247,0.1)"
          : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-3 sm:p-4">

        {/* ── Top row: audio + bookmark ── */}
        <div className="flex items-center justify-between mb-2">
          {/* Audio listen button */}
          <button
            onClick={handleListen}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleListen(e); }}
            aria-label={`Listen to ${german}`}
            title="Listen"
            className="relative flex items-center gap-1.5 min-h-[36px] px-2.5 rounded-lg transition-all duration-200 border-none cursor-pointer"
            style={{
              background: audioPlaying ? "rgba(168,85,247,0.1)" : "transparent",
              color: audioPlaying ? "var(--color-accent)" : "var(--color-text-muted)",
              border: "none",
            }}
          >
            {audioPlaying ? (
              <span className="relative flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity={0.6} />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {audioPlaying && (
                  <span className="absolute -inset-1 rounded-full animate-ping" style={{ background: "var(--color-accent)", opacity: 0.15 }} />
                )}
              </span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity={0.6} />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            <Waveform active={audioPlaying} />
          </button>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            {st && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                style={{ background: st.bg, color: st.color }}
              >
                {st.label}
              </span>
            )}
            {/* Bookmark */}
            <button
              onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(); }}
              onKeyDown={(e) => { if (e.key === "Enter") onBookmarkToggle?.(); }}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this word"}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-lg border-none cursor-pointer transition-colors"
              style={{
                background: "transparent",
                color: bookmarked ? "var(--color-accent)" : "var(--color-text-muted)",
                opacity: bookmarked ? 1 : 0.4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── German word ── */}
        <h3
          className="font-semibold leading-tight"
          style={{ fontSize: "24px", color: "var(--color-text)", letterSpacing: "-0.01em" }}
        >
          {german}
        </h3>

        {/* ── IPA pronunciation ── */}
        {ipa && <div className="mt-0.5"><IpaDisplay ipa={ipa} /></div>}

        {/* ── Beginner pronunciation ── */}
        {beginnerPron && <div className="mt-0"><BeginnerPron text={beginnerPron} /></div>}

        {/* ── English meaning ── */}
        <p
          className="mt-1.5 font-medium"
          style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}
        >
          {english}
        </p>

        {/* ── Bottom row: category + actions ── */}
        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>

          {/* Category badge */}
          {category && (
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(168,85,247,0.08)",
                color: "var(--color-accent-light)",
                border: "1px solid rgba(168,85,247,0.12)",
              }}
            >
              {category}
            </span>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Practice button */}
            <button
              onClick={handlePractice}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePractice(e); }}
              aria-label={`Practice saying ${german}`}
              title="Practice"
              className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer flex items-center gap-1.5"
              style={{
                background: "transparent",
                color: "var(--color-accent-light)",
                borderColor: "rgba(168,85,247,0.2)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.08)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8" />
                <path d="M12 4a4 4 0 00-4 4v3a4 4 0 008 0V8a4 4 0 00-4-4z" strokeWidth={2} />
              </svg>
              Practice
            </button>
            {/* Mastery indicator + confidence label (unified ConfidenceBadge) */}
            <ConfidenceBadge
              level={mastery != null ? (mastery >= 75 ? "high" : mastery >= 45 ? "medium" : "low") : null}
              score={mastery}
              size="sm"
            />
            <MasteryRing value={mastery} />
          </div>
        </div>
      </div>

      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes waveform-pulse {
          0% { transform: scaleY(0.6); }
          100% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
