/**
 * AuthLayout — Authentication split layout.
 * Desktop: 50/50 split (left visual panel + right form panel)
 * Tablet: 40/60
 * Mobile: single-column form-first
 *
 * Reference: DeutschFlow Design Bible 03_LAYOUTS/001_Authentication_Split_Layout.md
 */

import type { ReactNode } from "react";

interface AuthLayoutProps {
  /** Left panel content (brand, headline, illustration) */
  visualPanel: ReactNode;
  /** Right panel content (form) */
  formPanel: ReactNode;
}

export function AuthLayout({ visualPanel, formPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-background-primary)" }}>
      {/* Left: Visual panel — hidden on mobile, shown on tablet+ */}
      <div className="auth-visual" style={{
        display: "none",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--space-8)",
        position: "relative",
        overflow: "hidden",
      }}>
        {visualPanel}
      </div>

      {/* Right: Form panel — always visible, full-width on mobile */}
      <div className="auth-form" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--space-6)",
        minHeight: "100vh",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {formPanel}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .auth-visual { display: flex; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .auth-visual { flex: 0.4; }
          .auth-form { flex: 0.6; }
        }
        @media (min-width: 1024px) {
          .auth-visual { flex: 0.5; }
          .auth-form { flex: 0.5; }
        }
      `}</style>
    </div>
  );
}
