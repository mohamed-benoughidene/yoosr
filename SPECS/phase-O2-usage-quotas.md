# Project Usage & Billing Quotas — Spec (O-2) — Revised

## Goal
Show per-project usage against plan limits so admins can monitor consumption
and Yoosr can enforce soft limits before launch.

## Scope

IN:
- Hardcoded FREE plan limits (constants file)
- `getProjectUsageSummary` query — reads live counts from existing tables
- Usage card on Project Settings page with progress bars and warn state
- Soft enforcement only: warn at 80%, no hard blocking yet

OUT:
- Hard blocking when quota exceeded (post-launch)
- Billing / Stripe integration (post-launch)
- Per-user breakdown
- Billing cycle reset logic (billingCycleStart stays in schema for future use)

## Plan Limits (hardcoded constants for now)
```ts
export const FREE_PLAN_LIMITS = {
  conversations: 500,      // per billing cycle
  bots: 3,                 // active bots
  knowledgeBases: 2,       // knowledge bases
  seats: 5,                // teammates (Clerk org members)
}
```

## Backend

### No schema changes needed.
All counts are derived from existing tables.

### New query: `getProjectUsageSummary(projectId)`
Returns:
```ts
{
  conversations: number,   // count of conversations created since billingCycleStart
  bots: number,            // count of bots for the project
  knowledgeBases: number,  // count of knowledge_bases for the project
  tokenUsage: number,      // sum of tokensUsed from token_usage table (display only)
  billingCycleStart: number // from project_usage table, or project.createdAt as fallback
}
```

Auth: check identity, verify project belongs to org.

### No mutations needed.
project_usage table stays for future billing cycle reset logic.
billingCycleStart is read from it if a record exists, else falls back to
project.createdAt.

## Frontend

Usage card on Project Settings page (new section, below existing settings):

Displays four progress bars:
1. Conversations this cycle — count / 500
2. Active bots — count / 3
3. Knowledge bases — count / 2
4. Teammates — from useOrganization().memberships.count / 5

Token usage displayed as plain text below (no limit, display only):
"X tokens consumed this cycle"

Progress bar states:
- Normal (default) — below 80%
- Warn (amber) — 80–99%
- Exceeded (red) — 100%+

## Acceptance Criteria

1. Project Settings page shows a Usage section with four progress bars
2. Each bar shows correct live count vs plan limit
3. Bars turn amber at ≥80%, red at ≥100%
4. Token usage is shown as display-only text (no progress bar, no limit)
5. Teammates count comes from Clerk org membership count (not a Convex table)
6. No existing functionality is broken

## Dependencies
- token_usage table exists and is written to (verify during audit)
- conversations table has createdAt field (verify during audit)
- project_usage table exists with billingCycleStart field (verify during audit)
- useOrganization() available in frontend

## Tasks

### Task 1 — Audit
Confirm all four source tables exist with correct fields.
Confirm token_usage is actually being written to anywhere in the codebase.

### Task 2 — Constants file
Create a plan limits constants file.

### Task 3 — Backend query
Implement getProjectUsageSummary in convex/analytics.ts.

### Task 4 — Frontend usage card
Build the usage card component and wire it into Project Settings.