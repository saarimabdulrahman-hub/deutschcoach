# Unified Viewport — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the app to a fixed 768px layout that renders identically on every device via viewport meta scaling — strip all responsive Tailwind breakpoints and remove mobile-only elements.

**Architecture:** Set `width=768` in the viewport meta tag so the browser renders at a fixed 768px layout viewport. Center the body at `max-width: 768px`. Remove every `sm:`, `md:`, `lg:` Tailwind prefix, keeping the desktop variant. Remove mobile-only elements (bottom tab bar, mobile logo, mobile scenario bar).

**Tech Stack:** Next.js 16, Tailwind CSS v4, TypeScript

## Global Constraints

- Design width: 768px fixed
- Viewport meta: `width=768, initial-scale=1.0`
- No responsive breakpoints anywhere — strip all `sm:`, `md:`, `lg:` prefixes
- Mobile-only elements (bottom tab bar, mobile logo, mobile scenario pills) are removed
- Body centered with `max-width: 768px; margin: 0 auto`
- `pb-24` padding (for mobile tab bar) removed in favor of `pb-6`

---

### Task 1: Viewport Meta + CSS Lock

**Files:**
- Modify: `web/app/layout.tsx`
- Modify: `web/app/globals.css`

**Interfaces:**
- Produces: `<meta name="viewport" content="width=768, initial-scale=1.0">` in `<head>`
- Produces: `body { max-width: 768px; margin: 0 auto; }` CSS rule

- [ ] **Step 1: Add viewport meta to root layout**

Add the viewport metadata to `web/app/layout.tsx`. The `metadata` export controls `<head>` content in Next.js App Router:

```tsx
// web/app/layout.tsx — replace the existing metadata export:

export const metadata: Metadata = {
  title: "DeutschCoach — Learn German",
  description:
    "Master German vocabulary, grammar, and conversation with spaced repetition and interactive quizzes.",
  viewport: "width=768, initial-scale=1.0",
};
```

- [ ] **Step 2: Add body centering CSS**

Append to `web/app/globals.css`:

```css
/* Lock layout width — browser viewport meta handles scaling on small screens */
body {
  max-width: 768px;
  margin: 0 auto;
  overflow-x: hidden;
}
```

- [ ] **Step 3: Verify the change exists in rendered HTML**

Run the dev server and check the HTML head:

```bash
cd web && npm run dev
# Open http://localhost:3000, view source — confirm <meta name="viewport" content="width=768, initial-scale=1.0"> is present
```

- [ ] **Step 4: Commit**

```bash
git add web/app/layout.tsx web/app/globals.css
git commit -m "feat: lock viewport to 768px with viewport meta and body centering

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: App Shell Layout — Remove Mobile Elements

**Files:**
- Modify: `web/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: 768px viewport from Task 1
- Produces: Single unified header + main layout with no mobile variants

- [ ] **Step 1: Strip responsive classes and remove mobile bottom tab bar**

Make the following replacements in `web/app/(app)/layout.tsx`:

**Line 93** — header padding:
```diff
- className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6"
+ className="sticky top-0 z-30 flex items-center justify-between h-14 px-6"
```

**Lines 100–113** — logo area (remove `hidden sm:flex`, keep always visible):
```diff
  <div className="flex items-center gap-3 flex-shrink-0">
    <Logo size={32} />
-   <div className="hidden sm:flex items-baseline gap-0.5">
+   <div className="flex items-baseline gap-0.5">
      <span className="text-xl font-light tracking-[1px]" style={{ color: "var(--color-text)" }}>
        Deutsch
      </span>
      <span
        className="text-xl font-bold tracking-[1px]"
        style={{ background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
      >
        Flow
      </span>
    </div>
  </div>
```

**Line 116** — center tab bar (remove `hidden md:flex`, keep always):
```diff
- <div className="hidden md:flex flex-1 justify-center">
+ <div className="flex flex-1 justify-center">
```

**Line 126** — search button (remove `hidden md:flex`, keep always):
```diff
- className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:text-slate-300 hover:bg-white/5 transition-colors"
+ className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:text-slate-300 hover:bg-white/5 transition-colors"
```

