/**
 * Pagination — 3 variants with keyboard navigation
 * Variants: Numeric, Simple Previous/Next, Compact
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/018_Pagination.md
 */

"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "numeric" | "simple" | "compact";
}

export function Pagination({ currentPage, totalPages, onPageChange, variant = "numeric" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    height: "36px",
    padding: "0 8px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border-subtle)",
    background: "var(--color-surface-1)",
    color: "var(--color-text-secondary)",
    fontSize: "var(--type-body-md)",
    cursor: "pointer",
    transition: "all var(--duration-fast) ease",
    userSelect: "none",
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: "var(--color-accent)",
    color: "#fff",
    borderColor: "var(--color-accent)",
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...btnStyle,
    opacity: 0.4,
    cursor: "not-allowed",
  };

  if (variant === "simple") {
    return (
      <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", justifyContent: "center" }}>
        <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} style={currentPage <= 1 ? disabledBtnStyle : btnStyle} aria-label="Previous page">
          ← Previous
        </button>
        <span style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} style={currentPage >= totalPages ? disabledBtnStyle : btnStyle} aria-label="Next page">
          Next →
        </button>
      </nav>
    );
  }

  if (variant === "compact") {
    return (
      <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", justifyContent: "center" }}>
        <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} style={currentPage <= 1 ? disabledBtnStyle : btnStyle} aria-label="Previous">←</button>
        <span style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          {currentPage} / {totalPages}
        </span>
        <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} style={currentPage >= totalPages ? disabledBtnStyle : btnStyle} aria-label="Next">→</button>
      </nav>
    );
  }

  // Numeric — generate page numbers with ellipsis
  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", justifyContent: "center", flexWrap: "wrap" }}>
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} style={currentPage <= 1 ? disabledBtnStyle : btnStyle} aria-label="Previous page">←</button>

      {getPages().map((page, i) =>
        typeof page === "string" ? (
          <span key={`ellipsis-${i}`} style={{ color: "var(--color-text-muted)", padding: "0 4px" }}>…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={page === currentPage ? activeBtnStyle : btnStyle}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        )
      )}

      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} style={currentPage >= totalPages ? disabledBtnStyle : btnStyle} aria-label="Next page">→</button>
    </nav>
  );
}
