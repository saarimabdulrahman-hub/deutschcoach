"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    key: "curriculum",
    label: "Learn",
    href: "/curriculum",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: "chat",
    label: "Chat",
    href: "/chat",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "review",
    label: "Review",
    href: "/review",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "quiz",
    label: "Quiz",
    href: "/quiz",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    key: "grammar",
    label: "Grammar",
    href: "/grammar",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface TabBarProps {
  onOpenCommand?: () => void;
}

export function TabBar({ onOpenCommand }: TabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active =
    TABS.find((t) => pathname.startsWith(t.href))?.key || "dashboard";

  return (
    <>
      {/* Desktop: horizontal tab row shown inside the header */}
      <nav className="hidden sm:flex items-center gap-0.5 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => router.push(tab.href)}
            className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            style={{ color: active === tab.key ? "var(--color-text)" : "var(--color-text-muted)" }}
          >
            {active === tab.key && (
              <span
                className="absolute inset-0 rounded-lg"
                style={{ background: "var(--color-active-bg)" }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile: fixed bottom tab bar with icons */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{ background: "var(--color-card-bg)", borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => router.push(tab.href)}
              aria-label={tab.label}
              aria-current={active === tab.key ? "page" : undefined}
              className="flex flex-col items-center justify-center px-1 py-1 min-w-0 gap-0.5 transition-colors relative"
              style={{ color: active === tab.key ? "var(--color-active-text)" : "var(--color-text-muted)" }}
            >
              {active === tab.key && (
                <span
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full"
                  style={{ background: "var(--color-accent)" }}
                />
              )}
              {tab.icon}
              <span className="text-[10px] leading-tight truncate max-w-[48px]">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
