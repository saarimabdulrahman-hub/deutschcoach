/**
 * MobileNav — Bottom navigation bar for mobile viewports.
 * Shows tab-style navigation with icons and labels.
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
}

interface MobileNavProps {
  items?: MobileNavItem[];
}

const defaultItems: MobileNavItem[] = [
  {
    key: "dashboard", label: "Home", href: "/dashboard",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  },
  {
    key: "curriculum", label: "Learn", href: "/curriculum",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    key: "chat", label: "Chat", href: "/chat",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
  {
    key: "review", label: "Review", href: "/review",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    key: "quiz", label: "Quiz", href: "/quiz",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
];

export function MobileNav({ items = defaultItems }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active = items.find((t) => pathname.startsWith(t.href))?.key || "dashboard";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: "64px",
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              padding: "4px 8px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: isActive ? "var(--color-active-text)" : "var(--color-text-muted)",
              minWidth: "48px",
              minHeight: "48px",
              position: "relative",
            }}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: "25%",
                  right: "25%",
                  height: "2px",
                  borderRadius: "0 0 2px 2px",
                  background: "var(--color-accent)",
                }}
              />
            )}
            <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
            <span style={{ fontSize: "var(--type-caption)", lineHeight: 1.2, maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
