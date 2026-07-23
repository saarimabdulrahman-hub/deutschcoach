"use client";

import { useRef, useEffect, useState } from "react";
import { useEmma, type EmmaMessage } from "./EmmaContext";

// Floating Emma button — toggles the panel. Rendered once, always visible in the
// lesson. Positioned above the sticky footer / mobile tab bar.

function EmmaButton({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button onClick={onClick} aria-label={open ? "Close Emma" : "Open Emma — your AI tutor"}
      title={open ? "Close Emma" : "Ask Emma"}
      className="fixed z-40 right-4 sm:right-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        width: 52, height: 52,
        bottom: "calc(80px + env(safe-area-inset-bottom))", // above sticky CTA + tab bar
        background: open ? "var(--color-card-bg)" : "var(--color-accent-gradient)",
        color: open ? "var(--color-accent-light)" : "#fff",
        border: open ? "2px solid var(--color-accent)" : "none",
        boxShadow: open ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(217,70,239,0.4)",
      }}>
      {open ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      )}
    </button>
  );
}

// Quick-action chips. Tapping one sends that prompt. Labels are short;
// the generated prompt is fuller (see quickActionPrompt). Each chip is 44px.

const ACTIONS = [
  { label: "Explain this", prompt: "Explain grammar" },
  { label: "Give another example", prompt: "Give another example" },
  { label: "Pronounce this", prompt: "Pronounce this" },
  { label: "Why is this correct?", prompt: "Why is this correct?" },
  { label: "I'm stuck", prompt: "I'm stuck" },
  { label: "Translate", prompt: "Translate" },
];

function QuickActions({ onAction }: { onAction: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick actions">
      {ACTIONS.map((a) => (
        <button key={a.label} onClick={() => onAction(a.prompt)} type="button"
          className="min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-white/10"
          style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-badge-bg)" }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

// Single message bubble — Emma left, learner right. Markdown-ish rendering (bold,
// italic, inline code, blockquote). No react-markdown dependency; a lightweight
// regex parser handles the Emma voice patterns.

function MessageBubble({ msg }: { msg: EmmaMessage }) {
  const isEmma = msg.role === "emma";
  const html = renderMarkdownInline(msg.text);
  return (
    <div className={`flex ${isEmma ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}
        style={{
          background: isEmma ? "var(--color-card-bg)" : "var(--color-accent-gradient)",
          color: isEmma ? "var(--color-text-secondary)" : "#fff",
          border: isEmma ? "1px solid var(--color-border)" : "none",
        }}>
        {isEmma ? <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-light)" }}>Emma</div> : null}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

// Minimal markdown → HTML for bold, italic, inline code, blockquote.
// All user/programmatic text is entity-escaped before transformations.
function renderMarkdownInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>") // ">" was escaped to "&gt;"
    .replace(/\n/g, "<br/>");
}

// Typing indicator — three animated dots.
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider mr-2" style={{ color: "var(--color-accent-light)" }}>Emma</span>
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "300ms" }} />
        </span>
      </div>
    </div>
  );
}

// ── The panel ─────────────────────────────────────────────────────────

export function EmmaUI() {
  const { open, setOpen, context, messages, send, isTyping } = useEmma();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, isTyping]);

  const onSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    send(trimmed);
    setInput("");
  };

  if (!open) return <EmmaButton onClick={() => { setOpen(true); }} open={false} />;

  return (
    <>
      {/* Backdrop — closes on tap */}
      <div className="fixed inset-0 z-40 sm:hidden" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setOpen(false)} aria-hidden />

      <EmmaButton onClick={() => setOpen(false)} open />

      {/* Panel — sheet on mobile, side panel on desktop */}
      <div className="fixed z-40 flex flex-col"
        style={{
          // mobile: bottom sheet; desktop: side panel
          bottom: 0, left: 0, right: 0, top: "auto",
          maxHeight: "70vh",
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          background: "var(--color-page-bg)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        }}>
        {/* Context header */}
        <div className="px-4 pt-3.5 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--color-text)" }}>Emma · AI Tutor</p>
              <p className="text-[10px] truncate" style={{ color: "var(--color-text-muted)" }}>
                {context.lessonTitle ? `${context.lessonTitle} · ${context.stageLabel}` : "Ask me about this lesson"}
              </p>
            </div>
            <button onClick={() => { send("Explain this"); }} className="text-xs font-semibold hover:underline flex-shrink-0 ml-2"
              style={{ color: "var(--color-accent-light)" }}>New chat</button>
          </div>
          <div className="mt-2">
            <QuickActions onAction={(p) => { send(p); }} />
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>I'm Emma, your German tutor.</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>I'll explain, give examples, and help you through — without handing you the answer. Try a quick action below.</p>
            </div>
          )}
          {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex-shrink-0 px-3 py-2.5 flex items-center gap-2"
          style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-page-bg)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Emma…" aria-label="Message Emma"
            className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-sm"
            style={{ background: "var(--color-card-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", outline: "none" }} />
          <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send"
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </>
  );
}
