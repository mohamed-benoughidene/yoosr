import { internalQuery } from "./_generated/server";
export const getFirstProject = internalQuery({
    args: {},
    handler: async (ctx) => {
        const p = await ctx.db.query("projects").first();
        return p ? p._id : null;
    }
});
