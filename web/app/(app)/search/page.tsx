"use client";

import { useMemo } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/useSearch";

// Mock data — replace with API search endpoint
const MOCK_ALL_RESULTS = [
  { id: "l1", title: "A1: Greetings & Introductions", description: "Learn how to say hello, introduce yourself, and say goodbye.", category: "lesson" as const, href: "/curriculum/a1/1", relevance: 95 },
  { id: "l2", title: "A1: Numbers & Counting", description: "Count from 1 to 100 and use numbers in everyday situations.", category: "lesson" as const, href: "/curriculum/a1/2", relevance: 88 },
  { id: "l3", title: "A2: Ordering at a Restaurant", description: "Practice ordering food and drinks in German.", category: "lesson" as const, href: "/curriculum/a2/3", relevance: 82 },
  { id: "g1", title: "Der, Die, Das — German Articles", description: "Understanding grammatical gender in German nouns.", category: "grammar" as const, href: "/grammar/articles", relevance: 90 },
  { id: "g2", title: "Verb Conjugation: Present Tense", description: "How to conjugate regular and irregular verbs.", category: "grammar" as const, href: "/grammar/verb-conjugation", relevance: 85 },
  { id: "v1", title: "Common Greetings", description: "Hallo, Guten Morgen, Tschüss, Auf Wiedersehen", category: "vocabulary" as const, href: "/curriculum/a1/1", relevance: 92 },
  { id: "v2", title: "Food & Drink Vocabulary", description: "der Kaffee, das Wasser, das Brot, der Apfel", category: "vocabulary" as const, href: "/curriculum/a2/3", relevance: 78 },
  { id: "c1", title: "Chat with Emma", description: "Practice a real conversation about ordering at a café.", category: "chat" as const, href: "/chat", relevance: 80 },
];

export default function SearchPage() {
  const { query, setQuery, debouncedQuery, loading, recentSearches, saveRecent } = useSearch();

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return MOCK_ALL_RESULTS
      .filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }, [debouncedQuery]);

  const handleSearch = (q: string) => {
    saveRecent(q);
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0, marginBottom: "var(--space-4)" }}>Search</h1>
        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder="Search lessons, grammar, vocabulary..."
          variant="global"
          loading={loading}
        />
      </div>

      {!debouncedQuery ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {recentSearches.length > 0 && (
            <div>
              <h3 style={{ fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, marginBottom: "var(--space-2)" }}>
                Recent searches
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {recentSearches.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s); saveRecent(s); }}
                    style={{ padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border-subtle)", background: "var(--color-surface-1)", color: "var(--color-text-secondary)", fontSize: "var(--type-label-sm)", cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--type-body-md)", padding: "var(--space-8)" }}>
            Search across lessons, grammar topics, vocabulary, and chat conversations.
          </p>
        </div>
      ) : (
        <SearchResults results={results} query={debouncedQuery} loading={loading} />
      )}
    </div>
  );
}
