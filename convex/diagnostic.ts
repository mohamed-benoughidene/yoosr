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
        return convos.map(c => ({ id: c._id, attributes: c.attributes, status: c.status, participants: c.participants }));
    }
});

export const getBotFlow = internalQuery({
    args: {},
    handler: async (ctx) => {
        const flows = await ctx.db.query("bot_flows").order("desc").collect();
        return flows.length > 0 ? { nodes: flows[0].nodes, edges: flows[0].edges } : null;
    }
});
