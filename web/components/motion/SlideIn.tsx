/**
 * SlideIn — Slide-in from a direction on mount
 * Uses CSS animation with canonical duration/easing tokens
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type SlideDirection = "up" | "down" | "left" | "right";

interface SlideInProps {
  children: ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: string;
  className?: string;
  style?: CSSProperties;
}

const directionStyles: Record<SlideDirection, string> = {
  up: "translateY(20px)",
  down: "translateY(-20px)",
  left: "translateX(20px)",
  right: "translateX(-20px)",
};

export function SlideIn({ children, direction = "up", delay = 0, duration = "var(--duration-normal)", className, style }: SlideInProps) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <div
      className={className}
      style={{
        animation: `slideInFrom${direction} ${duration} ease-out both`,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      <style>{`
        @keyframes slideInFrom${direction} {
          from { opacity: 0; transform: ${directionStyles[direction]}; }
          to { opacity: 1; transform: translate(0, 0); }
        }
      `}</style>
      {children}
    </div>
  );
}
