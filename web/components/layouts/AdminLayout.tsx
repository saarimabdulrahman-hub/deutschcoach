/**
 * AdminLayout — Admin management shell per 03_LAYOUTS/007
 * Admin header, persistent nav, bulk action toolbar, confirmation region
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const ADMIN_NAV = [
  { key: "users", label: "Users", href: "/admin/users", icon: "👥" },
  { key: "roles", label: "Roles", href: "/admin/roles", icon: "🔑" },
  { key: "audit", label: "Audit Log", href: "/admin/audit", icon: "📋" },
  { key: "settings", label: "System", href: "/admin/settings", icon: "⚙️" },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = ADMIN_NAV.find((n) => pathname.startsWith(n.href))?.key || "users";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Admin header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface-1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "20px" }}>🛡️</span>
          <span style={{ fontSize: "var(--type-heading-sm)", fontWeight: 700, color: "var(--color-text-primary)" }}>Admin</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{
        display: "flex", gap: "2px", padding: "var(--space-2) var(--space-3)",
        borderBottom: "1px solid var(--color-border-subtle)",
        overflowX: "auto",
      }} aria-label="Admin navigation">
        {ADMIN_NAV.map((item) => (
          <button key={item.key} onClick={() => router.push(item.href)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "var(--radius-sm)",
              border: "none", whiteSpace: "nowrap",
              background: activeTab === item.key ? "var(--color-hover-bg)" : "transparent",
              color: activeTab === item.key ? "var(--color-accent-text)" : "var(--color-text-secondary)",
              fontSize: "var(--type-body-md)", fontWeight: activeTab === item.key ? 600 : 500,
              cursor: "pointer",
              transition: "all var(--duration-fast) ease",
            }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)" }}>
        {children}
      </main>
    </div>
  );
}
