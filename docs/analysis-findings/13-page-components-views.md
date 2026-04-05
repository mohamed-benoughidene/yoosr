# Part 13: Page Components & Views — Analysis Findings

## 📊 Visual Map

```
src/app/ (Page Files — 37 pages total)
├── [locale]/ (i18n routing group)
│   ├── (marketing)/page.tsx          → Landing/home page (Server Component)
│   ├── (marketing)/legal/*/page.tsx  → Privacy, Terms (static pages)
│   ├── pricing/page.tsx              → Pricing page (Server Component)
│   ├── login/page.tsx                → Login page (Server wrapper + client)
│   ├── signup/page.tsx               → Signup page
│   ├── onboarding/page.tsx           → Onboarding flow
│   ├── waitlist/page.tsx             → Waitlist signup
│   ├── products/[slug]/page.tsx      → Product detail pages
│   ├── solutions/[slug]/page.tsx     → Solution detail pages
│   │
│   ├── dashboard/ (authenticated, force-dynamic)
│   │   ├── page.tsx                  → Main dashboard overview (Client)
│   │   ├── loading.tsx               → Reusable skeleton loader
│   │   ├── error.tsx                 → Error boundary with reset
│   │   │
│   │   ├── bots/page.tsx             → Bot management (Client)
│   │   ├── contacts/page.tsx         → Contact CRUD + import/export (Client)
│   │   ├── orders/page.tsx           → Order management (Client)
│   │   ├── activities/page.tsx       → Activity log with pagination (Client)
│   │   ├── analytics/page.tsx        → Charts & metrics (Client)
│   │   ├── history/page.tsx          → Conversation history (Client)
│   │   ├── requests/page.tsx         → Support requests (Client)
│   │   ├── chat/page.tsx             → Live chat interface (Client)
│   │   ├── monitor/page.tsx          → Monitoring view (Client)
│   │   ├── kb/page.tsx               → Knowledge base list (Client)
│   │   ├── kb/[kbId]/page.tsx        → KB detail view (Client)
│   │   ├── apps/page.tsx             → Integrations list (Client)
│   │   ├── apps/[provider]/page.tsx  → Integration detail (Client)
│   │   │
│   │   ├── settings/page.tsx         → Project settings (Client)
│   │   ├── settings/departments/     → Department management
│   │   ├── settings/groups/          → Group management
│   │   ├── settings/labels/          → Label management
│   │   ├── settings/canned-responses/→ Canned responses
│   │   ├── settings/integrations/    → Integration config
│   │   ├── settings/operating-hours/ → Business hours
│   │   ├── settings/webhooks/        → Webhook management
│   │   ├── settings/widget/          → Widget configuration
│   │   └── test-widget/page.tsx      → Widget testing
│   │
│   └── design-studio/[botId]/page.tsx → Bot editor (Server wrapper + client)
│
└── widget/page.tsx                    → Standalone widget (Server Component)

Page Types Found:
├── Dashboard pages (data-heavy views)     → 20+ pages
├── Form pages (data input/editing)        → Contacts, Orders, Settings sub-pages
├── List pages (tables, grids)             → Bots, Contacts, Orders, Activities, KB
├── Detail pages (single item views)       → KB/[kbId], apps/[provider], products/[slug]
├── Settings pages (configuration views)   → 8 settings sub-pages
├── Marketing pages (SEO-optimized)        → Home, Pricing, Legal, Products, Solutions
└── Auth pages (login/signup)              → Login, Signup, Waitlist

Data Fetching:
├── useQuery (Convex)        → 20+ pages use this for real-time data
├── usePaginatedQuery        → Dashboard, Activities, History, KB (4+ pages)
├── useAction (Convex)       → Analytics page (6+ actions for stats/volume/tokens)
└── Direct fetch()           → Widget page (SSR API call for project config)
```

## 📁 File Inventory

| File/Directory | Purpose | Count/Notes |
|----------------|---------|-------------|
| `src/app/[locale]/**/page.tsx` | Route page components | **37 files** |
| `src/app/[locale]/**/loading.tsx` | Loading state components | **20 files** |
| `src/app/[locale]/**/error.tsx` | Error boundary components | **12 files** |
| `src/components/pages/` | Reusable page components | **Does not exist** |
| `src/components/views/` | View components | **Does not exist** |
| `src/components/dashboard/` | Dashboard-specific components | Used by dashboard pages |
| `src/components/analytics/` | Analytics chart components | Used by analytics page |
| `src/components/settings/` | Settings components | UsageCard, etc. |
| `src/components/landing/` | Landing page sections | 10+ sections |
| `src/components/error-fallback.tsx` | Reusable error fallback | Used by all error.tsx |
| `src/components/dashboard/loading-skeletons.tsx` | Skeleton loaders | 3 skeleton types |

