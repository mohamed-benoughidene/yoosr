# Yoosr Landing Page — Spec

> Phase: Design & Implementation
> Status: Ready for implementation
> Content source: yoosr-landing-page-content.md (all 11 sections approved)
> Creative brief: Phase 2 — Dark illustrated/playful, Tines-inspired, MENA-first

---

## Goal

Build a landing page that creates an immediate "WOW" reaction in under 3 seconds, communicates
Yoosr's MENA-first positioning, and converts visitors to email waitlist signups.

---

## Scope

**IN:**
- All 11 sections from approved content file
- Dark illustrated/playful visual system
- Waitlist email capture as the single CTA
- Mobile-responsive (but desktop-first design)
- Smooth scroll animations and illustrated micro-moments
- Arabic typographic accent element in hero

**OUT:**
- Actual Clerk/Convex auth (landing page is static or minimal Next.js)
- Dashboard screenshots in hero (product reveal happens on scroll, not in hero)
- Pricing page (teaser only, no plan details)
- Blog, docs, or any secondary pages
- RTL/Arabic full localization (Phase C — later)

---

## Anti-Cliché Blocklist

These patterns are explicitly forbidden. Antigravity must not use any of them:

- No gradient blobs or purple glow effects
- No floating product UI cards in the hero
- No "trusted by X companies" logo strip as the first element after hero
- No 3-column feature grid as the primary feature section
- No light background with blue/indigo hero
- No "one platform" or "everything in one place" language (content already avoids this)
- No generic sans-serif only — must use Clash Display or Cabinet Grotesk for headings
- No centered-hero-with-two-buttons layout
- No AI robot or chat bubble SVG illustrations

---

## Design System (Landing Page Override)

The landing page intentionally diverges from DESIGN.md (dashboard tokens).
These tokens apply to the landing page only.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `lp-bg` | `#0C0B0F` | Page root — deep warm black |
| `lp-surface` | `#161420` | Cards, elevated sections |
| `lp-surface-2` | `#1E1C2A` | Hover states, nested cards |
| `lp-border` | `rgba(255,255,255,0.08)` | Card borders, dividers |
| `lp-gold` | `#3B82F6` | Primary accent — Electric blue |
| `lp-gold-glow` | `rgba(59,130,246,0.15)` | Blue glow behind illustrations |
| `lp-violet` | `#6C63FF` | Secondary accent — electric violet |
| `lp-violet-glow` | `rgba(108,99,255,0.12)` | Violet glow effects |
| `lp-text` | `#F2EFE9` | Primary text — warm off-white |
| `lp-text-secondary` | `#9E9AA8` | Supporting text, captions |
| `lp-text-muted` | `#5C5870` | Timestamps, micro-labels |

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Hero headline | Cabinet Grotesk | 800 ExtraBold | Load from Fontshare CDN |
| Section headlines | Cabinet Grotesk | 700 Bold | |
| Body / subheadline | Inter | 400 Regular | Same as dashboard |
| Feature card titles | Cabinet Grotesk | 600 SemiBold | |
| Arabic accent word | Noto Naskh Arabic | 700 Bold | Single word only: يُسر |
| Badge / micro-label | Inter | 500 Medium | Uppercase, 0.08em tracking |

**Load Cabinet Grotesk from Fontshare:**
```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,600&display=swap" rel="stylesheet">
```

