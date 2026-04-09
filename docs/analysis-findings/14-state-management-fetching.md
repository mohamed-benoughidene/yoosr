# Part 14: State Management & Data Fetching

## 📊 Visual Map

```
State Management Layers
├── Convex Client (PRIMARY)            → Real-time reactive data layer
│   ├── ConvexProviderWithClerk        → React context provider (src/components/ConvexClientProvider.tsx)
│   ├── useQuery()                     → 55+ reactive subscriptions across 25+ components
│   ├── useMutation()                  → 80+ mutation bindings across 30+ components
│   ├── useAction()                    → 12 action calls (analytics, integrations, AI)
│   ├── usePaginatedQuery()            → 6 paginated data views (history, activities, messages, KB sources)
│   └── .withOptimisticUpdate()        → 14 optimistic update bindings (contacts, bots, labels, KB, orders)
│
├── React Context (SHARED STATE)       → Cross-component shared state
│   └── src/context/ProjectContext.tsx  → Active project selection + project list
│       ├── useProject()               → Consumer hook
│       ├── projects (from useQuery)   → Org-scoped project list
│       └── activeProject              → URL param or first project fallback
│
├── React Local State (COMPONENT)      → Component-scoped UI state
│   └── useState()                     → 120+ instances across components
│       ├── Form inputs                → search, name, description, etc.
│       ├── UI toggles                 → modals, panels, dialogs
│       └── Loading flags              → saving, submitting, testing
│
├── Custom Hooks (REUSABLE LOGIC)      → Encapsulated state patterns
│   ├── src/hooks/useProjectId.ts      → URL-based project ID with setter
│   ├── src/hooks/useAnalyticsData.ts  → Batch action fetching with loading/error state
│   ├── src/hooks/useFeatureFlag.ts    → Memoized feature flag check
│   └── src/hooks/use-mobile.tsx       → Responsive breakpoint detection
│
├── URL State (NAVIGATION)             → Search params and route state
│   ├── useSearchParams()              → 10 components (project selection, conversation ID, bot ID)
│   ├── useParams()                    → Route params (locale, botId, provider, kbId)
│   └── usePathname()                  → Current path for locale-aware navigation
│
└── Error Boundaries (ERROR STATE)     → Crash recovery
    └── AppErrorBoundary               → Wraps Dashboard, Design Studio, Settings, KB, Panels
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/components/ConvexClientProvider.tsx` | App-level provider wiring: `ClerkProvider` → `ConvexProviderWithClerk` with locale-aware URLs |
| `src/context/ProjectContext.tsx` | `ProjectProvider` + `useProject()` — active project selection context |
| `src/hooks/useProjectId.ts` | URL search param-based project ID management with getter/setter |
| `src/hooks/useAnalyticsData.ts` | Custom hook for batch-fetching 6 analytics actions with loading/error/cleanup |
| `src/hooks/useFeatureFlag.ts` | Memoized feature flag check via `useMemo(() => isFeatureEnabled(flag))` |
| `src/hooks/use-mobile.tsx` | Media query-based mobile breakpoint detection (768px) |
| `src/components/error-boundary.tsx` | `AppErrorBoundary` using `react-error-boundary` with retry UI |
| `src/app/[locale]/dashboard/DashboardShell.tsx` | Dashboard wrapper — profile sync, heartbeat, error boundary |
| `src/app/[locale]/design-studio/DesignStudioShell.tsx` | Design studio wrapper — profile sync, error boundary |
| `src/app/[locale]/dashboard/settings/SettingsShell.tsx` | Settings wrapper with error boundary |
| `src/app/[locale]/dashboard/kb/KbShell.tsx` | Knowledge base wrapper with error boundary |
| `src/app/[locale]/layout.tsx` | Locale layout with `NextIntlClientProvider` |
| `src/app/layout.tsx` | Root layout — no providers, just font and HTML shell |
| `convex/` | 43 backend files providing queries, mutations, and actions consumed by frontend |

## ✅ Analysis Checklist

- [x] **How is Convex integrated with React?**
  Via `ConvexProviderWithClerk` from `convex/react-clerk` in `src/components/ConvexClientProvider.tsx:59`. The provider wraps the entire app inside `ClerkProvider` and accepts a `ConvexReactClient` instance (created with `NEXT_PUBLIC_CONVEX_URL`) plus `useAuth` from Clerk. This enables all child components to use `useQuery`, `useMutation`, `useAction`, and `usePaginatedQuery` from `convex/react`. During static build (CI), if `NEXT_PUBLIC_CONVEX_URL` is missing, the provider renders children with only `ClerkProvider` — no Convex.

