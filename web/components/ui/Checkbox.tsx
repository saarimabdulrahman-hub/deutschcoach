/**
 * Checkbox — Canonical primitive component
 * States: Default, Hover, Focus-visible, Active, Checked, Indeterminate, Disabled, Error
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/004_Checkbox.md
 */

"use client";

import { forwardRef, useRef, useEffect, type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Visual only — parent handles the actual indeterminate state via ref */
  indeterminate?: boolean;
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, label, error, disabled, checked, style, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const combinedRef = (node: HTMLInputElement) => {
      (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          ...style,
        }}
      >
        <div style={{ position: "relative", width: "18px", height: "18px" }}>
          <input
            ref={combinedRef}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            aria-checked={indeterminate ? "mixed" : checked}
            aria-invalid={!!error}
            style={{
              position: "absolute",
              opacity: 0,
              width: "100%",
              height: "100%",
              cursor: disabled ? "not-allowed" : "pointer",
              margin: 0,
            }}
            {...props}
          />
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "var(--radius-xs)",
              border: `1px solid ${error ? "var(--color-error-border)" : "var(--color-border-subtle)"}`,
              background: checked || indeterminate ? "var(--color-accent)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--duration-fast) ease-out",
              boxShadow: error ? `0 0 0 1px var(--color-error-border)` : undefined,
            }}
          >
            {indeterminate ? (
              <span style={{ width: "8px", height: "2px", background: "#fff", borderRadius: "1px" }} />
            ) : checked ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
          </div>
        </div>

        {label && (
          <span style={{ fontSize: "var(--type-body-md)", color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)" }}>
            {label}
          </span>
        )}

        {error && (
          <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-error-text)" }}>{error}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
