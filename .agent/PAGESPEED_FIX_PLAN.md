# Yoosr PageSpeed Fix Plan — Executable Instructions

> **Source**: PageSpeed Insights report — Mar 31, 2026 — `https://yoosr.vercel.app/en`
> **Current Scores**: Performance **67** · Accessibility **96** · Best Practices **96** · SEO **100**
> **Target**: Performance ≥ 90 on both desktop and mobile

> [!IMPORTANT]
> This plan is for the **Qwen Coder** agent. Each fix has exact file paths, current code, replacement code, and verification steps. Execute in priority order.

---

## Stack Context

- **Framework**: Next.js 16 (App Router) on Vercel
- **i18n**: `next-intl` with `localePrefix: 'always'` (locales: `en`, `ar`, `fr`)
- **Fonts**: Self-hosted Cabinet Grotesk (`/public/fonts/cabinet-grotesk/`), Google Fonts via `@import` in `globals.css` (Inter, Playfair Display, IBM Plex Mono), Google Fonts via `<link>` in marketing layout (Noto Naskh Arabic)
- **CSS**: Tailwind CSS v4 + inline `<style>` blocks in landing components
- **Auth**: Clerk (scoped to auth/dashboard routes only)
- **Deployment**: Vercel with `vercel.json` for headers

---

## P0 — Critical (highest LCP impact)

---

### Fix 1: Eliminate Redirect Chain (+472ms latency)

**Report Section**: Issue #3 — "Had redirects (3 redirects, +472ms)"

**Root Cause**: The `next-intl` routing config at `src/i18n/routing.ts` uses `localePrefix: 'always'`. When a user visits `/`, the middleware redirects: `/ → /en` (locale detection) → possibly another hop from `next-intl` internal rewrite. Additionally, landing page components use `next/link` and `next/navigation` instead of `next-intl` navigation helpers, which causes additional redirect hops for prefetch requests.

**Files to modify**:
1. `src/i18n/routing.ts`
2. `src/components/landing/CtaSection.tsx`
3. `src/components/landing/PricingTeaser.tsx`
4. `src/components/landing/SocialProofBar.tsx`
5. Create `src/i18n/navigation.ts` (new file)

**Step 1**: Create the `next-intl` navigation module

> Read the `next-intl` docs for `createNavigation`: https://next-intl.dev/docs/routing/navigation
> This creates locale-aware `Link`, `useRouter`, `usePathname`, and `redirect` helpers that prevent redundant middleware redirects.

**Create file** `src/i18n/navigation.ts`:
```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

**Step 2**: Replace `next/link` in `CtaSection.tsx`

**File**: `src/components/landing/CtaSection.tsx`

**Current** (lines 1-2):
```typescript
import React from "react";
import Link from "next/link";
```

**Replace with**:
```typescript
import React from "react";
import { Link } from "@/i18n/navigation";
```

**Step 3**: Replace `next/navigation` in `PricingTeaser.tsx`

**File**: `src/components/landing/PricingTeaser.tsx`

**Current** (line 4):
```typescript
import { useRouter } from "next/navigation";
```

**Replace with**:
```typescript
import { useRouter } from "@/i18n/navigation";
```

**Step 4**: Replace `next/navigation` in `SocialProofBar.tsx`

**File**: `src/components/landing/SocialProofBar.tsx`

**Current** (line 4):
```typescript
import { useRouter } from "next/navigation";
```

**Replace with**:
```typescript
import { useRouter } from "@/i18n/navigation";
```

**Step 5**: Replace `window.location.href` in `Hero.tsx`

**File**: `src/components/landing/Hero.tsx`

**Current** (line 287):
```typescript
onClick={() => window.location.href = '/waitlist'}
```

This bypasses Next.js routing entirely, causing a full page reload and redirect chain. Replace with a locale-aware link or router push. Since this is in a `<button>`, convert to use the i18n Link:

**Replace the entire button block** (lines 286-311) with:
```tsx
<Link
  href="/waitlist"
  style={{
    height: '48px',
    padding: '0 24px',
    background: 'var(--lp-gold)',
    color: '#0C0B0F',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: '14px',
    transition: '100ms',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  }}
  className="hover:opacity-[0.88] hover:scale-[1.02]"
