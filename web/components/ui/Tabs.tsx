/**
 * Tabs — 4 variants with ARIA tab pattern, arrow-key navigation
 * Variants: Underline, Pill, Segmented, Vertical
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/013_Tabs.md
 */

"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

type TabsVariant = "underline" | "pill" | "segmented" | "vertical";

interface Tab {
  key: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: TabsVariant;
  children?: (activeKey: string) => ReactNode;
  className?: string;
}

const tabListStyle: Record<TabsVariant, React.CSSProperties> = {
  underline: {
    display: "flex",
    borderBottom: "1px solid var(--color-border-subtle)",
    gap: 0,
    overflowX: "auto",
  },
  pill: {
    display: "flex",
    gap: "var(--space-1)",
    padding: "3px",
    borderRadius: "var(--radius-md)",
    background: "var(--color-surface-1)",
    overflowX: "auto",
  },
  segmented: {
    display: "flex",
    gap: 0,
    padding: "2px",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-surface-1)",
    border: "1px solid var(--color-border-subtle)",
    overflowX: "auto",
  },
  vertical: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
};

function getTabStyle(variant: TabsVariant, isActive: boolean, disabled?: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: variant === "vertical" ? "10px var(--space-3)" : "8px 16px",
    border: "none",
    background: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "var(--type-body-md)",
    fontWeight: isActive ? 600 : 500,
    whiteSpace: "nowrap",
    opacity: disabled ? 0.4 : 1,
    transition: "all var(--duration-fast) ease-out",
    outline: "none",
  };

  switch (variant) {
    case "underline":
      return {
        ...base,
        color: isActive ? "var(--color-accent-text)" : "var(--color-text-secondary)",
        borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
        marginBottom: "-1px",
      };
    case "pill":
      return {
        ...base,
        color: isActive ? "#fff" : "var(--color-text-secondary)",
        background: isActive ? "var(--color-accent)" : "transparent",
        borderRadius: "var(--radius-sm)",
      };
    case "segmented":
      return {
        ...base,
        color: isActive ? "var(--color-accent-text)" : "var(--color-text-secondary)",
        background: isActive ? "var(--color-accent)" : "transparent",
        borderRadius: "calc(var(--radius-sm) - 2px)",
        margin: "2px",
      };
    case "vertical":
      return {
        ...base,
        width: "100%",
        color: isActive ? "var(--color-active-text)" : "var(--color-text-secondary)",
        background: isActive ? "var(--color-hover-bg)" : "transparent",
        borderRadius: "var(--radius-sm)",
        textAlign: "left",
      };
  }
}

export function Tabs({ tabs, activeKey: externalActive, onChange, variant = "underline", children, className }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.key || "");
  const activeKey = externalActive ?? internalActive;
  const tabListRef = useRef<HTMLDivElement>(null);

  const setActive = useCallback((key: string) => {
    if (!externalActive) setInternalActive(key);
    onChange?.(key);
  }, [externalActive, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = Math.min(index + 1, tabs.length - 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = Math.max(index - 1, 0);
    if (nextIndex !== index) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      if (nextTab && !nextTab.disabled) {
        setActive(nextTab.key);
        const buttons = tabListRef.current?.querySelectorAll("button");
        buttons?.[nextIndex]?.focus();
      }
    }
  };

  return (
    <div className={className}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation={variant === "vertical" ? "vertical" : "horizontal"}
        style={tabListStyle[variant]}
      >
        {tabs.map((tab, i) => {
          const isActive = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !tab.disabled && setActive(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              style={getTabStyle(variant, isActive, tab.disabled)}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span style={{
                  fontSize: "var(--type-caption)",
                  padding: "0 6px",
                  borderRadius: "var(--radius-pill)",
                  background: isActive ? "rgba(255,255,255,0.2)" : "var(--color-active-bg)",
                  color: isActive ? "#fff" : "var(--color-text-muted)",
                  lineHeight: "16px",
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {children && (
        <div role="tabpanel" aria-labelledby={activeKey} style={{ paddingTop: variant === "vertical" ? 0 : "var(--space-4)" }}>
          {children(activeKey)}
        </div>
      )}
    </div>
  );
}
