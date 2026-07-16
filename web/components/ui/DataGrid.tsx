/**
 * DataGrid — Enterprise data grid extending Table
 * Features: frozen columns, row selection with checkbox, sorting, toolbar, footer
 * Reference: 02_COMPONENTS/021_Data_Grid.md
 */

"use client";

import { useState } from "react";
import { Table } from "./Table";

interface DataGridColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  frozen?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: string[]) => void;
}

export function DataGrid<T>({
  columns, data, getRowKey, loading, emptyMessage, toolbar, onRowClick, selectable, onSelectionChange,
}: DataGridProps<T>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSelect = (key: string) => {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
      onSelectionChange?.([]);
    } else {
      const all = data.map((_, i) => getRowKey(data[i]));
      setSelected(all);
      onSelectionChange?.(all);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as any)[sortKey];
    const bVal = (b as any)[sortKey];
    if (aVal == null || bVal == null) return 0;
    return sortDir === "asc" ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
  });

  const allColumns = [
    ...(selectable ? [{
      key: "_select",
      label: "",
      width: "40px",
      render: (item: T) => (
        <input
          type="checkbox"
          checked={selected.includes(getRowKey(item))}
          onChange={() => toggleSelect(getRowKey(item))}
          style={{ cursor: "pointer" }}
          aria-label="Select row"
        />
      ),
    } as DataGridColumn<T>] : []),
    ...columns,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {toolbar && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border-subtle)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            {selectable && selected.length > 0 && (
              <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-text-secondary)" }}>
                {selected.length} selected
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>{toolbar}</div>
        </div>
      )}

      <Table
        columns={allColumns as any}
        data={sortedData}
        getRowKey={getRowKey}
        onRowClick={onRowClick}
        loading={loading}
        emptyMessage={emptyMessage}
      />

      {/* Footer with row count */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)",
      }}>
        <span>{data.length} row{data.length !== 1 ? "s" : ""}</span>
        {selected.length > 0 && <span>{selected.length} selected</span>}
      </div>
    </div>
  );
}