**Load Noto Naskh Arabic from Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=swap" rel="stylesheet">
```

### Hero Headline Scale

| Breakpoint | Size | Line Height |
|---|---|---|
| Desktop (xl+) | 80px | 88px |
| Desktop (lg) | 64px | 72px |
| Tablet (md) | 48px | 56px |
| Mobile | 36px | 44px |

Letter spacing: `-0.03em` on all hero headlines.

### Illustration System

STATUS: Not implemented. All section illustrations replaced with 
lucide-react icons. Hero illustration replaced with product video frame.

**Style:** Stroke-based, geometric, abstract. Characters have no faces — expressive blobs
with limbs. Tines-inspired but warmer. Maximum 3 colors per illustration:
`lp-gold` + `lp-violet` + `lp-text` on `lp-bg`.

**Stroke width:** 1.5px consistent.

**Character rules:**
- Support agent: rounded blob body, two arms, headset arc above head
- Customer: smaller blob, speech bubble nearby
- Bot: same blob with a small antenna, gold color
- Messages: small rounded rectangles in gold/violet
- Channels: simple rounded squares with channel icon inside (no real logos — abstract)

**Animation principle:** Illustrations breathe. On load: chaos (messages scattered, characters
with arms up). On scroll past: order (messages aligned, characters relaxed).
Use CSS keyframes for all animation. No JS animation libraries for illustrations.

---

## Section Specs

---

### S1 — Hero

**Content source:** Section 1 of content file.

**Layout:** centered single column. Headline and CTA centered, max-width 800px 
headline, 600px subheadline. Below CTA: full-width 16:9 product showcase 
frame (video/gif placeholder). No right column. No illustration.

**Desktop split:** REMOVED.
**Mobile:** REMOVED.

**Top badge:**
- Text: `"Built for MENA · Early Access"`
- Style: `lp-surface` bg, `lp-gold` border `1px`, `lp-gold` text, `radius: 9999px`
- Padding: `6px 16px`, font-size `12px`, weight `500`, uppercase, tracking `0.08em`
- Animate: fade in + slide down `8px` over `400ms` on load

**Headline:** "Automate Support. Capture Sales. Hand Off to Humans."
- Cabinet Grotesk 800, 80px, `lp-text`, letter-spacing `-0.03em`
- Each sentence on its own line — do not wrap mid-sentence
- Animate: words fade in staggered, `30ms` per word, starting at `200ms` after load

**Subheadline:**
- Inter 400, 18px, `lp-text-secondary`, line-height 28px, max-width 520px
- Animate: fade in at `600ms` after load

**Arabic accent (REMOVED):**
- The word `يُسر` — Noto Naskh Arabic 700, 48px, `lp-gold`
- Positioned below subheadline, left-aligned
- Below it in small text: `"yusr — ease, in Arabic. That's what we built."`
  Inter 400, 13px, `lp-text-muted`
- Animate: fade in at `800ms`, subtle gold glow pulse `(lp-gold-glow)` behind it, infinite 3s

**Email input + CTA:**
- Row layout: `[email input _______________________] [Get Early Access →]`
- Input: height `48px`, padding `0 16px`, `lp-surface-2` bg, `lp-border` border,
  `lp-text` color, `radius: 8px`, placeholder `lp-text-muted`
- Input focus: `lp-gold` border `1px`, `lp-gold-glow` box-shadow
- Button: height `48px`, padding `0 24px`, `lp-gold` bg, `#0C0B0F` text (dark on gold),
  Cabinet Grotesk 600, 14px, `radius: 8px`
- Button hover: `opacity: 0.88`, `scale(1.02)`, `100ms`
- Mobile: stack input above button, both full width

**Micro-copy:** "No credit card. No setup fees. Live in under an hour."
- Inter 400, 13px, `lp-text-muted`, centered below input row

**Hero illustration (REMOVED):**
- Right column: an SVG scene, 480px wide, 400px tall
- Scene: abstract agent blob (headset) at a desk, 6–8 message rectangles floating/scattered
  around in gold and violet. Two smaller customer blobs off to the sides.
- Animation class `chaos`: messages animate with `float` keyframes — random translate X/Y,
  rotation ±15deg, duration 2–3s each, staggered, infinite
- On scroll past hero: swap to `calm` class — messages animate to neat vertical stack,
  agent blob relaxes (arms down), `500ms ease` transition

**Background texture:**
- Behind the hero only: a very subtle noise grain overlay, `opacity: 0.03`, `pointer-events: none`
- Two animated ambient glow orbs behind hero content (z-index -1): 
  gold orb top-left (rgba(200,169,110,0.18), 500px, blur 80px, driftGold 12s infinite), 
  violet orb top-right (rgba(108,99,255,0.13), 400px, blur 80px, driftViolet 15s infinite).
