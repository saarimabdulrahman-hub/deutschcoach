/**
 * ForgotPasswordForm — With generic success message (no user enumeration)
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface ForgotPasswordFormProps {
  onSent?: () => void;
}

export function ForgotPasswordForm({ onSent }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
    } catch {}
    // Always show success — never reveal if email exists
    setSent(true);
    setLoading(false);
    onSent?.();
  }

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Check your email</h1>
          <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
            If an account with that email exists, we've sent a password reset link.
          </p>
        </div>
        <Link href="/" style={{ color: "var(--color-accent-text)", fontWeight: 500, textDecoration: "none", fontSize: "var(--type-body-md)" }}>
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Reset your password</h1>
        <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "4px 0 0" }}>
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Input
          name="email"
          variant="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: "100%" }}>
          Send Reset Link
        </Button>
      </form>

      <Link href="/" style={{ color: "var(--color-text-muted)", fontWeight: 500, textDecoration: "none", fontSize: "var(--type-body-sm)" }}>
        ← Back to login
      </Link>
    </div>
  );
}
