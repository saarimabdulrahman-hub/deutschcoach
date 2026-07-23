/**
 * LearningLayout — Focused learning workspace shell
 * Desktop: lesson nav + content + resource sidebar
 * Tablet: collapsible sidebars
 * Mobile: content first, nav/resources as drawers
 *
 * Reference: DeutschFlow Design Bible 03_LAYOUTS/005_Learning_Workspace.md
 */

"use client";

import { useState, type ReactNode } from "react";
import { ProgressTracker } from "@/components/layout/ProgressTracker";

interface LearningLayoutProps {
  /** Course context shown in header */
  courseTitle?: string;
  level?: string;
  /** Left sidebar: lesson navigation */
  lessonNav: ReactNode;
  /** Center: main lesson content */
  children: ReactNode;
  /** Right sidebar: vocabulary, grammar references */
  resourceSidebar?: ReactNode;
  /** Bottom bar: previous/next/complete actions */
  bottomActions?: ReactNode;
  /** Current progress percentage (0-100) */
  progressPct?: number;
}

export function LearningLayout({
  courseTitle,
  level,
  lessonNav,
  children,
  resourceSidebar,
  bottomActions,
  progressPct,
}: LearningLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <div className="learning-layout" style={{ display: "flex", flexDirection: "column", height: "100%", gap: "0" }}>
      {/* Course header */}
      <div className="learning-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "1px solid var(--color-border-subtle)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          {/* Mobile nav toggle */}
          <button onClick={() => setNavOpen(!navOpen)} className="touch-target lg:hidden"
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
            aria-label="Toggle lesson navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {courseTitle && (
            <span style={{ fontSize: "var(--type-body-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {courseTitle}
            </span>
          )}
          {level && (
            <span style={{ fontSize: "var(--type-label-sm)", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--color-active-bg)", color: "var(--color-accent-text)" }}>
              {level}
            </span>
          )}
        </div>

        {/* Mobile resource toggle */}
        {resourceSidebar && (
          <button onClick={() => setResourcesOpen(!resourcesOpen)} className="touch-target lg:hidden"
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
            aria-label="Toggle resources">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress tracker */}
      {progressPct !== undefined && <ProgressTracker percent={progressPct} />}

      {/* Body: nav + content + resource sidebar */}
      <div className="learning-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Desktop lesson nav */}
        <aside className="learning-nav-desktop" style={{
          display: "none", width: "220px", flexShrink: 0,
          overflowY: "auto", borderRight: "1px solid var(--color-border-subtle)",
        }}>
          {lessonNav}
        </aside>

        {/* Mobile lesson nav drawer */}
        {navOpen && (
          <div className="learning-nav-mobile-overlay" onClick={() => setNavOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)" }}>
            <aside onClick={(e) => e.stopPropagation()}
              style={{ width: "260px", height: "100%", background: "var(--color-background-primary)", overflowY: "auto", borderRight: "1px solid var(--color-border-subtle)", animation: "slideInLeft 0.2s ease-out" }}>
              {lessonNav}
            </aside>
          </div>
        )}

        {/* Main content */}
        <main id="learning-content" style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)" }}>
          {children}
        </main>

        {/* Desktop resource sidebar */}
        {resourceSidebar && (
          <aside className="learning-resources-desktop" style={{
            display: "none", width: "240px", flexShrink: 0,
            overflowY: "auto", borderLeft: "1px solid var(--color-border-subtle)", padding: "var(--space-3)",
          }}>
            {resourceSidebar}
          </aside>
        )}

        {/* Mobile resource drawer */}
        {resourceSidebar && resourcesOpen && (
          <div className="learning-resources-mobile-overlay" onClick={() => setResourcesOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)" }}>
            <aside onClick={(e) => e.stopPropagation()}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "260px", background: "var(--color-background-primary)", overflowY: "auto", borderLeft: "1px solid var(--color-border-subtle)", padding: "var(--space-3)", animation: "slideInRight 0.2s ease-out" }}>
              {resourceSidebar}
            </aside>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      {bottomActions && (
        <div className="learning-bottom-actions" style={{
          borderTop: "1px solid var(--color-border-subtle)", padding: "var(--space-3) var(--space-4)",
          flexShrink: 0,
        }}>
          {bottomActions}
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .learning-nav-desktop { display: flex !important; }
          .learning-resources-desktop { display: block !important; }
        }
      `}</style>
    </div>
  );
}
