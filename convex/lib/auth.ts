/**
 * Conversation-level authorization helpers.
 *
 * Convex has no declarative row-level security — ownership checks
 * must be imperative in every function that touches a conversation.
 *
 * Security boundary: org-scoped. A user in org_A must NOT access
 * conversations belonging to org_B.
 *
 * @see https://docs.convex.dev/functions
 */
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id, Doc } from "../_generated/dataModel";

/**
 * Asserts that the authenticated user's organization owns the project
 * that the conversation belongs to.
 *
 * Throws `ConvexError` if:
 *  - The user is not authenticated
 *  - The conversation does not exist
 *  - The conversation's project belongs to a different organization
 *
 * @returns The conversation document and identity for type-safe downstream use
 */
export async function assertConversationOwnership(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">
): Promise<{
  conversation: Doc<"conversations">;
  userId: string;
  identity: NonNullable<Awaited<ReturnType<typeof ctx.auth.getUserIdentity>>>;
}> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.deletedAt !== undefined) {
    throw new ConvexError("Conversation not found");
  }

  // conversations → projects → orgId (no direct orgId on conversations)
  const project = await ctx.db.get(conversation.projectId);
  if (!project) {
    throw new ConvexError("Project not found");
  }

  if (project.orgId !== identity.org_id) {
    throw new ConvexError("Unauthorized");
  }

  return { conversation, userId: identity.subject, identity };
}

/**
 * Checks conversation ownership without throwing.
 * Returns null if unauthenticated, conversation not found, or not owned.
 */
export async function checkConversationOwnership(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">
): Promise<{
  conversation: Doc<"conversations">;
  userId: string;
  identity: NonNullable<Awaited<ReturnType<typeof ctx.auth.getUserIdentity>>>;
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const conversation = await ctx.db.get(conversationId);
  if (!conversation || conversation.deletedAt !== undefined) return null;

  const project = await ctx.db.get(conversation.projectId);
  if (!project) return null;

  if (project.orgId !== identity.org_id) return null;

  return { conversation, userId: identity.subject, identity };
}
