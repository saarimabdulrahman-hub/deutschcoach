"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";

// ── Types ────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  corrections?: Array<{ error: string; correction: string; explanation: string }>;
}

type TutorMode = "free" | "roleplay" | "grammar" | "vocab" | "writing" | "pronunciation" | "exam";

interface SessionSummary {
  wordsDiscussed: string[];
  grammarExplained: string[];
  correctionsCount: number;
  usefulPhrases: string[];
}

// ── Mode definitions ──────────────────────────────────────────────────

const MODES: { key: TutorMode; label: string; icon: string; desc: string }[] = [
  { key: "free", label: "Free Chat", icon: "💬", desc: "Ask me anything about German" },
  { key: "roleplay", label: "Roleplay", icon: "🎭", desc: "Practice a real conversation" },
  { key: "grammar", label: "Grammar Coach", icon: "📖", desc: "Explain a grammar pattern" },
  { key: "vocab", label: "Vocabulary", icon: "📇", desc: "Practice and review words" },
  { key: "writing", label: "Write & Correct", icon: "✍️", desc: "I'll correct your German" },
  { key: "pronunciation", label: "Pronunciation", icon: "🔊", desc: "How to say it right" },
  { key: "exam", label: "Exam Prep", icon: "🎯", desc: "Goethe / TestDaF practice" },
];

const MODE_SUGGESTIONS: Record<TutorMode, string[]> = {
  free: ["How do I introduce myself?", "Teach me common greetings", "What are the days of the week?", "How do I talk about hobbies?"],
  roleplay: ["Let's practice ordering at a café", "I'm checking into a hotel", "Help me with a job interview", "Can we do a doctor's visit?"],
  grammar: ["Explain verb conjugation", "When do I use der/die/das?", "Help me with sentence order", "What's the difference between du and Sie?"],
  vocab: ["Quiz me on greetings", "Teach me 5 food words", "What are the most common verbs?", "Review my recent vocabulary"],
  writing: ["I wrote: 'Ich gehe zu schule' — is this right?", "Correct this paragraph for me", "How would a native say this?", "Check my email in German"],
  pronunciation: ["How do I pronounce 'ch'?", "What's the difference between ü and u?", "Say 'Eichhörnchen' slowly", "Help me sound more natural"],
  exam: ["Give me an A1 speaking prompt", "What should I know for Goethe A1?", "Practice a writing task with me", "Simulate an oral exam question"],
};

// ── Welcome panel — what Emma knows about the learner ────────────────

