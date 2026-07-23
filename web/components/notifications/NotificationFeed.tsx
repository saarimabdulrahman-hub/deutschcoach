/**
 * NotificationFeed — Scrollable notification feed with infinite scroll
 * Uses real data from /dashboard recent_activity + streak, enriched with cards_due_today.
 */

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { NotificationCard } from "./NotificationCard";
import { NotificationFilters } from "./NotificationFilters";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterKey = "all" | "unread" | "read";
const PAGE_SIZE = 20;

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationFeed() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data: dash, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
    staleTime: 60_000,
  });

  // Build real notifications from dashboard data
  const notifications = useMemo(() => {
    const items: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string }[] = [];

    if (dash) {
      // Streak notification
      if (dash.streak > 0) {
        const emoji = dash.streak >= 7 ? "🔥" : dash.streak >= 3 ? "⭐" : "📅";
        items.push({
          id: "streak",
          type: "streak",
          title: `${dash.streak}-day streak! ${emoji}`,
          message: dash.streak >= 7 ? "You're on fire — keep it going!" : "Keep practicing daily to build your streak.",
          read: readIds.has("streak"),
          createdAt: timeAgo(new Date().toISOString()),
        });
      }

      // Cards due
      if (dash.cards_due_today > 0) {
        items.push({
          id: "cards-due",
          type: "review",
          title: "Cards ready for review",
          message: `You have ${dash.cards_due_today} card${dash.cards_due_today !== 1 ? "s" : ""} waiting.`,
          read: readIds.has("cards-due"),
          createdAt: timeAgo(new Date().toISOString()),
        });
      }

      // Recent activity → individual notifications
      (dash.recent_activity || []).forEach((a, i) => {
        const typeMap: Record<string, string> = {
          quiz: "quiz",
          lesson_completed: "lesson",
          review: "review",
          streak: "streak",
        };
        const titleMap: Record<string, string> = {
          quiz: "Quiz completed",
          lesson_completed: "Lesson complete!",
          review: "Review session",
          streak: "Streak update",
        };
        items.push({
          id: `activity-${i}`,
          type: typeMap[a.type] || "system",
          title: titleMap[a.type] || a.type,
          message: a.description,
          read: readIds.has(`activity-${i}`),
          createdAt: timeAgo(a.timestamp),
        });
      });

      // Welcome (always shown if no activity)
      if (items.length === 0) {
        items.push({
          id: "welcome",
          type: "system",
          title: "Welcome to DeutschCoach!",
          message: "Start your first lesson to begin learning German.",
          read: readIds.has("welcome"),
          createdAt: timeAgo(new Date().toISOString()),
        });
      }
    }

    return items.filter((n) => !archivedIds.has(n.id));
  }, [dash, readIds, archivedIds]);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  }).slice(0, page * PAGE_SIZE);

  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
  };

  const handleMarkRead = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  }, []);

  const handleArchive = useCallback((id: string) => {
    setArchivedIds((prev) => new Set(prev).add(id));
  }, []);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((p) => p + 1);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <NotificationFilters active={filter} onChange={setFilter} counts={{ all: 0, unread: 0, read: 0 }} />
        <div style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", padding: "var(--space-8)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 60, borderRadius: 8, marginBottom: i < 3 ? 8 : 0 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <NotificationFilters active={filter} onChange={setFilter} counts={{ all: 0, unread: 0, read: 0 }} />
        <EmptyState variant="first-use" icon="⚠️" title="Could not load notifications" description="Please try again later." />
      </div>
    );
  }

  if (!dash) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <NotificationFilters active={filter} onChange={setFilter} counts={{ all: 0, unread: 0, read: 0 }} />
        <EmptyState variant="first-use" icon="🔔" title="No notifications yet" description="Complete your first lesson to see activity here." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <NotificationFilters active={filter} onChange={setFilter} counts={counts} />

      <div aria-live="polite" aria-label="Notifications feed" style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState
            variant="first-use"
            icon="🔔"
            title="No notifications"
            description={filter === "unread" ? "No unread notifications" : "You're all caught up!"}
          />
        ) : (
          filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={handleMarkRead} onArchive={handleArchive} />
          ))
        )}
        {filtered.length > PAGE_SIZE - 1 && <div ref={loaderRef} style={{ height: "1px" }} />}
      </div>

      {filtered.length < notifications.filter((n) => {
        if (filter === "unread") return !n.read;
        if (filter === "read") return n.read;
        return true;
      }).length && (
        <p style={{ textAlign: "center", fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>
          Scroll for more
        </p>
      )}
    </div>
  );
}
