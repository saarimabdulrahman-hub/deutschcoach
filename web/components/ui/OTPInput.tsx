/**
 * OTPInput — Verification code input with auto-advance and paste support
 * Reference: 13_FORMS_AND_VALIDATION_BIBLE/007_OTP_And_Verification.md
 */

"use client";

import { useRef, useState, useCallback, type ChangeEvent, type ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onResend?: () => void;
  resendTimer?: number;
}

export function OTPInput({
  length = 6, value, onChange, error, disabled, onResend, resendTimer = 0,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);

  const chars = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = useCallback((idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;

    const newChars = [...chars];
    newChars[idx] = val[val.length - 1];
    onChange(newChars.join("").slice(0, length));

    // Auto-advance
    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  }, [chars, length, onChange]);

  const handleKeyDown = useCallback((idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < length - 1) inputsRef.current[idx + 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
  }, [value, length]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  }, [length, onChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el: HTMLInputElement | null) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={chars[i] || ""}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            onFocus={() => setFocusedIdx(i)}
            onBlur={() => setFocusedIdx(-1)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(i, e)}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: "48px", height: "56px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${error ? "var(--color-error-border)" : focusedIdx === i ? "var(--color-border-focus)" : "var(--color-border-subtle)"}`,
              background: disabled ? "var(--color-surface-1)" : "var(--color-surface-1)",
              color: "var(--color-text-primary)",
              fontSize: "var(--type-heading-lg)",
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              boxShadow: focusedIdx === i ? "0 0 0 2px var(--color-accent-glow)" : "none",
              transition: "border-color var(--duration-fast) ease",
            }}
          />
        ))}
      </div>

      {error && <p role="alert" style={{ textAlign: "center", fontSize: "var(--type-label-sm)", color: "var(--color-error-text)", margin: 0 }}>{error}</p>}

      {onResend && (
        <div style={{ textAlign: "center" }}>
          <button onClick={onResend} disabled={resendTimer > 0}
            style={{ background: "none", border: "none", color: resendTimer > 0 ? "var(--color-text-muted)" : "var(--color-accent)", fontSize: "var(--type-label-sm)", cursor: resendTimer > 0 ? "not-allowed" : "pointer" }}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
          </button>
        </div>
      )}
    </div>
  );
}
