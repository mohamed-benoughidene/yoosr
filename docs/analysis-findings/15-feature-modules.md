# Part 15: Feature Modules - Findings

## 📊 Visual Map

```
Feature Domains
├── User Management
│   ├── Authentication    → Clerk (useAuth, useUser, useOrganization)
│   ├── Profiles          → convex/profiles.ts (ensureCurrent, list, updateHeartbeat)
│   └── Settings          → Dashboard settings section (8 sub-pages)
│
├── Bot/AI Features
│   ├── Bot Management    → convex/bots.ts (list, create, update, remove, activate, deactivate, duplicate)
│   ├── Bot Types         → Chatbot (agents) vs Automation (flows)
│   ├── Design Studio     → Visual flow builder with node graph (src/components/design-studio/)
│   ├── AI Integration    → convex/openrouter.ts, convex/openrouter_api.ts
│   └── Conversations     → convex/conversations.ts (list, listResolved, update, resolve)
│
├── Contact Management
│   ├── Contacts          → convex/contacts.ts (list, create, update, remove, batchImport)
│   ├── Import/Export     → CSV (papaparse), XLSX (xlsx), JSON formats
│   └── Tags/Labels       → Contact tags displayed as badges in table
│
├── Project Management
│   ├── Projects          → convex/projects.ts (list, create, update, getWidgetConfig)
│   ├── Activity Logs     → convex/activityLogs.ts (getActivityLog)
│   ├── Analytics         → convex/analytics.ts (getConversationStats, getConversationVolume, getTokenUsage, getTagsSummary, getCSATSummary, getSLABreachRate, getCSATComments, getUnansweredQueries, getProjectUsage)
│   └── Dashboard         → convex/dashboard.ts (getHomeStats)
│
├── Messaging
│   ├── Messages          → convex/messages.ts (list, sendMessage, list with pagination)
│   ├── Conversations     → ChatShell with real-time updates
│   └── History           → Resolved conversation archive with search, date range, CSV export
│
├── Notifications
│   ├── Push              → PushNotificationInit in dashboard layout
│   └── In-app            → Toast via sonner (AppToaster in providers)
│
├── Orders/Commerce
│   └── Orders            → convex/orders.ts (listOrders, updateOrderStatus, deleteOrder, batchImportOrders)
│
├── Integrations
│   ├── Apps/Catalog      → convex/integrations.ts (list, upsert, saveChannelIntegration, registerTelegramWebhook)
│   ├── Channels          → Telegram, Messenger, Instagram, WhatsApp
│   ├── AI Providers      → OpenRouter (API key management, test connection, default model selection)
│   └── Webhooks          → Webhook configuration pages
│
├── Knowledge Base
│   ├── KB CRUD           → convex/knowledgeBases.ts (if exists)
│   └── Sources           → KB sources management per knowledge base
│
├── Support/Requests
│   ├── Request Queue     → Unassigned, Assigned to Me, Bot Escalated filters
│   ├── Departments       → convex/settings.ts (getMyDepartments)
│   └── Assignment        → Assign to Me, Resolve actions
│
└── Widget
    ├── Embed Widget      → /widget route with session management
    ├── Configuration     → Settings/widget page with live preview
    └── API               → /api/widget/project (CORS-enabled, 60s cache)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `convex/bots.ts` | Bot CRUD operations |
| `convex/contacts.ts` | Contact management with batch import |
| `convex/conversations.ts` | Conversation listing and management |
| `convex/messages.ts` | Message sending and listing with pagination |
| `convex/projects.ts` | Project CRUD and widget config |
| `convex/orders.ts` | Order management with import/export |
| `convex/integrations.ts` | Third-party integration management |
| `convex/openrouter.ts` | OpenRouter AI integration |
| `convex/openrouter_api.ts` | OpenRouter API key management |
| `convex/profiles.ts` | User profiles and heartbeats |
| `convex/activityLogs.ts` | Activity logging |
| `convex/analytics.ts` | Analytics data endpoints |
| `convex/dashboard.ts` | Dashboard home stats |
| `convex/settings.ts` | Settings data (departments, canned responses, etc.) |
| `convex/schema.ts` | Database schema definition |
| `src/app/[locale]/dashboard/` | Frontend dashboard feature pages |
| `src/app/[locale]/design-studio/` | Frontend bot editor |
| `src/components/design-studio/` | Visual flow builder components |
| `src/app/widget/` | Embeddable widget |
| `src/config/apps.ts` | Integration app catalog (AVAILABLE_APPS) |

## ✅ Analysis Checklist

- [x] **What are the main feature domains?** 9 feature domains identified:
  1. **User/Auth** - Clerk integration, profiles, heartbeat tracking
  2. **Bot Management** - Bot CRUD, activation/deactivation, duplication
  3. **Design Studio** - Visual flow builder with node graph
  4. **Contact Management** - Contacts with import/export (CSV/XLSX/JSON)
  5. **Messaging** - Real-time chat with pagination, conversation management
  6. **Analytics** - Conversation volume, token usage, CSAT, SLA, tags summary
  7. **Orders** - Order management with status tracking and import/export
  8. **Integrations** - Telegram, Messenger, Instagram, WhatsApp, OpenRouter
  9. **Widget** - Embeddable chat widget with configuration and live preview

- [x] **How is each feature structured? (frontend + backend)**
  - **Backend**: Each feature has a dedicated `convex/{feature}.ts` file exposing queries, mutations, and actions
  - **Frontend**: Each feature has `src/app/[locale]/dashboard/{feature}/page.tsx` + components in `src/components/{feature}/`
  - **Pattern**: Page → data fetching (Convex hooks) → feature components → UI rendering

- [x] **Are features isolated or coupled?** Features share common infrastructure:
  - All depend on `activeProject` from ProjectContext
  - All use the same `useQuery`/`useMutation` patterns
  - Integrations are shared across features (WhatsApp bot, OpenRouter for AI)
  - Conversations link bots, contacts, orders, and messages together
  - Not truly isolated - they share the Convex database and project context

- [x] **What's the AI/ML integration approach?** OpenRouter integration:
  - `convex/openrouter.ts` - OpenRouter API calls
  - `convex/openrouter_api.ts` - API key management (get, save, clear, test)
  - Settings page has dedicated OpenRouter section with API key input, test button, result display
  - Default model selector (OpenRouter Free models)
  - Bots use OpenRouter for AI responses in conversations

- [x] **How does the bot flow builder work?** Visual node-based editor:
  - `src/components/design-studio/` contains the flow builder UI
  - Node graph with drag-and-drop or click-to-connect
  - `FlowEditor` component with styled nodes mapping
  - `NodePropertiesPanel` for node configuration
  - `FlowToolbar` for flow actions
  - `DebuggerPanel` for execution log extraction
  - Bot types: Chatbot (agents) vs Automation (flows)

- [x] **What external services are integrated?** 4 channel integrations + 1 AI provider:
  - **Telegram** - Webhook registration via `registerTelegramWebhook` action
  - **Messenger** - Facebook Messenger channel
  - **Instagram** - Instagram DM channel
  - **WhatsApp** - Requires phone number ID, access token, verify token (UUID), app secret
  - **OpenRouter** - AI model provider for bot responses

- [x] **How are web push notifications implemented?** `PushNotificationInit` component in dashboard layout. Details of implementation not fully explored, but it's initialized once per dashboard session.

- [x] **Is there feature flagging?** NO feature flagging system found. Features are controlled by:
  - Admin-only actions (Clerk role checks)
  - "Pro" badges on features that may require subscription
  - "Coming Soon" badges for unreleased integrations
  - No LaunchDarkly, Unleash, or custom feature flag system

- [x] **How are feature-specific errors handled?** Two patterns:
  1. **Page-level**: Each feature route has `error.tsx` with `ErrorFallback`
  2. **Operation-level**: `toast.error(errorMessage)` in try/catch around mutations
  3. **Inline**: Loading spinner for undefined data, empty state for no results

- [x] **Are features independently testable?** Features are modular at the component level but tightly coupled through:
  - Shared `activeProject` dependency
  - Shared Convex database
  - Shared authentication (Clerk)
  - No feature-level mock providers or test isolation

- [x] **What's the data flow for each feature?**
  1. User authenticates via Clerk → ConvexProviderWithClerk gets auth tokens
  2. ProjectContext derives `activeProject` from Clerk org + URL param + Convex query
  3. Feature page uses `useQuery(api.{feature}.{operation}, activeProject ? { projectId } : "skip")`
  4. Mutations use `useMutation(api.{feature}.{operation}).withOptimisticUpdate()`
  5. Errors caught → `toast.error()`
  6. Success → `toast.success()`

- [x] **Are there shared feature utilities?** YES:
  - `src/lib/utils.ts` - `cn()` utility (clsx + tailwind-merge)
  - `src/config/apps.ts` - `AVAILABLE_APPS` catalog for integrations
  - `downloadBlob` helper for CSV/XLSX/JSON exports
  - `getSnippet()` function for widget code generation (9 platforms)

- [x] **How are feature permissions handled?** Via Clerk auth:
  - Middleware protects `/dashboard(.*)` and `/design-studio(.*)` routes
  - Admin-only actions in UI (e.g., CreateBotDialog, dropdown menu actions only for admins)
  - `useUser()` and `useOrganization()` hooks for role checks
  - No RBAC (role-based access control) beyond admin vs non-admin

- [x] **Is there analytics/telemetry per feature?** YES, dedicated analytics feature:
  - `convex/analytics.ts` exposes 9 endpoints:
    - `getConversationStats` - Stats cards data
    - `getConversationVolume` - Daily volume for bar chart
    - `getTokenUsage` - Token usage tracking
    - `getTagsSummary` - Tag distribution for pie chart
    - `getCSATSummary` - Customer satisfaction average
    - `getSLABreachRate` - SLA compliance
    - `getCSATComments` - Customer feedback comments
    - `getUnansweredQueries` - Unanswered bot queries
    - `getProjectUsage` - Usage/quota tracking
  - Activity logs via `convex/activityLogs.ts`
  - Heartbeat tracking via `api.profiles.updateHeartbeat` every 30 seconds

## 📝 Agent Findings

### Feature Backend Architecture
Each feature domain has a dedicated Convex file following a consistent pattern:
- **Queries** (`query`) - Read operations, reactive, auto-revalidating
- **Mutations** (`mutation`) - Write operations, with validation
- **Actions** (`action`) - External service calls (OpenRouter API, webhooks)

### Bot Feature (convex/bots.ts)
Exposes: `list`, `get`, `create`, `update`, `remove`, `activate`, `deactivate`, `duplicate`
- Bots belong to projects (projectId required)
- Two types: chatbot (agents) and automation (flows)
- Activation/deactivation controls bot availability
- Duplication clones bot configuration

### Contact Feature (convex/contacts.ts)
Exposes: `list`, `create`, `update`, `remove`, `batchImport`
- Batch import supports chunking (500 at a time)
- Frontend handles CSV (papaparse), XLSX (xlsx), JSON parsing
- Export via `downloadBlob` helper

### Messaging Feature (convex/messages.ts, conversations.ts)
- `messages.list` uses pagination via `paginationOptsValidator`
- `conversations.list` and `conversations.listResolved` separate active vs resolved
- `sendMessage` mutation with content validation
- Real-time updates via Convex reactive queries

### Orders Feature (convex/orders.ts)
Exposes: `listOrders`, `updateOrderStatus`, `deleteOrder`, `batchImportOrders`
- Order statuses: New, Confirmed, Cancelled (color-coded badges)
- Import/export same pattern as contacts (CSV/XLSX/JSON)
- Optimistic updates for status changes

### Integrations Feature (convex/integrations.ts)
Exposes: `list`, `upsert`, `saveChannelIntegration`, `registerTelegramWebhook`
- Catalog defined in `src/config/apps.ts` as `AVAILABLE_APPS`
- 4 channel integrations: Telegram, Messenger, Instagram, WhatsApp
- WhatsApp requires specialized setup (phone ID, access token, verify token, app secret)
- Pro badge on some integrations (requires subscription)

### OpenRouter AI Feature (convex/openrouter.ts, openrouter_api.ts)
Exposes: `getOpenRouterKeyStatus`, `saveOpenRouterKey`, `clearOpenRouterKey`, `testOpenRouterKey`
- API key management with test connection
- Default model selector (OpenRouter Free models)
- Used by bots for AI-powered responses

### Analytics Feature (convex/analytics.ts)
9 endpoints covering: conversation stats, volume, tokens, tags, CSAT, SLA, comments, unanswered, usage
- Uses `useAction` (not `useQuery`) for complex server-side computations
- Date range filtering (default: last 30 days)
- Charts: Bar chart (volume), Pie chart (tags)

### Widget Feature
- Embeddable via iframe or script tag
- 9 platform snippets generated: HTML, Next.js, React, Vue, Nuxt, Angular, WordPress, Shopify, Webflow, GTM
- `/api/widget/project` API endpoint (CORS-enabled, 60s cache)
- Configuration stored in project's `widgetConfig` field
- Live preview via iPhone-framed iframe

### Design Studio Feature
- Visual node-based flow builder
- Components: `FlowEditor`, `NodePropertiesPanel`, `FlowToolbar`, `DebuggerPanel`
- Node graph with drag-and-drop or click-to-connect
- Execution debugging via log extraction

### No Feature Flagging
Features are either fully available or gated by:
- Admin role checks (Clerk)
- "Pro" subscription badges
- "Coming Soon" placeholders
No A/B testing or gradual rollout capability exists.

## 🔍 Key Patterns to Identify

- **Convex feature files**: One .ts file per feature domain (bots, contacts, orders, etc.)
- **Query/Mutation/Action separation**: Read (query), Write (mutation), External (action)
- **Project-scoped data**: All feature queries require projectId filter
- **Optimistic CRUD**: Consistent `.withOptimisticUpdate()` across all features
- **Import/Export pattern**: CSV/XLSX/JSON with papaparse + xlsx libraries
- **Integration catalog**: `AVAILABLE_APPS` in `src/config/apps.ts`
- **Admin-gated actions**: UI shows/hides actions based on Clerk admin role
- **Analytics via useAction**: Complex computations handled by server actions, not queries

## ⚠️ Potential Concerns

| Severity | Concern |
|----------|---------|
| **HIGH** | **No feature flagging** - No system for gradual rollout, A/B testing, or emergency feature disable. All features are either fully deployed or require code changes to disable. "Coming Soon" badges are hardcoded, not dynamically controlled. |
| **HIGH** | **Tightly coupled features** - All features depend on shared `activeProject` from ProjectContext and share the same Convex database. No feature isolation means a breaking change in one feature (e.g., contacts schema) could affect others. No feature-level error boundaries. |
| **MEDIUM** | **No rate limiting for AI calls** - OpenRouter API calls via bots have no apparent rate limiting or quota enforcement. Could lead to unexpected costs if a bot is heavily used. |
| **MEDIUM** | **WhatsApp integration complexity** - WhatsApp requires 4 configuration values (phone number ID, access token, verify token, app secret) with no validation guidance. Users may misconfigure this. |
| **MEDIUM** | **No fallback for external service failures** - If OpenRouter API is down, bots have no fallback model or graceful degradation. If webhook registration fails (Telegram), there's no retry mechanism. |
| **MEDIUM** | **Activity logs may grow unbounded** - `convex/activityLogs.ts` stores logs with no apparent retention policy or cleanup. Could lead to database bloat over time. |
| **LOW** | **Pro badges without enforcement** - "Pro" badges on integrations and features suggest subscription gating, but no actual enforcement mechanism found (no Stripe integration, no subscription checks). |
| **LOW** | **No per-feature analytics** - Analytics is project-level only. No per-feature usage tracking (e.g., how many bots created, how many contacts imported, which integrations are most used). |
| **LOW** | **Heartbeat every 30 seconds** - `api.profiles.updateHeartbeat` fires every 30 seconds in DashboardShell. For large orgs with many active users, this could be significant Convex function call volume. |