**Line 158** — user name (remove `hidden sm:inline`, keep always):
```diff
- <span className="text-sm hidden sm:inline max-w-[100px] truncate" style={{ color: "var(--color-text-secondary)" }}>
+ <span className="text-sm inline max-w-[100px] truncate" style={{ color: "var(--color-text-secondary)" }}>
```

**Line 163** — chevron icon (remove `hidden sm:block`, keep always):
```diff
- className={`h-3.5 w-3.5 transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
+ className={`h-3.5 w-3.5 transition-transform block ${userMenuOpen ? "rotate-180" : ""}`}
```

**Line 237** — main content area (remove responsive padding, remove pb-24):
```diff
- <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
+ <main className="flex-1 max-w-6xl mx-auto w-full p-6 pb-6">
```

**Lines 241–244** — remove the mobile bottom tab bar wrapper entirely:
```diff
- {/* Mobile bottom tab bar */}
- <div className="md:hidden">
-   <TabBar onOpenCommand={() => setCommandOpen(true)} />
- </div>
```

- [ ] **Step 2: Verify the layout renders correctly**

```bash
# In the web directory, check for TypeScript errors:
cd web && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add web/app/\(app\)/layout.tsx
git commit -m "fix: remove mobile variants from app shell layout

Strip all sm:/md: breakpoints from header and main content.
Remove mobile bottom tab bar wrapper.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Login + Signup Pages

**Files:**
- Modify: `web/app/page.tsx` (login)
- Modify: `web/app/signup/page.tsx`

**Interfaces:**
- Consumes: 768px viewport from Task 1
- Produces: Login and signup pages with always-visible brand panel, no mobile elements

- [ ] **Step 1: Fix login page (`web/app/page.tsx`)**

**Line 34** — brand panel (remove `hidden lg:flex`, keep always):
```diff
- className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between py-12 px-12"
+ className="flex w-[45%] relative overflow-hidden flex-col justify-between py-12 px-12"
```

**Lines 119–125** — remove the mobile logo block entirely:
```diff
- {/* Mobile logo */}
- <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
-   <Logo size={32} />
-   <h1 className="font-bold text-sm tracking-widest">
-     <span style={{ color: "var(--color-text)" }}>Deutsch</span>
-     <span style={{ background: "linear-gradient(135deg, #7c3aed, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flow</span>
-   </h1>
- </div>
```

- [ ] **Step 2: Fix signup page (`web/app/signup/page.tsx`)**

**Line 49** — brand panel:
```diff
- className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between py-12 px-12"
+ className="flex w-[45%] relative overflow-hidden flex-col justify-between py-12 px-12"
```

**Lines 120–130** — remove the mobile logo block entirely:
```diff
- <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
-   <div
-     className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
-     style={{ background: "var(--color-badge-bg)", color: "var(--color-text)" }}
-   >
-     G
-   </div>
-   <h1 className="font-bold text-sm tracking-widest uppercase" style={{ color: "var(--color-text)" }}>
-     DeutschFlow
-   </h1>
- </div>
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add web/app/page.tsx web/app/signup/page.tsx
git commit -m "fix: remove mobile variants from login and signup pages

Always show brand panel, remove mobile-only logo blocks.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Dashboard — Page + Components

**Files:**
- Modify: `web/app/(app)/dashboard/page.tsx`
- Modify: `web/components/dashboard/StatsGrid.tsx`
- Modify: `web/components/dashboard/WeakestWords.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2
- Produces: Dashboard with fixed desktop layout, no responsive breakpoints

- [ ] **Step 1: Fix dashboard page (`web/app/(app)/dashboard/page.tsx`)**

**Line 73** — skeleton stats grid:
```diff
- <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
+ <div className="grid grid-cols-4 gap-4">
```

**Line 79** — skeleton bottom row:
```diff
- <div className="grid md:grid-cols-2 gap-6">
+ <div className="grid grid-cols-2 gap-6">
```

**Line 113** — section spacing:
```diff
- <div className="space-y-6 md:space-y-8">
+ <div className="space-y-8">
```

**Lines 115–120** — header row (remove responsive flex direction):
```diff
- <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
+ <div className="flex flex-row items-center justify-between gap-4">
```

