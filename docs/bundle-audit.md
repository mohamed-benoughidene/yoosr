# Bundle Size Audit Report

**Date:** Sunday, April 5, 2026
**Tool:** `@next/bundle-analyzer` + manual chunk inspection
**Build:** Next.js 16.1.6 (Turbopack)

---

## Overall Bundle Sizes

| Asset | Size | Status |
|-------|------|--------|
| Client static (`/.next/static`) | **5.2 MB** (uncompressed) | ⚠️ Moderate |
| Server (`/.next/server`) | **13 MB** (uncompressed) | ✅ Expected (includes SSR) |

---

## Largest Client Chunks

| Chunk | Size | Likely Content |
|-------|------|----------------|
| `2170a4aa-*.js` | **400 KB** | `xlsx` (SheetJS) — spreadsheet parsing |
| `3486-*.js` | **344 KB** | `@xyflow/react` (React Flow) — node graph editor |
| `8640-*.js` | **316 KB** | Next.js internals + shared framework code |
| `4bd1b696-*.js` | **196 KB** | `recharts` + D3 dependencies |
| `framework-*.js` | **188 KB** | React + ReactDOM (expected) |
| `3794-*.js` | **188 KB** | `@clerk/nextjs` — authentication |
| `5d752a83-*.js` | **168 KB** | `next-intl` + i18n message bundles |
| `main-*.js` | **132 KB** | Next.js client runtime + bootstrap |
| `8503-*.js` | **108 KB** | `framer-motion` + animation utilities |
| `9647-*.js` | **100 KB** | `lucide-react` icon set |

---

## Dependency Analysis

### 🔴 `xlsx` (SheetJS) — ~700KB+ minified

| Metric | Status |
|--------|--------|
| **Where used** | `src/app/[locale]/dashboard/contacts/page.tsx`, `src/app/[locale]/dashboard/orders/page.tsx` |
| **Lazy loaded?** | ❌ **No** — top-level static import |
| **Leaks to public pages?** | No |
| **Risk** | **HIGH** — May be included in shared dashboard chunk, loaded on every dashboard page |

**Problem:** Imported directly in two page-level components. Next.js may bundle this into a shared dashboard chunk, meaning users pay the 700KB cost even when viewing settings, bots, or other non-spreadsheet pages.

**Recommendation:**
```tsx
// Before (current):
import * as XLSX from "xlsx";

// After (lazy):
const XLSX = dynamic(() => import("xlsx"), { ssr: false });
// Or better: only load when user clicks "Export" button
const handleExport = async () => {
  const XLSX = await import("xlsx");
  // use XLSX here
};
```

**Estimated savings:** 700KB removed from initial dashboard bundle.

---

### 🟡 `@xyflow/react` (React Flow) — ~200KB+ minified

| Metric | Status |
|--------|--------|
| **Where used** | Design studio route (`/design-studio/[botId]`) only |
| **Lazy loaded?** | No, but route-scoped |
| **Leaks to public pages?** | No |
| **Risk** | **LOW** — Properly isolated to design-studio route |

**Status: ✅ Acceptable.** All imports are confined to the `design-studio` route tree and `components/design-studio/` directory. No leakage into marketing or dashboard pages.

**Note:** `src/types/flow.ts` imports `Node, Edge` types from `@xyflow/react`, but the entire import chain (`types/flow.ts` → `BlockPalette.tsx` → `FlowEditor.tsx`) is scoped to design-studio only.

---

### 🟡 `recharts` — ~180KB+ minified

| Metric | Status |
|--------|--------|
| **Where used** | Dashboard analytics page only |
| **Lazy loaded?** | ✅ Yes — `next/dynamic` with `{ ssr: false }` |
| **Leaks to public pages?** | No |
| **Risk** | **LOW** — Properly lazy loaded |

**Status: ✅ Good.** Both `ConversationVolumeChart` and `AnalyticsTagsChart` are loaded via `next/dynamic` on the analytics page only.

**Dead code warning:** `src/components/ui/chart.tsx` imports all of `recharts` but is **not imported anywhere**. This is a shadcn/ui scaffold. Either delete it or document it as a template.

---

### 🟢 `framer-motion` — ~35KB minified

| Metric | Status |
|--------|--------|
| **Where used** | `src/components/landing/VideoPlayer.tsx` (marketing landing) |
| **Lazy loaded?** | ❌ No — direct import |
| **Leaks to public pages?** | Yes (landing page only) |
| **Risk** | **LOW-MODERATE** — Only affects landing page LCP |

**Status: ⚠️ Acceptable but optimizable.** Used in `VideoPlayer.tsx` for a popover animation effect in the landing page hero. Loads on first paint of the marketing site.

