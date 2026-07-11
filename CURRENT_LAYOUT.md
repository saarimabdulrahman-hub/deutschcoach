# Current Dashboard Layout — Self-Contained As-Built Reference

> **Read this first.** This file is written so that a brand-new Claude session (or any engineer) with **no prior context** can understand the exact current layout of this app's dashboard. Everything needed is inline. No screenshots required.

---

## 0. Context (what this is)

- **Product:** *DeutschCoach* (branded "DeutschFlow" in the UI) — a full-stack German language-learning web app (curriculum A1–C1, SRS flashcards, quizzes, AI chat tutor, Stripe billing).
- **Repo root:** `C:\Users\saari\projects\german-tutor-chatbot\`
- **Frontend:** `web/` — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, TanStack React Query. Dark theme with a 15-variant theme system (default variant = violet/"indigo").
- **This document describes:** the **learner dashboard** — the first authenticated page after login.
- **Exact source files (production, as-built):**
  - Layout markup + inline components: `web/app/(app)/dashboard/page.tsx` (~285 lines)
  - Design tokens (CSS variables): `web/app/globals.css` (`:root`, lines ~8–45)
  - App chrome (sidebar + top header, NOT part of the dashboard page): `web/app/(app)/layout.tsx`
  - Hero background image: `web/public/gate.jpg` (referenced as `/gate.jpg`)
- **Related (NOT production):**
  - Redesign sandbox: `C:\Users\saari\Downloads\deutschflow-dashboard-preview.html`
  - Target design spec: `web/UI_AUDIT/` (documentation set)
- **Workflow rule in effect:** *Preview-First.* Production must NOT be edited until the user explicitly says `EXECUTE`. Redesign work happens only in the preview + `UI_AUDIT/`.

---

## 1. The dashboard is ONE scrolling column

The dashboard page renders inside the app shell (persistent left **sidebar** + top **header** come from `(app)/layout.tsx`; they are not defined in `page.tsx`). The page itself is a single centered column:

- Wrapper: `<div class="space-y-5 pb-4 dashboard-shell">` with inline style `maxWidth: 1280px; margin: 0 auto`.
- **Max content width:** 1280px, horizontally centered.
- **Vertical gap between the 6 sections:** `space-y-5` = **20px**.
- Loading → `<Skeleton />`; error → `<ErrorState onRetry=…/>`.
- Greeting text is time-of-day based: `Guten Morgen` (hour < 12), `Guten Tag` (< 18), else `Guten Abend`. First name = `user.name.split(" ")[0]` (fallback "Student").
- All numeric values come from one API call: `GET /dashboard` → `DashboardData` (`streak`, `level_progress_pct`, `weakest_words[]`, `avg_quiz_score`, `cards_due_today`, `continue_lesson`).

---

## 2. Proportional wireframe (full page, desktop ≥1024px)

```
╔═══════════════════════════════════════════════════════════════════════╗  max-width 1280px, centered
║ SECTION 1 — GREETING ROW            (flex, space-between)              ║
║ ┌───────────────────────────────────┐   ┌──────────┐ ┌────────────┐  ║
║ │ SATURDAY, JULY 11        (label)   │   │ 🔥  0    │ │ Current Lvl│  ║
║ │ Guten Morgen, admin! 👋  (h1 4xl)  │   │ Day Strk │ │ [A1] A1 Beg│  ║
║ │ Kleine Schritte… (muted subtitle)  │   │ Start…!  │ │ ▓▓░░ bar   │  ║
║ └───────────────────────────────────┘   └──────────┘ │ 120/300 XP │  ║
║   left: flex-1                          min-w 140   └────────────┘  ║
║                                                        min-w 160      ║
╠═══════════════════════════════════════════════════════════════════════╣  ↕ 20px
║ SECTION 2 — HERO BANNER              height 190–210px, radius 20px    ║
║ ┌───────────────────────────────────────────────────────────────────┐ ║
║ │ (dark navy→purple gradient · radial glows · moon · /gate.jpg img)  │ ║
║ │  WELCOME TO DEUTSCHFLOW               🌙                           │ ║
║ │  Your German learning                  ▟▙ gate       ┌───────────┐ │ ║
║ │  journey starts here                  ▟██▙           │Ready to   │ │ ║
║ │  Structured lessons, smart…                          │begin?     │ │ ║
║ │  ✓ Beginner · ⏱ 10 min · 📚 80+                      │[Start…▸]  │ │ ║
║ │                                                      └───────────┘ │ ║
║ │  left text (max-w 460)              gate center-right   glass CTA   │ ║
║ │                                                      w-290, blur32  │ ║
║ └───────────────────────────────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════════════════════════════╣  ↕ 20px
║ SECTION 3 — TODAY'S PLAN             grid 3 cols, gap 16px            ║
║ label: "TODAY'S PLAN"                                                 ║
║ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          ║
║ │ 📖 (blue tile)  │ │ Aa (purple tile)│ │ 🗣️ (green tile) │          ║
║ │ Your First      │ │ German Grammar  │ │ Practice        │          ║
║ │ Lesson          │ │                 │ │ Speaking        │          ║
║ │ Greetings &…    │ │ Understand how… │ │ Chat with Emma… │          ║
║ │ 10 min…       ▸ │ │ Start with…   ▸ │ │ No exp needed ▸ │          ║
║ └─────────────────┘ └─────────────────┘ └─────────────────┘          ║
╠═══════════════════════════════════════════════════════════════════════╣  ↕ 20px
║ SECTION 4 — YOUR PROGRESS            ONE card, flex row               ║
║ label: "YOUR PROGRESS"                                                ║
║ ┌───────────────────────────────────────────────────────────────────┐ ║
║ │  ╭───────╮     Ready to begin                                      │ ║
║ │  │  0%   │     Start your first lesson to see your progress here.  │ ║
║ │  │Complete│    [ View Roadmap ]  (ghost btn)                       │ ║
║ │  ╰───────╯     ┌────┬────┬────┐  ← 6 StatCells, grid 3 cols        │ ║
║ │  ProgressRing  │📖  │📝  │📖  │    (2 rows × 3)                     │ ║
║ │  (r=58 SVG)    │0/80│0wd │80tp│                                    │ ║
║ │                ├────┼────┼────┤                                    │ ║
║ │                │✅  │🃏  │⏱   │                                    │ ║
║ │                │0%  │0cd │0m  │                                    │ ║
║ │                └────┴────┴────┘                                    │ ║
║ └───────────────────────────────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════════════════════════════╣  ↕ 20px
║ SECTION 5 — REVIEW + ACTIVITY       grid 2 cols, gap 16px            ║
║ ┌─────────────────────────────────┐ ┌─────────────────────────────┐  ║
║ │ REVIEW & PRACTICE               │ │ RECENT ACTIVITY             │  ║
║ │ 🃏 Flashcards Complete        ▸ │ │        🌱                   │  ║
║ │    Nothing due — excellent work!│ │  Your journey begins        │  ║
║ │ 🎯 Discover Your Level        ▸ │ │  Complete your first lesson…│  ║
║ │    Find out what you already…   │ │  [ Start Lesson → ]         │  ║
║ └─────────────────────────────────┘ └─────────────────────────────┘  ║
╠═══════════════════════════════════════════════════════════════════════╣  ↕ 20px
║ SECTION 6 — TIP OF THE DAY          ONE card, flex row               ║
║ ┌───────────────────────────────────────────────────────────────────┐ ║
║ │ TIP OF THE DAY                                           ┌──────┐  │ ║
║ │ Review before bed — sleep helps your brain consolidate…  │ SVG  │  │ ║
║ │ Browse lessons →                                         │ 80²  │  │ ║
║ └───────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 3. Section-by-section detail (copy, routes, values)

