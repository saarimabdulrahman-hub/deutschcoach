// Reusable page header — replaces the duplicated h1 + subtitle pattern on 7 pages.

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Displayed above the title, e.g. "Your Learning Path" or a date */
  eyebrow?: string;
  /** Optional right-side content (badge, button, etc.) */
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, right }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-text-muted)" }}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
