# Department Routing & Filtering System — Audit Report

**Date:** 2026-03-03  
**Scope:** Read-only audit of schema, Convex functions, and dashboard UI related to department-based routing and conversation filtering.

---

## 1. `departments` Table Schema

**File:** `convex/schema.ts` — lines 138–148

### What exists
```ts
departments: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    routingMode: v.optional(v.string()), // "pooled" | "assigned"
    botId: v.optional(v.string()),       // Bot ID overriding the project default
    tags: v.optional(v.array(v.string())),
    memberIds: v.optional(v.array(v.string())), // Clerk user IDs of assigned agents
}).index("by_projectId", ["projectId"]),
```

### Assessment
- Schema is reasonable and sufficient for its function.
- No foreign key from `conversations` → `departments`. The link is **one-directional and only exists at routing time** (passed as an argument to `routeConversation`).
- `memberIds` is the mechanism for agent-to-department membership (stored here in Convex, not derived from Clerk Organizations).
- No index on `name` or `isDefault` — minor scalability gap, acceptable for now.
- `botId` is stored as `v.string()`, not `v.id("bots")` — loose typing, no referential integrity enforced.

---

## 2. `departmentId` on Conversations

**File:** `convex/schema.ts` — lines 29–67

### What exists
There is **no `departmentId` field** on the `conversations` table.

The `conversations` table has no direct reference to a department. The only department-related information that ends up on a conversation record is:
```ts
attributes: {
    department: department.name  // STRING name, not an ID
}
```
This is set inside `transferToDepartment` (see §5).

### What is missing
- A `departmentId: v.optional(v.id("departments"))` field on `conversations`.
- Without it, it is **impossible** to filter conversations by department at the database level.
- The `attributes.department` string cannot be used for indexed queries or reliable foreign-key joins.

---

## 3. Convex Query for Requests / Monitor Conversations

### Requests section query

**File:** `convex/conversations.ts` — lines 6–18 (`list` query)

```ts
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    },
});
```

**No department filter.** Returns all conversations for the project, regardless of which department they belong to (or if they belong to any department at all).

### Monitor section query

**File:** `convex/conversations.ts` — lines 596–666 (`getConversations` query)

```ts
export const getConversations = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const convos = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", ...)
            .order("desc")
            .collect();
        // ... enriches with agent profile data and returns a shaped object
    }
});
```

**No department filter.** Also returns all conversations for the project. The returned shape includes `details.department` read from `c.attributes?.department ?? "General"` — a string, read from the freeform `attributes` blob.

### What is missing
- Neither query accepts or applies a `departmentId` filter argument.
- No server-side scoping of conversations to "conversations owned by the calling agent's department(s)".
- Full table scan per project on every load.

---

## 4. How the Current User's Department Membership Is Determined

### What exists  

**`departments` table, `memberIds` field** (`convex/schema.ts` line 147):

Agent-to-department membership is stored as a `memberIds: string[]` array of Clerk user IDs on each department record. This is managed via:

- `convex/settings.ts` — `addMemberToDepartment` (lines 82–106): pushes `clerkUserId` into `department.memberIds`.
- `convex/settings.ts` — `removeMemberFromDepartment` (lines 108–131): removes from `memberIds`.
- `src/app/dashboard/settings/departments/page.tsx` — the UI that drives those mutations, listing Clerk org members via `useOrganization({ memberships: ... })`.

**At routing time** (`convex/routing.ts` line 85–90), the engine reads `department.memberIds` and filters `availableAgents` down to those who are in the department.

### What is missing / broken

There is **no query-time lookup of "which departments does the currently logged-in agent belong to?"**

- No Convex query exists that accepts a `userId` and returns their department memberships.
- The `profiles` table has no `departmentId` or `departmentIds` field.
- At query time for the Requests or Monitor pages, neither the UI nor the Convex function asks: "what departments is this agent in?" and scopes results accordingly.
- The `project_members` table was deleted per architecture decision. Membership is now via Clerk Organizations for multi-tenancy. However, **department-level membership (sub-team assignment) is still stored in Convex** in `departments.memberIds` — but it is only read by the routing engine, not by dashboards or queries.

**Net result:** Every agent sees every conversation in the project. There is no per-department inbox isolation.

---

## 5. `transferToDepartment` Mutation

**File:** `convex/conversations.ts` — lines 500–534

```ts
export const transferToDepartment = mutation({
    args: {
        id: v.id("conversations"),
        departmentId: v.id("departments"),
    },
    handler: async (ctx, args) => {
        // ...
        await ctx.db.patch(args.id, {
            assignedTo: undefined,        // Clears current agent assignment
            status: 100,                  // Resets to "unassigned" pool
            botPaused: false,             // Re-enables bot so dept bot can pick up
            updatedAt: Date.now(),
            attributes: {
                ...(conversation.attributes || {}),
                department: department.name  // Stores dept NAME (string) in attributes
            }
        });

        // Triggers smart routing engine with the target departmentId
        await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
            conversationId: args.id,
            projectId: conversation.projectId,
            departmentId: args.departmentId,   // Passed as arg, NOT persisted to conversation
        });
    },
});
```

### Assessment
- The `departmentId` is **not written to the conversation record** — it is only passed as a transient argument to `routeConversation`. Once routing completes, the link between conversation and department is gone.
- The `attributes.department` string is the only durable trace left, and it is a human-readable name — not an ID, not queryable via an index.
- `assignedTo` is cleared and `status` is reset to `100` (unassigned) — correct for the handoff flow.
- `botPaused` is set to `false` — correct, allows the department's bot to take over.