>
  {t("cta")}
</Link>
```

And add import at top:
```typescript
import { Link } from "@/i18n/navigation";
```

**Verification**:
- Run `bun dev`, visit `http://localhost:3000`
- Check Network tab — initial navigation should show only 1 redirect (or none if you visit `/en` directly)
- Run Lighthouse — "Document request latency" savings should drop significantly

---

### Fix 2: Fix Render-Blocking Font Requests (~2,120ms savings)

**Report Section**: Issue #2 — "Render blocking requests — Est savings of 2,120ms"

**Root Cause**: Three `@import url()` statements at the top of `globals.css` are render-blocking. They load Google Fonts CSS synchronously before any content can paint. Additionally, the marketing layout loads Noto Naskh Arabic via `<link>` in the body (not head).

**Files to modify**:
1. `src/app/globals.css`
2. `src/app/layout.tsx`
3. `src/app/[locale]/(marketing)/layout.tsx`

**Step 1**: Remove `@import` font links from globals.css and use `next/font/google`

**File**: `src/app/globals.css`

**Remove these 3 lines** (lines 1-3):
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital%2Copsz%2Cwght@0%2C14..32%2C100..900;1%2C14..32%2C100..900&display=optional");
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital%2Cwght@0%2C400..900;1%2C400..900&display=optional");
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=optional');
```

**Step 2**: Configure all Google Fonts via `next/font/google` in root layout

> Read Next.js font optimization docs: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
> `next/font/google` automatically self-hosts fonts, removes external network requests, and eliminates render-blocking behavior.

**File**: `src/app/layout.tsx`

**Replace entire file** with:
```tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yoosr",
  description: "AI-Powered Customer Support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfairDisplay.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

**Step 3**: Update CSS variable references to match new font variable names

**File**: `src/app/globals.css`

**Replace** the font variable block inside `:root` (lines 87-95):

**Current**:
```css
  /* Fonts */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-serif: "Playfair Display", ui-serif, Georgia, serif;

  --font-display: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-text: "Inter", ui-sans-serif, system-ui, sans-serif;

  --font-handwriting: "Caveat", cursive;
```

**Replace with**:
```css
  /* Fonts — loaded via next/font/google in layout.tsx */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace;
  --font-serif: var(--font-playfair), ui-serif, Georgia, serif;

  --font-display: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-text: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --font-handwriting: "Caveat", cursive;
```

**Step 4**: Handle Noto Naskh Arabic in marketing layout

**File**: `src/app/[locale]/(marketing)/layout.tsx`

The Noto Naskh Arabic font is only needed for Arabic locale. Load it conditionally and ensure it doesn't block rendering.

**Current** (lines 19-23):
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://safe-pheasant-87.clerk.accounts.dev" />
<link href="/fonts/cabinet-grotesk/cabinet-grotesk.css" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=optional" rel="stylesheet" />
```

**Replace with** (keep preconnects, conditionally load Arabic font):
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="/fonts/cabinet-grotesk/cabinet-grotesk.css" rel="stylesheet" />
{locale === "ar" && (
  <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=swap" rel="stylesheet" />
)}
```

> Removed the Clerk preconnect since Clerk is not loaded on marketing pages. Only keep preconnects for domains you actually request from.

