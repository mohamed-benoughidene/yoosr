# Yoosr Landing Page — PageSpeed Fixes
> Source: PageSpeed Insights report — Mar 30, 2026 — https://yoosr.vercel.app/en

---

## Scores

| Category | Desktop | Mobile |
|---|---|---|
| Performance | 85 🟡 | 61 🔴 |
| Accessibility | 96 🟢 | 96 🟢 |
| Best Practices | 96 🟢 | 96 🟢 |
| SEO | 100 🟢 | 100 🟢 |

**Target:** Performance ≥ 90 on both. Mobile LCP is currently 9.5s — unacceptable for production.

---

## P0 — Critical (fix before launch)

### 1. ~~Redirect Chain — +1,068ms desktop / +962ms mobile~~ ✅ (Done)
- **What:** The URL `/en` is going through 3 redirects before the browser receives HTML. Each redirect is a full round-trip.
- **Where:** Next.js middleware / routing config
- **Fix:** Audit middleware to eliminate intermediate hops. The chain should collapse to a single direct rewrite, not 3 sequential redirects.
- **Impact:** ~1 second removed from TTFB on every page load.

---

### 2. ~~Render-Blocking Fonts — +420ms desktop / +2,020ms mobile~~ ✅ (Done)
- **What:** 3 separate Google Fonts CSS requests block the initial render. Fonts involved: IBM Plex Mono, Noto Naskh Arabic, Cabinet Grotesk (via Fontshare). The LCP element (`<p class="hero-subheadline visible">`) cannot paint until these finish.
- **Where:** `<head>` of the landing page layout
- **Fix options (pick one):**
  - Self-host all fonts and serve them from Vercel (fastest, no external dependency)
  - Use `font-display: optional` to prevent render blocking (text may flash unstyled briefly)
  - At minimum, add `&display=swap` to all Google Fonts URLs if not already present
- **Impact:** Up to 2 seconds removed from LCP on mobile.

---

### 3. ~~Convex WebSocket Running on Landing Page~~ ✅ (Done)
- **What:** Convex client initializes on the public landing page and immediately fails with `ERR_NAME_NOT_RESOLVED` (3 repeated WebSocket errors in the console). The landing page has no Convex queries and should never initialize the Convex client.
- **Where:** Root layout or landing page layout wrapping — the `ConvexProvider` is wrapping routes it shouldn't.
- **Fix:** Scope the `ConvexProvider` to dashboard/authenticated routes only. The landing page layout (`/[locale]/page.tsx` or equivalent) should not be inside the Convex provider tree.
- **Impact:** Fixes Best Practices score (96 → 100), eliminates 3 console errors, removes unnecessary network requests on every landing page load.

---

### 4. ~~Security Headers Missing (High Severity)~~ ✅ (Done)
- **What:** 4 security headers are missing — all flagged as High severity by Lighthouse.
  - No Content Security Policy (CSP) in enforcement mode
  - No Cross-Origin-Opener-Policy (COOP) header
  - No X-Frame-Options / `frame-ancestors` directive
  - No `require-trusted-types-for` CSP directive
