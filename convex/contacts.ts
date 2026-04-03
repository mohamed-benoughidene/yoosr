import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertProjectOwnership, checkProjectOwnership } from "./utils";
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
            .take(500); // TODO: replace with paginated aggregation
    },
});

// Get contact by conversation ID
export const findByConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const contact = await ctx.db
            .query("contacts")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .first();

        if (!contact) return null;

        const project = await checkProjectOwnership(ctx, contact.projectId, identity as unknown as { org_id: string });
        if (!project) return null;

        return contact;
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

        const contactId = await ctx.db.insert("contacts", args);

        // Wire contact.created webhook
        await ctx.scheduler.runAfter(0, internal.webhooks.fireWebhookEvent, {
            projectId: args.projectId,
            event: "contact.created",
            payload: { contactId, projectId: args.projectId },
        });

        return contactId;
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

        const contact = await ctx.db.get(args.id);
        if (!contact) throw new ConvexError("Contact not found");

        await assertProjectOwnership(ctx, contact.projectId, identity as unknown as { org_id: string });

        const { id, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
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

        const contact = await ctx.db.get(args.id);
        if (!contact) throw new Error("Contact not found");

        // Block deletion if the contact is linked to an active (non-resolved) conversation
        if (contact.conversationId) {
            const conversation = await ctx.db.get(contact.conversationId);
            if (conversation && conversation.status !== 1000) {
                throw new ConvexError("Cannot delete a contact with active conversations");
            }
        }

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

        const orgId = (identity as unknown as { org_id: string }).org_id;
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
