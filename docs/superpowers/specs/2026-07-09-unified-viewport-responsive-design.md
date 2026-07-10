# Unified Viewport Design — Spec

**Date:** 2026-07-09
**Status:** Approved
**Goal:** All pages render identically on every device — a single 768px-wide layout scaled to fit the viewport.

## Motivation

The current frontend uses ad-hoc Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`) inconsistently across pages. Mobile, tablet, and desktop layouts diverge in structure, not just sizing, leading to:
- Elements hidden/shown at different breakpoints
- Layout reflows that change the visual hierarchy
- Components that look different from device to device

The user wants a single unified layout that renders the same on every screen.

## Approach: Fixed-Width Layout + Viewport Scaling

Set the app to a fixed design width of 768px. On screens narrower than the design width, scale the entire viewport down proportionally. On wider screens, center the layout.

| Screen width | Behavior |
|-------------|----------|
| < 768px | Browser renders at 768px, downscales to fit |
| ≥ 768px | Layout renders at native size, centered |

### Why 768px?

768px is the traditional tablet breakpoint. It's wide enough to support a desktop-style layout (sidebar + content, multi-column grids) without being so wide that the downscaled text becomes illegible on phones. On a 375px phone screen, the scale factor is ~0.49x — text renders at ~7-8px equivalent, which is at the lower bound of readability but usable with the app's current `text-sm`/`text-base` sizing.

### Why not per-breakpoint responsive?

The user explicitly wants identical rendering on all devices. Adaptive responsive design (hiding/showing elements, reflowing grids) creates different experiences per device — the opposite of the goal.

## Implementation

### Step 1: Viewport Meta Tag

Replace the current viewport meta in `web/app/layout.tsx`:

```html
<meta name="viewport" content="width=768, initial-scale=1.0">
```

This forces the browser's layout viewport to exactly 768px. On phones, the browser renders at 768px and the OS downscales to fit the physical screen. No JavaScript scaling needed — the browser handles it natively.

### Step 2: Lock the Layout Width

Add a CSS rule to lock the app shell at 768px and center it:

```css
/* In globals.css */
html {
  /* Prevent horizontal scroll on overflow, browser handles scaling */
}
body {
  max-width: 768px;
  margin: 0 auto;
}
```

On screens wider than 768px, the layout is centered. On screens narrower than 768px, the viewport meta handles scaling.

### Step 3: Strip All Responsive Breakpoints

Remove every `sm:`, `md:`, and `lg:` Tailwind prefix. The desktop variant of every element becomes the only variant.

**Rule of thumb for each class:**
- `hidden md:flex` → `flex`
- `md:hidden` → `hidden`
- `flex-col sm:flex-row` → `flex-row`
- `grid-cols-2 md:grid-cols-4` → `grid-cols-4`
- `px-4 md:px-6` → `px-6`
- `lg:col-span-2` → `col-span-2`
- `lg:grid-cols-3` → `grid-cols-3`
- `lg:grid-cols-[1fr_180px]` → `grid-cols-[1fr_180px]`

### Step 4: Remove Mobile-Only Elements

Elements that exist only for mobile and are hidden on desktop get removed entirely:
- Mobile bottom tab bar in `TabBar.tsx` and `(app)/layout.tsx`
- Mobile logo on the login page
- Mobile scenario pill bar in `ChatInterface.tsx`
- `pb-24` bottom padding that accounts for the mobile tab bar

### Step 5: Establish Typography Scale

With a fixed 768px design width, we use a single set of font sizes. No responsive typography needed — the viewport scaling handles sizing on small screens:

| Usage | Size | Weight |
|-------|------|--------|
| Hero (login title) | `text-7xl` (~72px) | extralight/bold |
| Page title | `text-2xl` (~24px) | bold |
| Section heading | `text-base` | semibold |
| Body | `text-sm` | normal |
| Caption | `text-xs` | normal |
| Stat number | `text-2xl` | bold |

### Step 6: Touch Targets

With a fixed 768px viewport, touch targets on mobile are proportionally smaller (e.g., a 44px button at 0.49x scale = ~22px physical). This is an inherent tradeoff of the unified approach. We mitigate by ensuring minimum 44px tap targets in the 768px layout, which translates to ~22px on a 375px screen — borderline but functional.

## Files to Modify

| File | Changes |
|------|---------|
| `web/app/layout.tsx` | Add viewport meta (`width=768`), wrap body with max-width |
| `web/app/globals.css` | Add body max-width centering |
| `web/app/(app)/layout.tsx` | Remove mobile-only: bottom tab bar wrapper, `pb-24`, responsive classes on header elements, `hidden sm:` variants |
| `web/app/page.tsx` | Remove mobile logo and `lg:` prefixes; keep split-panel always |
| `web/app/(app)/chat/page.tsx` | Remove responsive classes |
| `web/app/(app)/dashboard/page.tsx` | Remove all `sm:`/`md:`/`lg:` prefixes, keep desktop layout |
| `web/app/(app)/curriculum/page.tsx` | Strip responsive classes from level cards; `grid-cols-5` always |
| `web/app/(app)/review/page.tsx` | Strip responsive classes |
| `web/app/(app)/quiz/page.tsx` | Strip responsive classes |
| `web/app/(app)/settings/page.tsx` | Strip responsive classes |
| `web/app/(app)/grammar/page.tsx` | Strip responsive classes |
| `web/components/ui/TabBar.tsx` | Remove mobile bottom tab bar entirely; keep desktop tab row |
| `web/components/chat/ChatInterface.tsx` | Remove mobile scenario pill bar; scenario sidebar always visible; strip responsive classes |
| `web/components/dashboard/StatsGrid.tsx` | Strip responsive classes |
| `web/components/dashboard/WeakestWords.tsx` | Remove `hidden sm:inline` |
| `web/components/dashboard/ContinueLearning.tsx` | Strip responsive classes |
| `web/components/dashboard/RecentActivity.tsx` | Strip responsive classes |
| `web/app/signup/page.tsx` | Same as login: remove mobile logo, `lg:` prefixes; keep split-panel always |
| `web/app/(app)/curriculum/[level]/[id]/page.tsx` | Strip responsive margins, lg grid classes |
| `web/app/(app)/grammar/[slug]/page.tsx` | Strip responsive grid, remove `hidden lg:block` sidebar |
| `web/components/auth/TierSelector.tsx` | Strip responsive grid classes |
| `web/components/settings/SubscriptionSection.tsx` | Strip responsive grid classes |
| `web/components/quiz/QuestionCard.tsx` | Strip responsive classes |
| `web/components/quiz/QuizSetup.tsx` | Strip responsive classes |
| `web/components/quiz/QuizResults.tsx` | Strip responsive classes |
| `web/components/srs/FlashcardReviewer.tsx` | Strip responsive classes |
| `web/components/srs/SRSStats.tsx` | Strip responsive classes |
| `web/components/curriculum/LessonViewer.tsx` | Strip responsive classes |
| `web/components/grammar/GrammarContent.tsx` | Strip responsive classes |
| `web/components/ui/Skeleton.tsx` | Strip responsive grid |

## Risks

1. **Small text on phones**: At 0.49x scale, 14px text renders at ~7px physical. Acceptable for reading but may cause eye strain over long sessions. Mitigated by the user's explicit preference for identical layout.

2. **Touch target size**: Buttons at 44px design width → ~22px physical on phones. This is below Apple's 44pt HIG guideline but above the 10mm minimum for basic usability. The bottom tab bar (largest touch targets on current mobile) is being removed, which helps since those were ~56px in the mobile layout.

3. **Sidebar/scenario panel width**: The chat scenario sidebar is 208px — at 0.49x that's ~102px physical, which is tight for reading. The sidebar content is simple labels, so this should remain functional.

4. **Horizontal scroll on very small screens**: Sub-320px devices (older phones) would scale to <42%, making the app essentially unusable. This is an acceptable tradeoff given the near-zero user base on such devices.

## What We're NOT Doing

- ❌ Adaptive layouts per breakpoint
- ❌ `transform: scale()` via JavaScript (let the browser's viewport meta handle it)
- ❌ CSS container queries
- ❌ Separate mobile components or pages
- ❌ New UI components — we're removing code, not adding it
- ❌ Responsive typography scale — single fixed scale for the 768px layout

## Success Criteria

1. Open the app on a 375px-wide phone — layout is identical to desktop, proportionally scaled
2. Open on a 768px iPad — exact 1:1 match with desktop layout
3. Open on a 1440px monitor — layout centered at 768px, content identical to mobile
4. No hidden elements at any width — what you see on one device is what you see on all
5. No horizontal scrollbar at any viewport width
