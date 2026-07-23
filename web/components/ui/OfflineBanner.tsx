/**
 * OfflineBanner — Sticky banner when user goes offline
 * Reference: 05_INTERACTION_PATTERNS/009_Offline_And_Sync_Flow.md
 */

"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "8px 16px",
        background: "var(--color-warning)",
        color: "#000",
        fontSize: "var(--type-body-sm)",
        fontWeight: 600,
        textAlign: "center",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      📡 You're offline — changes will sync when you reconnect.
    </div>
  );
}
