/**
 * MarketingLayout — Public-facing marketing shell per 03_LAYOUTS/006
 * Full-width sections, no sidebar, hero → features → pricing → FAQ → footer
 */

import type { ReactNode } from "react";
import Link from "next/link";

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div style={{ background: "var(--color-background-primary)", minHeight: "100vh" }}>
      {/* Global header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(3,2,18,0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: "1200px", margin: "0 auto", padding: "12px 24px",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>🇩🇪</span>
            <span style={{ fontSize: "var(--type-heading-sm)", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Deutsch<span style={{ background: "var(--color-accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Coach</span>
            </span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <Link href="/features" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "var(--type-body-sm)", fontWeight: 500 }}>Features</Link>
            <Link href="/pricing" style={{ color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "var(--type-body-sm)", fontWeight: 500 }}>Pricing</Link>
            <Link href="/" style={{
              padding: "8px 20px", borderRadius: "var(--radius-md)",
              background: "var(--color-accent-gradient)", color: "#fff",
              textDecoration: "none", fontSize: "var(--type-body-sm)", fontWeight: 600,
              boxShadow: "0 4px 14px var(--color-accent-glow)",
            }}>Get Started</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--color-border-subtle)", padding: "48px 24px",
        color: "var(--color-text-muted)", fontSize: "var(--type-body-sm)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <p style={{ fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 8px" }}>DeutschCoach</p>
            <p style={{ margin: 0 }}>Master German with confidence.</p>
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            <div><p style={{ fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 8px" }}>Product</p>
              <Link href="/features" style={{ display: "block", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "4px" }}>Features</Link>
              <Link href="/pricing" style={{ display: "block", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "4px" }}>Pricing</Link>
            </div>
            <div><p style={{ fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 8px" }}>Legal</p>
              <a href="#" style={{ display: "block", color: "var(--color-text-muted)", textDecoration: "none", marginBottom: "4px" }}>Privacy</a>
              <a href="#" style={{ display: "block", color: "var(--color-text-muted)", textDecoration: "none" }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
