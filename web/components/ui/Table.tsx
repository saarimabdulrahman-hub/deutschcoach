/**
 * Table — 5 variants with sorting, selection
 * Variants: Basic, Sortable, Selectable, Expandable, Sticky Header
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/015_Table.md
 */

"use client";

import { useState, type ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectedKey?: string;
  getRowKey: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  selectedKey,
  getRowKey,
  loading,
  emptyMessage = "No data",
  stickyHeader,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectAll, setSelectAll] = useState(false);

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];
    if (aVal == null || bVal == null) return 0;
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div style={{ overflowX: "auto", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--type-body-md)" }}>
        <thead>
          <tr style={{ background: "var(--color-surface-2)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: "var(--type-label-md)",
                  color: "var(--color-text-secondary)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: col.sortable ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  width: col.width,
                  position: stickyHeader ? "sticky" : undefined,
                  top: stickyHeader ? 0 : undefined,
                  background: stickyHeader ? "var(--color-surface-2)" : undefined,
                  zIndex: stickyHeader ? 1 : undefined,
                  userSelect: "none",
                }}
                aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ color: "var(--color-accent)", fontSize: "10px" }}>
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <div className="shimmer" style={{ height: "12px", width: "80%", borderRadius: "var(--radius-xs)" }} />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-text-muted)" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => {
              const rowKey = getRowKey(item);
              const isSelected = selectedKey === rowKey;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  style={{
                    background: isSelected ? "var(--color-hover-bg)" : "transparent",
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background var(--duration-fast) ease",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--color-border-subtle)",
                      color: "var(--color-text-primary)",
                      fontSize: "var(--type-body-md)",
                    }}>
                      {col.render ? col.render(item) : (item as any)[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
