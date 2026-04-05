/**
 * AI Rate Limiting utility for Convex mutations.
 * 
 * Usage in mutations:
 * ```typescript
 * import { checkAIRateLimit } from "./lib/aiRateLimiter";
 * 
 * export const myMutation = mutation({
 *   handler: async (ctx, args) => {
 *     await checkAIRateLimit(ctx, args.projectId);
 *     // ... proceed with AI call
 *   }
 * });
 * ```
 */

import { ConvexError } from "convex/values";
import { MutationCtx } from "../_generated/server";
import { AI_RATE_LIMIT_PER_HOUR } from "../openrouter";
import { Id } from "../_generated/dataModel";

/**
 * Check if project has exceeded AI rate limit for current hour.
 * Uses project_usage table to track calls.
 * 
 * @throws ConvexError if rate limit exceeded
 */
export async function checkAIRateLimit(
    ctx: MutationCtx,
    projectId: Id<"projects">
): Promise<void> {
    const now = Date.now();
    
    // Get or create usage record for this project
    const usageRecords = await ctx.db
        .query("project_usage")
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
        .collect();
    
    const usage = usageRecords[0];
    
    if (!usage) {
        // First AI call — create usage record
        await ctx.db.insert("project_usage", {
            projectId,
            tokensConsumed: 0,
            conversationsCount: 0,
            billingCycleStart: now,
        });
        return; // Allow first call
    }
    
    // Check if billing cycle has expired (older than 1 hour)
    if (now - usage.billingCycleStart > 3_600_000) {
        // Reset the cycle
        await ctx.db.patch(usage._id, {
            billingCycleStart: now,
            tokensConsumed: 0,
        });
        return; // Allow after reset
    }
    
    // Check if limit exceeded
    if (usage.conversationsCount >= AI_RATE_LIMIT_PER_HOUR) {
        throw new ConvexError(
            `AI rate limit exceeded. Maximum ${AI_RATE_LIMIT_PER_HOUR} calls per hour reached. Try again later.`
        );
    }
    
    // Increment counter
    await ctx.db.patch(usage._id, {
        conversationsCount: usage.conversationsCount + 1,
    });
}
