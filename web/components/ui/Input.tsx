/**
 * Input — Canonical primitive component
 * Variants: Text, Email, Number, Search, URL, Read-only
 * States: Default, Hover, Focus, Filled, Error, Success, Disabled, Read-only
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/002_Input.md
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputVariant = "text" | "email" | "number" | "search" | "url" | "readonly";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  variant?: InputVariant;
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  /** Leading icon (left side) */
  leadingIcon?: ReactNode;
  /** Trailing action (right side, e.g. visibility toggle) */
  trailingAction?: ReactNode;
  containerClassName?: string;
}

const variantTypeMap: Record<InputVariant, string> = {
  text: "text",
  email: "email",
  number: "number",
  search: "search",
  url: "url",
  readonly: "text",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "text", label, helperText, error, success, leadingIcon, trailingAction, disabled, readOnly, containerClassName, style, ...props }, ref) => {
    const inputType = variantTypeMap[variant];
    const isDisabled = disabled || readOnly || variant === "readonly";
    const hasError = !!error;
    const showSuccess = success && !hasError;

    const borderColor = hasError
      ? "var(--color-error-border)"
      : showSuccess
      ? "var(--color-success)"
      : "var(--color-border-subtle)";

    return (
      <div className={containerClassName} style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
        {label && (
          <label
            style={{
              fontSize: "var(--type-label-md)",
              fontWeight: 600,
              color: isDisabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
            }}
          >
            {label}
          </label>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${borderColor}`,
            background: isDisabled ? "var(--color-surface-1)" : "var(--color-surface-1)",
            transition: "border-color var(--duration-fast) ease-out",
            minHeight: "40px",
            padding: "0 12px",
            cursor: isDisabled ? "not-allowed" : "text",
          }}
        >
          {leadingIcon && (
            <span style={{ color: "var(--color-text-muted)", display: "flex", fontSize: "var(--type-body-md)" }}>
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={isDisabled}
            readOnly={readOnly || variant === "readonly"}
            aria-invalid={hasError}
            aria-describedby={helperText || error ? `${props.name}-helper` : undefined}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "var(--type-body-md)",
              color: isDisabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
              padding: "8px 0",
              minHeight: "24px",
              width: "100%",
              cursor: isDisabled ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              if (!isDisabled) {
                e.currentTarget.closest("div")!.style.borderColor = "var(--color-border-focus)";
                e.currentTarget.closest("div")!.style.boxShadow = "0 0 0 2px var(--color-accent-glow)";
              }
            }}
            onBlur={(e) => {
              const parent = e.currentTarget.closest("div")!;
              parent.style.borderColor = hasError ? "var(--color-error-border)" : showSuccess ? "var(--color-success)" : "var(--color-border-subtle)";
              parent.style.boxShadow = "none";
            }}
            {...props}
          />

          {trailingAction && (
            <span style={{ color: "var(--color-text-muted)", display: "flex" }}>
              {trailingAction}
            </span>
          )}
        </div>

        {(helperText || error) && (
          <p
            id={`${props.name}-helper`}
            role={hasError ? "alert" : undefined}
            style={{
              fontSize: "var(--type-label-sm)",
              color: hasError ? "var(--color-error-text)" : "var(--color-text-tertiary)",
              margin: 0,
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