### Section 1 — Greeting row
- Container: `flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4`.
- **Left:** uppercase date (`toLocaleDateString` weekday/month/day) → `h1` `text-2xl sm:text-3xl lg:text-4xl` greeting + `👋` → muted subtitle *"Kleine Schritte jeden Tag, große Fortschritte fürs Leben."*
- **Right, two cards** (`cardStyle`, `gap-3`):
  - **Day Streak** (`min-w-[140px]`): 🔥 · `data.streak` · label "Day Streak" · "Keep going!" if streak>0 else "Start today!".
  - **Current Level** (`min-w-[160px]`): label "Current Level" · `A1` gradient badge + "A1 Beginner" · thin progress bar filled to `data.level_progress_pct`% · "120 / 300 XP to A2".

### Section 2 — Hero (`function Hero()`)
- Box: `rounded-[20px]`, `h-[190px] sm:h-[210px]`, border `1px solid rgba(123,63,251,0.15)`, layered glow shadow.
- Base gradient: `linear-gradient(170deg,#050420,#0c062d,#110940,#0c062d,#050420)`.
- Layers (back→front): radial purple ambient glows → blurred **moon** (top≈10%, left 58%, ~100px) → **gate image** `url('/gate.jpg')` `background-size:110% auto`, `position:55% 35%` → purple tint overlay → left-edge darkening (for text legibility) → bottom gradient → inset vignette.
- **Left text** (`max-w-[460px]`): kicker "Welcome to DeutschFlow" → `h2` "Your German learning / journey starts here" (`text-2xl→3xl`) → subtitle "Structured lessons, smart flashcards, and an AI tutor—everything you need to go from zero to fluent." → meta "✓ Beginner-friendly | ⏱ 10 min lessons | 📚 80+ lessons".
- **Right CTA glass card** (`hidden lg:flex`, `w-[290px]`, `backdrop-filter:blur(32px)`, purple border): "Ready to begin?" + "Start your first lesson and track your progress." + button **"Start Your First Lesson"** (`glossy-accent`) → `router.push("/curriculum")`.

