import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./utils";
import { paginationOptsValidator } from "convex/server";
import { ClerkIdentity } from "./types";
import { authError, notFoundError, forbiddenError } from "./errors";
import { softDelete } from "./lib/softDelete";

export const createOrder = mutation({
    args: {
        projectId: v.id("projects"),
        conversationId: v.optional(v.id("conversations")),
        contactName: v.string(),
        phone: v.optional(v.string()),
        product: v.string(),
        notes: v.optional(v.string()),
        status: v.optional(v.union(v.literal("new"), v.literal("confirmed"), v.literal("cancelled"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        requireAdmin(identity);
        if (!identity || !identity.org_id) {
            throw authError();
        }

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        const orderId = await ctx.db.insert("orders", {
            projectId: args.projectId,
            conversationId: args.conversationId,
            contactName: args.contactName,
            phone: args.phone,
            product: args.product,
            notes: args.notes,
            status: args.status ?? "new",
            createdAt: Date.now(),
        });

        return orderId;
    },
});

export const listOrders = query({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) {
            throw authError();
        }

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        // Bounded to 500 — safe for most use cases. Use listOrdersPaginated for full pagination.
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .take(500);

        return orders.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const listOrdersPaginated = query({
    args: {
        projectId: v.id("projects"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) {
            throw authError();
        }

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        return await ctx.db
            .query("orders")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const updateOrderStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(v.literal("new"), v.literal("confirmed"), v.literal("cancelled")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        requireAdmin(identity);
        if (!identity || !identity.org_id) {
            throw authError();
        }

        const order = await ctx.db.get(args.orderId);
        if (!order) {
            throw notFoundError("Order");
        }

        const project = await ctx.db.get(order.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        await ctx.db.patch(args.orderId, {
            status: args.status,
        });

        return await ctx.db.get(args.orderId);
    },
});

export const deleteOrder = mutation({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        requireAdmin(identity);
        if (!identity || !identity.org_id) {
            throw authError();
        }

        const order = await ctx.db.get(args.orderId);
        if (!order) {
            throw notFoundError("Order");
        }

        const project = await ctx.db.get(order.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw forbiddenError();
        }

        await softDelete(ctx, "orders", args.orderId);
    },
});

export const batchImportOrders = mutation({
    args: {
        orders: v.array(
            v.object({
                contactName: v.string(),
                phone: v.optional(v.string()),
                product: v.string(),
                notes: v.optional(v.string()),
                status: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) {
            throw authError();
        }

        if (args.orders.length === 0 || args.orders.length > 500) {
            throw new ConvexError("Array must contain between 1 and 500 items");
        }

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id!))
            .first();

        if (!project) {
            throw notFoundError("Project");
        }

        const projectId = project._id;
        let inserted = 0;
        let skipped = 0;

        for (const order of args.orders) {
            if (!order.contactName || !order.product) {
                skipped++;
                continue;
            }

            let validStatus: "new" | "confirmed" | "cancelled" = "new";
            if (order.status === "confirmed" || order.status === "cancelled") {
                validStatus = order.status;
            }

            await ctx.db.insert("orders", {
                projectId,
                contactName: order.contactName,
                phone: order.phone,
                product: order.product,
                notes: order.notes,
                status: validStatus,
                createdAt: Date.now(),
            });
            inserted++;
        }

        return { inserted, skipped };
    },
});
