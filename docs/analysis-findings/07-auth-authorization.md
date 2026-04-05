# Part 07: Authentication & Authorization - Findings

## 📊 Visual Map

```
Authentication Architecture
├── External Auth Provider
│   └── Clerk (@clerk/nextjs ^6.37.5, @clerk/localizations ^4.2.2, @clerk/themes ^2.4.57)
│       └── JWT issued → Convex validates via auth.config.ts
│
├── Next.js Middleware (src/middleware.ts)
│   ├── Bare root "/" → redirect to "/en"
│   ├── Early skip: /api, /widget, /_next, static assets
│   ├── Dashboard locale redirect: reads unsafeMetadata.locale → /{locale}/dashboard
│   └── Protected routes: /dashboard(.*) and /design-studio(.*) → auth.protect()
│
├── Client-Side Auth
│   └── src/components/ConvexClientProvider.tsx
│       └── ClerkProvider → ConvexProviderWithClerk → auto-passes Clerk tokens to Convex
│
├── Convex Auth Configuration
│   └── convex/auth.config.ts
│       └── CLERK_JWT_ISSUER_DOMAIN → configures JWT issuer for Convex
│
├── Token Flow
│   Clerk issues JWT → ConvexProviderWithClerk passes token → Convex validates against issuer
│   └── ctx.auth.getUserIdentity() returns decoded ClerkIdentity
│
├── Authorization in Convex (convex/utils.ts)
│   ├── requireAdmin(identity) → checks org_role === "org:admin"
│   ├── assertProjectOwnership(ctx, projectId, identity) → throws on org mismatch
│   └── checkProjectOwnership(ctx, projectId, identity) → returns null on org mismatch
│
├── Multi-Tenancy (all tables scoped to orgId)
│   ├── projects: orgId required, by_orgId index
│   ├── profiles: orgId required, by_orgId index
│   ├── feedback: orgId required
│   └── push_subscriptions: orgId required
│
├── Client-Side Guards
│   ├── DashboardAuthGuard (src/components/auth/DashboardAuthGuard.tsx)
│   │   ├── Checks isSignedIn + orgId
│   │   ├── Redirects to /login if not signed in
│   │   └── Shows loading if orgId missing
│   └── ProjectProvider (src/context/ProjectContext.tsx)
│       └── Uses useOrganization() from Clerk → calls api.projects.list (org-scoped)
│
└── Error Handling (convex/errors.ts)
    ├── authError() → ConvexError("Unauthorized")
    ├── forbiddenError() → ConvexError("Forbidden")
    └── notFoundError(resource) → ConvexError("{resource} not found")
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | Convex auth configuration — Clerk JWT issuer domain |
| `src/middleware.ts` | Next.js middleware — Clerk auth guards, locale redirects, protected routes |
| `src/components/ConvexClientProvider.tsx` | Convex + Clerk provider composition — auto-passes Clerk tokens |
| `src/components/providers.tsx` | App-wide client providers — DirectionProvider → ConvexClientProvider → ProjectProvider |
| `src/components/MarketingProviders.tsx` | Lightweight providers for public pages — DirectionProvider only |
| `src/components/auth/DashboardAuthGuard.tsx` | Client-side auth gate for dashboard |
| `src/context/ProjectContext.tsx` | Org-scoped project context — uses useOrganization() from Clerk |
| `convex/utils.ts` | Auth utility functions — requireAdmin, assertProjectOwnership, checkProjectOwnership |
| `convex/errors.ts` | Error factory functions — authError, forbiddenError, notFoundError, userError |
| `convex/types.ts` | ClerkIdentity type definition — subject, org_id, org_role |
| `convex/convex.config.ts` | Convex app config — registers @convex-dev/rate-limiter plugin |
| `package.json` | Clerk dependencies: @clerk/nextjs ^6.37.5, @clerk/localizations ^4.2.2, @clerk/themes ^2.4.57 |

## ✅ Analysis Checklist

### [x] What authentication provider is used?
**Clerk** via `@clerk/nextjs` version `^6.37.5`. Additionally `@clerk/localizations ^4.2.2` (for Arabic localization) and `@clerk/themes ^2.4.57` (for theme customization).

### [x] How is Clerk configured?
**Client-side** (`src/components/ConvexClientProvider.tsx`):
```tsx
<ClerkProvider localization={clerkLocalization} {...urls}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
    </ConvexProviderWithClerk>
