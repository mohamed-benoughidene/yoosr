import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { callAITask } from "./openrouter";

/**
 * Scheduled action to extract Generative AI tags from closed conversations
 */
export const extractGenerativeTags = internalAction({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        // Fetch all messages for the conversation
        const messages = await ctx.runQuery(internal.messages.listPublic, {
            conversationId: args.conversationId
        });

        if (!messages || messages.length === 0) return;

        // Fetch predefined labels
        const labels = await ctx.runQuery(internal.tags.getProjectLabels, {
            projectId: args.projectId
        });

        if (!labels || labels.length === 0) return;

        const validLabelNames = labels.map((l: any) => l.name);
        const validLabelsMap = new Map(
            validLabelNames.map((name: string) => [
                name.toLowerCase().trim().replace(/\s+/g, "_"),
                name
            ])
        );

        // Build transcript
        const transcript = messages.map((m: any) => `${m.senderType}: ${m.content}`).join("\n");

        const prompt = `
You are an expert support conversation analyzer.
Given the following conversation transcript, extract 1 to 3 concise tags (1-2 words each) that categorize the user's intent, the topic, or the outcome.
ONLY return tags that match EXACTLY one of the following predefined labels:
${validLabelNames.map((n: string) => `- ${n}`).join("\n")}

Return exactly a JSON array of strings containing the matching names, nothing else. Example: ["billing_issue", "resolved"]
`;

        try {
            const result = await callAITask(prompt, transcript, "meta-llama/llama-3.1-8b-instruct");

            // Parse LLM response
            let tags: string[] = [];
            try {
                const parsed = JSON.parse(result.text);
                if (Array.isArray(parsed)) {
                    const rawTags = parsed.map(t => String(t).toLowerCase().trim().replace(/\s+/g, "_")).filter(t => t.length > 0);
                    tags = rawTags.filter(t => validLabelsMap.has(t)).map(t => validLabelsMap.get(t)!);
                }
            } catch (e) {
                console.error("Failed to parse tags from LLM", result.text);
            }

            if (tags.length > 0) {
                await ctx.runMutation(internal.tags.updateConversationTags, {
                    conversationId: args.conversationId,
                    tags,
                });

                // Log tokens
                await ctx.runMutation(internal.analytics.logTokenUsage, {
                    projectId: args.projectId,
                    model: result.model,
                    tokensUsed: result.tokensUsed,
                    operation: "ai_tags_extraction"
                });
            }
        } catch (error) {
            console.error("Failed to call AI for tags extraction:", error);
        }
    }
});

/**
 * Internal mutation to save tags to the conversation
 */
export const updateConversationTags = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        tags: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const existingTags = conversation.tags || [];
        // merge and deduplicate
        const newTags = Array.from(new Set([...existingTags, ...args.tags]));

        await ctx.db.patch(args.conversationId, {
            tags: newTags
        });
    }
});

/**
 * Internal query to fetch all labels for a project
 */
export const getProjectLabels = internalQuery({
    args: {
        projectId: v.id("projects")
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("labels")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    }
});

/**
 * Assign a tag to a conversation
 */
export const assignTagToConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
        tagName: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const existingTags = conversation.tags || [];
        if (!existingTags.includes(args.tagName)) {
            await ctx.db.patch(args.conversationId, {
                tags: [...existingTags, args.tagName]
            });
        }

        if (identity) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: conversation.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "label_applied",
                targetType: "conversation",
                targetId: args.conversationId,
                metadata: { labelId: args.tagName },
            });
        }
    }
});

/**
 * Remove a tag from a conversation
 */
export const removeTagFromConversation = mutation({
    args: {
        conversationId: v.id("conversations"),
        tagName: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const existingTags = conversation.tags || [];
        const newTags = existingTags.filter(t => t !== args.tagName);

        await ctx.db.patch(args.conversationId, {
            tags: newTags
        });

        if (identity) {
            await ctx.runMutation(internal.activityLogs.logActivityInternal, {
                projectId: conversation.projectId,
                actorId: identity.subject,
                actorName: identity.name ?? identity.email ?? "Unknown",
                action: "label_removed",
                targetType: "conversation",
                targetId: args.conversationId,
                metadata: { labelId: args.tagName },
            });
        }
    }
});
