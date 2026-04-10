# Part 04: Database Schema Design — Updated Findings

## ✅ Resolved: Soft-Delete Pattern Implemented

**22 of 28 tables** now have `deletedAt: v.optional(v.number())` fields:
- conversations, messages, bots, bot_flows, contacts, orders, projects, knowledge_bases, knowledge_base_sources, knowledge_base_chunks, departments, labels, canned_responses, integrations, webhook_subscriptions, webhook_deliveries, notifications, push_subscriptions, conversation_events, activity_logs, csat_ratings, token_usage

**Tables WITHOUT soft-delete** (intentional):
- `operating_hours` — Config table, rarely deleted
- `feedback` — Early access feedback, not user-managed
- `profiles` — User identity, managed by Clerk webhooks
- `unanswered_queries` — Aggregated analytics
- `project_usage` — Billing data

**Utility module**: `convex/lib/softDelete.ts` provides:
- `softDelete(ctx.db, id)` — Sets `deletedAt`
- `restoreSoftDelete(ctx.db, id)` — Clears `deletedAt`
- `filterActive(q)` — Query filter excluding soft-deleted records
- `isSoftDeleted(doc)` — Check if a document is soft-deleted

**Cron cleanup**: Weekly permanent deletion of soft-deleted records older than 30 days.

## ✅ Resolved: TTL on Conversations/Messages

Both tables now have `expiresAt: v.optional(v.number())` fields:
- **Default**: 90 days from creation
- **Constants exported**: `DEFAULT_TTL_DAYS = 90`, `MS_PER_DAY`
- **Set on 4 creation paths**: widget create, Meta createOrUpdate, Telegram createOrUpdate, direct create
- **Daily cron** (3 AM): Soft-deletes expired conversations + their messages

## ✅ Resolved: v.any() Reduced from 11 to 3

| Field | Table | Old | New | Status |
|-------|-------|-----|-----|--------|
| `attributes` | bots | `v.any()` | `v.record(v.string(), v.string())` | ✅ Replaced |
| `typing` | conversations | `v.any()` | **Removed** | ✅ Removed |
| `attributes` | messages | `v.any()` | `v.record(v.string(), v.string())` | ✅ Replaced |
| `attachments` | messages | `v.any()` | `v.array(v.object({url, type}))` | ✅ Replaced |
| `markerEnd` | bot_flows edges | `v.any()` | `v.object({...})` | ✅ Replaced |
| `style` | bot_flows edges | `v.any()` | `v.record(v.string(), v.union(...))` | ✅ Replaced |
| `name` | bot_flows edges | `v.any()` | `v.string()` | ✅ Replaced |
| `actions` | bot_flows edges | `v.any()` | `v.array(v.string())` | ✅ Replaced |
| `credentials` | integrations | `v.any()` | `v.record(v.string(), v.string())` | ✅ Replaced |
| `nodes` | bot_flows | `v.any()` | — | **Kept** (React Flow too dynamic) |
| `actions` | bot_flows | `v.any()` | — | **Kept** (action descriptors vary) |
| `metadata` | activity_logs | `v.any()` | — | **Kept** (event-specific) |

## ✅ Resolved: Cron Job Count Increased

**From 11 to 13 cron jobs:**
- `cleanupExpiredConversations` — Daily 3 AM (NEW)
- `cleanupOldSoftDeletes` — Sunday 6 AM (NEW)
- All original 11 jobs unchanged

## Still Accurate (Unchanged)

- 28 tables total
- 43 indexes + 1 vector index
- 22+ foreign key relationships
- `conversation_bot_state` separated for OCC optimization
- Vector index: 2048 dimensions, nvidia/llama-nemotron
- `openRouterApiKey` stored with encryption via `encryptSecret()` (AES-256-GCM)
- Consistent naming: `snake_case` tables, `camelCase` fields
- Inconsistent timestamp tracking (some tables lack `updatedAt`)
- No cascade deletes (manual cleanup via cron/batch)
- 2 migrations (1 disabled, 1 active)
- Legacy fields still present in conversations (deprecated)
