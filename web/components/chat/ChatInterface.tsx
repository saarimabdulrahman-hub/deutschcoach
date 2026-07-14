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

type TutorMode = "roleplay" | "grammar" | "vocab" | "writing" | "pronunciation" | "exam";

interface SessionSummary {
  wordsDiscussed: string[];
  grammarExplained: string[];
  correctionsCount: number;
  usefulPhrases: string[];
}

// ── Mode definitions ──────────────────────────────────────────────────

type TutorModeKeys = TutorMode;
const TRY_THESE: { key: TutorModeKeys; emoji: string; label: string; color: string; bg: string }[] = [
  { key: "roleplay", emoji: "🎭", label: "Act out a situation", color: "#D946EF", bg: "rgba(217,70,239,0.10)" },
  { key: "grammar", emoji: "📖", label: "Break down a rule", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  { key: "vocab", emoji: "🌿", label: "Grow my word bank", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  { key: "writing", emoji: "✍️", label: "Make my German natural", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  { key: "pronunciation", emoji: "🗣️", label: "Nail the pronunciation", color: "#F43F5E", bg: "rgba(244,63,94,0.10)" },
  { key: "exam", emoji: "🎯", label: "Crush the next exam", color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
];

const MODE_SUGGESTIONS: Record<TutorMode, string[]> = {
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

// ── Session summary (right sidebar) ────────────────────────────────────

function SessionSummary({ summary }: { summary: SessionSummary }) {
  const hasContent = summary.wordsDiscussed.length > 0 || summary.grammarExplained.length > 0 || summary.correctionsCount > 0 || summary.usefulPhrases.length > 0;
  if (!hasContent) return null;

  const sections = [
    { icon: "🗣️", label: "Words discussed", items: summary.wordsDiscussed, color: "rgba(34,197,94,0.15)", iconColor: "#22C55E" },
    { icon: "📖", label: "Grammar explained", items: summary.grammarExplained, color: "rgba(168,85,247,0.15)", iconColor: "#A855F7" },
    { icon: "✍️", label: "Corrections", items: summary.correctionsCount > 0 ? [`${summary.correctionsCount} correction${summary.correctionsCount > 1 ? "s" : ""} this session`] : [], color: "rgba(245,158,11,0.15)", iconColor: "#F59E0B" },
    { icon: "💬", label: "Useful phrases", items: summary.usefulPhrases, color: "rgba(244,63,94,0.15)", iconColor: "#F43F5E" },
  ].filter(s => s.items.length > 0);

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.18)",
        boxShadow: "0 0 35px rgba(168,85,247,.06)",
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Session Summary
      </p>
      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.label} className="flex gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: s.color, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              <div className="flex flex-wrap gap-1">
                {s.items.map((item, i) => (
                  <span key={i} className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                    {item}{i < s.items.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
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

// ── Try These section (replaces Modes) ──────────────────────────────────

function TryThese({ mode, setMode }: { mode: TutorMode; setMode: (m: TutorMode) => void }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--color-text-muted)" }}>
        Try These
      </p>
      <div className="space-y-1">
        {TRY_THESE.map((m) => {
          const active = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${m.bg}, ${m.color}22)`
                  : m.bg,
                border: active
                  ? `1px solid ${m.color}55`
                  : `1px solid ${m.color}22`,
                boxShadow: active ? `0 0 16px ${m.color}22` : "none",
              }}>
              <span className="text-base flex-shrink-0">{m.emoji}</span>
              <span className="text-xs font-semibold truncate" style={{ color: active ? "#fff" : "var(--color-text-secondary)" }}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Emma details footer (sidebar bottom) ───────────────────────────────

function EmmaDetails() {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.12)",
      }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
        <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text)" }}>
          Emma · German Tutor
        </p>
        <p className="text-[10px] flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#22C55E", boxShadow: "0 0 4px rgba(34,197,94,0.5)" }} />
          Online now
        </p>
      </div>
    </div>
  );
}

// ── Recent Topics card (right sidebar) ─────────────────────────────────

function RecentTopics({ dashboard }: { dashboard?: DashboardData }) {
  const activities = dashboard?.recent_activity?.slice(0, 3) ?? [];
  if (activities.length === 0) return null;

  return (
    <div className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.18)",
        boxShadow: "0 0 35px rgba(168,85,247,.06)",
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
        Recent Topics
      </p>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i}>
            <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
              {a.description}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {a.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          </div>
        ))}
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
  const [mode, setMode] = useState<TutorMode>("roleplay");
  const [summary, setSummary] = useState<SessionSummary>({ wordsDiscussed: [], grammarExplained: [], correctionsCount: 0, usefulPhrases: [] });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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

  const suggestions = MODE_SUGGESTIONS[mode] ?? MODE_SUGGESTIONS.roleplay;
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full gap-0">
      {/* ── LEFT SIDEBAR: Emma card + Try These + Emma details ── */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r mr-3 pr-2 overflow-y-auto gap-4" style={{ borderColor: "var(--color-border)" }}>
        {/* Emma greeting card */}
        <EmmaCard dashboard={dashboard} userName={userName} />

        {/* Try These */}
        <TryThese mode={mode} setMode={setMode} />

        {/* Spacer pushes Emma details to bottom */}
        <div className="flex-1" />

        {/* Emma details at bottom */}
        <EmmaDetails />
      </div>

      {/* ── CENTER: Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile mode pills */}
        <div className="lg:hidden flex gap-1.5 mb-2 overflow-x-auto pb-1">
          {TRY_THESE.map((m) => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                background: mode === m.key ? m.color : "var(--color-card-bg)",
                color: mode === m.key ? "#fff" : "var(--color-text-secondary)",
                border: `1px solid ${mode === m.key ? m.color : "var(--color-border)"}`,
              }}>{m.emoji} {m.label}</button>
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
              Try in {TRY_THESE.find((m) => m.key === mode)?.label ?? mode} mode
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

        {/* Input bar */}
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) setAttachedFiles(Array.from(e.target.files));
              }}
              className="hidden"
              aria-label="Attach files"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach a file"
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:-translate-y-0.5 relative"
              style={{
                background: "var(--color-card-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {attachedFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1"
                  style={{ background: "#ec4899", boxShadow: "0 0 6px rgba(236,72,153,0.5)" }}>
                  {attachedFiles.length}
                </span>
              )}
            </button>
          </>

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
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 hover:-translate-y-0.5"
            style={{
              background: (loading || !input.trim()) ? "var(--color-card-bg)" : "linear-gradient(135deg, #FF3CA6, #6D3BFF)",
              border: (loading || !input.trim()) ? "1px solid var(--color-border)" : "none",
              boxShadow: (loading || !input.trim()) ? "none" : "0 0 16px rgba(217,70,239,0.35)",
            }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden
              style={{ color: (loading || !input.trim()) ? "var(--color-text-muted)" : "#fff" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR: Session summary + Recent topics ── */}
      <div className="hidden xl:flex flex-col w-64 flex-shrink-0 border-l ml-4 pl-4 overflow-y-auto gap-4" style={{ borderColor: "var(--color-border)" }}>
        <SessionSummary summary={summary} />
        <RecentTopics dashboard={dashboard} />
      </div>
    </div>
  );
}
