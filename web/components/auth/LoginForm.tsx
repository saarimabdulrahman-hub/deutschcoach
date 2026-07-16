"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
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
    <>
      {error && (
        <div role="alert"
          className="mb-5 p-4 rounded-xl text-sm flex items-center gap-3"
          style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", color: "var(--color-error-text)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-error-text)" }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); setFieldErrors((f) => ({ ...f, email: undefined })); }}
            required
            autoComplete="email"
            autoFocus
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-slate-500"
            style={{
              background: "var(--color-card-bg)",
              border: `1px solid ${fieldErrors.email ? "var(--color-error-border)" : "var(--color-border)"}`,
              color: "var(--color-text)",
            }}
            onFocus={(e) => { e.target.style.borderColor = fieldErrors.email ? "var(--color-error-border)" : "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-active-bg)"; }}
            onBlur={(e) => { e.target.style.borderColor = fieldErrors.email ? "var(--color-error-border)" : "var(--color-border)"; e.target.style.boxShadow = "none"; }}
          />
          {fieldErrors.email && <p id="email-error" role="alert" className="text-xs mt-1.5" style={{ color: "var(--color-error-text)" }}>{fieldErrors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium transition-colors hover:text-indigo-300" style={{ color: "var(--color-active-text)" }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); setFieldErrors((f) => ({ ...f, password: undefined })); }}
              required
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-slate-500"
              style={{
                background: "var(--color-card-bg)",
                border: `1px solid ${fieldErrors.password ? "var(--color-error-border)" : "var(--color-border)"}`,
                color: "var(--color-text)",
              }}
              onFocus={(e) => { e.target.style.borderColor = fieldErrors.password ? "var(--color-error-border)" : "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-active-bg)"; }}
              onBlur={(e) => { e.target.style.borderColor = fieldErrors.password ? "var(--color-error-border)" : "var(--color-border)"; e.target.style.boxShadow = "none"; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {fieldErrors.password && <p id="password-error" role="alert" className="text-xs mt-1.5" style={{ color: "var(--color-error-text)" }}>{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{
            color: "var(--color-text)",
            background: "var(--color-accent-gradient)",
            boxShadow: "0 4px 14px var(--color-accent-glow)",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      </div>

      {/* ── Google OAuth ── */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "transparent",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* ── Signup link ── */}
      <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-muted)" }}>
        New to DeutschFlow?{" "}
        <Link href="/signup" className="font-medium transition-colors hover:text-indigo-300" style={{ color: "var(--color-active-text)" }}>
          Create an account →
        </Link>
      </p>
    </>
  );
}
