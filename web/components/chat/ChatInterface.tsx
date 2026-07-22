"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { StreamingMessage } from "./StreamingMessage";

// ── Types ────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  corrections?: Array<{ error: string; correction: string; explanation: string }>;
}

export type TutorMode = "roleplay" | "grammar" | "vocab" | "writing" | "pronunciation" | "exam";

interface SessionSummary {
  wordsDiscussed: string[];
  grammarExplained: string[];
  correctionsCount: number;
  usefulPhrases: string[];
}

// ── Mode definitions ──────────────────────────────────────────────────

const TRY_THESE: { key: TutorMode; emoji: string; label: string }[] = [
  { key: "roleplay", emoji: "🎭", label: "Act out a situation" },
  { key: "grammar", emoji: "📖", label: "Break down a rule" },
  { key: "vocab", emoji: "🌿", label: "Grow my word bank" },
  { key: "writing", emoji: "✍️", label: "Make my German natural" },
  { key: "pronunciation", emoji: "🗣️", label: "Nail the pronunciation" },
  { key: "exam", emoji: "🎯", label: "Crush the next exam" },
];

const LEVEL_NAME: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced",
};

const MODE_SUGGESTIONS: Record<TutorMode, string[]> = {
  roleplay: ["Let's practice ordering at a café", "I'm checking into a hotel", "Help me with a job interview", "Can we do a doctor's visit?"],
  grammar: ["Explain verb conjugation", "When do I use der/die/das?", "Help me with sentence order", "What's the difference between du and Sie?"],
  vocab: ["Quiz me on greetings", "Teach me 5 food words", "What are the most common verbs?", "Review my recent vocabulary"],
  writing: ["I wrote: 'Ich gehe zu schule' — is this right?", "Correct this paragraph for me", "How would a native say this?", "Check my email in German"],
  pronunciation: ["How do I pronounce 'ch'?", "What's the difference between ü and u?", "Say 'Eichhörnchen' slowly", "Help me sound more natural"],
  exam: ["Give me an A1 speaking prompt", "What should I know for Goethe A1?", "Practice a writing task with me", "Simulate an oral exam question"],
};

// ── Welcome panel — what Emma knows about the learner ────────────────

