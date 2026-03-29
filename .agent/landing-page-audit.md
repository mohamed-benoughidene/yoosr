# Yoosr Landing Page — Audit Report

> **Date:** 2026-03-28  
> **Scope:** All files that constitute the landing page, checked against [SPECS/landing-page.md](file:///home/mohamed/lab/yoosr/SPECS/landing-page.md)  
> **Mode:** Read-only. No fixes applied.

---

## 1. File Inventory

| # | File | Contents | Lines |
|---|---|---|---|
| 1 | [page.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/%28marketing%29/page.tsx) | Root landing page — imports and renders all sections in order | 120 |
| 2 | [layout.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/%28marketing%29/layout.tsx) | Marketing layout shell — `<Header>` + `<main>` + `<Footer>` | 23 |
| 3 | [Hero.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/Hero.tsx) | Hero section — badge, headline, buttons, stats row, dashboard mockup | 284 |
| 4 | [FeaturesGrid.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/FeaturesGrid.tsx) | Feature cards grid section | 56 |
| 5 | [DesignStudioSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/DesignStudioSection.tsx) | Design Studio deep dive section | 56 |
| 6 | [HowItWorks.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/HowItWorks.tsx) | How It Works 3-step section | 74 |
| 7 | [ChannelsSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/ChannelsSection.tsx) | Channels section — 4 channel tiles | 66 |
| 8 | [AnalyticsSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/AnalyticsSection.tsx) | Analytics feature cards (not in spec) | 66 |
| 9 | [OrdersSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/OrdersSection.tsx) | Orders feature cards (not in spec) | 54 |
| 10 | [Testimonials.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/Testimonials.tsx) | Testimonials/reviews section | 79 |
| 11 | [CtaSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/CtaSection.tsx) | Final CTA section — bg-primary card with two buttons | 59 |
| 12 | [ScrollReveal.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/ScrollReveal.tsx) | Scroll reveal wrapper component (IntersectionObserver) | 49 |
| 13 | [Header.tsx](file:///home/mohamed/lab/yoosr/src/components/layout/Header.tsx) | Navbar — wordmark, nav links, NavigationMenu dropdowns, CTA | 183 |
| 14 | [Footer.tsx](file:///home/mohamed/lab/yoosr/src/components/layout/Footer.tsx) | Footer — multi-column links, newsletter input, social icons | 130 |
| 15 | [MobileNav.tsx](file:///home/mohamed/lab/yoosr/src/components/layout/MobileNav.tsx) | Mobile slide-out Sheet nav | 86 |
| 16 | [NavbarCTA.tsx](file:///home/mohamed/lab/yoosr/src/components/layout/NavbarCTA.tsx) | Navbar CTA — Clerk-aware: Sign In / Get Started / Dashboard | 44 |
| 17 | [PricingTable.tsx](file:///home/mohamed/lab/yoosr/src/components/pricing/PricingTable.tsx) | Full pricing table with 4 plans, monthly/yearly toggle | 165 |
| 18 | [globals.css](file:///home/mohamed/lab/yoosr/src/app/globals.css) | Global CSS — all design tokens, animations, keyframes | 954 |

> [!IMPORTANT]
> Files **AnalyticsSection.tsx**, **OrdersSection.tsx**, and **PricingTable.tsx** exist in the codebase but are **not specified** in the landing page spec. The spec defines 11 specific sections (S1–S11). The current page includes sections that don't map to the spec, and is missing sections that do.

---

## 2. Global Setup

| Item | Status | Notes |
|---|---|---|
| CSS variable `lp-bg` | **MISSING** | Not defined anywhere. `globals.css` uses shadcn/ui `--background` / `--foreground` tokens. Zero `lp-*` variables exist. |
| CSS variable `lp-surface` | **MISSING** | |
| CSS variable `lp-surface-2` | **MISSING** | |
| CSS variable `lp-border` | **MISSING** | |
| CSS variable `lp-gold` | **MISSING** | |
| CSS variable `lp-gold-glow` | **MISSING** | |
| CSS variable `lp-violet` | **MISSING** | |
| CSS variable `lp-violet-glow` | **MISSING** | |
| CSS variable `lp-text` | **MISSING** | |
| CSS variable `lp-text-secondary` | **MISSING** | |
| CSS variable `lp-text-muted` | **MISSING** | |
| Cabinet Grotesk from Fontshare CDN | **MISSING** | No reference to `api.fontshare.com` or `cabinet-grotesk` anywhere in codebase. Fonts loaded: Inter, Playfair Display, IBM Plex Mono. |
| Noto Naskh Arabic from Google Fonts | **MISSING** | No reference to `Noto Naskh Arabic` anywhere. |
| Navbar: fixed, 56px, wordmark + ghost CTA | **PARTIAL** | Navbar exists with `sticky top-0`, height `h-16` (64px, not 56px). Has wordmark + CTA. But: CTA is Sign In / Get Started buttons (not ghost "Get Early Access"), has full nav links with dropdowns (spec says no nav links for landing), has a hamburger mobile nav (spec says hamburger hidden), uses dashboard tokens not `lp-*` tokens, uses `bg-background/95` not `lp-bg`, no `lp-border` border-bottom. |
| Footer: lp-surface bg, wordmark + copyright + support email + Arabic accent | **PARTIAL** | Footer exists but is a full multi-column footer with 5 link sections, social icons, newsletter input. Spec calls for minimal: wordmark + `© 2026 Yoosr` + `support@yoosr.app` + "Built for MENA with يُسر" in gold. None of those specific elements are present. Uses `bg-muted/30` not `lp-surface`. No Arabic accent. No `support@yoosr.app`. |
| `useScrollReveal` hook with `data-reveal` + IO at threshold 0.15 | **PARTIAL** | A `ScrollReveal` wrapper component exists, using IntersectionObserver. But: it's a component wrapper (not a hook), does not use `data-reveal` attribute, uses `threshold: 0.1` (not 0.15), adds `animate-fade-in` class + sets opacity (not the spec's translateY pattern). |
| Global max-width 1200px + section vertical padding | **MISSING** | No `1200px` max-width constraint. Uses Tailwind `container` class. Section padding varies per component, not standardized to `64px / 96px` as spec requires. |

---

## 3. Section Audit

### S1 — Hero

**EXISTS:** Partial

The Hero component exists (284 lines) but is architecturally different from the spec:

| Spec Item | Status | Details |
|---|---|---|
| Top badge ("Built for MENA · Early Access") | **PARTIAL** | A badge exists but uses `border-primary/20 bg-primary/10 text-primary` styling with a green ping dot. Text comes from i18n key `hero.badge` — content not verified. Not using `lp-surface` bg, `lp-gold` border/text, pill shape, or the spec's 12px/uppercase/0.08em tracking style. |
| Headline Cabinet Grotesk 800, 80px | **MISSING** | Uses default sans-serif (`font-extrabold tracking-tight`), sizes are `text-5xl/6xl/7xl/8xl` (responsive). Cabinet Grotesk is not loaded. Headline is **centered** (spec says left-aligned). |
| Subheadline max-width 520px | **PARTIAL** | Subheadline exists with `max-w-[52rem]` (832px) — far exceeds spec's `520px`. Also centered, not left-aligned. |
| Arabic word يُسر in Noto Naskh Arabic 700, 48px, lp-gold | **MISSING** | No Arabic text anywhere in the Hero. |
| Arabic subtitle line | **MISSING** | |
| Email input + CTA button row (48px, lp-gold) | **MISSING** | Hero has two `<Button>` components linking to `/signup` and `/demo`. No email input. No waitlist CTA. |
| Micro-copy below input | **MISSING** | |
| Hero SVG illustration (chaos scene) | **MISSING** | Instead of an SVG blob illustration, the hero contains a **full dashboard mockup** — a detailed, hardcoded browser window with sidebar, conversation list, and contact panel. This is explicitly against the spec ("Dashboard screenshots in hero" is in the OUT list). |
| Chaos → Calm animation class | **MISSING** | |
| Noise grain background texture | **MISSING** | |
| Gold radial glow behind illustration | **MISSING** | Background uses `bg-primary/30` rounded blobs and a primary-colored radial gradient — uses dashboard tokens, no gold. |
| 55/45 desktop split layout | **MISSING** | Layout is fully centered, single-column. No split. |

> [!WARNING]
> The Hero is fundamentally different from the spec. It's a centered, SaaS-generic hero with two buttons and a dashboard mockup — the spec calls for a left-aligned hero with email CTA, Arabic accent, and abstract SVG illustration. This is a full rebuild.

### S2 — Social Proof Bar (Marquee)

**EXISTS:** No

There is a `#logos` section in `page.tsx` (lines 33–53) that shows industry names from i18n, but:
- It is **not** a scrolling marquee — it's a static flex-wrap of text spans
- No CSS marquee animation applied
- No gold separator dots
- No "Get Early Access" inline link
- No `lp-surface` bg or `lp-border` borders
- The marquee keyframe exists in `globals.css` but is not used on this element

### S3 — Problem / Empathy

**EXISTS:** No

No `ProblemSection` or equivalent component exists. No file in `src/components/landing/` corresponds to this section. Not imported in `page.tsx`.

### S4 — Core Features Grid

**EXISTS:** Partial

| Spec Item | Status | Details |
|---|---|---|
| 2×3 grid (2 cols desktop) | **VIOLATION** | Uses `lg:grid-cols-3` — this is a **3-column grid**, explicitly forbidden by the spec and the anti-cliché blocklist. Spec requires `2-column grid (3 rows × 2 cols)`. |
| 6 feature cards with correct titles | **CANNOT VERIFY** | Card content comes from i18n keys (not hardcoded). Count depends on translation data. |
| 6 gold SVG icons | **MISSING** | Uses emoji chars from i18n data, not gold stroke SVG icons. |
| Hover: lp-gold border + glow | **MISSING** | Hover uses `bg-muted/50`, translate-y, shadow. No gold border or glow. |
| Scale fade-in scroll animation | **MISSING** | The section is wrapped in `<ScrollReveal>` in page.tsx, but the spec's `scale(0.96→1)` staggered per-card animation is absent. |
| lp-surface bg, lp-border border cards | **MISSING** | Uses `bg-card`, `border-border` (dashboard tokens). |

### S5 — Design Studio Deep Dive

**EXISTS:** Partial

| Spec Item | Status | Details |
|---|---|---|
| Full-width `lp-surface` panel | **MISSING** | Uses `border-t border-border` section, not a distinct `lp-surface` band. |
| Three capability cards (numbered 01, 02, 03) | **MISSING** | Uses a **4-card grid** (`lg:grid-cols-4`) with emoji icons, not 3 numbered cards. |
| Flow canvas SVG (5-6 nodes, bezier edges) | **MISSING** | No SVG illustration of any kind. |
| Node draw animation on scroll | **MISSING** | |

### S6 — Channels

**EXISTS:** Partial

| Spec Item | Status | Details |
|---|---|---|
| Two-column layout (text + tiles left, map right) | **MISSING** | Layout is centered header + 4-card grid below. No two-column split. |
| 2×2 channel tile grid | **PARTIAL** | 4 channel tiles exist, but in a `lg:grid-cols-4` single-row grid, not 2×2. |
| MENA map SVG illustration | **MISSING** | No map, no dots, no animated lines. |
| City dots → central inbox animation | **MISSING** | |
| Abstract channel SVG icons | **MISSING** | Uses emojis (🌐 ✈️ 📘 📸), not abstract gold-stroke SVGs. |

### S7 — How It Works

**EXISTS:** Partial

| Spec Item | Status | Details |
|---|---|---|
| Centered vertical timeline, max-width 720px | **MISSING** | Uses `md:grid-cols-3` horizontal layout, not a centered vertical timeline. |
| Large background numerals (lp-gold, opacity 0.15) | **MISSING** | Step numbers are small mono text (`text-xs`), not large 64px background numerals. |
| Vertical connecting line with scaleY draw | **MISSING** | Has a horizontal connector line on desktop, no vertical timeline draw. |
| lp-gold vertical accent bar per step | **MISSING** | |
| Code blocks per step | **NOT IN SPEC** | Each step has a code block — this is not specified. |

### S8 — Who It's For

**EXISTS:** No

No audience cards component (E-commerce, SaaS, Agencies) exists in any file.

### S9 — Trust Signals

**EXISTS:** No (partial overlap with Testimonials)

A `Testimonials.tsx` component exists with testimonial quote cards (star ratings, author info). This does **not** match S9 (trust signal cards with gold icons — security, team, support themes). The Testimonials component is closer to a standard reviews section and does not match S9's structure.

### S10 — Pricing Teaser

**EXISTS:** Partial (significant deviation)

The page renders a full `PricingTable` component (4 plans, monthly/yearly toggle, feature lists) behind a blur overlay with a "Coming Soon" badge. The spec calls for:
- Three pricing **promise** cards (same anatomy as trust cards)
- A single CTA button (lp-gold, max-width 320px, height 52px)
- Micro-copy below CTA

What exists is a full pricing page, not a teaser.

### S11 — Final CTA

**EXISTS:** Partial (significant deviation)

| Spec Item | Status | Details |
|---|---|---|
| Centered layout, max-width 680px | **PARTIAL** | Layout has `max-w-2xl` (672px) — close but uses a `bg-primary` card wrapper, not `lp-bg` with gold glow. |
| Gold radial glow behind text | **MISSING** | Has `bg-primary-foreground/5` blur blobs, no gold glow. |
| Duplicate email input + CTA | **MISSING** | Has two buttons (link to `/signup` and `/demo`), no email input. |
| Relaxed agent illustration | **MISSING** | No illustration at all. |
| "Join 50+ teams..." social proof line | **MISSING** | |

---

## 4. Anti-Cliché Blocklist Check

| Blocklist Item | Status | Details |
|---|---|---|
| Gradient blobs or purple glow effects | **VIOLATION** | Hero has `bg-primary/30` and `bg-primary/20` rounded-full blobs with `blur-[120px]`. When in dark mode, `--primary` is a neutral grey, but the pattern is structurally a gradient blob background. |
| Floating product UI cards in hero | **VIOLATION** | Hero contains a full dashboard mockup with browser chrome, sidebar, conversation list, and contact panel. This is a floating product UI. |
| Logo strip immediately after hero | **VIOLATION** | Section `#logos` immediately after hero shows industry names in a strip — functionally a "trusted by" section (even if text-only). |
| 3-column feature grid as primary feature section | **VIOLATION** | `FeaturesGrid.tsx` uses `lg:grid-cols-3`. |
| Light background with blue/indigo hero | **CLEAR** | Dark mode is used. |
| "one platform" or "everything in one place" language | **CLEAR** | Not found in code. Content from i18n not verified. |
| Generic sans-serif only (no Cabinet Grotesk usage) | **VIOLATION** | No Cabinet Grotesk loaded. Only Inter, Playfair Display, IBM Plex Mono. |
| Centered hero with two buttons | **VIOLATION** | Hero is centered with two buttons: "Get Started" + "Book a Demo". |
| AI robot or chat bubble SVG illustrations | **CLEAR** | No robot or chat bubble SVGs found. |

> [!CAUTION]
> **6 out of 9 blocklist items are violated** in the current implementation. The page directly contradicts the spec's creative brief.

---

## 5. Acceptance Criteria Check

| # | Criterion | Status | Reason |
|---|---|---|---|
| 1 | Page loads and hero animation plays within 2s | **FAIL** | Hero has `animate-fade-in` CSS animations, but these are generic Tailwind animations, not the spec's staggered word-by-word reveal. |
| 2 | Headline uses Cabinet Grotesk at correct sizes | **FAIL** | Cabinet Grotesk is not loaded. Uses system Inter font stack. |
| 3 | Arabic يُسر renders in Noto Naskh Arabic, gold, with subtitle | **FAIL** | Arabic word does not exist anywhere on the page. |
| 4 | Hero illustration shows chaos → calm on scroll | **FAIL** | No SVG illustration exists. Dashboard mockup has no chaos/calm animation. |
| 5 | MENA map in S6 shows animated lines to inbox | **FAIL** | No MENA map exists. |
| 6 | All scroll reveal animations fire on IO (not on load) | **PARTIAL** | `ScrollReveal` uses IO, but hero animations fire on load (`animate-fade-in` with delay). Spec says hero badge/headline/subheadline animate on load (so hero on-load is correct per spec), but other sections use `ScrollReveal` wrappers which do use IO. Threshold is 0.1, not 0.15. |
| 7 | Email input in S1 and S11 submits and shows success | **FAIL** | No email input exists in either section. CTAs are button links to `/signup`. |
| 8 | Social proof marquee scrolls infinitely, pauses on hover | **FAIL** | No marquee exists. Logo strip is static. |
| 9 | All colors use `lp-*` CSS variables — zero hardcoded hex | **FAIL** | Zero `lp-*` variables exist. All components use shadcn/Tailwind dashboard tokens (`bg-card`, `text-foreground`, `border-border`, etc.). |
| 10 | No section uses 3-column grid as primary layout (S4 uses 2×3) | **FAIL** | FeaturesGrid uses `lg:grid-cols-3`. |
| 11 | No competitor clichés from blocklist | **FAIL** | 6 of 9 blocklist items are violated (see §4). |
| 12 | Page responsive at 375/768/1024/1440px | **CANNOT VERIFY** | Static code audit only — requires browser testing. |
| 13 | Navbar CTA and hero + footer CTAs scroll to / focus email input | **FAIL** | No email input exists. Navbar CTA links to `/signup`. |
| 14 | Cabinet Grotesk and Noto Naskh Arabic load with display=swap | **FAIL** | Neither font is loaded. |

---

## 6. Backend Check

| Item | Status | Details |
|---|---|---|
| `waitlist` table in `convex/schema.ts` | **MISSING** | Grep for "waitlist" in `convex/` returned zero results. |
| `joinWaitlist` mutation in Convex | **MISSING** | No such mutation exists. |
| Mutation called from email input CTA | **N/A** | No email input exists on the landing page. |

---

## 7. Summary

### Fully Built and Correct
**Nothing** matches the spec as written. The current landing page is a completely different design from what the spec describes.

### Partially Built (exists but deviates from spec)

| Component | What exists | Gap |
|---|---|---|
| **Navbar** | Sticky header with wordmark + CTA | Wrong height, wrong CTA style, has nav links/dropdowns (spec says none), uses dashboard tokens, includes Clerk auth |
| **Footer** | Full multi-column footer with newsletter | Spec calls for minimal footer: wordmark + copyright + support email + Arabic accent. Current one is a marketing-site footer with link columns. |
| **Hero** | Badge + headline + subheadline + CTA + illustration | Centered layout (not 55/45 split), two-button CTA (not email input), dashboard mockup (not SVG illustration), no Arabic element, no Cabinet Grotesk, no lp-* tokens |
| **FeaturesGrid (S4)** | Feature card grid | 3-column (should be 2-column), emoji icons (should be gold SVGs), no gold hover glow |
| **DesignStudio (S5)** | Header + 4-card grid | 4 cards (should be 3 numbered), no canvas SVG, no node draw animation |
| **Channels (S6)** | Header + 4 channel tiles | 4-column layout (should be 2×2 in a two-column layout), no MENA map, emoji icons |
| **HowItWorks (S7)** | 3-step horizontal layout | Should be vertical centered timeline with large numerals, gold accent, scaleY draw. Has code blocks not in spec. |
| **CtaSection (S11)** | CTA card with buttons | bg-primary card (not lp-bg + gold glow), two buttons (not email input), no illustration |
| **ScrollReveal** | IO-based wrapper component | Component wrapper (not hook), no `data-reveal`, wrong threshold (0.1 vs 0.15) |

### Completely Missing

| Spec Item | Description |
|---|---|
| **All `lp-*` CSS variables** | The entire landing page design system (11 color tokens) |
| **Cabinet Grotesk font** | Primary heading font from Fontshare CDN |
| **Noto Naskh Arabic font** | Arabic accent font from Google Fonts |
| **Arabic يُسر accent** | The single most distinctive element of the spec |
| **S2 — Social Proof Marquee** | Scrolling trust bar with gold CTA link |
| **S3 — Problem / Empathy** | Two-column with pain point cards + overwhelmed agent SVG |
| **S8 — Who It's For** | Three audience cards (E-commerce, SaaS, Agencies) |
| **S9 — Trust Signals** | Three trust cards with gold icons |
| **S10 — Pricing Teaser** | Three promise cards + single CTA (exists as full pricing page instead) |
| **Email input + waitlist CTA** | Neither S1 nor S11 has an email input |
| **Waitlist backend** | No `waitlist` table or `joinWaitlist` mutation in Convex |
| **All SVG illustrations** | Hero chaos/calm scene, overwhelmed agent (S3), flow canvas (S5), MENA map (S6), audience icons (S8), trust icons (S9), relaxed agent (S11) |
| **Noise grain texture** | Subtle overlay in hero |
| **Gold radial glow** | Behind hero illustration and S11 CTA |
| **55/45 split layout** | Hero is fully centered |
| **Chaos → Calm scroll animation** | No state transition on scroll |
| **`useScrollReveal` hook** | Exists as component wrapper, not as specified hook with `data-reveal` |

### Blockers Before Implementation Tasks Can Start

1. **The `lp-*` design system must be created first** (Task T1 in spec). All 11 CSS variables are missing. Every component currently uses dashboard shadcn tokens — the entire visual layer needs to be overridden for the landing page scope.

2. **Cabinet Grotesk and Noto Naskh Arabic fonts must be loaded** (Task T1). Both CDN links are absent.

3. **The hero is a full rebuild** (Task T2 + T3). The current hero is architecturally contrary to the spec — centered layout with dashboard mockup, two navigation buttons, no email input, no Arabic element. It cannot be incrementally patched.

4. **Three spec sections have no file at all** (S3, S8, S9). New components must be created from scratch.

5. **Two sections are off-spec replacements** — AnalyticsSection and OrdersSection exist but do not map to any spec section. They may need to be removed or repurposed.

6. **The waitlist backend (T14) has no starting point** — no table, no mutation, no CTA that would call it.

7. **6 of 9 blocklist violations must be resolved** — particularly the dashboard mockup in the hero, the 3-column feature grid, and the centered-hero-with-two-buttons pattern.
