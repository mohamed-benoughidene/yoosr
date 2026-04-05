# Part 12: App Routing Structure — Analysis Findings

## 📊 Visual Map

```
src/app/
├── layout.tsx                      → Root layout (fonts, metadata, viewport)
├── globals.css                     → Global styles
├── not-found.tsx                   → Global 404 fallback
├── sitemap.ts                      → Dynamic sitemap (locale-prefixed URLs)
├── robots.ts                       → Robots.txt (blocks dashboard, design-studio, etc.)
│
├── api/                            → API routes (1 route)
│   └── widget/project/route.ts     → GET /api/widget/project (CORS + caching)
│
├── og/image/route.tsx              → GET /og/image (Edge runtime, OG image generation)
│
├── widget/                         → Widget routes (outside locale tree)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/PreChatForm.tsx
│   ├── components/WidgetChat.tsx
│   └── rating-component.tsx
│
└── [locale]/                       → Dynamic i18n segment (en, ar, fr)
    ├── layout.tsx                  → Locale layout (NextIntlClientProvider, HtmlDirSetter, JsonLd)
    ├── not-found.tsx               → Locale-level 404
    │
    ├── (marketing)/                → Route group (no URL segment)
    │   ├── layout.tsx              → Marketing layout (LandingHeaderNoAuth, LandingFooter, MarketingProviders)
    │   ├── error.tsx               → Marketing error boundary
    │   ├── page.tsx                → /{locale} (homepage: Hero, Features, etc.)
    │   └── legal/
    │       ├── privacy/page.tsx    → /{locale}/legal/privacy
    │       └── terms/page.tsx      → /{locale}/legal/terms
    │
    ├── login/page.tsx              → /{locale}/login
    ├── signup/page.tsx             → /{locale}/signup
    ├── pricing/page.tsx            → /{locale}/pricing
    ├── waitlist/page.tsx           → /{locale}/waitlist
    │
    ├── onboarding/
    │   ├── layout.tsx
    │   └── page.tsx                → /{locale}/onboarding
    │
    ├── test-widget/
    │   ├── layout.tsx
    │   └── page.tsx                → /{locale}/test-widget
    │
    ├── products/[slug]/page.tsx    → /{locale}/products/:slug
    │                               → Slugs: design-studio, knowledge-base, integrations, analytics
    │
    ├── solutions/[slug]/page.tsx   → /{locale}/solutions/:slug
    │                               → Slugs: customer-service, marketing, ecommerce, education
    │
    ├── design-studio/              → Design Studio (authenticated)
    │   ├── layout.tsx              → Providers, DesignStudioShell
    │   ├── error.tsx               → Error boundary
    │   └── [botId]/
    │       ├── page.tsx            → /{locale}/design-studio/:botId
    │       ├── loading.tsx         → Loading skeleton
    │       ├── not-found.tsx       → 404 for invalid bot
    │       └── BotEditorClient.tsx → Client component
    │
    └── dashboard/                  → Dashboard (authenticated)
        ├── layout.tsx              → Providers, DashboardAuthGuard, DashboardShell, PushNotificationInit
        ├── page.tsx                → /{locale}/dashboard (stats, live queue, activity feed)
        ├── loading.tsx
        ├── error.tsx
        │
        ├── activities/
        │   ├── page.tsx            → /{locale}/dashboard/activities
        │   ├── loading.tsx
        │   └── error.tsx
        │
        ├── analytics/
        │   ├── page.tsx            → /{locale}/dashboard/analytics
        │   └── error.tsx
        │
        ├── apps/
        │   ├── page.tsx            → /{locale}/dashboard/apps
        │   ├── loading.tsx
        │   └── [provider]/
        │       ├── page.tsx        → /{locale}/dashboard/apps/:provider
        │       ├── loading.tsx
        │       └── not-found.tsx
        │
        ├── bots/
        │   ├── page.tsx            → /{locale}/dashboard/bots
        │   ├── loading.tsx
        │   └── error.tsx
        │
        ├── chat/
        │   ├── layout.tsx          → Chat sub-layout
        │   ├── page.tsx            → /{locale}/dashboard/chat
        │   └── error.tsx
        │
        ├── contacts/
        │   ├── page.tsx            → /{locale}/dashboard/contacts
        │   ├── loading.tsx
        │   └── error.tsx
        │
        ├── history/
        │   └── page.tsx            → /{locale}/dashboard/history
        │
        ├── kb/
        │   ├── layout.tsx          → KB sub-layout
        │   ├── page.tsx            → /{locale}/dashboard/kb (redirects to /dashboard/kb/default)
        │   ├── loading.tsx
        │   ├── error.tsx
        │   └── [kbId]/
        │       ├── page.tsx        → /{locale}/dashboard/kb/:kbId
        │       ├── loading.tsx
        │       └── not-found.tsx
        │
        ├── monitor/
        │   ├── page.tsx            → /{locale}/dashboard/monitor
        │   ├── loading.tsx
        │   └── error.tsx
        │
        ├── orders/
        │   ├── page.tsx            → /{locale}/dashboard/orders
        │   ├── loading.tsx
        │   └── error.tsx
        │
        ├── requests/
        │   └── page.tsx            → /{locale}/dashboard/requests
        │
        ├── test-widget/
        │   └── page.tsx            → /{locale}/dashboard/test-widget
        │
        └── settings/
            ├── layout.tsx          → Settings sub-layout
            ├── page.tsx            → /{locale}/dashboard/settings
            ├── loading.tsx
            ├── error.tsx
            ├── canned-responses/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── departments/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── groups/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── integrations/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── labels/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── operating-hours/
            │   ├── page.tsx
            │   └── loading.tsx
            ├── webhooks/
            │   ├── page.tsx
            │   └── loading.tsx
            └── widget/
                ├── page.tsx
                └── loading.tsx
```

