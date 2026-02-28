# Conversation Routing & Assignment Context Report

This report audits the conversation assignment, transfer, and agent availability mechanisms in the Yoosr codebase.

---

## 1. Schema Definitions (convex/schema.ts)

### Conversations Table
```typescript
    // Conversations (chat threads from visitors)
    conversations: defineTable({
        projectId: v.id("projects"),
        visitorId: v.optional(v.string()),
        visitorName: v.optional(v.string()),
        assignedTo: v.optional(v.string()), // Clerk user ID of assigned agent
        status: v.optional(v.union(v.literal(100), v.literal(200), v.literal(1000))), // 100: unassigned, 200: assigned, 1000: closed
        lastMessage: v.optional(v.string()),
        resolvedBy: v.optional(v.string()), // Clerk user ID of who resolved it
        visitorEmail: v.optional(v.string()),
        visitorPhone: v.optional(v.string()),
        visitorAddress: v.optional(v.string()),
        visitorNote: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
        rating: v.optional(v.number()), // 1-5
        feedback: v.optional(v.string()), // Optional feedback text
        updatedAt: v.optional(v.number()),
        // Execution engine state
        currentNodeId: v.optional(v.union(v.string(), v.null())),
        executionLog: v.optional(v.array(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number()
        }))),
        botId: v.optional(v.string()),
        // Legacy fields to prevent schema validation errors
        leadId: v.optional(v.string()),
        firstText: v.optional(v.string()),
        participants: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
        attributes: v.optional(v.any()),
        typing: v.optional(v.any()),
        // HITL Handoff
        botPaused: v.optional(v.boolean()), // true = bot will not respond to new messages
        handoffSource: v.optional(v.string()), // 'bot' = escalated by the bot flow
    })
        .index("by_projectId", ["projectId"])
        .index("by_projectId_status", ["projectId", "status"]),
```

### Departments Table
```typescript
    // Departments
    departments: defineTable({
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        routingMode: v.optional(v.string()), // "pooled" | "assigned"
        botId: v.optional(v.string()), // Bot ID if AI-assigned
        tags: v.optional(v.array(v.string())),
    }).index("by_projectId", ["projectId"]),
```

### Project Members Table
```typescript
    // Project members (team)
    project_members: defineTable({
        projectId: v.id("projects"),
        userId: v.optional(v.string()), // Clerk user ID (null if invited but not joined)
        role: v.string(), // "owner" | "administrator" | "agent"
        status: v.string(), // "available" | "unavailable"
        invitedEmail: v.optional(v.string()),
        invitedAt: v.optional(v.number()),
        inviteStatus: v.optional(v.string()), // "pending" | "accepted" | "rejected"
    })
        .index("by_projectId", ["projectId"])
        .index("by_userId", ["userId"])
        .index("by_invitedEmail", ["invitedEmail"]),
```

---

## 2. Assignment & Routing Mutations

### Main Update Mutation (convex/conversations.ts)
Handles manual assignment (setting `assignedTo`).
```typescript
export const update = mutation({
    args: {
        id: v.id("conversations"),
        status: v.optional(v.string()),
        assignedTo: v.optional(v.string()),
        unreadCount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        // HITL Safeguards: if manually assigning, status becomes 200 and botPaused is cleared
        if (args.assignedTo) {
            cleanUpdates.status = 200;
            cleanUpdates.botPaused = false; // Human has taken over — re-enable bot for future if needed
            const conversation = await ctx.db.get(args.id);
            if (conversation) {
                const participants = conversation.participants || [];
                if (!participants.includes(args.assignedTo)) {
                    participants.push(args.assignedTo);
                }
                cleanUpdates.participants = participants;
            }
        }

        await ctx.db.patch(args.id, cleanUpdates);
    },
});
```

### Join Conversation (convex/conversations.ts)
```typescript
export const join = mutation({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const conversation = await ctx.db.get(args.id);
        if (!conversation) throw new Error("Conversation not found");

        const participants = conversation.participants || [];
        if (!participants.includes(identity.subject)) {
            participants.push(identity.subject);
        }

        const updates: Record<string, any> = {
            participants,
            updatedAt: Date.now(),
        };

        // Auto-assign to first joining agent if unassigned
        if (!conversation.assignedTo) {
            updates.assignedTo = identity.subject;
            updates.status = 200; // Assigned
        }

        await ctx.db.patch(args.id, updates);
    },
});
```

