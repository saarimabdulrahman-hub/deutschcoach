"use client";

// Speaking stage — optional, scaffolded. Emma integration is a later sprint.
// For now this renders the wireframe's speaking panel with the skip/send structure.
// The primary CTA is always "Skip for now" / "Continue" — speaking is never gated.

interface Props { vocabulary?: string[]; }

export function SpeakingPlaceholder({ vocabulary }: Props) {
  const suggestion = vocabulary?.length ? `Try: ${vocabulary.slice(0, 3).join(", ")}` : "";
  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text)" }}>Practice speaking</p>
      <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
        Use your new words in a short conversation. No mic? Just type.
      </p>
      <div className="mt-4 rounded-2xl p-4 sm:p-5 space-y-3" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Emma: <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>Hallo! Wie heißt du?</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>Type or speak:</span>
          <input placeholder="Ich heiße …"
            className="flex-1 rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--color-page-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          <button className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            Send
          </button>
        </div>
        {suggestion && <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{suggestion}</p>}
        <button className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--color-hover-bg)", color: "var(--color-text-muted)" }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