## 📁 File Inventory

| File/Directory | Purpose | Count |
|----------------|---------|-------|
| `src/app/` | Next.js App Router root | 1 dir |
| `src/app/layout.tsx` | Root layout (fonts, metadata, viewport) | 1 file |
| `src/app/globals.css` | Global CSS styles | 1 file |
| `src/app/not-found.tsx` | Global 404 page | 1 file |
| `src/app/sitemap.ts` | Dynamic sitemap generation | 1 file |
| `src/app/robots.ts` | Robots.txt configuration | 1 file |
| `src/app/api/` | API routes | 1 route |
| `src/app/api/widget/project/route.ts` | Widget project data endpoint | 1 file |
| `src/app/og/image/route.tsx` | Open Graph image generation (Edge) | 1 file |
| `src/app/widget/` | Widget embedded view (outside locale) | 5 files |
| `src/app/[locale]/` | Dynamic i18n segment (en, ar, fr) | 1 layout |
| `src/app/[locale]/layout.tsx` | Locale layout with NextIntlClientProvider | 1 file |
| `src/app/[locale]/not-found.tsx` | Locale-level 404 | 1 file |
| `src/app/[locale]/(marketing)/` | Marketing route group | 4 files |
| `src/app/[locale]/dashboard/` | Dashboard routes (authenticated) | ~45 files |
| `src/app/[locale]/design-studio/` | Design studio routes (authenticated) | ~6 files |
| `src/app/[locale]/login/` | Login page | 1 file |
| `src/app/[locale]/signup/` | Signup page | 1 file |
| `src/app/[locale]/pricing/` | Pricing page | 1 file |
| `src/app/[locale]/waitlist/` | Waitlist page | 1 file |
| `src/app/[locale]/onboarding/` | Onboarding flow | 2 files |
| `src/app/[locale]/test-widget/` | Test widget page | 2 files |
| `src/app/[locale]/products/[slug]/` | Dynamic product pages | 1 file |
| `src/app/[locale]/solutions/[slug]/` | Dynamic solution pages | 1 file |
| `src/middleware.ts` | Clerk auth + next-intl middleware | 1 file |
| `src/i18n/routing.ts` | next-intl routing config | 1 file |
| `src/i18n/request.ts` | next-intl request config | 1 file |
| `src/i18n/navigation.ts` | next-intl navigation helpers | 1 file |

