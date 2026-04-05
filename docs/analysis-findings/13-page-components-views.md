# Part 13: Page Components & Views - Findings

## 📊 Visual Map

```
src/app/ (37 page.tsx files)
├── [locale]/
│   ├── (marketing)/
│   │   ├── page.tsx              → Home: next/dynamic sections, ScrollReveal, section anchor IDs
│   │   └── legal/{privacy,terms}/page.tsx  → Static legal pages
│   │
│   ├── login/page.tsx            → Clerk SignIn
│   ├── signup/page.tsx           → Clerk SignUp
│   ├── waitlist/page.tsx         → WaitlistClient: email capture + referral tracking
│   ├── onboarding/page.tsx       → OnboardingClient: project setup wizard
│   ├── pricing/page.tsx          → Static pricing
│   ├── test-widget/page.tsx      → TestWidgetClient: widget testing
│   ├── products/[slug]/page.tsx  → Dynamic marketing product pages
│   ├── solutions/[slug]/page.tsx → Dynamic marketing solution pages
│   │
│   ├── design-studio/[botId]/    → BotEditorClient: visual flow editor, node graph
│   │
│   └── dashboard/
│       ├── page.tsx              → Dashboard home: stats cards, live queue, activity feed, snapshots
│       ├── bots/page.tsx         → Bot list: sidebar filters, card grid, optimistic CRUD
│       ├── contacts/page.tsx     → Contacts: <ContactsList> (TanStack table), import/export wizard
│       ├── apps/page.tsx         → Integrations grid: AVAILABLE_APPS catalog, Pro badges
│       ├── activities/page.tsx   → Activity logs: <ActivitiesDataTable>, paginated
│       ├── analytics/page.tsx    → Analytics: useAction + useEffect, recharts, date range picker
│       ├── chat/page.tsx         → ChatShell: real-time chat interface
│       ├── history/page.tsx      → Resolved conversations: search, date range, CSV export
│       ├── monitor/page.tsx      → Monitor: Server component → <MonitorLayout>
│       ├── orders/page.tsx       → Orders: filterable table, import/export, status management
│       ├── requests/page.tsx     → Support queue: sidebar filters, assign/resolve actions
│       ├── kb/[kbId]/page.tsx    → Knowledge base details
│       ├── test-widget/page.tsx  → Widget test page
│       │
│       └── settings/
│           ├── page.tsx              → General settings: language, model, SLA, usage
│           ├── widget/page.tsx       → Widget config: useReducer, 4 tabs, live iPhone preview
│           ├── integrations/page.tsx → Integration cards + detail forms
│           ├── canned-responses/page.tsx
│           ├── departments/page.tsx
│           ├── groups/page.tsx
│           ├── labels/page.tsx
│           ├── operating-hours/page.tsx
│           └── webhooks/page.tsx
│
Page Structure (typical dashboard page)
├── Data fetching     → Convex useQuery/usePaginatedQuery/useAction with "skip" pattern
├── State management  → useState/useReducer + URL search params
├── UI composition    → shadcn Card, Table, Button, Dialog, Badge, Input, Select, Tabs
├── Loading states    → loading.tsx (DashboardPageSkeleton) or inline spinners
├── Error handling    → error.tsx (ErrorFallback) + toast.error in try/catch
└── i18n             → useTranslations from next-intl

Page Types
├── Dashboard pages    → Data-heavy views with stats, tables, charts
├── Form pages         → Widget settings (useReducer, 680 lines), integration config
├── List pages         → Bots, contacts, orders, activities (card grids + tables)
├── Detail pages       → KB details, app provider details, bot editor
└── Settings pages     → 8 sub-sections with specialized configuration
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/app/[locale]/dashboard/page.tsx` | Dashboard home: stats, live queue, activity feed |
| `src/app/[locale]/dashboard/*/page.tsx` | 16 dashboard sub-route pages |
| `src/app/[locale]/dashboard/*/loading.tsx` | 18 loading skeletons (DashboardPageSkeleton) |
| `src/app/[locale]/dashboard/*/error.tsx` | 12 error boundaries (ErrorFallback) |
| `src/app/[locale]/(marketing)/page.tsx` | Marketing home: lazy-loaded sections |
| `src/app/[locale]/design-studio/[botId]/page.tsx` | Bot editor |
| `src/components/dashboard/` | Dashboard-specific reusable components |
| `src/components/analytics/` | Chart components (ConversationVolumeChart, AnalyticsTagsChart) |
| `src/components/activities/` | Activity table columns and data table |
| `src/components/settings/` | Settings components (UsageCard, etc.) |