- **Where:** `vercel.json` (or `next.config.js` headers)
- **Fix:** Add a `headers` block in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```
- **Note:** Full CSP with Trusted Types is more complex and can be deferred post-launch, but the 3 headers above are straightforward.
- **Impact:** Best Practices score improvement, security hardening.

---

## P1 — High Impact, Quick Wins

### 5. ~~Missing Preconnect Hints~~ ✅ (Done)
- **What:** Zero preconnect hints present. Lighthouse identified 3 candidates with significant LCP savings.
- **Where:** `<head>` of landing page layout
- **Fix:** Add before any font or Clerk tag:

```html
<link rel="preconnect" href="https://cdn.fontshare.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://safe-pheasant-87.clerk.accounts.dev" />
```

- **Savings:** 540ms (Fontshare) + 310ms (Clerk) + 90ms (clerk telemetry) in LCP path.
- **Impact:** Quick win, 5 minutes, no risk.

---

### 6. Non-Composited SVG Animations (5 elements)
- **What:** The bot flow diagram on the landing page animates SVG `<path>` elements using `stroke-dashoffset`. This property is not GPU-compositable — the browser must repaint on every frame, causing janky animation and contributing to CLS.
- **Where:** The flow diagram component in the landing page (class `flow-edge`)
- **Fix:** Replace `stroke-dashoffset` animation with `opacity` fade-in or `transform`-based animation. Alternatively, use `will-change: transform` or remove animation entirely on the static landing page version.
- **Note:** Lighthouse also flagged `Unsupported CSS Property: stroke-dashoffset` — this may not be supported in the test environment at all.
- **Impact:** Eliminates CLS contribution, removes jank, fixes 5 flagged elements.

---

### 7. Logo SVG Missing Explicit `width` Attribute
- **What:** Both `<img src="/yoosr-light.svg">` elements have `height` set but no `width`. The browser cannot calculate the aspect ratio until the SVG is fetched, causing potential layout shift.
- **Where:** Navbar and footer logo instances
- **Current code:**
  ```html
  <img src="/yoosr-light.svg" alt="Yoosr" height="32" class="h-8 w-auto">
  <img src="/yoosr-light.svg" alt="Yoosr" height="24" class="h-6 w-auto mb-1">
  ```
- **Fix:** Add explicit `width` matching the SVG's natural aspect ratio. If the logo is e.g. 120×32, add `width="120"` to the first and `width="90"` to the second.
- **Impact:** Reduces CLS, removes Lighthouse diagnostic warning.

---

### 8. Footer Contrast Ratio Failures (Accessibility — 4 missing points)
- **What:** 6 elements in the footer fail WCAG AA contrast ratio requirements. Text color is too close to the `var(--lp-surface)` background.
- **Failing elements:**
  - `Product video coming soon` (`.product-showcase-placeholder`)
  - `© 2026 Yoosr` (`<span>` in footer)
  - `support@yoosr.app` (`<span>` in footer)
  - `Terms of Service` link
  - `Privacy Policy` link
  - Footer wrapper text generally
- **Fix:** Increase text color brightness for footer secondary text. Change to `color: var(--lp-text-muted)` or equivalent with a value that passes 4.5:1 contrast ratio against `var(--lp-surface)`. Use https://webaim.org/resources/contrastchecker/ to verify.
- **Impact:** Accessibility score 96 → 100.

---

## P2 — Performance Optimizations

### 9. Legacy JavaScript Polyfills — 13.7 KiB wasted
- **What:** A JS chunk is shipping polyfills for APIs that are natively supported in all modern browsers:
  - `Array.prototype.at`
  - `Array.prototype.flat`
  - `Array.prototype.flatMap`
  - `Object.fromEntries`
  - `Object.hasOwn`
  - `String.prototype.trimEnd`
  - `String.prototype.trimStart`
- **Where:** Next.js build config / `browserslist` in `package.json`
- **Fix:** Add or update `browserslist` in `package.json`:
  ```json
  "browserslist": [
    "chrome >= 80",
    "firefox >= 80",
    "safari >= 14",
    "edge >= 80"
  ]
  ```
  Or in `.browserslistrc`:
  ```
  > 0.5%
  last 2 versions
  not dead
  not IE 11
  ```
- **Impact:** ~14 KiB JS removed, faster parse time.

---

### 10. Unused JavaScript — 211 KiB
- **What:** Lighthouse estimates 211 KiB of JS is loaded but unused on initial page load. Breakdown:
  - Clerk SDK: 185.4 KiB unused (`ui-common`, `clerk.browser`, `vendors` chunks)
  - First-party chunk: 25.4 KiB unused
- **Where:** Clerk is loading its full UI bundle even for unauthenticated visitors on the landing page.
- **Fix:** This is partially resolved by Fix #3 (removing ConvexProvider from landing page). Additionally, ensure Clerk's `<ClerkProvider>` is also not wrapping the landing page. Clerk should only be initialized on `/dashboard` and `/design-studio` routes.
- **Impact:** Major mobile performance improvement (Clerk JS is the single biggest unused payload).

---

### 11. Unused CSS — Est. 2+ KiB
- **What:** CSS rules loaded but not used for above-the-fold content. One minification saving of ~2.2 KiB identified in `.hero-section` styles.
- **Where:** Landing page CSS chunks
- **Fix:** Next.js handles CSS minification in production automatically. Verify `NODE_ENV=production` is set on Vercel (it should be by default). Additionally consider splitting landing-page-specific CSS from dashboard CSS if they share a bundle.
- **Impact:** Minor — Lighthouse considers this low priority.

---

### 12. Fontshare Fonts Cache TTL Too Short
- **What:** Cabinet Grotesk fonts from `cdn.fontshare.com` have a cache TTL of only 7 days. Lighthouse flagged this as a caching inefficiency (~4 KiB wasted on repeat visits).
- **Where:** External — Fontshare CDN headers
- **Fix:** If self-hosting fonts (recommended per Fix #2), this is resolved automatically since you control cache headers via Vercel. Add `Cache-Control: public, max-age=31536000, immutable` to font assets in `vercel.json`.
- **Impact:** Repeat visitor performance, minor.

---

## Summary Table

| # | Issue | Priority | Effort | Impact |
|---|---|---|---|---|
| 1 | ~~Redirect chain (3 hops)~~ | P0 | Medium | ✅ Done |
| 2 | ~~Render-blocking fonts~~ | P0 | Medium | ✅ Done |
| 3 | ~~Convex on landing page~~ | P0 | Low | ✅ Done |
| 4 | ~~Security headers missing~~ | P0 | Low | ✅ Done |
| 5 | ~~Missing preconnect hints~~ | P1 | Low | ✅ Done |
| 6 | Non-composited SVG animations | P1 | Medium | CLS + jank |
| 7 | Logo width attribute missing | P1 | Low | CLS |
| 8 | Footer contrast failures | P1 | Low | A11y 96→100 |
| 9 | Legacy JS polyfills | P2 | Low | ~14 KiB JS |
| 10 | Unused Clerk JS bundle | P2 | Medium | ~185 KiB JS mobile |
| 11 | Unused CSS | P2 | Low | Minor |
| 12 | Fontshare cache TTL | P2 | Low | Repeat visitors |

---

## Expected Outcome After P0+P1 Fixes

| | Desktop (current → target) | Mobile (current → target) |
|---|---|---|
| Performance | 85 → 95+ | 61 → 80+ |
| LCP | 1.9s → <1.5s | 9.5s → <4s |
| Accessibility | 96 → 100 | 96 → 100 |
| Best Practices | 96 → 100 | 96 → 100 |
