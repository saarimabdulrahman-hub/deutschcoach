/**
 * Sidebar — Collapsible sidebar with responsive breakpoints.
 * Desktop: persistent. Tablet: collapsible. Mobile: drawer overlay.
 */

"use client";

import { type ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  width?: string;
  className?: string;
}

export function Sidebar({
  children,
  open = true,
  onToggle,
  width = "var(--space-10)",
  className = "",
}: SidebarProps) {
  return (
    <>
      {/* Desktop/tablet sidebar */}
      <aside
        className={`sidebar-desktop ${className}`}
        style={{
          width: open ? "16rem" : width,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          flexShrink: 0,
          transition: "width var(--duration-normal) ease",
          borderRight: "1px solid var(--color-border-subtle)",
        }}
      >
        {children}
      </aside>

      {/* Mobile overlay drawer */}
      {open && (
        <div className="sidebar-mobile-overlay" onClick={onToggle}>
          <aside
            className="sidebar-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "280px",
              zIndex: "var(--z-overlay)",
              background: "var(--color-background-primary)",
              borderRight: "1px solid var(--color-border-subtle)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              boxShadow: "var(--elevation-4)",
              animation: "slideInLeft 0.2s ease-out",
            }}
          >
            {children}
          </aside>
        </div>
      )}

      {/* Hide desktop sidebar on mobile, show overlay on mobile */}
      <style>{`
        @media (min-width: 640px) {
          .sidebar-mobile-overlay { display: none; }
          .sidebar-mobile-drawer { display: none; }
        }
        @media (max-width: 639px) {
          .sidebar-desktop { display: none; }
          .sidebar-mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: var(--z-overlay);
            background: rgba(0,0,0,0.5);
          }
        }
      `}</style>
    </>
  );
}
