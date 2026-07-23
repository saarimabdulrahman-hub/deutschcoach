/**
 * ScaleIn — Scale entrance animation on mount
 * Combines scale + fade for a premium reveal effect
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: string;
  className?: string;
  style?: CSSProperties;
}

export function ScaleIn({ children, delay = 0, duration = "var(--duration-normal)", className, style }: ScaleInProps) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <div
      className={className}
      style={{
        animation: `scaleIn ${duration} ease-out both`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      {children}
    </div>
  );
}
