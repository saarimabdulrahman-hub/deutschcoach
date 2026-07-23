"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeName =
  | "neon"
  | "indigo" | "amber" | "emerald" | "rose" | "mono"
  | "ocean" | "sunset" | "forest" | "plum" | "steel"
  | "cherry" | "mint" | "lavender" | "copper" | "onyx";

interface ThemeColors { [key: string]: string; }

/* ── Helper: build a full palette from 5 key colors ── */
function palette(p: {
  bg: string; card: string; border: string;
  accent: string; accentLight: string; accentDark: string;
  accentText: string; text: string; muted: string; secondary: string;
}, gradient?: string): ThemeColors {
  const hoverBg = p.accent.replace(")", ",0.08)").replace("rgb", "rgba");
  const activeBg = p.accent.replace(")", ",0.15)").replace("rgb", "rgba");
  const badgeBg = p.accent.replace(")", ",0.2)").replace("rgb", "rgba");
  const accentGlow = p.accent.replace(")", ",0.25)").replace("rgb", "rgba");
  const accentGradient = gradient || `linear-gradient(135deg, ${p.accentDark}, ${p.accent})`;

  return {
    /* ── Canonical tokens (ThemeContext sets these at runtime) ── */
    "--color-brand-primary": p.accent,
    "--color-brand-secondary": p.accentLight,
    "--color-surface-1": p.card,
    "--color-text-primary": p.text,
    "--color-text-secondary": p.secondary,
    "--color-text-muted": p.muted,
    "--color-border-subtle": p.border,
    "--color-border-focus": p.accent,
    "--color-accent": p.accent,
    "--color-accent-light": p.accentLight,
    "--color-accent-dark": p.accentDark,
    "--color-accent-text": p.accentText,
    "--color-accent-gradient": accentGradient,
    "--color-accent-glow": accentGlow,
    "--color-hover-bg": hoverBg,
    "--color-active-bg": activeBg,
    "--color-active-text": p.accentText,
    "--color-badge-bg": badgeBg,
    "--color-badge-text": p.accentText,
    "--color-success": "#2ED573",
    "--color-warning": "#F39C12",
    "--color-info": "#4DA3FF",
    "--color-error": "#FF6B77",
    "--color-error-bg": "rgba(255, 71, 87, 0.1)",
    "--color-error-border": "rgba(255, 71, 87, 0.2)",
    "--color-error-text": "#FF6B77",
    "--color-skeleton": p.border,
  };
}

