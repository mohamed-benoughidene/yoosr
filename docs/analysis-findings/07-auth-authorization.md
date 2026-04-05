# Part 07: Authentication & Authorization — Findings

## 📊 Visual Map

```
convex/
├── auth.config.ts         → Convex auth configuration (Clerk JWT issuer)
├── http.ts                → Clerk webhook (/clerk-webhook) + rate limiting
├── utils.ts               → requireAdmin(), assertProjectOwnership(), checkProjectOwnership()
├── schema.ts              → profiles table (user sync from Clerk), projects.orgId

External Auth Provider
└── Clerk (@clerk/*)
    ├── @clerk/nextjs@6.37.5    → Next.js integration
    ├── @clerk/localizations@4.2.2 → arSA, enUS, frFR
    └── @clerk/themes@2.4.57    → dark theme for login

src/
├── middleware.ts               → clerkMiddleware + i18n middleware
│   ├── Protected routes: /dashboard(.*), /design-studio(.*)
│   ├── Auth guard: auth.protect() with unauthenticatedUrl → /login
│   ├── Locale-aware redirects (root → /en)
│   └── Skips: /api, /widget, /_next, static assets
├── components/
│   ├── ConvexClientProvider.tsx → ClerkProvider + ConvexProviderWithClerk
│   ├── auth/DashboardAuthGuard.tsx → Client-side auth guard
│   └── AuthProviders.tsx       → Standalone Clerk provider (auth pages)
└── app/[locale]/
    ├── login/                  → SignIn component from Clerk
    └── signup/                 → Signup pages

convex/ (Auth in Queries & Mutations) — 121+ auth checks across files
├── Identity: ctx.auth.getUserIdentity() (Clerk JWT claims)
├── Authorization: requireAdmin() checks org_role === "org:admin"
├── Project ownership: assertProjectOwnership() / checkProjectOwnership()
├── Org scoping: identity.org_id used for data isolation
└── Rate limiting: @convex-dev/rate-limiter on widget endpoints
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | Convex authentication configuration — Clerk JWT issuer domain |
| `src/middleware.ts` | Next.js middleware with clerkMiddleware, route matchers, locale redirects |
| `src/components/ConvexClientProvider.tsx` | Clerk + Convex provider wiring, locale-aware Clerk config |
| `src/components/AuthProviders.tsx` | Standalone ClerkProvider for auth pages |
| `src/components/auth/DashboardAuthGuard.tsx` | Client-side auth guard component |
| `convex/utils.ts` | `requireAdmin()`, `assertProjectOwnership()`, `checkProjectOwnership()` |
| `convex/http.ts` | Clerk webhook, widget endpoints, rate limiter, Meta/Telegram webhooks |
| `convex/schema.ts` | profiles table (Clerk user sync), projects.orgId for multi-tenancy |
| `src/app/[locale]/login/page.tsx` | Login page (server component) |
| `src/app/[locale]/login/LoginClient.tsx` | Login client with `<SignIn>` Clerk component |
| `src/context/ProjectContext.tsx` | Project context (uses `useOrganization()` from Clerk) |

**Additional auth-related files discovered:**
| `src/app/[locale]/signup/page.tsx` | Signup page |
| `src/app/[locale]/signup/SignupClient.tsx` | Signup client |

## ✅ Analysis Checklist

### [x] What authentication provider is used? (Clerk)
**Clerk** is the sole authentication provider. Specifically:
- `@clerk/nextjs@6.37.5` — Next.js integration (App Router compatible)
- `@clerk/localizations@4.2.2` — Supports English, Arabic (arSA), and French (frFR)
- `@clerk/themes@2.4.57` — Dark theme applied to login UI

Convex is configured to validate Clerk JWTs via `convex/auth.config.ts`, which uses the `CLERK_JWT_ISSUER_DOMAIN` environment variable as the JWT issuer domain. The `applicationID` is set to `"convex"`.

### [x] How is Clerk configured? (providers, settings)
**Frontend (`ConvexClientProvider.tsx`):**
- `ClerkProvider` wraps the app with locale-aware redirect URLs:
  - `signInUrl: /{locale}/login`
  - `signUpUrl: /{locale}/signup`
  - `afterSignInUrl: /{locale}/dashboard`
  - `afterSignUpUrl: /{locale}/onboarding`
  - `afterSignOutUrl: /{locale}`
- Localization is dynamically selected via `useLocale()` from `next-intl`
- Arabic localization has custom placeholder overrides (`arSAWithPlaceholders`)

**Backend (`convex/auth.config.ts`):**
- Single JWT provider configured with `domain: process.env.CLERK_JWT_ISSUER_DOMAIN`
- `applicationID: "convex"` — Convex validates Clerk JWT audience against this
- Throws at module load if `CLERK_JWT_ISSUER_DOMAIN` is not set

### [x] What auth strategies are supported? (email, OAuth, SSO, etc.)
Clerk handles authentication strategies internally — the app uses Clerk's `<SignIn>` and `<SignUp>` components which support whatever strategies are configured in the Clerk dashboard. The codebase itself does not configure specific strategies (email, OAuth, SSO) programmatically — those are managed via Clerk's dashboard settings. The login page uses `routing="hash"` for the SignIn component.

### [x] How is auth state passed from Next.js to Convex?
Via `ConvexProviderWithClerk` in `ConvexClientProvider.tsx`:
```tsx
<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
```
This automatically attaches Clerk's auth token to every Convex request. On the Convex side, functions retrieve identity via `ctx.auth.getUserIdentity()`, which returns the parsed JWT claims including `subject`, `org_id`, and `org_role`.

### [x] What middleware guards exist in Next.js?
**`src/middleware.ts`** — Two layers of guards:

1. **Route matcher** (`createRouteMatcher`):
   - Protected: `/dashboard(.*)`, `/design-studio(.*)`
   
2. **`clerkMiddleware`** async handler:
   - Root `/` redirect → `/{locale}` (default locale bare redirect)
   - Skips auth for: `/api`, `/widget`, `/_next`, paths with file extensions
   - **Locale-aware dashboard redirect**: If `pathname === "/dashboard"`, checks auth and redirects to `/{locale}/dashboard` based on user's `sessionClaims.unsafeMetadata.locale`
   - **Protected route enforcement**: `await auth.protect({ unauthenticatedUrl: new URL("/login", req.url).toString() })` — redirects unauthenticated users to `/login`

### [x] How are protected routes defined?
Protected routes are defined via `createRouteMatcher(['/dashboard(.*)', '/design-studio(.*)'])` in middleware.ts. These use glob-style patterns. The middleware calls `auth.protect()` which is Clerk's server-side auth guard that verifies the user is authenticated before allowing access.

### [x] What authorization patterns exist in queries?
**121+ auth checks** across all Convex query/mutation files. The pattern is consistent:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) return null; // or throw Error/ConvexError
```