- [x] **What's the data fetching strategy? (useQuery patterns)**
  The primary strategy is **Convex reactive queries** via `useQuery()` from `convex/react`. There are **55+ `useQuery()` calls** across 25+ components. Key patterns:
  - **Direct binding**: `useQuery(api.conversations.list, { projectId: activeProject._id })` — passes args directly
  - **Conditional skip**: `useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")` — skips query when arg is unavailable
  - **Null coalescing**: `useQuery(api.profiles.list) ?? []` — defaults to empty array while loading
  - **Real-time**: All `useQuery` subscriptions are automatically reactive — UI updates when underlying data changes in Convex

- [x] **Are mutations using useMutation()?**
  Yes, extensively. There are **80+ `useMutation()` calls** across 30+ components. Every data write operation goes through `useMutation(api.moduleName.functionName)`. Examples:
  - `useMutation(api.conversations.update)` in requests page
  - `useMutation(api.projects.update)` in settings pages
  - `useMutation(api.profiles.ensureCurrent)` in DashboardShell
  - `useMutation(api.contacts.create)` in contacts page

- [x] **Is optimistic UI updates implemented?**
  Yes. **14 mutations** use `.withOptimisticUpdate()` for immediate UI feedback:
  - **Contacts**: `contacts.create`, `contacts.remove` — instant add/remove in list
  - **Bots**: `bots.create`, `bots.update`, `bots.remove` — instant CRUD in bot list
  - **Labels**: `labels.createLabel`, `labels.removeLabel` — instant add/remove
  - **Canned Responses**: `cannedResponses.create`, `cannedResponses.update`, `cannedResponses.remove` — full CRUD
  - **Knowledge Bases**: `knowledgeBases.create`, `knowledgeBases.remove` — instant add/remove
  - **Orders**: `orders.updateOrderStatus`, `orders.deleteOrder` — instant status change and removal
  
  Non-optimistic mutations (e.g., conversations, settings, integrations) rely on Convex's automatic reactivity — the UI updates within milliseconds when the mutation completes.

- [x] **How is loading state tracked?**
  Two patterns:
  1. **Convex implicit loading**: `useQuery()` returns `undefined` while loading, which components check: `const isLoading = projectsResult === undefined` (ProjectContext.tsx:50). Some components use `?? []` to default to empty arrays.
  2. **Manual loading state**: Many components use `useState` flags for async operations: `const [loading, setLoading] = useState(false)` / `const [saving, setSaving] = useState(false)` / `const [isSubmitting, setIsSubmitting] = useState(false)`. These are set before/after mutation calls.
  3. **Paginated loading**: `usePaginatedQuery` returns `{ results, status, loadMore }` where `status` is `"LoadingFirstPage" | "CanLoadMore" | "Exhausted"`.

- [x] **Are there custom hooks for data fetching?**
  Yes, two significant ones:
  1. **`useAnalyticsData`** (`src/hooks/useAnalyticsData.ts`): Fetches 6 analytics metrics in parallel via `Promise.all` with `useAction`. Manages loading, error, and mounted state via refs. Properly handles cleanup with `isMounted` ref to prevent state updates after unmount.
  2. **`useProjectId`** (`src/hooks/useProjectId.ts`): Reads/writes `projectId` from URL search params. Not a data fetching hook per se, but critical for parameterizing all data fetches.

- [x] **What's in the `src/hooks/` directory?**
  4 hooks:
  | Hook | Lines | Purpose |
  |------|-------|---------|
  | `use-mobile.tsx` | 20 | Media query listener for `< 768px` breakpoint, returns boolean |
  | `useAnalyticsData.ts` | 114 | Batch analytics fetching with 6 `useAction` calls, loading/error state, cleanup |
  | `useFeatureFlag.ts` | 31 | `useMemo`-wrapped feature flag check using `isFeatureEnabled()` from `@/lib/featureFlags` |
  | `useProjectId.ts` | 31 | URL search param-based active project ID getter/setter/clear |

- [x] **What's in the `src/context/` directory?**
  1 context provider:
  - **`ProjectContext.tsx`** (86 lines): Provides `ProjectProvider` and `useProject()` hook. Uses `useQuery(api.projects.list)` for reactive project list, `useOrganization()` from Clerk for org state, and `useProjectId()` for URL-based selection. Exposes: `projects`, `activeProject`, `isLoading`, `createProject`, `setProjectId`. Active project is determined by URL param → fallback to first project.

- [x] **How is form state managed? (react-hook-form)**
  `react-hook-form` is **NOT used** in this codebase. All forms use raw `useState` for individual field values. Common patterns:
  - `const [newName, setNewName] = useState("")` with manual `onChange` handlers
  - `const [formData, setFormData] = useState({ name: "", email: "", ... })` with object state
  - Manual validation before mutation calls
  - `const [loading, setLoading] = useState(false)` for submission state
  
  This is consistent across all settings pages, dialogs, and inline editors (labels, canned responses, departments, webhooks, contacts, widget config, integrations, etc.).