- A soft `lp-gold-glow` radial gradient centered behind the illustration, `opacity: 0.4`,
  `blur: 120px`, `width: 400px height: 400px`

---

### S2 — Social Proof Bar

**Content source:** Section 2 of content file.

**Layout:** Full-width scrolling marquee strip.

**Style:**
- Background: `lp-surface`, `border-top: 1px solid lp-border`, `border-bottom: 1px solid lp-border`
- Height: `48px`, `overflow: hidden`
- Items separated by `·` in `lp-gold`
- Font: Inter 500, 13px, `lp-text-secondary`
- Animation: CSS `marquee` keyframe — infinite horizontal scroll, `30s linear`
- On hover: pause animation

**Items (repeat 3× for seamless loop):**
🟢 Early Access · 4 channels, one inbox · AI + human handoff · No-code automation ·
Join 50+ teams on the waitlist → [Get Early Access]

The `→ Get Early Access` is a gold-colored inline link that scrolls to waitlist input.

---

### S3 — Problem / Empathy

**Content source:** Section 3 of content file.

**Layout:** Two-column. Left: text. Right: illustration.

**Left column:**
- Section label: `"THE PROBLEM"` — Inter 500, 11px, `lp-gold`, uppercase, `0.1em` tracking
- Headline: Cabinet Grotesk 700, 48px, `lp-text`, max-width `520px`
- Three pain points as a list:
  - Each item: `lp-surface` card, `lp-border` border, `radius: 8px`, padding `16px 20px`
  - Leading icon: a small gold `—` dash or an illustrated mini-scene (10px)
  - Text: Inter 400, 15px, `lp-text-secondary`
  - Cards appear on scroll: fade in + slide up `16px`, staggered `100ms` each
- Transition line: Inter 400, 16px, `lp-text`, italic, max-width `480px`, `margin-top: 32px`

**Right illustration:**
- An SVG scene: an overwhelmed agent blob with three speech bubbles above its head
  labeled loosely (not real text — abstract rectangles), all from different "apps"
- Each bubble a different shape implying different channels
- Warm gold strokes, violet shadows
- Subtle `float` animation — bubbles drift up slowly

**Background:** Section bg stays `lp-bg`. A faint `lp-violet-glow` gradient behind illustration.

---

### S4 — Core Features Grid

**Content source:** Section 4 of content file.

**Layout:** 2-column grid of feature cards (3 rows × 2 cols on desktop, 1 col on mobile).

**Section header:**
- Label: `"FEATURES"` — same style as S3 label
- Headline: Cabinet Grotesk 700, 48px, centered

**Feature card anatomy:**
- Background: `lp-surface`, border `lp-border 1px`, radius `12px`, padding `28px`
- Top: small illustrated icon (SVG, 40px × 40px) — unique per feature, gold stroke style
- Title: Cabinet Grotesk 600, 18px, `lp-text`, `margin-top: 16px`
- Body: Inter 400, 14px, `lp-text-secondary`, `margin-top: 8px`, line-height `22px`
- On hover: `lp-surface-2` bg, `lp-gold` border `1px`, transition `150ms`
  — a subtle gold glow emanates from the border: `box-shadow: 0 0 0 1px lp-gold, 0 4px 24px lp-gold-glow`

**Feature icons (SVG sketches, gold stroke, no fill):**
1. Visual Bot Builder → a node with two connecting lines (flow diagram shape)
2. Live Monitor → a simple eye shape
3. Unified Inbox → three stacked envelope rectangles converging to one
4. Knowledge Base → an open book shape
5. Order Tracking → a small box with a location pin
6. Analytics & CSAT → a simple bar chart with an upward arrow

**Scroll animation:** Cards enter with `fade-in + scale(0.96 → 1)`, `200ms ease-standard`,
staggered `60ms` per card using Intersection Observer.

**Section background:** `lp-bg`. A very faint horizontal gradient band of `lp-violet-glow`
behind the grid at 20% opacity.

