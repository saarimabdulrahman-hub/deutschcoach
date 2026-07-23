/**
 * SyncIndicator — Shows pending sync count and sync progress
 * Reference: 05_INTERACTION_PATTERNS/009_Offline_And_Sync_Flow.md
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingCount, flushQueue } from "@/lib/offline/queue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface SyncIndicatorProps {
  /** Called for each queued action — return true on success */
  processAction: (action: any) => Promise<boolean>;
}

export function SyncIndicator({ processAction }: SyncIndicatorProps) {
  const { isOnline } = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<"idle" | "syncing" | "success" | "error">("idle");

  const checkPending = useCallback(() => {
    setPending(getPendingCount());
  }, []);

  useEffect(() => {
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [checkPending]);

  const handleSync = useCallback(async () => {
    if (syncing || pending === 0) return;
    setSyncing(true);
    setResult("syncing");
    const { synced, failed } = await flushQueue(processAction);
    setSyncing(false);
    setPending(getPendingCount());
    setResult(failed > 0 ? "error" : pending === 0 ? "idle" : "success");
    if (synced > 0) setTimeout(() => setResult("idle"), 3000);
  }, [syncing, pending, processAction]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pending > 0) handleSync();
  }, [isOnline, pending, handleSync]);

  if (pending === 0 && result === "idle") return null;

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      title={`${pending} pending change${pending !== 1 ? "s" : ""}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "4px 10px", borderRadius: "var(--radius-pill)",
        border: "1px solid var(--color-border-subtle)",
        background: result === "error" ? "var(--color-error-bg)" : result === "success" ? "rgba(46,213,115,0.1)" : "var(--color-surface-1)",
        color: result === "error" ? "var(--color-error-text)" : result === "success" ? "var(--color-success)" : "var(--color-text-secondary)",
        fontSize: "var(--type-label-sm)", fontWeight: 600, cursor: syncing ? "not-allowed" : "pointer",
      }}
    >
      {syncing ? (
        <span style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid var(--color-accent)", borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
      ) : result === "success" ? (
        "✓"
      ) : result === "error" ? (
        "✕"
      ) : (
        "↻"
      )}
      {syncing ? "Syncing..." : `${pending} pending`}
    </button>
  );
}
