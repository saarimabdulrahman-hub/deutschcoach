# Chat Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the chat page with a three-column synthwave premium layout matching the dashboard and curriculum page aesthetic.

**Architecture:** All changes live in `ChatInterface.tsx` (new sub-components above the main function) and `chat/page.tsx` (wrapper adjustments). React Query fetches `DashboardData` for the Emma greeting card and recent topics. Design tokens reused from dashboard (`cardStyle`, gradient buttons, glow effects) and curriculum (Emma avatar in gradient circle).

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, TanStack React Query v5, CSS custom properties from ThemeContext

## Global Constraints

- All design tokens reused from existing dashboard/curriculum pages — no new CSS variables
- Three-column layout: `hidden lg:flex` for sidebars, mobile horizontal scroll for Try These
- "Free Chat" mode removed from mode list — default mode when nothing selected
- File attach is UI-only — no backend processing in this plan
- Emma avatar path: `/emma-avatar.webp`
- Branch: `feat/dashboard-synthwave-redesign`

---

### Task 1: Remove page-level header from chat/page.tsx

**Files:**
- Modify: `web/app/(app)/chat/page.tsx`

**Interfaces:**
- Produces: Simplified `ChatPage` — single wrapper div, no header elements

The page-level Emma header ("Emma · Your German Tutor") is moving into the sidebar. Strip the page down to a clean wrapper that delegates everything to `ChatInterface`.

- [ ] **Step 1: Replace chat/page.tsx content**

```tsx
"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-6rem)]">
      <ChatInterface />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/\(app\)/chat/page.tsx
git commit -m "refactor(chat): strip page header — moving Emma details into sidebar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Restyle ContextBar + add dashboard data fetch

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (ContextBar function + main component)

**Interfaces:**
- Consumes: `DashboardData` type from `@/types`
- Produces: Restyled `ContextBar` with glass background; `dashboard` data available via React Query

- [ ] **Step 1: Add imports and query in main component**

At the top of `ChatInterface.tsx`, add the import:

```tsx
import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/types";
```

Inside the `ChatInterface` function, after the existing `useAuth()` line, add:

```tsx
const { data: dashboard } = useQuery<DashboardData>({
  queryKey: ["dashboard"],
  queryFn: () => api.get("/dashboard"),
});
```

- [ ] **Step 2: Restyle ContextBar with glass background**

Replace the existing `ContextBar` function:

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): restyle ContextBar glass + add dashboard query

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Emma Greeting Card

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (add EmmaCard sub-component)

**Interfaces:**
- Consumes: `dashboard: DashboardData | undefined`, `userName: string`
- Produces: `EmmaCard` — glass card with avatar, greeting, and recent activity

Add this sub-component above the `ChatInterface` function, after the `ContextBar` function:

- [ ] **Step 1: Add EmmaCard component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): Emma greeting card with avatar + recent activity

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Try These section (replaces Modes)

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (add TryThese sub-component, update mode definitions)

**Interfaces:**
- Consumes: `mode: TutorMode`, `setMode: (m: TutorMode) => void`
- Produces: `TryThese` — six translucent color-coded action pills

- [ ] **Step 1: Replace MODES array and add TRY_THESE**

Replace the existing `MODES` array (lines 26-34) and `TutorMode` type with:

```tsx
type TutorMode = "roleplay" | "grammar" | "vocab" | "writing" | "pronunciation" | "exam";