### Smart Routing Engine (convex/routing.ts)
Implements least-busy algorithm and bot fallback.
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

        // 1. Get all members for this project
        const members = await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Filter for available human agents who have joined (userId exists)
        const availableAgents = members.filter(
            (m) => m.status === "available" && m.userId && (m.role === "agent" || m.role === "administrator" || m.role === "owner")
        );

        let chosenAgentId: string | null = null;

        // Apply least-busy algorithm if humans are online
        if (availableAgents.length > 0) {
            // Find ALL active conversations for this project (status 200)
            const activeConversations = await ctx.db
                .query("conversations")
                .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 200))
                .collect();

            // Initialize agent loads
            const agentLoads = new Map<string, number>();
            availableAgents.forEach(a => agentLoads.set(a.userId!, 0));

            // Count current loads
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

        // Action routing based on chosen agent
        if (chosenAgentId) {
            // Assign to human agent
            let participants = conversation.participants || [];
            if (!participants.includes(chosenAgentId)) {
                participants.push(chosenAgentId);
            }

            await ctx.db.patch(args.conversationId, {
                assignedTo: chosenAgentId,
                status: 200, // 200: Assigned to Agent
                participants,
                updatedAt: Date.now(),
            });

            // Optional: Send system message about assignment
            await ctx.db.insert("messages", {
                conversationId: args.conversationId,
                projectId: args.projectId,
                senderType: "bot",
                content: "An agent has joined the conversation.",
            });

        } else {
            // No available agents -> Fallback to AI Bot Queue
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
            } else {
                // If NO bots and NO agents are online, leave it as Unassigned Queue (100)
                await ctx.db.patch(args.conversationId, {
                    status: 100, // pooled
                    updatedAt: Date.now(),
                });
            }
        }
    },
});
```

### Bot Handoff (convex/bot.ts)
Back to unassigned pool (status 100).
```typescript
export const assignToHuman = internalMutation({
    args: { conversationId: v.id("conversations"), deptId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.id);
        if (!conversation) return;

        await ctx.db.patch(args.conversationId, {
            status: 100,            // Back to unassigned pool
            botId: undefined,       // Detach bot so it won't be re-triggered
            botPaused: true,        // Hard-stop guard — even if botId leaks back
            handoffSource: "bot",   // Agent UI badge: this came from a bot escalation
            currentNodeId: null,    // Clear node pointer
            assignedTo: undefined,  // Ensure no stale agent assignment
        });
    }
});
```

---

## 3. UI Components (src/app/components/chat/)

### Conversation List (src/components/chat/ConversationList.tsx)
```tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProject } from "@/context/ProjectContext"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"

type ChatTab = "all" | "unread"

