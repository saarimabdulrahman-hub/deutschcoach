/**
 * Breadcrumbs — Breadcrumb navigation with schema.org markup.
 */

import type { CSSProperties, ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  style?: CSSProperties;
}

export function Breadcrumbs({ items, className = "", style }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", ...style }}>
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "var(--type-label-sm)",
          color: "var(--color-text-muted)",
        }}
        vocab="https://schema.org/"
        typeof="BreadcrumbList"
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} property="itemListElement" typeof="ListItem" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  property="item"
                  typeof="WebPage"
                  style={{ color: "var(--color-text-muted)", textDecoration: "none", transition: "color var(--duration-fast) ease" }}
                >
                  <span property="name">{item.label}</span>
                </a>
              ) : (
                <span property="name" style={{ color: isLast ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                  {item.label}
                </span>
              )}
              <meta property="position" content={String(i + 1)} />

              {!isLast && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
