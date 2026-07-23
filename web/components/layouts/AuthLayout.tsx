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
        flex: "0.5 1 0%",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>
        {visualPanel}
      </div>

      {/* Right: Form panel — always visible, full-width on mobile */}
      <div className="auth-form" style={{
        flex: "0.5 1 0%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--space-4)",
        minHeight: "100vh",
      }}>
        <div style={{ width: "100%" }}>
          {formPanel}
        </div>
      </div>

      <style>{`
        .auth-visual { display: none; }
        @media (min-width: 640px) and (max-width: 1023px) { .auth-visual { display: flex; flex: 0.4 1 0%; } .auth-form { flex: 0.6 1 0%; } }
        @media (min-width: 1024px) { .auth-visual { display: flex; flex: 0.5 1 0%; } .auth-form { flex: 0.5 1 0%; } }
      `}</style>
    </div>
  );
}