**Note**: `src/components/pages/` and `src/components/views/` directories DO NOT exist.

## ✅ Analysis Checklist

- [x] **What pages exist and what are their purposes?** 37 page.tsx files across:
  - **Marketing** (8): Home, pricing, login, signup, waitlist, onboarding, test-widget, legal (privacy, terms), product/solution detail pages
  - **Dashboard** (16): Home (stats + live queue), bots, contacts, apps, activities, analytics, chat, history, monitor, orders, requests, kb, test-widget
  - **Settings** (8): General, widget config, integrations, canned responses, departments, groups, labels, operating hours, webhooks
  - **Design Studio** (2): Layout + bot editor
  - **API** (2): Widget project data, OG image generation

- [x] **How do pages fetch data?** 100% via Convex:
  - `useQuery` for simple queries: `useQuery(api.bots.list, activeProject ? { projectId: activeProject._id } : "skip") ?? []`
  - `usePaginatedQuery` for lists: `usePaginatedQuery(api.activityLogs.getActivityLog, ..., { initialNumItems: 25 })`
  - `useAction` for analytics: `useAction(api.analytics.getConversationStats)` with `useEffect` + `useState`
  - `useMutation` for writes: `useMutation(api.bots.create).withOptimisticUpdate(...)`
  - Skip pattern everywhere: `"skip"` when prerequisites not met

- [x] **Are pages server components or client components?** 36/37 are `"use client"`. Only `monitor/page.tsx` is a server component (thin wrapper using `unstable_setRequestLocale`, delegates to `<MonitorLayout>`). Marketing home uses server component with `next/dynamic` for client-side sections.

- [x] **How are loading states implemented?** Two patterns:
  1. **`loading.tsx` files** (18 files): React Suspense boundary, most use `DashboardPageSkeleton`, monitor uses `ThreePanelSkeleton`
  2. **Inline loading**: `orders === undefined ? <Loader2 className="animate-spin" /> : ...`
  3. **Marketing**: `next/dynamic` with `ssr: false` for section lazy loading

- [x] **How are errors handled at the page level?** Three layers:
  1. **`error.tsx` files** (12 files): React error boundaries with `ErrorFallback` component, route-appropriate `homeHref`
  2. **Toast notifications**: `toast.error(errorMessage)` in try/catch blocks around mutations
  3. **Inline error state**: WidgetChat uses `dispatch({ type: "SET_ERROR" })`

- [x] **Are pages composed of smaller view components?** YES, extensively:
  - Dashboard pages delegate to feature-specific components in `src/components/dashboard/`
  - Contacts page → `<ContactsList />` from `@/components/dashboard/contacts/contacts-list`
  - Activities page → `<ActivitiesDataTable />` + column defs from `@/components/activities/`
  - Analytics page → `ConversationVolumeChart`, `AnalyticsTagsChart`, `AnalyticsCSAT`, etc.
  - Settings pages → `SettingsShell`, `UsageCard`, etc.
  - **No** `src/components/pages/` or `src/components/views/` directories exist.

- [x] **How is pagination handled for list views?** Convex cursor-based pagination:
  - `usePaginatedQuery` with `initialNumItems` (5-50 depending on page)
  - "Load more" button: `{status !== "Exhausted" && <Button onClick={() => loadMore(50)}>Load more</Button>}`
  - Status checks: `"LoadingFirstPage"`, `"LoadingMore"`, `"Exhausted"`
  - Used in: dashboard home (5), activities (25), history (50), chat messages (30), KB sources

