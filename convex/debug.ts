import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getFirstConv = query({
    args: {},
    handler: async (ctx): Promise<Id<"conversations"> | undefined> => {
        const conv = await ctx.db.query("conversations").first();
        return conv?._id;
    }
});

export const getFirstBot = query({
    args: {},
    handler: async (ctx): Promise<Id<"bots"> | undefined> => {
        const bot = await ctx.db.query("bots").first();
        return bot?._id;
    }
});

export const triggerTestExecute = action({
    args: {},
    handler: async (ctx): Promise<string> => {
        const convId = await ctx.runQuery(api.debug.getFirstConv as any);
        if (!convId) return "No conversation found";

        const botId = await ctx.runQuery(api.debug.getFirstBot as any);
        if (!botId) return "No bots found to assign";

        // Assign bot to the conversation
        await ctx.runMutation(internal.bot.updateConversationState, {
            id: convId as Id<"conversations">,
            botId: botId as Id<"bots">,
            attributes: {},
        });

        await ctx.runAction(internal.bot.executeNextBlock, {
            conversationId: convId as Id<"conversations">,
            incomingMessage: "test message",
        });
        return `Assigned bot ${botId} and triggered execution for ${convId}`;
    }
});

export const compileAndSaveFirstBot = action({
    args: {},
    handler: async (ctx): Promise<string> => {
        const botId = await ctx.runQuery(api.debug.getFirstBot as any);
        if (!botId) return "No bot found";

        // Fetch existing flow
        const flowDef = await ctx.runQuery(internal.bot.getBotFlow, { botId: botId as Id<"bots"> });
        if (!flowDef) return "No flow found";

        await ctx.runMutation(api.botFlows.save, {
            botId: botId as Id<"bots">,
            nodes: flowDef.nodes,
            edges: flowDef.edges || [],
            variables: flowDef.variables
        });

        return "Successfully saved and compiled flow for bot " + botId;
    }
});

export const get_all_bot_flows = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("bot_flows").collect();
    }
});