## ✅ Analysis Checklist

### [x] What pages exist and what are their purposes?

**37 page.tsx files** exist across the following route groups:

1. **Marketing Pages (7 pages):**
   - `[locale]/(marketing)/page.tsx` — Landing/home page with Hero, Features, Pricing Teaser, etc.
   - `[locale]/(marketing)/legal/privacy/page.tsx` — Privacy policy
   - `[locale]/(marketing)/legal/terms/page.tsx` — Terms of service
   - `[locale]/pricing/page.tsx` — Pricing table (with early access banner)
   - `[locale]/products/[slug]/page.tsx` — Product detail pages (dynamic routes)
   - `[locale]/solutions/[slug]/page.tsx` — Solution detail pages (dynamic routes)

2. **Auth Pages (4 pages):**
   - `[locale]/login/page.tsx` — Server wrapper rendering LoginClient
   - `[locale]/signup/page.tsx` — Signup flow
   - `[locale]/onboarding/page.tsx` — Onboarding flow
   - `[locale]/waitlist/page.tsx` — Waitlist signup

3. **Dashboard Pages (20+ pages):**
   - `[locale]/dashboard/page.tsx` — Main dashboard overview with stats, live queue, activity feed
   - `[locale]/dashboard/bots/page.tsx` — Bot management (grid of cards with filters)
   - `[locale]/dashboard/contacts/page.tsx` — Contact CRUD + CSV/Excel/JSON import/export
   - `[locale]/dashboard/orders/page.tsx` — Order management with status filters
   - `[locale]/dashboard/activities/page.tsx` — Activity log with pagination (PAGE_SIZE=25)
   - `[locale]/dashboard/analytics/page.tsx` — Charts, CSAT, SLA metrics, date range picker
   - `[locale]/dashboard/history/page.tsx` — Conversation history with pagination
   - `[locale]/dashboard/requests/page.tsx` — Support requests management
   - `[locale]/dashboard/chat/page.tsx` — Live chat interface
   - `[locale]/dashboard/monitor/page.tsx` — Monitoring view
   - `[locale]/dashboard/kb/page.tsx` — Knowledge base list
   - `[locale]/dashboard/kb/[kbId]/page.tsx` — KB detail with paginated sources
   - `[locale]/dashboard/apps/page.tsx` — Integrations list
   - `[locale]/dashboard/apps/[provider]/page.tsx` — Integration detail
   - `[locale]/dashboard/settings/page.tsx` — Project settings (model, SLA, language)
   - 8 settings sub-pages: departments, groups, labels, canned-responses, integrations, operating-hours, webhooks, widget
   - `[locale]/dashboard/test-widget/page.tsx` — Widget testing

4. **Design Studio (1 page):**
   - `[locale]/design-studio/[botId]/page.tsx` — Bot editor (Server wrapper + BotEditorClient)

5. **Widget (1 page):**
   - `widget/page.tsx` — Standalone widget chat with dynamic locale loading

**Dashboard layout hierarchy:**
- `dashboard/layout.tsx` wraps all dashboard pages with:
  - `Providers` (React Query + Convex context)
  - `DashboardAuthGuard` (authentication guard)
  - `DashboardShell` (sidebar, header, navigation)
  - `PushNotificationInit` (PWA notifications)

---

### [x] How do pages fetch data? (Convex useQuery, etc.)

**All dashboard pages use Convex** as the exclusive data layer. Data fetching patterns:

1. **`useQuery` (primary pattern)** — Used in 20+ pages:
   - Real-time subscriptions to Convex database queries
   - Example: `const bots = useQuery(api.bots.list, activeProject ? { projectId: activeProject._id } : "skip")`
   - Returns `undefined` while loading, then data
   - Used for: bots, contacts, orders, settings, labels, departments, webhooks, etc.

2. **`usePaginatedQuery`** — Used in 4+ pages for infinite scroll:
   - Dashboard page: `initialNumItems: 5` (recent activities)
   - Activities page: `initialNumItems: 25` (PAGE_SIZE constant)
   - History page: paginated conversation history
   - KB detail page: paginated sources with "Load More" button
   - Pattern: `const { results, status, loadMore } = usePaginatedQuery(...)`
   - Status values: `"LoadingFirstPage"`, `"LoadingMore"`, `"CanLoadMore"`, `"Exhausted"`

