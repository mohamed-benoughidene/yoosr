# React Doctor Fix Plan — Executable Instructions

> **Source**: `react-doctor@latest` scan — Mar 31, 2026 — Score **79/100 (Great)**
> **Issues**: 1 error · 230 warnings · across 94/280 files
> **Executor**: Qwen Coder Agent

> [!IMPORTANT]
> This plan is organized by phase. Execute **Phase 0** first (the error), then proceed in order.
> All file paths are relative to the project root `/home/mohamed/lab/yoosr`.

---

## Stack Context

- **Framework**: Next.js (App Router) — TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Convex + Clerk
- **i18n**: next-intl

---

## Phase 0 — Fix the Error (Priority: CRITICAL)

---

### Fix 0.1: `useState` Expensive Initial Value

**Issue**: Calling a computation directly inside `useState(...)` runs it on every render, not just once. Pass an initializer **function** instead.

**Affected files**:
- `src/components/dashboard/kb/add-content-dialog.tsx` — line 155
- `src/components/dashboard/bots/create-bot-dialog.tsx` — lines 62, 75
- `src/components/dashboard/shared/VisitorPanel.tsx` — line 166

**Pattern to fix**:
```tsx
// ❌ BEFORE — runs on every render
const [state, setState] = useState(expensiveComputation())

// ✅ AFTER — runs only once, on mount
const [state, setState] = useState(() => expensiveComputation())
```

**File 1**: `src/components/dashboard/kb/add-content-dialog.tsx`

Open the file and locate line 155. Find the `useState(...)` call where the initial value is a function call or object construction (not a primitive). Wrap it in an arrow function:
```tsx
// Find pattern like:
const [x, setX] = useState(someObject() || someComputation)
// Change to:
const [x, setX] = useState(() => someObject() || someComputation)
```

**File 2**: `src/components/dashboard/bots/create-bot-dialog.tsx`

Repeat for lines 62 and 75.

**File 3**: `src/components/dashboard/shared/VisitorPanel.tsx`

Repeat for line 166.

**Verification**: Run `npx react-doctor@latest . --verbose` — error count should drop to 0.

---

## Phase 1 — Dead Code Cleanup (Priority: HIGH)

Delete all confirmed unused files. No logic changes needed.

---

### Fix 1.1: Delete Confirmed Unused Files

Run the following commands in sequence:

```bash
# Orphaned landing components (never imported)
rm src/components/landing/CtaSection.tsx
rm src/components/landing/Testimonials.tsx

# Orphaned layout components (app uses LandingHeaderNoAuth + SiteHeader instead)
rm src/components/layout/LandingHeader.tsx
rm src/components/layout/Header.tsx
rm src/components/layout/MobileNav.tsx
rm src/components/layout/NavbarCTA.tsx

# Duplicate settings sidebar (real one is at @/components/settings/SettingsSidebar)
rm src/components/dashboard/settings/SettingsSidebar.tsx

# Redundant operating hours component (logic lives in the settings page directly)
rm src/components/dashboard/settings/operating-hours.tsx

# Stale mock data files
rm src/components/dashboard/bots/data.ts
rm src/components/dashboard/contacts/data.ts
rm src/components/dashboard/kb/data.ts

# Unused UI primitive
rm src/components/ui/collapsible.tsx

# Unused utility library
rm src/lib/notifications.ts

# Redundant i18n config (handled by next.config.ts + src/i18n/request.ts)
rm next-intl.config.ts
```

> [!WARNING]
> After deleting, verify the dev server (`bun dev`) starts without TypeScript errors. If any file throws a "Cannot find module" error, that file is still referenced — investigate and fix the import before removing.

**Verification**: Run `bun dev` — zero errors. Run `npx react-doctor@latest .` — "Unused file" count should drop by 14.

---

## Phase 2 — SSR / Suspense Boundaries (Priority: HIGH)

**Issue**: `useSearchParams()` requires a `<Suspense>` boundary. Without one, the entire page bails out to client-side rendering, harming SSR and streaming performance.

---

### Fix 2.1: Wrap all `useSearchParams` components in `<Suspense>`

For each file below, find the component using `useSearchParams()` and wrap its usage at the **parent level** with a `<Suspense>` boundary.