**Total files in src/app/: ~104 files**

## ✅ Analysis Checklist

### [x] What's the route hierarchy?

The route hierarchy follows a **three-tier structure**:

1. **Root level (`src/app/`)**: Contains the root layout with font definitions (Inter, Playfair Display, IBM Plex Mono), global metadata (OpenGraph, Twitter cards, alternate languages), and viewport settings. Also contains global `not-found.tsx`, `sitemap.ts`, `robots.ts`, and utility routes (`/api/widget/project`, `/og/image`).

2. **Locale level (`src/app/[locale]/`)**: Dynamic `[locale]` segment supports `en`, `ar`, `fr`. The locale layout wraps everything in `NextIntlClientProvider`, `HtmlDirSetter` (for RTL support on Arabic), and `JsonLd` for structured data. Uses `generateStaticParams()` to pre-generate all three locales. Has `dynamic = "force-dynamic"` to avoid static pre-render crashes when env vars are missing.

3. **Feature level**: Under `[locale]/`, routes are organized by feature domain:
   - `(marketing)/` — Public marketing pages (homepage, legal pages)
   - `dashboard/` — Authenticated dashboard (~45 files, deepest nesting)
   - `design-studio/` — Bot builder tool
   - `login/`, `signup/`, `pricing/`, `waitlist/`, `onboarding/`, `test-widget/` — Standalone pages
   - `products/[slug]/`, `solutions/[slug]/` — Dynamic content pages

The hierarchy depth ranges from **2 levels** (e.g., `/{locale}/login`) to **5 levels** (e.g., `/{locale}/dashboard/settings/canned-responses`).

### [x] How are route groups used? (parentheses directories)

**One route group** is used: `(marketing)` at `src/app/[locale]/(marketing)/`.

**Purpose**: Segments marketing/landing pages from other feature domains (dashboard, design-studio, auth pages) that share the same `[locale]` level, **without adding a URL segment**. The URLs remain clean:
- `/{locale}/` (not `/{locale}/marketing/`)
- `/{locale}/legal/privacy` (not `/{locale}/marketing/legal/privacy`)

**Contents of `(marketing)`**:
- `layout.tsx` — Wraps marketing pages with `LandingHeaderNoAuth`, `LandingFooter`, `MarketingProviders`, and custom fonts
- `error.tsx` — Error boundary specific to marketing routes
- `page.tsx` — Homepage with Hero, Features sections, etc.
- `legal/privacy/page.tsx` — Privacy policy
- `legal/terms/page.tsx` — Terms of service

**No other route groups exist**. Dashboard, design-studio, and other features are organized as regular directories (not groups), meaning their names appear in the URL path.

### [x] Are there dynamic routes? (brackets: `[id]`)

**Yes, 6 dynamic route segments** exist:

| Dynamic Segment | File Path | URL Pattern | Purpose |
|-----------------|-----------|-------------|---------|
| `[locale]` | `src/app/[locale]/layout.tsx` | `/{locale}/*` | i18n locale (en, ar, fr) |
| `[slug]` | `src/app/[locale]/products/[slug]/page.tsx` | `/{locale}/products/:slug` | Product detail pages. Known slugs: `design-studio`, `knowledge-base`, `integrations`, `analytics` |
| `[slug]` | `src/app/[locale]/solutions/[slug]/page.tsx` | `/{locale}/solutions/:slug` | Solution detail pages. Known slugs: `customer-service`, `marketing`, `ecommerce`, `education` |
| `[botId]` | `src/app/[locale]/design-studio/[botId]/page.tsx` | `/{locale}/design-studio/:botId` | Bot editor for specific bot |
| `[provider]` | `src/app/[locale]/dashboard/apps/[provider]/page.tsx` | `/{locale}/dashboard/apps/:provider` | App/integration detail (e.g., `telegram`, `openai`) |
| `[kbId]` | `src/app/[locale]/dashboard/kb/[kbId]/page.tsx` | `/{locale}/dashboard/kb/:kbId` | Knowledge base detail. Supports `default` as a virtual ID |

