"use client";
import { useRouter } from "next/navigation";

interface WeakWord { id: number; german: string; english: string; lapses: number; }

export function WeakestWords({ words }: { words: WeakWord[] }) {
  const router = useRouter();

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>🎯 Weakest Words</h3>
        {words.length > 0 && (
          <button onClick={() => router.push("/review")} className="text-xs font-medium hover:underline" style={{ color: "var(--color-accent)" }}>
            Practice all →
          </button>
        )}
      </div>
      {words.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>No weak words yet. Keep going!</p>
      ) : (
        <div className="space-y-2">
          {words.map((word) => (
            <div key={word.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer"
              style={{ background: "var(--color-page-bg)" }} onClick={() => router.push("/review")}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{word.german}</span>
                <span className="text-xs truncate hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>{word.english}</span>
              </div>
              <span className="text-xs font-bold flex-shrink-0 ml-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {word.lapses}×
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