**Affected files**:
1. `src/app/[locale]/dashboard/chat/ChatShell.tsx` — line 19
2. `src/app/[locale]/waitlist/WaitlistClient.tsx` — line 10
3. `src/components/design-studio/NodePropertiesPanel.tsx` — line 43
4. `src/app/[locale]/design-studio/[botId]/BotEditorClient.tsx` — line 23
5. `src/components/design-studio/FlowToolbar.tsx` — line 23
6. `src/app/[locale]/design-studio/DesignStudioShell.tsx` — line 21
7. `src/components/chat/ConversationList.tsx` — line 30
8. `src/components/chat/ChatArea.tsx` — line 63

**Pattern to apply**:

**Option A — Component uses `useSearchParams` internally** (most common case):

Split the component into two: an outer shell that renders a `<Suspense>` and an inner one with the actual logic.

```tsx
// ❌ BEFORE — single component using useSearchParams
"use client"
import { useSearchParams } from "next/navigation"

export function MyComponent() {
  const searchParams = useSearchParams()
  // ...rest of logic
  return <div>...</div>
}
```

```tsx
// ✅ AFTER — split into shell + inner
"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function MyComponentInner() {
  const searchParams = useSearchParams()
  // ...rest of logic (unchanged)
  return <div>...</div>
}

export function MyComponent() {
  return (
    <Suspense fallback={<div className="animate-pulse h-8 w-full bg-muted rounded" />}>
      <MyComponentInner />
    </Suspense>
  )
}
```

**Option B — Component is already rendered inside a parent you control**:

Wrap the usage in the parent instead of creating an inner component.

```tsx
// In the parent file
import { Suspense } from "react"
import { MyComponent } from "./MyComponent"

<Suspense fallback={<Skeleton />}>
  <MyComponent />
</Suspense>
```

> [!NOTE]
> Choose Option A when the component using `useSearchParams` is exported and used in many places. Choose Option B when it's used in only one parent.

Apply the fix to all 8 affected files. Use a loading skeleton (`<div className="animate-pulse ...">`) or `null` as the fallback — avoid using `<Spinner>` for short searches.

**Verification**: Run `bun dev` — no console warnings about missing Suspense boundaries. Run `npx react-doctor@latest .` — `useSearchParams` warning count should be 0.

---

## Phase 3 — Image Optimization (Priority: HIGH)

**Issue**: Using `<img>` instead of `next/image` misses automatic WebP/AVIF conversion, lazy loading, and responsive srcsets.

---

### Fix 3.1: Replace `<img>` with `next/image`

**Affected files**:
1. `src/app/widget/components/WidgetChat.tsx` — line 146
2. `src/components/chat/ChatArea.tsx` — line 53
3. `src/components/layout/LandingHeaderNoAuth.tsx` — line 21
4. `src/components/layout/LandingFooter.tsx` — line 8
5. `src/app/[locale]/(marketing)/layout.tsx` — (if applicable)

> [!NOTE]
> `src/components/layout/Header.tsx`, `LandingHeader.tsx`, and `MobileNav.tsx` are being **deleted in Phase 1**, so skip those.

**Pattern to apply**:

```tsx
// ❌ BEFORE
import logo from "@/public/logo.svg"
<img src="/logo.svg" alt="Logo" width={120} height={40} />
// or
<img src={user.avatar} alt="Avatar" className="..." />
```

```tsx
// ✅ AFTER — for static local images
import Image from "next/image"
import logo from "@/public/logo.svg"

<Image src={logo} alt="Logo" width={120} height={40} priority />
```

