import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const getFirstConv = query({
    args: {},
    handler: async (ctx) => {
        const conv = await ctx.db.query("conversations").first();
        return conv?._id;
    }
});

export const getFirstBot = query({
    args: {},
    handler: async (ctx) => {
        const bot = await ctx.db.query("bots").first();
        return bot?._id;
    }
});

export const triggerTestExecute = action({
    args: {},
    handler: async (ctx) => {
        const convId = await ctx.runQuery(api.debug.getFirstConv);
        if (!convId) return "No conversation found";

        const botId = await ctx.runQuery(api.debug.getFirstBot);
        if (!botId) return "No bots found to assign";

        // Assign bot to the conversation
        await ctx.runMutation(internal.bot.updateConversationState, {
            id: convId,
            botId: botId,
            attributes: {},
        });

        await ctx.runAction(internal.bot.executeNextBlock, {
            conversationId: convId,
            incomingMessage: "test message",
        });
        return `Assigned bot ${botId} and triggered execution for ${convId}`;
    }
});

export const compileAndSaveFirstBot = action({
    args: {},
    handler: async (ctx) => {
        const botId = await ctx.runQuery(api.debug.getFirstBot);
        if (!botId) return "No bot found";

        // Fetch existing flow
        const flowDef = await ctx.runQuery(internal.bot.getBotFlow, { botId });
        if (!flowDef) return "No flow found";

        await ctx.runMutation(api.botFlows.save, {
            botId,
            nodes: flowDef.nodes,
            edges: flowDef.edges || [],
            variables: flowDef.variables
        });

        return "Successfully saved and compiled flow for bot " + botId;
    }
});
