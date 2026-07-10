# DeutschFlow — Design System & Brand Identity

**Version:** 2.1
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

### The Brand Violet

DeutschFlow's signature color is a **rich, luminous violet** — not a flat purple, not a neon glow, but a deep glass-like violet with subtle internal radiance. It is the color of a darkened room lit by a single amethyst lamp: focused, intelligent, and unmistakably premium.

The core brand violet is built on three tones that work together:

| Token | Hex | Role |
|-------|-----|------|
| Deep violet | `#7c3aed` | Gradient origin, the "weight" of the brand |
| Luminous violet | `#8b5cf6` | Mid-tone, the "glow" of the brand |
| Soft violet | `#a78bfa` | Highlight, the "air" of the brand |

These are combined into the **brand gradient**: `linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)` — a diagonal flow from deep to luminous, creating the impression of light moving through glass. This gradient is then tipped with a warm amber (`#f59e0b`) at its terminus to create the full DeutschFlow signature: violet intelligence meeting amber warmth.

**Philosophy:** Violet is the color of creativity, wisdom, and focused concentration — the mental state of a learner in flow. Amber is the color of achievement, warmth, and completion — the feeling of finishing a lesson. Together they tell the DeutschFlow story: from focused study to earned success.

**Glass-like depth, not neon glow:** The violet should feel like light passing through stained glass — present, luminous, but never harsh. It should not glow like a neon sign. It should not dominate like a sports car accent. It should feel like a well-designed study lamp: present enough to work by, subtle enough to think by.

#### Where the Brand Violet IS Used

| Context | Token | Reasoning |
|---------|-------|-----------|
| Primary CTA buttons | Brand gradient background | The most important action on the page should carry the brand's strongest visual signal |
| Active navigation tab | Soft violet highlight | Subtle brand presence that guides without distracting |
| Progress rings (dashboard, lessons) | Brand gradient stroke with subtle glow | Progress is the core metaphor — the brand color tracks advancement |
| Hero section accents | Translucent violet overlays | Decorative circles, ambient glows, level badges |
| Lesson "Start"/"Next" badges | Brand gradient pill | The most important micro-action in the learning flow |
| Brand name "Flow" in header | Brand gradient text clip | The logotype carries the full signature |
| Link hover states | Soft violet | Interactive text references the brand without overwhelming |
| Focus rings | Deep violet | Accessibility requires consistency; violet is DeutschFlow's consistent signal |

#### Where the Brand Violet is NOT Used

| Context | What to use instead | Reasoning |
|---------|-------------------|-----------|
| Large background areas | Dark surface colors (`--color-page-bg`, `--color-card-bg`) | Violet is an accent, not an environment. Large violet surfaces are fatiguing and cheapen the color's impact. |
| Reading surfaces (lesson content, grammar articles) | Neutral dark surfaces with white text | Reading comfort requires neutral backgrounds. Violet-tinted reading surfaces reduce legibility and eye comfort. |
| Large cards | Dark card background with 1px border | Cards are containers for content, not brand billboards. The brand expresses itself through accents within cards, not through card backgrounds. |
| Body text | White or near-white (`--color-text`, `--color-text-secondary`) | Violet text on dark backgrounds has poor contrast and reads as decorative, not informative. |
| Error states | Red (`--color-error-text`) | Error has its own semantic color. Using violet for errors confuses the visual language. |
| Success confirmations | Green (`--color-success`) | Success has its own semantic color. The brand should not compete with system feedback. |
| Non-interactive decorative elements | Subtle border or muted tones | Violet should signal importance. If everything is violet, nothing is important. |

**The restraint principle:** The brand violet is like a signature — it appears in specific, intentional places and nowhere else. When the learner sees violet, they unconsciously register: "this matters." If violet appeared everywhere, it would mean nothing. The restraint creates the premium feel.

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

## Visual Language

This section defines the **philosophy** behind every visual element in DeutschFlow. It answers *why* things look the way they do — not just what tokens to use. The technical specifications (exact values, CSS variables, Tailwind classes) follow in later sections.

### Typography Philosophy

DeutschFlow's typography is **invisible by design**. The system font stack (`system-ui, -apple-system, sans-serif`) loads instantly and renders natively on every platform. There are no web fonts to download, no FOUT to manage, no rendering inconsistencies across operating systems.

The type scale is intentionally modest: body text at 14px, captions at 12px, micro-labels at 10px. Headings use `text-2xl` (24px) on mobile and `sm:text-3xl` (30px) on desktop. Nothing is oversized. The learner should focus on German vocabulary and grammar explanations, not on typography.

