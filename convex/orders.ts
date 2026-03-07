import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./utils";

// Extend the Identity type to include custom claims from Clerk
type ClerkIdentity = {
    subject: string;
    org_id?: string;
    org_role?: string;
    [key: string]: any;
};

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
        requireAdmin(identity as any);
        if (!identity || !identity.org_id) {
            throw new Error("Not authenticated or no active organization");
        }

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Project not found");
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
            throw new Error("Not authenticated or no active organization");
        }

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Project not found");
        }

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        return orders.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const updateOrderStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(v.literal("new"), v.literal("confirmed"), v.literal("cancelled")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        requireAdmin(identity as any);
        if (!identity || !identity.org_id) {
            throw new Error("Not authenticated or no active organization");
        }

        const order = await ctx.db.get(args.orderId);
        if (!order) {
            throw new Error("Order not found");
        }

        const project = await ctx.db.get(order.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Project not found");
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
        requireAdmin(identity as any);
        if (!identity || !identity.org_id) {
            throw new Error("Not authenticated or no active organization");
        }

        const order = await ctx.db.get(args.orderId);
        if (!order) {
            throw new Error("Order not found");
        }

        const project = await ctx.db.get(order.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Project not found");
        }

        await ctx.db.delete(args.orderId);
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
            throw new Error("Not authenticated or no active organization");
        }

        if (args.orders.length === 0 || args.orders.length > 500) {
            throw new ConvexError("Array must contain between 1 and 500 items");
        }

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id!))
            .first();

        if (!project) {
            throw new Error("Project not found");
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
