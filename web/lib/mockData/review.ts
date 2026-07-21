/**
 * Review page mock data — single source of truth for all demo content.
 *
 * MIGRATION PATH: Replace each export with a React Query hook that calls the
 * corresponding backend endpoint. The component code stays unchanged — only
 * the import source changes.
 *
 * Example:
 *   // Before (mock):
 *   import { REVIEW_CATEGORIES } from "@/lib/mockData/review";
 *   // After (real):
 *   import { useReviewCategories } from "@/hooks/useReviewData";
 */

// ── Main Review Page ──────────────────────────────────────────────────

export const REVIEW_CATEGORIES: { label: string; icon: string; count: number | null; color: string; dashed?: boolean }[] = [
  { label: "Vocabulary", icon: "📝", count: 9, color: "#38BDF8" },
  { label: "Grammar", icon: "📖", count: 4, color: "#EC4899" },
  { label: "Phrases", icon: "💬", count: 2, color: "#38BDF8" },
  { label: "Custom", icon: "+", count: null, color: "rgba(255,255,255,.3)", dashed: true },
];

export const RECENT_ACTIVITY_ITEMS = [
  { time: "Today", activity: "Reviewed 8 cards", desc: "Vocabulary review session", color: "#EC4899" },
  { time: "Yesterday", activity: "Lesson completed", desc: "A1 Lesson 5: Family & Friends", color: "#84CC16" },
  { time: "2 days ago", activity: "Reviewed 6 cards", desc: "Grammar: Verb conjugation", color: "#EF4444" },
] as const;

export const KEEP_PRACTICING_ITEMS = [
  { label: "Random Practice", desc: "Mixed exercises", href: "/quiz", gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)", emoji: "🎲" },
  { label: "Weak Words", desc: "Focus on weak vocabulary", href: "/review", gradient: "linear-gradient(135deg, #EC4899, #F43F8E)", emoji: "🎯" },
  { label: "Quiz", desc: "Test knowledge", href: "/quiz", gradient: "linear-gradient(135deg, #22C55E, #16A34A)", emoji: "✅" },
  { label: "Learn New Words", desc: "Start new lesson", href: "/curriculum", gradient: "linear-gradient(135deg, #FB923C, #F97316)", emoji: "📚" },
] as const;

// ── Spaced Repetition ─────────────────────────────────────────────────