const TRY_THESE: { key: TutorMode; emoji: string; label: string; color: string; bg: string }[] = [
  { key: "roleplay", emoji: "🎭", label: "Act out a situation", color: "#D946EF", bg: "rgba(217,70,239,0.10)" },
  { key: "grammar", emoji: "📖", label: "Break down a rule", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  { key: "vocab", emoji: "🌿", label: "Grow my word bank", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  { key: "writing", emoji: "✍️", label: "Make my German natural", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  { key: "pronunciation", emoji: "🗣️", label: "Nail the pronunciation", color: "#F43F5E", bg: "rgba(244,63,94,0.10)" },
  { key: "exam", emoji: "🎯", label: "Crush the next exam", color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
];
```

Also update `MODE_SUGGESTIONS` — remove the `free` key entry since Free Chat is removed. Change:

```tsx
const MODE_SUGGESTIONS: Record<TutorMode, string[]> = {
```
(keep same content, just drop the `free:` line)

- [ ] **Step 2: Add TryThese component**

```tsx
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
```

- [ ] **Step 3: Update mobile mode pills JSX**

Replace the existing mobile mode pills (lines 254-264) with pills using `TRY_THESE` data instead of `MODES`:

```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): Try These translucent pills replacing Modes — no Free Chat

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Emma Details footer

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (add EmmaDetails sub-component)

**Interfaces:**
- Produces: `EmmaDetails` — compact card for sidebar bottom

- [ ] **Step 1: Add EmmaDetails component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): Emma details footer for sidebar bottom

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Input bar redesign (round send + file attach)

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (input bar JSX in main component)

**Interfaces:**
- Produces: Round gradient send button + file attach button in input bar

- [ ] **Step 1: Add file input state**

In the `ChatInterface` function, add after existing state declarations:

```tsx
const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
```

- [ ] **Step 2: Replace the input bar JSX**

Find the existing input bar (starting around line 333: `{/* Input bar — future-ready for voice button */}`) and replace the entire block through the closing `</div>` that ends the center column with:

```tsx
{/* Input bar */}
<div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
  {/* File attach button */}
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

  {/* Input field */}
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

  {/* Send button — round gradient circle */}
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
```

Also remove the old mic button (`{/* Voice placeholder button (future) */}`) — the file attach button replaces its position.

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): round gradient send button + file attach

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Session Summary with colored icon boxes

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (redesign SessionSummary sub-component)

**Interfaces:**
- Consumes: `summary: SessionSummary` (existing interface, unchanged)
- Produces: Redesigned `SessionSummary` with colored icon boxes

- [ ] **Step 1: Replace SessionSummary component**

Replace the existing `SessionSummary` function entirely:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): session summary with colored icon boxes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Recent Topics card

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (add RecentTopics sub-component)

**Interfaces:**
- Consumes: `dashboard?: DashboardData`
- Produces: `RecentTopics` — plain text list card

- [ ] **Step 1: Add RecentTopics component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): recent topics card in right sidebar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Layout assembly — wire three-column layout + all components

**Files:**
- Modify: `web/components/chat/ChatInterface.tsx` (main `ChatInterface` function return JSX)

**Interfaces:**
- Consumes: All sub-components from Tasks 1-8
- Produces: Complete three-column chat page layout

This is the critical integration step. Replace the main return JSX (from the `<div className="flex h-[calc(100vh-10rem)] gap-0">` line onward) with the three-column layout.

- [ ] **Step 1: Replace the main return JSX**

Find the return statement in `ChatInterface` (starting around line 229: `return (`). Replace everything from the `<div className="flex h-[calc(100vh-10rem)] gap-0">` through the closing `</div>` before the final `);` with:

```tsx
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
            {MODE_SUGGESTIONS[mode].slice(0, 4).map((s, i) => (
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
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
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
```

- [ ] **Step 2: Clean up — remove old left sidebar JSX**

The old Modes sidebar (`{/* ── LEFT: Mode sidebar (desktop) ─────────────────────────── */}`) and old right sidebar (`{/* ── RIGHT: Session summary (desktop) ──────────────────────── */}`) are now replaced by the new three-column layout above. Remove the old `SessionSummary` direct invocation since it's now in the right sidebar column. Ensure no duplicate code remains.

Also remove the old mic button JSX that was between the input bar and the old send button.

- [ ] **Step 3: Remove old MODES array**

Delete the old `MODES` constant if it still exists (should have been replaced in Task 4).

- [ ] **Step 4: Verify no unused imports or variables remain**

The `fileInputRef` and `attachedFiles` state should be declared (from Task 6). If not, add them now. Remove any references to the old `MODES` constant.

- [ ] **Step 5: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "feat(chat): three-column layout — Emma card + Try These + chat + summary

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Start the dev server**

```bash
cd web && npm run dev
```

- [ ] **Step 2: Open browser and verify each section**

Navigate to `http://localhost:3456/chat`:

1. **Emma greeting card**: Avatar in gradient circle, "Hi [Name]! 👋", recent activity or fallback message
2. **Try These**: 6 translucent color-coded pills, hover effect, click changes mode + suggestions
3. **Emma details**: Footer at sidebar bottom, avatar + "Online now" green dot
4. **Context bar**: Glass background, level · lesson · vocab displayed
5. **Chat messages**: Send a message, verify Emma avatar in bot bubbles, corrections displayed
6. **Send button**: Round gradient circle with arrow icon, disabled state when empty
7. **File attach**: Click paperclip → file picker opens, select files → badge shows count
8. **Right sidebar**: Session summary with colored icon boxes (appears after messages), recent topics list
9. **Mobile**: Shrink viewport — sidebars hidden, Try These shows as horizontal scroll pills
10. **Empty state**: Clear all messages — WelcomePanel with Emma avatar appears

- [ ] **Step 3: Check console for errors**

Open browser DevTools (F12) → Console tab. No React errors, no 404s for `/emma-avatar.webp`, no TypeScript errors.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "chore(chat): final cleanup after verification

Co-Authored-By: Claude <noreply@anthropic.com>"
```
