"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorageUsage, clearOfflineData } from "@/lib/offline/indexedDb";
import { useSync } from "@/hooks/useSync";

// Storage Dashboard (Section 12.5). Displays offline cache usage, auto-manage
// toggle, and clear cache action.

export function StorageDashboard() {
  const [audioCacheBytes, setAudioCacheBytes] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [checkpointCount, setCheckpointCount] = useState(0);
  const [autoManage, setAutoManage] = useState(true);
  const [clearing, setClearing] = useState(false);
  const { syncing, lastSynced, performSync } = useSync();

  const refresh = useCallback(async () => {
    const usage = await getStorageUsage();
    setAudioCacheBytes(usage.audioCacheBytes);
    setLessonCount(usage.lessonCount);
    setCheckpointCount(usage.checkpointCount);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleClear = async () => {
    setClearing(true);
    await clearOfflineData();
    await refresh();
    setClearing(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
        💾 Offline Storage
      </h3>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>Audio cache</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>{formatBytes(audioCacheBytes)}</span>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>Cached lessons</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>{lessonCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>Pending checkpoints</span>
          <span className="font-medium" style={{ color: checkpointCount > 0 ? "#FBBF24" : "var(--color-text)" }}>{checkpointCount}</span>
        </div>
        {lastSynced && (
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>Last synced</span>
            <span>{lastSynced.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Auto-manage toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Auto-manage storage</span>
          <button
            onClick={() => setAutoManage((a) => !a)}
            className="relative w-10 h-5 rounded-full transition-all border-none cursor-pointer"
            style={{
              background: autoManage ? "var(--color-accent-gradient)" : "var(--color-border)",
            }}
            aria-label="Toggle auto-manage"
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: autoManage ? "22px" : "2px" }}
            />
          </button>
        </label>

        {/* Sync button */}
        <button
          onClick={performSync}
          disabled={syncing}
          className="w-full min-h-[36px] rounded-lg text-xs font-medium border-none cursor-pointer disabled:opacity-40 transition-all"
          style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
        >
          {syncing ? "Syncing…" : "Sync now"}
        </button>

        {/* Clear cache */}
        <button
          onClick={handleClear}
          disabled={clearing}
          className="w-full min-h-[36px] rounded-lg text-xs font-medium border-none cursor-pointer disabled:opacity-40"
          style={{ background: "rgba(255,71,87,0.08)", color: "#FF6B77" }}
        >
          {clearing ? "Clearing…" : "Clear Cache"}
        </button>
      </div>
    </div>
  );
}