function WelcomePanel({ userName, dashboard, onPrompt }: { userName: string; dashboard?: DashboardData; onPrompt: (text: string) => void }) {
  const recentWords = (dashboard?.weakest_words?.length ? dashboard.weakest_words.map(w => w.german) : [])
    .concat(dashboard?.recent_activity?.filter(a => a.type === 'lesson_completed').flatMap(a => {
      const match = a.description.match(/vocab(?:ulary)?:?\s*(.+)/i);
      return match ? match[1].split(/,\s*/).slice(0, 3) : [];
    }) || [])
    .slice(0, 5);

  return (
    <div className="text-center py-6 sm:py-8 max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
        <img src="/emma-avatar.webp" alt="Emma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
          {(recentWords.length > 0 ? recentWords : ["Hallo", "Tschüss", "Danke"]).map((w) => (
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

// ── Session Summary KPI card (right sidebar) ───────────────────────────

function SessionSummary({ summary }: { summary: SessionSummary }) {
  const hasContent = summary.wordsDiscussed.length > 0 || summary.grammarExplained.length > 0 || summary.correctionsCount > 0 || summary.usefulPhrases.length > 0;

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      {/* Colorful icon chips header */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: "rgba(34,197,94,0.2)" }}>🗣️</span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: "rgba(168,85,247,0.2)" }}>📖</span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: "rgba(245,158,11,0.2)" }}>✍️</span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px]" style={{ background: "rgba(244,63,94,0.2)" }}>💬</span>
        <span className="text-xs font-semibold ml-1" style={{ color: "var(--color-text)" }}>Session Summary</span>
      </div>

      {!hasContent ? (
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Start a conversation to see your summary</p>
      ) : (
        <div className="space-y-2">
          {summary.wordsDiscussed.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Vocabulary</p>
              <div className="flex flex-wrap gap-1">
                {summary.wordsDiscussed.map((w) => (
                  <span key={w} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>{w}</span>
                ))}
              </div>
            </div>
          )}
          {summary.grammarExplained.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Grammar</p>
              {summary.grammarExplained.map((g, i) => (
                <p key={i} className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>✦ {g}</p>
              ))}
            </div>
          )}
          {summary.correctionsCount > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Corrections</p>
              <p className="text-[11px]" style={{ color: "#F59E0B" }}>{summary.correctionsCount} correction{summary.correctionsCount > 1 ? "s" : ""} this session</p>
            </div>
          )}
          {summary.usefulPhrases.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Phrases</p>
              {summary.usefulPhrases.map((p, i) => (
                <p key={i} className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>"{p}"</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Context bar (lesson awareness) ─────────────────

function ContextBar({ mode, dashboard }: { mode?: TutorMode | null; dashboard?: DashboardData }) {
  const levelLabel = `${dashboard?.continue_lesson?.level || "A1"} ${LEVEL_NAME[dashboard?.continue_lesson?.level || "A1"] || "Beginner"}`;
  const lessonLabel = dashboard?.continue_lesson?.title ? `Lesson: ${dashboard.continue_lesson.title}` : null;
  const modeLabel = mode ? `Mode: ${TRY_THESE.find((m) => m.key === mode)?.label ?? mode}` : null;
  const items = [levelLabel, lessonLabel, modeLabel].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3 flex-wrap"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
        border: "1px solid rgba(186, 120, 255, 0.18)",
        boxShadow: "0 0 35px rgba(168,85,247,.06)",
      }}>
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Context</span>
      {items.map((item, i) => (
        <Fragment key={item}>
          {i > 0 && <span aria-hidden style={{ color: "var(--color-border)" }}>|</span>}
          <span className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{item}</span>
        </Fragment>
      ))}
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
          <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden" style={{ boxShadow: "0 0 0 4px rgba(109,59,255,0.25), 0 0 20px rgba(109,59,255,0.25)" }}>
            <img src="/emma-avatar.webp" alt="Emma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

function TryThese({ mode, setMode }: { mode: TutorMode | null; setMode: (m: TutorMode) => void }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
        Try These
      </p>
      <div className="flex flex-col gap-1.5">
        {TRY_THESE.map((m) => {
          const active = mode === m.key;
          return (
            <button key={m.key} onClick={() => setMode(m.key)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-full text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: active
                  ? "var(--color-hover-bg)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), #111127",
                border: active
                  ? "1px solid var(--color-accent)"
                  : "1px solid rgba(186, 120, 255, 0.18)",
                boxShadow: active ? "0 0 16px var(--color-active-bg)" : "0 0 35px rgba(168,85,247,.06)",
              }}>
              <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent 40%), rgba(139,70,255,0.12)",
                  border: "1px solid rgba(186, 120, 255, 0.15)",
                }}>
                {m.emoji}
              </span>
              <span className="text-xs font-semibold truncate" style={{ color: active ? "var(--color-active-text)" : "var(--color-text-secondary)" }}>
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
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6D3BFF, #FF3CA6)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
        <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover scale-110" />
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

// ── Recent Topics KPI card (right sidebar) ─────────────────────────────

function RecentTopics({ dashboard }: { dashboard?: DashboardData }) {
  const activities = dashboard?.recent_activity?.slice(0, 4) ?? [];

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text)" }}>
        Recent Topics
      </p>
      {activities.length === 0 ? (
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          No recent activity yet
        </p>
      ) : (
        <div className="space-y-2.5">
          {activities.map((a, i) => (
            <div key={i}>
              <p className="text-[12px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>
                {a.description}
              </p>
            </div>
          ))}
        </div>
      )}
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
  const [mode, setMode] = useState<TutorMode | null>(null);
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
        { messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })), mode }
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

  const suggestions = mode ? (MODE_SUGGESTIONS[mode] ?? MODE_SUGGESTIONS.roleplay) : [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full gap-0">
      {/* ── LEFT SIDEBAR: Emma card + Try These + Emma details ── */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 border-r mr-3 pr-2 overflow-y-auto gap-4" style={{ borderColor: "var(--color-border)" }}>
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
                background: mode === m.key ? "var(--color-accent)" : "var(--color-card-bg)",
                color: mode === m.key ? "#fff" : "var(--color-text-secondary)",
                border: mode === m.key ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
              }}>{m.emoji} {m.label}</button>
          ))}
        </div>

        {/* Context bar */}
        <ContextBar mode={mode} dashboard={dashboard} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 px-1" style={{ scrollBehavior: "smooth" }}>
          {isEmpty && <WelcomePanel userName={userName} dashboard={dashboard} onPrompt={(t) => send(t)} />}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} corrections={msg.corrections} userName={userName} />
          ))}

          {loading && <StreamingMessage content="" />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested actions (when empty) */}
        {isEmpty && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "var(--color-text-muted)" }}>
              Try in {mode ? (TRY_THESE.find((m) => m.key === mode)?.label ?? mode) : "any"} mode
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

        <ChatInput input={input} setInput={setInput} send={send} loading={loading} mode={mode} />
      </div>

      {/* ── RIGHT SIDEBAR: Session summary + Recent topics ── */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 border-l ml-4 pl-4 overflow-y-auto gap-4" style={{ borderColor: "var(--color-border)" }}>
        <SessionSummary summary={summary} />
        <RecentTopics dashboard={dashboard} />
      </div>
    </div>
  );
}
