"use client";

import { useEffect, useCallback, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { flushQueue } from "@/lib/offline/queue";
import { flushCheckpoints } from "@/lib/offline/indexedDb";

// Sync hook (Section 12.5). Replays queued offline actions when connectivity
// returns. Provides sync status and progress feedback.

export function useSync() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const performSync = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);

    try {
      // Flush checkpoint queue
      const syncedCheckpoints = await flushCheckpoints();

      // Flush general action queue (quiz results, etc.)
      const { synced, failed } = await flushQueue(async (action) => {
        const { api } = await import("@/lib/api");
        try {
          await api.post(action.type, action.payload);
          return true;
        } catch {
          return false;
        }
      });

      setLastSynced(new Date());
    } catch {
      // Sync failed — will retry on next reconnect
    } finally {
      setSyncing(false);
    }
  }, []);

  // Sync on reconnect
  useEffect(() => {
    if (isOnline && wasOffline) {
      performSync();
    }
  }, [isOnline, wasOffline, performSync]);

  return { syncing, lastSynced, performSync };
}
