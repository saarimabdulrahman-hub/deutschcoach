/**
 * SettingsNav — Settings category navigation
 */

"use client";

interface SettingsSection { key: string; label: string; icon: string; }

interface SettingsNavProps {
  sections: SettingsSection[];
  active: string;
  onSelect: (key: string) => void;
}

export function SettingsNav({ sections, active, onSelect }: SettingsNavProps) {
  return (
    <div className="settings-nav-list" style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "4px" }}>
      {sections.map((s) => {
        const isActive = active === s.key;
        return (
          <button key={s.key} onClick={() => onSelect(s.key)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "var(--radius-md)",
              whiteSpace: "nowrap", flexShrink: 0,
              border: isActive ? "1px solid var(--color-accent)" : "1px solid transparent",
              background: isActive ? "var(--color-hover-bg)" : "transparent",
              color: isActive ? (s.key === "account" ? "var(--color-error-text)" : "var(--color-active-text)") : "var(--color-text-secondary)",
              fontSize: "var(--type-body-md)", fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
            }}
          >
            <span>{s.icon}</span>
            <span className="settings-nav-label">{s.label}</span>
          </button>
        );
      })}

      <style>{`
        @media (min-width: 1024px) {
          .settings-nav-list { flex-direction: column; overflow: visible; }
        }
        @media (max-width: 639px) {
          .settings-nav-label { display: none; }
        }
      `}</style>
    </div>
  );
}
