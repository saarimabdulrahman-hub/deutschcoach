/**
 * Toast — Notification system with queue management
 * Variants: Success, Information, Warning, Error, Persistent
 * Z-index: z-toast
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/014_Toast_Notification.md
 */

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastVariant = "success" | "info" | "warning" | "error" | "persistent";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  /** Auto-dismiss duration in ms (default: 4000). Set to 0 for persistent */
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const variantStyles: Record<ToastVariant, { icon: string; bg: string; border: string; color: string }> = {
  success: { icon: "✓", bg: "rgba(46,213,115,0.1)", border: "1px solid rgba(46,213,115,0.3)", color: "var(--color-success)" },
  info: { icon: "i", bg: "rgba(77,163,255,0.1)", border: "1px solid rgba(77,163,255,0.3)", color: "var(--color-info)" },
  warning: { icon: "!", bg: "rgba(243,156,18,0.1)", border: "1px solid rgba(243,156,18,0.3)", color: "var(--color-warning)" },
  error: { icon: "✕", bg: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" },
  persistent: { icon: "●", bg: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "var(--color-accent)" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      const dur = toast.duration || 4000;
      setTimeout(() => removeToast(id), dur);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: "fixed",
          top: "var(--space-4)",
          right: "var(--space-4)",
          zIndex: "var(--z-toast)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          maxWidth: "380px",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const vs = variantStyles[toast.variant];
          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                background: vs.bg,
                border: vs.border,
                boxShadow: "var(--elevation-3)",
                pointerEvents: "auto",
                animation: "toastEnter 0.2s ease-out",
              }}
            >
              <span style={{ color: vs.color, fontWeight: 700, flexShrink: 0, fontSize: "var(--type-body-md)" }}>
                {vs.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p style={{ margin: "2px 0 0", fontSize: "var(--type-body-sm)", color: "var(--color-text-secondary)" }}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "14px", padding: "2px", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastEnter { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