- [x] **Are there data tables?** YES, `@tanstack/react-table` in 3 files:
  - `contacts-list.tsx`: Full-featured (sorting, filtering, column visibility, row selection, pagination)
  - `ActivitiesDataTable.tsx`: Column rendering wrapper with pagination
  - Orders page: Manual table (not using TanStack)

- [x] **How are forms integrated in pages?** Forms use `useState`/`useReducer` patterns (NOT react-hook-form):
  - Simple forms: Individual `useState` per field (KbCreateDialog)
  - Medium forms: Single object `useState` (EditContactDialog)
  - Complex forms: `useReducer` with typed actions (Widget config: 680 lines, 12 action types; WidgetChat: state machine)
  - shadcn form infrastructure (`FormProvider`, `FormField`) exists but is NOT consumed with `useForm`/`zodResolver`

- [x] **Are there charts/visualizations?** YES, `recharts` in 2 files, dynamically imported with `ssr: false`:
  - `ConversationVolumeChart.tsx`: BarChart (stacked), daily volume data
  - `AnalyticsTagsChart.tsx`: PieChart (donut), tag distribution
  - Both wrapped in shadcn `<Card>` components with `ResponsiveContainer`

- [x] **How is page-level state managed?** Three patterns:
  1. **Local component state**: `useState`/`useReducer` per page
  2. **URL search params**: `useProjectId` hook for project selection, conversation ID in chat
  3. **Convex reactive queries**: `useQuery` results automatically update UI
  4. **ProjectContext**: Single context combining Clerk org state, URL-based project selection, and Convex queries

- [x] **Are pages optimized for performance?** YES:
  - `next/dynamic` with `ssr: false` for marketing sections and chart components
  - `useMemo` for expensive computations (12 occurrences: node positions, date formats, styled nodes)
  - Keyed component re-mount: `SettingsContent key={activeProject._id}` forces re-render on project change
  - `useCallback` in hooks for stable references
  - Convex automatic caching and revalidation

- [x] **Is there SSR/SSG for any pages?** Limited:
  - Marketing home: Server component with `unstable_setRequestRequestLocale`
  - Monitor page: Server component wrapper
  - Locale layout: `generateStaticParams` for all 3 locales
  - Most dashboard pages: Client-side only (`force-dynamic` set on dashboard layout)
  - OG image route: Edge runtime for performance

- [x] **How are page titles and metadata set?** Root layout has comprehensive metadata:
  - `title.template: "%s | Yoosr"`
  - Marketing home generates locale-aware metadata with canonical URLs and OG images
  - **Individual routes do NOT override metadata** - no per-page title/metadata pattern found
  - This is a gap: dashboard pages, product pages, solution pages don't set unique titles

## 📝 Agent Findings

### Dashboard Page Architecture
All 16 dashboard pages follow a consistent pattern:
- `"use client"` directive at top
- `useTranslations("featureName")` for i18n
- `useQuery`/`usePaginatedQuery` with `activeProject` filter and `"skip"` fallback
- `useMutation` with `.withOptimisticUpdate()` for CRUD
- `toast.success()`/`toast.error()` for mutation feedback
- Full-height layouts: `h-[calc(100vh-60px)] overflow-hidden`

### Analytics Page - Most Complex Page
The analytics page is the most data-intensive:
- 6 `useAction` calls (conversation stats, volume, tokens, tags, CSAT, SLA)
- 3 `useQuery` calls (CSAT comments, unanswered, usage)
- All use `useEffect` with `isMounted` guard for cleanup
- 2 dynamic chart imports with `ssr: false`
- Custom date range picker (default: last 30 days, converted to milliseconds)
- 6-card stats grid with conditional coloring

### Widget Settings Page - Most Complex Form
680 lines, `useReducer` with 12 action types managing:
- Theme, alignment, logo URL, welcome delay, auto-close, pre-chat form, contact method, translations
- 4 tabs: Appearance (color presets + picker), Behavior (toggles), Text (editable labels), Install (9 platform snippets)
- Live iPhone-framed preview iframe with `/widget?projectId=...`

