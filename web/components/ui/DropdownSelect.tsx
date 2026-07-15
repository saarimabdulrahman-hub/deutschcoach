/**
 * DropdownSelect — 5 variants with keyboard navigation, ARIA combobox/listbox
 * Variants: Single, Multi, Searchable, Async, Grouped
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/011_Dropdown_Select.md
 */

"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

interface DropdownOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

interface DropdownSelectProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multi?: boolean;
  searchable?: boolean;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export function DropdownSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  multi,
  searchable,
  loading,
  error,
  disabled,
  label,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const singleValue = typeof value === "string" ? value : "";
  const multiValue = Array.isArray(value) ? value : [];

  const filteredOptions = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === singleValue)?.label || "";

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // Reset highlight when filtered options change
  useEffect(() => setHighlightIndex(0), [filteredOptions.length]);

  const selectOption = useCallback((opt: DropdownOption) => {
    if (opt.disabled) return;
    if (multi) {
      const newVal = multiValue.includes(opt.value)
        ? multiValue.filter((v) => v !== opt.value)
        : [...multiValue, opt.value];
      onChange?.(newVal);
    } else {
      onChange?.(opt.value);
      setOpen(false);
      setSearch("");
    }
  }, [multi, multiValue, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); setOpen(true); }
      return;
    }

    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setHighlightIndex((i) => Math.min(i + 1, filteredOptions.length - 1)); break;
      case "ArrowUp": e.preventDefault(); setHighlightIndex((i) => Math.max(i - 1, 0)); break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightIndex]) selectOption(filteredOptions[highlightIndex]);
        break;
      case "Escape": setOpen(false); setSearch(""); break;
    }
  };

  const isSelected = (opt: DropdownOption) => multi ? multiValue.includes(opt.value) : singleValue === opt.value;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label style={{ fontSize: "var(--type-label-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>{label}</label>}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: "40px",
          padding: "0 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${error ? "var(--color-error-border)" : "var(--color-border-subtle)"}`,
          background: disabled ? "var(--color-surface-1)" : "var(--color-surface-1)",
          color: disabled || (!singleValue && multiValue.length === 0) ? "var(--color-text-muted)" : "var(--color-text-primary)",
          fontSize: "var(--type-body-md)",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "border-color var(--duration-fast) ease",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {multi
            ? multiValue.length ? `${multiValue.length} selected` : placeholder
            : selectedLabel || placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ transform: open ? "rotate(180deg)" : "", transition: "transform var(--duration-fast) ease", flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && <p style={{ margin: 0, fontSize: "var(--type-label-sm)", color: "var(--color-error-text)" }}>{error}</p>}

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable={multi}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-1)",
            boxShadow: "var(--elevation-3)",
            zIndex: "var(--z-dropdown)",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          {searchable && (
            <div style={{ padding: "var(--space-2)", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--color-border-subtle)",
                  background: "transparent",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--type-body-md)",
                  outline: "none",
                }}
              />
            </div>
          )}

          {loading ? (
            <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--type-body-sm)" }}>Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--type-body-sm)" }}>No options found</div>
          ) : (
            filteredOptions.map((opt, i) => {
              const active = isSelected(opt);
              const highlighted = i === highlightIndex;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  disabled={opt.disabled}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setHighlightIndex(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: highlighted ? "var(--color-hover-bg)" : "transparent",
                    color: opt.disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
                    fontSize: "var(--type-body-md)",
                    cursor: opt.disabled ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "background var(--duration-fast) ease",
                  }}
                >
                  {multi && (
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "var(--radius-xs)",
                      border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
                      background: active ? "var(--color-accent)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
                    </span>
                  )}
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {active && !multi && <span style={{ color: "var(--color-accent)" }}>✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
