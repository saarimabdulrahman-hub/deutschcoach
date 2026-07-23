/**
 * HeroSection — Landing page hero with value proposition and CTA
 */

"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section style={{
      textAlign: "center", padding: "80px 24px 60px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "600px",
        background: "radial-gradient(ellipse, rgba(139,70,255,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto" }}>
        <p style={{
          display: "inline-block", padding: "4px 14px", borderRadius: "var(--radius-pill)",
          background: "var(--color-hover-bg)", color: "var(--color-accent-text)",
          fontSize: "var(--type-label-sm)", fontWeight: 600, marginBottom: "var(--space-4)",
        }}>
          🚀 Now in Public Beta
        </p>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800,
          color: "var(--color-text-primary)", margin: "0 0 16px", lineHeight: 1.1,
        }}>
          Master German with<br />
          <span style={{ background: "var(--color-accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            confidence
          </span>
        </h1>

        <p style={{
          fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)",
          maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.6,
        }}>
          Structured lessons, AI-powered conversation practice, and scientifically-proven spaced repetition — everything you need to go from zero to fluent.
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            background: "var(--color-accent-gradient)", color: "#fff",
            textDecoration: "none", fontSize: "var(--type-body-md)", fontWeight: 700,
            boxShadow: "0 4px 20px var(--color-accent-glow)",
          }}>
            Start Learning Free →
          </Link>
          <Link href="/features" style={{
            padding: "14px 32px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)", color: "var(--color-text-secondary)",
            textDecoration: "none", fontSize: "var(--type-body-md)", fontWeight: 600,
          }}>
            See Features
          </Link>
        </div>
      </div>
    </section>
  );
}
