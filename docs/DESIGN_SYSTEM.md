# DeutschFlow — Design System & Brand Identity

**Version:** 2.0
**Last Updated:** 2026-07-11
**Source of Truth:** `web/app/globals.css`, `web/contexts/ThemeContext.tsx`, `web/tailwind.config.ts`

---

## Overview

DeutschFlow uses a **CSS-custom-property theming system** with 15 color themes. Every component references semantic CSS variables (`--color-text`, `--color-card-bg`, etc.) rather than hardcoded color values. This enables runtime theme switching without recompilation.

The base framework is **Tailwind CSS v4** with the `@import "tailwindcss"` directive (no `@tailwind base/components/utilities`). Custom CSS lives in `web/app/globals.css`.

---

## Brand Identity

### Brand Mission

DeutschFlow exists to make German fluency accessible — not through gamification or gimmicks, but through structured, intelligent, and respectful learning design. We treat language learning as an intellectual pursuit worthy of a premium digital experience.

### Brand Personality

DeutschFlow is the knowledgeable, patient tutor who never makes you feel stupid for asking a basic question. It speaks to you in clear English while gently immersing you in German. It celebrates your wins without infantilizing you. It takes your learning seriously because you take your learning seriously.

### Emotional Goals

When a learner uses DeutschFlow, they should feel:

| Emotion | How We Create It |
|---------|-----------------|
| **Capable** | Clear next steps, never lost, progress always visible |
| **Calm** | Dark theme, generous spacing, no timers, no pressure |
| **Curious** | "Tip of the Day," grammar explanations, AI tutor invites exploration |
| **Proud** | Progress rings, streaks, completed lessons — tangible evidence of growth |
| **Respected** | No cartoon mascots, no infantilizing copy, no gambling mechanics |

### Brand Keywords

Professional · Intelligent · Patient · Premium · Modern · Calm · Encouraging · Structured · Immersive · Respectful

### Anti-Keywords (What We Are NOT)

Gamified · Childish · Cluttered · Corporate · Generic · Stressful · Addictive · Manipulative

### Visual Personality

The DeutschFlow interface feels like a thoughtfully designed study space — dark, focused, with moments of warm color. It uses deep indigo-purple as its signature, generous rounded corners to soften the seriousness, and subtle glows to draw attention without shouting. The system font stack keeps the interface native and performant. Emojis add warmth without becoming the personality.

### Tone of Interface

Every piece of microcopy should sound like a supportive tutor, not a software manual:

- ✅ "All caught up! Come back later for more practice."
- ❌ "0 cards due."

- ✅ "Your first German lesson awaits."
- ❌ "No lessons started."

- ✅ "10 minutes every day beats 2 hours once a week."
- ❌ "Study more to improve your stats."

- ✅ "Guten Morgen, Sarah."
- ❌ "Welcome back, User."

The interface speaks to the learner in English with German greetings and vocabulary — never the other way around. A beginner should never encounter a German word they haven't been taught.

### Premium Experience Principles

1. **Nothing feels like a template.** Every component, every spacing decision, every color choice is intentional. The interface should never evoke "Bootstrap" or "Tailwind demo."
2. **Dark mode is the default, not an option.** The app starts in a deep indigo night. The 15 themes are color variations on dark — there is no light mode because learning is a focused, screen-intensive activity.
3. **Generous but not wasteful.** Spacing is comfortable (24px gap, 20px padding on cards) but no section wastes 100px on decoration. Every pixel serves the learning experience.
4. **Progress over pressure.** Streaks are positive ("5-day streak!") not threatening ("Don't break your streak!"). There are no countdown timers, no "you're falling behind" notifications.
5. **AI is a tutor, not a gimmick.** The chat feature is called "Language Coach" not "AI Chat." The persona (Emma) is introduced as a teacher. Suggested prompts guide productive learning conversations.

---

## Brand Signature

This section defines what makes DeutschFlow **instantly recognizable** from a screenshot. These are the non-negotiable visual signatures that differentiate the product from every other dark-theme dashboard.