**Line 117** — heading size:
```diff
- <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-text)" }}>
+ <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
```

**Line 133** — stats + level ring grid:
```diff
- <div className="grid lg:grid-cols-[1fr_180px] gap-4">
+ <div className="grid grid-cols-[1fr_180px] gap-4">
```

**Line 156** — main content grid:
```diff
- <div className="grid lg:grid-cols-3 gap-4">
+ <div className="grid grid-cols-3 gap-4">
```

**Line 157** — main content span:
```diff
- <div className="lg:col-span-2">
+ <div className="col-span-2">
```

**Line 231** — bottom row:
```diff
- <div className="grid md:grid-cols-2 gap-6">
+ <div className="grid grid-cols-2 gap-6">
```

- [ ] **Step 2: Fix StatsGrid (`web/components/dashboard/StatsGrid.tsx`)**

**Line 78** — stats grid:
```diff
- <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
+ <div className="grid grid-cols-4 gap-4">
```

- [ ] **Step 3: Fix WeakestWords (`web/components/dashboard/WeakestWords.tsx`)**

**Line 28** — English translation inline:
```diff
- <span className="text-xs truncate hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>{word.english}</span>
+ <span className="text-xs truncate inline" style={{ color: "var(--color-text-muted)" }}>{word.english}</span>
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add web/app/\(app\)/dashboard/page.tsx web/components/dashboard/StatsGrid.tsx web/components/dashboard/WeakestWords.tsx
git commit -m "fix: remove responsive breakpoints from dashboard

Strip all sm:/md:/lg: prefixes from dashboard page and components.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Chat — Page + ChatInterface

**Files:**
- Modify: `web/app/(app)/chat/page.tsx`
- Modify: `web/components/chat/ChatInterface.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2
- Produces: Chat with always-visible scenario sidebar, no mobile scenario pill bar

- [ ] **Step 1: Fix chat page (`web/app/(app)/chat/page.tsx`)**

No responsive classes found — this page is already clean. Skip to Step 2.

- [ ] **Step 2: Fix ChatInterface (`web/components/chat/ChatInterface.tsx`)**

**Line 104** — scenario sidebar (remove `hidden lg:flex`, keep always):
```diff
- <div className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r mr-4 pr-3 overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
+ <div className="flex flex-col w-52 flex-shrink-0 border-r mr-4 pr-3 overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
```

**Lines 144–159** — remove the mobile scenario pill bar entirely:
```diff
- {/* Mobile scenario bar */}
- <div className="lg:hidden flex gap-2 mb-3 overflow-x-auto pb-1">
-   <button onClick={() => setScenario(null)}
-     className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
-     style={{ background: !scenario ? "var(--color-accent)" : "var(--color-card-bg)", color: !scenario ? "#fff" : "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
-     💬 Free
-   </button>
-   {scenarios.map((s) => (
-     <button key={s.key} onClick={() => setScenario(s.key)}
-       className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
-       style={{ background: scenario === s.key ? "var(--color-accent)" : "var(--color-card-bg)", color: scenario === s.key ? "#fff" : "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
-       {SCENARIO_ICONS[s.key] || ""} {s.name}
-     </button>
-   ))}
- </div>
```

Also fix the chat height to not assume mobile tab bar — remove responsive height calc. The current `h-[calc(100vh-9rem)]` works with the 768px viewport since the bottom tab bar is gone.

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add web/components/chat/ChatInterface.tsx
git commit -m "fix: remove responsive breakpoints from chat interface

Always show scenario sidebar, remove mobile scenario pill bar.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: TabBar — Remove Mobile Bottom Bar

