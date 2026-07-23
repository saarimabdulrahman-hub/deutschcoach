/**
 * PageTransition — Page enter transition wrapper
 * Fades in content on route change, preserves focus
 */

"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key to trigger re-animation on route change */
  routeKey?: string;
}

export function PageTransition({ children, routeKey }: PageTransitionProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  if (reduced) return <>{children}</>;

  return (
    <div
      key={routeKey}
      ref={containerRef}
      style={{
        animation: "pageIn var(--duration-slow) ease-out both",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}
