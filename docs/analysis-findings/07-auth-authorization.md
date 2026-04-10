# Part 07: Authentication & Authorization — Updated Findings

## ✅ Resolved: Ownership Checks on Conversation Queries and Mutations

All conversation-scoped operations now enforce org isolation:

| Function | Type | Fix Applied |
|----------|------|-------------|
| `conversations.get` | query | `assertConversationOwnership()` ✅ |
| `conversations.update` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.updateConversationStatus` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.resolve` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.join` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.leave` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.updateVisitorInfo` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.markAsRead` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.transferToDepartment` | mutation | `assertConversationOwnership()` ✅ |
| `conversations.getBotState` | query | Verifies `conversation.orgId` ✅ |
| `conversations.getConversationEvents` | query | Verifies `conversation.orgId` ✅ |

**New auth module**: `convex/lib/auth.ts` provides:
- `assertConversationOwnership(ctx, id, identity)` — Throws `ConvexError` on failure (for mutations)
- `checkConversationOwnership(ctx, id, identity)` — Returns boolean (for queries)

Both traverse `conversation → project → project.orgId` for ownership verification (since `conversations` table has no direct `orgId` field).

## ✅ Resolved: `conversations.create` Unauthenticated — By Design

The public widget endpoint intentionally has no auth check. Visitors are unauthenticated. Protected via:
- `projectId` validation
- Rate limiting (5 req/min)
- Internal mutation isolation (widget HTTP → `createFromWidget`)

## Still Accurate (Unchanged from Original Analysis)

- Three-layer auth: Frontend (ClerkProvider), Middleware (clerkMiddleware), Backend (ctx.auth)
- Clerk Organizations for multi-tenancy with `org_id` and `org_role` claims
- Binary RBAC: `org:admin` vs `member`
- Webhook security: Svix, HMAC-SHA256, Telegram secret token
- Agent presence via heartbeat (30s) + cron cleanup (60s)
- Protected routes: `/dashboard(.*)`, `/design-studio(.*)`
- Soft return (null/[]) for queries, hard throw (authError) for mutations
- `requireAdmin()` used in 14 files for admin-only operations

## Outstanding Concerns

- **MEDIUM**: `as unknown as` type casts for Clerk claims still present in some files (e.g., `cannedResponses.ts`, `webhooks.ts`). The `ClerkIdentity` type exists but isn't consistently used.
- **MEDIUM**: No rate limiting on authenticated Convex functions — only widget HTTP endpoints are rate-limited.
- **LOW**: No audit logs for auth-sensitive operations (failed auth attempts, role changes, secret rotations).
- **LOW**: No session timeout or maximum session duration configured.