**Why system fonts:** A language learning app is a reading-intensive experience. The learner spends most of their time reading lesson content, vocabulary definitions, and grammar explanations. A custom font would be a distraction — it says "look at me" when the interface should say "look at the content." System fonts are also faster, more accessible, and more inclusive across devices.

**Font weights** follow a clear hierarchy:
- **Bold** marks importance: headings, stat numbers, active navigation. It says "pay attention here."
- **Semibold** marks structure: card titles, button labels, section headers. It says "this is a distinct section."
- **Medium** marks interactivity: links, hoverable text. It says "you can click this."
- **Normal** is for reading: body text, descriptions, lesson content. It says nothing — it just delivers information.

**Letter spacing** is used sparingly and only for uppercase micro-labels. `tracking-wider` on all-caps labels like "DAILY REVIEW" or "LEVEL PROGRESS" improves legibility at small sizes. The brand name in the header uses `tracking-[1px]` for a polished, logotype feel.

### Whitespace Philosophy

DeutschFlow is **generous but not wasteful**. Every pixel of whitespace serves one of three purposes:

1. **Separation** — Space between sections (`space-y-6` on mobile, `sm:space-y-8` on desktop) tells the eye "this is a new section." The gap is large enough to be unambiguous but not so large that content feels disconnected.

2. **Breathing room** — Padding inside cards (`p-5 sm:p-6`) gives content space to be read comfortably. Cards never feel cramped. Text never touches the card edge.

3. **Focus** — The empty space around the centered page container (`max-w-7xl mx-auto`) creates a dark margin that focuses attention on the content. On ultra-wide displays, the content doesn't stretch — it stays comfortably narrow and centered.

**What DeutschFlow avoids:** Massive hero sections with 200px of decorative padding. Empty columns. "Trendy" asymmetric layouts that sacrifice scannability for visual interest. Every section earns its vertical space by containing meaningful content.

### Spacing Philosophy

DeutschFlow uses a **4px base spacing scale** — every spacing value is a multiple of 4. This creates mathematical consistency across the entire interface:

```
4px → 8px → 12px → 16px → 20px → 24px → 32px → 40px → 48px → 64px
```

Cards use 20px internal padding (`p-5`). Grid gaps use 12px or 16px (`gap-3` or `gap-4`). Section spacing uses 24px or 32px (`space-y-6` or `space-y-8`). The consistency means the eye learns these rhythms and can scan the page effortlessly.

**Why 4px:** It's the smallest visible increment on most screens. It divides evenly into every common screen width. It maps cleanly to Tailwind's spacing scale (which is also 4px-based).

### Elevation Philosophy

DeutschFlow is a **flat design.** Cards do not cast shadows on the page. The page surface is uniform. Depth is communicated through borders and color, not elevation.

There are only two exceptions to the flat rule:

1. **Dropdown menus** — These float above the page with a dark shadow (`0 10px 25px rgba(0,0,0,0.3)`) because they are temporary overlays that need to feel separate from the page surface.

2. **Button hover states** — Primary CTAs gain a subtle glow on hover (`0 4px 20px rgba(124,58,237,0.3)`) to confirm interactivity. This is a feedback mechanism, not a decorative shadow.

**Why flat:** Language learning is a focused activity. Depth effects (shadows, layering, elevation) add visual noise that competes with content. A flat design says "everything you need is right here on the surface." It's calmer, faster to render, and easier to maintain consistently.

### Card Philosophy

Cards in DeutschFlow are **containers, not decorations.** Every card follows the same formula:

```
dark surface + 1px subtle border + generous radius + comfortable padding
```

Cards are distinguished from the page background by their slightly lighter surface color (`var(--color-card-bg)` vs `var(--color-page-bg)`) and their border. They do not float. They do not cast shadows. They sit on the page like tiles on a dark floor.

**Why this works:** The eye learns the card pattern immediately. After visiting two or three pages, the learner unconsciously knows: "dark with a border = a card with content I should read." This consistency reduces cognitive load and makes the interface feel cohesive.

**Card variants:**
- **Default card:** `rounded-2xl` (16px), used for content containers, stat displays, activity feeds
- **Hero card:** `rounded-[2rem]` (32px), used for the Continue Learning section — a larger radius signals greater importance
- **Interactive card:** Same as default but with `hover:-translate-y-0.5` — the subtle lift confirms clickability

Cards should never use `rounded-sm`, `rounded-md`, or `rounded-lg`. The `rounded-xl`/`rounded-2xl` pair is the universal DeutschFlow radius language.

### Container Philosophy

DeutschFlow uses a **single centered container** for all authenticated pages:

```
max-w-7xl (1280px), centered with mx-auto, responsive padding
```

This means the content area is exactly the same width on every page. The header, the dashboard, the lesson viewer, the grammar reference — all 1280px max, all centered. This creates a consistent reading experience: the learner's eye never has to adjust to a different column width when navigating between pages.

