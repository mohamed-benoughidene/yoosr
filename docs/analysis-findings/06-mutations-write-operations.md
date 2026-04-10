# Part 06: Mutations (Write Operations) — Updated Findings

## ✅ Resolved: Ownership Checks Added to Conversation Mutations

**13 conversation mutations** now use `assertConversationOwnership()` from `convex/lib/auth.ts`:
- `get`, `update`, `updateConversationStatus`, `resolve`, `join`, `leave`, `updateVisitorInfo`, `markAsRead`, `transferToDepartment`, `rate`, and others

**Pattern**: Each mutation now follows:
```ts
const identity = await ctx.auth.getUserIdentity();
const { conversation } = await assertConversationOwnership(ctx, args.id, identity);
// ... proceed with mutation
```

## ✅ Resolved: Soft-Delete Pattern

Conversation-related mutations now use soft-delete instead of hard deletes:
- `conversations.autoCloseInactive` — Uses soft-delete
- All cascading delete paths use `softDelete()` from `convex/lib/softDelete.ts`

## ✅ Clarified: `conversations.create` Has No Auth Check — By Design

The `conversations.create` mutation (and its internal counterpart `createFromWidget`) intentionally have no auth check. They are public endpoints for the embedded widget — visitors are unauthenticated. Security is enforced via:
- `projectId` validation (project must exist)
- Rate limiting (5 req/min fixed window)
- Visitor ID deduplication

## Still Accurate (Unchanged from Original Analysis)

- Standard CRUD patterns (create, update, remove)
- Strict typing via `v.*` validators
- Native Convex transactional behavior
- Extensive side effects via `ctx.scheduler.runAfter()`
- OCC workarounds via internal mutations
- Custom errors from `errors.ts`
- Cascading deletes manually programmed in `deleteProjectData`
- Activity logging via `logActivityInternal`

## Outstanding Concerns

- **HIGH**: Complex state overlaps in `conversations.ts` (botPaused, status, assignment) — state divergence risk remains
- **LOW**: Relying on internal mutations to bypass OCC conflicts — still effective but tight coupling needs careful logging
