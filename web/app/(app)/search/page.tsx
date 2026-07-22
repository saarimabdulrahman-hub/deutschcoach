"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchInput } from "@/components/ui/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/useSearch";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "lesson" | "grammar" | "vocabulary" | "chat";
  href: string;
  relevance: number;
}

export default function SearchPage() {
  const { query, setQuery, debouncedQuery, recentSearches, saveRecent } = useSearch();

  const { data: apiResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(debouncedQuery!)}`),
    enabled: !!debouncedQuery && debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  const results = useMemo(() => {
    if (!apiResults) return [];
    return [...apiResults].sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }, [apiResults]);

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
          loading={isLoading}
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
        <SearchResults results={results} query={debouncedQuery} loading={isLoading} />
      )}
    </div>
  );
}