3. **`useAction`** — Used in Analytics page (6+ actions):
   - For complex aggregations that can't be simple queries
   - `getConversationStats`, `getConversationVolume`, `getTokenUsage`, `getTagsSummary`, `getCSATSummary`, `getSLABreachRate`
   - Called via `useEffect` with manual state management (`useState` + `useEffect`)
   - Example:
     ```typescript
     const fetchStats = useAction(api.analytics.getConversationStats);
     useEffect(() => {
       fetchStats({ projectId, from, to }).then(data => setConvStatsData(data));
     }, [activeProject, from, to, fetchStats]);
     ```

4. **Direct `fetch()`** — Only in `widget/page.tsx`:
   - SSR fetch to internal API endpoint for project config
   - Uses `cache: "no-store"` for dynamic data
   - Graceful error handling with try/catch

5. **Skip pattern** — Universal pattern across all Convex queries:
   - `activeProject ? { projectId: activeProject._id } : "skip"`
   - Prevents queries from running when no project is selected

---

### [x] Are pages server components or client components?

**Clear split based on purpose:**

| Page Type | Component Type | Count |
|-----------|---------------|-------|
| **Marketing pages** | Server Components | 5+ pages |
| **Auth pages** | Server wrapper + Client child | 2 pages (login, design-studio) |
| **Dashboard pages** | Client Components (`"use client"`) | 21 pages |
| **Widget page** | Server Component | 1 page |

**Detailed breakdown:**

1. **Server Components (no "use client" directive):**
   - `[locale]/(marketing)/page.tsx` — Landing page (async component)
   - `[locale]/pricing/page.tsx` — Pricing page (async component)
   - `[locale]/login/page.tsx` — Server wrapper rendering `<LoginClient />`
   - `[locale]/design-studio/[botId]/page.tsx` — Server wrapper rendering `<BotEditorClient />`
   - `[locale]/products/[slug]/page.tsx` — Product pages
   - `[locale]/solutions/[slug]/page.tsx` — Solution pages
   - `widget/page.tsx` — Widget page with dynamic message loading
   - Legal pages (privacy, terms)

2. **Client Components (`"use client"` directive):**
   - **ALL 21 dashboard pages** are client components
   - Reason: Need interactivity (Convex real-time subscriptions, form state, dialogs, etc.)
   - Examples: dashboard, bots, contacts, orders, activities, analytics, settings sub-pages

3. **Hybrid pattern:**
   - Login page: Server component fetches locale, renders `<LoginClient />`
   - Design studio: Server component for SEO metadata, renders `<BotEditorClient />`
   - This is the recommended Next.js pattern for pages that need both SSR and client interactivity

**Why dashboard is all client:**
- Real-time data via Convex `useQuery`/`usePaginatedQuery`
- Interactive forms (create/edit/delete operations)
- Dialog state management
- Filter/search state
- Toast notifications

---

### [x] How are loading states implemented?

**Multiple loading state strategies:**

1. **Dedicated `loading.tsx` files (20 files):**
   - Next.js convention for Suspense boundaries
   - Most dashboard pages have their own `loading.tsx`
   - Pattern: `export default DashboardPageSkeleton;` (reuses shared skeleton)

2. **Shared skeleton components** (`src/components/dashboard/loading-skeletons.tsx`):
   - `DashboardPageSkeleton()` — Header + stats grid + content block
   - `ThreePanelSkeleton()` — For chat/inbox/detail views (3-column layout)
   - `CanvasSkeleton()` — For canvas-based interfaces (flow builders)

3. **Manual loading states in pages:**
   - Dashboard page checks `if (!homeStats)` and renders inline skeleton
   - Activities page checks `if (logs === undefined)` and shows spinner
   - Orders page shows `Loader2` spinner in table body when loading
   - Analytics page passes `isLoading` props to chart components

4. **Loading state patterns:**
   ```typescript
   // Pattern 1: Early return skeleton
   if (!homeStats) {
     return <div className="animate-pulse">...</div>
   }

   // Pattern 2: Inline loading in table
   {orders === undefined ? (
     <TableRow><TableCell colSpan={7}><Loader2 className="animate-spin" /></TableCell></TableRow>
   ) : (
     // render data
   )}

   // Pattern 3: Skeleton via loading.tsx (automatic via Next.js)
   // Shown while page.tsx is loading (Suspense boundary)
   ```

5. **Chart components** (analytics page):
   - Receive `isLoading` prop
   - Show skeleton or spinner while data is undefined
   - Example: `<AnalyticsTagsChart data={tagsData} isLoading={tagsData === undefined} />`

**Coverage:** 20/37 pages have dedicated loading.tsx files (54%). All dashboard routes have loading states.

---

### [x] How are errors handled at the page level?

**Comprehensive error handling:**

