/**
 * CitationBubble — Citation display for sourced information
 * Shows inline citation markers in responses.
 */

"use client";

interface Citation {
  number: number;
  title: string;
  source: string;
  url?: string;
}

interface CitationBubbleProps {
  citations: Citation[];
}

export function CitationBubble({ citations }: CitationBubbleProps) {
  if (citations.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border-subtle)",
        fontSize: "var(--type-body-sm)",
        maxWidth: "75%",
      }}
    >
      <p style={{ margin: 0, fontSize: "var(--type-label-sm)", fontWeight: 600, color: "var(--color-text-muted)" }}>
        Sources
      </p>
      {citations.map((c) => (
        <div key={c.number} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
          <span
            style={{
              width: "18px", height: "18px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 700, flexShrink: 0,
              background: "var(--color-active-bg)", color: "var(--color-accent)",
            }}
          >
            {c.number}
          </span>
          <div>
            <p style={{ margin: 0, color: "var(--color-text-primary)", fontWeight: 500 }}>
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                  {c.title}
                </a>
              ) : (
                c.title
              )}
            </p>
            <p style={{ margin: 0, fontSize: "var(--type-caption)", color: "var(--color-text-muted)" }}>
              {c.source}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
