import { query, mutation, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./utils";

// List integrations for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Create or update an integration
export const upsert = mutation({
    args: {
        projectId: v.id("projects"),
        provider: v.string(),
        credentials: v.optional(v.any()),
        enabled: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        requireAdmin(identity as any);
        if (!identity) throw new Error("Not authenticated");

        // Check if we already have this provider for this project
        const existing = await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("provider"), args.provider))
            .first();

        if (existing) {
            const updates: Record<string, any> = {};
            if (args.credentials !== undefined) updates.credentials = args.credentials;
            if (args.enabled !== undefined) updates.enabled = args.enabled;
            await ctx.db.patch(existing._id, updates);
            return existing._id;
        } else {
            return await ctx.db.insert("integrations", {
                projectId: args.projectId,
                provider: args.provider,
                credentials: args.credentials ?? {},
                enabled: args.enabled ?? false,
            });
        }
    },
});

// Delete an integration
export const remove = mutation({
    args: { id: v.id("integrations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as any;
        requireAdmin(identity);
        if (!identity) throw new Error("Not authenticated");

        const integration = await ctx.db.get(args.id);
        if (!integration) throw new Error("Integration not found");

        const project = await ctx.db.get(integration.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new ConvexError("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
// Internal: list integrations for a project (no auth required — for use in internal actions)
export const listForProject = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("integrations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});
