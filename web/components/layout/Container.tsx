/**
 * Container — Max-width content container with responsive padding.
 * Uses canonical spacing tokens for consistent gutters across breakpoints.
 */

import type { CSSProperties, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  /** Max-width of the container. Default uses the app's max-w-7xl (80rem) */
  maxWidth?: string;
  /** Removes horizontal padding */
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "main";
}

export function Container({
  children,
  maxWidth = "80rem",
  flush,
  className = "",
  style,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={className}
      style={{
        width: "100%",
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: flush ? "0" : "var(--space-4)",
        paddingRight: flush ? "0" : "var(--space-4)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
