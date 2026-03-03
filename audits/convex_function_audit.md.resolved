# Convex Function Audit

> [!IMPORTANT]
> This is a **read-only audit**. No code was changed.

---

## 1. `conversations.list`

| Property | Value |
|---|---|
| **File** | [conversations.ts](file:///home/mohamed/lab/yoosr/convex/conversations.ts#L6-L27) |
| **Function type** | `query` |
| **Collection method** | `.collect()` — **full table scan within the index** |
| **Pagination** | ❌ None (`.paginate()` not used) |
| **`.take()` used** | ❌ No |
| **Filters before `.collect()`** | Only `withIndex("by_projectId")` — department filtering happens **after** `.collect()` in JS |

### Full Implementation

```typescript
export const list = query({
    args: {
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();

        if (args.departmentId) {
            return conversations.filter(
                (c) => c.departmentId === args.departmentId || c.departmentId === undefined
            );
        }

        return conversations;
    },
});
```

### ⚠️ Observations

- **Collects every conversation** in the project into memory, then optionally filters by `departmentId` in JavaScript.
- No limit on result size — a project with thousands of conversations will load them all.
- Department filtering is post-hoc (in-memory), not pushed down into a Convex index.

---

## 2. `conversations.getConversations`

| Property | Value |
|---|---|
| **File** | [conversations.ts](file:///home/mohamed/lab/yoosr/convex/conversations.ts#L614-L691) |
| **Function type** | `query` |
| **Collection method** | `.collect()` — **full table scan within the index** |
| **Pagination** | ❌ None (`.paginate()` not used) |
| **`.take()` used** | ❌ No |
| **Filters before `.collect()`** | Only `withIndex("by_projectId")` — department filtering happens **after** `.collect()` in JS |

### Full Implementation

```typescript
export const getConversations = query({
    args: {
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        let convos = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();

        if (args.departmentId) {
            convos = convos.filter(
                (c) => c.departmentId === args.departmentId || c.departmentId === undefined
            );
        }

        return await Promise.all(convos.map(async (c) => {
            const visitorName = c.visitorName || "Visitor";
            const initials = visitorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

            let assignedAgent = null;
            if (c.assignedTo) {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", c.assignedTo!))
                    .first();
                if (profile) {
                    assignedAgent = {
                        name: profile.fullName || profile.username || "Unknown",
                        avatarUrl: profile.avatarUrl,
                    };
                }
            }

            return {
                id: c._id,
                status: c.status ?? 100,
                tags: c.tags ?? [],
                participants: c.participants ?? [],
                createdAt: c._creationTime,
                lastMessage: c.lastMessage ?? "Started a new conversation",
                timestamp: c.updatedAt ?? c._creationTime,
                assignedAgent: assignedAgent,
                assignedTo: c.assignedTo ?? null,
                channel: c.attributes?.channel ?? "web",
                unread: c.unreadCount ?? 0,
                visitorName: visitorName,
                visitorEmail: c.visitorEmail ?? "",
                visitorPhone: c.visitorPhone ?? "",
                visitorAddress: c.visitorAddress ?? "",
                visitorNote: c.visitorNote ?? "",
                user: {
                    name: visitorName,
                    email: c.visitorEmail ?? "",
                    avatar: "",
                    initials: initials || "V",
                },
                details: {
                    department: c.attributes?.department ?? "General",
                    location: c.attributes?.location ?? "Unknown",
                    language: c.attributes?.language ?? "en",
                    os: c.attributes?.os ?? "Unknown",
                    browser: c.attributes?.browser ?? "Unknown",
                    sourcePage: c.attributes?.sourcePage ?? "",
                    ip: c.attributes?.ip ?? "",
                },
            };
        }));
    },
});
```

### ⚠️ Observations

- Same `.collect()` pattern as `list` — loads **all** conversations for the project.
- **N+1 query problem**: For every conversation with an `assignedTo`, it issues a separate `profiles` query inside `Promise.all`. If 200 conversations are assigned, that's 200 additional DB reads.
- Department filtering is post-hoc (in-memory), identical to `list`.
- No pagination, no `.take()` limit.

---

## 3. `dashboard.getHomeStats`

| Property | Value |
|---|---|
| **File** | [dashboard.ts](file:///home/mohamed/lab/yoosr/convex/dashboard.ts#L5-L151) |
| **Function type** | `query` |
| **Does it scan full tables?** | ✅ **Yes** — collects the entire `conversations` table (by project) and the entire `bots` table (by project) |

### Full Implementation

```typescript
export const getHomeStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const now = Date.now();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTodayMs = startOfToday.getTime();
        const startOfYesterdayMs = startOfTodayMs - 24 * 60 * 60 * 1000;

        // 1. Bots count for onboarding banner
        const bots = await ctx.db
            .query("bots")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();
        const botsCount = bots.length;

        // 2. Fetch active and recent conversations
        const allConversations = await ctx.db
            .query("conversations")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .collect();

        // Live Stats Row
        const openConversations = allConversations.filter(c => c.status === 100 || c.status === 200);
        const waitingConversations = allConversations.filter(c => c.status === 100);
        const myAssigned = openConversations.filter(c => c.assignedTo === identity.subject);

        // Fetch online teammates
        const assignedUserIds = new Set(
            allConversations
                .map(c => c.assignedTo)
                .filter((id): id is string => !!id)
        );

        let onlineTeammatesCount = 0;
        for (const userId of assignedUserIds) {
            const profile = await ctx.db
                .query("profiles")
                .withIndex("by_userId", q => q.eq("userId", userId))
                .first();
            if (profile && (profile.isAvailable === true || profile.isAvailable === undefined)) {
                onlineTeammatesCount++;
            }
        }

        // 3. Live Queue (60% width)
        const activeQueue = allConversations
            .filter(c => c.status === 100 || c.status === 200)
            .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
            .slice(0, 5);

        // Enrich queue with assigned agent name
        const liveQueue = await Promise.all(activeQueue.map(async (conv) => {
            let assignedAgentName = "Unassigned";
            if (conv.assignedTo) {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", q => q.eq("userId", conv.assignedTo!))
                    .first();
                assignedAgentName = profile?.fullName ?? profile?.email ?? "Agent";
            }
            return {
                _id: conv._id,
                visitorName: conv.visitorName || "Visitor",
                channel: "widget",
                waitMs: now - (conv._creationTime ?? now),
                assignedAgentName,
                status: conv.status
            };
        }));

        // 4. Recent Activity (40% width)
        const recentActivities = await ctx.db
            .query("activity_logs")
            .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
            .order("desc")
            .take(10);

        // 5. Today's Snapshot
        const conversationsToday = allConversations.filter(
            c => (c._creationTime ?? 0) >= startOfTodayMs
        );
        const conversationsYesterday = allConversations.filter(c =>
            (c._creationTime ?? 0) >= startOfYesterdayMs && (c._creationTime ?? 0) < startOfTodayMs
        );
        const todayCount = conversationsToday.length;
        const yesterdayCount = conversationsYesterday.length;

        // Bot Resolved Today
        const todayEvents = await ctx.db
            .query("conversation_events")
            .withIndex("by_projectId_createdAt", q =>
                q.eq("projectId", args.projectId)
                    .gte("createdAt", startOfTodayMs)
            )
            .collect();

        const botResolvedToday = todayEvents.filter(
            e => e.handledBy === "bot" && e.closed
        ).length;

        // Avg Wait Time Today
        let totalWaitMs = 0;
        let waitCount = 0;

        const sampledTodayConv = conversationsToday.slice(0, 20);
        for (const conv of sampledTodayConv) {
            const firstAgentMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", q => q.eq("conversationId", conv._id))
                .filter(q => q.eq(q.field("senderType"), "agent"))
                .first();

            if (firstAgentMessage) {
                totalWaitMs += (firstAgentMessage._creationTime - conv._creationTime);
                waitCount++;
            }
        }

        const avgWaitTimeTodayMs = waitCount > 0 ? totalWaitMs / waitCount : null;

        return {
            botsCount,
            liveStats: {
                openCount: openConversations.length,
                waitingCount: waitingConversations.length,
                onlineTeammatesCount,
                myAssignedCount: myAssigned.length
            },
            liveQueue,
            recentActivities,
            todaySnapshot: {
                todayCount,
                diffFromYesterday: todayCount - yesterdayCount,
                botResolvedToday,
                avgWaitTimeTodayMs
            }
        };
    }
});
```

### ⚠️ Observations

- **Full scan of `conversations` table** (per project): `.collect()` with no status/date filtering at the index level. All counts (open, waiting, today, yesterday) are derived from the same in-memory array.
- **Full scan of `bots` table** (per project) just to get a count (`bots.length`).
- **Full scan of `conversation_events`** for today — `.collect()` then filters by `handledBy === "bot"` in JS.
- **N+1 profile lookups**: Iterates over distinct `assignedUserIds` and queries `profiles` for each one.
- **Up to 20 additional `messages` queries**: For avg wait time, it queries the `messages` table for each of the first 20 today-conversations.
- This is the **heaviest query** in the audit — a single call triggers potentially dozens of DB reads.

---

## 4. `routing.routeConversation`

| Property | Value |
|---|---|
| **File** | [routing.ts](file:///home/mohamed/lab/yoosr/convex/routing.ts#L7-L157) |
| **Function type** | `internalMutation` |
| **What it reads** | `conversations` (by ID), `departments` (by ID), `bots` (by `by_projectId` index + `.collect()`), `projects` (by ID), `profiles` (by `by_orgId` index + `.collect()`), `conversations` (by `by_projectId_status` index + `.collect()`) |

### Full Implementation

```typescript
export const routeConversation = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
        initialMessage: v.optional(v.string()),
        skipBot: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Do not route if conversation is already resolved (1000)
        if (conversation.status === 1000) return;

        // 1. Check for AI Bot (Highest Priority)
        if (!args.skipBot) {
            let botIdToAssign: string | null = null;

            // Check department for specific bot override
            if (args.departmentId) {
                const dept = await ctx.db.get(args.departmentId);
                if (dept?.botId) botIdToAssign = dept.botId;
            }

            // Fallback to project's active bot
            if (!botIdToAssign) {
                const bots = await ctx.db
                    .query("bots")
                    .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
                    .collect();

                const activeBots = bots.filter(b => b.status === "active");
                if (activeBots.length > 0) {
                    botIdToAssign = activeBots[0]._id;
                }
            }

            if (botIdToAssign) {
                let participants = conversation.participants || [];
                if (!participants.includes(botIdToAssign)) {
                    participants.push(botIdToAssign);
                }

                await ctx.db.patch(args.conversationId, {
                    botId: botIdToAssign,
                    status: 200,
                    participants,
                    updatedAt: Date.now(),
                });

                // Trigger the Design Studio BotEngine action
                await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                    conversationId: args.conversationId,
                    incomingMessage: args.initialMessage ?? "",
                });
                return; // Bot assigned, exit routing
            }
        }

        // 2. No Bot -> Check for Available Human Agents (Second Priority)
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        let availableAgents = await ctx.db
            .query("profiles")
            .withIndex("by_orgId", (q) => q.eq("orgId", project.orgId))
            .filter((q) => q.eq(q.field("isAvailable"), true))
            .collect();

        let skipAssignment = false;
        if (args.departmentId) {
            const department = await ctx.db.get(args.departmentId);
            if (department) {
                if (department.routingMode === "pooled") {
                    skipAssignment = true;
                }
                if (department.memberIds) {
                    const memberIds = new Set(department.memberIds);
                    availableAgents = availableAgents.filter((agent) =>
                        memberIds.has(agent.userId)
                    );
                }
            }
        }

        let chosenAgentId: string | null = null;

        if (availableAgents.length > 0 && !skipAssignment) {
            // Apply least-busy algorithm
            const activeConversations = await ctx.db
                .query("conversations")
                .withIndex("by_projectId_status", (q) =>
                    q.eq("projectId", args.projectId).eq("status", 200)
                )
                .collect();

            const agentLoads = new Map<string, number>();
            availableAgents.forEach(a => agentLoads.set(a.userId!, 0));

            activeConversations.forEach(c => {
                if (c.assignedTo && agentLoads.has(c.assignedTo)) {
                    agentLoads.set(c.assignedTo, agentLoads.get(c.assignedTo)! + 1);
                }
            });

            let minLoad = Infinity;
            for (const [agentId, load] of agentLoads.entries()) {
                if (load < minLoad) {
                    minLoad = load;
                    chosenAgentId = agentId;
                }
            }
        }

        if (chosenAgentId) {
            let participants = conversation.participants || [];
            if (!participants.includes(chosenAgentId)) {
                participants.push(chosenAgentId);
            }

            await ctx.db.patch(args.conversationId, {
                assignedTo: chosenAgentId,
                status: 200,
                participants,
                updatedAt: Date.now(),
            });

            await ctx.db.insert("messages", {
                conversationId: args.conversationId,
                projectId: args.projectId,
                senderType: "bot",
                content: "An agent has joined the conversation.",
            });
        } else {
            // 3. No Bot and No Agents -> Leave in Unassigned Queue
            await ctx.db.patch(args.conversationId, {
                status: 100,
                updatedAt: Date.now(),
            });
        }
    },
});
```

### ⚠️ Observations

- **`internalMutation`** — not a `query`, not a public `mutation`. It's only callable from other server-side functions (e.g., via `ctx.scheduler.runAfter`).
- Reads:
  1. The target `conversation` by ID
  2. Optionally the `department` by ID (for bot override + routing mode)
  3. All `bots` for the project via `.collect()` (filtered by `status === "active"` in JS)
  4. The `project` by ID
  5. All `profiles` in the org via `.collect()` (filtered by `isAvailable` at the Convex filter level, but that's not an index — it's a `.filter()` post-scan)
  6. All status-200 `conversations` for the least-busy algorithm via `.collect()`
- The `isAvailable` filter on `profiles` uses `.filter()` (server-side but not indexed). For small orgs this is fine; for large orgs it would read every profile.
- The least-busy algorithm collects **all** assigned (status 200) conversations in the project to compute agent loads.

---

## Summary Table

| Function | Type | Collection Method | Filters Before Collect? | Full Table Scan Risk |
|---|---|---|---|---|
| `conversations.list` | `query` | `.collect()` | Index: `by_projectId` only | 🟡 All convos per project |
| `conversations.getConversations` | `query` | `.collect()` | Index: `by_projectId` only | 🔴 All convos + N+1 profile lookups |
| `dashboard.getHomeStats` | `query` | `.collect()` (×3 tables) | Index: `by_projectId` only | 🔴 Heaviest — convos + bots + events + N+1 profiles + N messages |
| `routing.routeConversation` | `internalMutation` | `.collect()` (×3 tables) | Index-scoped, no status filter in index for bots | 🟡 Moderate — bounded by org size + active convos |
