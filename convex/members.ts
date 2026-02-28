import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// List project members
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});

// Get current user's member profile for a project
export const current = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const members = await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        return members.find(m => m.userId === identity.subject) || null;
    }
});

// List all pending invitations for the current logged-in user (matched by email)
export const getMyPendingInvites = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || !identity.email) return [];

        const invites = await ctx.db
            .query("project_members")
            .withIndex("by_invitedEmail", (q) => q.eq("invitedEmail", identity.email!))
            .collect();

        // Only return pending invites that haven't been linked to a user yet
        const pending = invites.filter(
            (m) => !m.userId && (m.inviteStatus === "pending" || m.inviteStatus === undefined)
        );

        // Enrich each invite with project details
        return await Promise.all(
            pending.map(async (invite) => {
                const project = await ctx.db.get(invite.projectId);
                return {
                    ...invite,
                    projectName: project?.name ?? "Unknown Project",
                };
            })
        );
    },
});

// Accept an invitation
export const accept = mutation({
    args: { inviteId: v.id("project_members") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invitation not found");
        if (invite.inviteStatus === "rejected") throw new Error("Invitation was rejected");

        await ctx.db.patch(args.inviteId, {
            userId: identity.subject,
            inviteStatus: "accepted",
            status: "available",
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: invite.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_accepted",
            targetType: "teammate",
            targetId: identity.email ?? identity.subject,
            metadata: { role: invite.role },
        });
    },
});

// Reject an invitation
export const reject = mutation({
    args: { inviteId: v.id("project_members") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invitation not found");

        await ctx.db.patch(args.inviteId, {
            inviteStatus: "rejected",
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: invite.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_rejected",
            targetType: "teammate",
            targetId: identity.email ?? identity.subject,
        });
    },
});
export const invite = mutation({
    args: {
        projectId: v.id("projects"),
        invitedEmail: v.string(),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const memberId = await ctx.db.insert("project_members", {
            projectId: args.projectId,
            role: args.role ?? "agent",
            status: "available",
            invitedEmail: args.invitedEmail,
            invitedAt: Date.now(),
        });

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: args.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_invited",
            targetType: "teammate",
            targetId: args.invitedEmail,
            metadata: { email: args.invitedEmail, role: args.role ?? "agent" },
        });

        return memberId;
    },
});

// Update member role or status
export const update = mutation({
    args: {
        id: v.id("project_members"),
        role: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Member not found");

        const { id, ...updates } = args;
        const clean: Record<string, any> = {};
        for (const [k, val] of Object.entries(updates)) {
            if (val !== undefined) clean[k] = val;
        }
        await ctx.db.patch(id, clean);

        // Log the specific action performed
        const action = args.role ? "role_changed" : "status_changed";
        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: member.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action,
            targetType: "teammate",
            targetId: member.userId ?? member.invitedEmail,
            metadata: { role: args.role, status: args.status },
        });
    },
});

// Remove a member
export const remove = mutation({
    args: { id: v.id("project_members") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const member = await ctx.db.get(args.id);
        if (!member) throw new Error("Member not found");

        await ctx.db.delete(args.id);

        await ctx.runMutation(internal.activityLogs.logActivityInternal, {
            projectId: member.projectId,
            actorId: identity.subject,
            actorName: identity.name ?? identity.email ?? "Unknown",
            action: "teammate_removed",
            targetType: "teammate",
            targetId: member.userId ?? member.invitedEmail,
        });
    },
});

// Get all project members with their profiles (for transfer functionality)
export const getProjectMembers = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const members = await ctx.db
            .query("project_members")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Only get active/accepted members who have a set userId
        const activeMembers = members.filter(
            (m) => m.userId && (m.inviteStatus === "accepted" || !m.inviteStatus)
        );

        // Fetch user profiles to enrich member data
        const enriched = await Promise.all(
            activeMembers.map(async (m) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", m.userId!))
                    .first();

                return {
                    userId: m.userId!,
                    role: m.role,
                    profile: profile ? {
                        fullName: profile.fullName || profile.username || "Unknown",
                        avatarUrl: profile.avatarUrl,
                    } : null,
                };
            })
        );

        return enriched;
    },
});

// Assign a member to a department
export const assignMemberToDepartment = mutation({
    args: {
        memberId: v.id("project_members"),
        departmentId: v.id("departments")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const member = await ctx.db.get(args.memberId);
        if (!member) throw new Error("Member not found");

        const departmentIds = member.departmentIds || [];
        if (!departmentIds.includes(args.departmentId)) {
            await ctx.db.patch(args.memberId, {
                departmentIds: [...departmentIds, args.departmentId]
            });
        }
    }
});

// Remove a member from a department
export const removeMemberFromDepartment = mutation({
    args: {
        memberId: v.id("project_members"),
        departmentId: v.id("departments")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const member = await ctx.db.get(args.memberId);
        if (!member) throw new Error("Member not found");

        const departmentIds = member.departmentIds || [];
        const updatedDepartmentIds = departmentIds.filter(id => id !== args.departmentId);

        await ctx.db.patch(args.memberId, {
            departmentIds: updatedDepartmentIds
        });
    }
});
