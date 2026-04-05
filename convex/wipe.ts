import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const wipeAll = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const tables = [
      "messages",
      "conversations",
      "contacts",
      "orders",
      "labels",
      "departments",
      "bots",
      "activity_logs",
      "integrations",
      "canned_responses",
      "operating_hours",
      "knowledge_bases",
      "conversation_events",
      "csat_ratings",
      "token_usage",
      "unanswered_queries",
      "webhook_subscriptions",
      "webhook_deliveries",
    ] as const;

    let total = 0;

    for (const table of tables) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
        .collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
        total++;
      }
    }

    return { success: true, deleted: total };
  },
});
