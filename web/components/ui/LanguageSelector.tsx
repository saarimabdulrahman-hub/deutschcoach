/**
 * LanguageSelector — Language switch component
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/008_Language_Selector.md
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", label: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", native: "日本語", flag: "🇯🇵" },
];

interface LanguageSelectorProps {
  current?: string;
  onSelect?: (code: string) => void;
  variant?: "header" | "settings" | "compact";
}

export function LanguageSelector({ current = "en", onSelect, variant = "header" }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCompact = variant === "compact";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Current language: ${active.label}. Select language.`}
        style={{
          display: "flex", alignItems: "center", gap: "var(--space-2)",
          padding: isCompact ? "4px 8px" : "8px 12px",
          borderRadius: "var(--radius-sm)",
          border: open ? "1px solid var(--color-accent)" : "1px solid transparent",
          background: "transparent",
          color: "var(--color-text-secondary)",
          fontSize: isCompact ? "var(--type-label-sm)" : "var(--type-body-md)",
          cursor: "pointer",
          transition: "all var(--duration-fast) ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <span>{active.flag}</span>
        {!isCompact && <span>{active.native}</span>}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "", transition: "transform var(--duration-fast) ease" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          style={{
            position: "absolute", top: "100%", right: 0, marginTop: "4px",
            minWidth: "180px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-1)",
            boxShadow: "var(--elevation-3)", zIndex: "var(--z-dropdown)",
            overflow: "hidden",
          }}
        >
          {LANGUAGES.map((lang) => {
            const selected = lang.code === current;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={selected}
                onClick={() => { onSelect?.(lang.code); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  width: "100%", padding: "10px 12px",
                  border: "none", background: selected ? "var(--color-hover-bg)" : "transparent",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--type-body-md)", cursor: "pointer", textAlign: "left",
                  transition: "background var(--duration-fast) ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "18px" }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <span>{lang.native}</span>
                  <span style={{ marginLeft: "var(--space-2)", fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>
                    {lang.label}
                  </span>
                </div>
                {selected && <span style={{ color: "var(--color-accent)" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