### Section 3 — Today's Plan
- Label "Today's Plan" (uppercase, tracked) + `grid grid-cols-1 sm:grid-cols-3 gap-4`.
- `<PlanCard>` anatomy: 44px rounded icon tile → title (`text-sm`) → subtitle (`text-xs muted`) → footer text + right chevron. Hover: `-translate-y-1`.
  1. **📖 Your First Lesson** · "Greetings & Introductions" · "10 min · Beginner-friendly" · icon bg `rgba(77,163,255,.1)` (blue) → continue lesson (`/curriculum/{level}/{id}`) or `/curriculum`.
  2. **Aa German Grammar** · "Understand how sentences work" · "Start with articles & pronouns" · icon bg `rgba(162,75,255,.1)` (purple) → `/grammar`.
  3. **🗣️ Practice Speaking** · "Chat with Emma — your AI coach" · "No experience needed" · icon bg `rgba(45,229,115,.1)` (green) → `/chat`.

### Section 4 — Your Progress (single card)
- Label "Your Progress" + one `cardStyle` card, `flex flex-col sm:flex-row items-center gap-6 sm:gap-10`.
- **`<ProgressRing pct>`:** 128–144px SVG, track `rgba(255,255,255,0.05)`, progress stroke gradient `#7B3FFB→#A24BFF` with drop-shadow glow, rotated −90°. Center: `{pct}%` + "Complete".
- **Right block:** heading = `Ready to begin` (pct 0) or `{pct}% complete`; description "Start your first lesson to see your progress here."; **View Roadmap** ghost button (transparent, accent border) → `/curriculum`.
- **6 `<StatCell>`** in `grid grid-cols-2 sm:grid-cols-3 gap-3` (each: 32px icon tile + bold value + uppercase muted label):
  | # | Icon | Value (derived from API) | Label |
  |---|------|--------------------------|-------|
  | 1 | 📖 | `{~pct/6} / 80` | Lessons Completed |
  | 2 | 📝 | `{weakest_words.length*5} words` | Vocabulary Learned |
  | 3 | 📖 | `{~pct/10} topics` | Grammar Topics |
  | 4 | ✅ | `{avg_quiz_score}%` | Quiz Accuracy |
  | 5 | 🃏 | `{cards_due_today} cards` | Cards to Review |
  | 6 | ⏱ | `{~pct/6*10}m` | Study Time |

### Section 5 — Review + Activity (`grid sm:grid-cols-2 gap-4`)
- **Review & Practice card:** label + two hover rows:
  - 🃏 "Flashcards Complete" / "Nothing due — excellent work!" + chevron.
  - 🎯 "Discover Your Level" / "Find out what you already know" + chevron.
