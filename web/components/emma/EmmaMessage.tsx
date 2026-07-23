"use client";

import React from "react";
import type { EmmaMessage as EmmaMsg } from "./EmmaContext";

// Single message bubble. Emma on the left, learner on the right.
// Markdown rendering with entity-escaped safety (implemented in the shared
// renderMarkdownInline — see EmmaUI refactor notes).

interface Props { msg: EmmaMsg; }

function renderMarkdownInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\n/g, "<br/>");
}

export const EmmaMessage = React.memo(function EmmaMessage({ msg }: Props) {
  const isEmma = msg.role === "emma";
  const html = renderMarkdownInline(msg.text);
  return (
    <div className={`flex ${isEmma ? "justify-start" : "justify-end"}`}>
      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={{
          background: isEmma ? "var(--color-card-bg)" : "var(--color-accent-gradient)",
          color: isEmma ? "var(--color-text-secondary)" : "#fff",
          border: isEmma ? "1px solid var(--color-border)" : "none",
        }}>
        {isEmma && <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-light)" }}>Emma</div>}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
});
