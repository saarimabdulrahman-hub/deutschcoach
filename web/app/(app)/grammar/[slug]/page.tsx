"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { GrammarContent } from "@/components/grammar/GrammarContent";

interface GrammarTopicDetail {
  id: number;
  slug: string;
  title: string;
  level: string;
  content: string | null;
  examples: Record<string, string> | null;
  related_lessons: {
    id: number;
    title: string;
    level: string;
  }[] | null;
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, text });
    }
  }
  return headings;
}

export default function GrammarDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<GrammarTopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>("");

  useEffect(() => {
    async function fetchTopic() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<GrammarTopicDetail>(`/grammar/${slug}`);
        setTopic(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load grammar topic"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [slug]);

  const headings = useMemo(
    () => (topic?.content ? extractHeadings(topic.content) : []),
    [topic?.content]
  );

  // Scroll spy
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (loading) {
    return (
      <div>
        <div className="shimmer h-4 rounded w-32 mb-4" />
        <div className="shimmer h-8 rounded w-64 mb-2" />
        <div className="shimmer h-4 rounded w-20 mb-6" />
        <div className="space-y-3">
          <div className="shimmer h-4 rounded w-full" />
          <div className="shimmer h-4 rounded w-5/6" />
          <div className="shimmer h-4 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--color-error-bg)" }}>
          <span className="text-3xl">&#9888;</span>
        </div>
        <div className="mb-4" style={{ color: "var(--color-error-text)" }}>{error}</div>
        <Link
          href="/grammar"
          className="hover:text-indigo-300 underline text-sm" style={{ color: "var(--color-active-text)" }}
        >
          Back to Grammar
        </Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-16" style={{ color: "var(--color-text-muted)" }}>
        <p className="mb-2">Topic not found.</p>
        <Link
          href="/grammar"
          className="hover:text-indigo-300 underline text-sm" style={{ color: "var(--color-active-text)" }}
        >
          Back to Grammar
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/grammar"
        className="inline-flex items-center gap-1 text-sm hover:text-slate-200 transition-colors mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Grammar
      </Link>

      <div className="grid lg:grid-cols-[1fr_200px] gap-8">
        {/* Main content area */}
        <div>
          {/* Title and level badge */}
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{topic.title}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--color-active-bg)", color: "var(--color-active-text)" }}
            >
              {topic.level}
            </span>
          </div>

          {/* Main content */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            {topic.content ? (
              <GrammarContent content={topic.content} />
            ) : (
              <div className="italic" style={{ color: "var(--color-text-muted)" }}>No content available for this topic.</div>
            )}
          </div>

          {/* Examples section */}
          {topic.examples && Object.keys(topic.examples).length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Examples</h2>
              <div className="space-y-3">
                {Object.entries(topic.examples).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl p-4"
                    style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="text-xs mb-2 uppercase tracking-wider font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {key}
                    </div>
                    <code className="text-sm font-mono block whitespace-pre-wrap leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Lessons section */}
          {topic.related_lessons && topic.related_lessons.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Related Lessons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topic.related_lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/curriculum/${lesson.level.toLowerCase()}/${lesson.id}`}
                    className="block p-4 rounded-xl transition-all duration-200 hover:border-indigo-500/50"
                    style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="font-medium text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {lesson.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{lesson.level}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table of contents sidebar */}
        {headings.length > 1 && (
          <aside className="hidden lg:block">
            <div
              className="sticky top-24 rounded-xl p-4"
              style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                On this page
              </h4>
              <nav className="space-y-0.5">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => scrollToHeading(h.id)}
                    className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors truncate ${
                      activeHeading === h.id
                        ? "font-medium"
                        : "hover:text-slate-200"
                    }`}
                    style={{
                      background: activeHeading === h.id ? "var(--color-active-bg)" : "transparent",
                      color: activeHeading === h.id ? "var(--color-active-text)" : "var(--color-text-muted)",
                    }}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