### The Brand Purple

DeutschFlow's signature color is a **purple-to-amber gradient**: `linear-gradient(135deg, #7c3aed, #f59e0b)`. It appears in:

- The "Flow" part of the DeutschFlow logotype
- The accent gradient on primary buttons
- The progress ring on the dashboard
- The brand divider line on the login page

**Philosophy:** Purple represents intelligence and creativity. Amber represents warmth and achievement. Together they say: "Learning is intellectually serious and personally rewarding."

Never use purple alone as a flat color. DeutschFlow's purple always has depth — a gradient, a glow, or a translucent overlay. Flat purple (`#6366f1`) is reserved for utilitarian UI elements (focus rings, active states).

### Accent Color Hierarchy

| Tier | Color | Usage |
|------|-------|-------|
| **Primary** | Purple-amber gradient | Brand moments, primary CTAs, progress |
| **Secondary** | Indigo (`#6366f1`) | Interactive states, links, badges |
| **Tertiary** | Slate, emerald, amber | Supporting UI, semantic states |

The accent gradient is never used as a background fill for large areas. It's reserved for: buttons, progress bars, text highlights, and decorative lines. This restraint makes it feel special when it appears.

### The Rounded Corner Philosophy

DeutschFlow uses generous, consistent border-radius: `rounded-2xl` (16px) for cards, `rounded-xl` (12px) for buttons and inputs. Nothing uses sharp corners.

**Philosophy:** Rounded corners soften the dark interface and make it feel approachable rather than severe. The consistency of `rounded-xl`/`rounded-2xl` across every card, button, and input creates a cohesive softness that is distinctly DeutschFlow.

Sharp corners are forbidden. If an element has a border, it has a radius. This is the single most reliable way to spot a DeutschFlow component.

### Card Philosophy

Every card in DeutschFlow follows the same formula:

```
dark surface + 1px subtle border + generous radius + comfortable padding
```

Cards are containers for content, not decorative elements. They should feel like they're resting on the page, not floating above it. The border (`1px solid var(--color-border)`) is always present and always the same color — cards don't use shadows to create depth. The page is flat. Cards are distinguished by their border, not by elevation.

This creates a unified surface language: every card is clearly a card, no card pretends to be something else. The learner's eye learns this pattern immediately and can scan the page without cognitive effort.

### Glow Usage

DeutschFlow uses subtle colored glows as a **focus and emphasis mechanism**, not as decoration.

| Context | Glow | Purpose |
|---------|------|---------|
| Progress ring | Purple glow on SVG circle | Draws eye to primary progress indicator |
| Primary button hover | Purple box-shadow | Confirms the CTA is the most important action |
| Dropdown | Dark shadow | Separates floating UI from page surface |
| Active card outline | Purple ring (box-shadow outline) | Highlights selected/next item |

**Rule:** Glows are only used on the accent color. Green, amber, or red elements never glow. Only purple glows. This creates a consistent visual language where "glow = important" and "glow = DeutschFlow purple."

### Gradient Usage

Gradients in DeutschFlow serve one purpose: **to mark progress and forward motion.** They appear on:

- Progress bars (left-to-right fill)
- Progress rings (SVG stroke with gradient)
- Primary CTA buttons (diagonal gradient)
- Continue Learning card (gradient background for new users)

Gradients never appear on: static cards, navigation, input fields, badges, or text (except the brand logotype). This restraint makes gradients meaningful — when you see one, something is moving forward.

### Icon Personality

DeutschFlow uses two types of icons:

**SVG Icons** — Clean, 2px stroke weight, outlined style. Used for navigation, actions, and UI controls. Always rendered in the current theme's text color or accent color. Located in `web/components/ui/Icons.tsx`.

**Emoji Icons** — Used as visual accents in cards, recommendations, and empty states. Always wrapped in a fixed-size container (36-40px) with a subtle background tint. Emojis add warmth without becoming the personality — they're seasoning, not the main dish.

The combination of clean SVG UI icons with warm emoji accents creates a distinctive DeutschFlow personality: professional where it needs to be, friendly where it helps.

