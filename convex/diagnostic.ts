// DIAGNOSTIC ONLY — never call from production code.
// This file exists for local debugging only.
// getBotFlow runs .collect() on all bot_flows globally and will OOM on real data.

import { internalQuery } from "./_generated/server";

export const getRecentMessages = internalQuery({
    args: {},
    handler: async (ctx) => {
        const msgs = await ctx.db.query("messages").order("desc").take(10);
        return msgs.map(m => ({ content: m.content, type: m.senderType }));
    }
});

export const getConvoPointer = internalQuery({
    args: {},
    handler: async (ctx) => {
        const convos = await ctx.db.query("conversations").order("desc").take(5);
        return await Promise.all(convos.map(async (c) => {
            const botState = await ctx.db
                .query("conversation_bot_state")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", c._id))
                .first();
            return {
                id: c._id,
                attributes: botState?.attributes ?? c.attributes,
                status: c.status,
                participants: c.participants,
            };
        }));
    },
});

export const getBotFlow = internalQuery({
    args: {},
    handler: async (ctx) => {
        if (process.env.NODE_ENV !== "development") {
            throw new Error("diagnostic.getBotFlow is disabled outside development");
        }
        const flows = await ctx.db.query("bot_flows").order("desc").collect();
        return flows.length > 0 ? { nodes: flows[0].nodes, edges: flows[0].edges } : null;
    }
});
