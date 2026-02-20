import { internalMutation } from "./_generated/server";

export const migrateStatuses = internalMutation({
    args: {},
    handler: async (ctx) => {
        const conversations = await ctx.db.query("conversations").collect();
        let changed = 0;
        for (const conv of conversations) {
            if (typeof conv.status === "string") {
                let newStatus = 100;
                if (conv.status === "assigned" || conv.status === "open") {
                    newStatus = conv.assignedTo ? 200 : 100;
                } else if (conv.status === "resolved" || conv.status === "closed") {
                    newStatus = 1000;
                }
                await ctx.db.patch(conv._id, { status: newStatus });
                changed++;
            }
        }
        return `Migrated ${changed} conversations`;
    }
});