**Files:**
- Modify: `web/components/ui/TabBar.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2 (mobile wrapper already removed)
- Produces: Desktop-only tab bar, no mobile bottom bar variant

- [ ] **Step 1: Strip responsive classes and remove mobile variant**

**Line 92** — desktop tabs row (remove `hidden md:flex`, keep always):
```diff
- <nav className="hidden md:flex items-center gap-0.5 px-1">
+ <nav className="flex items-center gap-0.5 px-1">
```

**Lines 111–138** — remove the entire mobile bottom tab bar block:
```diff
- {/* Mobile bottom tab bar */}
- <nav
-   className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
-   style={{ background: "var(--color-card-bg)", borderTop: "1px solid var(--color-border)" }}
- >
-   <div className="flex items-center justify-around h-16 px-1">
-     {TABS.map((tab) => (
-       <button
-         key={tab.key}
-         onClick={() => router.push(tab.href)}
-         className="flex flex-col items-center justify-center px-1 py-1 min-w-0 gap-0.5 transition-colors relative"
-         style={{ color: active === tab.key ? "var(--color-active-text)" : "var(--color-text-muted)" }}
-       >
-         {active === tab.key && (
-           <span
-             className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full"
-             style={{ background: "var(--color-accent)" }}
-           />
-         )}
-         {tab.icon}
-         <span className="text-[10px] leading-tight truncate max-w-[48px]">
-           {tab.label}
-         </span>
-       </button>
-     ))}
-   </div>
- </nav>
```

Remove the wrapper fragment (`<>...</>`) around the remaining single nav element, since it's no longer wrapping two children:

```diff
- <>
-   {/* Desktop top bar tabs (rendered inside header, so this is just the tab row) */}
    <nav className="flex items-center gap-0.5 px-1">
      ...tab buttons...
    </nav>
-
-   {/* Mobile bottom tab bar — REMOVED */}
- </>
```

The component now returns a single `<nav>` element (no fragment needed).

- [ ] **Step 2: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add web/components/ui/TabBar.tsx
git commit -m "fix: remove mobile bottom tab bar, keep desktop tabs only

Strip md: breakpoints from TabBar, remove fixed bottom mobile nav.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Curriculum Pages + Components

**Files:**
- Modify: `web/app/(app)/curriculum/page.tsx`
- Modify: `web/app/(app)/curriculum/[level]/[id]/page.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2
- Produces: Curriculum with fixed desktop layouts

- [ ] **Step 1: Fix curriculum main page (`web/app/(app)/curriculum/page.tsx`)**

**Line 250** — level description cards:
```diff
- <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
+ <div className="grid grid-cols-5 gap-3">
```

- [ ] **Step 2: Fix lesson detail page (`web/app/(app)/curriculum/[level]/[id]/page.tsx`)**

**Line 116** — sticky progress bar:
```diff
- <div className="sticky top-14 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-2" style={{ background: "var(--color-page-bg)" }}>
+ <div className="sticky top-14 z-20 -mx-6 px-6 py-2" style={{ background: "var(--color-page-bg)" }}>
```

**Line 171** — main content grid:
```diff
- <div className="grid lg:grid-cols-3 gap-6">
+ <div className="grid grid-cols-3 gap-6">
```

**Line 173** — main content span:
```diff
- <div className="lg:col-span-2 space-y-6">
+ <div className="col-span-2 space-y-6">
```

**Line 240** — vocabulary sidebar span:
```diff
- <div className="lg:col-span-1">
+ <div className="col-span-1">
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add web/app/\(app\)/curriculum/page.tsx "web/app/(app)/curriculum/[level]/[id]/page.tsx"
git commit -m "fix: remove responsive breakpoints from curriculum pages

Strip all sm:/md:/lg: prefixes from curriculum listing and lesson detail.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Grammar Pages + Components

**Files:**
- Modify: `web/app/(app)/grammar/page.tsx`
- Modify: `web/app/(app)/grammar/[slug]/page.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2
- Produces: Grammar pages with fixed desktop layouts

- [ ] **Step 1: Fix grammar main page (`web/app/(app)/grammar/page.tsx`)**

**Line 21** — skeleton grid:
```diff
- <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
+ <div className="grid grid-cols-3 gap-4">
```

**Line 174** — masonry columns:
```diff
- <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
+ <div className="columns-3 gap-4 space-y-4">
```

- [ ] **Step 2: Fix grammar detail page (`web/app/(app)/grammar/[slug]/page.tsx`)**

**Line 156** — main layout grid:
```diff
- <div className="grid lg:grid-cols-[1fr_200px] gap-8">
+ <div className="grid grid-cols-[1fr_200px] gap-8">
```

**Line 209** — related lessons grid:
```diff
- <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
+ <div className="grid grid-cols-2 gap-3">
```

