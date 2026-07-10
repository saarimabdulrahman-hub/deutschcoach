"use client";
import { useRouter } from "next/navigation";

interface WeakWord { id: number; german: string; english: string; lapses: number; }

function StrengthBar({ lapses }: { lapses: number }) {
  const strength = Math.max(0, 5 - lapses);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1.5 h-3 rounded-full transition-colors"
          style={{
            background: i <= strength
              ? lapses === 0 ? "#22c55e" : lapses === 1 ? "#f59e0b" : "#ef4444"
              : "var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}

export function WeakestWords({ words }: { words: WeakWord[] }) {
  const router = useRouter();

  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Words to Practice
        </h3>
        {words.length > 0 && (
          <button onClick={() => router.push("/review")} className="text-xs font-medium hover:underline transition-colors" style={{ color: "var(--color-accent-light)" }}>
            Practice all &rarr;
          </button>
        )}
      </div>

      {words.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
            Nothing to review
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Complete a lesson to build your vocabulary
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {words.slice(0, 4).map((word) => (
            <div
              key={word.id}
              onClick={() => router.push("/review")}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.03] group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                  {word.german}
                </span>
                <span className="text-xs truncate hidden sm:inline opacity-60" style={{ color: "var(--color-text-muted)" }}>
                  {word.english}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StrengthBar lapses={word.lapses} />
                <span className="text-[10px] font-bold w-5 text-right" style={{ color: word.lapses > 2 ? "#ef4444" : "var(--color-text-muted)" }}>
                  {word.lapses > 0 ? `${word.lapses}×` : "✓"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