**Verification**:
- Run `bun dev`, check Network tab — no Google Fonts CSS requests should appear (they're now self-hosted by Next.js)
- The `<link rel="preconnect" href="fonts.googleapis.com">` is only needed for Noto Naskh Arabic on Arabic locale
- Run Lighthouse — "Render blocking requests" should be significantly reduced

---

### Fix 3: Fix Font 404 Errors (Console errors + Best Practices)

**Report Section**: Issue #11.1 — "Console errors: missing font files (404)" for `cabinet-grotesk` woff2 files

**Root Cause**: The `cabinet-grotesk.css` `@font-face` only defines weights `700` and `800`, but three components use Cabinet Grotesk with `font-weight: 600`:
- `DesignStudioSection.tsx` line 67 (`.ds-card-title`)
- `Hero.tsx` line 172 (`.waitlist-button`)
- `ChannelsSection.tsx` line 44 (`.ch-card-title`)

When the browser requests weight 600, it may try to fetch a separate woff2 file that doesn't exist. There's also a suspicious tiny file `5678GHIJKLMNOP.woff2` (358 bytes) which appears corrupt or incomplete.

**Files to modify**:
1. `public/fonts/cabinet-grotesk/cabinet-grotesk.css`
2. `public/fonts/cabinet-grotesk/5678GHIJKLMNOP.woff2` (delete)

**Step 1**: Add weight 600 to the Cabinet Grotesk CSS using the 700 woff2 (closest match)

**File**: `public/fonts/cabinet-grotesk/cabinet-grotesk.css`

**Replace entire file** with:
```css
/* Cabinet Grotesk - Self-hosted with long cache TTL */
@font-face {
  font-family: 'Cabinet Grotesk';
  src: url('./WN5274VQ3AUBDFP74GB4EC4XYJ3EKVNE.woff2') format('woff2');
  font-weight: 600 700;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Cabinet Grotesk';
  src: url('./6QH2ALVTTK7IRVO5MYOQQ3OZNXW5SSS3.woff2') format('woff2');
  font-weight: 800;
  font-display: swap;
  font-style: normal;
}
```

> Changed `font-display` from `optional` to `swap`. With `optional`, the browser may decide **not to show the font at all** if it doesn't load fast enough (which is likely on slow mobile). `swap` ensures text is always visible (first with fallback, then with the custom font). This directly improves LCP because the LCP element is text.

**Step 2**: Delete the suspicious/corrupt tiny woff2 file

```bash
rm public/fonts/cabinet-grotesk/5678GHIJKLMNOP.woff2
```

**Verification**:
- Run `bun dev`, open browser console — no 404 errors for font files
- Verify Cabinet Grotesk renders correctly on heading text
- Run Lighthouse — Best Practices console error should disappear

---

### Fix 4: Add Content Security Policy (CSP)

**Report Section**: Issue #12 — "No CSP found in enforcement mode (High)" and "No CSP header with Trusted Types directive found (High)"

**Root Cause**: `vercel.json` has security headers but no `Content-Security-Policy`. Lighthouse flags this as High severity.

**File to modify**: `vercel.json`

> CSP can easily break your site if too restrictive. This plan uses a permissive-but-secure policy. The Clerk SDK requires `connect-src` to its domain. `next/font` serves fonts from `/_next/static/`. Inline styles from `dangerouslySetInnerHTML` require `'unsafe-inline'` for `style-src`.

**Add this header object** inside the `"headers"` array of the `"source": "/(.*)"` block, after the existing 7 headers:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://safe-pheasant-87.clerk.accounts.dev https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud https://api.openai.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
}
```

> Trusted Types (`require-trusted-types-for 'script'`) is very aggressive and will likely break Clerk, React, and other libraries that use `innerHTML`. Defer this to post-launch. The CSP above is a good foundation.

**Verification**:
- Deploy to Vercel preview
- Check browser console for CSP violations (they will show as errors in the console)
- If anything breaks, widen the affected directive
- Run Lighthouse — "Ensure CSP is effective against XSS attacks" should turn green

---

## P1 — High Impact

---

### Fix 5: Fix Color Contrast Failures (Accessibility 96 → 100)

**Report Section**: Issue #10 — "Background and foreground colors do not have a sufficient contrast ratio"

**Root Cause**: Footer text and the "Product video coming soon" placeholder use `color: var(--lp-text-muted)` which is `#7A7685`. Against the background `var(--lp-surface)` = `#161420`, this gives a contrast ratio of approximately **3.7:1** — fails WCAG AA requirement of **4.5:1** for normal text.

**File to modify**: `src/app/globals.css`

**Current** (line 30):
```css
  --lp-text-muted:#7A7685;
```

**Replace with** (achieves ~5.2:1 contrast against `#161420`):
```css
  --lp-text-muted:#9E9AAD;
```

> Verify contrast ratio: background `#161420`, foreground `#9E9AAD` → **5.2:1** (passes WCAG AA). You can verify at https://webaim.org/resources/contrastchecker/