1. **Dedicated `error.tsx` files (12 files):**
   - Next.js error boundary convention
   - All receive `{ error, reset }` props
   - Pattern: `<ErrorFallback reset={reset} homeHref="/dashboard" />`

2. **Shared ErrorFallback component** (`src/components/error-fallback.tsx`):
   - Reusable across all error boundaries
   - Features:
     - AlertCircle icon with destructive color
     - "Something went wrong" message (customizable)
     - "Try again" button (calls `reset()`)
     - "Go home" button (links to provided href)
     - Fade-in animation
     - Responsive design

3. **Error boundary coverage (12 routes):**
   - `/dashboard/error.tsx` → Catches errors in entire dashboard
   - `/dashboard/activities/error.tsx`
   - `/dashboard/analytics/error.tsx`
   - `/dashboard/bots/error.tsx`
   - `/dashboard/chat/error.tsx`
   - `/dashboard/contacts/error.tsx`
   - `/dashboard/kb/error.tsx`
   - `/dashboard/monitor/error.tsx`
   - `/dashboard/orders/error.tsx`
   - `/dashboard/settings/error.tsx`
   - `/design-studio/error.tsx`
   - `(marketing)/error.tsx` — Marketing route errors

4. **Operation-level error handling:**
   - Try/catch blocks around mutations
   - Toast notifications for success/failure
   - Example (contacts page):
     ```typescript
     try {
       await createContact({ ... });
       toast.success(t("contact_created"));
     } catch (error) {
       toast.error(t("contact_create_failed"));
       console.error(error);
     }
     ```

5. **Import error handling:**
   - Contacts and Orders pages have detailed import error states
   - File validation errors, parsing errors, batch import failures
   - Error messages displayed in Dialog UI
   - Example: `importError` state shown in import dialog

**Coverage:** 12 error boundaries covering all major dashboard sections + marketing.

---

### [x] Are pages composed of smaller view components?

**Yes, extensive composition:**

1. **Landing page composition** (`(marketing)/page.tsx`):
   - 10+ section components, all dynamically imported:
     - `Hero`, `SocialProofBar`, `ProblemSection`, `FeaturesGrid` (dynamic)
     - `DesignStudioSection` (dynamic), `HowItWorks` (dynamic)
     - `ChannelsSection` (dynamic), `WhoItsFor` (dynamic)
     - `TrustSection` (dynamic), `PricingTeaser` (dynamic)
     - `FinalCTA` (dynamic)
   - Wrapped in `ScrollReveal` for animations

2. **Dashboard page composition**:
   - Stats cards (4 inline Card components)
   - Live queue table (inline)
   - Activity feed (inline with clickable items)
   - Today's snapshot (3 inline cards)
   - Conditional onboarding banner (Card when botsCount === 0)

3. **Analytics page composition**:
   - `ConversationVolumeChart` (dynamic import from `@/components/analytics/`)
   - `AnalyticsTagsChart` (dynamic import)
   - `AnalyticsCSAT` (component)
   - `AnalyticsUnansweredQueries` (component)
   - `AnalyticsUsageQuotas` (component)
   - 6 stat cards (inline)
   - Date range picker (inline with native inputs)

4. **Contacts page composition**:
   - `ContactsList` (data table component)
   - Import dialog (inline with file upload)
   - Export dropdown (inline)
   - Create contact dialog (inline form)

5. **Bots page composition**:
   - Sidebar filters (inline)
   - Bot cards (inline grid)
   - CreateBotDialog (from `@/components/dashboard/bots/`)
   - Delete confirmation (AlertDialog inline)

6. **Activities page composition**:
   - `ActivitiesDataTable` (from `@/components/activities/`)
   - `getColumns()` for column definitions
   - Card wrapper with header

**No `src/components/pages/` or `src/components/views/` directories exist** — components are organized by feature (`components/dashboard/`, `components/analytics/`, `components/settings/`, etc.)

---

### [x] How is pagination handled for list views?

**Convex `usePaginatedQuery` with "Load More" pattern:**

1. **Dashboard page** (activity feed):
   - `initialNumItems: 5`
   - "View More" button at bottom of activity card
   - `loadMoreActivity(5)` loads 5 more items
   - Button shows spinner when loading
   - Disabled when `activityStatus !== "CanLoadMore"`

2. **Activities page**:
   - `PAGE_SIZE = 25` constant
   - Passed to `ActivitiesDataTable` component
   - Table component handles "Load More" button rendering

3. **History page**:
   - `loadMore(50)` — loads 50 conversations at a time
   - Button: "Load More Conversations"
   - Shows loading spinner

4. **KB detail page** (`kb/[kbId]`):
   - `sourcesResult.loadMore(50)`
   - Button shown when `sourcesResult.status === "CanLoadMore"`
   - Disabled when status changes