**Why one container:** Most apps use different max-widths per page (dashboard = wide, lesson = narrow, settings = medium). This creates a jarring experience where the content area jumps in width as you navigate. DeutschFlow's single container says "you're in the same app, on the same surface."

**Exception:** Lesson content on the lesson detail page has no additional max-width beyond the page container — it fills the available space because reading comfort is determined by the page container, not by an inner constraint.

### Button Philosophy

DeutschFlow has exactly **three button styles**, no more:

1. **Primary (CTA):** Accent gradient background, white text, glow on hover. Used for the single most important action on the page — "Resume Lesson," "Start Learning," "Complete & Review." There should ideally be only one primary button visible at a time.

2. **Secondary:** Card background, subtle border, muted text. Used for supporting actions — "Review Flashcards," "Browse Lessons," "Cancel."

3. **Ghost:** No background, no border, muted text that lightens on hover. Used for navigation and low-priority actions — "Back," "Skip," "Practice all →."

**Why three:** More than three button styles create visual confusion — the learner has to parse which button is which. Three styles create a clear hierarchy: primary > secondary > ghost. The primary button is always the accent gradient. The learner learns this in one session.

**Button sizing:** All buttons use `text-sm` (14px) with `px-6 py-3` (24px horizontal, 12px vertical). Mobile buttons may use slightly larger touch targets (`py-3.5`). Icon-only buttons are minimum 44px in both dimensions for touch accessibility.

### Input Philosophy

Input fields are **dark surfaces with clear borders**:

```
dark input background + 1px border + rounded-xl + consistent padding
```

On focus, the border changes from `var(--color-border)` to `var(--color-input-focus)` and a subtle ring appears. On blur, it returns to the default border. This is the only state change — inputs do not change background color, do not grow, do not animate beyond the border transition.

**Why consistent:** The input pattern is used on login, signup, forgot password, settings, and grammar search. The learner encounters the same input behavior everywhere. There's no "different page, different input style" inconsistency.

**Placeholder text** uses `placeholder:text-slate-500` — a muted gray that's clearly different from entered text. Labels use `<label className="sr-only">` for screen readers with visible placeholders for sighted users, or visible labels for settings forms.

### Badge & Tag Philosophy

Badges are **small, semantic, and consistent.** They communicate status at a glance:

- **Accent badges** (gradient background): "Start," "Next," active states
- **Success badges** (green): "Done," "Complete," mastered
- **Outline badges** (transparent with border): "Unit 1," "~10 min," metadata
- **Error badges** (red tint): "3×" for lapsed vocabulary

All badges use `rounded-full` (fully rounded pills) with `text-xs` or `text-[10px]` and `font-semibold`. They're always inline with content, never standalone decorative elements.

**Why badges:** They provide scannable status information without requiring the learner to read paragraphs. A green "Done" badge on a lesson card instantly communicates completion. A red "3×" badge on a vocabulary word instantly communicates difficulty.

### Progress Indicator Philosophy

Progress in DeutschFlow is shown through **continuous visual metaphors**, not isolated percentages:

1. **Progress rings** (SVG donut charts): Used for level completion and course progress. The ring fills clockwise with a purple-to-amber gradient, and the center shows the percentage. A subtle glow on the active arc draws attention.

2. **Progress bars** (horizontal bars): Used for lesson progress and card review progress. Thin (4-6px), rounded, with gradient fill. Always paired with a percentage label.

3. **Strength bars** (segmented bars): Used for vocabulary word difficulty. 5 segments, filled left-to-right, color-coded (green → amber → red).

**Why visual:** A "73%" label is abstract. A ring that's 73% full is intuitive. The learner doesn't need to parse a number — they see the shape and immediately understand "I'm about three-quarters done."

**Progress should always move forward.** Progress indicators never animate backwards. If a learner's percentage drops (e.g., new lessons are added to a level), the ring snaps to the new value instantly — no reverse animation.

### Navigation Philosophy

DeutschFlow navigation is **predictable and persistent.** The same 7 tabs appear on every authenticated page in the same order: Dashboard, Learn, Chat, Review, Quiz, Grammar, Settings.

**Desktop:** Horizontal text tabs in the header. The active tab has a subtle background highlight. All tabs are always visible.

**Mobile:** Fixed bottom bar with icons and micro-labels. The active tab has a top-edge accent line and color change. All 7 tabs are always visible.

**Why persistent:** The learner should never wonder "how do I get to the Review page?" The answer is always the same: it's in the navigation bar. This frees cognitive resources for learning German instead of learning the interface.

### Page Header Philosophy

