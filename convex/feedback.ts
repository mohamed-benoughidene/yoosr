import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ClerkIdentity } from "./types";
import { authError } from "./errors";

export const submitFeedback = mutation({
  args: {
    type: v.union(v.literal("bug"), v.literal("feature"), v.literal("general")),
    message: v.string(),
    submitterName: v.string(),
    submitterEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = (await ctx.auth.getUserIdentity()) as ClerkIdentity | null;
    if (!identity) {
      throw authError();
    }

    const orgId = identity.org_id;
    if (!orgId) {
      throw authError();
    }

    const submittedBy = identity.subject;

    await ctx.db.insert("feedback", {
      orgId,
      submittedBy,
      submitterName: args.submitterName,
      submitterEmail: args.submitterEmail,
      type: args.type,
      message: args.message,
      createdAt: Date.now(),
    });

    return null;
  },
});