export function ConversationList() {
    const { activeProject } = useProject()
    const { user } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentConversationId = searchParams.get("conversationId")
    const [activeTab, setActiveTab] = useState<ChatTab>("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Real-time conversations — only show assigned to me
    const allConversations = useQuery(
        api.conversations.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    // Chat only shows conversations assigned to the current agent
    const conversations = allConversations.filter((c: any) => c.assignedTo === user?.id)

    const createConversation = useMutation(api.conversations.create)

    const handleNewChat = async () => {
        if (!activeProject || !user) return

        try {
            const conversationId = await createConversation({
                projectId: activeProject._id,
                visitorName: "New Visitor",
            })
            router.push(`/dashboard/chat?conversationId=${conversationId}`)
        } catch (error) {
            console.error("Error creating new chat:", error)
        }
    }

    const handleSelectConversation = (id: string) => {
        router.push(`/dashboard/chat?conversationId=${id}`)
    }

    // Filter conversations based on active tab and search
    const filteredConversations = conversations.filter((conv) => {
        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            const matchesName = (conv.visitorName || "").toLowerCase().includes(q)
            const matchesMessage = (conv.lastMessage || "").toLowerCase().includes(q)
            if (!matchesName && !matchesMessage) return false
        }

        switch (activeTab) {
            case "all":
                // Show all conversations including resolved ones in 'All' tab
                return true
            case "unread":
                return (conv.unreadCount ?? 0) > 0
            default:
                return true
        }
    })

    const unreadCount = conversations.filter((c: any) => (c.unreadCount ?? 0) > 0).length

    const tabs: { key: ChatTab; label: string; count?: number }[] = [
        { key: "all", label: "All" },
        { key: "unread", label: "Unread", count: unreadCount },
    ]

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Conversations</h2>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {tabs.map((tab) => (
                        <Badge
                            key={tab.key}
                            variant={activeTab === tab.key ? "secondary" : "outline"}
                            className={cn(
                                "cursor-pointer hover:bg-muted transition-colors",
                                activeTab === tab.key && "bg-muted-foreground/20 font-medium"
                            )}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                    {tab.count}
                                </span>
                            )}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="flex flex-col">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv._id}
                            className={cn(
                                "flex flex-col gap-2 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b",
                                (conv.unreadCount ?? 0) > 0 ? "bg-muted/20" : "",
                                currentConversationId === conv._id ? "bg-muted" : ""
                            )}
                            onClick={() => handleSelectConversation(conv._id)}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{conv.visitorName || "Visitor"}</div>
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                        {conv.lastMessage || "No messages yet"}
                                    </div>
                                    {conv.status === 1000 && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
                                            Resolved
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
```

### Contact Info Panel AssignedTo Row (src/components/dashboard/monitor/contact-info.tsx)
```tsx
<div className="flex items-center gap-3">
    <User className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-muted-foreground">Assigned to: </span>
    <span>{conversation.assignedTo || "Unassigned"}</span>
</div>
```

---

## 4. Dropdown Menus (Three-Dot Menu)

In `src/components/dashboard/monitor/chat-display.tsx`:
```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem
            onClick={() => joinConversation({ id: conversation.id as Id<"conversations"> })}
            disabled={isJoined || conversation.status === 1000}
        >
            Assign to me
        </DropdownMenuItem>
        <DropdownMenuItem
            onClick={handleClose}
            disabled={conversation.status === 1000}
        >
            Resolve conversation
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```
*Note: `ChatArea.tsx` does not currently possess a three-dot menu.*

---

## 5. Keyword Search Results (Convex Files)

### "assignedTo"
- **convex/bot.ts:537**: `assignedTo: undefined, // Ensure no stale agent assignment`
- **convex/routing.ts:48**: `if (c.assignedTo && agentLoads.has(c.assignedTo)) {`
- **convex/routing.ts:71**: `assignedTo: chosenAgentId,`
- **convex/analytics.ts:106**: `const handledBy = (c.assignedTo || c.resolvedBy) ? "agent" : "bot";`
- **convex/conversations.ts:78**: `assignedTo: v.optional(v.string()),`
- **convex/conversations.ts:92**: `if (args.assignedTo) {`
- **convex/conversations.ts:343**: `updates.assignedTo = identity.subject;`
- **convex/conversations.ts:374**: `updates.assignedTo = undefined;`
- **convex/schema.ts:43**: `assignedTo: v.optional(v.string()), // Clerk user ID of assigned agent`
- **convex/dashboard.ts:34**: `const myAssigned = openConversations.filter(c => c.assignedTo === identity.subject);`

### "transfer"
- **convex/botFlows.ts:104**: `actions.push({ _type: "reply", text: data.handoffMessage || "Transferring you to an agent..." });`
- **convex/aiFlowBuilder.ts:73**: `Transfers to a human agent. Terminal node.`

### "department"
- **convex/bot.ts:173**: `case "change_department":`
- **convex/bot.ts:178**: `departmentId: action.departmentId,`
- **convex/routing.ts:11**: `departmentId: v.optional(v.id("departments")),`
- **convex/routing.ts:91**: `const dept = await ctx.db.get(args.departmentId);`
- **convex/botFlows.ts:151**: `case "change_department":`
- **convex/conversations.ts:550**: `department: c.attributes?.department ?? "General",`
- **convex/schema.ts:147**: `// Departments`
- **convex/settings.ts:21**: `export const createDepartment = mutation({`
- **convex/settings.ts:48**: `export const updateDepartment = mutation({`
