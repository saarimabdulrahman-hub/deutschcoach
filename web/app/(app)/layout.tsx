"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme, type ThemeName } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { TabBar } from "@/components/ui/TabBar";
import { CommandBar } from "@/components/ui/CommandBar";
import { Logo } from "@/components/ui/Logo";

const THEME_DOTS: { key: ThemeName; label: string; color: string }[] = [
  { key: "indigo", label: "Indigo", color: "#6366f1" },
  { key: "ocean", label: "Ocean", color: "#0ea5e9" },
  { key: "steel", label: "Steel", color: "#64748b" },
  { key: "onyx", label: "Onyx", color: "#e5e5e5" },
  { key: "mono", label: "Mono", color: "#a3a3a3" },
  { key: "amber", label: "Amber", color: "#d97706" },
  { key: "sunset", label: "Sunset", color: "#f97316" },
  { key: "copper", label: "Copper", color: "#e6a040" },
  { key: "cherry", label: "Cherry", color: "#dc2626" },
  { key: "rose", label: "Rose", color: "#e11d48" },
  { key: "plum", label: "Plum", color: "#a855f7" },
  { key: "lavender", label: "Lavender", color: "#8b5cf6" },
  { key: "emerald", label: "Emerald", color: "#059669" },
  { key: "forest", label: "Forest", color: "#4ade80" },
  { key: "mint", label: "Mint", color: "#14b8a6" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ctrl+K keyboard shortcut for command bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-page-bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-accent)" }} />
      </div>
    );
  }

  if (!user) return null;

  const initial = (user.name || "U").charAt(0).toUpperCase();

  const handleSignOut = () => {
    setUserMenuOpen(false);
    logout();
    router.push("/");
  };

  const handleSettings = () => {
    setUserMenuOpen(false);
    router.push("/settings");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-page-bg)" }}>
      {/* Header bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Left: Logo + App name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo size={38} />
          <div className="hidden sm:flex items-baseline gap-0.5">
            <span className="text-2xl font-light tracking-[1px]" style={{ color: "var(--color-text)" }}>
              Deutsch
            </span>
            <span
              className="text-2xl font-bold tracking-[1px]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Flow
            </span>
          </div>
        </div>

        {/* Center: TabBar (desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <TabBar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        {/* Right: Search button (desktop) + User avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search shortcut */}
          <button
            onClick={() => setCommandOpen(true)}
            title="Search (Ctrl+K)"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:text-slate-300 hover:bg-white/5 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <span className="opacity-60">Ctrl+K</span>
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: "var(--color-accent-gradient)", color: "var(--color-text)" }}
              >
                {initial}
              </div>
              <span className="text-sm hidden sm:inline max-w-[100px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                {user.name}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--color-text-muted)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl py-1 shadow-lg z-50 animate-slide-in"
                style={{
                  background: "var(--color-card-bg)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
              >
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 hover:text-white transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <div style={{ borderTop: "1px solid var(--color-border)", margin: "4px 0" }} />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 hover:text-red-400 transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
                <div style={{ borderTop: "1px solid var(--color-border)", margin: "4px 0" }} />
                <div className="grid grid-cols-5 gap-1.5 px-3 py-2.5">
                  {THEME_DOTS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      title={t.label}
                      className="w-full aspect-square rounded-full transition-all duration-150 hover:scale-125 flex items-center justify-center"
                      style={{
                        background: t.color,
                        boxShadow: theme === t.key ? `0 0 10px ${t.color}99` : "none",
                        outline: theme === t.key ? `2px solid ${t.color}99` : "none",
                        outlineOffset: "1px",
                      }}
                    >
                      {theme === t.key && (
                        <span style={{ fontSize: "8px", color: t.label === "Onyx" ? "#000" : "#fff" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="px-3 pb-2 text-center" style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
                  {THEME_DOTS.find(t => t.key === theme)?.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden">
        <TabBar onOpenCommand={() => setCommandOpen(true)} />
      </div>

      <CommandBar
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