### Typography Personality

DeutschFlow uses the system font stack — no custom web fonts. This is a deliberate choice:

- **Performance:** Zero font download. Instant render.
- **Native feel:** The interface feels at home on every device.
- **Focus:** Typography should be invisible. The learner should think about German vocabulary, not about what font they're looking at.

The type scale is intentionally modest: body text is 14px, captions are 12px, micro-labels are 10px. Nothing is oversized. Headings use `font-bold` with tight tracking. Body text uses default weight with comfortable line-height. This restraint creates a calm reading experience where content, not typography, commands attention.

### Illustration Style

DeutschFlow does not use custom illustrations. Instead, it uses:

- **Emoji** as placeholders and accents (🌱 for beginner, 🎉 for completion)
- **SVG progress rings** as the primary visual metaphor for learning progress
- **Color and spacing** to create visual interest without decorative imagery

This is intentional: custom illustrations are expensive to maintain, hard to keep consistent, and quickly feel dated. DeutschFlow's visual richness comes from its color system, its spacing, and its motion — not from drawings.

If DeutschFlow ever adds illustrations, they should be: geometric, minimal, line-based, and purple-toned. No characters. No scenes. Abstract representations of concepts (a growing plant for progress, intersecting circles for community, a winding path for the learning journey).

### Motion Style

DeutschFlow's motion language is subtle and functional:

| Context | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page enter | Fade up 6px | 250ms | ease-out |
| Card hover | Lift 2px | 200ms | ease |
| Progress bar fill | Width expand | 700ms | ease |
| Theme switch | Instant | 0ms | — |
| Button press | Scale 0.98 | 150ms | ease-in-out |

**Philosophy:** Motion should be felt, not noticed. No bounces, no springs, no attention-seeking animations. Everything moves exactly as much as it needs to and no more. The `prefers-reduced-motion` query disables all animations — respecting the user's OS-level accessibility preference.

---

## Color Palette

### Semantic Tokens

These are the ONLY color tokens components should reference. Never use raw hex values in components.

```
--color-page-bg         Page background
--color-card-bg         Card, modal, dropdown surface
--color-border          Borders, dividers
--color-text            Primary text, headings
--color-text-muted      Secondary/muted text, placeholders
--color-text-secondary  Body text, descriptions
--color-hover-bg        Hover state background
--color-active-bg       Active/selected state background
--color-active-text     Active/selected state text
--color-badge-bg        Badge/chip background
--color-badge-text      Badge/chip text
--color-accent          Primary accent (borders, icons)
--color-accent-light    Light accent variant
--color-accent-dark     Dark accent variant
--color-accent-gradient Accent gradient (buttons, progress bars)
--color-accent-glow     Accent glow/shadow
--color-sidebar-bg      Sidebar background
--color-header-bg       Header background
--color-input-bg        Input field background
--color-input-border    Input field border
--color-input-focus     Input field focus ring
--color-error-bg        Error state background
--color-error-border    Error state border
--color-error-text      Error state text
--color-success         Success state (green)
--color-warning         Warning state (amber)
--color-skeleton        Skeleton loading animation
```

### Theme Variants

15 dark-mode themes available:

| Theme | Accent | Character |
|-------|--------|-----------|
| Indigo (default) | `#6366f1` | Professional, calm |
| Ocean | `#0ea5e9` | Fresh, modern |
| Steel | `#64748b` | Neutral, minimal |
| Onyx | `#e5e5e5` | High contrast, bold |
| Mono | `#a3a3a3` | Grayscale, focused |
| Amber | `#d97706` | Warm, energetic |
| Sunset | `#f97316` | Vibrant, creative |
| Copper | `#e6a040` | Earthy, grounded |
| Cherry | `#dc2626` | Intense, passionate |
| Rose | `#e11d48` | Soft, elegant |
| Plum | `#a855f7` | Rich, luxurious |
| Lavender | `#8b5cf6` | Gentle, creative |
| Emerald | `#059669` | Natural, balanced |
| Forest | `#4ade80` | Bright, fresh |
| Mint | `#14b8a6` | Cool, refreshing |