---

### S5 — Design Studio Deep Dive

**Content source:** Section 5 of content file.

**Layout:** Full-width feature spotlight. Dark surface panel.

**Background:** `lp-surface` full-width section — visually distinct from surrounding `lp-bg` sections.

**Structure:**
```
[Section label]
[Headline — large, centered]
[Subheadline — centered, max 600px]

[Three capability cards — horizontal row on desktop, stack on mobile]

[Visual: Design Studio canvas mockup — SVG illustration of nodes and edges]

[Closing line — centered, italic]
```

**Capability cards:**
- Each card: `lp-surface-2` bg, `lp-border` border, radius `10px`, padding `24px`
- Top: a numbered badge (`01`, `02`, `03`) in `lp-gold`, Cabinet Grotesk 700, 13px
- Title: Cabinet Grotesk 600, 16px, `lp-text`
- Body: Inter 400, 14px, `lp-text-secondary`

**Design Studio visual:**
- An SVG illustration (NOT a screenshot) of a flow canvas:
  - 5–6 rounded-rectangle nodes in a left-to-right flow
  - Connecting bezier curve edges in `lp-gold`
  - Node labels: abstract (no real text) — small horizontal lines suggesting text
  - One node highlighted in `lp-gold` border and soft glow (the "active" node)
  - Background: `lp-surface-2`, slight grid dot pattern `rgba(255,255,255,0.03)` at 24px spacing
- Width: full content width, height `280px`, radius `12px`
- Animate on scroll into view: nodes appear one by one, edges draw themselves,
  left to right, `800ms total`, `ease-out`

---

### S6 — Channels

**Content source:** Section 6 of content file.

**Layout:** Left: text stack. Right: illustrated channel map.

**Left column:**
- Label, headline, subheadline — same pattern as S3
- Four channel tiles in a 2×2 grid:
  - Each: `lp-surface` bg, `lp-border` border, radius `10px`, padding `20px`
  - Icon: abstract SVG (40px), gold stroke — no real brand logos
    (Web: globe arc; Telegram: paper plane; Messenger: lightning bolt; Instagram: camera aperture)
  - Title: Cabinet Grotesk 600, 15px, `lp-text`
  - Body: Inter 400, 13px, `lp-text-secondary`
- Closing line below grid

**Right illustration — the MENA map moment:**
- An abstract SVG map — not a realistic geographic map, but a stylized region silhouette
- Dots at approximate positions of: Algiers, Cairo, Riyadh, Dubai, Beirut, Casablanca
- From each dot: an animated line in gold/violet flows into a central inbox icon
- Inbox icon: a simple envelope with a checkmark, centered on the map
- Animation: dots pulse, lines draw sequentially, inbox glows on completion
- Loop: `4s`, `ease-in-out`, infinite
- This illustration is the single most MENA-specific visual on the page

**Section background:** `lp-bg`. The map glows softly behind itself with `lp-gold-glow`.

---

### S7 — How It Works

**Content source:** Section 7 of content file.

**Layout:** Centered, vertical timeline. Three steps.

**Style:**
- Section max-width: `720px`, centered
- Steps connected by a vertical line in `lp-border`
- Each step:
  - Step number: large Cabinet Grotesk 800, 64px, `lp-gold`, `opacity: 0.15` (background numeral)
  - Title overlaid on number: Cabinet Grotesk 700, 22px, `lp-text`
  - Body: Inter 400, 15px, `lp-text-secondary`, max-width `520px`
  - Left edge: a `lp-gold` vertical accent bar, `2px × 100%`

**Scroll animation:** Each step fades in as it enters viewport. The connecting vertical line
draws downward progressively — `scaleY` from 0 to 1 as user scrolls.

**Closing line:** Cabinet Grotesk 700, 24px, `lp-gold`, centered, `margin-top: 48px`

---

### S8 — Who It's For

**Content source:** Section 8 of content file.

**Layout:** Three audience cards, horizontal row on desktop, stack on mobile.

