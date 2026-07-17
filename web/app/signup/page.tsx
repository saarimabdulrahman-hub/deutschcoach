"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layouts/AuthLayout";

// ── Spec colors ──────────────────────────────────────────────────────

const C = {
  textSecondary: "#C6C4D3",
  glass: "rgba(22,20,40,0.75)",
  border: "rgba(255,255,255,0.08)",
};

// ── Password strength ────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const score = Math.min(4, Math.floor(password.replace(/[^a-zA-Z0-9]/g, "").length / 2) + (password.length >= 6 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0));
  return (
    <div className="flex gap-[6px]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}
          className="flex-1 rounded-full transition-all"
          style={{
            height: "4px",
            background: i < score ? "linear-gradient(90deg, #EC4899, #A855F7)" : "#3A3552",
          }}
        />
      ))}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    // Play triangle — moved from Smart Flashcards
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6 3.5L16 10L6 16.5V3.5Z" fill="#8B5CF6" stroke="#8B5CF6" strokeWidth="0.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Interactive Lessons",
    desc: "Bite-sized lessons that fit your schedule",
  },
  {
    // Two overlapping cards with content lines + star — new better logo
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="5.5" width="9" height="6.5" rx="1.5" fill="#84CC16" opacity="0.35"/>
        <line x1="6" y1="7.5" x2="11" y2="7.5" stroke="white" strokeWidth="0.5" opacity="0.2"/>
        <line x1="6" y1="9" x2="10" y2="9" stroke="white" strokeWidth="0.5" opacity="0.2"/>
        <rect x="6.5" y="4" width="9" height="6.5" rx="1.5" fill="#A855F7"/>
        <path d="M11 5.5L11.3 6.2L12 6.4L11.5 6.9L11.6 7.6L11 7.3L10.4 7.6L10.5 6.9L10 6.4L10.7 6.2L11 5.5Z" fill="white" opacity="0.9"/>
      </svg>
    ),
    title: "Smart Flashcards",
    desc: "Remember more with spaced repetition",
  },
  {
    // Robot head — instantly recognizable as AI/bot
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5.5" width="14" height="10" rx="3" fill="#A855F7"/>
        <rect x="5" y="3" width="2" height="3" rx="1" fill="#7C3AED"/>
        <rect x="13" y="3" width="2" height="3" rx="1" fill="#7C3AED"/>
        <circle cx="7.5" cy="10" r="1.5" fill="white"/>
        <circle cx="12.5" cy="10" r="1.5" fill="white"/>
        <path d="M7 13.5H13" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: "AI Tutor",
    desc: "Instant answers to your questions",
  },
  {
    // Four ascending bars
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="10" width="2.5" height="7" rx="1.25" fill="#A855F7"/>
        <rect x="7.5" y="6.5" width="2.5" height="10.5" rx="1.25" fill="#C084FC"/>
        <rect x="12" y="4" width="2.5" height="13" rx="1.25" fill="#A855F7"/>
        <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" fill="#C084FC"/>
      </svg>
    ),
    title: "Track Progress",
    desc: "Stay motivated with clear milestones",
  },
];

const BOTTOM_FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 15V3L11 5V13L3 15Z" stroke="#A855F7" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M11 12L16 9L11 6" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "Cancel Anytime",
    desc: "No long-term commitments",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="#B8B5D0" strokeWidth="1.5" fill="none"/>
        <rect x="6" y="14" width="6" height="1" fill="#B8B5D0"/>
      </svg>
    ),
    title: "Learn Anywhere",
    desc: "Desktop, tablet & mobile",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L10.5 6.5H15.5L11.5 9.5L13 14L9 11L5 14L6.5 9.5L2.5 6.5H7.5L9 2Z" stroke="#A855F7" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Expert Content",
    desc: "CEFR-aligned curriculum",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="#8B5CF6" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="6" r="2.5" stroke="#8B5CF6" strokeWidth="1.5" fill="none"/>
        <path d="M2 15C2 12.5 4 10.5 9 10.5C14 10.5 16 12.5 16 15" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "Community",
    desc: "Join 15K+ learners",
  },
];