All dynamic routes use **bracket notation** (`[param]`) per Next.js App Router conventions. No catch-all routes (`[...slug]` or `[[...slug]]`) are used.

### [x] How is middleware used? (auth guards, i18n, logging)

**`src/middleware.ts`** combines **Clerk auth** (`clerkMiddleware`) with **next-intl** (`createMiddleware`).

**Key behaviors**:

1. **Root redirect**: Bare `/` redirects to `/en` (default locale):
   ```ts
   if (pathname === "/") {
     return NextResponse.redirect(new URL("/en", req.url));
   }
   ```

2. **Early skip for static/API paths**: Skips middleware processing for `/api`, `/widget`, `/_next`, and paths containing file extensions (`.png`, `.jpg`, `.css`, `.js`, etc.):
   ```ts
   if (pathname.startsWith("/api") || pathname.startsWith("/widget") || 
       pathname.startsWith("/_next") || pathname.includes(".")) {
     return intlMiddleware(req);
   }
   ```

3. **Dashboard locale redirect**: When accessing `/dashboard` without locale prefix, extracts user's stored locale from Clerk session claims and redirects to `/{locale}/dashboard`:
   ```ts
   if (pathname === "/dashboard" || pathname === "/dashboard/") {
     const authData = await auth();
     if (authData.userId) {
       const unsafeMetadata = authData.sessionClaims?.unsafeMetadata as { locale?: string } | undefined;
       const locale = unsafeMetadata?.locale;
       if (typeof locale === "string" && ["en", "ar", "fr"].includes(locale)) {
         return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
       }
     }
   }
   ```

4. **Protected route authentication**: Routes matching `/dashboard(.*)` and `/design-studio(.*)` require authentication. Unauthenticated users are redirected to `/login`:
   ```ts
   if (isProtectedRoute(req)) {
     await auth.protect({
       unauthenticatedUrl: new URL("/login", req.url).toString(),
     });
   }
   ```

5. **i18l middleware passthrough**: After auth checks, delegates to `intlMiddleware(req)` for locale resolution.

6. **Matcher config**: Excludes `api`, `widget`, `_next`, `static`, `favicon.ico`, and common static asset extensions:
   ```ts
   matcher: ["/((?!api|widget|_next|static|favicon\\.ico|.*\\.(?:png|jpg|svg|ico|css|js|mp4)).*)"]
   ```

**No logging middleware** is present. **No rate limiting middleware** exists at the routing level.

### [x] Is internationalization (i18n) routing enabled?

**Yes, fully implemented with `next-intl`**.

**Configuration** (`src/i18n/routing.ts`):
```ts
export const routing = defineRouting({
  locales: ['en', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',    // All URLs must include locale prefix
  localeDetection: true,     // Auto-detect browser locale
});
```

**Key behaviors**:
- **`localePrefix: 'always'`**: Every URL must have a locale prefix. There is no locale-less browsing.
- **`localeDetection: true`**: next-intl attempts to detect the user's preferred browser locale.
- **Three locales**: `en` (English), `ar` (Arabic — RTL), `fr` (French)
- **Messages**: Loaded from `messages/{locale}.json` files (per `src/i18n/request.ts`)
- **Navigation helpers**: Exported via `src/i18n/navigation.ts` — `Link`, `redirect`, `usePathname`, `useRouter` from `createNavigation(routing)`
- **RTL support**: `HtmlDirSetter` component in locale layout sets `dir="rtl"` for Arabic
- **Static params**: `generateStaticParams()` in locale layout generates `en`, `ar`, `fr`
- **Force dynamic**: `export const dynamic = "force-dynamic"` on locale layout and dashboard pages to avoid static pre-render issues when Clerk/Convex env vars are missing during CI builds

**next-intl plugin** is registered in `next.config.ts`:
```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
```

### [x] What's the URL structure? (clean, nested, flat?)