</ClerkProvider>
```
- Locale-aware URLs configured for sign-in/sign-up/after-sign-in supporting `en`, `ar`, `fr`.
- `ConvexProviderWithClerk` automatically passes Clerk access tokens to Convex via the `useAuth` hook.

**Server-side** (`convex/auth.config.ts`):
- `CLERK_JWT_ISSUER_DOMAIN` environment variable configures the JWT issuer domain.
- Application ID set to `"convex"`.
- Convex validates Clerk-issued JWTs on every `ctx.auth.getUserIdentity()` call.
- Throws at module load time if env var is missing.

### [x] What auth strategies are supported?
Clerk supports multiple strategies, but the codebase specifically uses:
1. **Organization-based multi-tenancy**: Clerk Organizations (`org_id`, `org_role`) for project scoping.
2. **Email/password and OAuth**: Via Clerk's default sign-in flow (no custom sign-in pages observed).
3. **No SSO observed**: No SAML/OIDC enterprise SSO configuration found.

### [x] How is auth state passed from Next.js to Convex?
**`ConvexProviderWithClerk`** from `convex/react-clerk` handles this automatically:
1. Clerk's `useAuth` hook provides the current access token.
2. The provider passes this token as the `getToken` function to the Convex client.
3. Convex sends the token with every server function call.
4. Convex validates the JWT against the issuer domain configured in `auth.config.ts`.
5. `ctx.auth.getUserIdentity()` returns the decoded `ClerkIdentity` type.

No manual token passing or custom headers are used — this is the standard Convex+Clerk integration pattern.

### [x] What middleware guards exist in Next.js?
**`src/middleware.ts`** — Four guard layers:

1. **Bare root redirect** (lines 16-19): `/` → redirects to `/en`.

2. **Early skip** (lines 22-29): Routes matching `/api`, `/widget`, `/_next`, and static assets (`*.png`, `*.svg`, etc.) skip auth checks entirely. These are public endpoints.

3. **Dashboard locale redirect** (lines 33-46): If user visits `/dashboard` without locale prefix, reads `unsafeMetadata.locale` from Clerk session claims and redirects to `/{locale}/dashboard`. This is a clever optimization to avoid extra auth redirect hops.

4. **Protected route enforcement** (lines 49-53): Routes matching `/dashboard(.*)` and `/design-studio(.*)` are protected via `await auth.protect()` with `unauthenticatedUrl: "/login"`. Unauthenticated users are redirected to `/login`.

**Matcher** (lines 56-59): Excludes `api`, `widget`, `_next`, `static`, `favicon.ico`, and all static file extensions from middleware execution.

### [x] How are protected routes defined?
Two layers of protection:

1. **Server-side** (`src/middleware.ts`): `auth.protect({ unauthenticatedUrl: "/login" })` for `/dashboard(.*)` and `/design-studio(.*)`.

2. **Client-side** (`src/components/auth/DashboardAuthGuard.tsx`): Wraps dashboard content, checks `isSignedIn` and `orgId` from Clerk's `useAuth()` hook. Redirects to `/login` if not signed in. Shows loading spinner while `isLoaded` is false. Also shows loading if signed in but `orgId` is missing — enforcing multi-tenant org requirement at the UI layer.

This is a **defense-in-depth** pattern — middleware protects at the routing layer, DashboardAuthGuard protects at the component layer.

### [x] What authorization patterns exist in queries?
**Three patterns across ~55+ query functions:**

1. **Auth-required, early return** (most common for queries):
   ```ts
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) return [];  // or null
   ```
   Used in: `contacts.ts:list`, `profiles.ts:getMe`, `projects.ts:list`, etc.

2. **Auth-required with project ownership check**:
   ```ts
   const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
   if (!identity || !identity.org_id) return null;
   const project = await checkProjectOwnership(ctx, args.projectId, identity);
   if (!project) return null;
   ```
   Used in: `bots.ts:get`, `knowledgeBases.ts:get`.

3. **Auth-required with org-scoped filtering**:
   ```ts
   const identity = await ctx.auth.getUserIdentity();
   if (!identity || !identity.org_id) return [];
   return await ctx.db.query("profiles").withIndex("by_orgId", q => q.eq("orgId", identity.org_id)).collect();
   ```
   Used in: `profiles.ts:list`, `projects.ts:list`.

**All queries return `userRole: identity.org_role ?? "member"`** where applicable (e.g., `projects.ts` lines 36, 55, 81, 140), so the frontend knows the user's permission level.

### [x] What authorization patterns exist in mutations?
**Four patterns across ~55+ mutation functions:**

1. **Auth-required, throw on failure** (most mutations):
   ```ts
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) throw authError();
   ```

2. **Admin-only** (sensitive CRUD):
   ```ts
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) throw authError();
   requireAdmin(identity);  // throws if org_role !== "org:admin"
   ```
   Used in: `bots.ts:create/update/remove`, `settings.ts` department/label/canned CRUD, `integrations.ts:upsert/remove`, `webhooks.ts:create/update/remove`, `orders.ts` CRUD.

3. **Project ownership required**:
   ```ts
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) throw authError();
   const project = await assertProjectOwnership(ctx, args.projectId, identity);
   ```
   Used in: `contacts.ts:create/update`, `messages.ts:send`, `knowledgeBases.ts:create/addSource/removeSource`.

4. **Org-scoped forbidden** (explicit org mismatch):
   ```ts
   if (project.orgId !== identity.org_id) throw forbiddenError();
   ```
   Used in: `orders.ts:listOrders/updateOrderStatus/deleteOrder`, `analytics.ts:getProjectUsageSummary`.

### [x] Is role-based access control (RBAC) implemented?
**Yes, two-tier RBAC:**

1. **`org:admin`** — Full administrative access. Checked via `requireAdmin()` in ~25+ mutation handlers. Admin capabilities include:
   - Bot CRUD (create/update/delete)
   - Department management (CRUD + member management)
   - Canned responses CRUD
   - Labels CRUD
   - Operating hours management
   - Integration management
   - Webhook management
   - Order CRUD

2. **`member`** (default, when `org_role` is undefined or any other value) — Standard read/write access to project-scoped resources. Can:
   - View/list resources
   - Send messages
   - Manage contacts
   - Create conversations
   - Update own profile
   - Toggle availability

**No finer-grained role levels** (e.g., editor, viewer, supervisor) are implemented at the Convex layer. The frontend hides some UI elements for non-admins (e.g., Analytics nav item, Settings menu item), but the Convex layer only enforces admin vs. member.

**Role check utility** (`convex/utils.ts`):
```ts
export function requireAdmin(identity: { org_role?: string } | null) {
    if (!identity || identity.org_role !== "org:admin") {
        throw new ConvexError("Unauthorized: admin access required");
    }
}
```

### [x] How are user sessions managed?
**Fully managed by Clerk** — no custom session storage:

1. **Clerk JWTs**: Short-lived access tokens with automatic rotation via `ConvexProviderWithClerk`.

2. **Session claims**: Middleware accesses `authData.sessionClaims?.unsafeMetadata` to read user's preferred locale. This indicates Clerk JWT templates or user metadata are used to pass locale preferences into the token.

3. **No explicit session refresh logic**: Clerk handles token rotation automatically. `ConvexProviderWithClerk` automatically refreshes tokens when Clerk rotates them.

4. **Profile sync**: `profiles.ts:ensureCurrent` syncs email/name/avatar/org from Clerk on each dashboard load. `profiles.ts:updateMe` uses an upsert pattern to patch profile data.

5. **Presence system**: `profiles.ts:updateHeartbeat` (every 30s from `DashboardShell`) and `profiles.ts:cleanupStalePresence` (cron job every 60s, 90-second threshold) manage online/offline agent status.

### [x] What's the token flow?
```
1. User signs in via Clerk → Clerk issues JWT access token
2. ClerkProvider + ConvexProviderWithClerk → useAuth() returns token
3. Convex client includes token in every server function call
4. Convex server validates JWT against CLERK_JWT_ISSUER_DOMAIN (auth.config.ts)
5. ctx.auth.getUserIdentity() returns ClerkIdentity { subject, org_id, org_role }
6. Mutations/queries use identity.subject as userId, identity.org_id for multi-tenancy
7. Clerk rotates tokens automatically → ConvexProviderWithClerk auto-refreshes
```

**No custom JWT handling, no session tokens, no refresh token patterns** — all managed by Clerk.

### [x] Are there admin vs regular user distinctions?
**Yes, two-tier** as described in the RBAC section above. Key distinction points:

| Operation | Admin | Member |
|-----------|-------|--------|
| Bot management | ✅ | ❌ |
| Department CRUD | ✅ | ❌ |
| Canned responses | ✅ | ❌ |
| Labels | ✅ | ❌ |
| Operating hours | ✅ | ❌ |
| Integrations | ✅ | ❌ |
| Webhooks | ✅ | ❌ |
| Orders | ✅ | ❌ |
| View resources | ✅ | ✅ |
| Send messages | ✅ | ✅ |
| Manage contacts | ✅ | ✅ |
| Update profile | ✅ | ✅ |
| Toggle availability | ✅ | ✅ |

**Frontend enforcement**: `AppSidebar.tsx` hides Analytics nav for non-admins (`isHidden` + `hidden` class). `SettingsSidebar` is only rendered for admins. `DesignStudioShell` redirects non-admins to `/dashboard`.

### [x] How is multi-tenancy handled?
**Clerk Organization-based multi-tenancy:**

1. **Schema-level**: Every multi-tenant table has `orgId: v.string()` with `by_orgId` index:
   - `projects.orgId` — required
   - `profiles.orgId` — required
   - `feedback.orgId` — required
   - `push_subscriptions.orgId` — required

2. **Authorization layer**: `assertProjectOwnership()` and `checkProjectOwnership()` in `convex/utils.ts` verify `project.orgId === identity.org_id` on every project-scoped operation.

3. **Dashboard guard**: `DashboardAuthGuard` blocks access if `orgId` is missing from Clerk session — users must be in an organization context.

4. **Project context**: `ProjectProvider` uses `useOrganization()` from Clerk to wait for org state, then calls `api.projects.list` which is org-scoped on the backend.

5. **Clerk webhook** (`http.ts:/clerk-webhook`): `user.created`/`user.updated` events sync profiles via `internal.profiles.upsertFromClerk`. `organization.deleted` removes the associated project.

6. **Note**: `bots.orgId` is optional in the schema but used for filtering. Some tables may not have orgId (e.g., `conversations`, `messages`) — they're scoped indirectly through `projectId` → `project.orgId`.

### [x] What happens on auth failure?
**Three-tier response:**

1. **Middleware level** (`src/middleware.ts`): `auth.protect({ unauthenticatedUrl: "/login" })` redirects to `/login`. No custom error page.

2. **Client-side guard** (`DashboardAuthGuard.tsx`): Shows loading spinner while `isLoaded` is false. Redirects to `/login` if `!isSignedIn`. Shows loading spinner if signed in but no `orgId`.

3. **Convex level** (`convex/errors.ts`):
   - `authError()` → `ConvexError("Unauthorized")` — thrown from mutations when identity is null
   - `forbiddenError()` → `ConvexError("Forbidden")` — thrown when org mismatch detected
   - Queries return `[]` or `null` instead of throwing (graceful degradation)

**No session timeout handling** — relies on Clerk's token expiration.

### [x] Are there refresh token patterns?
**No custom refresh token logic**. Clerk handles token rotation automatically. `ConvexProviderWithClerk` subscribes to Clerk's auth state changes and automatically refreshes the token passed to Convex.

### [x] How is user data isolated by auth?
**Three layers of isolation:**

1. **Clerk Organization**: Each user belongs to a Clerk Organization. `identity.org_id` is the tenant boundary.

2. **Project scoping**: All data access goes through `projectId` → `project.orgId` verification. `assertProjectOwnership` ensures users can only access data in their org.

3. **Query filtering**: List queries filter by `orgId`:
   ```ts
   ctx.db.query("profiles").withIndex("by_orgId", q => q.eq("orgId", identity.org_id))
   ```

4. **Cascading isolation**: Even internal mutations respect org boundaries — `profiles.ts:upsertFromClerk` upserts by Clerk user ID, not org ID (user can exist across orgs).

## 📝 Agent Findings

### Auth Architecture Quality
The auth architecture is well-designed with defense-in-depth (middleware + client-side guard + Convex-level checks). The Clerk + Convex integration follows best practices using `ConvexProviderWithClerk`.

### Provider Composition
Two provider trees:
- **Authenticated**: `DirectionProvider` → `ConvexClientProvider` (Clerk + Convex) → `ProjectProvider` → `{children}` + `AppToaster`
- **Marketing**: `DirectionProvider` → `{children}` + `MarketingToaster` (no Convex, no Clerk beyond base)

This separation is clean but means shared providers must be duplicated.

### Identity Type Design
`ClerkIdentity` type in `convex/types.ts`:
```ts
export type ClerkIdentity = {
  subject: string;      // Clerk user ID (e.g., "user_2abc...")
  org_id?: string;      // Active organization/project ID
  org_role?: string;    // Role within active org (e.g., "org:admin")
  [key: string]: unknown;
};
```
The `[key: string]: unknown` index signature allows flexible claim access but sacrifices type safety.

### Locale Integration
Locale is passed through Clerk session claims (`unsafeMetadata.locale`), read in middleware for redirects, and used in layout components for RTL support. Arabic (`ar`) gets full RTL treatment (sidebar flips, text direction changes).

## 🔍 Key Patterns to Identify

### Auth Provider Choice and Rationale
Clerk chosen for: built-in organizations (multi-tenancy), localization support (Arabic), Next.js App Router integration, JWT issuer compatibility with Convex.

### Session Management Patterns
- Fully managed by Clerk — no custom session storage
- Token auto-rotation via ConvexProviderWithClerk
- Profile sync on dashboard load
- Presence heartbeat system (30s interval, 90s stale threshold)

### Authorization Guard Patterns
- Six-tier: public → optional auth → required auth → admin → project ownership → org-scoped forbidden
- Queries: early return `[]`/`null` for unauthenticated
- Mutations: throw `authError()` for unauthenticated
- Consistent use of utility functions from `convex/utils.ts`

### Role and Permission Systems
- Two-tier: `org:admin` vs `member` (default)
- `requireAdmin()` used in ~25+ mutation handlers
- Frontend hides admin UI for non-admins (defense-in-depth)

### Multi-Tenant Data Isolation
- `orgId` on all multi-tenant tables with `by_orgId` indexes
- `assertProjectOwnership` / `checkProjectOwnership` for verification
- Clerk webhook syncs org lifecycle events

### Token Handling Approach
- Clerk JWT → Convex validates via `auth.config.ts` issuer domain
- `ConvexProviderWithClerk` auto-passes tokens
- No manual token management anywhere

## ⚠️ Potential Concerns

| # | Concern | Severity | Details |
|---|---------|----------|---------|
| 1 | **Clerk webhook has no signature verification** | HIGH | `http.ts:/clerk-webhook` (lines 35-57) processes `user.created`, `user.updated`, `organization.deleted` events without verifying the request originated from Clerk. An attacker could forge POST requests to create/delete users or projects. Clerk webhooks should be verified via webhook signing or Clerk's SDK webhook verification. |
| 2 | **No role granularity** | MEDIUM | Only `org:admin` vs `member`. No editor/viewer/supervisor distinction at the Convex layer. If business needs finer permissions, the entire RBAC system would need refactoring. |
| 3 | **Widget endpoints fully public** | MEDIUM | `http.ts` widget endpoints have no auth, only rate limiting. Anyone with a projectId can create conversations and send messages. This is by design for embedded widgets but means public write access to the system. |
| 4 | **Inconsistent auth patterns across files** | LOW | Most mutations consistently use `getUserIdentity()` + `throw authError()`, but some (e.g., `profiles.ts:setAvailability`, `profiles.ts:updateHeartbeat`) return early instead of throwing. This inconsistency could lead to silent failures. |
| 5 | **No session timeout or refresh handling** | LOW | Relies entirely on Clerk's default token lifetime. No custom session timeout or forced re-authentication for sensitive operations. |
| 6 | **`[key: string]: unknown` in ClerkIdentity** | LOW | Index signature sacrifices type safety for flexibility. Could lead to runtime errors if claims change. |
| 7 | **Dead code in webhook handlers** | LOW | `requireAdmin()` called before null checks on identity in some files — null checks are unreachable dead code. |
| 8 | **No rate limiting on auth endpoints** | LOW | No rate limiting on profile sync, availability toggle, or heartbeat mutations. Could theoretically be abused by authenticated users. |
