# Part 14: State Management & Data Fetching - Findings

## 📊 Visual Map

```
State Management Layers
├── Convex Client (PRIMARY DATA LAYER)
│   ├── ConvexProviderWithClerk   → React context (convex/react + Clerk auth integration)
│   ├── ConvexClientProvider      → Creates ConvexReactClient, wraps in ConvexProviderWithClerk
│   ├── useQuery()                → Reactive, auto-revalidating queries
│   ├── useMutation()             → Data mutations with .withOptimisticUpdate()
│   ├── usePaginatedQuery()       → Cursor-based pagination
│   └── useAction()               → Server actions (analytics, integrations)
│
├── React State (COMPONENT-LEVEL)
│   ├── useState()                → Simple form state, UI toggles
│   ├── useReducer()              → Complex forms (Widget config 680 lines, WidgetChat state machine, import wizards)
│   └── useContext()              → ProjectContext (single custom context)
│
├── Custom Hooks (2 TOTAL)
│   ├── useProjectId()            → URL-based project selection via search params
│   └── useIsMobile()             → Responsive breakpoint via matchMedia
│
├── Context Providers (1 CUSTOM)
│   └── ProjectContext            → Combines Clerk org state, URL project selection, Convex queries
│
├── Form State (MANUAL)
│   ├── useState per field        → Simple forms (KbCreateDialog)
│   ├── useState object           → Medium forms (EditContactDialog)
│   ├── useReducer typed          → Complex forms (Widget config, WidgetChat, Orders import)
│   └── NOT react-hook-form       → shadcn form infrastructure exists but UNUSED
│
└── URL State (SEARCH PARAMS)
    ├── ?projectId=               → Project selection (useProjectId hook)
    ├── ?conversationId=          → Chat conversation selection
    ├── ?project=&node=           → Design studio state
    └── ?ref=                     → Referral tracking (waitlist)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `src/hooks/useProjectId.ts` | URL-based project selection hook |
| `src/hooks/use-mobile.tsx` | Responsive breakpoint hook |
| `src/context/ProjectContext.tsx` | Project state combining Clerk, URL, and Convex |
| `src/components/providers.tsx` | App provider tree: DirectionProvider → ConvexClientProvider → ProjectProvider |
| `src/components/ConvexClientProvider.tsx` | ConvexReactClient + ConvexProviderWithClerk setup |
| `convex/` | Convex queries and mutations (data layer - see Part 15) |

## ✅ Analysis Checklist

- [x] **How is Convex integrated with React?** Via `ConvexProviderWithClerk`:
  - `ConvexClientProvider` creates `ConvexReactClient` with `NEXT_PUBLIC_CONVEX_URL`
  - Wraps children in `<ConvexProviderWithClerk client={convex} useAuth={useAuth}>`
  - Clerk's `useAuth` provides authentication tokens to Convex
  - Client automatically handles auth tokens and reconnection
  - `Providers` tree: `DirectionProvider` → `ConvexClientProvider` → `ProjectProvider` → `children` + `AppToaster`

- [x] **What's the data fetching strategy?** Three Convex hooks:
  1. **`useQuery`** - Reactive queries, auto-revalidate on DB change: `useQuery(api.bots.list, { projectId }) ?? []`
  2. **`usePaginatedQuery`** - Cursor-based pagination: `usePaginatedQuery(api.messages.list, { conversationId }, { initialNumItems: 30 })`
  3. **`useAction`** - Server actions for complex logic: `useAction(api.analytics.getConversationStats)`

- [x] **Are mutations using useMutation()?** YES, consistently. All mutations follow pattern:
  ```typescript
  const createBot = useMutation(api.bots.create)
  await createBot({ projectId: activeProject._id, name, ... })
  ```

- [x] **Is optimistic UI updates implemented?** YES, extensively via `.withOptimisticUpdate()`:
  - **Create** (15+ mutations): Appends temp item to list with temporary ID
  - **Update**: Maps over cached list, updates matching item
  - **Delete**: Filters out deleted item from all cached queries via `localStore.getAllQueries()`
  - **Pattern**: 
    ```typescript
    const createBot = useMutation(api.bots.create).withOptimisticUpdate(
      (localStore, args) => {
        const existing = localStore.getQuery(api.bots.list, { projectId: args.projectId });
        if (existing) {
          const id = `temp_${(nextTempId++).toString(36)}`;
          localStore.setQuery(api.bots.list, { projectId: args.projectId }, [...existing, tempItem]);
        }
      }
    );
    ```
  - **Manual optimistic**: WidgetChat uses `useReducer` dispatch with temp IDs, rolls back on failure

- [x] **How is loading state tracked?** Three patterns:
  1. **Undefined check**: `orders === undefined ? <Loader2 /> : ...` (Convex returns undefined while loading)
  2. **Skeleton components**: `loading.tsx` files with `DashboardPageSkeleton`
  3. **Paginated status**: `status === "LoadingFirstPage"` / `"LoadingMore"` / `"Exhausted"`

- [x] **Are there custom hooks for data fetching?** Only 2 custom hooks exist:
  1. **`useProjectId()`** - Manages `?projectId=` URL param with `setProjectId()` and `clearProjectId()` via `router.replace` with `{ scroll: false }`
  2. **`useIsMobile()`** - Responsive breakpoint using `window.matchMedia("(max-width: 767px)")`
  
  **No custom data fetching hooks** - all pages use Convex hooks directly.

- [x] **What's in the `src/hooks/` directory?** Exactly 2 files:
  - `useProjectId.ts` (URL state management)
  - `use-mobile.tsx` (responsive breakpoint)

- [x] **What's in the `src/context/` directory?** Exactly 1 file:
  - `ProjectContext.tsx` - Combines Clerk org state (`useOrganization`), URL-based project selection (`useProjectId`), Convex queries (`useQuery(api.projects.list)`), and derived `activeProject`

- [x] **How is form state managed?** Manual patterns (NOT react-hook-form):
  - **Simple**: Individual `useState` per field
  - **Medium**: Single object `useState` with spread updates
  - **Complex**: Typed `useReducer` (Widget config: 12 action types, 680 lines; WidgetChat: 12 action types state machine; Orders/Contacts import: import state machine with CSV/XLSX/JSON parsing)
  - shadcn `form.tsx` provides `FormProvider`, `FormField`, `useFormField` but `useForm` and `zodResolver` are NEVER used

- [x] **How is URL search params used for state?** 18 locations use `useSearchParams`:
  - **Project selection**: `?projectId=` (useProjectId hook)
  - **Chat**: `?conversationId=` (ChatShell, ChatArea, ConversationList)
  - **Design Studio**: `?project=`, `?node=` (BotEditorClient, FlowToolbar, NodePropertiesPanel)
  - **Waitlist**: `?ref=` referral tracking
  - Pattern: `router.replace(`${pathname}?${params.toString()}`, { scroll: false })`

- [x] **Are there any caching patterns?** Convex is the sole caching layer:
  - NO SWR, React Query, Zustand, Redux, or manual caches
  - Convex queries auto-cache and re-execute on DB changes
  - `"skip"` pattern serves as conditional cache key
  - API route uses Next.js cache: `next: { revalidate: 60 }` (widget endpoint)

- [x] **How is pagination state handled?** Convex `usePaginatedQuery`:
  ```typescript
  const { results: messages, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip",
    { initialNumItems: 30 }
  )
  ```
  - Backend uses `paginationOptsValidator`
  - Status: `"LoadingFirstPage"`, `"LoadingMore"`, `"Exhausted"`
  - Client-side: `@tanstack/react-table` for sorting/filtering within loaded page

- [x] **Is there infinite scroll or load more?** Load More button pattern (NOT infinite scroll):
  ```typescript
  {status !== "Exhausted" && !isLoading && (
    <Button onClick={() => loadMore(50)} disabled={status === "LoadingMore"}>
      Load more
    </Button>
  )}
  ```
  Used in: history (50), activities (25), dashboard home (5), chat messages (30), KB sources

- [x] **How are errors surfaced to UI?** Three mechanisms:
  1. **Sonner toast** (primary): `toast.error(errorMessage)` in try/catch around mutations
  2. **Local error state**: WidgetChat `dispatch({ type: "SET_ERROR", payload })`
  3. **Error boundaries**: 12 `error.tsx` files with `ErrorFallback` component
  4. **Loading spinner for unknown state**: `<Loader2 className="animate-spin" />`

- [x] **Are there any derived state patterns?** `useMemo` used sparingly (12 occurrences):
  - Node position initialization (BotEditorClient)
  - Date format computations (analytics page)
  - Node data extraction (NodePropertiesPanel)
  - Styled nodes mapping (FlowEditor)
  - Execution log extraction (DebuggerPanel)
  - Sidebar context value
  - Most data comes directly from Convex without transformation

## 📝 Agent Findings

### Convex as Single Source of Truth
The project uses Convex exclusively for data management. No SWR, React Query, Zustand, Redux, or any alternative state library exists. This is a clean, unified approach where:
- Convex handles server data, caching, revalidation, and real-time updates
- React local state handles UI-only state (form fields, dialogs, toggles)
- URL search params handle cross-component shared state (project, conversation selection)

### ProjectContext Pattern
`ProjectContext` is the single custom context, and it's cleverly designed:
```typescript
export function ProjectProvider({ children }) {
    const { isLoaded: isOrgLoaded } = useOrganization()  // Clerk
    const { projectId: urlProjectId, setProjectId } = useProjectId()  // URL
    const projectsResult = useQuery(api.projects.list)  // Convex
    const projects = projectsResult ?? []
    
    const activeProject = projects.length > 0
        ? urlProjectId
            ? projects.find(p => p._id === urlProjectId) ?? projects[0]  // URL first, fallback to first
            : projects[0]
        : null
    
    const isLoading = !isOrgLoaded || projectsResult === undefined
    // ...
}
```
This combines 3 state sources (Clerk org, URL param, Convex query) into a single `activeProject` derived value.

### Optimistic Update Patterns
Three optimistic update patterns are used consistently:

**Create pattern** (append to list):
```typescript
let nextTempId = 0;
.withOptimisticUpdate((localStore, args) => {
    const existing = localStore.getQuery(api.bots.list, { projectId: args.projectId });
    if (existing) {
        const id = `temp_${(nextTempId++).toString(36)}`;
        localStore.setQuery(api.bots.list, { projectId: args.projectId }, [...existing, tempItem]);
    }
})
```

**Update pattern** (map over all cached queries):
```typescript
.withOptimisticUpdate((localStore, args) => {
    const allQueries = localStore.getAllQueries(api.bots.list);
    for (const q of allQueries) {
        if (q.value) {
            localStore.setQuery(api.bots.list, q.args,
                (q.value as Doc<"bots">[]).map((b) => b._id === args.id ? { ...b, ...args } : b));
        }
    }
})
```

**Delete pattern** (filter from all cached queries):
```typescript
.withOptimisticUpdate((localStore, args) => {
    const allQueries = localStore.getAllQueries(api.bots.list);
    for (const q of allQueries) {
        if (q.value) {
            localStore.setQuery(api.bots.list, q.args,
                (q.value as Doc<"bots">[]).filter((b) => b._id !== args.id));
        }
    }
})
```

### Form State - Notable Absence
`react-hook-form` and Zod are NOT used despite:
- shadcn `form.tsx` providing `FormProvider`, `FormField`, `useFormField` infrastructure
- Complex forms like widget settings (680 lines) and integration configuration
- Multiple import wizards with state machines

All forms use manual `useState`/`useReducer` with no schema validation, no automatic error display, no form-level validation state.

### WidgetChat State Machine
The most complex state management is in WidgetChat:
- `useReducer` with 12 action types: `SET_PROJECT_ID`, `SET_CONVERSATION_ID`, `SET_MESSAGES`, `SET_INPUT`, `SET_LOADING`, `SET_ERROR`, `SET_PROJECT_CONFIG`, `SET_CONVERSATION_STATUS`, `SET_SHOW_RATING`, `SET_SHOW_PRE_CHAT`, `SET_PRE_CHAT_DATA`, `SET_IS_UPLOADING`
- Manual optimistic message insertion with temp IDs
- Rollback on failure
- Pre-chat form state, file upload state, rating state all managed in single reducer

### Minimal Custom Hooks
Only 2 custom hooks exist. This is notably sparse for a project of this size. Most pages use Convex hooks directly without abstraction. This means:
- No reusable data fetching hooks
- No custom mutation hooks
- No abstracted loading/error state patterns
- Direct coupling between pages and Convex API

## 🔍 Key Patterns to Identify

- **Convex-only data layer**: No alternative state management libraries
- **"skip" conditional pattern**: Queries conditionally run when prerequisites met
- **Optimistic CRUD**: `.withOptimisticUpdate()` on all create/update/delete mutations
- **URL state via search params**: Project, conversation, design studio selection
- **Manual form state**: useState/useReducer, no react-hook-form or Zod
- **ProjectContext triad**: Clerk org + URL param + Convex query = activeProject
- **Load more pagination**: Explicit button, not infinite scroll
- **Sonner toast errors**: Primary error surfacing mechanism
- **Minimal custom hooks**: Only 2 (useProjectId, useIsMobile)

## ⚠️ Potential Concerns

| Severity | Concern |
|----------|---------|
| **HIGH** | **No form validation** - `react-hook-form` and Zod are NOT used. All forms (widget settings 680 lines, integration config, contact dialogs, order forms) use manual `useState`/`useReducer` with no schema validation, no client-side validation, no error messages on invalid fields, no form-level validation state. This creates poor UX and potential for invalid data submission. |
| **HIGH** | **Only 2 custom hooks** - For a project with 37 pages and complex data fetching, having only `useProjectId` and `useIsMobile` as custom hooks means zero abstraction over data fetching. Every page directly uses `useQuery`/`useMutation`/`usePaginatedQuery` with duplicated skip patterns, loading checks, and error handling. No reusable `useBots`, `useContacts`, `useOrders` hooks exist. |
| **MEDIUM** | **No loading state for some pages** - `departments`, `operating-hours`, `webhooks`, `history`, `requests` pages lack `loading.tsx` files. May cause layout shift or jarring UX on slow connections. |
| **MEDIUM** | **Analytics page `useAction` + `useEffect` anti-pattern** - 6 `useAction` calls with manual `useEffect` + `isMounted` guard + `useState` for data storage. This is a verbose pattern that should be abstracted into a custom hook like `useAnalyticsData()`. |
| **MEDIUM** | **WidgetChat manual optimistic updates** - WidgetChat uses manual `useReducer` dispatch with temp IDs instead of Convex's `.withOptimisticUpdate()`. This means optimistic messages aren't synced with Convex's reactive system and could lead to inconsistencies if the server state diverges. |
| **LOW** | **No global loading indicator** - Each route has its own `loading.tsx` but no top-level loading bar (like NProgress) for navigation transitions. Users may not know a navigation is in progress. |
| **LOW** | **No derived state conventions** - `useMemo` used inconsistently (12 occurrences) with no pattern for derived data transformations. Could benefit from standard `useDerivedQuery` pattern for common transformations. |
| **LOW** | **ProjectContext tightly couples 3 concerns** - Clerk org state, URL params, and Convex queries all combined in one context. If a page needs only project list without active project selection, it must still go through the context or duplicate the Convex query. |
