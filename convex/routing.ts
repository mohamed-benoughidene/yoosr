import { internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// The Smart Assignment Engine for Yoosr architecture
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
        if (!conversation) throw new Error("Conversation not found in routing");

        // Do not route if conversation is already resolved (1000)
        if (conversation.status === 1000) return;

        // 1. Check for AI Bot (Highest Priority)
        if (!args.skipBot) {
            let botIdToAssign: Id<"bots"> | null = null;

            // Check department for specific bot override
            if (args.departmentId) {
                const dept = await ctx.db.get(args.departmentId);
                if (dept?.botId) botIdToAssign = dept.botId;
            }

            // Fallback to project's active bot
            if (!botIdToAssign) {
                const activeBot = await ctx.db
                    .query("bots")
                    .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
                    .filter(q => q.eq(q.field("status"), "active"))
                    .first();

                if (activeBot) {
                    botIdToAssign = activeBot._id;
                }
            }

            if (botIdToAssign) {
                const participants = conversation.participants || [];
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
                const currentConversation = await ctx.db.get(args.conversationId);
                if (!currentConversation?.botPaused) {
                    await ctx.scheduler.runAfter(0, internal.bot.executeNextBlock, {
                        conversationId: args.conversationId,
                        incomingMessage: args.initialMessage ?? "",
                    });
                }
                return; // Bot assigned, exit routing
            }
        }

        // 2. No Bot -> Check for Available Human Agents (Second Priority)
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found in routing");

        let availableAgents = await ctx.db
            .query("profiles")
            .withIndex("by_orgId_isAvailable", (q) => q.eq("orgId", project.orgId).eq("isAvailable", true))
            .take(50);



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
            // Apply least-busy algorithm — bounded to 1000 active convos (sufficient for load balancing)
            const activeConversations = await ctx.db
                .query("conversations")
                .withIndex("by_projectId_status", (q) => q.eq("projectId", args.projectId).eq("status", 200))
                .take(1000);

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
            const participants = conversation.participants || [];
            if (!participants.includes(chosenAgentId)) {
                participants.push(chosenAgentId);
            }

            await ctx.db.patch(args.conversationId, {
                assignedTo: chosenAgentId,
                status: 200, // 200: Assigned to Agent
                participants,
                updatedAt: Date.now(),
            });

            await ctx.db.insert("messages", {
                conversationId: args.conversationId,
                projectId: args.projectId,
                senderType: "bot",
                content: "system.agentJoined",
                type: "system",
            });
        } else {
            // 3. No Bot and No Agents -> Leave in Unassigned Queue
            await ctx.db.patch(args.conversationId, {
                status: 100, // pooled
                updatedAt: Date.now(),
            });

            // Notify all agents in the organization about the unassigned conversation
            if (project.orgId) {
                const profiles = await ctx.db
                    .query("profiles")
                    .withIndex("by_orgId", (q) => q.eq("orgId", project.orgId!))
                    .take(100);

                for (const profile of profiles) {
                    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                        projectId: args.projectId,
                        recipientId: profile.userId,
                        type: "unassigned_conversation",
                        title: "New unassigned conversation",
                        body: conversation.visitorName || "Anonymous visitor",
                        conversationId: args.conversationId,
                    });
                }
            }
        }
    },
});

export const retryRoutingForAgent = internalAction({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const project = await ctx.runQuery(internal.projects.getByOrgIdInternal, { orgId: args.orgId });
        if (!project) return;

        const conversations = await ctx.runQuery(internal.conversations.listUnassignedInternal, {
            projectId: project._id,
            limit: 20
        });

        for (const conv of conversations) {
            try {
                await ctx.runMutation(internal.routing.routeConversation, {
                    conversationId: conv._id,
                    projectId: conv.projectId,
                });
            } catch (e) {
                console.error("Error retrying routing for conversation", conv._id, e);
            }
        }
    }
});

export const retryUnassignedConversations = internalMutation({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").take(100);
        const threshold = Date.now() - 300000;
        for (const project of projects) {
            const conversations = await ctx.db
                .query("conversations")
                .withIndex("by_projectId_status", (q) => q.eq("projectId", project._id).eq("status", 100))
                .filter((q) => q.and(
                    q.eq(q.field("assignedTo"), undefined),
                    q.lt(q.field("updatedAt"), threshold)
                ))
                .take(50);

            for (const conv of conversations) {
                await ctx.scheduler.runAfter(0, internal.routing.routeConversation, {
                    conversationId: conv._id,
                    projectId: project._id,
                });
            }
        }
    }
});
