/**
 * ThemeSwitch — Theme toggle/switcher component
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/009_Theme_Switch.md
 */

"use client";

import { useTheme, THEME_LIST } from "@/contexts/ThemeContext";

interface ThemeSwitchProps {
  variant?: "icon" | "icon-label" | "segmented" | "compact";
}

export function ThemeSwitch({ variant = "icon" }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();
  const current = THEME_LIST.find((t) => t.key === theme);

  if (variant === "compact") {
    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {THEME_LIST.slice(0, 6).map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            title={t.label}
            aria-label={`${t.label} theme${theme === t.key ? " (active)" : ""}`}
            style={{
              width: "20px", height: "20px", borderRadius: "50%",
              border: theme === t.key ? "2px solid var(--color-accent)" : "2px solid transparent",
              background: t.color, cursor: "pointer",
              transition: "all var(--duration-fast) ease",
              transform: theme === t.key ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div style={{
        display: "inline-flex", gap: "2px", padding: "2px",
        borderRadius: "var(--radius-md)", background: "var(--color-surface-1)",
        border: "1px solid var(--color-border-subtle)",
      }}>
        {THEME_LIST.slice(0, 3).map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            style={{
              padding: "6px 14px", borderRadius: "calc(var(--radius-md) - 2px)",
              border: "none", background: theme === t.key ? t.color : "transparent",
              color: theme === t.key ? "#fff" : "var(--color-text-secondary)",
              fontSize: "var(--type-label-sm)", fontWeight: 600, cursor: "pointer",
              transition: "all var(--duration-fast) ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  // Default: icon with optional label
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
      {THEME_LIST.map((t) => {
        const active = theme === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            title={t.label}
            aria-label={`${t.label} theme${active ? " (active)" : ""}`}
            style={{
              width: variant === "icon-label" ? "auto" : "28px",
              height: "28px",
              padding: variant === "icon-label" ? "0 10px" : "0",
              borderRadius: "var(--radius-pill)",
              border: active ? `2px solid ${t.color}` : "2px solid transparent",
              background: active ? t.color : t.color,
              opacity: active ? 1 : 0.4,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "4px", color: "#fff", fontSize: "var(--type-label-sm)", fontWeight: 600,
              transition: "all var(--duration-fast) ease",
              transform: active ? "scale(1.1)" : "scale(1)",
              boxShadow: active ? `0 0 8px ${t.color}66` : "none",
            }}
          >
            {active && <span>✓</span>}
            {variant === "icon-label" && <span>{t.label}</span>}
          </button>
        );
      })}

      {current && (
        <p style={{ width: "100%", margin: "4px 0 0", fontSize: "var(--type-caption)", color: "var(--color-text-muted)", textAlign: "center" }}>
          {current.label}
        </p>
      )}
    </div>
  );
}