- [x] **Is there global state beyond Convex?**
  Minimal. Beyond Convex (which serves as the primary "global" state via reactive queries):
  1. **`ProjectContext`**: The only React Context — shares active project selection across dashboard components
  2. **Clerk Auth State**: `useUser()`, `useAuth()`, `useOrganization()` — managed by Clerk, consumed in middleware and DashboardShell
  3. **`next-intl`**: Locale state via `NextIntlClientProvider` — server-driven from URL path
  
  There is **no Redux, Zustand, Jotai, or other state management library**. Convex's reactive queries eliminate the need.

- [x] **How is URL search params used for state?**
  URL search params are used for **3 key state dimensions**:
  1. **Project selection**: `?projectId=<id>` — managed by `useProjectId` hook, consumed by `ProjectContext`
  2. **Conversation selection**: `?id=<conversationId>` — used by `ChatArea`, `ConversationList`, `VisitorPanel`
  3. **Bot editor**: `?projectId=<id>` — used by Design Studio components
  
  10 components directly use `useSearchParams()` (re-exported from `next/navigation` via `@/i18n/navigation`). The `useProjectId` hook provides a clean API: `const { projectId, setProjectId, clearProjectId } = useProjectId()`.

- [x] **Are there any caching patterns?**
  No explicit client-side caching beyond Convex's built-in reactivity:
  - Convex automatically caches query results and only re-fetches when underlying data changes (server-push model)
  - `useFeatureFlag` uses `useMemo` to memoize flag evaluation
  - `useAnalyticsData` fetches fresh data on each `projectId` or date range change (no stale cache)
  - No localStorage, sessionStorage, or IndexedDB caching patterns found

- [x] **How is pagination state handled?**
  **6 components** use `usePaginatedQuery()` from `convex/react`:
  1. `/dashboard/history/page.tsx` — conversation history with load more
  2. `/dashboard/activities/page.tsx` — activity logs with load more
  3. `/dashboard/page.tsx` — recent activities on home page
  4. `/dashboard/kb/[kbId]/page.tsx` — KB sources with load more
  5. `components/chat/ChatArea.tsx` — message history (chat scroll)
  6. `components/dashboard/monitor/chat-display.tsx` — monitor chat messages
  
  All use the pattern: `const { results, status, loadMore } = usePaginatedQuery(api.module.fn, args, { initialNumItems: N })`. `status` is checked for `"CanLoadMore"` to show load-more buttons.

- [x] **Is there infinite scroll or load more?**
  **Load More buttons** are the primary pattern, not infinite scroll. Components check `status === "CanLoadMore"` and render a button that calls `loadMore(N)`. The `ChatArea.tsx` component likely implements scroll-triggered loading for messages, but the primary UI pattern is explicit "Load More" buttons.

- [x] **How are errors surfaced to UI?**
  Multi-layered error handling:
  1. **Error Boundaries**: `AppErrorBoundary` (using `react-error-boundary`) wraps Dashboard, Design Studio, Settings, and KB shells. Displays error message + "Try again" button.
  2. **Convex mutation errors**: `ConvexError` thrown from backend functions is caught by the Convex client and surfaces as rejected promises. Components handle these in try/catch blocks around mutation calls.
  3. **Toast notifications**: Many components use `toast.error()` or `toast.success()` (from Sonner) for operation feedback.
  4. **Analytics hook**: `useAnalyticsData` tracks error state explicitly: `const [error, setError] = useState<Error | null>(null)`.
  5. **Loading placeholders**: Components display skeletons or spinners while data is loading.

- [x] **Are there any derived state patterns?**
  Yes, several:
  - **Filtered lists**: `conversations.filter(c => c.departmentId === args.departmentId)` in conversation list
  - **Active project derivation**: `ProjectContext` derives `activeProject` from URL param or first project fallback
  - **Search filtering**: Multiple components derive filtered lists from search state: `contacts.filter(c => c.name.includes(search))`
  - **Memoized feature flags**: `useFeatureFlag` derives boolean from config via `useMemo`
  - **Loading derivation**: `const isLoading = !isOrgLoaded || projectsResult === undefined` in ProjectContext

## 📝 Agent Findings

### Data Flow Architecture

The application follows a **Convex-centric reactive architecture** where:

```
User Action → useMutation()/useAction() → Convex Backend
                                              ↓
                                    Database Write + Scheduler
                                              ↓
Convex Server Push → useQuery()/usePaginatedQuery() → React Re-render
```

There is no intermediary state management layer. Convex serves as both the database and the real-time state synchronization layer. This eliminates traditional state management concerns (cache invalidation, stale data, optimistic rollback complexity).

### Provider Hierarchy

