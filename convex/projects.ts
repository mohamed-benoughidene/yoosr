import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal: get project for widget (no auth required)
export const getPublic = internalQuery({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) return null;
        return { name: project.name, widgetConfig: project.widgetConfig };
    },
});

// List all projects for the current user
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("projects")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", identity.subject))
            .collect();
    },
});

// Get a single project by ID
export const get = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const project = await ctx.db.get(args.id);
        if (!project || project.ownerId !== identity.subject) {
            return null;
        }
        return project;
    },
});

// Create a new project
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            description: args.description,
            ownerId: identity.subject,
            status: "active",
        });

        // Also create the owner as a project member
        await ctx.db.insert("project_members", {
            projectId,
            userId: identity.subject,
            role: "owner",
            status: "available",
        });

        return projectId;
    },
});

// Update a project
export const update = mutation({
    args: {
        id: v.id("projects"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        widgetConfig: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.ownerId !== identity.subject) {
            throw new Error("Project not found");
        }

        const { id, ...updates } = args;
        // Filter out undefined values
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(args.id, cleanUpdates);
        return args.id;
    },
});

// Delete a project
export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.ownerId !== identity.subject) {
            throw new Error("Project not found");
        }

        await ctx.db.delete(args.id);
    },
});
