/**
 * useSafeArea — Hook to get safe-area inset values
 * Falls back to CSS env() variables
 */

"use client";

import { useEffect, useState } from "react";

interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeArea(): SafeArea {
  const [safeArea, setSafeArea] = useState<SafeArea>({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    const getValue = (varName: string, fallback: number) => {
      try {
        const val = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return val ? parseInt(val, 10) : fallback;
      } catch {
        return fallback;
      }
    };

    setSafeArea({
      top: getValue("--safe-area-top", 0),
      bottom: getValue("--safe-area-bottom", 0),
      left: getValue("--safe-area-left", 0),
      right: getValue("--safe-area-right", 0),
    });
  }, []);

  return safeArea;
}