const THEMES: Record<ThemeName, ThemeColors> = {
  // ── 0. Neon (DeutschFlow synthwave — default) ──
  neon: palette({ bg: "#030212", card: "rgba(20,14,45,0.62)", border: "rgba(190,170,240,0.16)",
    accent: "#8b5cf6", accentLight: "#d946ef", accentDark: "#7c3aed",
    accentText: "#e9d5ff", text: "#ffffff", muted: "#94a3b8", secondary: "rgba(255,255,255,0.78)" },
    "linear-gradient(135deg, #ec4899, #d946ef, #8b5cf6)"),

  // ── 1. Indigo ──
  indigo: palette({ bg: "#0f172a", card: "#1e293b", border: "#334155",
    accent: "#6366f1", accentLight: "#818cf8", accentDark: "#4f46e5",
    accentText: "#a5b4fc", text: "#f1f5f9", muted: "#64748b", secondary: "#94a3b8" }),

  // ── 2. Amber ──
  amber: palette({ bg: "#0c0a09", card: "#1c1917", border: "#292524",
    accent: "#d97706", accentLight: "#f59e0b", accentDark: "#b45309",
    accentText: "#fbbf24", text: "#fafaf9", muted: "#78716c", secondary: "#a8a29e" }),

  // ── 3. Emerald ──
  emerald: palette({ bg: "#022c22", card: "#064e3b", border: "#065f46",
    accent: "#059669", accentLight: "#10b981", accentDark: "#047857",
    accentText: "#34d399", text: "#ecfdf5", muted: "#6ee7b7", secondary: "#34d399" }),

  // ── 4. Rose ──
  rose: palette({ bg: "#0f0009", card: "#1f0018", border: "#3b002e",
    accent: "#e11d48", accentLight: "#f43f5e", accentDark: "#be123c",
    accentText: "#fda4af", text: "#fff1f2", muted: "#9f5468", secondary: "#be7c91" }),

  // ── 5. Mono ──
  mono: palette({ bg: "#0a0a0a", card: "#171717", border: "#262626",
    accent: "#737373", accentLight: "#a3a3a3", accentDark: "#525252",
    accentText: "#d4d4d4", text: "#fafafa", muted: "#737373", secondary: "#a3a3a3" }),

  // ── 6. Ocean ──
  ocean: palette({ bg: "#0a1628", card: "#132342", border: "#1e3a5f",
    accent: "#0ea5e9", accentLight: "#38bdf8", accentDark: "#0284c7",
    accentText: "#7dd3fc", text: "#f0f9ff", muted: "#7aa2c7", secondary: "#94b8d8" }),

  // ── 7. Sunset ──
  sunset: palette({ bg: "#1a0f0a", card: "#2a1810", border: "#442a1a",
    accent: "#f97316", accentLight: "#fb923c", accentDark: "#ea580c",
    accentText: "#fdba74", text: "#fff7ed", muted: "#b08968", secondary: "#c4956e" }),

  // ── 8. Forest ──
  forest: palette({ bg: "#0d1a0d", card: "#1a2f1a", border: "#2d4a2d",
    accent: "#4ade80", accentLight: "#86efac", accentDark: "#22c55e",
    accentText: "#86efac", text: "#f0fdf4", muted: "#6b9e6b", secondary: "#7eb87e" }),

  // ── 9. Plum ──
  plum: palette({ bg: "#150a1a", card: "#251430", border: "#3d1f4d",
    accent: "#a855f7", accentLight: "#c084fc", accentDark: "#9333ea",
    accentText: "#c4b5fd", text: "#faf5ff", muted: "#8b6b9e", secondary: "#a07bb8" }),

  // ── 10. Steel ──
  steel: palette({ bg: "#0f1117", card: "#1a1d27", border: "#2d3140",
    accent: "#64748b", accentLight: "#94a3b8", accentDark: "#475569",
    accentText: "#cbd5e1", text: "#f8fafc", muted: "#64748b", secondary: "#94a3b8" }),

  // ── 11. Cherry ──
  cherry: palette({ bg: "#1a0a0a", card: "#2d1515", border: "#4a2020",
    accent: "#dc2626", accentLight: "#ef4444", accentDark: "#b91c1c",
    accentText: "#f87171", text: "#fef2f2", muted: "#9b5c5c", secondary: "#b87a7a" }),

  // ── 12. Mint ──
  mint: palette({ bg: "#0a1a17", card: "#152e28", border: "#1f453b",
    accent: "#14b8a6", accentLight: "#5eeadb", accentDark: "#0d9488",
    accentText: "#5eeadb", text: "#f0fdfa", muted: "#5c9e93", secondary: "#74b8ae" }),

  // ── 13. Lavender ──
  lavender: palette({ bg: "#14101a", card: "#221f2e", border: "#383347",
    accent: "#8b5cf6", accentLight: "#a78bfa", accentDark: "#7c3aed",
    accentText: "#c4b5fd", text: "#f5f3ff", muted: "#8b83a8", secondary: "#a49dc0" }),

  // ── 14. Copper ──
  copper: palette({ bg: "#140d08", card: "#241a10", border: "#3d2d1a",
    accent: "#d97706", accentLight: "#e6a040", accentDark: "#b45309",
    accentText: "#e6a040", text: "#fdf6ee", muted: "#a0856a", secondary: "#c09e7e" }),

  // ── 15. Onyx ──
  onyx: palette({ bg: "#000000", card: "#0d0d0d", border: "#1f1f1f",
    accent: "#e5e5e5", accentLight: "#fafafa", accentDark: "#a3a3a3",
    accentText: "#ffffff", text: "#fafafa", muted: "#808080", secondary: "#a3a3a3" }),
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("neon");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeName | null;
    if (stored && THEMES[stored]) setThemeState(stored);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    const colors = THEMES[t];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  useEffect(() => {
    const colors = THEMES[theme];
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEMES };

// Derived list of themes for UI pickers — single source of truth
export const THEME_LIST: { key: ThemeName; label: string; color: string }[] = [
  { key: "neon", label: "Neon", color: "#d946ef" },
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
