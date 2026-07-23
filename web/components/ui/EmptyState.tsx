/**
 * EmptyState — Canonical primitive component
 * Variants: First-use, No results, Filtered empty, Error recovery
 * Anatomy: Illustration or icon, Title, Supporting text, Primary action, Secondary action
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/019_Empty_State.md
 */

import type { ReactNode } from "react";
import { Button } from "./Button";

type EmptyStateVariant = "first-use" | "no-results" | "filtered-empty" | "error-recovery";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: string;
  title: string;
  description?: string;
  /** Primary action */
  action?: { label: string; onClick: () => void };
  /** Secondary action */
  secondaryAction?: { label: string; onClick: () => void };
  /** Custom children (replaces default illustration area) */
  children?: ReactNode;
}

export function EmptyState({
  variant = "first-use",
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  const defaultIcons: Record<EmptyStateVariant, string> = {
    "first-use": "🚀",
    "no-results": "🔍",
    "filtered-empty": "🔧",
    "error-recovery": "⚠️",
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-9) var(--space-4)",
        textAlign: "center",
      }}
    >
      {children || (
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--space-6)",
            background: "var(--color-hover-bg)",
            fontSize: "36px",
          }}
        >
          {displayIcon}
        </div>
      )}

      <h3
        style={{
          fontSize: "var(--type-heading-sm)",
          fontWeight: 600,
          margin: 0,
          marginBottom: "var(--space-2)",
          color: "var(--color-text-primary)",
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: "var(--type-body-md)",
            color: "var(--color-text-muted)",
            maxWidth: "360px",
            margin: 0,
            marginBottom: "var(--space-6)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        {action && (
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label} →
          </Button>
        )}
        {secondaryAction && (
          <Button variant="tertiary" size="md" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
