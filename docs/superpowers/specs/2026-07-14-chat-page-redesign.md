# Chat Page Redesign — Synthwave Premium

**Date:** 2026-07-14
**Branch:** `feat/dashboard-synthwave-redesign`

## Context

The chat page currently uses basic card styles and feels disconnected from the premium synthwave aesthetic established by the dashboard and curriculum pages. This redesign brings the chat experience up to the same visual quality level — glass cards, purple glow effects, gradient accents, translucent theme colors — while adding personalization through an Emma-branded greeting card that shows recent learning activity.

## Layout: Three-Column Desktop

```
┌──────────────┬─────────────────────┬──────────────┐
│ LEFT (w-56)  │ CENTER              │ RIGHT (w-64) │
│ Emma card    │ Context bar         │ Session      │
│ Try These    │ Messages            │ Summary      │
│ Emma details │ Input bar           │ Recent Topics│
└──────────────┴─────────────────────┴──────────────┘
```

- Left + right sidebars: `hidden lg:flex`
- On mobile: Try These becomes horizontal scroll pill row; right sidebar collapses, content accessible via slide-in or omitted
- Left sidebar scrolls independently if content overflows

## Section 1: Emma Greeting Card (Left Sidebar, Top)

Glass card with purple ambient glow, same design family as dashboard `cardStyle` and curriculum hero.

- **Emma avatar**: 48px circle, gradient border (`#6D3BFF → #FF3CA6`), outer glow ring (`rgba(109,59,255,0.25)`)
- **Greeting**: "Hi [firstName]! 👋" — name in accent color, white bold text
- **Activity line**: Small muted label "Yesterday you learned" / "Recently you practiced" above the content
- **Content**: Most recent item from `DashboardData.recent_activity[0]` — displayed in larger semi-bold highlight text. Falls back to "Start your first lesson today! 🌱" with a link to `/curriculum` when no activity exists
- **No CTA button** — card is informational only

Data source: `useQuery<DashboardData>(["dashboard"])` — already available.

## Section 2: "Try These" (Left Sidebar, Middle)

Heading: small uppercase muted label — "TRY THESE" (Emma's voice, replacing "Modes").

Six full-width pill buttons, each with unique translucent color accent:

| Emoji | Label | Mode key | Accent color |
|-------|-------|----------|-------------|
| 🎭 | Act out a situation | `roleplay` | purple-pink (#D946EF) |
| 📖 | Break down a rule | `grammar` | blue (#3B82F6) |
| 🌿 | Grow my word bank | `vocab` | green (#22C55E) |
| ✍️ | Make my German natural | `writing` | amber (#F59E0B) |
| 🗣️ | Nail the pronunciation | `pronunciation` | rose (#F43F5E) |
| 🎯 | Crush the next exam | `exam` | violet (#8B5CF6) |

Each button:
- Glass translucent background tinted with its accent color at ~12% opacity
- Border: accent color at ~20% opacity
- Active state: brighter background, border glow, subtle box-shadow
- Hover: `-translate-y-0.5` + brighter border
- "Free Chat" removed — it's the default when no mode is active

Mobile: horizontal scroll row of compact pills (emoji + short label).

## Section 3: Emma Details (Left Sidebar, Bottom)

Compact footer card at the bottom of the scrollable sidebar:

- 24px Emma avatar + "Emma · German Tutor"
- "Online ✓" in green accent
- Subtle muted description: "AI-powered, always ready to help you learn German"
- Same glass style, smaller/quieter than the greeting card above

## Section 4: Context Bar (Center, Top)

Existing context bar restyled — translucent glass background instead of solid card. Content unchanged: level badge · lesson name · vocab preview.

## Section 5: Chat Messages (Center, Middle)

No changes to message bubble styling or Emma avatars in messages. Existing implementation preserved.

## Section 6: Input Bar (Center, Bottom)

```
[📎] [________________________] [➤]
```

- **File attach (📎)**: 44px circle button, glass background, opens `<input type="file" accept="image/*,.pdf">`. Shows file count badge when files selected. UI only — backend processing deferred.
- **Input field**: Existing pill input, unchanged styling
- **Send (➤)**: 44px gradient circle (pink→purple) replacing rectangular "Send" text button. Arrow icon (→). Disabled: reduced opacity. Active: subtle glow (`boxShadow: 0 0 12px rgba(217,70,239,0.4)`)

## Section 7: Session Summary (Right Sidebar, Top)

Fancy colored icon boxes — each section gets a distinct icon in a colored background box:

| Section | Icon | Icon box color |
|---------|------|---------------|
| Words discussed | 🗣️ | Emerald green bg |
| Grammar explained | 📖 | Purple bg |
| Corrections | ✍️ | Amber bg |
| Useful phrases | 💬 | Rose bg |

Each section: icon box (32px, rounded-lg, colored bg) + label + list of items. Glass card wrapper with purple border.

Data: existing `SessionSummary` state in `ChatInterface`.

## Section 8: Recent Topics (Right Sidebar, Bottom)

Plain text list — no icons:

```
Greetings & Introductions
A1 · Lesson 1

Articles: der / die / das
A1 · Lesson 3

Verb Conjugation
A1 · Lesson 5
```

Each item: title line + subtitle line. Glass card wrapper. Data from `DashboardData.recent_activity` or derived from lesson context.

## Files to Modify

| File | Changes |
|------|---------|
| `web/components/chat/ChatInterface.tsx` | Major: new sidebar layout, Emma card, Try These pills, input bar redesign, right sidebar cards |
| `web/app/(app)/chat/page.tsx` | Minor: remove page-level header (moved into sidebar), adjust layout wrapper |

## Design Tokens (Reused)

All styles reference patterns already established in:
- `web/app/(app)/dashboard/page.tsx` — `cardStyle`, `shinyCard`, gradient buttons, glass backgrounds, glow effects, KPI icon boxes
- `web/app/(app)/curriculum/page.tsx` — Emma avatar in gradient circle with glow, glass mission cards, gradient CTA buttons

No new design tokens introduced. Everything reuses existing synthwave patterns.

## Verification

1. Start dev server: `cd web && npm run dev`
2. Navigate to `/chat`
3. Verify: Emma greeting card shows avatar + "Hi [Name]!" + recent activity
4. Verify: "Try These" shows 6 styled pills, clicking one changes chat mode
5. Verify: Send button is a round gradient circle with arrow
6. Verify: File attach button opens file picker
7. Verify: Right sidebar shows session summary with colored icons
8. Verify: Recent topics list renders from dashboard data
9. Test mobile viewport: Try These becomes horizontal scroll, sidebars hidden
10. Verify all existing chat functionality works (send message, mode switching, corrections)