**Line 230** — table of contents sidebar (remove `hidden lg:block`, keep always):
```diff
- <aside className="hidden lg:block">
+ <aside className="block">
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add web/app/\(app\)/grammar/page.tsx "web/app/(app)/grammar/[slug]/page.tsx"
git commit -m "fix: remove responsive breakpoints from grammar pages

Always show TOC sidebar, fixed 3-col grid and 2-col related lessons.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Remaining Components — TierSelector, SubscriptionSection, Skeleton, SRS

**Files:**
- Modify: `web/components/auth/TierSelector.tsx`
- Modify: `web/components/settings/SubscriptionSection.tsx`
- Modify: `web/components/ui/Skeleton.tsx`
- Modify: `web/components/srs/SRSStats.tsx`

**Interfaces:**
- Consumes: unified layout from Task 2
- Produces: All shared components with fixed desktop layouts

- [ ] **Step 1: Fix TierSelector (`web/components/auth/TierSelector.tsx`)**

**Line 150** — plans grid:
```diff
- <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
+ <div className="grid grid-cols-3 gap-6">
```

- [ ] **Step 2: Fix SubscriptionSection (`web/components/settings/SubscriptionSection.tsx`)**

**Line 68** — plans grid:
```diff
- <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
+ <div className="grid grid-cols-3 gap-4">
```

- [ ] **Step 3: Fix Skeleton (`web/components/ui/Skeleton.tsx`)**

**Line 21** — PageSkeleton grid:
```diff
- <div className="grid md:grid-cols-3 gap-4">
+ <div className="grid grid-cols-3 gap-4">
```

- [ ] **Step 4: Fix SRSStats (`web/components/srs/SRSStats.tsx`)**

**Line 77** — stats grid (no breakpoint change needed, already `grid-cols-4`). Check the review page at `web/app/(app)/review/page.tsx` line 32:
```diff
- <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
+ <div className="grid grid-cols-5 gap-3">
```

- [ ] **Step 5: Verify TypeScript compilation**

```bash
cd web && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add web/components/auth/TierSelector.tsx web/components/settings/SubscriptionSection.tsx web/components/ui/Skeleton.tsx web/app/\(app\)/review/page.tsx
git commit -m "fix: remove responsive breakpoints from shared components

Strip sm:/md: prefixes from TierSelector, SubscriptionSection, Skeleton, and review page.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Final Verification — Build + Visual Check

**Files:**
- No new changes — verification only

- [ ] **Step 1: Run TypeScript check on entire project**

```bash
cd web && npx tsc --noEmit
```

Expected: No errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Run production build**

```bash
cd web && npm run build
```

Expected: Build succeeds with no warnings about unused responsive classes.

- [ ] **Step 3: Scan for remaining responsive classes**

```bash
cd web && grep -rn "sm:\|md:\|lg:" --include="*.tsx" --include="*.ts" app/ components/ contexts/
```

Expected: No output (no remaining responsive breakpoints in app code). The `lg:` in `globals.css` is fine (it's just a CSS class, not a Tailwind breakpoint).

Note: The `StrokeWidth={2}` in SVG paths is NOT a Tailwind class — it's a React SVG prop. These can be ignored.

- [ ] **Step 4: Confirm no remaining mobile-only elements**

```bash
cd web && grep -rn "md:hidden\|lg:hidden\|pb-24\|mobile" --include="*.tsx" app/ components/
```

Expected: No output (all mobile-only elements removed).

- [ ] **Step 5: Start dev server and visually verify**

```bash
cd web && npm run dev
```

Open `http://localhost:3000` and test:
1. Login page — brand panel visible, no mobile logo
2. Dashboard — 4-col stats grid, 3-col content area, side-by-side header
3. Chat — scenario sidebar always visible, no horizontal pill bar
4. Curriculum — 5-col level cards, 3-col lesson detail
5. Grammar — 3-col grid, TOC sidebar visible
6. Resize browser to 375px wide — confirm layout scales down proportionally (no reflow, just smaller), confirm no horizontal scrollbar

- [ ] **Step 6: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "chore: final verification of unified viewport — no remaining responsive classes

Co-Authored-By: Claude <noreply@anthropic.com>"
```
