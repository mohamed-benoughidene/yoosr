# Part 14: State Management & Data Fetching — Analysis Findings

## 📊 Visual Map

```
State Management Layers (Actual Implementation)
├── Convex Client (Primary Data Layer)
│   ├── ConvexClientProvider.tsx → Wraps app with Clerk + ConvexProviderWithClerk
│   ├── useQuery()               → Used in ~25+ components/pages
│   ├── useMutation()            → Used in ~25+ components/pages
│   ├── usePaginatedQuery()      → Used in 3 pages (dashboard, history, activities)
│   ├── useAction()              → Used sparingly (analytics, integrations)
│   └── Optimistic updates       → Manual pattern (WidgetChat only)
│
├── React Context
│   ├── ProjectContext.tsx       → Custom context for project state (useQuery + useMutation)
│   ├── SidebarContext           → From shadcn/ui sidebar component
│   ├── FormFieldContext         → From shadcn/ui form components
│   ├── FormItemContext          → From shadcn/ui form components
│   └── ToggleGroupContext       → From shadcn/ui toggle-group component
│
├── Component-Level State
│   ├── useState()               → Ubiquitous throughout codebase
│   ├── useReducer()             → Used in 5 locations:
│   │   ├── WidgetChat.tsx (chat state machine)
│   │   ├── widget/settings/page.tsx (widget config)
│   │   ├── departments/page.tsx (department management)
│   │   ├── contacts/page.tsx (import state)
│   │   ├── orders/page.tsx (import state)
│   │   └── conversation-list.tsx (filter state)
│   └── useMemo/useCallback      → Heavy usage in design studio, analytics
│
├── Custom Hooks
│   └── useIsMobile (src/hooks/) → Only 1 custom hook in src/hooks/
│
├── Form State
│   └── react-hook-form          → Used via shadcn form.tsx utilities
│                                  (FormField, FormItem, FormLabel, etc.)
│
├── URL State
│   └── useSearchParams()        → Used in ~12 components for routing/state
│   └── usePathname()            → Used in ~5 components for nav highlighting
│
└── Error Handling
    ├── Error boundaries         → Per-route error.tsx files (~8 files)
    ├── ErrorFallback component  → Reusable error UI with reset + home link
    └── try/catch                → In mutation handlers (e.g., ProjectContext)
```

