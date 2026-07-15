/**
 * LoginForm — Using canonical Input, PasswordInput, Checkbox, Button
 */

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthDivider } from "./AuthDivider";
import { SocialLoginButtons } from "./SocialLoginButtons";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.detail || err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ marginBottom: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Welcome back</h1>
        <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "4px 0 0" }}>Sign in to continue learning</p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)", fontSize: "var(--type-body-sm)" }}>
          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-error-text)", marginRight: "var(--space-2)" }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Input
          name="email"
          variant="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e: any) => { setEmail(e.target.value); setError(null); }}
          required
          autoComplete="email"
        />

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>Password</span>
            <Link href="/forgot-password" style={{ fontSize: "var(--type-label-sm)", fontWeight: 500, color: "var(--color-accent-text)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-subtle)",
              background: "var(--color-surface-1)",
              color: "var(--color-text-primary)",
              fontSize: "var(--type-body-md)",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-border-focus)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border-subtle)"; }}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: "100%" }}>
          Sign in
        </Button>
      </form>

      <AuthDivider />

      <SocialLoginButtons />

      <p style={{ textAlign: "center", fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", margin: 0 }}>
        Don't have an account?{' '}
        <Link href="/signup" style={{ color: "var(--color-accent-text)", fontWeight: 500, textDecoration: "none" }}>Create one</Link>
      </p>
    </div>
  );
}
