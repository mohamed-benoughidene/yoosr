# Part 07: Authentication & Authorization

## 📊 Visual Map

```
convex/
├── auth.config.ts              → Convex ↔ Clerk JWT verification config
├── types.ts                    → ClerkIdentity type (subject, org_id, org_role)
├── utils.ts                    → requireAdmin(), assertProjectOwnership(), checkProjectOwnership()
├── errors.ts                   → authError(), forbiddenError(), userError(), notFoundError()
├── profiles.ts                 → User profile CRUD, presence/heartbeat, Clerk webhook sync
├── http.ts                     → Clerk webhook handler (/clerk-webhook) with Svix signature verification
│
├── [43 backend files]          → 73+ ctx.auth.getUserIdentity() calls across queries/mutations
│   ├── projects.ts             → Org-scoped project CRUD, requireAdmin on update
│   ├── conversations.ts        → Auth checks on all mutations, identity.subject for actions
│   ├── webhooks.ts             → requireAdmin on CRUD, HMAC-signed outbound deliveries
│   ├── departments.ts          → requireAdmin on all write operations
│   ├── integrations.ts         → requireAdmin on upsert/delete
│   ├── cannedResponses.ts      → requireAdmin on create/update/delete
│   ├── labels.ts               → requireAdmin on create/update/delete
│   ├── bots.ts                 → requireAdmin on create/update/delete
│   ├── orders.ts               → requireAdmin on delete/import
│   └── operatingHours.ts       → requireAdmin on upsert
│
└── convex.config.ts            → Rate limiter component (used in http.ts for widget endpoints)

External Auth Provider
└── @clerk/*
    ├── @clerk/nextjs            → ClerkProvider, clerkMiddleware, useAuth, useUser, useOrganization
    ├── @clerk/localizations     → arSA, enUS, frFR localization packs
    └── @clerk/themes            → (dependency present, not actively used in code)

src/
├── middleware.ts                → clerkMiddleware with protected route matcher
├── components/
│   └── ConvexClientProvider.tsx → ClerkProvider + ConvexProviderWithClerk wiring
└── app/[locale]/dashboard/
    └── DashboardShell.tsx       → ensureProfile + heartbeat on mount
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | Convex authentication configuration — single Clerk JWT provider with `CLERK_JWT_ISSUER_DOMAIN` env var |
| `convex/types.ts` | `ClerkIdentity` type definition with `subject`, `org_id`, `org_role` fields |
| `convex/utils.ts` | `requireAdmin()` role check, `assertProjectOwnership()` and `checkProjectOwnership()` org isolation helpers |
| `convex/errors.ts` | Standardized error factories: `authError()`, `forbiddenError()`, `userError()`, `notFoundError()` |
| `convex/profiles.ts` | User profile management: `getMe`, `ensureCurrent`, `upsertFromClerk`, `setAvailability`, `updateHeartbeat`, `cleanupStalePresence` |
| `convex/http.ts` | HTTP routes including Clerk webhook (`/clerk-webhook`) with Svix verification, Meta webhook with HMAC-SHA256, Telegram webhook with secret token, widget endpoints with rate limiting |
| `convex/projects.ts` | Project CRUD with org-scoped authorization; `requireAdmin` on `update` |
| `convex/conversations.ts` | Conversation operations with auth guards on all public mutations |
| `convex/webhooks.ts` | Outbound webhook subscriptions with `requireAdmin` on all CRUD mutations |
| `convex/departments.ts` | Department management with `requireAdmin` on all write operations |
| `convex/integrations.ts` | Channel integrations with `requireAdmin` on upsert/delete |
| `convex/cannedResponses.ts` | Quick replies with `requireAdmin` on create/update/delete |
| `convex/labels.ts` | Label management with `requireAdmin` on create/update/delete |
| `convex/bots.ts` | Bot management with `requireAdmin` on create/update/delete |
| `convex/orders.ts` | Order management with `requireAdmin` on delete/import |
| `convex/operatingHours.ts` | Business hours with `requireAdmin` on upsert |
| `src/middleware.ts` | Next.js middleware — Clerk auth guard for `/dashboard(.*)` and `/design-studio(.*)` routes |
| `src/components/ConvexClientProvider.tsx` | Wires `ClerkProvider` → `ConvexProviderWithClerk` with locale-aware redirect URLs |
| `src/app/[locale]/dashboard/DashboardShell.tsx` | Calls `profiles.ensureCurrent` and 30s heartbeat on mount |
| `package.json` | Clerk deps: `@clerk/nextjs`, `@clerk/localizations`, `@clerk/themes` |

## ✅ Analysis Checklist

- [x] **What authentication provider is used? (Clerk)**
  Clerk is the sole authentication provider. The `@clerk/nextjs` package handles frontend auth, while `convex/auth.config.ts` configures Convex to verify Clerk-issued JWTs. Clerk Organizations provide multi-tenancy.

- [x] **How is Clerk configured? (providers, settings)**
  `convex/auth.config.ts` defines a single provider with `domain: process.env.CLERK_JWT_ISSUER_DOMAIN` and `applicationID: "convex"`. The env var is validated at import time with an explicit error message if missing. On the frontend, `ConvexClientProvider.tsx` wraps the app in `ClerkProvider` with locale-aware URLs for sign-in, sign-up, waitlist, and post-auth redirects.

- [x] **What auth strategies are supported? (email, OAuth, SSO, etc.)**
  Auth strategies are configured in the Clerk Dashboard (not in code). The codebase references `email_addresses` in webhook handling (`http.ts:68`) and `unsafeMetadata.locale` in session claims (`middleware.ts:34`). No code-level OAuth/SSO configuration is present — all strategy selection is delegated to Clerk's hosted UI.

- [x] **How is auth state passed from Next.js to Convex?**
  `ConvexProviderWithClerk` from `convex/react-clerk` bridges auth. It accepts `useAuth` from `@clerk/nextjs` and the `ConvexReactClient` instance. This automatically attaches Clerk's JWT to all Convex requests. On the Convex side, `ctx.auth.getUserIdentity()` extracts the verified identity including custom claims (`org_id`, `org_role`) from the JWT. See `src/components/ConvexClientProvider.tsx:59`.

- [x] **What middleware guards exist in Next.js?**
  `src/middleware.ts` uses `clerkMiddleware` with the following logic:
  1. Root `/` redirects to locale-prefixed path (checks Clerk metadata → cookie → default "en")
  2. Static assets, API routes, widget routes, and `_next` are passed through
  3. `/dashboard` bare path redirects to locale-prefixed dashboard
  4. **Protected routes** (`/dashboard(.*)`, `/design-studio(.*)`) call `auth.protect()` with redirect to `/login`
  5. URL locale synced to `NEXT_LOCALE` cookie for unauthenticated users

- [x] **How are protected routes defined?**
  Protected routes are defined via `createRouteMatcher(["/dashboard(.*)", "/design-studio(.*)"])` in `src/middleware.ts:11-13`. Any request matching these patterns triggers `auth.protect({ unauthenticatedUrl: "/login" })`. Marketing pages, widget, API routes, and static assets are unprotected.

- [x] **What authorization patterns exist in queries?**
  Queries follow a **soft return** pattern — returning `null` or `[]` for unauthenticated users instead of throwing:
  - `profiles.getMe`: returns `null` if no identity
  - `conversations.list`: returns `[]` if no identity
  - `conversations.get`: returns `null` if no identity
  - `projects.list`: returns `[]` if no `identity.org_id`
  - `projects.get`: returns `null` if `project.orgId !== identity.org_id` (org isolation)
  - `webhooks.list`: returns `[]` if no identity
  
  This is a deliberate pattern — queries don't throw to avoid breaking reactive UI subscriptions.

- [x] **What authorization patterns exist in mutations?**
  Mutations follow a **hard throw** pattern using standardized error helpers:
  - **Auth check**: `if (!identity) throw authError()` — nearly all mutations
  - **Admin check**: `requireAdmin(identity)` — checks `identity.org_role === "org:admin"` for sensitive operations (project update, bot/department/label/webhook CRUD, etc.)
  - **Ownership check**: `assertProjectOwnership(ctx, projectId, identity)` — verifies `project.orgId === identity.org_id`
  - **Soft auth**: Some mutations like `profiles.updateMe` and `profiles.setAvailability` silently return if unauthenticated (non-critical user-facing actions)

- [x] **Is role-based access control (RBAC) implemented?**
  Yes, using Clerk Organizations' built-in roles. The `ClerkIdentity` type (`convex/types.ts:22-27`) includes `org_role` (e.g., `"org:admin"`). The `requireAdmin()` helper (`convex/utils.ts:5-9`) enforces admin-only access. It's used in **14 files** across the backend for write operations on: projects, bots, bot flows, departments, labels, canned responses, webhooks, integrations, orders, and operating hours. Non-admin users ("members") can read data but cannot modify configuration. The `projects.list` query passes `userRole` to the frontend so the UI can conditionally show admin-only features.

- [x] **How are user sessions managed?**
  Sessions are managed by Clerk's JWT-based system. Convex verifies JWTs on every request — no server-side session store. The `DashboardShell.tsx` component calls `profiles.ensureCurrent` on mount (syncs Clerk data to Convex) and runs a **30-second heartbeat** (`profiles.updateHeartbeat`) to track agent presence. A cron job (`crons.ts:20-24`) runs every 60 seconds to mark agents as offline if their `lastSeenAt` exceeds 90 seconds. The `sendBeacon`-based `profiles.setOffline` internal mutation is available for tab close detection.

- [x] **What's the token flow? (JWT, session tokens)**
  1. User authenticates via Clerk (email/OAuth configured in Clerk Dashboard)
  2. Clerk issues a JWT with standard claims + custom claims (`org_id`, `org_role`, `unsafeMetadata`)
  3. `ConvexProviderWithClerk` attaches the JWT to every Convex HTTP request via `useAuth` hook
  4. Convex verifies the JWT against `CLERK_JWT_ISSUER_DOMAIN` (configured in `auth.config.ts`)
  5. `ctx.auth.getUserIdentity()` returns the decoded identity with `subject` (user ID), `org_id`, `org_role`
  6. No manual token refresh — Clerk and Convex handle JWT refresh automatically

- [x] **Are there admin vs regular user distinctions?**
  Yes. Two roles exist:
  - **`org:admin`**: Full access to all CRUD operations. Required for: project settings, bot management, department management, label/canned response management, webhook configuration, integration setup, order deletion, operating hours.
  - **`member`** (default): Can read all data, send messages, join/leave conversations, update own profile, manage conversation status. Cannot modify organization-level configuration.
  
  The `projects.list` query exposes `userRole` to the frontend (`projects.ts:36`), enabling UI-level conditional rendering.

- [x] **How is multi-tenancy handled? (if applicable)**
  Multi-tenancy is implemented via **Clerk Organizations**:
  - Every `project` has an `orgId` field (Clerk org ID)
  - The `profiles` table has an `orgId` field synced from `identity.org_id`
  - **Query isolation**: `projects.list` filters by `identity.org_id` using the `by_orgId` index; `profiles.list` similarly scoped
  - **Mutation isolation**: `assertProjectOwnership()` and `checkProjectOwnership()` verify `project.orgId === identity.org_id` before writes
  - **Project-level scoping**: Most tables (conversations, messages, bots, etc.) are scoped to `projectId`, which is in turn scoped to `orgId`
  - **Organization deletion**: Clerk `organization.deleted` webhook (`http.ts:71-77`) triggers project cleanup

- [x] **What happens on auth failure? (redirects, errors)**
  - **Middleware level**: `auth.protect()` redirects unauthenticated users to `/login` for protected routes
  - **Query level**: Returns `null` or `[]` silently (no error thrown)
  - **Mutation level**: Throws `ConvexError("Unauthorized")` via `authError()` or `ConvexError("Forbidden")` via `forbiddenError()`
  - **Admin check failure**: Throws `ConvexError("Unauthorized: admin access required")` via `requireAdmin()`
  - **Frontend**: `AppErrorBoundary` catches thrown errors and displays a retry UI

- [x] **Are there refresh token patterns?**
  No manual refresh token handling exists in the codebase. Clerk's SDK automatically manages JWT refresh via the `useAuth` hook and Clerk's session management. `ConvexProviderWithClerk` handles token refresh seamlessly.

- [x] **How is user data isolated by auth?**
  Data isolation is enforced at multiple levels:
  1. **Org-level**: Queries filter by `identity.org_id` (projects, profiles)
  2. **Project-level**: All domain tables (conversations, messages, bots, contacts, etc.) use `projectId` FK, which is org-scoped
  3. **User-level**: `profiles.getMe` and `profiles.updateMe` filter by `identity.subject` (Clerk user ID)
  4. **Ownership checks**: `assertProjectOwnership()` and `checkProjectOwnership()` validate org membership before data access
  5. **Internal functions**: `internalMutation` and `internalQuery` bypass auth checks but are only callable by scheduled functions, crons, and other server-side code — never directly from the client

## 📝 Agent Findings

### Authentication Architecture

The application uses a **three-layer auth architecture**:

1. **Frontend Layer** (`ClerkProvider` + `ConvexProviderWithClerk`): Handles user authentication UI, session management, and JWT token attachment to all Convex requests.

2. **Middleware Layer** (`clerkMiddleware` in `src/middleware.ts`): Route-level protection for dashboard and design studio routes. Also handles locale-aware redirects based on Clerk session metadata.

3. **Backend Layer** (`ctx.auth.getUserIdentity()` in Convex functions): Per-function authorization checks with standardized error handling.

### Authorization Pattern Summary

| Pattern | Usage | Example Files |
|---------|-------|---------------|
| Soft return (null/[]) | Queries | `profiles.getMe`, `conversations.list`, `projects.list` |
| Hard throw (authError) | Mutations requiring auth | `conversations.update`, `conversations.resolve` |
| Admin guard (requireAdmin) | Admin-only mutations | `projects.update`, `bots.create`, `departments.*` |
| Ownership check | Org-scoped reads/writes | `projects.get`, `webhooks.remove` |
| Internal-only (no auth) | System/scheduled functions | `conversations.createFromWidget`, `profiles.upsertFromClerk` |
| No auth (public widget) | HTTP endpoints | Widget conversations, messages, ratings |

### Webhook Security

Three distinct webhook security patterns exist:
1. **Clerk webhooks** (`/clerk-webhook`): Svix signature verification (`http.ts:50-57`)
2. **Meta webhooks** (`/webhooks/meta`): HMAC-SHA256 with per-integration `app_secret`, constant-time comparison (`http.ts:21-31, 498-502`)
3. **Telegram webhooks** (`/webhooks/telegram`): `X-Telegram-Bot-Api-Secret-Token` header with per-integration `webhookSecret` index lookup
4. **Outbound webhooks**: HMAC-SHA256 signed payloads with per-subscription 32-byte random secret (`webhooks.ts:99-123`)

### Presence System

Agent presence is tracked through a heartbeat mechanism:
- `DashboardShell.tsx` calls `profiles.updateHeartbeat` every 30s
- `crons.ts` runs `profiles.cleanupStalePresence` every 60s (marks agents offline if `lastSeenAt` > 90s)
- `profiles.setOffline` internal mutation available for `sendBeacon` on tab close

## 🔍 Key Patterns to Identify

- **Auth provider choice and rationale**: Clerk chosen for managed auth with built-in multi-tenant Organizations support. Custom JWT claims (`org_id`, `org_role`) enable org-scoped authorization in Convex.
- **Session management patterns**: JWT-based, no server-side sessions. Heartbeat-based agent presence tracking with 30s intervals.
- **Authorization guard patterns**: Two-tier — soft returns for queries, hard throws for mutations. `requireAdmin()` utility for admin-only gates.
- **Role and permission systems**: Binary RBAC — `org:admin` vs `member`. No granular permissions or custom roles.
- **Multi-tenant data isolation**: Clerk Organization → `orgId` on projects/profiles → `projectId` FK on all domain tables. Query-time filtering with indexed lookups.
- **Token handling approaches**: Fully delegated to Clerk SDK + `ConvexProviderWithClerk`. No manual token storage or refresh.

## ⚠️ Potential Concerns to Watch For

### HIGH Severity

- **Missing org-scoping on `conversations.get` query** (`conversations.ts:39-47`): Returns conversation by ID without verifying the caller's org owns the parent project. Any authenticated user can read any conversation if they have the ID. Should verify `project.orgId === identity.org_id`.

- **Missing org-scoping on several conversation mutations**: `conversations.update` (`conversations.ts:133`), `conversations.resolve`, `conversations.join`, `conversations.leave`, `conversations.updateVisitorInfo`, `conversations.markAsRead`, `conversations.transferToDepartment` — all check for auth but do NOT verify the conversation belongs to the caller's organization.

- **`conversations.create` has no auth check** (`conversations.ts:89-130`): The public `create` mutation inserts a conversation without calling `getUserIdentity()`. Any client can invoke it with any `projectId`.

### MEDIUM Severity

- **Inconsistent auth patterns with `as unknown as` type casts**: Many files use `identity as unknown as { org_role?: string; org_id: string }` to access custom Clerk claims (e.g., `cannedResponses.ts:37`, `webhooks.ts:215`). This is fragile — the `ClerkIdentity` type exists in `convex/types.ts` but isn't consistently used across all files.

- **No rate limiting on authenticated Convex functions**: Rate limiting (`@convex-dev/rate-limiter`) is only applied to widget HTTP endpoints (`http.ts:10-13`). Authenticated users face no rate limits on queries/mutations, which could allow abuse.

- **`requireAdmin` called BEFORE null check on identity**: In several mutations (e.g., `webhooks.ts:215-216`), `requireAdmin(identity ...)` is called before `if (!identity) throw authError()`. If identity is null, `requireAdmin` will throw a generic "admin access required" error instead of "Unauthorized", which is a minor information leak and could mask the root cause.

### LOW Severity

- **No audit logs for auth-sensitive operations**: While `activityLogs` exist for some operations (conversation assignment, resolution), there are no audit logs for: failed auth attempts, admin role changes, profile modifications, or webhook secret rotations.

- **No session timeout or maximum session duration**: Clerk handles session management, but no application-level session timeout is configured. Agents could remain "authenticated" indefinitely.

- **Widget endpoints use `Access-Control-Allow-Origin: *`**: All widget HTTP endpoints (`http.ts:167-171`) allow requests from any origin. While this is necessary for embeddable widgets, it means the widget API surface is fully public.

- **Secrets in environment variables without rotation mechanism**: `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`, `ENCRYPTION_KEY` are all env vars with no documented rotation procedure.
