import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Extend the Identity type to include custom claims from Clerk
type ClerkIdentity = {
    subject: string;
    org_id?: string;
    org_role?: string;
    [key: string]: any;
};

// Internal: get project for widget (no auth required)
export const getPublic = internalQuery({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) return null;
        return { name: project.name, widgetConfig: project.widgetConfig };
    },
});

// List all projects for the current user's active organization
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) return [];

        const orgProjects = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", identity.org_id!))
            .collect();

        // Include the role from the token so the frontend knows their permissions
        return orgProjects.map(p => ({
            ...p,
            userRole: identity.org_role ?? "member"
        }));
    },
});

// Get a single project by ID
export const get = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) return null;

        const project = await ctx.db.get(args.id);
        if (!project || project.orgId !== identity.org_id) {
            return null;
        }

        return {
            ...project,
            userRole: identity.org_role ?? "member"
        };
    },
});

// Get a project by orgId (useful when relying on Clerk org IDs)
export const getByOrgId = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) return null;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();

        // Since this uses the org ID explicitly, ensure it matches the user's active org
        // Alternatively, if this is meant to be system-level, the check might differ,
        // but adding safety for standard multi-tenancy rules:
        if (!project || project.orgId !== identity.org_id) {
            return null;
        }

        return {
            ...project,
            userRole: identity.org_role ?? "member"
        };
    },
});

// Create a default project if it doesn't exist for this active organization
export const ensureProject = mutation({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) return null;

        // Security check: they can only ensure a project for their active org
        if (args.orgId !== identity.org_id) return null;

        let project = await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();

        if (!project) {
            const projectId = await ctx.db.insert("projects", {
                name: "Default Project",
                description: "Auto-generated project",
                orgId: args.orgId,
                status: "active",
            });

            // Add some default labels
            const defaultLabels = [
                { name: "Bug", color: "#ef4444" },
                { name: "Feature Request", color: "#3b82f6" },
                { name: "Question", color: "#10b981" }
            ];

            for (const label of defaultLabels) {
                await ctx.db.insert("labels", {
                    projectId,
                    name: label.name,
                    color: label.color,
                    createdBy: identity.subject
                });
            }

            project = await ctx.db.get(projectId);
        }

        return {
            ...project!,
            userRole: identity.org_role ?? "member"
        };
    }
});

// Create a new project for the active organization
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) throw new Error("Not authenticated or no active organization");

        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            description: args.description,
            orgId: identity.org_id,
            status: "active",
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
        defaultModel: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.orgId !== identity.org_id) {
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
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity || !identity.org_id) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.orgId !== identity.org_id) {
            throw new Error("Project not found");
        }

        const projectId = args.id;

        // 1. Bot flows and bots
        const bots = await ctx.db.query("bots").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const bot of bots) {
            const flows = await ctx.db.query("bot_flows").withIndex("by_botId", (q) => q.eq("botId", bot._id)).collect();
            for (const f of flows) await ctx.db.delete(f._id);
            await ctx.db.delete(bot._id);
        }

        // 2. KBs and KB sources
        const kbs = await ctx.db.query("knowledge_bases").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const kb of kbs) {
            const sources = await ctx.db.query("knowledge_base_sources").withIndex("by_kbId", (q) => q.eq("kbId", kb._id)).collect();
            for (const s of sources) await ctx.db.delete(s._id);
            await ctx.db.delete(kb._id);
        }

        // 3. other tables
        const records1 = await ctx.db.query("messages").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records1) await ctx.db.delete(r._id);

        const records2 = await ctx.db.query("conversations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records2) await ctx.db.delete(r._id);

        const records4 = await ctx.db.query("contacts").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records4) await ctx.db.delete(r._id);

        const records5 = await ctx.db.query("integrations").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records5) await ctx.db.delete(r._id);

        const records6 = await ctx.db.query("activity_logs").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records6) await ctx.db.delete(r._id);

        const records7 = await ctx.db.query("departments").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records7) await ctx.db.delete(r._id);

        const records8 = await ctx.db.query("canned_responses").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records8) await ctx.db.delete(r._id);

        const records9 = await ctx.db.query("labels").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records9) await ctx.db.delete(r._id);

        const records10 = await ctx.db.query("operating_hours").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records10) await ctx.db.delete(r._id);

        // Also delete usage and unanswered queries and subscriptions if they exist
        const usage = await ctx.db.query("project_usage").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of usage) await ctx.db.delete(r._id);

        const unanswered = await ctx.db.query("unanswered_queries").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of unanswered) await ctx.db.delete(r._id);

        const webhooks = await ctx.db.query("webhook_subscriptions").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of webhooks) await ctx.db.delete(r._id);

        await ctx.db.delete(projectId);
    },
});
