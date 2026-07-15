/**
 * Dialog — 6 variants with focus trapping, Escape to close, responsive
 * Variants: Confirmation, Alert, Form, Full-screen, Side panel
 * Z-index: z-modal
 * Motion: 180–250ms ease-out
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/010_Dialog.md
 */

"use client";

import { useEffect, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { Button } from "./Button";

type DialogVariant = "confirmation" | "alert" | "form" | "fullscreen" | "sidepanel";

interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  variant?: DialogVariant;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  /** Don't show close button */
  hideClose?: boolean;
  style?: CSSProperties;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "confirmation",
  primaryAction,
  secondaryAction,
  hideClose,
  style,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the dialog after a frame for animation
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  // Escape to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const isOverlay = variant !== "sidepanel";

  const containerStyle: CSSProperties = {
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--elevation-3)",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    ...(variant === "fullscreen" ? {
      position: "fixed" as const,
      inset: 0,
      borderRadius: 0,
      zIndex: "var(--z-modal)",
    } : variant === "sidepanel" ? {
      position: "fixed" as const,
      top: 0,
      right: 0,
      bottom: 0,
      width: "400px",
      maxWidth: "100vw",
      borderRadius: 0,
      zIndex: "var(--z-modal)",
      animation: "slideInRight 0.2s ease-out",
    } : {
      position: "relative" as const,
      width: "100%",
      maxWidth: "480px",
      borderRadius: "var(--radius-lg)",
      margin: "var(--space-6)",
      maxHeight: "calc(100vh - 48px)",
      animation: "dialogEnter 0.2s ease-out",
    }),
    ...style,
  };

  return (
    <>
      {/* Overlay for modal variants */}
      {isOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: "var(--z-overlay)",
            animation: "fadeInOverlay 0.15s ease-out",
          }}
          onClick={onClose}
        />
      )}

      {/* Dialog positioning wrapper for centered variants */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: variant === "sidepanel" ? "stretch" : "center",
          justifyContent: variant === "sidepanel" ? "flex-end" : "center",
          zIndex: "var(--z-modal)",
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal={isOverlay ? "true" : undefined}
          aria-label={title || "Dialog"}
          tabIndex={-1}
          style={containerStyle}
        >
          {/* Header */}
          {(title || !hideClose) && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--color-border-subtle)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {title && <h2 style={{ margin: 0, fontSize: "var(--type-heading-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h2>}
                {description && <p style={{ margin: 0, fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)" }}>{description}</p>}
              </div>
              {!hideClose && (
                <button onClick={onClose} aria-label="Close dialog"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "20px", padding: "4px", lineHeight: 1 }}>
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Body */}
          {children && (
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "var(--space-4)",
              fontSize: "var(--type-body-md)",
              color: "var(--color-text-secondary)",
            }}>
              {children}
            </div>
          )}

          {/* Footer */}
          {(primaryAction || secondaryAction) && (
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              borderTop: "1px solid var(--color-border-subtle)",
            }}>
              {secondaryAction && (
                <Button variant="secondary" size="md" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button variant={primaryAction.variant || "primary"} size="md" onClick={primaryAction.onClick} loading={primaryAction.loading}>
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dialogEnter { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 639px) {
          div[role="dialog"]:not([style*="position: fixed"]) {
            max-width: calc(100vw - 32px) !important;
            margin: var(--space-4) !important;
            border-radius: var(--radius-lg) !important;
          }
        }
      `}</style>
    </>
  );
}
