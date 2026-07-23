/**
 * Review page configuration — static navigation, instructional, and UI layout data.
 * Data-driven values (counts, stats, user progress) are fetched from the API at runtime.
 */

// ── Main Review Page ──────────────────────────────────────────────────

export const REVIEW_CATEGORIES: { label: string; icon: string; color: string; dashed?: boolean }[] = [
  { label: "Vocabulary", icon: "📝", color: "#38BDF8" },
  { label: "Grammar", icon: "📖", color: "#EC4899" },
  { label: "Phrases", icon: "💬", color: "#38BDF8" },
  { label: "Custom", icon: "+", color: "rgba(255,255,255,.3)", dashed: true },
];

export const KEEP_PRACTICING_ITEMS = [
  { label: "Random Practice", desc: "Mixed exercises", href: "/quiz", gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)", emoji: "🎲" },
  { label: "Weak Words", desc: "Focus on weak vocabulary", href: "/review", gradient: "linear-gradient(135deg, #EC4899, #F43F8E)", emoji: "🎯" },
  { label: "Quiz", desc: "Test knowledge", href: "/quiz", gradient: "linear-gradient(135deg, #22C55E, #16A34A)", emoji: "✅" },
  { label: "Learn New Words", desc: "Start new lesson", href: "/curriculum", gradient: "linear-gradient(135deg, #FB923C, #F97316)", emoji: "📚" },
] as const;

// ── Spaced Repetition ─────────────────────────────────────────────────

export const HOW_IT_WORKS_STEPS = [
  { num: "1", title: "Learn", desc: "New words introduced at optimal intervals." },
  { num: "2", title: "Review", desc: "Recall words actively to strengthen memory." },
  { num: "3", title: "Remember", desc: "Spaced repetition moves to long-term memory." },
] as const;

// ── Flashcards ────────────────────────────────────────────────────────

export const FLASHCARD_QUICK_START = [
  { title: "Review Due Cards", desc: "Continue where you left off", color: "#8B5CF6", emoji: "▶️" },
  { title: "Browse Decks", desc: "Explore all your decks", color: "#EC4899", emoji: "📋" },
  { title: "Create New Deck", desc: "Add your own flashcards", color: "#C026D3", emoji: "➕" },
] as const;

// ── Weak Words ────────────────────────────────────────────────────────

export const WEAK_WORD_STATS = [
  { key: "memoryAccuracy", label: "Memory Accuracy", desc: "Last 30 days" },
  { key: "masteredWords", label: "Mastered Words", desc: "Vocabulary retained" },
  { key: "strongWords", label: "Strong Words", desc: "Never forgotten" },
  { key: "confidence", label: "Learning Confidence", desc: "Based on retention" },
] as const;
