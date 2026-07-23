"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SRSCard {
  id: number;
  vocab_entry: {
    id: number;
    german: string;
    english: string;
    example_sentence?: string | null;
    part_of_speech?: string | null;
  };
  status: string;
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
}

interface SRSStatsData {
  new: number;
  learning: number;
  reviewing: number;
  mastered: number;
  total_due_today: number;
}

const RATING_LABELS = [
  { value: 0, label: "Blackout", shortLabel: "0", bg: "#dc2626", text: "#fca5a5" },
  { value: 1, label: "Wrong", shortLabel: "1", bg: "#ef4444", text: "#fca5a5" },
  { value: 2, label: "Almost", shortLabel: "2", bg: "#f97316", text: "#fed7aa" },
  { value: 3, label: "Hard", shortLabel: "3", bg: "#eab308", text: "#fef08a" },
  { value: 4, label: "Good", shortLabel: "4", bg: "#22c55e", text: "#bbf7d0" },
  { value: 5, label: "Easy", shortLabel: "5", bg: "#16a34a", text: "#bbf7d0" },
];

interface FlashcardReviewerProps {
  onDone?: (stats: SRSStatsData) => void;
}

export function FlashcardReviewer({ onDone }: FlashcardReviewerProps) {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setLoading(true);
    try {
      const data = await api.get<SRSCard[]>("/srs/due");
      setCards(data);
      setCurrentIndex(0);
      setFlipped(false);
      setDone(data.length === 0);
    } catch {
      setCards([]);
      setDone(true);
    }
    setLoading(false);
  }

  async function handleRate(rating: number) {
    const card = cards[currentIndex];
    await api.post("/srs/review", { card_id: card.id, rating });

    if (currentIndex + 1 >= cards.length) {
      setDone(true);
      try {
        const stats = await api.get<SRSStatsData>("/srs/stats");
        onDone?.(stats);
      } catch {
        // Stats refresh is best-effort
      }
    } else {
      setAnimClass("animate-slide-in");
      setTimeout(() => setAnimClass(""), 300);
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
        <p style={{ color: "var(--color-text-muted)" }}>Loading cards...</p>
      </div>
    );
  }

  if (done && cards.length === 0) {
    return null;
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(34,197,94,0.1)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{ color: "var(--color-success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Session Complete!</h2>
        <p className="mb-2" style={{ color: "var(--color-text-muted)" }}>
          You reviewed {cards.length} card{cards.length !== 1 ? "s" : ""}.
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Great work! Keep up the momentum.</p>
        <button
          onClick={loadCards}
          className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:-translate-y-0.5"
          style={{
            color: "var(--color-text)",
            background: "var(--color-accent-gradient)",
            boxShadow: "0 4px 14px var(--color-accent-glow)",
          }}
        >
          Check Again
        </button>
      </div>
    );
  }

  const card = cards[currentIndex];
  const progressPct = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-xl mx-auto" key={currentIndex}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{Math.round(progressPct)}%</span>
        </div>
        <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              background: "var(--color-accent-gradient)",
            }}
          />
        </div>
      </div>

      {/* Flashcard with 3D flip */}
      <div className="perspective-500" style={{ perspective: "800px" }}>
        <div
          onClick={() => !flipped && setFlipped(true)}
          className={`relative cursor-pointer select-none ${!flipped ? "hover:scale-[1.02]" : ""}`}
          style={{
            transition: "transform 0.6s",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "280px",
          }}
        >
          {/* Front */}
          <div
            className="rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center text-center backface-hidden"
            style={{
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              minHeight: "280px",
            }}
          >
            <div className="text-4xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
              {card.vocab_entry.german}
            </div>
            {card.vocab_entry.part_of_speech && (
              <span
                className="text-xs font-medium uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ background: "var(--color-active-bg)", color: "var(--color-active-text)" }}
              >
                {card.vocab_entry.part_of_speech}
              </span>
            )}
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>Tap to reveal</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center text-center backface-hidden"
            style={{
              background: "var(--color-hover-bg)",
              border: "1px solid var(--color-badge-bg)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              transform: "rotateY(180deg)",
              minHeight: "280px",
            }}
          >
            <div className="text-3xl font-bold mb-3" style={{ color: "var(--color-active-text)" }}>
              {card.vocab_entry.english}
            </div>
            {card.vocab_entry.example_sentence && (
              <div className="text-sm italic mt-3 leading-relaxed max-w-sm" style={{ color: "var(--color-text-secondary)" }}>
                &ldquo;{card.vocab_entry.example_sentence}&rdquo;
              </div>
            )}
            <div className="text-xs mt-4 space-x-3" style={{ color: "var(--color-text-muted)" }}>
              <span>Interval: {card.interval_days}d</span>
              <span>&middot;</span>
              <span>Ease: {card.easiness_factor.toFixed(1)}</span>
              <span>&middot;</span>
              <span>Reps: {card.repetitions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-center mb-3" style={{ color: "var(--color-text-muted)" }}>How well did you know this?</p>
          <div className="flex gap-2">
            {RATING_LABELS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRate(r.value)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col items-center gap-0.5"
                style={{
                  background: r.bg,
                  color: "var(--color-text)",
                  boxShadow: `0 4px 12px ${r.bg}40`,
                }}
              >
                <span className="text-base">{r.shortLabel}</span>
                <span className="text-[10px] opacity-90">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
