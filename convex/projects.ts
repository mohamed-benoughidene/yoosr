import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./utils";
import { ClerkIdentity } from "./types";
import { authError, notFoundError } from "./errors";
import { softDelete, SoftDeletableTable } from "./lib/softDelete";

// Internal: get project for widget (no auth required)
export const getPublic = internalQuery({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const id = ctx.db.normalizeId("projects", args.id);
        if (!id) return null;

        const project = await ctx.db.get(id);
        if (!project) return null;
        return { name: project.name, widgetConfig: project.widgetConfig, widgetLocale: project.widgetLocale };
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
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
            .take(50);

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
        if (!project || project.orgId !== identity.org_id || project.deletedAt !== undefined) {
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
            .filter((q) => q.eq(q.field("deletedAt"), undefined))
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

export const getByOrgIdInternal = internalQuery({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .first();
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
            // Note: These are data values stored in DB, not presentation tokens
            // Mapped to semantic equivalents: danger, info, success
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
        if (!identity || !identity.org_id) throw authError();

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

        slaHours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        requireAdmin(identity);
        if (!identity || !identity.org_id) throw authError();

        const project = await ctx.db.get(args.id);
        if (!project || project.orgId !== identity.org_id) {
            throw notFoundError("Project");
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...updates } = args;
        // Filter out undefined values
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(args.id, cleanUpdates);
        return args.id;
    },
});

// Delete a project
export const remove = internalMutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) throw notFoundError("Project");

        await ctx.db.patch(args.id, { status: "deleting" });

        await ctx.scheduler.runAfter(0, internal.projects.deleteProjectData, {
            projectId: args.id,
        });
    },
});

export const deleteProjectData = internalMutation({
    args: {
        projectId: v.id("projects"),
        step: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Child tables must be processed before parent tables to allow querying via parent ID
        const STEPS = [
            "bot_flows",
            "bots",
            "knowledge_base_sources",
            "knowledge_bases",
            "messages",
            "conversations",
            "contacts",
            "integrations",
            "activity_logs",
            "departments",
            "canned_responses",
            "labels",
            "operating_hours",
            "project_usage",
            "unanswered_queries",
            "webhook_subscriptions",
            "projects"
        ];

        const currentStep = args.step || STEPS[0];
        const stepIndex = STEPS.indexOf(currentStep);
        if (stepIndex === -1) return;

        let deletedCount = 0;
        const BATCH_SIZE = 100;

        if (currentStep === "bot_flows") {
            const bots = await ctx.db.query("bots")
                .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
                .collect();
            for (const bot of bots) {
                const flows = await ctx.db.query("bot_flows")
                    .withIndex("by_botId", q => q.eq("botId", bot._id))
                    .take(BATCH_SIZE - deletedCount);
                for (const f of flows) {
                    await softDelete(ctx, "bot_flows", f._id);
                    deletedCount++;
                }
                if (deletedCount >= BATCH_SIZE) break;
            }
        }
        else if (currentStep === "knowledge_base_sources") {
            const kbs = await ctx.db.query("knowledge_bases")
                .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
                .collect();
            for (const kb of kbs) {
                const sources = await ctx.db.query("knowledge_base_sources")
                    .withIndex("by_kbId", q => q.eq("kbId", kb._id))
                    .take(BATCH_SIZE - deletedCount);
                for (const s of sources) {
                    await softDelete(ctx, "knowledge_base_sources", s._id);
                    deletedCount++;
                }
                if (deletedCount >= BATCH_SIZE) break;
            }
        }
        else if (currentStep === "projects") {
            const project = await ctx.db.get(args.projectId);
            if (project) {
                await softDelete(ctx, "projects", args.projectId);
                deletedCount = 1;
            }
        }
        else {
            // All other tables have by_projectId index
            const batch = await ctx.db.query(currentStep as "integrations" | "bots" | "knowledge_bases" | "conversations" | "contacts" | "messages" | "activity_logs" | "departments" | "canned_responses" | "labels" | "operating_hours" | "project_usage" | "unanswered_queries" | "webhook_subscriptions")
                .withIndex("by_projectId", q => q.eq("projectId", args.projectId))
                .take(BATCH_SIZE);
            for (const item of batch) {
                await softDelete(ctx, currentStep as SoftDeletableTable, item._id);
                deletedCount++;
            }
        }

        if (currentStep === "projects") {
            // After deleting the project record itself, do not re-schedule
            return;
        }

        if (deletedCount === BATCH_SIZE) {
            // Re-schedule same step
            await ctx.scheduler.runAfter(0, internal.projects.deleteProjectData, {
                projectId: args.projectId,
                step: currentStep
            });
        } else if (stepIndex < STEPS.length - 1) {
            // Advance to next step
            await ctx.scheduler.runAfter(0, internal.projects.deleteProjectData, {
                projectId: args.projectId,
                step: STEPS[stepIndex + 1]
            });
        }
    }
});

export const updateWidgetLocale = mutation({
    args: {
        projectId: v.id("projects"),
        locale: v.union(v.literal("en"), v.literal("ar"), v.literal("fr")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();

        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== identity.org_id) {
            throw notFoundError("Project");
        }

        // If widgetConfig.translations exists, ensure the new locale has entries initialized
        const widgetConfig = project.widgetConfig;
        if (widgetConfig?.translations) {
            const translations = widgetConfig.translations as Record<string, Record<string, string>>;
            const translationFields = ["headerTitle", "welcomeMessage", "onlineStatus", "preChatTitle", "preChatSubtitle", "startChat"];

            let needsUpdate = false;
            for (const field of translationFields) {
                const fieldEntry = translations[field];
                // If field entry exists but doesn't have the new locale key, initialize it
                if (fieldEntry && typeof fieldEntry === "object" && fieldEntry[args.locale] === undefined) {
                    fieldEntry[args.locale] = "";
                    needsUpdate = true;
                }
                // If field entry is a string (legacy flat format), convert to nested
                if (fieldEntry && typeof fieldEntry === "string") {
                    translations[field] = {
                        en: fieldEntry,
                        ar: "",
                        fr: "",
                    };
                    needsUpdate = true;
                }
                // If field entry is missing entirely, create it
                if (!fieldEntry) {
                    translations[field] = { en: "", ar: "", fr: "" };
                    translations[field][args.locale] = "";
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await ctx.db.patch(args.projectId, {
                    widgetLocale: args.locale,
                    widgetConfig: { ...widgetConfig, translations },
                });
                return { projectId: args.projectId, locale: args.locale, initializedTranslations: true };
            }
        }

        await ctx.db.patch(args.projectId, { widgetLocale: args.locale });
        return { projectId: args.projectId, locale: args.locale, initializedTranslations: false };
    },
});

export const clearWidgetLocale = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw authError();
        await ctx.db.patch(args.projectId, { widgetLocale: undefined });
    },
});