**Data isolation pattern** — queries filter by `org_id` from the JWT:
```typescript
// Example from projects.ts
const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
if (!identity || !identity.org_id) return [];
return await ctx.db.query("projects")
    .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id))
    .collect();
```

**Project ownership check pattern** (in knowledgeBases.ts, contacts.ts, etc.):
```typescript
const check = await checkProjectOwnership(ctx, kb.projectId, identity as unknown as { org_id: string });
if (!check) throw new Error("Unauthorized");
```

### [x] What authorization patterns exist in mutations?
Mutations follow the same identity retrieval pattern but with stricter enforcement:

1. **Authentication check** — throw if not authenticated:
   ```typescript
   if (!identity) throw new Error("Not authenticated");
   // or: throw new ConvexError("Not authenticated")
   ```

2. **Admin-only mutations** — use `requireAdmin()`:
   ```typescript
   requireAdmin(identity as unknown as { org_role?: string; org_id: string });
   ```

3. **Project ownership** — use `assertProjectOwnership()`:
   ```typescript
   await assertProjectOwnership(ctx, args.projectId, identity as unknown as { org_id: string });
   ```

### [x] Is role-based access control (RBAC) implemented?
**Yes, but simplified — based on Clerk organization roles.**

**`convex/utils.ts`** — `requireAdmin()`:
```typescript
export function requireAdmin(identity: { org_role?: string } | null) {
    if (!identity || identity.org_role !== "org:admin") {
        throw new ConvexError("Unauthorized: admin access required");
    }
}
```

The RBAC model checks for `org_role === "org:admin"` (a Clerk organization role). If the role is anything other than `org:admin` (e.g., `org:member`), the mutation throws. There is no finer-grained permission system — it's a binary admin vs. non-admin split.

