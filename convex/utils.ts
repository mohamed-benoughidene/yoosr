import { ConvexError } from "convex/values";

export function requireAdmin(identity: { org_role?: string } | null) {
    if (!identity || identity.org_role !== "org:admin") {
        throw new ConvexError("Unauthorized: admin access required");
    }
}
