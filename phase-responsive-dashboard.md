# Responsive Dashboard — Spec

## Goal
Make the Yoosr dashboard fully responsive (mobile-first) without breaking
the existing desktop layout at any point during implementation.

## Breakpoints
- Mobile: < md (< 768px) → bottom nav, single-column
- Tablet: md–lg (768px–1024px) → bottom nav, simplified layouts
- Desktop: ≥ lg (≥ 1024px) → sidebar, full layouts (MUST NOT CHANGE)

## Scope

### IN
- Shell layout: sidebar hidden on mobile/tablet → bottom nav replaces it
- Monitor page: 3-panel → stacked panels with tab/back navigation on mobile
- Chat section: conversation list + chat area → stacked with back navigation
- Remaining dashboard pages: single-column stack on mobile
- Stats row, tables, forms: horizontal scroll or stack where needed

### OUT
- Landing page (separate effort)
- Design Studio (canvas-based — separate effort)
- Any desktop layout changes — desktop must stay pixel-identical
- Dark mode or theme changes

## Core Safety Rules (must be enforced in every prompt)
1. Only ADD responsive prefixes (sm:, md:, lg:) — never remove or replace
   existing classes that work on desktop
2. Never use arbitrary values (w-[240px]) — use Tailwind scale only
3. Never touch z-index manually — use Tailwind z-* classes only
4. One layout zone per prompt — no combining zones
5. Audit after every prompt before proceeding

## Phases

### Phase R-1: Shell Layout
**Goal:** Sidebar hidden on mobile/tablet. Bottom nav appears on mobile/tablet.
Desktop sidebar unchanged.

Components touched:
- Main layout wrapper (the root dashboard layout file)
- Sidebar component
- New BottomNav component (created fresh)

Bottom nav items (5 max — icon + label):
- Home (House icon)
- Monitor (Headphones icon)
- Chat (MessageSquare icon)
- Contacts (Users icon)
- Settings (Settings icon)

### Phase R-2: Monitor 3-Panel Layout
**Goal:** On mobile, show one panel at a time with back navigation.
On tablet, show 2 panels (list + chat). On desktop, all 3 unchanged.

Navigation logic:
- Mobile default view: conversation list
- Tap conversation → slide to chat panel (back arrow returns to list)
- Tap contact info icon → slide to contact panel (back arrow returns to chat)
- State managed with a local `view` enum: "list" | "chat" | "contact"

### Phase R-3: Chat Section
**Goal:** Same pattern as Monitor — list → chat area stacked on mobile
with back navigation.

### Phase R-4: Remaining Pages
**Goal:** All other dashboard pages (Settings, Analytics, Contacts, etc.)
become single-column on mobile. Tables get horizontal scroll wrapper.
Forms stack vertically. Stats row wraps to 2-column grid on mobile.

## Acceptance Criteria
1. On mobile (375px), sidebar is not visible and bottom nav is present
2. On desktop (1280px), sidebar is present and bottom nav is not visible
3. On mobile, Monitor shows one panel at a time — tapping a conversation
   opens the chat panel; a back button returns to the list
4. On desktop, Monitor 3-panel layout is pixel-identical to before
5. No horizontal overflow on any page at 375px width
6. No z-index overlap issues (sidebar ghost, drawer bleed)
7. All existing desktop Tailwind classes are preserved untouched

## Dependencies
- react-doctor audit run before Phase R-1 begins
- No other open branch — responsive work happens on a clean branch

## Task Order
R-1 → R-2 → R-3 → R-4
Each phase: Audit → Implement → Verify AC → Proceed

## Tasks
See below — generated after spec approval.