/**
 * ChatInput — Prompt composer with file attach and mode-aware placeholder
 */

"use client";

import { useRef, useState } from "react";
import type { TutorMode } from "./ChatInterface";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  send: () => void;
  loading: boolean;
  mode: TutorMode | null;
}

export function ChatInput({ input, setInput, send, loading, mode }: ChatInputProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholder = mode === "roleplay"
    ? "Start the roleplay…"
    : mode === "writing"
    ? "Paste or type your German…"
    : "Ask Emma anything…";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-subtle)" }}>
      {/* File attach */}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple
        onChange={(e) => { if (e.target.files) setAttachedFiles(Array.from(e.target.files)); }}
        className="hidden" aria-label="Attach files" />
      <button onClick={() => fileInputRef.current?.click()} title="Attach a file"
        style={{
          width: "44px", height: "44px", borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, border: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-1)", color: "var(--color-text-muted)",
          cursor: "pointer", position: "relative",
          transition: "transform var(--duration-fast) ease",
        }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        {attachedFiles.length > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px", minWidth: "16px", height: "16px",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", fontWeight: 700, color: "#fff", background: "#ec4899",
            boxShadow: "0 0 6px rgba(236,72,153,0.5)", padding: "0 4px",
          }}>
            {attachedFiles.length}
          </span>
        )}
      </button>

      {/* Input field */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder}
        disabled={loading}
        aria-label="Message input"
        style={{
          flex: 1, padding: "12px 16px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)", outline: "none",
          background: "var(--color-surface-1)", color: "var(--color-text-primary)",
          fontSize: "var(--type-body-md)",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--color-border-focus)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--color-border-subtle)"; }}
      />

      {/* Send button */}
      <button onClick={() => send()} disabled={loading || !input.trim()}
        style={{
          width: "44px", height: "44px", borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          background: (loading || !input.trim()) ? "var(--color-surface-1)" : "linear-gradient(135deg, #FF3CA6, #6D3BFF)",
          border: (loading || !input.trim()) ? "1px solid var(--color-border-subtle)" : "none",
          boxShadow: (loading || !input.trim()) ? "none" : "0 0 16px rgba(217,70,239,0.35)",
          transition: "all var(--duration-fast) ease",
          opacity: (loading || !input.trim()) ? 0.4 : 1,
        }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden
          style={{ color: (loading || !input.trim()) ? "var(--color-text-muted)" : "#fff" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
