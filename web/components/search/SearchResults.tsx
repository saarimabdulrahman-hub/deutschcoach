/**
 * SearchResults — Categorized search results
 */

"use client";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "lesson" | "grammar" | "vocabulary" | "chat";
  href: string;
  relevance: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
}

const categoryLabels: Record<string, string> = {
  lesson: "📘 Lessons",
  grammar: "📖 Grammar",
  vocabulary: "🌿 Vocabulary",
  chat: "💬 Chat",
};

export function SearchResults({ results, query, loading, error, onRetry }: SearchResultsProps) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer" style={{ height: "60px", borderRadius: "var(--radius-md)" }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-6)" }}>
        <p style={{ color: "var(--color-error-text)", fontSize: "var(--type-body-md)", margin: 0 }}>{error}</p>
        {onRetry && (
          <button onClick={onRetry} style={{ marginTop: "var(--space-3)", background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: "var(--type-label-sm)", fontWeight: 600 }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
        <span style={{ fontSize: "32px", display: "block", marginBottom: "var(--space-3)" }}>🔍</span>
        <p style={{ fontSize: "var(--type-body-md)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
          No results for "{query}"
        </p>
        <p style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Try a different search term or browse the curriculum.
        </p>
      </div>
    );
  }

  const grouped = results.reduce((acc, r) => {
    (acc[r.category] = acc[r.category] || []).push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div aria-live="polite" aria-label={`${results.length} results for ${query}`} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <p style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", margin: 0 }}>
        {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 style={{ fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, marginBottom: "var(--space-2)" }}>
            {categoryLabels[category] || category}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {items.map((r) => (
              <a key={r.id} href={r.href}
                style={{
                  display: "block", padding: "12px 16px", borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-1)", border: "1px solid var(--color-border-subtle)",
                  textDecoration: "none", transition: "background var(--duration-fast) ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-surface-1)"; }}
              >
                <p style={{ margin: 0, fontSize: "var(--type-body-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>{r.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: "var(--type-body-sm)", color: "var(--color-text-secondary)" }}>{r.description}</p>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
