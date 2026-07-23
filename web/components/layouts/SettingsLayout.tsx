/**
 * SettingsLayout — Two-column settings layout
 * Reference: DeutschFlow Design Bible 03_LAYOUTS/003_Settings_Layout.md
 */

import type { ReactNode } from "react";

interface SettingsLayoutProps {
  navigation: ReactNode;
  content: ReactNode;
  actions?: ReactNode;
}

export function SettingsLayout({ navigation, content, actions }: SettingsLayoutProps) {
  return (
    <div style={{ paddingBottom: "var(--space-8)" }}>
      <div className="settings-layout-row" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <nav className="settings-nav-col" style={{ flexShrink: 0, width: "100%" }}>
          {navigation}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          {content}
          {actions && (
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: "var(--space-3)",
              padding: "var(--space-4) 0", borderTop: "1px solid var(--color-border-subtle)",
              marginTop: "var(--space-4)",
            }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .settings-layout-row { flex-direction: row !important; }
          .settings-nav-col { width: 192px !important; }
        }
      `}</style>
    </div>
  );
}