### Consistent i18n Pattern
Every page uses `useTranslations("namespace")` from `next-intl`. Namespaces match feature names: "dashboard", "bots", "contacts", "apps", "activities", "analytics", "history", "orders", "requests", "settings.*", etc. Date-fns locales mapped for Arabic (`arSA`), French (`fr`), English (`enUS`).

### Page Organization
Components are NOT in `src/components/pages/` or `src/components/views/`. Instead:
- `src/components/dashboard/` - Dashboard feature components
- `src/components/analytics/` - Chart components
- `src/components/activities/` - Activity table
- `src/components/settings/` - Settings components
- Feature-specific subdirectories: `dashboard/contacts/`, `dashboard/bots/`, `dashboard/monitor/`

### Marketing Page Structure
Marketing home uses server component with `next/dynamic` for 10+ lazy-loaded sections:
Hero, SocialProofBar, ProblemSection, FeaturesGrid, DesignStudioSection, HowItWorks, WhoItsFor, TrustSection, PricingTeaser, ChannelsSection, FinalCTA
Each wrapped in `<section>` with anchor IDs (`#home`, `#features`, `#studio`, etc.) and ScrollReveal animation wrappers.

### Error Boundary Consistency
All 12 `error.tsx` files use the same `ErrorFallback` component with route-appropriate `homeHref`. This provides consistent error UX across the app.

## 🔍 Key Patterns to Identify

- **Convex-first data fetching**: 100% Convex, no alternative data fetching
- **"skip" pattern**: Conditional queries when prerequisites not met
- **Optimistic CRUD**: `.withOptimisticUpdate()` on all mutations
- **Client component dominance**: 36/37 pages are client components
- **Feature-scoped components**: Components organized under `src/components/{feature}/`
- **Consistent i18n**: `useTranslations("namespace")` pattern throughout
- **Load more pagination**: Explicit button-triggered, not infinite scroll
- **useReducer for complexity**: Complex forms use typed reducers, simple forms use useState
- **Dynamic chart imports**: `next/dynamic` with `ssr: false` for recharts

## ⚠️ Potential Concerns

| Severity | Concern |
|----------|---------|
| **HIGH** | **No per-page metadata** - Root layout sets `title.template: "%s | Yoosr"` but individual routes (dashboard pages, product pages, solution pages) don't override titles. SEO impact: all pages show generic "Page Name | Yoosr" without unique descriptions. |
| **HIGH** | **No form validation library** - `react-hook-form` and Zod are NOT used despite shadcn form infrastructure existing. All forms use manual `useState`/`useReducer` with no schema validation. This means: no client-side validation, no error messages on invalid fields, no form-level validation state. Affects: widget settings (680 lines), integration forms, contact dialogs, order forms. |
| **MEDIUM** | **Widget settings page is monolithic** - 680-line single component with 4 tabs, useReducer with 12 action types, live preview iframe. Should be split into sub-components per tab. |
| **MEDIUM** | **No `src/components/pages/` or `src/components/views/`** - Page-level components scattered across feature directories without clear convention. Makes it harder to distinguish between reusable components and page-specific views. |
| **MEDIUM** | **Inconsistent loading patterns** - 18 loading.tsx files but 5+ pages lack them (departments, operating-hours, webhooks, history, requests). Pages without loading files may cause layout shift on slow connections. |
| **MEDIUM** | **Monitor page is only server component** - Only 1/37 pages is a server component. Most dashboard pages could benefit from SSR for initial load performance, but `force-dynamic` prevents this. |
| **LOW** | **Analytics page uses `useAction` + `useEffect` anti-pattern** - 6 `useAction` calls with manual `useEffect` + `isMounted` + `useState` pattern. Could be simplified with a custom hook. |
| **LOW** | **Manual table in orders page** - Orders page uses manual table rendering instead of `@tanstack/react-table` (which contacts and activities use). Inconsistent UX (no sorting, filtering, column visibility). |
| **LOW** | **No section anchor navigation** - Marketing home has section anchor IDs but no sticky table of contents or jump navigation for users who want to skip to specific sections. |
