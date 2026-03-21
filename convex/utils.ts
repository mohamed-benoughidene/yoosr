import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export function requireAdmin(identity: { org_role?: string } | null) {
    if (!identity || identity.org_role !== "org:admin") {
        throw new ConvexError("Unauthorized: admin access required");
    }
}

/**
 * Asserts that the current identity has access to the project.
 * Throws a ConvexError if not.
 */
export async function assertProjectOwnership(
    ctx: QueryCtx | MutationCtx,
    projectId: Id<"projects">,
    identity: { org_id?: string }
): Promise<Doc<"projects">> {
    if (!identity.org_id) {
        throw new ConvexError("No active organization");
    }
    const project = await ctx.db.get(projectId);
    if (!project || project.orgId !== identity.org_id) {
        throw new ConvexError("Unauthorized");
    }
    return project;
}

/**
 * Checks if the current identity has access to the project.
 * Returns null if not, or the project document if so.
 */
export async function checkProjectOwnership(
    ctx: QueryCtx | MutationCtx,
    projectId: Id<"projects">,
    identity: { org_id?: string }
): Promise<Doc<"projects"> | null> {
    if (!identity.org_id) {
        return null;
    }
    const project = await ctx.db.get(projectId);
    if (!project || project.orgId !== identity.org_id) {
        return null;
    }
    return project;
}