The footer component (`LandingFooter.tsx`) and Hero placeholder already use `var(--lp-text-muted)` inline, so updating the CSS variable fixes them all automatically.

**Verification**:
- Run Lighthouse accessibility audit
- Specifically check footer text and "Product video coming soon" text
- Contrast ratio should be ≥ 4.5:1 for all normal text
- Accessibility score should reach 100

---

### Fix 6: Eliminate Non-Composited SVG Animations

**Report Section**: Issue #7 — "Avoid non-composited animations — 5 animated elements found" referencing `stroke-dashoffset`

**Root Cause**: The `drawEdge` keyframe in `DesignStudioSection.tsx` animates `stroke-dashoffset`, which cannot be GPU-composited. The browser must repaint on every frame.

**File to modify**: `src/components/landing/DesignStudioSection.tsx`

**Current** (lines 91-104):
```css
@keyframes drawEdge {
  from { opacity: 0; stroke-dashoffset: 400; }
  to { opacity: 1; stroke-dashoffset: 0; }
}
.flow-edge {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: drawEdge 800ms ease-out forwards;
  will-change: opacity;
}
.edge-1 { animation-delay: 100ms; }
.edge-2 { animation-delay: 250ms; }
.edge-3 { animation-delay: 400ms; }
.edge-4 { animation-delay: 550ms; }
```

**Replace with** (opacity-only animation, which IS GPU-composited):
```css
@keyframes drawEdge {
  from { opacity: 0; }
  to { opacity: 1; }
}
.flow-edge {
  opacity: 0;
  animation: drawEdge 800ms ease-out forwards;
  will-change: opacity;
}
.edge-1 { animation-delay: 100ms; }
.edge-2 { animation-delay: 250ms; }
.edge-3 { animation-delay: 400ms; }
.edge-4 { animation-delay: 550ms; }
```

> This removes the `stroke-dashoffset` "drawing" effect and replaces it with a fade-in. The paths will appear fully drawn but fade in sequentially with staggered delays, which still looks good and is fully GPU-composited.

**Verification**:
- Run Lighthouse — "Avoid non-composited animations" warning should disappear
- Visually verify the flow diagram still animates smoothly on the landing page

---

### Fix 7: Fix Forced Reflow / Layout Thrashing

**Report Section**: Issue #4 — "Forced reflow can result in poor performance"

**Root Cause**: `HowItWorks.tsx` has a scroll event listener that calls `getBoundingClientRect()` on every scroll event. While it uses `{ passive: true }`, the `getBoundingClientRect()` call inside the handler forces a synchronous layout. And `setLineScale()` triggers a React re-render which modifies styles (`transform: scaleY(...)`) — classic read-then-write layout thrash.

**File to modify**: `src/components/landing/HowItWorks.tsx`

