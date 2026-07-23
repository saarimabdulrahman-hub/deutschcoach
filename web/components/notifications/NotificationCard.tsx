/**
 * NotificationCard — Individual notification item
 */

"use client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  lesson: "📘", quiz: "✅", review: "🃏", streak: "🔥", system: "ℹ️",
};

export function NotificationCard({ notification, onMarkRead, onArchive }: NotificationCardProps) {
  return (
    <div
      style={{
        display: "flex", gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        borderRadius: "var(--radius-md)",
        background: notification.read ? "transparent" : "var(--color-hover-bg)",
        borderBottom: "1px solid var(--color-border-subtle)",
        transition: "background var(--duration-fast) ease",
      }}
    >
      <span style={{ fontSize: "20px", flexShrink: 0 }}>{typeIcons[notification.type] || "ℹ️"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "var(--type-body-md)", fontWeight: notification.read ? 400 : 600, color: "var(--color-text-primary)" }}>
          {notification.title}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "var(--type-body-sm)", color: "var(--color-text-secondary)" }}>
          {notification.message}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "var(--type-caption)", color: "var(--color-text-muted)" }}>
          {notification.createdAt}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
        {!notification.read && (
          <button onClick={() => onMarkRead(notification.id)}
            style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontSize: "var(--type-label-sm)", padding: "2px 6px" }}>
            Mark read
          </button>
        )}
        <button onClick={() => onArchive(notification.id)}
          style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "var(--type-label-sm)", padding: "2px 6px" }}>
          Archive
        </button>
      </div>
    </div>
  );
}