The URL structure is **hierarchical and locale-prefixed**:

**Pattern**: `/{locale}/{feature}/{sub-feature?}/{id?}`

**Examples**:
- `/en` — English homepage (marketing)
- `/en/pricing` — Pricing page
- `/en/products/design-studio` — Product detail
- `/en/dashboard` — Dashboard home
- `/en/dashboard/bots` — Bots management
- `/en/dashboard/apps/openai` — Specific app integration
- `/en/dashboard/settings/webhooks` — Webhooks settings
- `/en/design-studio/abc123` — Bot editor for bot ID `abc123`
- `/ar/dashboard/bots` — Arabic dashboard

**Characteristics**:
- **Locale-prefixed**: All URLs start with `/{locale}/` (en, ar, fr)
- **Feature-organized**: First segment after locale is the feature domain (dashboard, design-studio, products, solutions)
- **Nested for complexity**: Dashboard routes nest 2-4 levels deep (e.g., `/en/dashboard/settings/canned-responses`)
- **Dynamic segments**: Use semantic names (`[slug]`, `[botId]`, `[provider]`, `[kbId]`) rather than generic `[id]`
- **No query parameters for primary navigation**: Route params are path-based, not query-string-based
- **Clean URLs**: No `.html` extensions, no trailing index files

### [x] How are protected routes handled?

**Two-layer protection**:

1. **Middleware-level** (`src/middleware.ts`): Uses Clerk's `createRouteMatcher` to define protected patterns:
   ```ts
   const isProtectedRoute = createRouteMatcher([
     "/dashboard(.*)",
     "/design-studio(.*)",
   ]);
   
   if (isProtectedRoute(req)) {
     await auth.protect({
       unauthenticatedUrl: new URL("/login", req.url).toString(),
     });
   }
   ```
   Unauthenticated users are redirected to `/{locale}/login`.

2. **Layout-level**: The dashboard layout wraps content in `DashboardAuthGuard`:
   ```tsx
   <DashboardAuthGuard>
     <DashboardShell>{children}</DashboardShell>
   </DashboardAuthGuard>
   ```
   This provides a second layer of client-side protection and potentially renders loading/error states while auth is being verified.

**Design studio** uses the same pattern with `Providers` and `DesignStudioShell` in its layout.

**Unprotected routes** (public):
- Marketing pages (`(marketing)/`)
- `/{locale}/login`
- `/{locale}/signup`
- `/{locale}/pricing`
- `/{locale}/waitlist`
- `/{locale}/products/[slug]`
- `/{locale}/solutions/[slug]`
- `/{locale}/legal/*`
- `/widget/*` (outside locale tree)
- `/api/widget/project` (API route)

### [x] Are there API routes in `app/api/`?

**Yes, but minimal — only 1 API route**:

- **`src/app/api/widget/project/route.ts`** — Handles `GET` and `OPTIONS` requests for fetching widget project data by `projectId` query parameter. Includes:
  - CORS headers
  - Caching with `revalidate: 60` (1 minute)
  - Query parameter extraction (`projectId`)
  - Error handling for missing/invalid project ID

**Notable**: This is a **small API surface**. Most data fetching appears to be done client-side via Convex (real-time reactive backend), not through Next.js API routes. The API route exists primarily for widget embedding scenarios where the widget needs project configuration data without requiring the full Convex client.

**No other API routes** exist in `app/api/`.

### [x] How are 404 and error pages handled?

**404 (Not Found) pages** — 5 `not-found.tsx` files:

| File | Scope |
|------|-------|
| `src/app/not-found.tsx` | Global 404 (catches routes outside locale tree) |
| `src/app/[locale]/not-found.tsx` | Locale-level 404 (catches invalid paths within a locale) |
| `src/app/[locale]/dashboard/apps/[provider]/not-found.tsx` | Invalid app provider |
| `src/app/[locale]/dashboard/kb/[kbId]/not-found.tsx` | Invalid knowledge base ID |
| `src/app/[locale]/design-studio/[botId]/not-found.tsx` | Invalid bot ID |

