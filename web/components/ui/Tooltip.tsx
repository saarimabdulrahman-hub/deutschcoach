/**
 * Tooltip — Canonical primitive component
 * Variants: Informational, Rich tooltip, Keyboard hint
 * States: Hidden, Hover, Focus-visible, Visible, Dismissed
 * Positioning: Top, bottom, left, right
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/012_Tooltip.md
 */

"use client";

import { useState, useRef, type ReactNode } from "react";

type TooltipVariant = "info" | "rich" | "keyboard";
type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  variant?: TooltipVariant;
  position?: TooltipPosition;
  /** Delay in ms before showing */
  delay?: number;
}

const variantStyles: Record<TooltipVariant, React.CSSProperties> = {
  info: {
    background: "var(--color-surface-2)",
    color: "var(--color-text-primary)",
    fontSize: "var(--type-body-sm)",
    padding: "4px 10px",
    maxWidth: "220px",
  },
  rich: {
    background: "var(--color-surface-2)",
    color: "var(--color-text-primary)",
    fontSize: "var(--type-body-md)",
    padding: "8px 12px",
    maxWidth: "300px",
    border: "1px solid var(--color-border-subtle)",
  },
  keyboard: {
    background: "var(--color-surface-3)",
    color: "var(--color-text-secondary)",
    fontSize: "var(--type-label-sm)",
    padding: "2px 6px",
    fontFamily: "var(--font-mono, monospace)",
    minWidth: "20px",
    textAlign: "center",
  },
};

function getPositionStyle(position: TooltipPosition, rect: DOMRect): React.CSSProperties {
  const gap = 6;
  switch (position) {
    case "top":
      return { bottom: rect.height + gap, left: "50%", transform: "translateX(-50%)" };
    case "bottom":
      return { top: rect.height + gap, left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { right: rect.width + gap, top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { left: rect.width + gap, top: "50%", transform: "translateY(-50%)" };
  }
}

export function Tooltip({ content, children, variant = "info", position = "top", delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const show = () => {
    timerRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && containerRef.current && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: "var(--z-tooltip)",
            borderRadius: "var(--radius-xs)",
            boxShadow: "var(--elevation-3)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            animation: "fadeIn 0.15s ease-out",
            ...getPositionStyle(position, containerRef.current.getBoundingClientRect()),
            ...variantStyles[variant],
          }}
        >
          {content}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
