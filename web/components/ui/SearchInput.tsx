/**
 * SearchInput — With debounce, suggestions, keyboard navigation
 * Variants: Global Search, Inline Search, Command Palette, Table Search
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/017_Search.md
 */

"use client";

import { useState, useRef, useEffect, type ChangeEvent, type ReactNode } from "react";

type SearchVariant = "global" | "inline" | "table";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  variant?: SearchVariant;
  loading?: boolean;
  suggestions?: string[];
  error?: string;
  disabled?: boolean;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Called when Escape is pressed */
  onClose?: () => void;
  leadingIcon?: ReactNode;
}

export function SearchInput({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = "Search...",
  variant = "inline",
  loading,
  suggestions = [],
  error,
  disabled,
  debounceMs = 300,
  onClose,
  leadingIcon,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "");
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const value = externalValue !== undefined ? externalValue : internalValue;

  // Debounced onChange
  useEffect(() => {
    if (externalValue !== undefined) return;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onChange?.(internalValue);
    }, debounceMs);
    return () => { if (debounceRef.current !== null) window.clearTimeout(debounceRef.current); };
  }, [internalValue, debounceMs, onChange, externalValue]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (externalValue === undefined) setInternalValue(newVal);
    onChange?.(newVal);
    setShowSuggestions(newVal.length > 0);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setShowSuggestions(false); inputRef.current?.blur(); onClose?.(); }
    if (e.key === "Enter") {
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        selectSuggestion(suggestions[highlightIndex]);
      } else {
        onSearch?.(value);
        setShowSuggestions(false);
      }
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIndex((i) => Math.max(i - 1, 0)); }
  };

  const selectSuggestion = (suggestion: string) => {
    if (externalValue === undefined) setInternalValue(suggestion);
    onChange?.(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const sizeStyles: React.CSSProperties = variant === "global"
    ? { height: "48px", padding: "0 16px", fontSize: "var(--type-body-md)" }
    : variant === "table"
    ? { height: "32px", padding: "0 8px", fontSize: "var(--type-body-sm)" }
    : { height: "40px", padding: "0 12px", fontSize: "var(--type-body-md)" };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderRadius: variant === "global" ? "var(--radius-lg)" : "var(--radius-md)",
        border: `1px solid ${focused ? "var(--color-border-focus)" : error ? "var(--color-error-border)" : "var(--color-border-subtle)"}`,
        background: disabled ? "var(--color-surface-1)" : "var(--color-surface-1)",
        transition: "border-color var(--duration-fast) ease",
        boxShadow: focused ? "0 0 0 2px var(--color-accent-glow)" : "none",
        ...sizeStyles,
      }}>
        {leadingIcon ?? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (value) setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Search"
          aria-autocomplete="list"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
            fontSize: "inherit",
            width: "100%",
          }}
        />

        {loading && <span style={{ width: "16px", height: "16px", border: "2px solid var(--color-border-subtle)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />}

        {value && !loading && (
          <button onClick={() => { if (externalValue === undefined) setInternalValue(""); onChange?.(""); inputRef.current?.focus(); }}
            aria-label="Clear search"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0, lineHeight: 1 }}>
            ✕
          </button>
        )}
      </div>

      {error && <p style={{ margin: "4px 0 0", fontSize: "var(--type-label-sm)", color: "var(--color-error-text)" }}>{error}</p>}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
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
          overflow: "hidden",
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
              onMouseEnter={() => setHighlightIndex(i)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: i === highlightIndex ? "var(--color-hover-bg)" : "transparent",
                color: "var(--color-text-primary)",
                fontSize: "var(--type-body-md)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background var(--duration-fast) ease",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
