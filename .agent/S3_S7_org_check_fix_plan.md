# Org-Check Security Fix Plan (S-3 → S-7)

> **Read-only audit of the Convex backend for Yoosr.**
> Multi-tenancy model: `projects.orgId` must match `identity.org_id` from the JWT.

---

### S-3 — `convex/knowledgeBases.ts` → `get`, `create`, `addSource`, `removeSource`

**Current behavior:**

| Function | What it does | Check present? |
|---|---|---|
| `get` (L20-28) | Fetches any KB by `_id`. Only checks `identity != null`. | ❌ |
| `create` (L56-69) | Inserts a KB for the supplied `projectId`. Only checks auth. | ❌ |
| `addSource` (L86-113) | Inserts a `knowledge_base_sources` row and schedules indexing. Only checks auth. | ❌ |
| `removeSource` (L116-124) | Deletes a source row by `_id`. Only checks auth. | ❌ |

> [!NOTE]
> `remove` (L138-163) already has the correct pattern — fetch KB → fetch project → assert `project.orgId === identity.org_id`. The same pattern should be replicated.

**Where the check is missing:**

- **`get`**: After `ctx.db.get(args.id)` returns the KB, before returning it.
- **`create`**: Before `ctx.db.insert`, must verify the supplied `projectId` belongs to the caller's org.
- **`addSource`**: Before inserting, fetch the KB (`ctx.db.get(args.kbId)`), then its project, then assert org.
- **`removeSource`**: Before `ctx.db.delete`, fetch the source, then the KB, then the project, then assert org.

**Fix:**

```
// get — after L26 (const kb = await ctx.db.get(args.id))
const kb = await ctx.db.get(args.id);
if (!kb) return null;
const project = await ctx.db.get(kb.projectId);
if (!project || project.orgId !== (identity as any).org_id) return null;
return kb;

// create — before L67 (ctx.db.insert)
const project = await ctx.db.get(args.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}

// addSource — after auth check, before L96
const kb = await ctx.db.get(args.kbId);
if (!kb) throw new ConvexError("Knowledge base not found");
const project = await ctx.db.get(kb.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}

// removeSource — after auth check, before L122
const source = await ctx.db.get(args.id);
if (!source) throw new ConvexError("Source not found");
const kb = await ctx.db.get(source.kbId);
if (!kb) throw new ConvexError("Knowledge base not found");
const project = await ctx.db.get(kb.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}
```

