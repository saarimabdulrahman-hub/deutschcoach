/**
 * AuthVisualPanel — Left brand panel for AuthLayout
 * Consistent across login, signup, forgot-password, reset-password
 */

import { Logo } from "@/components/ui/Logo";

export function AuthVisualPanel() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "var(--space-8) var(--space-12)",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #0a0a0a 0%, #171717 30%, #1a1a1a 60%, #0f0f0f 100%)",
      }}
    >
      {/* Metallic sheen */}
      <div
        style={{
          position: "absolute",
          top: "-250px",
          left: "-120px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 60%)",
          transform: "rotate(-15deg)",
          pointerEvents: "none",
        }}
      />

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          left: "var(--space-12)",
          top: "var(--space-12)",
          width: "1px",
          height: "80px",
          background: "linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)",
        }}
      />

      {/* Top */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-10)" }}>
          <Logo size={36} />
          <p style={{ fontSize: "var(--type-label-sm)", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Est 2026
          </p>
        </div>

        <div style={{ fontSize: "72px", lineHeight: 0.95, letterSpacing: "-2px" }}>
          <span style={{ fontWeight: 200, color: "var(--color-text-primary)" }}>Deutsch</span>
          <br />
          <span style={{ fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Flow
          </span>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: "320px" }}>
          Master German with structured lessons, AI-powered conversation practice, and scientifically-proven spaced repetition.
        </p>
      </div>
    </div>
  );
}
