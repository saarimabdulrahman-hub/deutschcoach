"use client";

/**
 * Emma AI Assistant Panel
 *
 * Persistent AI companion for the quiz experience — provides encouragement,
 * voice playback, and contextual learning tips in a premium glassmorphism card.
 */

interface EmmaAIPanelProps {
  greeting?: string;
  encouragement?: string;
  tip?: string;
  tipHeading?: string;
}

const DEFAULT_GREETINGS = [
  "Hey there!",
  "Hallo!",
  "Willkommen!",
  "Schön dich zu sehen!",
];

const DEFAULT_ENCOURAGEMENTS = [
  "You've got this!",
  "I believe in you!",
  "Take your time, you're doing great!",
  "Keep going, you're on fire!",
];

const DEFAULT_TIPS = [
  "Reading the question carefully before answering helps avoid common mistakes.",
  "Try saying the words out loud — it helps with pronunciation and memory.",
  "Don't worry about mistakes. Every wrong answer is a learning opportunity!",
  "German word order can be tricky. Remember: the verb is always in second position in main clauses.",
];

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function EmmaAIPanel({
  greeting,
  encouragement,
  tip,
  tipHeading = "Emma's Tip",
}: EmmaAIPanelProps) {
  const seed = Date.now();
  const displayGreeting = greeting ?? pickFrom(DEFAULT_GREETINGS, seed);
  const displayEncouragement = encouragement ?? pickFrom(DEFAULT_ENCOURAGEMENTS, seed + 1);
  const displayTip = tip ?? pickFrom(DEFAULT_TIPS, seed + 2);
  return (
    <aside
      className="flex-shrink-0 flex flex-col relative overflow-hidden"
      style={{
        width: "290px",
        borderRadius: "20px",
        padding: "18px 20px",
        background: "linear-gradient(180deg, #17142D 0%, #111322 100%)",
        border: "1px solid rgba(168,85,247,.18)",
        boxShadow: "0 18px 50px rgba(0,0,0,.55), 0 0 40px rgba(168,85,247,.06)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Large radial glow behind Emma */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "340px",
          height: "340px",
          background: "radial-gradient(circle, rgba(168,85,247,.18) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {/* Outer ring glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 16px rgba(139,92,246,.35)",
              transform: "scale(1.15)",
            }}
          />
          <div
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #6D28FF, #A855F7)",
              border: "2px solid #8B5CF6",
              boxShadow: "0 0 20px rgba(139,92,246,.25)",
            }}
          >
            {/* Abstract Emma face inside avatar */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <ellipse cx="11" cy="9" rx="6" ry="7" fill="rgba(255,255,255,.15)" />
              <circle cx="8" cy="8.5" r="1.2" fill="#FFF" />
              <circle cx="14" cy="8.5" r="1.2" fill="#FFF" />
              <path d="M7.5 12 Q11 14 14.5 12" stroke="#FFF" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="min-w-0">
          <h2 className="flex items-center gap-1 m-0" style={{ fontSize: "18px", fontWeight: 700, color: "#FFF", whiteSpace: "nowrap" }}>
            Emma AI
            <span style={{ fontSize: "14px", filter: "drop-shadow(0 0 4px rgba(168,85,247,.4))" }}>✨</span>
          </h2>
          <p className="m-0" style={{ fontSize: "12px", color: "#A1A1AA" }}>Your AI Learning Assistant</p>
        </div>
      </div>

      {/* ── Emma Portrait (~240px) ── */}
      <div
        className="relative flex items-center justify-center z-10"
        style={{ height: "240px" }}
      >
        {/* Neon halo ring */}
        <div className="absolute flex items-center justify-center" style={{ width: "180px", height: "180px" }}>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="absolute">
            <defs>
              <radialGradient id="haloFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168,85,247,.08)" />
                <stop offset="60%" stopColor="rgba(168,85,247,.03)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="90" cy="90" r="87" fill="url(#haloFill)" />
            <circle cx="90" cy="90" r="85" fill="none" stroke="rgba(168,85,247,.15)" strokeWidth="1" />
            <circle cx="90" cy="90" r="82" fill="none" stroke="rgba(168,85,247,.08)" strokeWidth="0.5" strokeDasharray="4 6" />
            <circle
              cx="90" cy="90" r="85"
              fill="none" stroke="#A855F7" strokeWidth="2"
              opacity="0.35"
              strokeDasharray="180 20"
              strokeLinecap="round"
            />
          </svg>

          {/* Halo glow bloom */}
          <div
            className="absolute rounded-full"
            style={{
              width: "200px", height: "200px",
              background: "radial-gradient(circle, rgba(168,85,247,.12) 0%, transparent 60%)",
              transform: "scale(1.1)",
            }}
          />
        </div>

        {/* Floating particles */}
        <span className="absolute" style={{ top: "8%", left: "12%", width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,.35)", boxShadow: "0 0 8px rgba(168,85,247,.3)" }} />
        <span className="absolute" style={{ top: "15%", right: "16%", width: "3px", height: "3px", borderRadius: "50%", background: "rgba(168,85,247,.25)", boxShadow: "0 0 6px rgba(168,85,247,.2)" }} />
        <span className="absolute" style={{ bottom: "20%", left: "10%", width: "5px", height: "5px", borderRadius: "50%", background: "rgba(168,85,247,.2)", boxShadow: "0 0 10px rgba(168,85,247,.15)" }} />
        <span className="absolute" style={{ bottom: "25%", right: "14%", width: "3px", height: "3px", borderRadius: "50%", background: "rgba(168,85,247,.3)", boxShadow: "0 0 6px rgba(168,85,247,.25)" }} />
        <span className="absolute" style={{ top: "50%", left: "6%", width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,.15)", boxShadow: "0 0 8px rgba(168,85,247,.1)" }} />
        <span className="absolute" style={{ top: "45%", right: "8%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(168,85,247,.4)", boxShadow: "0 0 4px rgba(168,85,247,.35)" }} />

        {/* Emma illustration */}
        <div className="relative overflow-hidden rounded-full" style={{ width: "200px", height: "200px", boxShadow: "0 0 60px rgba(168,85,247,.15)" }}>
          <img
            src="/emma-portrait.png"
            alt="Emma AI Assistant"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "drop-shadow(0 0 30px rgba(168,85,247,.25))",
            }}
          />
        </div>
      </div>

      {/* ── Encouragement Bubble ── */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          borderRadius: "16px",
          padding: "16px",
          background: "#221541",
          border: "1px solid rgba(168,85,247,.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {/* Soft purple overlay gradient */}
        <div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,.08), transparent)" }}
        />
        <p className="m-0 relative z-10" style={{ fontSize: "16px", fontWeight: 600, color: "#FFF" }}>
          {displayGreeting} <span style={{ color: "#FACC15" }}>👋</span>
        </p>
        <p className="m-0 mt-1 relative z-10" style={{ fontSize: "15px", fontWeight: 500, color: "#E5E7EB", lineHeight: 1.4 }}>
          {displayEncouragement} <span style={{ color: "#FACC15" }}>💪</span>
        </p>
      </div>

      {/* ── Voice Interaction ── */}
      <div
        className="relative z-10 flex items-center gap-3"
        style={{ padding: "6px 0" }}
      >
        {/* Speaker button — 48×48 */}
        <button
          className="flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#4C1D95",
            border: "none",
            boxShadow: "0 0 20px rgba(168,85,247,.25), inset 0 1px 0 rgba(255,255,255,.08)",
          }}
          onClick={() => {
            // Placeholder: pronunciation TTS would trigger here
          }}
          title="Listen to pronunciation"
        >
          {/* Speaker icon */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M8 7L13 3V19L8 15H4V7H8Z" stroke="#FFF" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M15 8Q18 11 15 14" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>

        {/* Waveform — ~160px */}
        <div
          className="flex-1 flex items-center justify-center gap-[3px]"
          style={{ height: "100%" }}
        >
          {[3, 5, 8, 12, 15, 18, 15, 12, 8, 5, 3, 5, 8, 12, 10, 7, 4, 2].map((h, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: "3px",
                height: `${h}px`,
                background: `linear-gradient(180deg, #8B5CF6, #D946EF)`,
                boxShadow: i >= 6 && i <= 10 ? "0 0 8px rgba(168,85,247,.2)" : "none",
                opacity: 0.7 + (i >= 6 && i <= 10 ? 0.3 : 0),
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Emma's Tip ── */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          borderRadius: "16px",
          padding: "16px",
          background: "#18162E",
          border: "1px solid rgba(255,255,255,.05)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        {/* Header: bulb icon + title */}
        <div className="flex items-center gap-2 mb-2">
          {/* Bulb icon — minimal outline, purple */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <path
              d="M8 2a4.5 4.5 0 00-4.5 4.5c0 1.6.8 3 2 3.9V12a1 1 0 001 1h3a1 1 0 001-1v-1.6c1.2-.9 2-2.3 2-3.9A4.5 4.5 0 008 2z"
              stroke="#A855F7" strokeWidth="1.2" fill="none"
            />
            <line x1="6.5" y1="14" x2="9.5" y2="14" stroke="#A855F7" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#C084FC" }}>{tipHeading}</span>
        </div>

        {/* Tip text */}
        <p
          className="m-0"
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#A7A9B8",
            lineHeight: "20px",
          }}
        >
          {displayTip}
        </p>
      </div>

      {/* Bottom subtle glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, rgba(168,85,247,.03))" }}
      />
    </aside>
  );
}
