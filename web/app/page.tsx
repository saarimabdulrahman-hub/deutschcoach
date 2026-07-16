"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard");
  }, [user, isLoading, router]);

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
      {/* ── Left Panel — Brand ───────────────── */}
      <div
        className="hidden sm:flex w-[45%] relative overflow-hidden flex-col justify-between py-8 sm:py-12 px-6 sm:px-12"
        style={{
          background: "linear-gradient(160deg, #0a0a0a 0%, #171717 30%, #1a1a1a 60%, #0f0f0f 100%)",
        }}
      >
        <div className="absolute pointer-events-none"
          style={{ top: "-250px", left: "-120px", width: "600px", height: "600px", background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 60%)", transform: "rotate(-15deg)" }} />
        <div className="absolute left-12 top-12"
          style={{ width: "1px", height: "80px", background: "linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <Logo size={36} />
            <p className="text-xs font-semibold tracking-[3px] uppercase" style={{ color: "var(--color-text-muted)" }}>Est 2026</p>
          </div>
          <div className="text-[72px] leading-[0.95] -tracking-[2px]">
            <span className="font-extralight" style={{ color: "var(--color-text)" }}>Deutsch</span><br />
            <span className="font-bold" style={{ background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Flow</span>
          </div>
          <div className="my-8" style={{ width: "56px", height: "1.5px", background: "linear-gradient(135deg, #7c3aed, #f59e0b)" }} />
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
          <p className="text-[11px] tracking-[1.5px] uppercase" style={{ color: "var(--color-border)" }}>Learn · Practice · Master</p>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ background: "var(--color-page-bg)" }}>
        <div className="w-full max-w-[380px]">
          <div className="sm:hidden flex items-center gap-3 mb-10 justify-center">
            <Logo size={32} />
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>Sign in to continue learning</p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