function WelcomePanel({ userName, onPrompt }: { userName: string; onPrompt: (text: string) => void }) {
  return (
    <div className="text-center py-6 sm:py-8 max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-border)" }}>
        <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover" />
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold mb-1" style={{ color: "var(--color-text)" }}>
        Hi{userName ? ` ${userName}` : ""} 👋
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
        I'm Emma, your German tutor. I explain, correct, and practice with you — without just handing you the answers.
      </p>

      {/* Recent words (placeholder — wired when lesson context is available) */}
      <div className="rounded-xl p-3 mb-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
          Recently learned
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {["Hallo", "Ich heiße…", "Tschüss", "Wie geht's?", "Danke"].map((w) => (
            <button key={w} onClick={() => onPrompt(`Explain the word: ${w}`)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:-translate-y-0.5"
              style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-badge-bg)" }}>
              {w}
            </button>
          ))}
        </div>
        <button onClick={() => onPrompt("Let's practice my recent vocabulary")}
          className="mt-2 text-xs font-medium hover:underline" style={{ color: "var(--color-accent-light)" }}>
          Practice these →
        </button>
      </div>

      {/* What Emma can do */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {[
          { icon: "📖", title: "Explain grammar", desc: "Patterns & rules" },
          { icon: "📇", title: "Teach vocabulary", desc: "Words in context" },
          { icon: "✍️", title: "Correct writing", desc: "Fix your mistakes" },
          { icon: "🎭", title: "Roleplay", desc: "Real conversations" },
        ].map((item) => (
          <button key={item.title} onClick={() => onPrompt(item.title)}
            className="rounded-xl p-3 text-left transition-all hover:-translate-y-0.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
            <span className="text-lg block mb-1">{item.icon}</span>
            <span className="block text-xs font-semibold" style={{ color: "var(--color-text)" }}>{item.title}</span>
            <span className="block text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Session summary sidebar (desktop right) ───────────────────────────

function SessionSummary({ summary }: { summary: SessionSummary }) {
  if (!summary.wordsDiscussed.length && !summary.grammarExplained.length && !summary.correctionsCount) return null;

  return (
    <div className="hidden xl:flex flex-col w-56 flex-shrink-0 border-l ml-4 pl-4 overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>Session summary</p>

      {summary.wordsDiscussed.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>Words</p>
          <div className="flex flex-wrap gap-1">
            {summary.wordsDiscussed.map((w) => (
              <span key={w} className="px-2 py-1 rounded-lg text-[10px] font-medium"
                style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)" }}>{w}</span>
            ))}
          </div>
        </div>
      )}

      {summary.grammarExplained.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>Grammar</p>
          <ul className="space-y-1">
            {summary.grammarExplained.map((g) => (
              <li key={g} className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>✦ {g}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.correctionsCount > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>Corrections</p>
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{summary.correctionsCount} correction{summary.correctionsCount > 1 ? "s" : ""} this session</p>
        </div>
      )}

      {summary.usefulPhrases.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>Useful phrases</p>
          <ul className="space-y-1">
            {summary.usefulPhrases.map((p) => (
              <li key={p} className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>"{p}"</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Context bar (lesson awareness — placeholder data) ─────────────────

function ContextBar() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3 flex-wrap"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.18)",
        boxShadow: "0 0 35px rgba(168,85,247,.06)",
      }}>
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Context</span>
      <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
        <span style={{ color: "var(--color-accent-light)" }}>A1</span> Beginner
      </span>
      <span aria-hidden style={{ color: "var(--color-border)" }}>|</span>
      <span className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Lesson: Greetings</span>
      <span aria-hidden style={{ color: "var(--color-border)" }}>|</span>
      <span className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Vocab: Hallo, heißen, Tschüss…</span>
    </div>
  );
}

// ── Emma greeting card (sidebar) ───────────────────────────────────────

function EmmaCard({ dashboard, userName }: { dashboard?: DashboardData; userName: string }) {
  const recentActivity = dashboard?.recent_activity?.[0];

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.18)",
        boxShadow: "0 0 35px rgba(168,85,247,.08)",
      }}>
      {/* Purple ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(139,70,255,0.10) 0%, transparent 60%)" }} />

      <div className="relative z-10">
        {/* Emma avatar + greeting */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)",
              border: "2px solid rgba(255,255,255,0.18)",
              boxShadow: "0 0 0 4px rgba(109,59,255,0.25), 0 0 20px rgba(109,59,255,0.25)",
            }}>
            <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold" style={{ color: "#fff" }}>
              Hi {userName}! <span className="inline-block animate-bounce">👋</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Recent activity */}
        {recentActivity ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              {recentActivity.type === "lesson_completed" ? "Yesterday you learned" : "Recently you practiced"}
            </p>
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-active-text)" }}>
              {recentActivity.description}
            </p>
          </>
        ) : (
          <div className="text-center py-1">
            <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Start your first lesson today! 🌱
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function ChatInterface() {
  const { user } = useAuth();
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<TutorMode>("free");
  const [summary, setSummary] = useState<SessionSummary>({ wordsDiscussed: [], grammarExplained: [], correctionsCount: 0, usefulPhrases: [] });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userName = (user?.name || "You").split(" ")[0];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Update session summary from the user message and Emma's eventual reply
    // (placeholder — real extraction would parse Emma's response)
    const words = msg.match(/\b[A-ZÄÖÜ][a-zäöüß]+\b/g) ?? [];
    const isGrammar = /explain|grammar|conjugat|der die das|verb|sentence/i.test(msg);
    const isCorrection = /correct|check|wrong|right|wrote/i.test(msg);
    setSummary((s) => ({
      ...s,
      wordsDiscussed: [...new Set([...s.wordsDiscussed, ...words.slice(0, 3)])],
      grammarExplained: isGrammar ? [...s.grammarExplained, msg.slice(0, 40)] : s.grammarExplained,
      correctionsCount: isCorrection ? s.correctionsCount + 1 : s.correctionsCount,
    }));

    try {
      const res = await api.post<{ reply: string; corrections: Array<{ error: string; correction: string; explanation: string }> }>(
        "/chat/send",
        { messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })), scenario: null }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, corrections: res.corrections }]);
      if (res.corrections?.length) {
        setSummary((s) => ({ ...s, correctionsCount: s.correctionsCount + res.corrections!.length }));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = MODE_SUGGESTIONS[mode] ?? MODE_SUGGESTIONS.free;
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0">
      {/* ── LEFT: Mode sidebar (desktop) ─────────────────────────── */}
      <div className="hidden lg:flex flex-col w-48 flex-shrink-0 border-r mr-3 pr-2 overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--color-text-muted)" }}>Modes</p>
        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all mb-0.5"
              style={{
                background: active ? "var(--color-hover-bg)" : "transparent",
                border: active ? "1px solid var(--color-accent)" : "1px solid transparent",
              }}>
              <span className="text-base flex-shrink-0">{m.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: active ? "var(--color-active-text)" : "var(--color-text-secondary)" }}>{m.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── CENTER: Chat area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile mode pills */}
        <div className="lg:hidden flex gap-1.5 mb-2 overflow-x-auto pb-1">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
              style={{
                background: mode === m.key ? "var(--color-accent)" : "var(--color-card-bg)",
                color: mode === m.key ? "#fff" : "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}>{m.icon} {m.label}</button>
          ))}
        </div>

        {/* Context bar */}
        <ContextBar />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 px-1" style={{ scrollBehavior: "smooth" }}>
          {isEmpty && <WelcomePanel userName={userName} onPrompt={(t) => send(t)} />}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={msg.role === "user"
                  ? { background: "var(--color-accent-gradient)", color: "#fff" }
                  : { background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                {msg.role === "user" ? userName.charAt(0).toUpperCase() : <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover" />}
              </div>
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === "user"
                    ? { background: "var(--color-accent-gradient)", color: "#fff", borderBottomRightRadius: "4px" }
                    : { background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderBottomLeftRadius: "4px" }}>
                  {msg.content}
                </div>
                {msg.corrections?.length! > 0 && msg.corrections![0]?.explanation && (
                  <div className="mt-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "var(--color-hover-bg)", color: "var(--color-active-text)", border: "1px solid var(--color-active-bg)" }}>
                    💡 {msg.corrections![0].explanation}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}><img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover" /></div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
                <span className="flex gap-1.5">
                  {[0, 120, 240].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-accent)", animationDelay: `${d}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested actions (when empty) */}
        {isEmpty && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "var(--color-text-muted)" }}>
              Try in {MODES.find((m) => m.key === mode)?.label ?? mode} mode
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestions.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-full text-xs transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar — future-ready for voice button */}
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          {/* Voice placeholder button (future) */}
          <button aria-label="Voice input (coming soon)" disabled
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 opacity-30"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
            🎤
          </button>
          <input ref={inputRef}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={mode === "roleplay" ? "Start the roleplay…" : mode === "writing" ? "Paste or type your German…" : "Ask Emma anything…"}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-input-focus)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:-translate-y-0.5 min-w-[60px]"
            style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Session summary (desktop) ──────────────────────── */}
      <SessionSummary summary={summary} />
    </div>
  );
}
