# SLA Breach Rate Audit

## 1. Existing Analytics Queries Pattern
In `convex/analytics.ts`, existing queries such as `getConversationVolume` and `getCSATSummary` follow a consistent pattern for filtering by project and date range:

- They define the exact `args` structure:
  ```typescript
  args: {
      projectId: v.id("projects"),
      from: v.number(),
      to: v.number(),
  }
  ```
- They verify caller `identity` using `await ctx.auth.getUserIdentity()`.
- They collect conversations for the specific project via its index:
  ```typescript
  const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  ```
- *After* fetching all project records via `.collect()`, the existing pattern applies in-memory JavaScript `.filter()` to check the creation time window (and relevant field-specific logic):
  ```typescript
  const filtered = conversations.filter(c => c._creationTime >= args.from && c._creationTime <= args.to);
  ```

To align with this architecture, a new `getSLABreachRate` query must follow this exact sequence: validating auth, searching with `by_projectId`, building an array, and lastly applying a precise timestamp filter.

## 2. Conversations Table Indexes
According to `convex/schema.ts`, the `conversations` table defines only the following two indexes:
- `.index("by_projectId", ["projectId"])`
- `.index("by_projectId_status", ["projectId", "status"])`

**There is no internal index that natively partitions by `createdAt`/`_creationTime`.** Querying entirely within Convex using `.withIndex("by_projectId")` followed by filtering `.filter(c => c._creationTime >= args.from && ...)` is both the correct and the only supported mechanism right now to handle this efficiently without schema extensions. 

## 3. Relevant Fields
The appropriate fields are fully verified and present on the `conversations` table schema:
- `firstResponseAt: v.optional(v.number())`
- `slaDeadline: v.optional(v.number())`
- `_creationTime`: Convex provides this implicitly for all documents, so it will always be accessible as `c._creationTime`.

*Breach condition:* A conversation would be marked as breached if `c.firstResponseAt !== undefined && c.slaDeadline !== undefined && c.firstResponseAt > c.slaDeadline`. 

## 4. Analytics Page UI
The Analytics page component is located at `src/app/dashboard/analytics/page.tsx` and currently organizes data comprehensively. Its current layout consists of:
- **Header Section:** Dynamic Date Range Picker defaulting to the last 30 days.
- **Top Stats Overview (`statsCards` mapping):** 
  There is a `grid` spanning `lg:grid-cols-5` featuring five key metrics:
  1. Total Conversations (`convStatsData`)
  2. Bot Handled volume percentage
  3. Agent Handled volume percentage
  4. Avg CSAT (`csatData`)
  5. Total Tokens consumed (`tokenData`)
- **Detailed Lower Charts / Reports:**
  - Usage Quotas & Tags Summary side-by-side (`AnalyticsUsageQuotas`, `AnalyticsTagsChart`)
  - A primary line graph for Conversation Volumes (`ConversationVolumeChart`)
  - The Unanswered Queries and average CSAT tables/analytics at the bottom.

### Integration Strategy
Because an SLA Breach Rate is a high-level key performance indicator (yielding a percentage rating like 5% or 10%), it makes the most sense to be structurally integrated directly as a new item inside the **`statsCards` array**, presenting as a 6th stat card adjacent to **Avg CSAT**. For proportional UI alignment on larger screens, adjusting `lg:grid-cols-5` to `lg:grid-cols-6` makes visual sense, ensuring that the agents checking analytics see the SLA breach rate immediately without additional charts scrolling.
