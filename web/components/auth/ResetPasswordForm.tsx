/**
 * ResetPasswordForm — With password strength guidance and match validation
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Password reset</h1>
          <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>
        <Link href="/" style={{ color: "var(--color-accent-text)", fontWeight: 500, textDecoration: "none", fontSize: "var(--type-body-md)" }}>
          ← Sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Choose new password</h1>
        <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "4px 0 0" }}>
          Must be at least 6 characters.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)", fontSize: "var(--type-body-sm)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <PasswordInput
          name="password"
          label="New password"
          placeholder="New password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          required
          showStrength
          autoComplete="new-password"
        />

        <PasswordInput
          name="confirmPassword"
          label="Confirm password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e: any) => setConfirmPassword(e.target.value)}
          required
          matchValue={password}
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: "100%" }}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