**ClerkIdentity type** (defined in 3 files: `projects.ts`, `botFlows.ts`, `orders.ts`, `feedback.ts`):
```typescript
type ClerkIdentity = {
    subject: string;
    org_id?: string;
    org_role?: string;
    [key: string]: unknown;
};
```

Frontend receives `userRole` from query results (e.g., `projects.list` returns `userRole: identity.org_role ?? "member"`).

### [x] How are user sessions managed?
Sessions are managed entirely by Clerk:
- Clerk handles session tokens, refresh, and expiry automatically
- `ConvexProviderWithClerk` bridges Clerk session state to Convex requests
- No custom session management in the codebase
- Session claims include `org_id` and `org_role` from Clerk organization membership

### [x] What's the token flow? (JWT, session tokens)
1. **Clerk issues JWT** to the browser on sign-in
2. **`ConvexProviderWithClerk`** attaches the Clerk token to Convex requests
3. **Convex** validates the JWT against the configured Clerk issuer (`convex/auth.config.ts`)
4. **`ctx.auth.getUserIdentity()`** returns the decoded JWT claims (`subject`, `org_id`, `org_role`)
5. **No custom token handling** — no manual JWT parsing, refresh, or storage in the codebase

### [x] Are there admin vs regular user distinctions?
**Yes — binary admin vs member split.**

- `org:admin` → Full access to destructive/sensitive mutations (delete projects, manage settings, manage bots, manage integrations, manage webhooks, manage orders)
- `org:member` (default fallback) → Read access + limited mutations (conversations, messages, contacts, tags)

**Files using `requireAdmin()`** (25+ occurrences):
- `convex/settings.ts` (13 admin-gated mutations)
- `convex/bots.ts` (3 admin-gated mutations)
- `convex/projects.ts` (1 admin-gated mutation — delete)
- `convex/orders.ts` (3 admin-gated mutations)
- `convex/integrations.ts` (2 admin-gated mutations)
- `convex/webhooks.ts` (3 admin-gated mutations)

### [x] How is multi-tenancy handled? (if applicable)
**Multi-tenancy is organization-scoped via Clerk organizations:**

1. **All data is scoped by `orgId`**:
   - `projects` table has `orgId: v.string()` (Clerk Organization ID)
   - `profiles` table has `orgId: v.optional(v.string())`
   - Queries use `.withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id))`

2. **`assertProjectOwnership()`** in `convex/utils.ts`:
   - Verifies the project's `orgId` matches `identity.org_id`
   - Throws `ConvexError("Unauthorized")` on mismatch

3. **`checkProjectOwnership()`** — same but returns `null` instead of throwing

4. **Fallback behavior**: Many queries return empty arrays/null if `identity.org_id` is absent

### [x] What happens on auth failure? (redirects, errors)
**Client-side (Next.js middleware):**
- Unauthenticated access to protected routes → redirected to `/login` via `auth.protect({ unauthenticatedUrl })`
- Authenticated user without org → blocked at `DashboardAuthGuard` (shows loader)

**Server-side (Convex functions):**
- Queries: Return `null` or `[]` (graceful degradation)
- Mutations: Throw `Error("Not authenticated")` or `ConvexError("Not authenticated")`
- Admin-gated mutations: Throw `ConvexError("Unauthorized: admin access required")`

**Frontend components:**
- `DashboardAuthGuard.tsx`: Shows loader while loading, redirects to `/login` if not signed in, renders children only when `isSignedIn && orgId`

### [x] Are there refresh token patterns?
**No custom refresh token patterns found.** Clerk handles token refresh automatically via its SDK. `ConvexProviderWithClerk` automatically uses the latest Clerk token for Convex requests. No manual `refreshToken`, `tokenRefresh`, or `sessionTimeout` patterns exist in the codebase.

### [x] How is user data isolated by auth?
**Three layers of isolation:**

1. **Organization-level** (`org_id` from JWT): All queries filter by `orgId`. No cross-org data leakage possible at the query level.

2. **Project-level** (`projectId` ownership): Within an org, specific resources (knowledge bases, contacts, bots) are scoped to projects. `assertProjectOwnership()` and `checkProjectOwnership()` enforce this.

3. **User-level** (individual user identity): User profiles in `profiles` table are indexed by `userId` (Clerk user ID). Some queries check if a profile belongs to the requesting user's org.

