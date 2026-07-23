"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, THEME_LIST } from "@/contexts/ThemeContext";
import type { DashboardData } from "@/types";

type Section = "profile" | "learning" | "appearance" | "notifications" | "security" | "subscription" | "account";

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M2.5 16c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg> },
  { key: "learning", label: "Learning", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="3" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: "appearance", label: "Appearance", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { key: "notifications", label: "Notifications", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2.5c-3 0-5 2.5-5 5.5v2L3 13h12l-1-3V8c0-3-2-5.5-5-5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M6.5 13a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg> },
  { key: "subscription", label: "Subscription", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="2" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { key: "security", label: "Security", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l6 4v4c0 3.5-2.5 5.5-6 6-3.5-.5-6-2.5-6-6V6l6-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
  { key: "account", label: "Account", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#EF4444" strokeWidth="1.5" fill="none"/><line x1="6" y1="6" x2="12" y2="12" stroke="#EF4444" strokeWidth="1.5"/></svg> },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-all border-none cursor-pointer flex-shrink-0"
      style={{ background: on ? "linear-gradient(90deg, #6D3BFF, #FF3CA6)" : "rgba(255,255,255,.08)" }}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<Section>("profile");

  const { data: dash } = useQuery<DashboardData>({
    queryKey: ["dashboard"], queryFn: () => api.get("/dashboard"), staleTime: 60_000,
  });

  const { data: srsStats } = useQuery<{ mastered: number; learning: number; reviewing: number; new: number }>({
    queryKey: ["srs-stats"], queryFn: () => api.get("/srs/stats"), staleTime: 60_000,
  });

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dailyGoal, setDailyGoal] = useState(10);
  const [quizSize, setQuizSize] = useState(10);
  const [reminders, setReminders] = useState(true);
  const [notifSettings, setNotifSettings] = useState({ daily: true, lessons: true, review: true, weekly: false, emma: true, email: false });

  useEffect(() => {
    if (user?.settings) {
      setDailyGoal(user.settings.daily_goal_cards ?? 10);
      setQuizSize(user.settings.quiz_size ?? 10);
      setReminders(user.settings.reminders_enabled ?? true);
    }
  }, [user]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try { await api.patch("/user/profile", { settings: { daily_goal_cards: dailyGoal, quiz_size: quizSize, reminders_enabled: reminders, notifications: notifSettings } }); }
      catch { /* silent */ }
    }, 800);
    return () => clearTimeout(t);
  }, [dailyGoal, quizSize, reminders, notifSettings]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg(null);
    try { await api.patch("/user/profile", { name, email }); setMsg({ type: "success", text: "Profile updated." }); }
    catch { setMsg({ type: "error", text: "Failed to update." }); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* ── Header Hero ── */}
      <div className="relative flex items-center justify-between mb-6 overflow-hidden rounded-[20px] p-6" style={{ background: `url('/settings-hero-bg.png') center / cover no-repeat`, border: "1px solid rgba(255,255,255,.04)" }}>
        {/* Purple glow overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,.1), transparent 60%)", pointerEvents: "none" }} />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: "24px" }}>⚙️</span>
            <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#F8FAFC", margin: 0 }}>Settings</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#A4A7B5", margin: 0, maxWidth: "400px", lineHeight: 1.5 }}>Manage your account, learning preferences, security, notifications and subscription.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.15)" }}>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,.3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Profile</p>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E", margin: "2px 0 0" }}>85% Complete</p>
          </div>
          <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.15)" }}>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,.3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Plan</p>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#A855F7", margin: "2px 0 0", textTransform: "capitalize" }}>{(user?.subscription_tier || "free")} {user?.subscription_tier === "free" ? "" : "Plan"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left Sidebar ── */}
        <div className="flex-shrink-0 rounded-[20px] p-3" style={{ width: "100%", maxWidth: "280px", background: "#141827", border: "1px solid rgba(255,255,255,.04)", boxShadow: "0 4px 24px rgba(0,0,0,.12)" }}>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const isActive = active === item.key;
              const isDanger = item.key === "account";
              return (
                <button key={item.key} onClick={() => setActive(item.key)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all border-none cursor-pointer"
                  style={{
                    background: isActive ? (isDanger ? "rgba(239,68,68,.1)" : "linear-gradient(90deg, #6D3BFF, #FF3CA6)") : "transparent",
                    color: isActive ? "#FFF" : "rgba(255,255,255,.4)",
                    boxShadow: isActive && !isDanger ? "0 0 16px rgba(109,59,255,.2)" : "none",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                    transition: "all 150ms ease",
                  }}>
                  <span style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
          {/* Emma AI Assistant */}
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.1)" }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 overflow-hidden" style={{ border: "1px solid rgba(168,85,247,.2)" }}>
              <img src="/emma-avatar.webp" alt="Emma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#FFF", margin: 0 }}>Emma</p>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,.3)", margin: "2px 0 6px" }}>AI Assistant</p>
            <button onClick={() => router.push("/chat")} className="w-full py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)", color: "#FFF" }}>Ask Emma</button>
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ── PROFILE ── */}
          {active === "profile" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(255,255,255,.04)" }}>
              {/* Account Stats */}
              <div className="flex gap-3 mb-6">
                {[
                  { icon: "🔥", value: `${user?.daily_streak ?? dash?.streak ?? 0}`, label: "Day Streak", color: "#F97316" },
                  { icon: "📚", value: `${(srsStats?.mastered ?? 0) + (srsStats?.learning ?? 0) + (srsStats?.reviewing ?? 0)}`, label: "Words Learned", color: "#A855F7" },
                  { icon: "🎯", value: user?.target_level ?? "A1", label: "Beginner", color: "#22C55E" },
                  { icon: "⭐", value: user?.subscription_tier === "pro" ? "Pro" : user?.subscription_tier === "plus" ? "Plus" : user?.subscription_tier === "starter" ? "Starter" : "Free", label: "Member", color: "#FBBF24" },
                ].map((s) => (
                  <div key={s.label} className="flex-1 rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(16,18,32,.5)", border: "1px solid rgba(255,255,255,.04)" }}>
                    <span style={{ fontSize: "20px" }}>{s.icon}</span>
                    <div>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: 0, lineHeight: 1.2 }}>{s.value}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", margin: 0 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: "0 0 16px" }}>Profile</h2>
              {msg && (
                <div className="p-3 rounded-xl text-xs mb-4" style={{ color: msg.type === "success" ? "#22C55E" : "#EF4444", background: msg.type === "success" ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)", border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)"}` }}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: "2px solid rgba(168,85,247,.2)" }}>
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)" }}>
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#FFF" }}>{(user?.name || "U").charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        await api.post("/user/avatar", formData);
                        addToast({ title: "Avatar updated", message: "Your profile picture has been updated.", variant: "success" });
                      } catch {
                        addToast({ title: "Upload failed", message: "Could not upload avatar. Please try again.", variant: "error" });
                      }
                    }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)", background: "transparent" }}>Upload</button>
                </div>
                <InputField label="Full Name" value={name} onChange={setName} />
                <InputField label="Email" value={email} onChange={setEmail} type="email" />
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(90deg, #6D3BFF, #FF3CA6)", color: "#FFF", boxShadow: "0 4px 16px rgba(109,59,255,.25)" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* ── SECURITY ── */}
          {active === "security" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(255,255,255,.04)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: "0 0 16px" }}>Security</h2>
              <div className="space-y-4 max-w-md">
                <InputField label="Current Password" type="password" placeholder="Enter current password" />
                <InputField label="New Password" type="password" placeholder="Enter new password" />
                <InputField label="Confirm Password" type="password" placeholder="Confirm new password" />
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                  <div className="h-full rounded-full" style={{ width: "70%", background: "linear-gradient(90deg, #22C55E, #A855F7)" }} />
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)" }}>Password strength: <span style={{ color: "#22C55E" }}>Good</span></p>
                <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: 0 }}>Two-Factor Authentication</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", margin: "2px 0 0" }}>Add extra security to your account</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ border: "1px solid rgba(168,85,247,.2)", color: "#A855F7", background: "transparent" }}>Enable</button>
                </div>
                {/* Session Management */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,.04)" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: "12px 0 8px" }}>Active Sessions</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", margin: 0, paddingBottom: 8 }}>
                    Session management coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── LEARNING ── */}
          {active === "learning" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(255,255,255,.04)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: "0 0 16px" }}>Learning Preferences</h2>
              <div className="space-y-5 max-w-md">
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Daily Goal</p>
                  <div className="flex gap-2">
                    {[5, 10, 20].map((n) => (
                      <button key={n} onClick={() => setDailyGoal(n)} className="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer"
                        style={{ background: dailyGoal === n ? "linear-gradient(90deg, #6D3BFF, #FF3CA6)" : "rgba(255,255,255,.04)", color: dailyGoal === n ? "#FFF" : "rgba(255,255,255,.35)" }}>
                        {n} words
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Reminder Time</p>
                  <select className="w-full max-w-xs px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(16,18,32,.5)", border: "1px solid rgba(255,255,255,.06)", color: "#FFF" }}>
                    <option>09:00 PM</option><option>12:00 PM</option><option>06:00 PM</option><option>08:00 PM</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Practice Style</p>
                  <div className="space-y-2">
                    {["Vocabulary", "Grammar", "Speaking", "Quiz"].map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked style={{ accentColor: "#A855F7" }} />
                        <span style={{ fontSize: "13px", color: "#FFF" }}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {active === "appearance" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(255,255,255,.04)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: "0 0 16px" }}>Appearance</h2>
              <div className="space-y-5 max-w-md">
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Theme</p>
                  <div className="flex gap-2">
                    {THEME_LIST.filter(t => ["indigo", "purple", "midnight"].includes(t.key) || t.key === "neon").map((t) => (
                      <button key={t.key} onClick={() => setTheme(t.key)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer"
                        style={{ background: theme === t.key ? "linear-gradient(90deg, #6D3BFF, #FF3CA6)" : "rgba(255,255,255,.04)", color: theme === t.key ? "#FFF" : "rgba(255,255,255,.35)" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Accent Color</p>
                  <div className="flex gap-2">
                    {THEME_LIST.slice(0, 5).map((t) => (
                      <button key={t.key} onClick={() => setTheme(t.key)} className="w-8 h-8 rounded-full border-none cursor-pointer transition-transform hover:scale-110"
                        style={{ background: t.color, boxShadow: theme === t.key ? "0 0 0 2px #FFF, 0 0 12px " + t.color : "0 0 0 2px rgba(255,255,255,.05)" }} title={t.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "8px" }}>Motion</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <span style={{ fontSize: "13px", color: "#FFF" }}>Animations</span>
                      <Toggle on={true} onChange={() => {}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === "notifications" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(255,255,255,.04)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#FFF", margin: "0 0 16px" }}>Notifications</h2>
              <div className="space-y-3 max-w-md">
                {[
                  { key: "daily", label: "Lesson Reminder", desc: "Daily practice reminder" },
                  { key: "review", label: "Review Reminder", desc: "When SRS reviews are due" },
                  { key: "weekly", label: "Weekly Report", desc: "Weekly progress summary" },
                  { key: "emma", label: "Emma Messages", desc: "AI tutor insights and tips" },
                  { key: "email", label: "Email Notifications", desc: "Product updates and offers" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(16,18,32,.5)", border: "1px solid rgba(255,255,255,.04)" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFF", margin: 0 }}>{n.label}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", margin: "1px 0 0" }}>{n.desc}</p>
                    </div>
                    <Toggle on={notifSettings[n.key as keyof typeof notifSettings]} onChange={(v) => setNotifSettings({ ...notifSettings, [n.key]: v })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTION ── */}
          {active === "subscription" && (
            <div className="relative flex items-center overflow-hidden rounded-[28px]" style={{ background: "linear-gradient(135deg, #070612 0%, #0C0820 30%, #0A0625 60%, #110630 100%)", border: "1px solid rgba(170,120,255,.35)", boxShadow: "0 8px 40px rgba(0,0,0,.3), 0 0 60px rgba(180,80,255,.08)" }}>
              {/* Background stars */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <span className="absolute" style={{ top: "15%", left: "10%", width: "2px", height: "2px", borderRadius: "50%", background: "#FFF", opacity: 0.3 }} />
                <span className="absolute" style={{ top: "30%", right: "20%", width: "1px", height: "1px", borderRadius: "50%", background: "#FFF", opacity: 0.2 }} />
                <span className="absolute" style={{ bottom: "25%", left: "30%", width: "2px", height: "2px", borderRadius: "50%", background: "#FFF", opacity: 0.25 }} />
              </div>

              {/* Left Content (38%) */}
              <div className="px-8 py-8" style={{ width: "38%", position: "relative", zIndex: 2 }}>
                {/* Crystal icon */}
                <div className="flex items-center justify-center" style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(135deg, #B874FF, #7C2FFF)", boxShadow: "0 0 20px rgba(132,46,255,.3)", marginBottom: "16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 8v3l8 11 8-11V8l-8-6z" stroke="#FFF" strokeWidth="1.5" fill="none"/><path d="M4 8l8 3 8-3" stroke="#FFF" strokeWidth="1.5" fill="none"/></svg>
                </div>
                {/* Heading */}
                <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#FFF", margin: 0, lineHeight: 1.1 }}>
                  Deutsch<span style={{ background: "linear-gradient(90deg, #C96CFF, #8E4DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Coach</span>
                </h2>
                <p style={{ fontSize: "22px", fontWeight: 600, margin: "4px 0 20px", background: "linear-gradient(90deg, #C96CFF, #8E4DFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</p>

                {/* Feature list */}
                <div className="space-y-3 mb-5">
                  {[
                    "Unlimited access to all lessons", "Unlimited reviews", "AI feedback",
                    "Advanced analytics", "Priority support", "Exclusive features",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="rgba(166,85,255,.15)"/><path d="M5.5 9l2.5 2.5 4.5-5" stroke="#A655FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: "14px", color: "#D9D9E5" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,.08)", marginBottom: "16px" }} />

                {/* Renewal */}
                <p style={{ fontSize: "12px", color: "#9B9BB3", margin: "0 0 2px" }}>{user?.subscription_tier === "pro" ? "Renews on" : "Trial ends"}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#FFF", margin: "0 0 20px" }}>
                  {user?.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                </p>

                {/* CTA Button */}
                <button onClick={() => router.push("/pricing")} className="flex items-center gap-3 border-none cursor-pointer" style={{ height: "56px", padding: "0 32px", borderRadius: "14px", background: "linear-gradient(90deg, #7338FF, #FF2FA0)", color: "#FFF", fontSize: "15px", fontWeight: 600, boxShadow: "0 0 40px rgba(190,90,255,.45)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l2 4.5H15l-3.5 3.5L13 15l-5-3.5L3 15l1.5-5L1 6.5h5L8 2z" fill="#FFF"/></svg>
                  Manage Plan
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Right Illustration (62%) — crown bg image */}
              <div className="flex-1 relative flex items-center justify-center" style={{ minHeight: "400px", background: `url('/subscription-crown-bg.png') right center / cover no-repeat` }}>
                {/* Blend gradient — transitions from card bg into image */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #0A0625 0%, rgba(10,6,37,.3) 30%, transparent 50%)", pointerEvents: "none" }} />
                {/* Purple ambient glow */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(168,85,247,.08), transparent 60%)", pointerEvents: "none" }} />
                {/* Pro Badge */}
                <div className="absolute flex items-center justify-center" style={{ top: "12%", right: "8%", padding: "6px 14px", borderRadius: "12px", background: "rgba(255,255,255,.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#A855F7" }}>Pro</span>
                </div>
              </div>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {active === "account" && (
            <div className="rounded-[20px] p-6" style={{ background: "#141827", border: "1px solid rgba(239,68,68,.1)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#EF4444", margin: "0 0 12px" }}>Danger Zone</h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,.4)", marginBottom: "16px" }}>Irreversible actions for your account.</p>
              <div className="space-y-3 max-w-md">
                {[
                  { label: "Export My Data", desc: "Download all your learning data", color: "rgba(255,255,255,.05)", textColor: "rgba(255,255,255,.5)" },
                  { label: "Log Out Everywhere", desc: "Sign out of all devices", color: "rgba(255,255,255,.05)", textColor: "rgba(255,255,255,.5)" },
                  { label: "Delete Account", desc: "Permanently delete your account and all data", color: "rgba(239,68,68,.08)", textColor: "#EF4444" },
                ].map((action) => (
                  <div key={action.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: action.color, border: "1px solid rgba(255,255,255,.04)" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: action.textColor, margin: 0 }}>{action.label}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,.2)", margin: "1px 0 0" }}>{action.desc}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer" style={{ background: "rgba(239,68,68,.1)", color: "#EF4444" }}>{action.label.includes("Delete") ? "Delete" : action.label.includes("Log") ? "Log out" : "Export"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value?: string; onChange?: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,.5)", marginBottom: "6px" }}>{label}</p>
      <input type={type} value={value} onChange={onChange ? e => onChange(e.target.value) : undefined} placeholder={placeholder || label}
        className="w-full px-4 outline-none" style={{ height: "44px", borderRadius: "12px", background: "rgba(16,18,32,.5)", border: "1px solid rgba(255,255,255,.06)", color: "#FFF", fontSize: "13px" }}
        onFocus={e => { e.target.style.borderColor = "#A855F7"; e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,.12)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.06)"; e.target.style.boxShadow = "none"; }} />
    </div>
  );
}
