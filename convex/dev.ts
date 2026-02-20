import { mutation } from "./_generated/server";

export const clearAllProjects = mutation({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();

        for (const project of projects) {
            const projectId = project._id;

            // 1. Bot flows and bots
            const bots = await ctx.db.query("bots").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const bot of bots) {
                const flows = await ctx.db.query("bot_flows").withIndex("by_botId", (q) => q.eq("botId", bot._id)).collect();
                for (const f of flows) await ctx.db.delete(f._id);
                await ctx.db.delete(bot._id);
            }

            // 2. KBs and KB sources
            const kbs = await ctx.db.query("knowledge_bases").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const kb of kbs) {
                const sources = await ctx.db.query("knowledge_base_sources").withIndex("by_kbId", (q) => q.eq("kbId", kb._id)).collect();
                for (const s of sources) await ctx.db.delete(s._id);
                await ctx.db.delete(kb._id);
            }

            // 3. other tables
            const records1 = await ctx.db.query("messages").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records1) await ctx.db.delete(r._id);

            const records2 = await ctx.db.query("conversations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records2) await ctx.db.delete(r._id);

            const records3 = await ctx.db.query("project_members").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records3) await ctx.db.delete(r._id);

            const records4 = await ctx.db.query("contacts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records4) await ctx.db.delete(r._id);

            const records5 = await ctx.db.query("integrations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records5) await ctx.db.delete(r._id);

            const records6 = await ctx.db.query("activity_logs").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records6) await ctx.db.delete(r._id);

            const records7 = await ctx.db.query("departments").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records7) await ctx.db.delete(r._id);

            const records8 = await ctx.db.query("canned_responses").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records8) await ctx.db.delete(r._id);

            const records9 = await ctx.db.query("labels").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records9) await ctx.db.delete(r._id);

            const records10 = await ctx.db.query("operating_hours").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
            for (const r of records10) await ctx.db.delete(r._id);

            await ctx.db.delete(projectId);
        }
    }
});