**Clerk webhook** (`/clerk-webhook` in `http.ts`):
- `user.created` / `user.updated` → upserts profile in Convex via `internal.profiles.upsertFromClerk`
- `organization.deleted` → removes associated project via `internal.projects.remove`

### [x] Are there any additional auth patterns?

**Rate limiting on public endpoints** (`convex/http.ts`):
- `@convex-dev/rate-limiter` on widget endpoints:
  - `createConversation`: 5 requests per 60s window (fixed window)
  - `sendMessage`: 20 requests per 60s, burst capacity 5 (token bucket)

**Security: Constant-time string comparison** (`http.ts`):
```typescript
function constantTimeCompare(a: string, b: string): boolean { ... }
```
Used for webhook signature verification to prevent timing attacks.

**Widget endpoints are public** (no auth):
- `/widget/conversations`, `/widget/messages`, `/widget/project` — all public with `Access-Control-Allow-Origin: *`
- Rate limited but not authenticated
- Internal queries (`internal.*`) are used for data access

## 🔍 Key Patterns to Identify

1. **Auth provider choice and rationale**: Clerk chosen for multi-tenant SaaS — provides built-in organization management, role-based access, and easy JWT integration with Convex.

2. **Session management patterns**: Fully delegated to Clerk. No custom session handling. `ConvexProviderWithClerk` bridges Clerk auth to Convex.

3. **Authorization guard patterns**:
   - Middleware level: `auth.protect()` with redirect
   - Convex level: `ctx.auth.getUserIdentity()` + null/throw check at top of every function
   - Client level: `DashboardAuthGuard` component

4. **Role and permission systems**: Simplified RBAC — `org:admin` vs everything else. `requireAdmin()` is the only permission check function. No granular permissions.

5. **Multi-tenant data isolation**: Strict org-scoping. Every query uses `by_orgId` index. Project ownership checks enforce intra-org boundaries.

6. **Token handling approach**: JWT from Clerk, validated by Convex server-side. No manual token manipulation.

## ⚠️ Potential Concerns

### HIGH

1. **Duplicated `ClerkIdentity` type definitions**: The `ClerkIdentity` type is defined inline in 4 separate files (`projects.ts`, `botFlows.ts`, `orders.ts`, `feedback.ts`). This is a maintenance risk — if Clerk changes JWT claim structure, all 4 copies must be updated. **Recommendation**: Extract to a shared types file.

2. **Inconsistent error throwing**: Auth failures throw raw `Error` in some files (`throw new Error("Not authenticated")`) and `ConvexError` in others (`throw new ConvexError("Not authenticated")`). This creates inconsistent error handling for clients. **Recommendation**: Standardize on `ConvexError` everywhere.

3. **Widget endpoints are completely public**: `/widget/conversations`, `/widget/messages`, `/widget/project` have no authentication, only rate limiting. Anyone with a `projectId` can read/write data. While rate limiting helps, there's no prevention of data scraping if someone discovers a projectId. **Risk level depends on whether projectIds are secret.**

### MEDIUM

4. **Type casting with `as unknown as`**: Extensive use of `identity as unknown as { org_role?: string; org_id: string }` across 20+ locations. This bypasses type safety and could mask real type errors. **Recommendation**: Define a single `ClerkIdentity` type and cast once with a proper type guard.

5. **No audit logging for auth events**: While `activityLogs.ts` exists, there's no explicit logging of authentication failures, authorization denials, or admin actions. **Recommendation**: Log auth denials for security monitoring.

6. **Missing `requireAdmin` on some destructive operations**: `profiles.ts` has mutations like `updateAvailability` and `bulkUpdateAvailability` that modify org-wide state but have no admin check — any org member can change all profiles' availability. **Review needed** to confirm this is intentional.

### LOW

7. **No session timeout configuration**: Relies entirely on Clerk's default session settings. No custom timeout or forced re-authentication for sensitive operations.

8. **No rate limiting on authenticated Convex functions**: Rate limiting is only on HTTP widget endpoints. Authenticated mutations (e.g., creating bots, settings changes) have no rate limiting beyond Clerk's implicit limits.

9. **`unsafeMetadata` used for locale**: The middleware reads `authData.sessionClaims?.unsafeMetadata?.locale`. Using `unsafeMetadata` means this data is not validated by Clerk. If the locale value is malformed, the redirect logic could behave unexpectedly.
