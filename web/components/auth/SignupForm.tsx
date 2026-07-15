/**
 * SignupForm — Using canonical Input, PasswordInput, Checkbox, Button
 */

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { AuthDivider } from "./AuthDivider";
import { SocialLoginButtons } from "./SocialLoginButtons";

interface SignupFormProps {
  onComplete: (name: string, email: string, password: string) => void;
}

export default function SignupForm({ onComplete }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(name, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ marginBottom: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Create your account</h1>
        <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "4px 0 0" }}>Start your German learning journey</p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)", fontSize: "var(--type-body-sm)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Input
          name="name"
          label="Full name"
          placeholder="Your full name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
          autoComplete="name"
        />

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

        <PasswordInput
          name="password"
          label="Password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          required
          showStrength
        />

        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={agreeTerms}
          onChange={(e: any) => setAgreeTerms(e.target.checked)}
        />

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ width: "100%" }}>
          Create account
        </Button>
      </form>

      <AuthDivider />

      <SocialLoginButtons />

      <p style={{ textAlign: "center", fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)", margin: 0 }}>
        Already have an account?{' '}
        <Link href="/" style={{ color: "var(--color-accent-text)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
      </p>
    </div>
  );
}