**Error boundaries** — 12 `error.tsx` files:

| File | Scope |
|------|-------|
| `src/app/[locale]/(marketing)/error.tsx` | Marketing pages |
| `src/app/[locale]/dashboard/error.tsx` | Entire dashboard |
| `src/app/[locale]/dashboard/activities/error.tsx` | Activities section |
| `src/app/[locale]/dashboard/analytics/error.tsx` | Analytics section |
| `src/app/[locale]/dashboard/bots/error.tsx` | Bots section |
| `src/app/[locale]/dashboard/chat/error.tsx` | Chat section |
| `src/app/[locale]/dashboard/contacts/error.tsx` | Contacts section |
| `src/app/[locale]/dashboard/kb/error.tsx` | Knowledge Base section |
| `src/app/[locale]/dashboard/monitor/error.tsx` | Monitor section |
| `src/app/[locale]/dashboard/orders/error.tsx` | Orders section |
| `src/app/[locale]/dashboard/settings/error.tsx` | Settings section |
| `src/app/[locale]/design-studio/error.tsx` | Design Studio |

**Strategy**: Granular error boundaries at the section level within the dashboard, allowing isolated failures without crashing the entire app. Marketing has its own error boundary. Design studio has its own error boundary.

### [x] What's the loading strategy? (suspense boundaries)

**20 `loading.tsx` files** provide Suspense-based loading states:

| File | Scope |
|------|-------|
| `src/app/[locale]/dashboard/loading.tsx` | Dashboard root |
| `src/app/[locale]/dashboard/activities/loading.tsx` | Activities |
| `src/app/[locale]/dashboard/apps/loading.tsx` | Apps list |
| `src/app/[locale]/dashboard/apps/[provider]/loading.tsx` | App detail |
| `src/app/[locale]/dashboard/bots/loading.tsx` | Bots |
| `src/app/[locale]/dashboard/contacts/loading.tsx` | Contacts |
| `src/app/[locale]/dashboard/kb/loading.tsx` | Knowledge Base |
| `src/app/[locale]/dashboard/kb/[kbId]/loading.tsx` | KB detail |
| `src/app/[locale]/dashboard/monitor/loading.tsx` | Monitor |
| `src/app/[locale]/dashboard/orders/loading.tsx` | Orders |
| `src/app/[locale]/dashboard/settings/loading.tsx` | Settings root |
| `src/app/[locale]/dashboard/settings/canned-responses/loading.tsx` | Canned responses |
| `src/app/[locale]/dashboard/settings/departments/loading.tsx` | Departments |
| `src/app/[locale]/dashboard/settings/groups/loading.tsx` | Groups |
| `src/app/[locale]/dashboard/settings/labels/loading.tsx` | Labels |
| `src/app/[locale]/dashboard/settings/operating-hours/loading.tsx` | Operating hours |
| `src/app/[locale]/dashboard/settings/webhooks/loading.tsx` | Webhooks |
| `src/app/[locale]/dashboard/settings/widget/loading.tsx` | Widget settings |
| `src/app/[locale]/design-studio/[botId]/loading.tsx` | Bot editor |