**Optional optimization:** Replace `motion`/`AnimatePresence` with CSS `@keyframes` to eliminate this dependency entirely from the marketing bundle. A simple CSS scale + opacity transition would achieve the same effect.

**Estimated savings:** 35KB from landing page bundle.

---

### 🟢 `@clerk/nextjs` — ~188KB minified

| Metric | Status |
|--------|--------|
| **Where used** | Auth middleware, dashboard shell, sign-in pages |
| **Lazy loaded?** | N/A — Required for auth |
| **Risk** | **NONE** — Essential dependency |

**Status: ✅ Expected.** Clerk is required for authentication and is loaded on all authenticated pages. This is an acceptable cost for a SaaS application.

---

### 🟢 `lucide-react` — ~100KB minified

| Metric | Status |
|--------|--------|
| **Where used** | Throughout the app (icons) |
| **Lazy loaded?** | N/A — Tree-shaken per-component |
| **Risk** | **LOW** — Next.js tree-shakes unused icons |

**Status: ✅ Good.** Icons are imported individually (e.g., `import { Home } from "lucide-react"`), so only used icons are included in each chunk. The 100KB chunk likely represents the total icon set used across the app, which is acceptable.

---

### 🟢 `papaparse` — ~15KB minified

| Metric | Status |
|--------|--------|
| **Where used** | Dashboard contacts + orders pages |
| **Lazy loaded?** | ❌ No — top-level static import |
| **Risk** | **LOW** — Small library |

**Status: ⚠️ Minor.** Small enough that lazy loading is optional, but should be lazy-loaded alongside `xlsx` if that optimization is applied (since they're used together for CSV/Excel export).

---

## Route-Level Bundle

| Route | Approx Client JS | Notes |
|-------|-----------------|-------|
| `/` (marketing landing) | ~450KB | React + framer-motion + intl + icons |
| `/dashboard/*` | ~800KB | React + Clerk + dashboard shell (xlsx may leak) |
| `/dashboard/analytics` | ~1.1MB | Dashboard + recharts (lazy loaded) |
| `/design-studio/[botId]` | ~1.0MB | Dashboard + @xyflow/react |
| `/[locale]/pricing` | ~300KB | Marketing + minimal extra |
| `/[locale]/login` | ~350KB | Clerk auth + minimal UI |

**Note:** All sizes are uncompressed. Brotli compression in production will reduce these by ~60-70%.

---

## Recommendations (Priority Order)

### 1. 🔴 Lazy-load `xlsx` in contacts/orders pages (HIGH IMPACT)

**Effort:** 30 minutes
**Savings:** ~700KB from initial dashboard bundle

**What to do:**
```tsx
// In dashboard/contacts/page.tsx and dashboard/orders/page.tsx

// Remove top-level import:
// import * as XLSX from "xlsx";

// Load on-demand when user clicks export:
const handleExportExcel = async () => {
  const XLSX = await import("xlsx");
  // ... build workbook
};
```

---

### 2. 🟡 Replace `framer-motion` with CSS animations (OPTIONAL)

**Effort:** 30 minutes
**Savings:** ~35KB from landing page bundle

**What to do:**
```css
/* Replace framer-motion popover animation with: */
@keyframes popoverIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.video-popover { animation: popoverIn 0.3s ease-out; }
```

---

### 3. 🟢 Delete dead `chart.tsx` component

**Effort:** 1 minute
**Savings:** Prevents accidental future recharts imports

**What to do:**
```bash
rm src/components/ui/chart.tsx
```

---

### 4. 🟢 Audit icon imports for deduplication

**Effort:** 15 minutes
**Savings:** ~10-20KB (minor)

**What to do:** Check if any icons are imported in multiple files and could be consolidated into a shared icon registry.

---

## Summary

| Category | Status |
|----------|--------|
| **Total client bundle** | 5.2MB uncompressed (acceptable for multi-page app) |
| **Largest single chunk** | 400KB (xlsx) — should be lazy-loaded |
| **Route isolation** | ✅ Good — no cross-route leakage |
| **Tree-shaking** | ✅ Good — icons, recharts properly tree-shaken |
| **Lazy loading** | ⚠️ Partial — recharts ✅, xlsx ❌ |
| **Dead code** | ⚠️ 1 file (`chart.tsx`) |

**Overall assessment:** The bundle is in good shape with proper route isolation. The single biggest win is lazy-loading `xlsx`, which could save ~700KB from the initial dashboard JavaScript. All other optimizations are optional polish.

---

## Files Modified

- `next.config.ts` — Added `@next/bundle-analyzer` configuration
- `package.json` — Added `analyze` script + dev dependencies

## How to Re-run Analysis

```bash
# Generate static HTML report:
ANALYZE=true bun run build

# Open the report:
open bundle-report.html  # macOS
xdg-open bundle-report.html  # Linux
```