**Card anatomy:**
- Background: `lp-surface`, border `lp-border`, radius `12px`, padding `32px`
- Top: small illustrated scene (SVG, ~60px) per audience type:
  - E-commerce: a small storefront with a shopping bag
  - SaaS: a simple monitor with a graph
  - Agencies: three small abstract figures around a shared screen
- Title: Cabinet Grotesk 700, 20px, `lp-text`
- Body: Inter 400, 14px, `lp-text-secondary`, line-height `22px`
- Bottom: no CTA per card — section has one shared closing line below

**Active state:** On hover, card border becomes `lp-gold 1px` + faint gold glow.
One card can be highlighted by default on desktop (e-commerce — widest audience).

**Closing line:** Centered below cards. Inter 400, 16px, `lp-text-secondary`, italic.

---

### S9 — Trust Signals

**Content source:** Section 9 of content file.

**Layout:** Centered header + three horizontal trust cards.

**Section background:** `lp-surface` full-width band.

**Trust card anatomy:**
- Background: `lp-surface-2`, border `lp-border`, radius `10px`, padding `28px`
- Top: a gold illustrated icon (checkmark shield / group of people dots / speech bubble)
- Title: Cabinet Grotesk 600, 17px, `lp-text`
- Body: Inter 400, 14px, `lp-text-secondary`

**Note for Antigravity:** When real testimonials are available, replace these cards with
quote cards: gold opening quotation mark (Cabinet Grotesk 800, 64px), quote body, author name +
role. Keep the same card dimensions.

---

### S10 — Pricing Teaser

**Content source:** Section 10 of content file.

**Layout:** Centered header + three horizontal pricing promise cards + CTA.

**Header:**
- Label, headline, subheadline — standard section pattern
- Subheadline: Inter 400, 18px, `lp-text-secondary`, max-width `520px`, centered

**Pricing cards:** Same anatomy as trust cards (S9).

**CTA block:**
- Button: full-width on mobile, `max-width: 320px` centered on desktop
- Style: same as hero button — `lp-gold` bg, `#0C0B0F` text, height `52px`, Cabinet Grotesk 600
- Micro-copy below: Inter 400, 13px, `lp-text-muted`

---

### S11 — Final CTA

**Content source:** Section 11 of content file.

**Layout:** Full-width dark section. Centered. Max-width `680px` for text block.

**Background:** `lp-bg` with a centered `lp-gold-glow` radial gradient, `blur: 200px`,
`opacity: 0.25`, `width: 600px`, behind the text block. This is the warmest, most inviting
moment on the page — the reader has earned it.

**Content:**
- Headline: Cabinet Grotesk 800, 56px, `lp-text`, centered, `-0.03em` tracking
- Subheadline: Inter 400, 18px, `lp-text-secondary`, centered, max-width `520px`
- Email input + CTA: same as hero. Full-width on mobile.
- Micro-copy: "No credit card. Setup takes less than 5 minutes."
- Secondary line: Inter 400, 14px, `lp-text-muted`, centered — "Join 50+ teams already on the waitlist."

**Illustration:** The same agent blob from the hero — now feet up, relaxed, coffee in hand.
A small label floats above: `Queue: 0 ✓` in gold. This is the payoff to the hero's chaos scene.

---

## Global Layout Rules (Landing Page)

**Max content width:** `1200px`, centered, `padding: 0 24px`

**Section vertical padding:**
- Mobile: `64px 0`
- Desktop: `96px 0`

**Section label style (reused across all sections):**
- Inter 500, 11px, `lp-gold`, uppercase, `0.1em` tracking, `margin-bottom: 16px`

**Scroll animation default (all sections unless specified):**
- `opacity: 0 → 1`, `translateY: 20px → 0`, `duration: 400ms`, `ease-out`
- Triggered by Intersection Observer at `threshold: 0.15`
- Use a single `useScrollReveal` hook that applies to any element with `data-reveal` attribute

**Navbar:**
- Fixed top, `height: 56px`, `lp-bg` bg + `backdrop-filter: blur(12px)`,
  `border-bottom: 1px solid lp-border`
