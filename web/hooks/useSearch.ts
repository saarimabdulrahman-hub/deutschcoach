/**
 * useSearch — Debounced search hook with recent/saved searches
 */

"use client";

import { useState, useEffect, useCallback } from "react";

const RECENT_KEY = "dc_recent_searches";
const MAX_RECENT = 5;

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Debounce
  useEffect(() => {
    if (!query) { setDebouncedQuery(""); return; }
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Save to recent searches
  const saveRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const updated = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
  }, []);

  return { query, setQuery, debouncedQuery, loading, setLoading, recentSearches, saveRecent, clearRecent };
}