### What Is Missing
- Should also write `departmentId: args.departmentId` directly to the conversation record for durable, queryable linkage.

---

## 6. `change_department` Block in `bot.ts`

**File:** `convex/bot.ts` — lines 193–200

```ts
case "change_department":
    const c3 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
    await ctx.runMutation(internal.routing.routeConversation, {
        conversationId: conversationId,
        projectId: c3.projectId,
        departmentId: action.departmentId,
    });
    return { suspend: true };
```

### Assessment
- Calls `routeConversation` (the same routing action as `transferToDepartment`), passing `action.departmentId` from the bot flow node configuration.
- Suspends the bot after (correct — routing will determine whether a bot or agent takes over).
- **Does not write `departmentId` to the conversation** — same gap as `transferToDepartment`. After routing, the conversation has no durable department reference.
- `action.departmentId` comes from the Design Studio node config (`src/types/flow.ts` line 74, `src/components/design-studio/NodePropertiesPanel.tsx` lines 506–507) — this part is wired up correctly in the UI.

---

## 7. Requests Section UI — Filtering Logic

**File:** `src/app/dashboard/requests/page.tsx`

### What exists

```ts
const allConversations = useQuery(
    api.conversations.list,
    activeProject ? { projectId: activeProject._id } : "skip"
) ?? []

const requests = allConversations.filter((req) => {
    if (req.status === 1000) return false
    if (filter === "bot_escalated") return (req as any).handoffSource === "bot"
    if (filter === "unassigned") return !req.assignedTo
    if (filter === "mine" && user) return req.assignedTo === user.id
    return true
})
```

Sidebar filters available: `unassigned`, `mine`, `bot_escalated`. All filtering is **client-side, post-data-fetch**.

### What is missing
- No department filter in the sidebar or in the query.
- No scoping to "only show conversations that belong to one of my departments". An agent in the Sales department sees all unassigned conversations including Support department's conversations.
- No "by department" grouping or drill-down.

---

## 8. Monitor Section Conversation List — Filtering Logic

**File:** `src/components/dashboard/monitor/monitor-layout.tsx` + `src/components/dashboard/monitor/conversation-list.tsx`

### Monitor Layout — Data Fetching
```ts
const conversations = useQuery(
    api.conversations.getConversations,
    projectId ? { projectId } : "skip"
)
```
Fetches all project conversations, no department argument.

### Conversation List — Filter Controls
The `conversation-list.tsx` renders filter buttons:
- **Label filter** — fully functional, filters `item.tags.includes(activeLabel)` client-side.
- **"Dept" button** (line 146–149) — renders a `<Button>` with label "Dept" but has **no `onClick` handler and no state** — it is a non-functional placeholder.
- **"Agent" button** (line 150–153) — same, non-functional placeholder.
- **"Status" button** (lines 154–157) — same, non-functional placeholder.

```tsx
<Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
    <Filter className="mr-2 h-3 w-3" />
    Dept
</Button>
```

### What is missing
- The "Dept" filter button has no implementation — no popover, no state variable, no filter logic.
- Even if a "Dept" filter were wired up on the client, the `Conversation` type returned from `getConversations` carries only `details.department` (a string from `attributes`), not a `departmentId` — so filtering would be string-matching on a mutable name.
- No server-side filter; the full project conversation list is always loaded.

---

## 9. How the Logged-In Agent's Department(s) Are Known at Query Time

### What exists
**Nothing.** There is no mechanism — in any Convex query, any React hook, or any middleware — that determines "which departments does the currently logged-in agent belong to?" at query time.

The only place `memberIds` is ever read is inside `routeConversation` (during routing), to filter available agents when assigning a new conversation.

### The Membership Data Is There, But Unused by the UI

| Location | What it contains | Used for |
|---|---|---|
| `departments.memberIds[]` | Clerk user IDs of agents in the dept | Only by routing engine |
| Clerk Organization | Which org a user belongs to | Multi-tenancy (org-level, not dept-level) |
| `profiles` table | `isAvailable`, `orgId`, etc. | Availability + org filtering |

There is no query like `getMyDepartments(userId)` that the dashboard could call to scope what an agent sees.

### What is missing
A Convex query of the form:
```ts
export const getMyDepartments = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;
        const depts = await ctx.db.query("departments")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();
        return depts.filter(d => d.memberIds?.includes(userId));
    }
});
```

And then, the conversations list queries would need to accept and apply a `departmentId` filter (which also requires `departmentId` to be persisted on the conversation record — see §2 and §5).

---

## Summary of All Gaps

| # | Gap | Severity |
|---|---|---|
| 1 | `conversations` table has no `departmentId` field | **Critical** — makes any dept-based filter impossible at DB level |
| 2 | `transferToDepartment` doesn't persist `departmentId` to conversation — only a transient routing arg | **Critical** — department ownership is lost after routing |
| 3 | `change_department` bot block has the same persistence gap | **High** |
| 4 | No Convex query to find "which departments does this user belong to?" | **High** — required for scoped inboxes |
| 5 | `conversations.list` and `conversations.getConversations` have no `departmentId` filter argument | **High** — full project list is always returned |
| 6 | Requests page: no department filter in sidebar or query | **High** |
| 7 | Monitor page "Dept" button: non-functional placeholder UI | **Medium** |
| 8 | `attributes.department` stores a string name, not an ID | **Medium** — fragile; renames break matching |
| 9 | No server-side scoping of conversations to agent's departments | **High** — all agents see all conversations |
| 10 | `departments.botId` stored as `v.string()` not `v.id("bots")` | **Low** — no referential integrity |
