"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  const { user, isLoading, signup } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard");
  }, [user, isLoading, router]);

  async function handleRegister(name: string, email: string, password: string) {
    setError(null);
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background-primary)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-accent)" }} />
      </div>
    );
  }
  if (user) return null;

  return (
    <AuthLayout
      visualPanel={<AuthVisualPanel />}
      formPanel={
        <div>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)", fontSize: "var(--type-body-sm)", marginBottom: "var(--space-4)" }}>
              {error}
            </div>
          )}
          <SignupForm onComplete={handleRegister} />
        </div>
      }
    />
  );
}
