/**
 * RecoveryBanner — Shows when a recoverable draft is found
 * "We found unsaved progress" with Restore / Dismiss actions
 */

"use client";

interface RecoveryBannerProps {
  message?: string;
  onRestore: () => void;
  onDismiss: () => void;
}

export function RecoveryBanner({
  message = "We found unsaved progress. Would you like to restore it?",
  onRestore,
  onDismiss,
}: RecoveryBannerProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-hover-bg)",
        border: "1px solid var(--color-active-bg)",
        marginBottom: "var(--space-4)",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <p style={{ margin: 0, fontSize: "var(--type-body-sm)", color: "var(--color-text-primary)" }}>
        💾 {message}
      </p>
      <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
        <button
          onClick={onRestore}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--color-accent)",
            color: "#fff",
            fontSize: "var(--type-label-sm)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Restore
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: "6px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-subtle)",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontSize: "var(--type-label-sm)",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