## 📁 File Inventory

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/hooks/use-mobile.tsx` | Mobile viewport detection hook | ✅ Found |
| `src/context/ProjectContext.tsx` | Project/org state management via Convex | ✅ Found |
| `src/components/ConvexClientProvider.tsx` | Root provider: Clerk + Convex integration | ✅ Found |
| `src/components/error-fallback.tsx` | Reusable error boundary fallback UI | ✅ Found |
| `src/app/providers.tsx` | App-level providers | ❌ Not found — providers in `src/components/ConvexClientProvider.tsx` |
| `convex/` (45 files) | Convex queries, mutations, actions | ✅ Found |
| `src/components/ui/form.tsx` | shadcn react-hook-form wrappers | ✅ Found |

## ✅ Analysis Checklist

### How is Convex integrated with React?
**[x]** Convex is integrated via `ConvexClientProvider.tsx` which:
- Creates a `ConvexReactClient` from `NEXT_PUBLIC_CONVEX_URL`
- Uses `ConvexProviderWithClerk` from `convex/react-clerk` to combine Clerk auth with Convex
- Wraps the entire app tree with `<ClerkProvider>` + `<ConvexProviderWithClerk>`
- Handles locale-aware Clerk localization (ar, en, fr)
- Gracefully handles missing Convex URL during static build (renders children without Convex)
- Locale-aware URLs for Clerk sign-in/sign-up redirects

### What's the data fetching strategy? (useQuery patterns)
**[x]** The codebase uses **Convex's reactive real-time queries** exclusively:
- **`useQuery()`** is used in ~25+ components/pages for real-time data fetching
- Queries automatically re-run when underlying data changes (Convex reactivity)
- Pattern: `const data = useQuery(api.module.function, args)` or `"skip"` for conditional queries
- Conditional querying pattern: `useQuery(api.bots.get, botId ? { id: botId } : "skip")`
- Data filtering is done client-side in most cases (e.g., history page filters conversations in-memory)
- No separate caching layer — Convex handles caching automatically
- No use of SWR, React Query, or other third-party data fetching libraries

### Are mutations using useMutation()?
**[x]** Yes, mutations are handled via `useMutation()` from `convex/react`:
- Used in ~25+ components/pages
- Typical pattern: 2-4 mutations per component (create, update, delete)
- Examples:
  - `bots/page.tsx`: 3 mutations (create, update, remove)
  - `departments/page.tsx`: 5 mutations (create, add/remove member, update, remove)
  - `webhooks/page.tsx`: 3 mutations (create, update, remove)
- Mutations are called directly in event handlers
- No wrapper hooks around mutations — components call `useMutation` directly

### Is optimistic UI updates implemented?
**[x]** **Partially implemented — only in WidgetChat.tsx**:
- In `WidgetChat.tsx` (line ~373): Manual optimistic update pattern
  - Creates temp message with `temp_` + timestamp ID
  - Dispatches to reducer immediately before server call
  - Rolls back on error by filtering out temp message
- **No optimistic updates in dashboard components** — all mutations wait for server response
- Convex supports optimistic updates via `optimisticUpdate` option in mutations, but this is NOT used anywhere in the codebase
- This is a **significant gap** — dashboard UI feels laggy during mutations

### How is loading state tracked?
**[x]** Loading state is tracked via multiple patterns:
1. **Convex `undefined` check**: `data === undefined` means loading (Convex convention)
2. **usePaginatedQuery status**: `"LoadingFirstPage"`, `"LoadingMore"`, `"Exhausted"`, `"Ready"`
3. **ProjectContext**: Combines Clerk org loading (`isOrgLoaded`) + Convex query result (`projectsResult === undefined`)
4. **Component-level `useState`**: Many pages have `const [loading, setLoading] = useState(false)` for mutation operations
5. **Derived loading in components**: e.g., `const isLoading = status === "LoadingFirstPage"` in history page
6. **Skeleton components**: Used in analytics charts (`<Skeleton>` from shadcn)

### Are there custom hooks for data fetching?
**[x]** **No custom data fetching hooks exist.**
- The only hook in `src/hooks/` is `useIsMobile` (UI-only hook)
- All data fetching logic is directly in components
- No `useBots`, `useProjects`, `useConversations` wrapper hooks
- This means every component re-implements its own query + loading + error logic
- **Concern**: Duplicated logic across components (e.g., projectId checks, skip patterns)

### What's in the `src/hooks/` directory?
**[x]** Only one file:
- `src/hooks/use-mobile.tsx`: Responsive breakpoint hook (768px) using `window.matchMedia`
  - Returns boolean indicating if viewport is mobile-sized
  - Handles resize events and cleanup
  - No data fetching hooks exist here

### What's in the `src/context/` directory?
**[x]** Only one file:
- `src/context/ProjectContext.tsx`:
  - Provides `projects`, `activeProject`, `isLoading`, `createProject`
  - Uses `useQuery(api.projects.list)` and `useMutation(api.projects.create)` internally
  - `activeProject` is hardcoded as `projects[0]` (first project in org)
  - Integrates with Clerk's `useOrganization()` for org-aware loading state
  - Has proper error handling with try/catch in `createProject`
  - **Design issue**: No way to select/change active project — always first in list

### How is form state managed? (react-hook-form)
**[x]** Form state is managed via `react-hook-form` with shadcn/ui form components:
- `src/components/ui/form.tsx` provides: `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`
- Uses `useFormField()` internal hook for field context
- Integrates with Zod v4 for validation (`@hookform/resolvers`)
- Form components are shadcn/ui standard patterns
- Forms use `useForm()` from react-hook-form with Zod resolver
- Examples: PreChatForm in widget, various settings forms

### Is there global state beyond Convex?
**[x]** Yes:
1. **ProjectContext**: Global project/org state (React Context)
2. **URL state**: `useSearchParams()` used for projectId, conversationId, etc. — acts as shared state
3. **No Zustand/Redux/Jotai**: No dedicated global state library beyond Convex + Context
4. **useReducer in components**: Complex local state managed via reducers (WidgetChat, widget settings, departments)
5. **Clerk auth state**: Organization, user auth state from Clerk

### How is URL search params used for state?
**[x]** URL search params are used extensively for cross-component state sharing:
- **`projectId`**: Passed via `?project=` param in design studio (used in 4+ files)
- **`conversationId`**: Used in chat components to track active conversation
- **Design studio**: `searchParams.get("project")` for project identification
- **Chat shell**: `searchParams.get("conversationId")` for conversation selection
- **Conversation list**: Reads `conversationId` from URL to highlight active convo
- **Node properties panel**: Gets projectId from URL for API calls
- **Flow toolbar**: Gets projectId from URL for navigation
- Pattern: Components read search params directly rather than using context

### Are there any caching patterns?
**[x]** Caching is handled entirely by Convex:
- Convex automatically caches query results and invalidates on data changes
- No manual caching (no React Query cache, no SWR staleTime, no localStorage caching)
- No memoization of fetched data beyond React's default behavior
- `useMemo` is used for derived state computations (not for caching fetch results)
- No `keepPreviousData` or similar patterns

### How is pagination state handled?
**[x]** Pagination uses Convex's `usePaginatedQuery`:
- **3 pages use pagination**:
  1. `dashboard/page.tsx`: `usePaginatedQuery` for recent activities (50 items)
  2. `dashboard/history/page.tsx`: `usePaginatedQuery` for resolved conversations (50 items)
  3. `dashboard/activities/page.tsx`: `usePaginatedQuery` for activity logs
- Pattern: `{ results, status, loadMore } = usePaginatedQuery(api.module.fn, args, { initialNumItems: 50 })`
- Load more button: `loadMore(50)` triggered manually
- Status states checked: `"LoadingFirstPage"`, `"LoadingMore"`, `"Exhausted"`, `"Ready"`
- **No infinite scroll** — all pagination is "load more" button based
- Loading spinner shown during `LoadingMore` state

### Is there infinite scroll or load more?
**[x]** **Load more only** — no infinite scroll:
- History page: Manual "Load more" button with loading spinner
- Dashboard page: Same pattern
- Activities page: Same pattern
- No intersection observer or scroll-based pagination

### How are errors surfaced to UI?
**[x]** Multiple error handling strategies:
1. **Route-level error boundaries**: `error.tsx` files in ~8 route segments
   - All use shared `ErrorFallback` component
   - Provides "Try again" (reset) and "Go home" buttons
   - Animated error card with alert icon
2. **Component-level try/catch**: In mutation handlers
   - `ProjectContext.createProject`: Returns `null` on error, logs to console
   - `WidgetChat`: Dispatches error state to reducer, shows error message
3. **Convex query errors**: `undefined` results handled as loading or empty states
4. **Form errors**: Via react-hook-form + Zod validation errors displayed inline
5. **Toast notifications**: `sonner` library is installed but not widely used for errors
6. **No global error boundary**: Each route has its own error.tsx

### Are there any derived state patterns?
**[x]** Yes, several derived state patterns:
1. **useMemo for computations**:
   - `BotEditorClient.tsx`: `useMemo` for node position calculations
   - `NodePropertiesPanel.tsx`: `useMemo` for node data extraction
   - `FlowEditor.tsx`: `useMemo` for styled nodes
   - `DebuggerPanel.tsx`: `useMemo` for execution log extraction
   - `analytics/page.tsx`: `useMemo` for default date calculations
2. **Client-side filtering**:
   - History page: Filters conversations by search + date range in-memory
   - Requests page: Filters by agent assignment
3. **Reducer-derived state**:
   - WidgetChat: Complex state machine with 11 action types
   - Widget settings: Reducer for form configuration state
   - Departments: Reducer for department CRUD state
4. **Context-derived loading**: `ProjectContext.isLoading` combines Clerk + Convex loading states

## 📝 Agent Findings

### State Management Architecture Summary

The application follows a **Convex-first architecture** where Convex serves as the primary data layer, replacing traditional patterns like React Query, SWR, or manual fetch + useState. React Context is used sparingly (only ProjectContext for org/project state). Complex local state is managed via `useReducer` in specific components.

### Custom Hook Patterns

**Finding**: The codebase has virtually no custom hooks beyond the shadcn/ui library hooks.
- Only `useIsMobile` exists in `src/hooks/`
- No data fetching hooks (e.g., `useBots`, `useContacts`)
- Every component calls `useQuery`/`useMutation` directly
- **Missed opportunity**: Reusable hooks for common patterns like projectId validation, skip logic, loading state combinations

### Form State Management

**Finding**: Forms use react-hook-form + Zod v4 via shadcn/ui form components.
- Standard shadcn pattern with FormField, FormItem, etc.
- Context-based field state sharing (FormFieldContext, FormItemContext)
- Validation errors handled inline via FormMessage component
- PreChatForm in widget is an example of a complete form implementation

### URL State Management

**Finding**: URL search params act as a de facto state management system.
- `projectId` passed via URL rather than context (design studio)
- `conversationId` shared between chat components via URL
- Components read search params directly (no wrapper hooks like `useProjectId()`)
- This creates tight coupling between URL structure and component logic

### Optimistic Updates

**Finding**: Only one component implements optimistic updates (WidgetChat).
- Manual pattern with temp IDs and rollback on error
- Dashboard mutations are all synchronous (no optimistic UI)
- Convex's built-in `optimisticUpdate` feature is NOT utilized
- This is a significant UX gap for a real-time application

### Error Handling

**Finding**: Error handling is consistent but superficial.
- All route error.tsx files use the same ErrorFallback component
- ErrorFallback is well-designed (animated, has reset + home actions)
- However, Convex query errors are not explicitly handled — undefined results treated as loading
- No error boundaries inside components (only at route level)
- Console.error used in ProjectContext but no user-facing error toast

## 🔍 Key Patterns to Identify

### Data Fetching Philosophy
- **Convex-native**: All data fetching goes through Convex's reactive system
- No third-party data fetching libraries (no React Query, SWR, Apollo)
- Real-time subscriptions are automatic (Convex re-runs queries on data changes)
- Conditional queries via `"skip"` pattern

### Optimistic UI Approach
- **Minimal**: Only WidgetChat implements optimistic updates
- Manual pattern with temp IDs and rollback
- No use of Convex's built-in optimistic update features
- Dashboard operations all wait for server confirmation

### Custom Hook Patterns
- **Almost non-existent**: Only `useIsMobile` in src/hooks/
- No abstraction over Convex queries/mutations
- Direct `useQuery`/`useMutation` calls in every component
- URL param reading done directly (no wrapper hooks)

### Form State Management
- react-hook-form + Zod v4 via shadcn/ui components
- Standard shadcn form field pattern with context
- Validation errors displayed inline
- PreChatForm is a reference implementation

### Loading and Error State Strategies
- Loading: `data === undefined` convention from Convex
- Pagination: `usePaginatedQuery` with status-based loading indicators
- Errors: Route-level error boundaries + component-level try/catch
- Consistent use of Skeleton components for loading states
- ErrorFallback component provides good UX for route-level errors

## ⚠️ Potential Concerns

### HIGH Severity

1. **No optimistic updates in dashboard**
   - All mutations (create, update, delete) wait for server response before updating UI
   - Creates a laggy feel, especially on slower connections
   - Convex supports this natively via `optimisticUpdate` option — should be utilized
   - Affects: bots, departments, labels, webhooks, contacts, orders pages

2. **No custom data fetching hooks**
   - Every component re-implements the same patterns: `useQuery(api.x.y, activeProject ? { projectId } : "skip")`
   - No abstraction over projectId validation, skip logic, or loading state combinations
   - Leads to code duplication and inconsistency
   - Should have hooks like `useBots()`, `useDepartments()`, etc.

3. **ActiveProject always returns first project**
   - `ProjectContext.tsx` line 40: `const activeProject = projects.length > 0 ? projects[0] : null`
   - No way to switch between projects
   - No project selection UI in the application
   - This is a fundamental limitation for multi-project orgs

### MEDIUM Severity

4. **Client-side filtering on large datasets**
   - History page filters conversations in-memory (search + date range)
   - This doesn't scale if the dataset grows
   - Should use Convex query filtering instead
   - Currently pagination loads 50 items, but filtering happens on those 50 only

5. **URL search params used as shared state without abstraction**
   - Multiple components read `searchParams.get("project")` directly
   - No wrapper hook like `useProjectId()` to encapsulate this logic
   - Creates tight coupling between URL structure and component implementation
   - Hard to change URL structure later

6. **No toast notifications for errors**
   - `sonner` library is installed but barely used
   - Errors in mutations often only logged to console
   - User may not know when operations fail
   - Should show toast notifications for create/update/delete failures

7. **ProjectContext loading combines two async sources**
   - Clerk's `isOrgLoaded` + Convex's `projectsResult === undefined`
   - Edge case: What if Clerk says org is loaded but Convex returns no projects?
   - This state (org loaded, no projects) is treated as "loading" but should be a valid state

### LOW Severity

8. **Only one hook in src/hooks/**
   - `useIsMobile` is the only custom hook
   - Good candidates for new hooks: `useProjectId()`, `useConversationId()`, `useBots()`, etc.

9. **No infinite scroll**
   - All pagination is "load more" button based
   - Users must manually click to load more data
   - Infinite scroll via intersection observer would improve UX

10. **Inconsistent error handling in mutations**
    - ProjectContext: try/catch returns null
    - WidgetChat: try/catch dispatches error to reducer
    - Other pages: No error handling on mutations at all
    - Should standardize error handling pattern

---

**Analysis Date**: 2026-04-05
**Files Analyalyzed**: 45+ files across convex/, src/hooks/, src/context/, src/components/, src/app/
**Key Technologies**: Convex (data layer), React 19, Clerk (auth), react-hook-form, shadcn/ui
