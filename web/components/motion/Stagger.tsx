/**
 * Stagger — Stagger children animations with progressive delays
 * Each child fades in with an increasing delay for a cascading effect
 */

"use client";

import { Children, type ReactNode } from "react";
import { FadeIn } from "./FadeIn";

interface StaggerProps {
  children: ReactNode;
  /** Delay between each child (ms) */
  staggerDelay?: number;
  /** Initial delay before first child (ms) */
  initialDelay?: number;
  className?: string;
}

export function Stagger({ children, staggerDelay = 60, initialDelay = 0, className }: StaggerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <FadeIn key={i} delay={initialDelay + i * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
