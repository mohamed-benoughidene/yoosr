/**
 * Soft-delete utilities for Convex tables.
 *
 * Provides consistent soft-delete behavior across all tables
 * with `deletedAt` field support.
 */

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// All tables that have a `deletedAt` field
export type SoftDeletableTable =
  | "conversations"
  | "messages"
  | "bots"
  | "bot_flows"
  | "contacts"
  | "orders"
  | "projects"
  | "knowledge_bases"
  | "knowledge_base_sources"
  | "knowledge_base_chunks"
  | "departments"
  | "labels"
  | "canned_responses"
  | "integrations"
  | "webhook_subscriptions"
  | "notifications"
  | "push_subscriptions"
  | "activity_logs"
  | "conversation_events"
  | "csat_ratings"
  | "token_usage"
  | "unanswered_queries"
  | "project_usage"
  | "webhook_deliveries";

/**
 * Soft-delete a document by setting `deletedAt` to the current timestamp.
 */
export async function softDelete(
  ctx: MutationCtx,
  table: SoftDeletableTable,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: Id<any>
): Promise<void> {
  await ctx.db.patch(id, { deletedAt: Date.now() });
}

/**
 * Restore a soft-deleted document by clearing `deletedAt`.
 */
export async function restoreSoftDelete(
  ctx: MutationCtx,
  table: SoftDeletableTable,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: Id<any>
): Promise<void> {
  await ctx.db.patch(id, { deletedAt: undefined });
}

/**
 * Query filter helper: excludes soft-deleted records.
 * Use this in query chains to filter out records where `deletedAt` is set.
 *
 * Example:
 *   const convos = await ctx.db
 *     .query("conversations")
 *     .filter((q) => filterActive(q, "deletedAt"))
 *     .collect();
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterActive(q: any, fieldName: string = "deletedAt") {
  return q.eq(q.field(fieldName), undefined);
}
/**
 * Check if a document is soft-deleted.
 */
export function isSoftDeleted(doc: { deletedAt?: number }): boolean {
  return doc.deletedAt !== undefined;
}