**Strategy**: Loading files are placed at every major route segment. Next.js automatically wraps these in Suspense boundaries, showing the loading UI while the page component streams in. **All loading states are concentrated in the dashboard and design-studio areas** — marketing pages have no loading states (likely because they're statically rendered or have minimal data dependencies).

**Note**: There is no root-level `loading.tsx` in `src/app/` or `src/app/[locale]/`. Loading is scoped to data-heavy sections.

### [x] Are there route handlers? (GET, POST, etc.)

**Yes, but minimal**:

1. **`src/app/api/widget/project/route.ts`** — Implements `GET` and `OPTIONS` handlers:
   - `GET`: Fetches widget project configuration by `projectId` query parameter
   - `OPTIONS`: Handles CORS preflight requests
   - Includes error validation, caching (`revalidate: 60`), and CORS headers

2. **`src/app/og/image/route.tsx`** — Edge runtime `GET` handler for dynamic Open Graph image generation

**No POST, PUT, PATCH, or DELETE route handlers** exist in the App Router. All mutations are handled client-side via **Convex** (the reactive backend), which is the primary data interaction layer.

### [x] How is navigation implemented? (Link, useRouter, etc.)

**Primary navigation** uses **next-intl navigation helpers** exported from `src/i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

These wrap Next.js navigation primitives with **locale awareness**:
- **`Link`**: Wraps `next/link` — automatically includes locale prefix in hrefs
- **`redirect`**: Server-side redirect with locale handling
- **`usePathname`**: Returns pathname with locale prefix
- **`useRouter`**: Wraps `next/navigation` useRouter for programmatic navigation

**No direct usage** of `next/link` or `next/navigation` is expected in most components — they should import from `@/i18n/navigation` instead to maintain locale-aware navigation.

**Client-side navigation** is handled by Next.js App Router's built-in navigation (prefetching, transitions, etc.).

### [x] Are there any redirects or rewrites?

**No redirects or rewrites in `next.config.ts`**. The config only has:
- `turbopack.root`
- `images.remotePatterns` (for `*.convex.cloud` and `img.clerk.com`)

**Redirects are handled in middleware**:
1. `/` → `/en` (root to default locale)
2. `/dashboard` → `/{locale}/dashboard` (adds locale prefix using user's stored locale from Clerk session)

**Page-level redirects**: The `src/app/[locale]/dashboard/kb/page.tsx` redirects to `/dashboard/kb/default` (knowledge base defaults to the "default" KB view).

**No rewrites** exist. All URL transformations are done via redirects.

### [x] How deep is the route nesting?

**Maximum nesting depth: 5 levels** (including `[locale]` as level 1):

| Depth | Example URL | File Path |
|-------|-------------|-----------|
| 1 | `/en` | `[locale]/(marketing)/page.tsx` |
| 2 | `/en/login` | `[locale]/login/page.tsx` |
| 2 | `/en/dashboard` | `[locale]/dashboard/page.tsx` |
| 3 | `/en/dashboard/bots` | `[locale]/dashboard/bots/page.tsx` |
| 3 | `/en/products/design-studio` | `[locale]/products/[slug]/page.tsx` |
| 4 | `/en/dashboard/apps/openai` | `[locale]/dashboard/apps/[provider]/page.tsx` |
| 4 | `/en/design-studio/abc123` | `[locale]/design-studio/[botId]/page.tsx` |
| 4 | `/en/dashboard/settings/webhooks` | `[locale]/dashboard/settings/webhooks/page.tsx` |
| 5 | N/A (max observed) | — |

**Average nesting**: ~3 levels for dashboard routes, ~2 levels for marketing/public routes.

**Distribution**:
- Depth 1-2: 10 routes (marketing, auth, standalone pages)
- Depth 3: ~15 routes (dashboard sections, products, solutions)
- Depth 4: ~10 routes (dashboard sub-sections with dynamic params, settings pages)
- Depth 5: 0 routes (settings sub-pages are at depth 4, not 5)

The nesting is **reasonable** — not excessively deep, with most routes accessible within 2-3 URL segments after the locale.

## 🔗 Dependencies

- **Depends on:** Part 03 (project structure), Part 07 (auth), Part 11 (styling)
- **Connected to:** Part 13 (pages), Part 14 (state), Part 15 (features)

## 📝 Agent Findings

### Route Organization Philosophy

The codebase follows a **domain-driven route organization** pattern:
- `[locale]/` as the top-level container ensures all content is locale-scoped
- `(marketing)` route group separates landing/legal pages from functional routes without polluting URLs
- `dashboard/` is the largest section (~45 files) with consistent sub-structure: each major section has its own `error.tsx` and often `loading.tsx`
- `design-studio/` is a smaller but self-contained feature area
- Standalone pages (`login`, `signup`, `pricing`, `waitlist`, `onboarding`) sit directly at the locale level

### i18n Implementation Quality

The i18n setup is **production-grade**:
- `localePrefix: 'always'` enforces consistent URL structure
- RTL support via `HtmlDirSetter` for Arabic
- Static param generation for all three locales
- `force-dynamic` on locale layout prevents CI build failures from missing env vars
- Middleware handles root redirect and dashboard locale normalization

### Auth Strategy

**Defense in depth**: Middleware-level protection (server-side) + layout-level `DashboardAuthGuard` (client-side). Protected patterns use regex-like matching (`/dashboard(.*)`, `/design-studio(.*)`). Unauthenticated users are sent to `/{locale}/login`.

### Widget Isolation

The `/widget` route sits **outside the locale tree** at `src/app/widget/`. This is intentional — the widget is designed to be embedded on external sites and resolves its own locale via the `projectId` API call rather than URL segment.

### SEO Infrastructure

- **`sitemap.ts`**: Generates locale-prefixed URLs for all public pages
- **`robots.ts`**: Blocks `/dashboard/`, `/design-studio/`, `/onboarding/`, `/test-widget/`, `/api/` from search engine indexing
- **Root metadata**: Comprehensive OpenGraph, Twitter Card, and alternate language metadata in `layout.tsx`
- **`JsonLd`**: Structured data component in locale layout

### Convex as Primary Backend

The near-absence of API routes (only 1) confirms that **Convex is the primary data layer**. All CRUD operations, real-time subscriptions, and business logic happen through Convex queries and mutations, not Next.js API routes.

## 🔍 Key Patterns to Identify

| Pattern | Finding |
|---------|---------|
| Route organization philosophy | Domain-driven under `[locale]/`, with `(marketing)` group for URL-neutral segmentation |
| Middleware usage | Clerk auth + next-intl combined; root redirect, protected route matching, early static bypass |
| Internationalization approach | next-intl with `localePrefix: 'always'`, 3 locales (en/ar/fr), RTL support, locale detection |
| Protected route strategy | Middleware-level `createRouteMatcher` + layout-level `DashboardAuthGuard` (defense in depth) |
| Loading and error boundaries | Granular: 12 error boundaries, 20 loading states, concentrated in dashboard/design-studio |

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **No root `loading.tsx`** | LOW | `src/app/` and `src/app/[locale]/` have no loading files. If the locale layout or root layout has slow data dependencies, users see nothing until fully rendered. |
| **Missing error boundary at locale level** | LOW | `src/app/[locale]/` has no `error.tsx`. Errors that bubble up from all children without being caught will fall to the global error handler. Each section has its own boundary, but a locale-level boundary would catch cross-section failures. |
| **No rate limiting on API route** | MEDIUM | `/api/widget/project/route.ts` has no rate limiting. It's a GET endpoint with CORS enabled, potentially vulnerable to abuse. |
| **Protected route patterns use regex-like matching** | LOW | `createRouteMatcher(["/dashboard(.*)", "/design-studio(.*)"])` uses pattern matching. If new protected sections are added with different URL patterns, they could accidentally be unprotected. Consider a more explicit allowlist approach. |
| **Dashboard locale redirect relies on Clerk session claims** | LOW | The `/dashboard` → `/{locale}/dashboard` redirect reads locale from `sessionClaims.unsafeMetadata`. If this metadata is missing or malformed, no redirect occurs and the user stays at `/dashboard` (which may not resolve). |
| **No API routes for mutations** | INFO | All mutations go through Convex. This is fine architecturally, but means the app is fully dependent on Convex's availability and error handling. |
| **Settings sub-sections lack error boundaries** | MEDIUM | Settings pages (`canned-responses`, `departments`, `groups`, `integrations`, `labels`, `operating-hours`, `webhooks`, `widget`) have `loading.tsx` files but **no `error.tsx` files** — they rely on the parent `dashboard/settings/error.tsx` boundary. This is intentional but means granular error recovery is not possible within settings sections. |
| **No catch-all routes** | INFO | The absence of `[...catchAll]` routes means every possible URL must be explicitly defined. This is good for type safety but requires discipline when adding new routes. |