**Can a shared helper be reused?** Yes — see [Shared Helper Recommendation](#shared-helper-recommendation).

**Side effects to watch for:**
- `addSource` already does `ctx.db.get(args.kbId)` on L103; the added check can replace or precede that fetch to avoid a double read.
- No internal callers; all four are exported as public `query`/`mutation`.

---

### S-4 — `convex/bots.ts` → `get`

**Current behavior:**

`get` (L21-29) fetches any bot by `_id`. Only checks `identity != null`.

**Where the check is missing:**

After `ctx.db.get(args.id)` returns the bot, before returning it.

**Fix:**

```
const bot = await ctx.db.get(args.id);
if (!bot) return null;
const project = await ctx.db.get(bot.projectId);
if (!project || project.orgId !== (identity as any).org_id) return null;
return bot;
```

**Can a shared helper be reused?** Yes — same `assertProjectBelongsToOrg(ctx, projectId, identity)` pattern.

**Side effects to watch for:**
- `list` also lacks the org check (it trusts the frontend-supplied `projectId`). Not in scope for S-4, but worth noting for a follow-up sweep.
- `update`/`remove` call `requireAdmin()` but still lack the org ownership check — also out of scope but flagged.

---

### S-5 — `convex/contacts.ts` → `update`, `findByConversation`

**Current behavior:**

| Function | What it does | Check present? |
|---|---|---|
| `update` (L65-87) | Patches any contact by `_id`. Only checks auth. | ❌ |
| `findByConversation` (L20-33) | Returns the contact linked to a conversation. Only checks auth. | ❌ |

**Where the check is missing:**

- **`update`**: After auth check (L77), before `ctx.db.patch` (L85). Need to fetch the contact → fetch its project → assert org.
- **`findByConversation`**: After fetching the contact (L26-29), before returning it. Need to fetch the contact's project → assert org.

**Fix:**

```
// update — insert after L77, before L79
const contact = await ctx.db.get(args.id);
if (!contact) throw new ConvexError("Contact not found");
const project = await ctx.db.get(contact.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}

// findByConversation — after L29 (const contact = ...)
if (!contact) return null;
const project = await ctx.db.get(contact.projectId);
if (!project || project.orgId !== (identity as any).org_id) return null;
return contact;
```

**Can a shared helper be reused?** Yes — same pattern.

**Side effects to watch for:**
- `create`, `remove`, and `list` also lack org checks (same pattern as S-3). Not in scope but flagged.
- `batchImport` correctly derives `projectId` from `identity.org_id` — no issue there.

---

### S-6 — `convex/tags.ts` → `assignTagToConversation`, `removeTagFromConversation`

**Current behavior:**

| Function | Check present? | Identity used? |
|---|---|---|
| `assignTagToConversation` (L125-155) | ❌ — identity is fetched but **never verified as non-null** before the DB write | Only used for activity log if non-null |
| `removeTagFromConversation` (L160-190) | ❌ — same as above | Same |

Both functions fetch the conversation and mutate its `tags` field **without any auth gate**. An unauthenticated caller can tag/untag any conversation.

**Where the check is missing:**

- **Both functions**: Immediately after `const identity = await ctx.auth.getUserIdentity()`, there must be a null check + org ownership verification before `ctx.db.patch`.

**Fix:**

```
// assignTagToConversation — replace L131-134
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new ConvexError("Not authenticated");

const conversation = await ctx.db.get(args.conversationId);
if (!conversation) throw new ConvexError("Conversation not found");

const project = await ctx.db.get(conversation.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}

// removeTagFromConversation — same pattern at L166-169
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new ConvexError("Not authenticated");

const conversation = await ctx.db.get(args.conversationId);
if (!conversation) throw new ConvexError("Conversation not found");

const project = await ctx.db.get(conversation.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    throw new ConvexError("Unauthorized");
}
```

**Can a shared helper be reused?** Yes — same pattern. Additionally, a `assertConversationBelongsToOrg` variant could wrap the conversation → project lookup, but a single `assertProjectBelongsToOrg` is sufficient if the caller fetches the conversation first.

**Side effects to watch for:**
- `updateConversationTags` and `extractGenerativeTags` are `internalMutation`/`internalAction` — they are exempt and must NOT get the auth check (they run server-side without user identity).

---

### S-7 — `convex/analytics.ts` → 8 queries

**Current behavior:**

All 8 queries accept a `projectId` argument and check `identity != null`, but **never verify that the requested `projectId` belongs to `identity.org_id`**. Any authenticated user can read any org's analytics by guessing/knowing a `projectId`.

| Function | Lines |
|---|---|
| `getConversationStats` | L8-35 |
| `getVisitorStats` | L37-51 |
| `getMessageStats` | L53-69 |
| `getConversationVolume` | L79-129 |
| `getTokenUsage` | L134-164 |
| `getCSATSummary` | L197-236 |
| `getTagsSummary` | L259-289 |
| `getProjectUsage` | L241-254 |

> [!NOTE]
> `dismissUnansweredQuery` (L497-518) and `getSLABreachRate` (L450-491) have the same pattern as the 8 listed above but are NOT in scope. `dismissUnansweredQuery` already has the correct org check. `getSLABreachRate` should be audited separately.

**Where the check is missing:**

In every handler, **after** the identity null-check and **before** the first DB query that uses `args.projectId`.

**Fix — uniform pattern for all 8 queries:**

```
const identity = await ctx.auth.getUserIdentity();
if (!identity) return <empty-default>;

// ──── ADD THIS BLOCK ────
const project = await ctx.db.get(args.projectId);
if (!project || project.orgId !== (identity as any).org_id) {
    return <empty-default>;   // queries return empty, not throw
}
// ─────────────────────────
```

Where `<empty-default>` matches the existing early-return value for each function (e.g. `{ total: 0, open: 0, closed: 0 }` for `getConversationStats`).

**Can a shared helper be reused?** Yes — all 8 share the identical `assertProjectBelongsToOrg` check.

**Side effects to watch for:**
- All internal mutations (`logTokenUsage`, `logUnansweredQuery`, etc.) are exempt — they are `internalMutation` and do not carry user identity.
- Adding a `ctx.db.get(args.projectId)` read to every analytics query adds one extra document read per call. This is negligible.
- `getUnansweredQueries` (L169-192) has the same vulnerability but is not listed in S-7 scope. Should be included in a follow-up.

---

## Shared Helper Recommendation

All items (S-3 through S-7) share the identical ownership check pattern. A single reusable helper should be extracted into `convex/utils.ts`:

```typescript
// convex/utils.ts

import { ConvexError } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Asserts that a projectId belongs to the caller's Clerk organization.
 * Throws ConvexError("Unauthorized") on failure.
 * Returns the project document on success (avoids a re-fetch by callers).
 */
export async function assertProjectOwnership(
    ctx: AnyCtx,
    projectId: Id<"projects">,
    identity: { org_id?: string }
): Promise<Doc<"projects">> {
    if (!identity.org_id) {
        throw new ConvexError("No active organization");
    }
    const project = await ctx.db.get(projectId);
    if (!project || project.orgId !== identity.org_id) {
        throw new ConvexError("Unauthorized");
    }
    return project;
}
```

### Usage per item

| Item | How to derive `projectId` | Behavior on failure |
|---|---|---|
| **S-3 `get`** | `kb.projectId` | return `null` (query) |
| **S-3 `create`** | `args.projectId` (direct) | throw |
| **S-3 `addSource`** | `kb.projectId` via `args.kbId` | throw |
| **S-3 `removeSource`** | `source.kbId` → `kb.projectId` | throw |
| **S-4 `get`** | `bot.projectId` | return `null` (query) |
| **S-5 `update`** | `contact.projectId` | throw |
| **S-5 `findByConversation`** | `contact.projectId` | return `null` (query) |
| **S-6 both** | `conversation.projectId` | throw |
| **S-7 all 8** | `args.projectId` (direct) | return empty default (query) |

> [!IMPORTANT]
> For **queries** that currently return `null`/empty on auth failure (not throw), wrap the helper call in a try-catch that returns the safe default, or create a non-throwing variant (`checkProjectOwnership`) that returns `project | null`.

### Suggested non-throwing variant for queries:

```typescript
export async function checkProjectOwnership(
    ctx: AnyCtx,
    projectId: Id<"projects">,
    identity: { org_id?: string }
): Promise<Doc<"projects"> | null> {
    if (!identity.org_id) return null;
    const project = await ctx.db.get(projectId);
    if (!project || project.orgId !== identity.org_id) return null;
    return project;
}
```

### Items using each variant

- **`assertProjectOwnership`** (throws): S-3 `create`/`addSource`/`removeSource`, S-5 `update`, S-6 both
- **`checkProjectOwnership`** (returns null): S-3 `get`, S-4 `get`, S-5 `findByConversation`, S-7 all 8

### Functions exempt from the check (must NOT be modified)

- All `internalMutation` / `internalAction` / `internalQuery` functions (they run without user identity)
- `submitCSAT` — public mutation intentionally auth-free (widget submission)