**Pagination UI pattern:**
```typescript
{activityStatus !== "Exhausted" && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => loadMoreActivity(5)}
    disabled={activityStatus === "LoadingMore"}
  >
    {activityStatus === "LoadingMore" ? <Loader2 className="animate-spin" /> : null}
    {activityStatus === "LoadingMore" ? "Loading…" : "View More"}
  </Button>
)}
```

**No traditional page-number pagination** — all use infinite scroll / "Load More" pattern.

---

### [x] Are there data tables? (@tanstack/react-table)

**Yes, but limited usage:**

1. **ActivitiesDataTable** (`src/components/activities/ActivitiesDataTable.tsx`):
   - Uses `@tanstack/react-table`
   - Column definitions in `src/components/activities/columns.tsx`
   - Features: sorting, pagination via `loadMore` prop
   - Used by Activities page

2. **ContactsList** (`src/components/dashboard/contacts/contacts-list.tsx`):
   - Uses `@tanstack/react-table`
   - Column definitions for contact data
   - Features: sorting, selection, pagination

3. **Manual tables** (most common pattern):
   - Orders page: Manual `<Table>` with raw mapping
   - Dashboard live queue: Manual `<Table>` with inline rendering
   - KB sources: Manual table in import dialog preview
   - Most dashboard pages use shadcn `<Table>` directly without @tanstack

**Tanstack usage:** Only 2 components use @tanstack/react-table (Activities, Contacts). The rest use manual table rendering with shadcn Table primitives.

---

### [x] How are forms integrated in pages?

**Forms are primarily inline within Dialog components:**

1. **Create/Edit forms in Dialogs:**
   - Contacts page: Create contact form in Dialog (name, email, phone, address, note)
   - Orders page: No create form (import-only)
   - Settings pages: Inline forms in Cards (not dialogs)
   - Departments page: Create/edit department forms

2. **Form state management:**
   - Pattern 1: `useState` for simple forms
     ```typescript
     const [formData, setFormData] = useState({ name: "", email: "", ... })
     ```
   - Pattern 2: `useReducer` for complex forms (import flows)
     ```typescript
     const [importState, importDispatch] = useReducer(importReducer, initialImportState)
     ```

3. **Form submission pattern:**
   - `onSubmit` handler with `preventDefault()`
   - Mutation call in try/catch
   - Toast notification for success/failure
   - Reset form state on success
   - Loading state with `Loader2` spinner on submit button

4. **Import forms (file upload):**
   - Contacts & Orders pages: CSV/Excel/JSON import with preview
   - `handleFileUpload` parses file with PapaParse (CSV), xlsx (Excel), or JSON.parse
   - Preview shows first 5 rows in table
   - Batch import with chunking (500 items per batch)

5. **Settings forms:**
   - Inline in Cards, not dialogs
   - Blur-triggered saves (e.g., SLA hours input)
   - Select dropdowns for model/language
   - "Save Changes" button for batch updates

6. **Form validation:**
   - HTML5 `required` attribute
   - Type validation (`type="email"`, `type="tel"`, `type="number"`)
   - Manual validation in handlers (e.g., file extension checks)
   - No explicit form libraries (react-hook-form not used)

---

### [x] Are there charts/visualizations? (recharts)

**Yes, in Analytics page:**

1. **ConversationVolumeChart** (`src/components/analytics/ConversationVolumeChart.tsx`):
   - Uses Recharts: `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`
   - Shows daily conversation volume (bot vs agent handled)
   - Dynamically imported with `ssr: false`

2. **AnalyticsTagsChart** (`src/components/analytics/AnalyticsTagsChart.tsx`):
   - Uses Recharts: `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`
   - Shows tag frequency distribution
   - Dynamically imported with `ssr: false`

3. **AnalyticsCSAT** (component, not Recharts):
   - CSAT score display with star ratings
   - Comment list

4. **AnalyticsUnansweredQueries** (component):
   - List of unanswered queries
   - No chart visualization

5. **AnalyticsUsageQuotas** (component):
   - Usage metrics display
   - Progress bars for quotas
   - No Recharts

**All chart components:**
- Dynamically imported with `{ ssr: false }` to avoid hydration issues
- Receive `isLoading` prop for skeleton states
- Use `ResponsiveContainer` for responsive sizing
- Styled with Tailwind CSS

---

### [x] How is page-level state managed?

**Multiple state management strategies:**

1. **Local component state (`useState`)** — Most common:
   - Filter state: `const [filter, setFilter] = useState<'all' | 'new' | 'confirmed' | 'cancelled'>("all")`
   - Search state: `const [search, setSearch] = useState("")`
   - Dialog open state: `const [open, setOpen] = useState(false)`
   - Loading state: `const [loading, setLoading] = useState(false)`
   - Form data: `const [formData, setFormData] = useState({ ... })`