```tsx
// ✅ AFTER — for dynamic/remote images
import Image from "next/image"

<Image
  src={user.avatar || "/default-avatar.png"}
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

> [!IMPORTANT]
> For remote images (URLs from Convex, Clerk user avatars, etc.), you must add the hostname to `next.config.ts`:
> ```ts
> const nextConfig: NextConfig = {
>   images: {
>     remotePatterns: [
>       { hostname: "img.clerk.com" },
>       { hostname: "**.convex.cloud" },
>     ],
>   },
> }
> ```
> Check each file to determine if the `src` is a local path or a remote URL.

For the **logo** images in layout components: these are likely above-the-fold, so add the `priority` prop to preload them.

For **avatar** images in chat components: use `width={32} height={32}` or whatever matches the CSS size.

**Verification**: Zero `<img>` elements in edited files. Run `bun dev` — no broken images.

---

## Phase 4 — Security: Remove `dangerouslySetInnerHTML` (Priority: HIGH)

**Issue**: `dangerouslySetInnerHTML` is used to inject CSS. This is an XSS risk and blocks CSS minification. The inline `<style>` blocks need to be moved to proper CSS files or Tailwind classes.

---

### Fix 4.1: Move inline styles for landing components to a CSS Module or CSS file

**Affected files**:
1. `src/components/landing/DesignStudioSection.tsx` — line 11
2. `src/components/landing/Hero.tsx` — line 25
3. `src/components/landing/ChannelsSection.tsx` — line 35
4. `src/components/ui/chart.tsx` — line 81

**Strategy**: Extract any `<style dangerouslySetInnerHTML={{ __html: \`...\` }}>` to a `.css` file (or CSS Module), then import it.

**Step 1**: Create `src/components/landing/landing.css`

Open each component file listed above. Copy the entire CSS string from inside the `dangerouslySetInnerHTML={{ __html: \`...\` }}` prop into `landing.css`.

**Step 2**: Remove the `<style dangerouslySetInnerHTML={...} />` tag from each component.

**Step 3**: Import the CSS in the marketing layout (once is enough since Next.js deduplicates CSS imports):

```tsx
// src/app/[locale]/(marketing)/layout.tsx
import "@/components/landing/landing.css"
```

**Step 4**: For `src/components/ui/chart.tsx` — this is a shadcn component that uses `dangerouslySetInnerHTML` for chart tooltips. The safest approach is to **leave this one as-is** — it's a known shadcn pattern and sanitized data. Remove the `// eslint-disable-next-line` comment if present and add a comment explaining it is intentional:

```tsx
{/* 
  dangerouslySetInnerHTML is intentional here — the chart config is 
  developer-controlled, never user input. This is a shadcn/ui pattern.
*/}
```

**Verification**: Zero `dangerouslySetInnerHTML` in landing components. Landing page still looks identical.

---

## Phase 5 — Performance: GPU / Transition Optimizations (Priority: MEDIUM)

---

### Fix 5.1: Replace `blur(100px)` with smaller radii

**Issue**: Large CSS `blur()` values are expensive on GPU, especially on mobile. Anything above 10px can cause rendering slowdowns.

**Affected files**:
1. `src/components/landing/Hero.tsx` — lines 238, 252
2. `src/components/landing/FeaturesGrid.tsx` — line 50
3. `src/components/landing/FinalCTA.tsx` — line 19
4. `src/components/layout/LandingHeaderNoAuth.tsx` — line 12
5. `src/components/landing/ProblemSection.tsx` — line 26

> [!NOTE]
> `src/components/layout/LandingHeader.tsx` is being **deleted in Phase 1**, skip it.

**Pattern to apply**: Reduce blur radius to ≤ 10px. The visual effect decreases but performance improves significantly.

```css
/* ❌ BEFORE */
filter: blur(100px);
/* or */
backdropFilter: blur(100px)

/* ✅ AFTER */
filter: blur(8px);
/* or */
backdropFilter: blur(8px)
```

> [!TIP]
> If the visual effect matters (e.g., for a large background glow), reduce the blur but increase the `opacity` or `scale` of the element to maintain a similar visual result.

---

### Fix 5.2: Replace `transition: "all"` with specific properties

**Issue**: `transition: all` animates every animatable CSS property on every change, causing unnecessary work.

**Affected files**:
1. `src/components/landing/FeaturesGrid.tsx` — line 109
2. `src/components/layout/LandingHeaderNoAuth.tsx` — line 62
3. `src/components/layout/LandingHeader.tsx` — lines 63, 92 *(deleted in Phase 1, skip)*

**Pattern to apply**:

```tsx
// ❌ BEFORE — inline style
style={{ transition: "all 300ms ease" }}

// ✅ AFTER — specific properties only
style={{ transition: "opacity 300ms ease, transform 300ms ease" }}
```

```tsx
// For Tailwind classes:
// ❌ BEFORE
className="transition-all duration-300"

// ✅ AFTER — whichever applies
className="transition-colors duration-300"
// or
className="transition-opacity duration-300"
// or
className="transition-transform duration-300"
```

---

## Phase 6 — Next.js Best Practices (Priority: MEDIUM)

---

### Fix 6.1: Replace Google Fonts `<link>` with `next/font`

**Issue**: Loading fonts via `<link>` causes render-blocking. `next/font` self-hosts fonts and eliminates layout shift.

**File**: `src/app/[locale]/(marketing)/layout.tsx` — lines 19, 23

Find the `<link>` tags loading Google Fonts. Remove them and replace with `next/font/google`.

```tsx
// ❌ BEFORE — in layout.tsx JSX
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&display=optional" rel="stylesheet" />
```

```tsx
// ✅ AFTER — at the top of the file
import { Noto_Naskh_Arabic } from "next/font/google"

const notoNaskhArabic = Noto_Naskh_Arabic({
  weight: ["700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-arabic",
})

// Then in the JSX — add the variable to <html> or the wrapper div:
<div className={notoNaskhArabic.variable}>
  {/* ... rest of layout */}
</div>
```

> [!NOTE]
> Also remove the `<link rel="stylesheet" href="...css">` tag for any CSS file that is imported in the layout. Import it via JS instead: `import "@/public/fonts/cabinet-grotesk/cabinet-grotesk.css"` — or better, move `@font-face` declarations into `globals.css`.

---

### Fix 6.2: Replace `<a>` with `next/link` for internal navigation

**Issue**: Raw `<a>` tags for internal links cause full page reloads instead of client-side navigation.

**File**: `src/components/layout/LandingFooter.tsx` — lines 22, 24

```tsx
// ❌ BEFORE
<a href="/privacy">Privacy</a>
<a href="/terms">Terms</a>

// ✅ AFTER
import Link from "next/link"

<Link href="/privacy">Privacy</Link>
<Link href="/terms">Terms</Link>
```

> Since this is a landing/marketing page, prefer `@/i18n/navigation` Link for locale-aware routing if applicable.

---

### Fix 6.3: Fix incorrect `href` attributes

**Issue**: Incorrect `href` values on `<a>` elements (likely `href="#"` or `href=""` or `href="javascript:void(0)"`).

**File**: `src/app/[locale]/test-widget/TestWidgetClient.tsx` — lines 55, 56, 57, 58, 181, 182

Open the file and locate these lines. Replace any placeholder `href` values:

```tsx
// ❌ BEFORE
<a href="#">Click me</a>
// or
<a href="javascript:void(0)">Click me</a>

// ✅ AFTER — use a button if there's no real URL
<button type="button" onClick={handleClick}>Click me</button>
// or if it should navigate
<Link href="/actual-destination">Click me</Link>
```

---

### Fix 6.4: Add `lang` attribute to `<html>`

**Issue**: Missing `lang` attribute causes accessibility failures for screen readers.

**File**: `src/app/layout.tsx` — line 35

```tsx
// ❌ BEFORE
<html suppressHydrationWarning>

// ✅ AFTER
<html lang="en" suppressHydrationWarning>
```

> [!NOTE]
> If this is a multi-locale app and the locale is available at root layout level, use the locale:
> ```tsx
> <html lang={locale} suppressHydrationWarning>
> ```
> Check if `locale` is accessible in `src/app/layout.tsx`. If not, `lang="en"` is a valid default.

---

### Fix 6.5: Add metadata to the test-widget page

**Issue**: Page missing SEO metadata export.

**File**: `src/app/[locale]/test-widget/page.tsx` — line 1

Add a metadata export at the top:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Widget Test | Yoosr",
  description: "Test your Yoosr chat widget integration.",
  robots: { index: false }, // Don't index test pages
}
```

---

### Fix 6.6: Extract inline render function `renderOpenRouterCard`

**Issue**: Inline render functions inside JSX cause unnecessary reconciliation on every render.

**File**: `src/app/[locale]/dashboard/settings/integrations/page.tsx` — line 589

Open the file and find:
```tsx
const renderOpenRouterCard = () => (
  // ... JSX
)
// used as:
{renderOpenRouterCard()}
```

**Option A** — Import and use the existing `OpenRouterCard` component directly:

```tsx
// Remove the inline render function entirely and replace with:
import { OpenRouterCard } from "@/components/settings/OpenRouterCard"

// In JSX:
<OpenRouterCard />
```

**Option B** — If the inline function passes props, extract to a proper component at the top of the file:

```tsx
function OpenRouterCardSection({ ... }: Props) {
  return (
    // ... JSX
  )
}
// ... and use <OpenRouterCardSection ... /> in JSX
```

> Option A is preferred since the component already exists at `@/components/settings/OpenRouterCard`.

---

## Phase 7 — Code Splitting for Heavy Libraries (Priority: MEDIUM)

**Issue**: `recharts` is a large library (~200KB). Loading it synchronously blocks the initial page render.

---

### Fix 7.1: Code-split `recharts` chart components

**Affected files**:
1. `src/components/analytics/ConversationVolumeChart.tsx` — line 3
2. `src/components/analytics/AnalyticsTagsChart.tsx` — line 3
3. `src/components/ui/chart.tsx` — line 4 *(shadcn base — handled differently)*

**Strategy**: These chart components are already imported with `next/dynamic` in the analytics page (confirmed earlier). The fix is to ensure the analytics chart components themselves also use lazy recharts imports.

**For `ConversationVolumeChart.tsx` and `AnalyticsTagsChart.tsx`**:

These components already import recharts at the top. Since they are already wrapped in `next/dynamic` by their parent page, no additional changes are needed — the dynamic import boundary already code-splits them.

**Verify this is the case**:

Open `src/app/[locale]/dashboard/analytics/page.tsx` and confirm:
```tsx
const ConversationVolumeChart = dynamic(
  () => import("@/components/analytics/ConversationVolumeChart")
    .then(m => ({ default: m.ConversationVolumeChart })),
  { ssr: false }
)
```

If they are **not** wrapped in `dynamic`, add it:

```tsx
import dynamic from "next/dynamic"

const ConversationVolumeChart = dynamic(
  () => import("@/components/analytics/ConversationVolumeChart")
    .then(m => ({ default: m.ConversationVolumeChart })),
  { loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />, ssr: false }
)

const AnalyticsTagsChart = dynamic(
  () => import("@/components/analytics/AnalyticsTagsChart")
    .then(m => ({ default: m.AnalyticsTagsChart })),
  { loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />, ssr: false }
)
```

---

## Phase 8 — Accessibility (Priority: LOW-MEDIUM)

---

### Fix 8.1: Fix headings without accessible content

**Issue**: Heading elements must contain visible text or screen-reader accessible content.

**File**: `src/components/ui/alert.tsx` — line 39

Open the file and find the heading element that has no content or uses only visual icons:

```tsx
// ❌ BEFORE — empty or icon-only heading
<h5 className="...">
  <Icon />
</h5>

// ✅ AFTER — add sr-only text
<h5 className="...">
  <Icon aria-hidden="true" />
  <span className="sr-only">Alert</span>
</h5>

// OR if the heading should show text visually:
<h5 className="mb-1 font-medium leading-none tracking-tight">
  {title}
</h5>
```

---

## Execution Order Summary

| Phase | Fix | Issue | Files | Risk |
|-------|-----|-------|-------|------|
| 0 | 0.1 | useState expensive init | 3 files | Low |
| 1 | 1.1 | Delete 14 unused files | 14 files | Low |
| 2 | 2.1 | useSearchParams + Suspense | 8 files | Medium |
| 3 | 3.1 | `<img>` → `next/image` | 5 files | Low |
| 4 | 4.1 | dangerouslySetInnerHTML | 3 landing + 1 chart | Medium |
| 5 | 5.1 | blur(100px) → blur(8px) | 5 files | Low |
| 5 | 5.2 | transition:all → specific | 2 files | Low |
| 6 | 6.1 | Google Fonts `<link>` → next/font | 1 file | Low |
| 6 | 6.2 | `<a>` → `next/link` | 1 file | Low |
| 6 | 6.3 | Fix incorrect hrefs | 1 file | Low |
| 6 | 6.4 | Add `lang` to `<html>` | 1 file | Low |
| 6 | 6.5 | Add page metadata | 1 file | Low |
| 6 | 6.6 | Extract render function | 1 file | Low |
| 7 | 7.1 | recharts code-split | 1-2 files | Low |
| 8 | 8.1 | Accessible heading | 1 file | Low |

---

## Expected Score After All Fixes

| Metric | Current | Target |
|--------|---------|--------|
| React Doctor Score | 79/100 | 95+/100 |
| Errors | 1 | 0 |
| Warnings | 230 | < 20 |
| Files with issues | 94/280 | < 15/280 |

> [!TIP]
> Run `npx react-doctor@latest . --verbose` after each phase to track progress and confirm the warning count is dropping.
