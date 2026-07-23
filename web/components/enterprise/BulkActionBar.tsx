/**
 * BulkActionBar — Floating toolbar for multi-select operations
 * Reference: 14_ENTERPRISE_UX_PATTERNS/001_Bulk_Actions.md
 */

"use client";

interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive";
}

interface BulkActionBarProps {
  selectedIds: string[];
  actions: BulkAction[];
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  totalCount?: number;
}

export function BulkActionBar({ selectedIds, actions, onSelectAll, onDeselectAll, totalCount }: BulkActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-3)",
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-accent)",
        boxShadow: "var(--elevation-3)",
        animation: "fadeIn 0.15s ease-out",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "var(--type-body-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
        {selectedIds.length} selected
        {totalCount ? ` of ${totalCount}` : ""}
      </span>

      <div style={{ display: "flex", gap: "2px" }}>
        {onSelectAll && (
          <button onClick={onSelectAll}
            style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-subtle)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "var(--type-label-sm)", cursor: "pointer" }}>
            Select all
          </button>
        )}
        {onDeselectAll && (
          <button onClick={onDeselectAll}
            style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-subtle)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "var(--type-label-sm)", cursor: "pointer" }}>
            Deselect all
          </button>
        )}
      </div>

      <div style={{ width: "1px", height: "20px", background: "var(--color-border-subtle)" }} />

      {actions.map((action) => (
        <button key={action.label} onClick={() => action.onClick(selectedIds)}
          style={{
            padding: "6px 14px", borderRadius: "var(--radius-sm)",
            border: "none", cursor: "pointer",
            fontSize: "var(--type-label-sm)", fontWeight: 600,
            background: action.variant === "destructive" ? "var(--color-error-bg)" : "var(--color-accent)",
            color: action.variant === "destructive" ? "var(--color-error-text)" : "#fff",
          }}>
          {action.label}
        </button>
      ))}
    </div>
  );
}
