import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertProjectOwnership, checkProjectOwnership } from "./utils";
import { v } from "convex/values";
import { authError, notFoundError, userError } from "./errors";
import { CONVERSATION_STATUS } from "./types";
import { softDelete } from "./lib/softDelete";

// List contacts for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("contacts")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
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
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
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
        if (!identity) throw authError();

        await assertProjectOwnership(ctx, args.projectId, identity as unknown as { org_id: string });

        // Validate tags: max 20 tags, max 50 chars each
        if (args.tags) {
            if (args.tags.length > 20) {
                throw userError("Contacts can have at most 20 tags");
            }
            if (args.tags.some(t => t.length > 50)) {
                throw userError("Each tag must be 50 characters or less");
            }
        }

        // Dedup check: email
        if (args.email) {
            const existingEmail = await ctx.db
                .query("contacts")
                .withIndex("by_projectId_email", (q) =>
                    q.eq("projectId", args.projectId).eq("email", args.email)
                )
                .filter((q) => q.eq(q.field("deletedAt"), undefined))
                .first();
            if (existingEmail) {
                throw userError("A contact with this email already exists");
            }
        }

        // Dedup check: phone
        if (args.phone) {
            const existingPhone = await ctx.db
                .query("contacts")
                .withIndex("by_projectId_phone", (q) =>
                    q.eq("projectId", args.projectId).eq("phone", args.phone)
                )
                .filter((q) => q.eq(q.field("deletedAt"), undefined))
                .first();
            if (existingPhone) {
                throw userError("A contact with this phone number already exists");
            }
        }

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
        if (!identity) throw authError();

        const contact = await ctx.db.get(args.id);
        if (!contact) throw notFoundError("Contact");

        await assertProjectOwnership(ctx, contact.projectId, identity as unknown as { org_id: string });

        // Validate tags: max 20 tags, max 50 chars each
        if (args.tags) {
            if (args.tags.length > 20) {
                throw userError("Contacts can have at most 20 tags");
            }
            if (args.tags.some(t => t.length > 50)) {
                throw userError("Each tag must be 50 characters or less");
            }
        }

        // Dedup check: email (exclude current contact)
        if (args.email !== undefined && args.email !== contact.email) {
            const existingEmail = await ctx.db
                .query("contacts")
                .withIndex("by_projectId_email", (q) =>
                    q.eq("projectId", contact.projectId).eq("email", args.email)
                )
                .first();
            if (existingEmail) {
                throw userError("A contact with this email already exists");
            }
        }

        // Dedup check: phone (exclude current contact)
        if (args.phone !== undefined && args.phone !== contact.phone) {
            const existingPhone = await ctx.db
                .query("contacts")
                .withIndex("by_projectId_phone", (q) =>
                    q.eq("projectId", contact.projectId).eq("phone", args.phone)
                )
                .first();
            if (existingPhone) {
                throw userError("A contact with this phone number already exists");
            }
        }

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
        if (!identity) throw authError();

        const contact = await ctx.db.get(args.id);
        if (!contact) throw notFoundError("Contact");

        // Block deletion if the contact is linked to an active (non-resolved) conversation
        if (contact.conversationId) {
            const conversation = await ctx.db.get(contact.conversationId);
            if (conversation && conversation.status !== CONVERSATION_STATUS.CLOSED) {
                throw userError("Cannot delete a contact with active conversations");
            }
        }

        await softDelete(ctx, "contacts", args.id);
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
        if (!identity) throw authError();

        if (args.contacts.length === 0 || args.contacts.length > 500) {
            throw userError("Array must contain between 1 and 500 contacts");
        }

        const orgId = (identity as unknown as { org_id: string }).org_id;
        if (!orgId) throw authError();

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
            .first();

        if (!project) {
            throw notFoundError("Project");
        }

        const projectId = project._id;
        let inserted = 0;
        let skipped = 0;

        for (const contact of args.contacts) {
            if (contact.email) {
                const existing = await ctx.db
                    .query("contacts")
                    .withIndex("by_projectId_email", (q) =>
                        q.eq("projectId", projectId).eq("email", contact.email)
                    )
                    .first();

                if (existing) {
                    skipped++;
                    continue;
                }
            }

            // Phone dedup check
            if (contact.phone) {
                const existingPhone = await ctx.db
                    .query("contacts")
                    .withIndex("by_projectId_phone", (q) =>
                        q.eq("projectId", projectId).eq("phone", contact.phone)
                    )
                    .first();

                if (existingPhone) {
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