export const SPACED_REPETITION_QUEUE = [
  { word: "der Fortschritt", trans: "progress", review: "Due now", interval: "1 day", ease: "Hard", easeColor: "#EF4444" },
  { word: "die Gelegenheit", trans: "opportunity", review: "Due now", interval: "1 day", ease: "Medium", easeColor: "#F59E0B" },
  { word: "entwickeln", trans: "develop", review: "Due now", interval: "1 day", ease: "Hard", easeColor: "#EF4444" },
  { word: "Herausforderung", trans: "challenge", review: "Due now", interval: "1 day", ease: "Medium", easeColor: "#F59E0B" },
  { word: "Veränderung", trans: "change", review: "Tomorrow", interval: "2 days", ease: "Easy", easeColor: "#22C55E" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  { num: "1", title: "Learn", desc: "New words introduced at optimal intervals." },
  { num: "2", title: "Review", desc: "Recall words actively to strengthen memory." },
  { num: "3", title: "Remember", desc: "Spaced repetition moves to long-term memory." },
] as const;

export const SR_STATS = [
  { value: "N/A", label: "DAY STREAK", desc: "Keep it going!", source: "streak" },
  { value: "N/A", label: "CARDS MASTERED", desc: "Words you know", source: "mastered" },
  { value: "N/A", label: "RETENTION RATE", desc: "Excellent!", source: "retention" },
  { value: "12", label: "LONGEST STREAK", desc: "days", source: "static" },
] as const;

// ── Flashcards ────────────────────────────────────────────────────────

export const FLASHCARD_QUICK_START = [
  { title: "Review Due Cards", desc: "Continue where you left off", color: "#8B5CF6", emoji: "▶️" },
  { title: "Browse Decks", desc: "Explore all your decks", color: "#EC4899", emoji: "📋" },
  { title: "Create New Deck", desc: "Add your own flashcards", color: "#C026D3", emoji: "➕" },
] as const;

export const RECENTLY_STUDIED_DECKS = [
  { badge: "A1", badgeColor: "#22C55E", title: "A1 Beginner Essentials", sub: "Basic words and phrases", cards: "128", mastery: "92%", masteryColor: "#22C55E", last: "Today" },
  { badge: "A2", badgeColor: "#60A5FA", title: "A2 Everyday German", sub: "Common expressions", cards: "96", mastery: "87%", masteryColor: "#22C55E", last: "Yesterday" },
  { badge: "B1", badgeColor: "#8B5CF6", title: "B1 Intermediate", sub: "Complex conversations", cards: "72", mastery: "79%", masteryColor: "#FACC15", last: "2 days ago" },
  { badge: "★", badgeColor: "#FACC15", title: "Favorites", sub: "Bookmarked flashcards", cards: "34", mastery: "94%", masteryColor: "#22C55E", last: "Today" },
] as const;

// ── Mistakes ──────────────────────────────────────────────────────────

export const MISTAKE_STATS = [
  { value: "48", label: "Total Mistakes", desc: "All time mistakes", color: "#8B5CF6" },
  { value: "16", label: "Needs Review", desc: "High priority words", color: "#EC4899" },
  { value: "87%", label: "Retention Impact", desc: "Mistakes affecting retention", color: "#8B5CF6" },
  { value: "5", label: "Day Streak", desc: "Review streak", color: "#EC4899" },
] as const;

export const MISTAKE_FILTERS = ["All", "High Priority", "Medium", "Low"] as const;

export const MISTAKE_TABLE = [
  { word: "abholen", trans: "to pick up", wrong: "abholen", correct: "abholen", time: "2 days ago", priority: "#EC4899" },
  { word: "die Gelegenheit", trans: "opportunity", wrong: "Gelegenheit", correct: "die Gelegenheit", time: "3 days ago", priority: "#F59E0B" },
  { word: "entwickeln", trans: "to develop", wrong: "entwikeln", correct: "entwickeln", time: "5 days ago", priority: "#EC4899" },
  { word: "die Herausforderung", trans: "challenge", wrong: "Herrausforderung", correct: "Herausforderung", time: "1 week ago", priority: "#22C55E" },
  { word: "die Veränderung", trans: "change", wrong: "Veränderung", correct: "Veränderung", time: "1 week ago", priority: "#F59E0B" },
] as const;

// ── Weak Words ────────────────────────────────────────────────────────

export const WEAK_WORD_STATS = [
  { value: "96%", label: "Memory Accuracy", desc: "Last 30 days" },
  { value: "243", label: "Mastered Words", desc: "Vocabulary retained" },
  { value: "18", label: "Strong Words", desc: "Never forgotten" },
  { value: "Excellent", label: "Learning Confidence", desc: "Based on retention" },
] as const;

export const MEMORY_DISTRIBUTION = [
  { color: "#22C55E", label: "Strong Memory", pct: "82%" },
  { color: "#8B5CF6", label: "Normal", pct: "14%" },
  { color: "#F59E0B", label: "Needs Review", pct: "4%" },
] as const;

// ── Bookmarks ─────────────────────────────────────────────────────────

export const BOOKMARK_ITEMS = [
  { type: "WORD", color: "#7C5CFF", title: "abholen", sub: "to pick up, to collect", content: { type: "example" as const, german: "Ich hole dich morgen ab.", english: "I'll pick you up tomorrow." }, level: "A2", time: "2 days ago" },
  { type: "PHRASE", color: "#EC4899", title: "Ganz deiner Meinung.", sub: "Fully agree with you.", content: { type: "example" as const, german: "Da stimme ich dir voll zu.", english: "I totally agree with you." }, level: "B1", time: "3 days ago" },
  { type: "EXERCISE", color: "#3B82F6", title: "Hörverstehen Übung 4", sub: "Audio comprehension", content: { type: "progress" as const, score: 8, total: 10 }, level: "A1", time: "5 days ago" },
  { type: "GRAMMAR", color: "#F97316", title: "Dativ vs. Akkusativ", sub: "Case usage rules", content: { type: "notes" as const, text: "Dativ answers 'to whom', Akkusativ answers 'whom/what'." }, level: "A2", time: "1 week ago" },
  { type: "WORD", color: "#7C5CFF", title: "vielleicht", sub: "perhaps, maybe", content: { type: "example" as const, german: "Vielleicht komme ich morgen.", english: "Maybe I'll come tomorrow." }, level: "B1", time: "1 week ago" },
] as const;

export const BOOKMARK_COLLECTIONS = [
  "Important Words", "Essential Phrases", "Grammar Rules",
] as const;

export const BOOKMARK_TYPES = [
  { color: "#A855F7", label: "Words", count: "12", pct: "50%" },
  { color: "#EC4899", label: "Phrases", count: "6", pct: "25%" },
  { color: "#3B82F6", label: "Exercises", count: "4", pct: "17%" },
  { color: "#F97316", label: "Grammar", count: "2", pct: "8%" },
] as const;

export const BOOKMARK_ACTIVITY = [
  { title: "Bookmark added", desc: "der Fortschritt", time: "2h ago" },
  { title: "Exercise saved", desc: "Present Tense Quiz", time: "1d ago" },
  { title: "Grammar saved", desc: "Wechselpräpositionen", time: "3d ago" },
] as const;
