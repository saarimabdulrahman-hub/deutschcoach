"use client";

import { useState, useEffect } from "react";

// Network quality hook (Section 12.5). Detects Wi-Fi vs cellular for
// intelligent audio pre-caching decisions.

interface NetworkQuality {
  isWifi: boolean;
  connectionType: string;
  supported: boolean;
}

export function useNetworkQuality(): NetworkQuality {
  const [quality, setQuality] = useState<NetworkQuality>(() => {
    const conn = (navigator as any).connection;
    return {
      isWifi: conn?.type === "wifi",
      connectionType: conn?.type || "unknown",
      supported: !!conn,
    };
  });

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const update = () => {
      setQuality({
        isWifi: conn.type === "wifi",
        connectionType: conn.type,
        supported: true,
      });
    };

    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  }, []);

  return quality;
}