Every page has a consistent header pattern:

```
Eyebrow (optional, uppercase, tracking-widest, muted)
Title (h1, bold, text-2xl sm:text-3xl, white)
Subtitle (optional, text-sm, muted)
```

This pattern is enforced by the `PageHeader` shared component. No page invents its own header style.

**Why consistent:** The header is the first thing the learner sees on every page. A consistent pattern means the learner always knows where the page title is, what page they're on, and what they can do here.

### Section Header Philosophy

Section headers within pages follow a single pattern:

```
Icon or emoji + uppercase tracking-wider label (text-xs, muted)
```

Example: "📅 Recent Activity," "📝 Words to Practice," "🎯 Today's Plan."

**Why labeled:** The icon provides instant visual recognition. The uppercase label reinforces the section purpose. Together they create scannable page structure without requiring the learner to read every word.

### Empty State Philosophy

Empty states in DeutschFlow are **guidance, not emptiness.** They never show "0," "None," or blank boxes. Every empty state includes:

1. An emoji or icon at comfortable size
2. A descriptive title in sentence case
3. An explanation of what to do next
4. A clear call-to-action button

**Examples:**
- "Your journey begins" → "Complete your first lesson to see activity here" → "Start Lesson →"
- "Build your vocabulary" → "Words you learn will appear here for practice"
- "Nothing to review" → "Complete a lesson to build your vocabulary"

**Why guidance:** A new user with no data should feel encouraged, not confronted with emptiness. The empty state is not a dead end — it's a starting line. Every empty state points the learner toward their next action.

### Loading State Philosophy

Loading states use **shimmer skeletons** that match the page layout. A loading card grid shows skeleton cards in the same positions as the real cards. A loading list shows skeleton rows.

The shimmer animation is a smooth left-to-right gradient sweep at 1.5s. It's visible but not distracting — it communicates "content is loading" without feeling like the app is slow.

**Why skeletons:** Spinners are ambiguous — they say "something is loading" but don't say what. Skeletons say "a card will appear here, a list will appear there." They preview the layout while content loads, reducing perceived wait time.

### Error State Philosophy

Error states use the shared `ErrorState` component:

```
Warning icon + "Something went wrong" title + descriptive message + "Try Again" button
```

The error message is specific when possible ("Failed to load dashboard data.") and generic when the cause is unknown. The retry button lets the learner take action instead of feeling stuck.

**Why actionable:** "Something went wrong" without a retry button is a dead end. "Something went wrong" with a retry button is a temporary setback. The learner can always try again.

### Hover State Philosophy

Every interactive element in DeutschFlow has a hover state — no exceptions:

- **Cards:** `hover:-translate-y-0.5` — subtle 2px lift
- **Buttons:** Lift + optional glow (primary only)
- **Links:** Color lightens (muted → lighter shade)
- **List items:** Subtle background highlight (`hover:bg-white/[0.02]`)

**Why universal:** The learner should never wonder "is this clickable?" If it's interactive, it responds to hover. If it doesn't respond to hover, it's not interactive. This is a binary contract with the user.

### Focus State Philosophy

Focus states use the design token system:

```css
outline: var(--focus-ring-width) solid var(--focus-ring-color);
outline-offset: var(--focus-ring-offset);
```

Applied to ALL interactive elements: `input`, `textarea`, `select`, `a`, `button`, `[role="button"]`, `[tabindex]`.

The focus ring is always 2px, always the accent color (indigo), always offset by 2px. No element has a custom focus style. Keyboard users always see the same blue ring on the focused element.

**Why universal:** Custom focus styles create inconsistency. A universal focus ring means the keyboard user always knows where they are. The consistency is an accessibility feature.

### Transition Philosophy

DeutschFlow uses **subtle, functional transitions** with consistent timing:

| Duration | Purpose |
|----------|---------|
| `150ms` (`--duration-fast`) | Button press, icon hover scale |
| `200ms` (`--duration-normal`) | Card hover, border color change, link color |
| `250ms` (`--duration-page`) | Page enter animation |
| `300ms` (`--duration-slow`) | Theme switch, progress updates |
| `700ms` | Progress bar fill (longer to feel satisfying) |

All transitions use `ease` or `ease-out` easing. Nothing uses `ease-in` (feels sluggish) or `cubic-bezier` springs (feels gimmicky). The motion should be felt, not analyzed.

**Why consistent timing:** When every transition uses the same 200ms duration, the eye learns to expect it. The interface feels cohesive at a subconscious level.

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
--color-brand-gradient  Brand signature gradient (violet → amber)
--color-brand-purple    Brand violet, luminous mid-tone (#a78bfa)
--color-brand-light     Brand violet, soft highlight (#a5b4fc)
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
