import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List project members
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Add a member (invite)
export const invite = mutation({
    args: {
        projectId: v.id("projects"),
        invitedEmail: v.string(),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("project_members", {
            projectId: args.projectId,
            role: args.role ?? "agent",
            status: "available",
            invitedEmail: args.invitedEmail,
            invitedAt: Date.now(),
        });
    },
});

// Update member role or status
export const update = mutation({
    args: {
        id: v.id("project_members"),
        role: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, val] of Object.entries(updates)) {
            if (val !== undefined) clean[k] = val;
        }
        await ctx.db.patch(id, clean);
    },
});

// Remove a member
export const remove = mutation({
    args: { id: v.id("project_members") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        await ctx.db.delete(args.id);
    },
});
