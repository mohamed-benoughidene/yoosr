# Audit: Department Routing and Bot Logic

## 1. `change_department` Node Shape (src/types/flow.ts)

The `change_department` block is defined in the `BLOCK_TYPES` registry:

```typescript
{
    type: "change_department",
    label: "Change Dept",
    description: "Route to department",
    icon: "Network",
    color: "text-cyan-500",
    defaultData: { label: "Change Dept", departmentId: "" },
}
```

## 2. NodePropertiesPanel UI (src/components/design-studio/NodePropertiesPanel.tsx)

The UI for configuring the `change_department` node uses a Shadcn `Select` component:

```tsx
{/* Change Dept Node */}
{node.type === "change_department" && (
    <div className="space-y-1.5">
        <Label className="text-xs">Department</Label>
        <Select
            value={data.departmentId || ""}
            onValueChange={(val) => update("departmentId", val)}
        >
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
                {departments.length === 0 ? (
                    <SelectItem value="none" disabled>
                        No departments found
                    </SelectItem>
                ) : (
                    departments.map((dept: any) => (
                        <SelectItem key={dept._id} value={dept._id}>
                            {dept.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    </div>
)}
```

## 3. `change_department` case in bot.ts (convex/bot.ts)

The full implementation of the `change_department` action:

```typescript
case "change_department":
    const c3 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
    await ctx.runMutation(internal.conversations.updateInternal, {
        id: conversationId,
        departmentId: action.departmentId,
    });
    await ctx.runMutation(internal.routing.routeConversation, {
        conversationId: conversationId,
        projectId: c3.projectId,
        departmentId: action.departmentId,
    });
    return { suspend: true };
```

## 4. `routeConversation` Mutation (convex/routing.ts)

The full routing logic:

```typescript
export const routeConversation = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        departmentId: v.optional(v.id("departments")),
        initialMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Do not route if conversation is already resolved (1000)
        if (conversation.status === 1000) return;

        // 1. Check for AI Bot (Highest Priority)
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
                // assignedTo remains undefined as they are not Clerk Users
                botId: botIdToAssign, // Set the specific bot owner
                status: 200, // Bot is now the assigned actor (status 200)
                participants,
                updatedAt: Date.now(),
            });

            // Trigger the Design Studio BotEngine action 
            // to evaluate the conversational graph nodes (Start Node).
            await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                conversationId: args.conversationId,
                incomingMessage: args.initialMessage ?? "",
            });
            return; // Bot assigned, exit routing
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
                // If department is in "pooled" mode, we skip the automatic assignment/least-busy logic
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
                .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 200))
                .collect();

            const agentWorkload: Record<string, number> = {};
            availableAgents.forEach((agent) => {
                agentWorkload[agent.userId] = 0;
            });

            activeConversations.forEach((c) => {
                if (c.assignedTo && agentWorkload[c.assignedTo] !== undefined) {
                    agentWorkload[c.assignedTo]++;
                }
            });

            // Find agent with minimum workload
            let minLoad = Infinity;
            availableAgents.forEach((agent) => {
                if (agentWorkload[agent.userId] < minLoad) {
                    minLoad = agentWorkload[agent.userId];
                    chosenAgentId = agent.userId;
                }
            });
        }

        if (chosenAgentId) {
            let participants = conversation.participants || [];
            if (!participants.includes(chosenAgentId)) {
                participants.push(chosenAgentId);
            }

            await ctx.db.patch(args.conversationId, {
                assignedTo: chosenAgentId,
                status: 200,
                botId: undefined, // Human takes over
                participants,
                updatedAt: Date.now(),
            });
        } else {
            // No agent available or pooled mode -> Mark as unassigned (pending)
            await ctx.db.patch(args.conversationId, {
                assignedTo: undefined,
                botId: undefined,
                status: 100, // Pending human intervention
                updatedAt: Date.now(),
            });
        }
    },
});
```

## 5. Condition/Branch Block Handling (convex/bot.ts)

The implementation of the `condition` block:

```typescript
case "condition":
    const result = evaluateCondition(action.expression, attributes);
    return {
        newAttributes: {},
        nextNodeId: result ? action.truePath : action.falsePath,
    };
```
