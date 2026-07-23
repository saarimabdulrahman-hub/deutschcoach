/**
 * FadeIn — Fade-in animation on mount/enter
 * Uses CSS animation with canonical duration tokens
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FadeInProps {
  children: ReactNode;
  /** Delay before starting (ms) */
  delay?: number;
  /** Duration (default: var(--duration-normal)) */
  duration?: string;
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({ children, delay = 0, duration = "var(--duration-normal)", className, style }: FadeInProps) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <div
      className={className}
      style={{
        animation: `fadeIn ${duration} ease-out both`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
