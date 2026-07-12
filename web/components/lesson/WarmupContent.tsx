"use client";

// Warm-up (LESSON_WIREFRAMES Screen 2). Simple recall of prior words —
// a guaranteed early win. At Lesson 1 there's nothing to recall, so this
// shows a short orientation. Renders inside LessonShell's content slot.

interface Props { priorWords?: { german: string; english: string }[]; }

export function WarmupContent({ priorWords }: Props) {
  if (!priorWords?.length) {
    return (
      <div className="max-w-sm mx-auto py-6 text-center">
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>Ready to begin</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          This is your first lesson — no warm-up needed. Let's start fresh.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Quick warm-up — you've seen these
      </p>
      <div className="space-y-3 mt-3">
        {priorWords.slice(0, 3).map((w, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <span className="text-sm font-semibold flex-1" style={{ color: "var(--color-text)" }}>{w.german}</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{w.english}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
