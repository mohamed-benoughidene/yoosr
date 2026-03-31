# PageSpeed Fix Plan — Implementation Review

> Reviewed: 2026-03-31T17:53

---

## Summary

**9 of 11 fixes implemented correctly. 2 issues found.**

| Fix # | Description | Status | Notes |
|-------|-------------|--------|-------|
| 1 | Redirect chain — i18n navigation | ✅ Done | `navigation.ts` created, landing components migrated |
| 2 | Render-blocking fonts | ✅ Done | `@import` removed, `next/font/google` in layout |
| 3 | Font 404 errors | ✅ Done | Weight range `600 700`, `font-display: swap`, corrupt file deleted |
| 4 | CSP headers | ✅ Done | Added to `vercel.json` |
| 5 | Color contrast | ✅ Done | `--lp-text-muted` updated to `#9E9AAD` |
| 6 | SVG animation compositing | ✅ Done | `stroke-dashoffset` removed, opacity-only |
| 7 | Forced reflow | ✅ Done | `requestAnimationFrame` debouncing added |
| 8 | Unused JS (dynamic imports) | ✅ Done | Below-fold components use `next/dynamic` |
| 9 | Unminified CSS | ⏭️ Skipped | Inline `<style>` blocks still present (expected — this was marked as deferrable) |
| 10 | Network payload | ✅ N/A | Cumulative result of other fixes |
| 11 | ScrollReveal shared observer | ❌ **Missing** | Still creates a new `IntersectionObserver` per instance |

---

## Issues Found

### Issue 1: `FinalCTA.tsx` still uses `window.location.href` (Fix 1 incomplete)

**File**: `src/components/landing/FinalCTA.tsx` — line 99

```typescript
onClick={() => window.location.href = '/waitlist'}
```

This was **not covered in the original fix plan** (only Hero.tsx was listed), but it's the same problem — bypasses Next.js routing, causes a full page reload and redirect chain. This component is dynamically imported now, but when a user clicks the CTA, it triggers the 3-redirect chain.

**Fix**: Replace the button with a locale-aware Link, same pattern as the Hero fix:

```tsx
// Add import at top:
import { Link } from "@/i18n/navigation";

// Replace lines 98-123 with:
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

---

### Issue 2: `ScrollReveal.tsx` shared observer not implemented (Fix 11 missing)

**File**: `src/components/landing/ScrollReveal.tsx`

The file is unchanged — still creates a **new `IntersectionObserver` per instance**. With ~10 ScrollReveal instances on the landing page, this creates 10 observers. This was Fix 11 in the plan.

The file should be replaced with the shared observer pattern from the fix plan. Current code:

```typescript
// Current — creates observer per instance
const observer = new IntersectionObserver(...)
observer.observe(el)
return () => observer.disconnect()
```

Should use a singleton observer shared across all instances.

---

## Everything Else Looks Good ✅

- **Root layout** (`layout.tsx`): Correctly uses `next/font/google` with `Inter`, `Playfair_Display`, `IBM_Plex_Mono` — all with `display: "swap"` ✅
- **globals.css**: `@import url()` lines removed, font variables reference `var(--font-inter)` etc. ✅ `--lp-text-muted: #9E9AAD` ✅
- **Marketing layout**: Clerk preconnect removed, Noto Naskh Arabic conditionally loaded for `ar` locale only, `display=swap` ✅
- **cabinet-grotesk.css**: Weight range `600 700`, `font-display: swap` ✅ Corrupt `5678GHIJKLMNOP.woff2` deleted ✅
- **vercel.json**: CSP header added with proper directives for Clerk, Convex, fonts ✅
- **DesignStudioSection.tsx**: `stroke-dashoffset` removed, opacity-only fade-in ✅
- **HowItWorks.tsx**: `requestAnimationFrame` debouncing with proper cleanup ✅
- **Hero.tsx**: Uses `Link` from `@/i18n/navigation` ✅
- **i18n/navigation.ts**: Created with `createNavigation` ✅
- **Landing components**: No more `next/link` or `next/navigation` imports ✅
- **page.tsx**: Dynamic imports for below-fold components ✅