- **Recent Activity card** (centered): label · 🌱 (4xl) · "Your journey begins" · "Complete your first lesson to see activity here." · **Start Lesson →** button (`glossy-accent`) → `/curriculum`.

### Section 6 — Tip of the Day
- `cardStyle` card, `flex items-center gap-6`: label "Tip of the Day" + text "Review before bed — sleep helps your brain consolidate new vocabulary." + "Browse lessons →" link → `/curriculum`. Right side: inline decorative ~80×80 SVG (book/lamp, purple tints), `hidden sm:block`.

---

## 4. Exact style tokens (current production)

**`cardStyle`** (inline object reused by most cards):
```
background : linear-gradient(180deg, rgba(255,255,255,.015) 0%, transparent 30%), var(--color-card-bg)
border     : 1px solid rgba(255,255,255,0.05)
borderRadius: 20px
boxShadow  : 0 8px 24px rgba(0,0,0,0.35)
```

**Theme CSS variables** (`globals.css` `:root`):
| Token | Value | | Token | Value |
|-------|-------|-|-------|-------|
| `--color-page-bg` | `#080B18` | | `--color-text` | `#FFFFFF` |
| `--color-card-bg` | `#11162A` | | `--color-text-secondary` | `rgba(255,255,255,.65)` |
| `--color-card-alt` | `#14182D` | | `--color-text-muted` | `rgba(255,255,255,.35)` |
| `--color-card-elevated` | `#171B31` | | `--color-accent` | `#7B3FFB` |
| `--color-sidebar-bg` | `#0A0D1A` | | `--color-accent-light` | `#8B46FF` |
| `--color-header-bg` | `#0C0F1F` | | `--color-accent-dark` | `#6D28D9` |
| `--color-border` | `rgba(255,255,255,.05)` | | `--color-accent-gradient` | `linear-gradient(135deg,#7B3FFB,#8B46FF,#A24BFF)` |
| `--color-input-bg` | `#11162A` | | `--color-brand-gradient` | `linear-gradient(135deg,#7B3FFB,#A24BFF,#D56CFF)` |

**Spacing / geometry constants seen on the page:**
- Section vertical gap: **20px** (`space-y-5`). Card grids gap: **16px** (`gap-4`). Inner stat grid gap: **12px** (`gap-3`).
- Card radius: **20px**. Card padding: **20–24px** (`p-5`/`p-6`). Icon tiles: 44px (plan), 32px (stat), 36–38px (review rows).
- Content max-width: **1280px**, centered.

---

## 5. Responsive behavior
- **≥1024px (lg):** greeting row is horizontal; hero CTA glass card visible.
- **640–1023px (sm–md):** Today's Plan and Review/Activity become their grids; hero CTA card hidden below `lg`; greeting stacks.
- **<640px:** everything collapses to a single column; stat grid drops to 2 columns; hero text-only (gate still background).

---

## 6. Mental model (one paragraph)
The dashboard is a centered 1280px column of six stacked sections separated by 20px gaps, all sitting inside a persistent sidebar+header shell. Reading order: a personalized **greeting** with two small stat cards (streak, level+XP) → a cinematic **hero** (dark-navy→purple gradient, Brandenburg gate photo, moon, glowing glass "Start" CTA) → **Today's Plan** (3 equal action cards: lesson/grammar/speaking) → **Your Progress** (one wide card: circular % ring on the left, a 3×2 grid of six KPI stat cells on the right, plus a View-Roadmap button) → **Review + Activity** (two side-by-side cards) → **Tip of the Day** (wide card with a small SVG). Everything uses the same dark glass card style (`#11162A` surface, 20px radius, faint white border, soft shadow) with violet accents (`#7B3FFB`). Values are all driven by one `GET /dashboard` API call and shown in their empty/zero "new user" state in the copy above.
```
```

> **If you are a new session:** the above is the *current/production* layout. A redesign is in progress in `Downloads/deutschflow-dashboard-preview.html` (sandbox) and specified in `web/UI_AUDIT/`. Do not modify production files until the user explicitly says `EXECUTE`.