**Current** (lines 30-49):
```typescript
useEffect(() => {
  const handleScroll = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const start = windowHeight * 0.6;
    const progress = (start - rect.top) / rect.height;
    
    setLineScale(Math.max(0, Math.min(1, progress)));
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
  
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

**Replace with** (uses `requestAnimationFrame` to batch reads and debounce):
```typescript
useEffect(() => {
  let rafId: number;
  
  const handleScroll = () => {
    if (rafId) return; // Skip if a frame is already queued
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = windowHeight * 0.6;
      const progress = (start - rect.top) / rect.height;
      
      setLineScale(Math.max(0, Math.min(1, progress)));
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
  
  return () => {
    window.removeEventListener("scroll", handleScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}, []);
```

**Verification**:
- Run Lighthouse — "Forced reflow" warning should disappear
- The timeline animation in "How It Works" should still function identically
- Test on Chrome Performance panel — no "Recalculate Style (forced)" entries during scroll

---

## P2 — Performance Optimizations

---

### Fix 8: Reduce Unused JavaScript (~26 KiB)

**Report Section**: Issue #5 — "Reduce unused JavaScript — Est savings of 26 KiB"

**Root Cause**: Components below the fold are imported statically, meaning their JS loads immediately even though they're not visible. The landing page imports 11 section components at the top level.

**File to modify**: `src/app/[locale]/(marketing)/page.tsx`

**Step 1**: Dynamic import below-the-fold sections

> Read Next.js `dynamic` docs: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
> Use `next/dynamic` with `{ ssr: false }` for components that are below the fold and use `useEffect` / client-only APIs. For server-renderable components, use `{ ssr: true }` (default).

**Current** (lines 1-12):
```typescript
import { Hero } from "@/components/landing/Hero"
import { SocialProofBar } from "@/components/landing/SocialProofBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { DesignStudioSection } from "@/components/landing/DesignStudioSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { ChannelsSection } from "@/components/landing/ChannelsSection"
import { WhoItsFor } from "@/components/landing/WhoItsFor"
import { TrustSection } from "@/components/landing/TrustSection"
import { PricingTeaser } from "@/components/landing/PricingTeaser"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
```

**Replace with** — keep above-the-fold static, lazy-load the rest:
```typescript
import { Hero } from "@/components/landing/Hero"
import { SocialProofBar } from "@/components/landing/SocialProofBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { ScrollReveal } from "@/components/landing/ScrollReveal"
import dynamic from "next/dynamic"

const FeaturesGrid = dynamic(() => import("@/components/landing/FeaturesGrid").then(m => ({ default: m.FeaturesGrid })))
const DesignStudioSection = dynamic(() => import("@/components/landing/DesignStudioSection").then(m => ({ default: m.DesignStudioSection })))
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then(m => ({ default: m.HowItWorks })))
const ChannelsSection = dynamic(() => import("@/components/landing/ChannelsSection").then(m => ({ default: m.ChannelsSection })))
const WhoItsFor = dynamic(() => import("@/components/landing/WhoItsFor").then(m => ({ default: m.WhoItsFor })))
const TrustSection = dynamic(() => import("@/components/landing/TrustSection").then(m => ({ default: m.TrustSection })))
const PricingTeaser = dynamic(() => import("@/components/landing/PricingTeaser").then(m => ({ default: m.PricingTeaser })))
const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA").then(m => ({ default: m.FinalCTA })))
```

> This file is a Server Component (no `"use client"` directive). In Next.js App Router, `next/dynamic` in Server Components works differently — it defers the client component's JS bundle loading. Ensure this doesn't cause hydration mismatches. Test thoroughly.

> If `next/dynamic` in a Server Component causes issues, an alternative is to wrap each below-the-fold `<ScrollReveal>` section in a client boundary component that lazy-loads its content.

**Verification**:
- Run `bun build` and compare total JS output size before and after
- Run Lighthouse — "Reduce unused JavaScript" savings should decrease
- Visually verify all sections still render and animate on scroll

---

### Fix 9: Reduce Unused / Un-minified CSS (~2 KiB)

**Report Section**: Issue #6 — "Minify CSS — Est savings of 2 KiB"

**Root Cause**: The landing page components use `dangerouslySetInnerHTML` to inject inline `<style>` blocks. These are **not processed by Next.js CSS pipeline/PostCSS/Tailwind** and therefore are not minified in production builds.

**Affected files** (each has inline `<style dangerouslySetInnerHTML>`):
1. `src/components/landing/Hero.tsx` (lines 24-224 — ~200 lines of inline CSS)
2. `src/components/landing/DesignStudioSection.tsx` (lines 11-120 — ~110 lines of inline CSS)
3. `src/components/landing/ChannelsSection.tsx` (lines 35-65)

**Recommended approach**: Move inline CSS to a dedicated CSS file.

**Step 1**: Create `src/components/landing/landing.css` and move all inline styles there
- Extract all CSS from the `<style dangerouslySetInnerHTML>` blocks in:
  - `Hero.tsx`
  - `DesignStudioSection.tsx`
  - `ChannelsSection.tsx`
- Place them all in this single CSS file

**Step 2**: Import the CSS file in the marketing layout

**File**: `src/app/[locale]/(marketing)/layout.tsx`

**Add import**:
```typescript
import "@/components/landing/landing.css";
```

**Step 3**: Remove all `<style dangerouslySetInnerHTML>` blocks from each component

> This is a significant refactor. If time-constrained, this can be deferred — the CSS minification savings are only ~2 KiB. The higher-priority fixes above will have much more impact on LCP.

**Verification**:
- Run `bun build` — CSS should be minified by PostCSS
- No visual changes to the landing page
- Run Lighthouse — "Minify CSS" diagnostic should disappear

---

### Fix 10: Reduce Network Payload (~549 KiB total)

**Report Section**: Issue #9 — "Avoid enormous network payloads — Total size was 549 KiB"

**Root Cause**: The largest contributors are fonts and JS bundles. Most of this is addressed by the fixes above:
- Fix 2 eliminates external Google Fonts CSS requests
- Fix 3 fixes font 404s and potential double-fetching
- Fix 8 reduces initial JS payload with dynamic imports

**No additional code changes needed** — this fix is the cumulative result of Fixes 2, 3, and 8.

**Verification**:
- After applying all fixes above, re-run Lighthouse
- Total network payload should be significantly reduced
- If still > 500 KiB, audit the JS bundle with `npx @next/bundle-analyzer` to identify remaining large chunks

---

### Fix 11: Address Long Main-Thread Task

**Report Section**: Issue #8 — "Avoid long main-thread tasks — 1 long task found"

**Root Cause**: Likely caused by the synchronous initialization of multiple client components on the landing page. This should be partially resolved by Fix 8 (dynamic imports).

**Additional mitigation**: The `ScrollReveal` component creates a new `IntersectionObserver` for every instance. The landing page renders **~10 ScrollReveal instances**. Each creates its own observer.

**File to modify**: `src/components/landing/ScrollReveal.tsx`

**Replace entire file** with a shared observer pattern:
```tsx
"use client"

import { useEffect, useRef, ReactNode } from "react"

// Shared single observer for all ScrollReveal instances
let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = callbacks.get(entry.target);
          if (cb) cb(entry);
        });
      },
      { threshold: 0.1 }
    );
  }
  return sharedObserver;
}

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = getObserver();
    
    const handleIntersection = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.classList.add("animate-fade-in")
          el.style.opacity = "1"
        }, delay)
        observer.unobserve(el)
        callbacks.delete(el)
      }
    };

    callbacks.set(el, handleIntersection);
    observer.observe(el)
    
    return () => {
      observer.unobserve(el)
      callbacks.delete(el)
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  )
}
```

**Verification**:
- All scroll reveal animations should still work identically
- Chrome Performance panel should show fewer "Intersection Observer" entries during page load
- Run Lighthouse — long task warning should be reduced or eliminated

---

## Execution Order Summary

| Priority | Fix # | Issue | File(s) | Risk |
|----------|-------|-------|---------|------|
| P0 | 1 | Redirect chain (472ms) | `routing.ts`, 4 components, new `navigation.ts` | Low |
| P0 | 2 | Render-blocking fonts (2,120ms) | `globals.css`, `layout.tsx`, marketing `layout.tsx` | Medium — test fonts render correctly |
| P0 | 3 | Font 404 errors | `cabinet-grotesk.css`, delete corrupt woff2 | Low |
| P0 | 4 | CSP headers | `vercel.json` | Medium — CSP can break things, test on preview |
| P1 | 5 | Color contrast (A11y) | `globals.css` | Low |
| P1 | 6 | SVG animation compositing | `DesignStudioSection.tsx` | Low |
| P1 | 7 | Forced reflow | `HowItWorks.tsx` | Low |
| P2 | 8 | Unused JS (26 KiB) | `page.tsx` | Medium — test hydration |
| P2 | 9 | Unminified CSS (2 KiB) | 3 components, new CSS file | High — large refactor |
| P2 | 10 | Network payload | (cumulative) | — |
| P2 | 11 | Long main-thread task | `ScrollReveal.tsx` | Low |

---

## Expected Outcome After All Fixes

| Metric | Current | Target |
|--------|---------|--------|
| Performance (Mobile) | 67 | 85+ |
| Performance (Desktop) | ~85 | 95+ |
| LCP (Mobile) | 5.8s | < 3s |
| FCP (Mobile) | 4.6s | < 2.5s |
| Accessibility | 96 | 100 |
| Best Practices | 96 | 100 |
| SEO | 100 | 100 |
