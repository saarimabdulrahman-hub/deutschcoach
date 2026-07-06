"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import SignupForm from "@/components/auth/SignupForm";
import { Logo } from "@/components/ui/Logo";

export default function SignupPage() {
  const { user, isLoading, signup } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  async function handleRegister(name: string, email: string, password: string) {
    setError(null);
    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account.";
      setError(message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-page-bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-accent)" }} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div
        className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between py-12 px-12"
        style={{
          background:
            "linear-gradient(160deg, #0a0a0a 0%, #171717 30%, #1a1a1a 60%, #0f0f0f 100%)",
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-250px",
            left: "-120px",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 60%)",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute left-12 top-12"
          style={{
            width: "1px",
            height: "80px",
            background: "linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)",
          }}
        />
        <div className="relative z-10">
          <p className="text-base font-semibold tracking-[2px] uppercase mb-10" style={{ color: "var(--color-text)" }}>
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DeutschFlow
            </span>{" "}
            <span style={{ color: "var(--color-border)" }}>· Est 2026</span>
          </p>
          <div style={{ fontSize: "clamp(6rem, 20vw, 24rem)", lineHeight: 0.82, letterSpacing: "-0.04em" }}>
            <span className="font-extralight" style={{ color: "var(--color-text)" }}>Deutsch</span>
            <br />
            <span className="font-bold" style={{ background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Flow</span>
          </div>
          <div
            className="my-8"
            style={{ width: "56px", height: "1.5px", background: "linear-gradient(135deg, #7c3aed, #f59e0b)" }}
          />
          <p className="text-sm leading-relaxed max-w-[300px]" style={{ color: "var(--color-text-muted)" }}>
            Master German naturally. Structured lessons, smart flashcards, and AI-powered conversation practice.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex gap-[3px] mb-3">
            <div className="h-0.5 rounded-sm" style={{ width: "20px", background: "var(--color-accent-dark)" }} />
            <div className="h-0.5 rounded-sm" style={{ width: "10px", background: "var(--color-border)" }} />
            <div className="h-0.5 rounded-sm" style={{ width: "5px", background: "var(--color-card-bg)" }} />
          </div>
          <p className="text-[11px] tracking-[1.5px] uppercase" style={{ color: "var(--color-border)" }}>
            Learn · Practice · Master
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{ background: "var(--color-page-bg)" }}
      >
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--color-badge-bg)", color: "var(--color-text)" }}
            >
              G
            </div>
            <h1 className="font-bold text-sm tracking-widest uppercase" style={{ color: "var(--color-text)" }}>
              DeutschFlow
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Create your account
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              Start your free 7-day trial. No credit card required.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border text-sm flex items-center gap-3"
              style={{
                background: "var(--color-error-bg)",
                borderColor: "var(--color-error-border)",
                color: "var(--color-error-text)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-error-text)" }} />
              {error}
            </div>
          )}

          <div className="rounded-xl p-8 border shadow-2xl" style={{ background: "var(--color-card-bg)", borderColor: "var(--color-border)" }}>
            <SignupForm onComplete={handleRegister} />
            <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Already have an account?{" "}
              <Link href="/" className="hover:text-indigo-300 font-medium transition-colors" style={{ color: "var(--color-active-text)" }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
