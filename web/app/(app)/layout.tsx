"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme, THEME_LIST } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { TabBar } from "@/components/ui/TabBar";
import { CommandBar } from "@/components/ui/CommandBar";
import { Logo } from "@/components/ui/Logo";

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
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* Header bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-[72px] px-4 sm:px-6"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Left: Logo + App name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo size={32} />
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-light tracking-[1px]" style={{ color: "var(--color-text)" }}>
              Deutsch
            </span>
            <span
              className="text-xl font-bold tracking-[1px]"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Flow
            </span>
          </div>
        </div>

        {/* Center: TabBar */}
        <div className="hidden sm:flex flex-1 justify-center">
          <TabBar onOpenCommand={() => setCommandOpen(true)} />
        </div>

        {/* Right: Search button (desktop) + User avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search shortcut — bordered pill */}
          <button
            onClick={() => setCommandOpen(true)}
            title="Search (Ctrl+K)"
            className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)", background: "rgba(255,255,255,0.02)" }}
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
            <span className="opacity-60">Search</span>
            <span
              className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium leading-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)" }}
            >
              Ctrl K
            </span>
          </button>

          {/* Notification bell */}
          <button
            title="Notifications"
            className="relative hidden sm:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "#ec4899", boxShadow: "0 0 8px rgba(236,72,153,0.6)" }}
            >
              3
            </span>
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
                  {THEME_LIST.map((t) => (
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
                  {THEME_LIST.find(t => t.key === theme)?.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden">
        <TabBar onOpenCommand={() => setCommandOpen(true)} />
      </div>

      <CommandBar
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