2. **Reducer state (`useReducer`)** — For complex state:
   - Import state in Contacts & Orders pages (6-state import flow)
   - Example: `importReducer` handles OPEN_IMPORT, CLOSE_IMPORT, SET_PARSED, SET_LOADING, SET_ERROR, RESET

3. **Convex real-time state** — Automatic:
   - `useQuery` subscriptions update automatically
   - `usePaginatedQuery` manages pagination state
   - No manual cache management needed

4. **Context state** — Project-wide:
   - `useProject()` from `@/context/ProjectContext`
   - Provides `activeProject` with project ID, user role, settings
   - Used to scope all Convex queries

5. **URL state** — Via Next.js router:
   - `useRouter()` for navigation
   - Query params: `?conversationId=xxx`, `?project=xxx`
   - Dynamic routes: `[botId]`, `[kbId]`, `[slug]`, `[provider]`

6. **Server state** — In server components:
   - `params` for route params (locale, botId, slug)
   - `searchParams` for query params (widget page)
   - No useState (server components are stateless)

**No Zustand, Redux, or Jotai** — State is localized to components or managed via Convex.

---

### [x] Are pages optimized for performance?

**Yes, multiple optimization strategies:**

1. **Dynamic imports for heavy components:**
   - Landing page: 9/11 sections dynamically imported
   - Analytics page: Charts dynamically imported with `{ ssr: false }`
   - Reduces initial JS bundle

2. **Server vs Client split:**
   - Marketing pages are Server Components (no client JS shipped)
   - Only dashboard pages are Client Components (authenticated, need interactivity)
   - Reduces client-side JS for public pages

3. **Convex real-time subscriptions:**
   - Automatic batching of updates
   - No manual polling
   - Skip pattern prevents unnecessary queries: `activeProject ? { ... } : "skip"`

4. **Pagination:**
   - `usePaginatedQuery` with limited initial items (5, 25, 50)
   - Prevents loading entire datasets upfront

5. **Stable snapshots:**
   - Dashboard page: `const [currentTime] = useState(() => Date.now());`
   - Prevents impure calls in render, avoids infinite loops

6. **useMemo/useEffect for expensive computations:**
   - Analytics page: `useMemo` for default date range
   - Analytics page: `useEffect` for action calls (stats, volume, tokens, etc.)
   - Bots page: `useMemo` for filtered bots list (via `.filter()` chain)

7. **`force-dynamic` for authenticated routes:**
   - Dashboard layout: `export const dynamic = "force-dynamic";`
   - Prevents unnecessary static generation

8. **Chart SSR disabled:**
   - All charts: `{ ssr: false }` to avoid hydration mismatches

**What could be improved:**
- No `React.memo` on page components
- No `useCallback` for event handlers (could cause unnecessary re-renders)
- Large pages (Orders page: 517 lines) could be split

---

### [x] Is there SSR/SSG for any pages?

**Yes, clear split:**

1. **SSR (Server-Side Rendering):**
   - Marketing pages: Rendered on each request
   - Login page: Server component with `force-dynamic`
   - Design studio: Server wrapper for SEO
   - Pricing page: Server component
   - Widget page: Server component with dynamic data fetch
   - Legal pages: Static content

2. **CSR (Client-Side Rendering):**
   - **All dashboard pages are CSR** (Client Components with `"use client"`)
   - Data fetched client-side via Convex
   - No SSR for authenticated content

3. **No SSG (Static Site Generation):**
   - No `generateStaticParams` found
   - All pages are dynamic (either SSR or CSR)
   - Marketing pages could benefit from SSG but aren't statically generated

4. **Dynamic route handling:**
   - `[slug]` routes (products, solutions): SSR
   - `[botId]` route (design studio): SSR wrapper + CSR
   - `[kbId]` route (KB detail): CSR
   - `[provider]` route (integration detail): CSR

5. **Metadata generation:**
   - Server pages use `generateMetadata` for dynamic metadata
   - Static metadata for login page: `export const metadata: Metadata = { ... }`

---

### [x] How are page titles and metadata set?

**Two patterns for metadata:**

