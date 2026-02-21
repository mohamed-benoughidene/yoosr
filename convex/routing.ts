import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// The Smart Assignment Engine for Tiledesk architecture
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