```
<html>
  <body>
    <NextIntlClientProvider>           // Locale + translations
      <ClerkProvider>                  // Auth state
        <ConvexProviderWithClerk>      // Database + real-time
          <SidebarProvider>            // UI layout state
            <ProjectProvider>          // Active project context
              <AppErrorBoundary>       // Error recovery
                {page content}
              </AppErrorBoundary>
            </ProjectProvider>
          </SidebarProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

### Quantitative Summary

| Category | Count |
|----------|-------|
| `useQuery()` calls | 55+ |
| `useMutation()` calls | 80+ |
| `useAction()` calls | 12 |
| `usePaginatedQuery()` calls | 6 |
| `.withOptimisticUpdate()` | 14 |
| `useState()` instances | 120+ |
| `useSearchParams()` usage | 10 components |
| Custom hooks | 4 |
| React Contexts | 1 (ProjectContext) |
| Error Boundaries | 5 placement points |

### Notable Implementation Decisions

1. **No form library**: Despite 120+ `useState` calls for form fields, the codebase does not use `react-hook-form`, Formik, or any form library. This keeps the dependency count low but results in repeated manual form patterns.

2. **Actions for analytics**: Analytics queries are implemented as Convex `actions` (not `queries`), called via `useAction()` in `useAnalyticsData.ts`. This means they are **not reactive** — analytics data needs manual refresh or explicit `useEffect` dependencies.

3. **Single context pattern**: Only one React Context exists (`ProjectContext`). All other shared state flows through Convex reactive queries. This is a clean architecture choice that avoids context prop-drilling complexity.

4. **Conditional query skip**: The `"skip"` sentinel value is used extensively to prevent queries from running before their dependencies are available (e.g., `useQuery(api.x, projectId ? { projectId } : "skip")`). This is a Convex-specific pattern.

## 🔍 Key Patterns to Identify

- **Data fetching philosophy**: Convex reactive queries as the primary data layer. No REST/GraphQL. Real-time by default.
- **Optimistic UI approach**: 14 mutations use `.withOptimisticUpdate()` for CRUD operations on lists (contacts, bots, labels, canned responses, KB, orders). Non-list mutations rely on Convex's sub-second reactive push.
- **Custom hook patterns**: Small, focused hooks — `useProjectId` for URL state, `useAnalyticsData` for batch fetching, `useFeatureFlag` for memoized config, `use-mobile` for responsive.
- **Form state management**: Raw `useState` for all forms. No form library.
- **Loading and error state strategies**: Implicit loading via `useQuery() === undefined`, manual `useState` flags for mutations, `AppErrorBoundary` for crash recovery, toast notifications for user feedback.

## ⚠️ Potential Concerns to Watch For

### HIGH Severity

- **No optimistic updates on conversation mutations**: Core conversation actions (`update`, `resolve`, `join`, `markAsRead`) lack optimistic updates. In a real-time chat app, this could cause noticeable UI lag between clicking "Join" and seeing the status change, especially on slower connections.

### MEDIUM Severity

- **Over-fetching in conversation list**: `conversations.list` uses `.take(100)` without cursor-based pagination. As conversation volume grows, this will fetch excessive data on every reactive update. Should migrate to `usePaginatedQuery` like the history page.

- **Analytics not reactive**: Analytics data is fetched via `useAction()` (not `useQuery()`), meaning the dashboard doesn't update in real-time. Users must manually refresh or change filters to see updated metrics. This is by Convex design (actions can't be reactive), but is a UX limitation.

- **Missing loading states on some queries**: Several components use `useQuery(...) ?? []` which collapses "loading" and "empty" states into the same empty array. Users see no skeleton/spinner while data loads — just an empty page that suddenly populates.

- **No error handling on many mutations**: Many `useMutation` calls are invoked without try/catch or `.then()/.catch()` error handling. If the server throws, the error may only surface via the error boundary rather than inline feedback.

### LOW Severity

- **No reusable data fetching hooks beyond `useAnalyticsData`**: Each page component directly calls `useQuery`/`useMutation` with inline logic. Extracting common patterns (e.g., `useConversations(projectId)`, `useBots(projectId)`) into custom hooks would improve reusability and testability.

- **`useState` sprawl in settings pages**: Some pages have 10+ `useState` declarations for form fields (e.g., `integrations/page.tsx` has 10 state variables). A form library or `useReducer` would consolidate this.

- **Inconsistent form validation**: Form validation is ad-hoc and inline. Some forms validate before submission, others rely entirely on backend validation. No consistent validation schema or library (e.g., Zod).

- **`useAnalyticsData` uses `useEffect` for data fetching**: While properly guarded with `isMounted` ref, the pattern of `useAction` inside `useEffect` is a known anti-pattern in React 18+ (potential double-fetch in StrictMode). Consider migrating to a `useCallback` + manual trigger pattern.
