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
            onBlur={(e) => { e.target.style.borderColor = fieldErrors.email ? "var(--color-error-border)" : "var(--color-border)"; e.target.style.boxShadow = "none"; validate(); }}
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
    </>
  );
}
