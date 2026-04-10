# Part 05: Queries (Read Operations) — Updated Findings

## ✅ Resolved: Ownership Checks Added to Conversation Queries

**`conversations.get`** now uses `assertConversationOwnership()` from `convex/lib/auth.ts`:
- Checks `ctx.auth.getUserIdentity()`
- Verifies `conversation.orgId === identity.org_id`
- Throws `ConvexError("Unauthorized")` on cross-tenant access

**All conversation-scoped queries** now enforce org isolation:
- `get` — Ownership check via `assertConversationOwnership()`
- `getBotState` — Verifies `conversation.orgId`
- `getConversationEvents` — Verifies `conversation.orgId`

**New auth helper**: `convex/lib/auth.ts` provides:
- `assertConversationOwnership(ctx, conversationId)` — Throws on failure
- `checkConversationOwnership(ctx, conversationId)` — Returns boolean (non-throwing)

## Still Accurate (Unchanged from Original Analysis)

- Consistent use of `.withIndex()` before `.filter()`
- Parameters validated with Convex `v` types
- Soft return pattern (null/[]) for unauthorized queries
- `dashboard.getHomeStats` bounds to `.take(2000)` records (MEDIUM concern remains)
- `contacts.list` uses `.take(500)` with TODO comment (LOW concern remains)
- N+1 mitigation via `Promise.all` in dashboard.ts
- Cursor-based pagination via `.paginate()` where implemented
- Convex automatic caching and reactivity

## Outstanding Concerns

- **MEDIUM**: `dashboard.getHomeStats` still bounds to `.take(2000)` — may be inaccurate at scale
- **LOW**: `contacts.list` still uses `.take(500)` without proper pagination
- **LOW**: `conversations.list` still uses `.take(100)` without cursor pagination
