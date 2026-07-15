/**
 * PasswordInput — Extends Input with visibility toggle and strength meter
 * Variants: Standard, With strength meter, Confirmation field, Read-only
 * States: Default, Hover, Focus, Filled, Hidden, Visible, Error, Success, Disabled
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/003_Password_Input.md
 */

"use client";

import { useState, useRef, forwardRef, type InputHTMLAttributes } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showStrength?: boolean;
  /** For confirmation fields — compares against this value */
  matchValue?: string;
  error?: string;
  success?: boolean;
  containerClassName?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "var(--color-error)" };
  if (score <= 3) return { score, label: "Fair", color: "var(--color-warning)" };
  if (score <= 4) return { score, label: "Good", color: "#22c55e" };
  return { score, label: "Strong", color: "var(--color-success)" };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength, matchValue, error, success, containerClassName, style, onChange, onFocus, onBlur, ...inputProps }, ref) => {
    const disabled = inputProps.disabled;
    const [visible, setVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const strength = password ? getPasswordStrength(password) : null;
    const matches = matchValue !== undefined ? password === matchValue : null;
    const hasError = !!error;
    const showSuccess = success && !hasError;

    const borderColor = hasError
      ? "var(--color-error-border)"
      : showSuccess
      ? "var(--color-success)"
      : focused
      ? "var(--color-border-focus)"
      : "var(--color-border-subtle)";

    return (
      <div className={containerClassName} style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${borderColor}`,
            background: disabled ? "var(--color-surface-1)" : "var(--color-surface-1)",
            transition: "border-color var(--duration-fast) ease-out",
            minHeight: "40px",
            padding: "0 12px",
            cursor: disabled ? "not-allowed" : "text",
            boxShadow: focused ? "0 0 0 2px var(--color-accent-glow)" : "none",
          }}
        >
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            type={visible ? "text" : "password"}
            disabled={disabled}
            aria-invalid={hasError}
            onChange={(e) => {
              setPassword(e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "var(--type-body-md)",
              color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
              padding: "8px 0",
              minHeight: "24px",
              width: "100%",
              cursor: disabled ? "not-allowed" : "text",
            }}
            {...inputProps}
          />

          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              fontSize: "var(--type-body-md)",
              padding: "4px",
            }}
          >
            {visible ? "🙈" : "👁"}
          </button>
        </div>

        {showStrength && password && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-border-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${((strength?.score ?? 0) / 6) * 100}%`,
                  height: "100%",
                  background: strength?.color,
                  borderRadius: "var(--radius-pill)",
                  transition: "width var(--duration-normal) ease",
                }}
              />
            </div>
            <span style={{ fontSize: "var(--type-label-sm)", color: strength?.color }}>
              {strength?.label}
            </span>
          </div>
        )}

        {matchValue !== undefined && password && (
          <p
            style={{
              fontSize: "var(--type-label-sm)",
              color: matches ? "var(--color-success)" : "var(--color-error-text)",
              margin: 0,
            }}
          >
            {matches ? "Passwords match" : "Passwords do not match"}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
