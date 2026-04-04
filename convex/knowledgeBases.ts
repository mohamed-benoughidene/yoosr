import { query, mutation, action, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { assertProjectOwnership, checkProjectOwnership } from "./utils";
import { paginationOptsValidator } from "convex/server";

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

        const kb = await ctx.db.get(args.id);
        if (!kb) return null;

        const check = await checkProjectOwnership(ctx, kb.projectId, identity as unknown as { org_id: string });
        if (!check) return null;

        return kb;
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

        await assertProjectOwnership(ctx, args.projectId, identity as unknown as { org_id: string });

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
            .take(100);
    },
});

// List sources for a knowledge base with pagination
export const listSourcesPaginated = query({
    args: { kbId: v.id("knowledge_bases"), paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const kb = await ctx.db.get(args.kbId);
        if (!kb) throw new Error("Knowledge base not found");

        await assertProjectOwnership(ctx, kb.projectId, identity as unknown as { org_id: string });

        return await ctx.db
            .query("knowledge_base_sources")
            .withIndex("by_kbId", (q) => q.eq("kbId", args.kbId))
            .paginate(args.paginationOpts);
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

        const kb = await ctx.db.get(args.kbId);
        if (!kb) throw new ConvexError("Knowledge base not found");

        await assertProjectOwnership(ctx, kb.projectId, identity as unknown as { org_id: string });

        const sourceId = await ctx.db.insert("knowledge_base_sources", {
            kbId: args.kbId,
            type: args.type,
            value: args.value,
            status: "indexing",
        });

        await ctx.scheduler.runAfter(0, internal.knowledge.indexSource, {
            sourceId,
            projectId: kb.projectId,
        });

        return sourceId;
    },
});

// Remove a source
export const removeSource = mutation({
    args: { id: v.id("knowledge_base_sources") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const source = await ctx.db.get(args.id);
        if (!source) throw new ConvexError("Source not found");

        const kb = await ctx.db.get(source.kbId);
        if (!kb) throw new ConvexError("Knowledge base not found");

        await assertProjectOwnership(ctx, kb.projectId, identity as unknown as { org_id: string });

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

// Remove a knowledge base and all its sources
export const remove = mutation({
    args: { kbId: v.id("knowledge_bases") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const kb = await ctx.db.get(args.kbId);
        if (!kb) throw new ConvexError("Not found");

        const project = await ctx.db.get(kb.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new ConvexError("Unauthorized");
        }

        // Schedule the batched deletion job
        await ctx.scheduler.runAfter(0, internal.knowledgeBases.deleteSourcesBatch, {
            kbId: args.kbId,
        });
    },
});

// Internal mutation to delete sources in batches to avoid timeouts
export const deleteSourcesBatch = internalMutation({
    args: { kbId: v.id("knowledge_bases") },
    handler: async (ctx, args) => {
        const sources = await ctx.db
            .query("knowledge_base_sources")
            .withIndex("by_kbId", (q) => q.eq("kbId", args.kbId))
            .take(100);

        for (const source of sources) {
            await ctx.db.delete(source._id);
        }

        if (sources.length === 100) {
            // Schedule another batch
            await ctx.scheduler.runAfter(0, internal.knowledgeBases.deleteSourcesBatch, {
                kbId: args.kbId,
            });
        } else {
            // All sources deleted, remove the knowledge base record itself
            await ctx.db.delete(args.kbId);
        }
    },
});
