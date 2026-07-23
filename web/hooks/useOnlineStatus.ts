/**
 * useOnlineStatus — Network state hook
 * Returns isOnline, lastOnline timestamp, online count
 * Reference: 05_INTERACTION_PATTERNS/009_Offline_And_Sync_Flow.md
 */

"use client";

import { useState, useEffect, useRef } from "react";

interface OnlineStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  wasOffline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    if (navigator.onLine) setLastOnline(new Date());

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      wasOfflineRef.current = true;
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, lastOnline, wasOffline: wasOfflineRef.current };
}