1. **`generateMetadata` (dynamic, async):**
   - Used in 5 pages:
     - `(marketing)/page.tsx` — Home page with canonical URLs, alternate languages
     - `pricing/page.tsx` — "Pricing — Yoosr"
     - `design-studio/[botId]/page.tsx` — Uses i18n translations for title/description
     - `products/[slug]/page.tsx` — Dynamic product metadata
     - `solutions/[slug]/page.tsx` — Dynamic solution metadata

   - Pattern:
     ```typescript
     export async function generateMetadata({ params }): Promise<Metadata> {
       const { locale } = await params;
       return {
         title: "...",
         description: "...",
         alternates: { canonical: `.../${locale}`, languages: { en: `...`, ar: `...`, fr: `...` } },
         openGraph: { images: [{ url: `.../og/image?...`, width: 1200, height: 630 }] },
         twitter: { images: [`.../og/image?...`] },
       }
     }
     ```

2. **Static `metadata` export:**
   - Login page: `export const metadata: Metadata = { title: "Sign In — Yoosr", ... }`

3. **No metadata found:**
   - Most dashboard pages (21 pages) have **no metadata**
   - Since they're Client Components, they can't export metadata (server-only feature)
   - Relies on layout-level defaults or has no SEO metadata

4. **OG Image generation:**
   - Dynamic OG images via `/og/image?title=...&description=...`
   - Used in marketing, pricing, design studio pages
   - Width: 1200, Height: 630 (standard OG image size)

5. **i18n metadata:**
   - Design studio uses `getTranslations({ locale })` for localized titles
   - Marketing page uses canonical alternates for 3 languages (en, ar, fr)

**Coverage:** Only 5/37 pages (13.5%) have explicit metadata. Dashboard pages lack SEO metadata.

---

## 📝 Agent Findings

### Page Architecture Patterns

**1. Server Wrapper Pattern for SEO + Client Interactivity**
Pages that need both SSR (for SEO) and client interactivity use a two-component pattern:
- Server component: Sets locale via `unstable_setRequestLocale`, renders client component
- Client component: Contains all interactive logic
- Examples: `login/page.tsx` → `LoginClient`, `design-studio/[botId]/page.tsx` → `BotEditorClient`

**2. Dashboard Shell Hierarchy**
All authenticated pages are wrapped in:
```
Providers (React Query + Convex)
└── DashboardAuthGuard (redirects to login if unauthenticated)
    └── DashboardShell (sidebar, header, navigation)
        └── Page Content (21 different pages)
            └── PushNotificationInit (PWA setup)
```

**3. Feature-Based Component Organization**
No centralized `pages/` or `views/` directory. Instead:
- `components/dashboard/` — Bot dialogs, skeletons
- `components/analytics/` — Charts, CSAT, usage
- `components/settings/` — UsageCard
- `components/activities/` — Data table, columns
- `components/landing/` — 10+ landing page sections

### Data Fetching Patterns

**4. Convex-Exclusive Data Layer**
All 21 dashboard pages use Convex exclusively:
- No REST API calls
- No React Query / SWR / Apollo
- Real-time subscriptions via `useQuery`
- Pagination via `usePaginatedQuery`
- Complex aggregations via `useAction`

**5. The "Skip" Pattern**
Universal guard for conditional queries:
```typescript
const data = useQuery(api.foo.bar, activeProject ? { projectId: activeProject._id } : "skip")
```
Prevents queries from firing when no project is selected, avoiding errors.

**6. Manual Action State Management**
Analytics page uses `useState` + `useEffect` for Convex actions:
```typescript
const [convStatsData, setConvStatsData] = useState<... | undefined>(undefined);
const fetchStats = useAction(api.analytics.getConversationStats);
useEffect(() => {
  fetchStats({ projectId, from, to }).then(data => setConvStatsData(data));
}, [activeProject, from, to, fetchStats]);
```
Could potentially use `useQuery`-like wrapper for cleaner API.

### Loading & Error Handling

**7. Three Skeleton Types**
- `DashboardPageSkeleton` — Standard pages (header + stats + content)
- `ThreePanelSkeleton` — Chat/inbox views (3 columns)
- `CanvasSkeleton` — Canvas interfaces (toolbars + panels)

**8. Reusable Error Boundary**
All 12 error boundaries use the same `ErrorFallback` component with:
- Reset button (retry)
- Go home button (navigation escape)
- Consistent styling across the app

### Form Patterns

**9. No Form Library**
All forms use manual state management:
- `useState` for simple forms
- `useReducer` for complex forms (imports)
- No react-hook-form, Formik, or Zod validation
- HTML5 validation only (`required`, `type="email"`, etc.)

**10. Import/Export Pattern**
Contacts and Orders pages have identical import/export implementations:
- File upload with PapaParse (CSV), xlsx (Excel), JSON.parse
- Preview first 5 rows in dialog
- Batch import with 500-item chunks
- Export to CSV/Excel/JSON with client-side blob downloads

### Performance

