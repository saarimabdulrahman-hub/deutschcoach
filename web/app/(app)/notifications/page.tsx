"use client";

import { NotificationFeed } from "@/components/notifications/NotificationFeed";

export default function NotificationsPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: "var(--color-hover-bg)" }}>🔔</div>
        <div>
          <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Notifications</h1>
          <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>Stay up to date with your learning journey</p>
        </div>
      </div>
      <NotificationFeed />
    </div>
  );
}