// ── Page ─────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { user, isLoading, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard");
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsSubmitting(true);
    try {
      await signup(name, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return null;

  return (
    <AuthLayout
      // ── LEFT: Visual Hero ──
      visualPanel={
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Full-bleed screenshot image */}
          <img
            src="/signup-left-panel.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
          />
        </div>
      }
      // ── RIGHT: Form Auth ──
      formPanel={
        <div className="w-full">
          {/* ── Authentication Card ── */}
          <div className="w-full flex flex-col rounded-2xl px-8 pb-8"
            style={{
              gap: "24px",
              background: "var(--color-surface-1, rgba(22,20,40,0.75))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* ── Content Row: Form + Feature Sidebar — both start at top ── */}
            <div className="flex" style={{ gap: "24px", paddingTop: "36px" }}>
              {/* ── Form Column (58%) — includes badge, title, subtitle ── */}
              <div className="flex flex-col" style={{ flex: "0.58 1 0%", gap: "20px" }}>
                <div>
                  {/* Trial Badge — left-to-right gradient shift */}
                  <div className="inline-flex items-center rounded-full mb-4"
                    style={{
                      padding: "8px 14px",
                      background: "linear-gradient(90deg, #110624 0%, #4B1E7A 50%, #110624 100%)",
                      color: "#EC4899",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.8px",
                      border: "1px solid rgba(255,255,255,.12)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,.18)",
                    }}>
                    7-DAY FREE TRIAL
                  </div>
                  {/* Heading */}
                  <h2 className="text-white m-0 leading-tight" style={{ fontSize: "30px", fontWeight: 700 }}>Create your account</h2>
                  {/* Subtitle */}
                  <p className="m-0 mt-1" style={{ fontSize: "17px", color: "#A8A4BC", lineHeight: 1.6 }}>Start your free 7-day trial.<br />No credit card required.</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl text-xs" style={{ background: "rgba(236,73,153,0.1)", border: "1px solid rgba(236,73,153,0.2)", color: "#EC4899" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div>
                    <p className="m-0 mb-2" style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>Full name</p>
                    <div className="flex items-center" style={{ height: "52px", borderRadius: "12px", background: "#121222", border: "1px solid rgba(255,255,255,.08)" }}>
                      <span className="pl-4 pr-3 flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="6" r="3.5" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                          <path d="M2.5 16C2.5 12.5 5.5 10 9 10C12.5 10 15.5 12.5 15.5 16" stroke="#8E889E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        </svg>
                      </span>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                        className="flex-1 bg-transparent text-white text-sm outline-none h-full border-none"
                        style={{ color: "#FFF" }}
                        onFocus={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "#A855F7"; p.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.15)"; }}}
                        onBlur={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "rgba(255,255,255,.08)"; p.style.boxShadow = "none"; }}} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="m-0 mb-2" style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>Email address</p>
                    <div className="flex items-center" style={{ height: "52px", borderRadius: "12px", background: "#121222", border: "1px solid rgba(255,255,255,.08)" }}>
                      <span className="pl-4 pr-3 flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                          <path d="M2 5L9 10L16 5" stroke="#8E889E" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                        </svg>
                      </span>
                      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email"
                        className="flex-1 bg-transparent text-white text-sm outline-none h-full border-none"
                        style={{ color: "#FFF" }}
                        onFocus={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "#A855F7"; p.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.15)"; }}}
                        onBlur={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "rgba(255,255,255,.08)"; p.style.boxShadow = "none"; }}} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <p className="m-0 mb-2" style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>Password</p>
                    <div className="flex items-center" style={{ height: "52px", borderRadius: "12px", background: "#121222", border: "1px solid rgba(255,255,255,.08)" }}>
                      <span className="pl-4 pr-3 flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2.5" y="7.5" width="13" height="9" rx="1.5" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                          <path d="M5.5 7.5V5C5.5 3 6.5 2 9 2C11.5 2 12.5 3 12.5 5V7.5" stroke="#8E889E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        </svg>
                      </span>
                      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)"
                        type={passwordVisible ? "text" : "password"} autoComplete="new-password"
                        className="flex-1 bg-transparent text-white text-sm outline-none h-full border-none"
                        style={{ color: "#FFF" }}
                        onFocus={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "#A855F7"; p.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.15)"; }}}
                        onBlur={(e) => { const p = e.currentTarget.parentElement; if (p) { p.style.borderColor = "rgba(255,255,255,.08)"; p.style.boxShadow = "none"; }}} />
                      <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="p-3 flex-shrink-0 hover:opacity-70 transition-opacity">
                        {passwordVisible ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4C5 4 2 10 2 10C2 10 5 16 10 16C15 16 18 10 18 10C18 10 15 4 10 4Z" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                            <circle cx="10" cy="10" r="3" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                            <line x1="3" y1="3" x2="17" y2="17" stroke="#8E889E" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4C5 4 2 10 2 10C2 10 5 16 10 16C15 16 18 10 18 10C18 10 15 4 10 4Z" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                            <circle cx="10" cy="10" r="3" stroke="#8E889E" strokeWidth="1.5" fill="none"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "12px", color: "#8E889E" }}>Password strength</span>
                          <span style={{ fontSize: "12px", color: password.length < 6 ? "#EC4899" : "#8E889E" }}>
                            {password.length < 6 ? "Too short" : "Good"}
                          </span>
                        </div>
                        <StrengthBar password={password} />
                      </div>
                    )}
                  </div>

                  {/* Primary CTA — silky smooth pink→violet gradient */}
                  <button type="submit" disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 border-none cursor-pointer font-medium"
                    style={{
                      height: "52px",
                      borderRadius: "12px",
                      background: "linear-gradient(90deg, #F43F8E 0%, #EC4899 20%, #D946EF 40%, #C84DE8 60%, #A855F7 80%, #8B5CF6 100%)",
                      color: "#FFF",
                      fontSize: "16px",
                      boxShadow: "0 4px 24px rgba(236,72,153,.25), 0 4px 32px rgba(139,92,246,.2)",
                    }}>
                    Create account
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="#F5F3FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </form>

                {/* Divider — OR */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.06)" }} />
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>OR</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.06)" }} />
                </div>

                {/* Google Button */}
                <button type="button" className="w-full flex items-center justify-center gap-3 cursor-pointer font-medium"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,.08)",
                    color: "#FFF",
                    fontSize: "16px",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.5 10.2C18.5 9.5 18.4 8.8 18.3 8.1H10V12H14.8C14.6 13 14 13.8 13.2 14.3V16H16C17.5 14.6 18.5 12.6 18.5 10.2Z" fill="#4285F4"/>
                    <path d="M10 19C12.2 19 14 18.2 15.4 16.9L12.6 14.8C11.8 15.3 10.9 15.6 10 15.6C7.8 15.6 6 14.1 5.4 12.1H2.3V16.3C3.7 18.8 6.6 19 10 19Z" fill="#34A853"/>
                    <path d="M5.5 12.3C5.3 11.8 5.2 11.2 5.2 10.6C5.2 10 5.3 9.4 5.5 8.9V4.7H2.4C1.6 6.3 1 8.4 1 10.6C1 12.8 1.6 14.9 2.4 16.5L5.5 12.3Z" fill="#FBBC05"/>
                    <path d="M10 5.5C11.2 5.5 12.2 5.9 13.1 6.6L15.8 3.9C14.1 2.3 12.2 1.5 10 1.5C6.6 1.5 3.7 3.7 2.3 6.3L5.5 10.5C6.1 8.3 7.8 5.5 10 5.5Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Login Row */}
                <p className="text-center m-0" style={{ fontSize: "14px", color: "#8E889E" }}>
                  Already have an account?{" "}<Link href="/" className="font-medium" style={{ color: "#A855F7", textDecoration: "none" }}>Log in</Link>
                </p>
              </div>

              {/* ── Feature Column (42%) ── */}
              <div className="flex flex-col" style={{ flex: "0.42 1 0%", gap: "16px" }}>
                {/* Feature List Card */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="px-5 py-3.5"><span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#A855F7" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline mr-1.5 -mt-0.5">
                      <path d="M7 12.5C7 12.5 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.5 2 7 2.5 7 3C7 2.5 7.5 2 8.5 2C10.5 2 12 3.5 12 5.5C12 9.5 7 12.5 7 12.5Z" stroke="#EC4899" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                    </svg>
                    Why learners love us
                  </span></div>
                  {FEATURES.map((item, i) => (
                    <div key={item.title}>
                      <div className="flex items-center gap-3 px-5 py-3.5">
                        {/* Glass icon container — 48×48 */}
                        <div className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "rgba(38,30,70,0.75)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.35), inset 0 0 12px rgba(168,85,247,0.08)",
                          }}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white m-0">{item.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>{item.desc}</p>
                        </div>
                      </div>
                      {i < FEATURES.length - 1 && <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />}
                    </div>
                  ))}
                </div>

                {/* Security Card */}
                <div className="rounded-xl p-5" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "rgba(38,30,70,0.75)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.35), inset 0 0 12px rgba(168,85,247,0.08)",
                      }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2.5L4 5V9.5C4 13.5 6.5 17 10 18.5C13.5 17 16 13.5 16 9.5V5L10 2.5Z" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                        <path d="M8 10.5L9.5 12L12 9" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white">Secure & Private</span>
                    </div>
                  </div>
                  <p className="text-xs m-0 ml-[60px] -mt-1" style={{ color: C.textSecondary }}>Your data is safe with us. We never share your info.</p>
                  <div className="flex items-center gap-2 ml-[60px] mt-1.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1.5" y="4.5" width="9" height="7" rx="1.5" stroke="#6B7280" strokeWidth="1" fill="none"/>
                      <path d="M3.5 4.5V3.5C3.5 2.1 4.5 1 6 1C7.5 1 8.5 2.1 8.5 3.5V4.5" stroke="#6B7280" strokeWidth="1"/>
                      <circle cx="6" cy="8" r="1" fill="#6B7280"/>
                    </svg>
                    <span className="text-xs" style={{ color: "#6B7280" }}>256-bit encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer Feature Strip (24px top padding) ── */}
            <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid grid-cols-4 gap-4">
                {BOTTOM_FEATURES.map((f) => (
                  <div key={f.title} className="flex flex-col items-center gap-2 text-center">
                    {/* Glass icon badge — 40×40 */}
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "rgba(58,38,98,0.55)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.25), inset 0 0 10px rgba(168,85,247,0.06)",
                      }}>
                      {f.icon}
                    </div>
                    <div><p className="text-xs font-semibold text-white m-0 leading-tight">{f.title}</p><p className="text-[10px] m-0 mt-0.5 leading-relaxed" style={{ color: C.textSecondary }}>{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