**11. Extensive Dynamic Imports**
- Landing page: 9/11 sections are dynamic
- Analytics charts: All dynamically imported with `ssr: false`
- Reduces initial bundle, improves TTI

**12. No React.memo or useCallback**
No memoization found in any page components. Could cause unnecessary re-renders when parent state changes.

### Internationalization

**13. Consistent i18n Usage**
- All pages use `useTranslations("namespace")` for text
- `useLocale()` for locale-aware formatting
- `date-fns` locale mapping for date formatting
- RTL support: `dir={locale === 'ar' ? 'rtl' : 'ltr'}`

### Metadata & SEO

**14. Limited Metadata Coverage**
Only 5/37 pages have explicit metadata:
- Marketing pages (home, pricing, legal)
- Dynamic routes (products, solutions, design studio)
- All 21 dashboard pages lack metadata (acceptable for authenticated content)

---

## 🔍 Key Patterns to Identify

### Page Composition Strategies
1. **Landing page:** Section-based composition with `ScrollReveal` animations
2. **Dashboard page:** Card-based layout with stats, live queue, activity feed, snapshot
3. **List pages:** Filter sidebar + grid/table of items (Bots, Orders, Contacts)
4. **Settings pages:** Tabs + Cards with forms (single tab: "general")
5. **Analytics page:** Stats cards + charts + date range picker

### Data Fetching Patterns
1. **Real-time subscriptions:** `useQuery` for live data (bots, contacts, orders)
2. **Paginated queries:** `usePaginatedQuery` with "Load More" button
3. **Action-based queries:** `useAction` + `useEffect` for complex aggregations
4. **Skip pattern:** Guard queries with `activeProject ? { ... } : "skip"`

### Loading and Error Handling Approaches
1. **Loading:** Dedicated `loading.tsx` files with shared skeleton components
2. **Errors:** `error.tsx` files with reusable `ErrorFallback` component
3. **Inline loading:** Spinner in tables when data is undefined
4. **Manual skeletons:** `animate-pulse` with `bg-muted` for inline loading

### Server vs Client Component Decisions
1. **Server:** Marketing, auth, legal, widget (SEO-critical or static content)
2. **Client:** All dashboard pages (need Convex real-time + interactivity)
3. **Hybrid:** Server wrapper sets locale + renders client component

### Performance Optimization Techniques
1. Dynamic imports for heavy components (charts, landing sections)
2. Convex real-time subscriptions (no polling)
3. Pagination with limited initial items
4. `force-dynamic` for authenticated routes
5. `ssr: false` for client-only charts

---

## ⚠️ Potential Concerns

### HIGH Severity

1. **No form validation library** — All forms rely on HTML5 validation only. No Zod, Yup, or custom validation logic. Risk of invalid data reaching mutations.

2. **Large monolithic pages** — Orders page (517 lines), Contacts page (~400 lines), Analytics page (~250 lines). These handle too many responsibilities (CRUD, import/export, filtering, state management). Should be split into smaller components.

3. **No error boundaries for nested features** — While top-level pages have error boundaries, nested features (import dialogs, charts, data tables) don't have their own boundaries. A chart error could crash the entire analytics page.

### MEDIUM Severity

4. **Limited metadata coverage** — Only 5/37 pages (13.5%) have explicit metadata. Dashboard pages have no page titles, which could affect browser tab usability and bookmarking.

5. **No `React.memo` or `useCallback`** — Dashboard pages re-render entirely when any state changes. Could cause performance issues with large datasets (e.g., 100+ bots, contacts).

6. **Manual action state management** — Analytics page manually manages 7+ `useState` + `useEffect` pairs for Convex actions. Could be abstracted into a custom hook or use `useQuery`-like pattern.

7. **No SSG for marketing pages** — Landing, pricing, and legal pages are SSR but could be statically generated for better performance. No `generateStaticParams` found anywhere.

8. **Inconsistent table patterns** — Only 2 pages use `@tanstack/react-table` (Activities, Contacts). The rest manually render tables. Could standardize on one approach.

### LOW Severity

9. **Duplicate import/export logic** — Contacts and Orders pages have nearly identical import/export implementations (file parsing, preview, batch import, export to CSV/Excel/JSON). Should be extracted into a reusable hook/component.

10. **No loading states for mutations** — Forms disable submit buttons with `disabled={loading}` but don't show optimistic updates or progress indicators for batch operations.

11. **Hardcoded page sizes** — `PAGE_SIZE = 25` in activities page, but other pages use inline values (5, 50). Should be standardized or configurable.

12. **Missing skeleton for charts** — Analytics charts receive `isLoading` prop but rely on parent component to pass `data === undefined`. Could use a shared loading state pattern.
