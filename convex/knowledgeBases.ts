import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// List knowledge bases for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("knowledge_bases")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(100);
    },
});

// Get a single knowledge base
export const get = query({
    args: { id: v.id("knowledge_bases") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db.get(args.id);
    },
});

// Get default KB for a project (or create one)
export const getOrCreateDefault = mutation({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("knowledge_bases")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("isDefault"), true))
            .first();

        if (existing) return existing;

        const id = await ctx.db.insert("knowledge_bases", {
            projectId: args.projectId,
            name: "Default Knowledge Base",
            description: "Default knowledge base for the project",
            isDefault: true,
        });
        return await ctx.db.get(id);
    },
});

// Create a knowledge base
export const create = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("knowledge_bases", args);
    },
});

// List sources for a knowledge base
export const listSources = query({
    args: { kbId: v.id("knowledge_bases") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("knowledge_base_sources")
            .withIndex("by_kbId", (q) => q.eq("kbId", args.kbId))
            .take(100); // TODO: replace with paginated aggregation
    },
});

// Add a source to a knowledge base
export const addSource = mutation({
    args: {
        kbId: v.id("knowledge_bases"),
        type: v.string(),
        value: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const sourceId = await ctx.db.insert("knowledge_base_sources", {
            kbId: args.kbId,
            type: args.type,
            value: args.value,
            status: "indexing",
        });

        const kb = await ctx.db.get(args.kbId);
        if (kb) {
            await ctx.scheduler.runAfter(0, internal.knowledge.indexSource, {
                sourceId,
                projectId: kb.projectId,
            });
        }

        return sourceId;
    },
});

// Remove a source
export const removeSource = mutation({
    args: { id: v.id("knowledge_base_sources") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.delete(args.id);
    },
});

// Generate upload URL for knowledge base files
export const generateKbUploadUrl = action({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.storage.generateUploadUrl();
    },
});
