import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// List contacts for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("contacts")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Get contact by conversation ID
export const findByConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const contacts = await ctx.db
            .query("contacts")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return contacts[0] ?? null;
    },
});

// Create a new contact
export const create = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        note: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        conversationId: v.optional(v.id("conversations")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("contacts", args);
    },
});

// Update a contact
export const update = mutation({
    args: {
        id: v.id("contacts"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        note: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(id, cleanUpdates);
    },
});

// Remove a contact
export const remove = mutation({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.delete(args.id);
    },
});

// Batch import contacts
export const batchImport = mutation({
    args: {
        contacts: v.array(
            v.object({
                name: v.string(),
                email: v.optional(v.string()),
                phone: v.optional(v.string()),
                address: v.optional(v.string()),
                note: v.optional(v.string()),
                tags: v.optional(v.array(v.string())),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        if (args.contacts.length === 0 || args.contacts.length > 500) {
            throw new ConvexError("Array must contain between 1 and 500 contacts");
        }

        const orgId = (identity as any).org_id;
        if (!orgId) throw new Error("No organization ID found in identity");

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .first();

        if (!project) {
            throw new Error("Project not found");
        }

        const projectId = project._id;
        let inserted = 0;
        let skipped = 0;

        for (const contact of args.contacts) {
            if (contact.email) {
                const existing = await ctx.db
                    .query("contacts")
                    .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
                    .filter((q) => q.eq(q.field("email"), contact.email))
                    .first();

                if (existing) {
                    skipped++;
                    continue;
                }
            }

            await ctx.db.insert("contacts", {
                projectId,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                address: contact.address,
                note: contact.note,
                tags: contact.tags,
            });
            inserted++;
        }

        return { inserted, skipped };
    },
});
