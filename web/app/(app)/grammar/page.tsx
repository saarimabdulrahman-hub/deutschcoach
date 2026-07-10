"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { GrammarTopicCard } from "@/components/grammar/GrammarTopicCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1"] as const;

interface GrammarTopic {
  id: number;
  slug: string;
  title: string;
  level: string;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-5 border rounded-xl"
          style={{ background: "var(--color-card-bg)", borderColor: "var(--color-border)" }}
        >
          <Skeleton className="h-5 w-3/4 rounded mb-3" />
          <Skeleton className="h-3 w-1/4 rounded" />
        </div>
      ))}
    </div>
  );
}

function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: "#22c55e",
    A2: "#3b82f6",
    B1: "#f59e0b",
    B2: "#f97316",
    C1: "#ef4444",
  };
  return colors[level] || "#6366f1";
}

export default function GrammarPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [level, setLevel] = useState<string>("All");
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (level !== "All") params.set("level", level);
      const data = await api.get<GrammarTopic[]>(
        `/grammar?${params.toString()}`
      );
      setTopics(data);
    } catch (err) {
      console.error("Failed to fetch grammar topics:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load grammar topics.");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, level]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Grammar Reference</h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Explore German grammar topics by level or search</p>
      </div>

      {/* Search with magnifying glass */}
      <div className="relative mb-5 max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: "var(--color-text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search grammar topics..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-slate-500"
          style={{
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--color-active-bg)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Level filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${level === lvl ? "" : "hover:text-slate-200"}`}
            style={
              level === lvl
                ? {
                    background: lvl === "All" ? "var(--color-accent-gradient)" : getLevelColor(lvl),
                    boxShadow: `0 4px 14px ${lvl === "All" ? "var(--color-accent-glow)" : getLevelColor(lvl) + "40"}`,
                    color: "var(--color-text)",
                  }
                : {
                    background: "var(--color-card-bg)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }
            }
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <SkeletonGrid />
      ) : fetchError ? (
        <ErrorState
          message={fetchError}
          onRetry={fetchTopics}
        />
      ) : topics.length === 0 ? (
        <EmptyState
          icon="📖"
          title="No grammar topics found"
          description={
            debouncedQuery
              ? `No topics matching "${debouncedQuery}". Try a different search term.`
              : "No grammar topics available for this level."
          }
        />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="break-inside-avoid">
              <GrammarTopicCard topic={topic} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