**Usage:** Import `THEME_LIST` from `@/contexts/ThemeContext` for theme picker UIs. Never hardcode the theme list.

---

## Typography

### Font Family

```css
font-family: system-ui, -apple-system, sans-serif;
```

System font stack — no web font loading. Optimized for readability on all platforms.

### Type Scale

| Token | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| `text-3xl` (30px) | `sm:text-3xl` | `text-3xl` | Page titles |
| `text-2xl` (24px) | Default | Default | Section headings, dashboard stats |
| `text-xl` (20px) | Default | Default | Card titles, branding |
| `text-base` (16px) | Default | Default | Body text (rarely used) |
| `text-sm` (14px) | Default | Default | Primary body text, buttons, labels |
| `text-xs` (12px) | Default | Default | Secondary text, captions, badges |
| `text-[10px]` | Default | Default | Micro-labels, tab bar |

**Rule:** Use responsive prefixes (`sm:text-3xl text-2xl`) for page titles. Body text should remain `text-sm` site-wide.

### Font Weights

- **Bold** (`font-bold`): Headings, stat numbers, active nav items
- **Semibold** (`font-semibold`): Card titles, button text, labels
- **Medium** (`font-medium`): Supporting text, links
- **Normal** (default): Body text, descriptions
- **Light** (`font-light`): Branding text ("Deutsch" in header logo)

### Tracking

- `tracking-wider`: Uppercase micro-labels (badges, section headers)
- `tracking-widest`: Date labels, brand accent text
- `tracking-[1px]`: Brand name in header

---

## Spacing System

### Section Spacing

All pages use `space-y-6 sm:space-y-8` as their root container spacing. Individual sections may use tighter spacing where appropriate.

| Context | Mobile | Desktop |
|---------|--------|---------|
| Page root | `space-y-6` | `sm:space-y-8` |
| Card grid gaps | `gap-3` or `gap-4` | `sm:gap-4` or `gap-4` |
| Card internal padding | `p-4` or `p-5` | `sm:p-5` or `sm:p-6` |
| Header padding | `px-4` | `sm:px-6` |
| Main content padding | `p-4` | `sm:p-6` |
| Bottom padding (mobile nav) | `pb-20` | `sm:pb-6` |

### Maximum Content Width

- Page container: `max-w-7xl` (1280px), centered with `mx-auto`
- Lesson content: no max-width beyond page container (fills available space)
- Wide screens: content is centered, not stretched to viewport edge

---

## Border Radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-2xl` (16px) |
| Hero cards | `rounded-3xl` (24px) or `rounded-[2rem]` (32px) |
| Buttons | `rounded-xl` (12px) |
| Input fields | `rounded-xl` (12px) |
| Badges, pills | `rounded-full` |
| Icon containers | `rounded-xl` (12px) |
| Modals, dropdowns | `rounded-xl` (12px) |

**Rule:** No `rounded-sm`, `rounded-md`, or `rounded-lg`. Stick to `rounded-xl` and `rounded-2xl` for consistency.

---

## Shadows & Elevation

DeutschFlow is a dark-theme app. Shadows are used sparingly — primarily for hover states and modal elevation. The page itself is flat.

| Context | Value |
|---------|-------|
| Card hover lift | `hover:-translate-y-0.5` (2px lift, no shadow) |
| Primary button glow | `boxShadow: "0 4px 20px rgba(124,58,237,0.3)"` |
| Dropdown menu | `boxShadow: "0 10px 25px rgba(0,0,0,0.3)"` |
| Active stat card | `boxShadow: "0 0 0 3px rgba(124,58,237,0.12)"` (outline glow) |

**Rule:** Avoid heavy box-shadows on static elements. Use them only for floating UI (dropdowns, modals) and interactive feedback (hover, focus).

---

## Iconography

### Shared Icons

Located in `web/components/ui/Icons.tsx`. Use these exported components instead of inline SVGs:

