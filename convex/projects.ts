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

// List all projects for the current user (owned + joined via invitation)
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // 1. Fetch user's member records first (covers all projects they belong to)
        const memberRecords = await ctx.db
            .query("project_members")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        // 2. Projects the user owns
        const ownedProjects = await ctx.db
            .query("projects")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", identity.subject))
            .collect();

        // Build role map: projectId -> role from member records
        const roleMap = new Map(memberRecords.map((m) => [m.projectId, m.role]));

        // 3. For owned projects, prefer member record role, fallback to "owner"
        const ownedWithRole = ownedProjects.map((p) => ({
            ...p,
            userRole: roleMap.get(p._id) ?? "owner",
        }));

        // 4. Joined projects (member but not owner)
        const ownedIds = new Set(ownedProjects.map((p) => p._id));
        const joinedMemberRecords = memberRecords.filter((m) => !ownedIds.has(m.projectId));
        const joinedProjects = await Promise.all(
            joinedMemberRecords.map(async (m) => {
                const project = await ctx.db.get(m.projectId);
                if (!project) return null;
                return { ...project, userRole: m.role };
            })
        );

        const validJoined = joinedProjects.filter((p) => p !== null) as typeof ownedWithRole;

        return [...ownedWithRole, ...validJoined];
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

// Get a project by ownerId (useful when relying on Clerk org IDs)
export const getByOwnerId = query({
    args: { ownerId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const project = await ctx.db
            .query("projects")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .first();

        return project;
    },
});

// Create a default project if it doesn't exist for this owner
export const ensureProject = mutation({
    args: { ownerId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        let project = await ctx.db
            .query("projects")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
            .first();

        if (!project) {
            const projectId = await ctx.db.insert("projects", {
                name: "Default Project",
                description: "Auto-generated project",
                ownerId: args.ownerId,
                status: "active",
            });

            await ctx.db.insert("project_members", {
                projectId,
                userId: identity.subject,
                role: "owner",
                status: "available",
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

        return project;
    }
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

        const records3 = await ctx.db.query("project_members").withIndex("by_projectId", (q) => q.eq("projectId", projectId)).collect();
        for (const r of records3) await ctx.db.delete(r._id);

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

        await ctx.db.delete(projectId);
    },
});