- Left: Yoosr wordmark (Cabinet Grotesk 700, 20px, `lp-text`)
- Right: `Get Early Access` button — ghost style on dark: `lp-border` border, `lp-text` text,
  height `36px`, radius `8px`. On hover: `lp-gold` border + text, `100ms`
- Mobile: hamburger hidden — only wordmark + CTA button (no nav links needed for landing)

**Footer:**
- Minimal. `lp-surface` bg, `border-top: 1px solid lp-border`
- Padding: `32px 24px`
- Left: wordmark + `© 2026 Yoosr` + `support@yoosr.app`
- Right: "Built for MENA with يُسر" — gold text
- No nav links needed for MVP landing page

---

## Acceptance Criteria

1. Page loads and hero animation plays correctly within 2s on a standard connection
2. Headline typography uses Cabinet Grotesk at correct sizes on all breakpoints
3. Arabic word `يُسر` renders correctly in Noto Naskh Arabic, gold color, with subtitle
4. Hero illustration shows chaos state on load; transitions to calm state on scroll past hero
5. MENA map illustration in S6 shows animated lines from regional dots to central inbox
6. All scroll reveal animations fire correctly on Intersection Observer (not on load)
7. Email input in S1 and S11 submits and shows success state (toast or inline confirmation)
8. Social proof marquee (S2) scrolls infinitely and pauses on hover
9. All colors use the `lp-*` CSS variables — zero hardcoded hex values in component files
10. No section uses a 3-column feature grid as its primary layout (S4 uses 2×3)
11. No competitor clichés from the blocklist appear anywhere on the page
12. Page is fully responsive at 375px, 768px, 1024px, and 1440px breakpoints
13. Navbar CTA and both hero + footer CTAs scroll to / focus the email input
14. Cabinet Grotesk and Noto Naskh Arabic load from CDN with `display=swap` fallback

---

## Dependencies

- `AGENT.md` — must be read before any implementation prompt
- `DESIGN.md` — reference only; landing page uses `lp-*` token overrides, not dashboard tokens
- Cabinet Grotesk loaded from `api.fontshare.com`
- Noto Naskh Arabic loaded from Google Fonts
- Waitlist backend: a Convex mutation `joinWaitlist(email)` that stores to a `waitlist` table
- No Clerk auth on landing page — it is a public route

---

## Implementation Task Order

Tasks are sequential. Do not start a task until the previous one is verified.

| # | Task | Scope | Model |
|---|---|---|---|
| T1 | Global setup | CSS variables, fonts, navbar, footer, page shell | Gemini Pro |
| T2 | S1 Hero | Layout, typography, Arabic element, email CTA | Gemini Pro |
| T3 | Hero illustration | SVG chaos/calm scene + animation | Gemini Pro |
| T4 | S2 Marquee | Scrolling trust bar | Gemini Flash |
| T5 | S3 Problem | Layout, pain point cards, illustration | Gemini Pro |
| T6 | S4 Features | 2×3 card grid, SVG icons, hover states | Gemini Pro |
| T7 | S5 Design Studio | Canvas illustration, capability cards | Gemini Pro |
| T8 | S6 Channels | Channel tiles, MENA map illustration + animation | Gemini Pro |
| T9 | S7 How It Works | Timeline layout, scroll-draw animation | Gemini Flash |
| T10 | S8 Who It's For | Audience cards, illustrated icons | Gemini Flash |
| T11 | S9–S10 Trust + Pricing | Trust cards, pricing cards, CTA | Gemini Flash |
| T12 | S11 Final CTA | Payoff section, relaxed agent illustration | Gemini Pro |
| T13 | Scroll reveal system | Global `useScrollReveal` hook, apply to all sections | Gemini Flash |
| T14 | Waitlist backend | Convex `joinWaitlist` mutation + `waitlist` table | Gemini Flash |
| T15 | Responsive pass | Test + fix at 375/768/1024/1440px | Gemini Pro |
| T16 | Polish pass | Timing, easing, micro-interactions, final review | Gemini Pro |