```
Check, ChevronDown, Search, ArrowLeft, ArrowRight,
Play, Pause, Stop, Settings, Book, Clock, SignOut
```

**Usage:**
```tsx
import { Check, ArrowRight } from "@/components/ui/Icons";
<Check className="h-5 w-5" style={{ color: "var(--color-success)" }} />
```

**Rule:** If an icon is used more than twice, add it to Icons.tsx. Inline SVGs are acceptable for single-use icons only.

### Emoji Icons

Emojis are used as visual accents throughout the app (lesson cards, quick actions, tips). They must always be wrapped in a fixed-size container:

```tsx
// ✅ Correct — emoji size is locked
<div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
     style={{ background: card.bg }}>{icon}</div>

// ❌ Wrong — emoji can vary in rendered size
<span className="text-xl">{icon}</span>
```

---

## Component Patterns

### Cards

```tsx
<div className="rounded-2xl p-5 sm:p-6"
     style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
  {/* content */}
</div>
```

All cards must have:
- `rounded-2xl` border radius
- `var(--color-card-bg)` background
- `1px solid var(--color-border)` border
- Responsive padding (`p-5 sm:p-6`)

### Buttons

**Primary (call-to-action):**
```tsx
<button className="px-6 py-3 rounded-xl text-sm font-semibold"
        style={{ background: "var(--color-accent-gradient)", color: "#fff" }}>
  Action
</button>
```

**Secondary:**
```tsx
<button className="px-6 py-3 rounded-xl text-sm font-medium"
        style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)",
                 border: "1px solid var(--color-border)" }}>
  Cancel
</button>
```

**Ghost:**
```tsx
<button className="text-sm hover:text-slate-200 transition-colors"
        style={{ color: "var(--color-text-muted)" }}>
  Back
</button>
```

### Input Fields

```tsx
<input className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-slate-500"
       style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)",
                color: "var(--color-text)" }}
       onFocus={(e) => e.target.style.borderColor = "var(--color-input-focus)"}
       onBlur={(e) => e.target.style.borderColor = "var(--color-border)"} />
```

### Loading States

Use the `.shimmer` CSS class for skeleton loading:

```tsx
<div className="h-8 rounded shimmer" style={{ width: "200px" }} />
```

### Empty States

```tsx
<div className="text-center py-8">
  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
       style={{ background: "rgba(124,58,237,0.08)" }}>📚</div>
  <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>Title</p>
  <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>Description with next action</p>
  <button>CTA →</button>
</div>
```

Empty states must always include:
1. An icon or illustration placeholder
2. A descriptive title
3. An explanation of what to do next
4. A call-to-action button

### Error States

Use the shared `ErrorState` component from `@/components/ui/ErrorState`. It accepts `message` and optional `onRetry`.

---

## Responsive Breakpoints

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Tablets, large phones landscape |
| `lg:` | 1024px | Desktop |

**Rules:**
- Mobile-first: base styles are for mobile, `sm:` and `lg:` add complexity
- Only use `sm:` and `lg:` breakpoints — avoid `md:` and `xl:` for consistency
- Bottom tab bar visible at base, hidden at `sm:hidden`
- Desktop navigation visible at `sm:flex`, hidden at base
- Sidebars (chat scenarios, TOC, vocabulary) visible at `lg:`, stacked at smaller sizes

---

## Layout Grids

### Page Container

All authenticated pages inherit this layout from `(app)/layout.tsx`:

```
<main id="main-content" className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 sm:pb-6">
```

### Content Grids

For two-column layouts (activity + sidebar):
```
grid sm:grid-cols-2 gap-6          // Equal columns
grid lg:grid-cols-[1fr_320px] gap-8 // Content + fixed sidebar
```

For stat/metric cards:
```
grid grid-cols-2 lg:grid-cols-4 gap-3  // 2-col mobile, 4-col desktop
```

For lesson/grammar cards:
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3
```

**Rule:** Always start with 2 columns on mobile. Never use 1 column at base unless the content genuinely needs full width.
