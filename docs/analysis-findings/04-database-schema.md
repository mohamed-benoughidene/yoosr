# Part 04: Database Schema Design — Analysis Findings

## 📊 Visual Map

```
convex/schema.ts (single master schema — 27 tables)
│
├── User & Identity
│   ├── profiles              → User profiles (synced from Clerk via webhook)
│   │   └── Indexes: by_userId, by_orgId, by_orgId_isAvailable
│   └── feedback              → Early access feedback & feature requests
│       └── Indexes: by_org, by_created
│
├── Organization & Projects
│   ├── projects              → Project entities (org-scoped)
│   │   └── Indexes: by_orgId
│   └── project_usage         → Monthly usage quotas (AI tokens, messages)
│       └── Indexes: by_projectId
│
├── Conversations & Messaging
│   ├── conversations         → Chat threads from visitors
│   │   │   (status: 100=unassigned, 200=assigned, 1000=closed)
│   │   └── Indexes: by_projectId, by_projectId_status, by_projectId_visitorId,
│   │                   by_projectId_channelSenderId
│   ├── conversation_bot_state → Bot execution state (separated to avoid OCC conflicts)
│   │   └── Indexes: by_conversationId
│   ├── messages              → Chat messages within conversations
│   │   └── Indexes: by_conversationId, by_projectId, by_projectId_senderType
│   ├── conversation_events   → Bot vs agent handling tracking
│   │   └── Indexes: by_projectId, by_projectId_createdAt, by_conversationId
│   └── notifications         → Push/email notifications for agents
│       └── Indexes: by_recipient, by_project_recipient, by_createdAt
│
├── Bot System
│   ├── bots                  → Chatbot/automation configs
│   │   └── Indexes: by_projectId
│   └── bot_flows             → Design Studio graph data (ReactFlow nodes/edges)
│       └── Indexes: by_botId, by_slug
│
├── Contacts & CRM
│   ├── contacts              → Saved contacts from conversations
│   │   └── Indexes: by_projectId, by_conversationId, by_projectId_email,
│   │                   by_projectId_phone
│   └── orders                → Orders placed through chat
│       └── Indexes: by_projectId, by_conversationId, by_projectId_status
│
├── Knowledge Base & AI
│   ├── knowledge_bases       → Knowledge base containers
│   │   └── Indexes: by_projectId
│   ├── knowledge_base_sources → Articles, URLs, files
│   │   └── Indexes: by_kbId
│   └── knowledge_base_chunks  → Document chunks + embeddings (VECTOR INDEX)
│       └── Vector Index: by_embedding (2048 dims, nvidia/llama-nemotron model)
│
├── Routing & Departments
│   ├── departments           → Agent departments with routing modes
│   │   └── Indexes: by_projectId
│   ├── canned_responses      → Quick reply templates
│   │   └── Indexes: by_projectId
│   └── operating_hours       → Business hours schedules
│       └── Indexes: by_projectId
│
├── Labels & Tags
│   ├── labels                → Tag definitions for conversations
│   │   └── Indexes: by_projectId
│   └── tags                  → (stored as string array on conversations)
│
├── Analytics & Reporting
│   ├── activity_logs         → Audit/activity logging
│   │   └── Indexes: by_projectId, by_actionType, by_projectId_createdAt
│   ├── csat_ratings          → Customer satisfaction ratings
│   │   └── Indexes: by_projectId, by_projectId_createdAt
│   ├── token_usage           → AI token usage logging
│   │   └── Indexes: by_projectId, by_projectId_createdAt
│   └── unanswered_queries    → Unmatched KB queries
│       └── Indexes: by_projectId, by_projectId_count
│
├── Integrations & Webhooks
│   ├── integrations          → External channel configs (Telegram, WhatsApp, etc.)
│   │   └── Indexes: by_projectId, by_provider_enabled, by_provider_phoneNumberId,
│   │                   by_provider_pageId, by_provider_webhookSecret
│   ├── webhook_subscriptions  → RestHook webhook subscriptions
│   │   └── Indexes: by_projectId, by_projectId_isActive
│   └── webhook_deliveries     → Webhook delivery tracking
│       └── Indexes: by_subscriptionId, by_projectId, by_projectId_event
│
└── Push Notifications
    └── push_subscriptions     → Web push subscriptions
        └── Indexes: by_userId, by_orgId
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Master schema: 27 tables with 47+ indexes, 1 vector index |
| `convex/migrations.ts` | One disabled migration (`migrateStatuses` — completed March 2026) |

## ✅ Analysis Checklist

- [x] **What tables/collections are defined?**
  **27 tables total:**
  1. `profiles` — User profiles synced from Clerk
  2. `projects` — Project/workspace entities
  3. `conversations` — Chat threads
  4. `conversation_bot_state` — Separated bot state to avoid OCC conflicts
  5. `messages` — Chat messages
  6. `bots` — Bot configurations
  7. `bot_flows` — Design Studio ReactFlow graph data
  8. `activity_logs` — Audit trail
  9. `integrations` — External channel configs
  10. `departments` — Agent departments
  11. `canned_responses` — Quick reply templates
  12. `labels` — Tag definitions
  13. `operating_hours` — Business hours
  14. `knowledge_bases` — KB containers
  15. `knowledge_base_sources` — KB content sources
  16. `knowledge_base_chunks` — Vector embeddings
  17. `contacts` — CRM contacts from conversations
  18. `conversation_events` — Bot/agent handling events
  19. `csat_ratings` — Customer satisfaction
  20. `token_usage` — AI token tracking
  21. `unanswered_queries` — Unmatched queries
  22. `project_usage` — Monthly usage quotas
  23. `webhook_subscriptions` — RestHook subscriptions
  24. `webhook_deliveries` — Delivery tracking
  25. `notifications` — Agent notifications
  26. `orders` — Chat-based orders
  27. `feedback` — Feature feedback
  28. `push_subscriptions` — Web push tokens

- [x] **What are the fields for each table?**
  Detailed in the schema.ts file. Key patterns:
  - All tables have `projectId` or `orgId` for multi-tenant scoping
  - Many tables use `v.optional()` for flexible fields
  - Nested objects defined with `v.object()` (e.g., `widgetConfig`, `configuration`)
  - Arrays with `v.array()` (e.g., `tags`, `participants`, `memberIds`)
  - `v.any()` used for flexible/deferred validation structures
  - External references use `v.string()` for Clerk user IDs (not Convex document IDs)

- [x] **What data types are used?**
  - `v.string()` — Text fields, Clerk user IDs, status strings
  - `v.number()` — Timestamps (Date.now()), counts, ratings
  - `v.boolean()` — Flags (enabled, read, isDefault, etc.)
  - `v.array(...)` — Lists (tags, participants, memberIds, schedule slots)
  - `v.object({...})` — Nested documents (widgetConfig, configuration, schedule)
  - `v.any()` — Flexible/deferred structures (attributes, credentials, attachments, metadata)
  - `v.id("table")` — Convex document references (projectId, conversationId, botId, etc.)
  - `v.union(...)` — Enum-like constraints (status codes, channel types, priority levels)
  - `v.array(v.number())` — Embedding vectors (2048 dimensions)

- [x] **Which fields are indexed for query performance?**
  **47+ indexes across 27 tables**, including:
  - **Single-field indexes**: Most tables have `by_projectId` for org-scoped queries
  - **Compound indexes**: `by_projectId_status`, `by_orgId_isAvailable`, `by_projectId_createdAt`
  - **Unique lookup indexes**: `by_userId`, `by_kbId`, `by_conversationId`
  - **Integration-specific indexes**: `by_provider_enabled`, `by_provider_phoneNumberId`, `by_provider_pageId`, `by_provider_webhookSecret`
  - **Notification indexes**: `by_recipient`, `by_project_recipient`, `by_createdAt`
  - **Webhook indexes**: `by_projectId_isActive`, `by_projectId_event`
  - **Contact dedup indexes**: `by_projectId_email`, `by_projectId_phone`
  - **1 VECTOR INDEX**: `knowledge_base_chunks.by_embedding` (2048 dimensions)

- [x] **What relationships exist between tables?**
  **Document references (Convex `v.id()`):**
  - `conversations.projectId` → `projects`
  - `conversations.botId` → `bots`
  - `conversations.departmentId` → `departments`
  - `conversation_bot_state.conversationId` → `conversations`
  - `messages.conversationId` → `conversations`
  - `messages.projectId` → `projects`
  - `bots.projectId` → `projects`
  - `bot_flows.botId` → `bots`
  - `contacts.projectId` → `projects`
  - `contacts.conversationId` → `conversations`
  - `knowledge_bases.projectId` → `projects`
  - `knowledge_base_sources.kbId` → `knowledge_bases`
  - `knowledge_base_chunks.sourceId` → `knowledge_base_sources`
  - `knowledge_base_chunks.projectId` → `projects`
  - `departments.projectId` → `projects`
  - `departments.botId` → `bots`
  - `canned_responses.projectId` → `projects`
  - `labels.projectId` → `projects`
  - `operating_hours.projectId` → `projects`
  - `integrations.projectId` → `projects`
  - `activity_logs.projectId` → `projects`
  - `conversation_events.projectId` → `projects`
  - `conversation_events.conversationId` → `conversations`
  - `csat_ratings.projectId` → `projects`
  - `csat_ratings.conversationId` → `conversations`
  - `token_usage.projectId` → `projects`
  - `unanswered_queries.projectId` → `projects`
  - `project_usage.projectId` → `projects`
  - `webhook_subscriptions.projectId` → `projects`
  - `webhook_deliveries.subscriptionId` → `webhook_subscriptions`
  - `webhook_deliveries.projectId` → `projects`
  - `notifications.projectId` → `projects`
  - `notifications.conversationId` → `conversations`
  - `orders.projectId` → `projects`
  - `orders.conversationId` → `conversations`
  - `feedback.orgId` → (Clerk org, not a Convex table)
  - `push_subscriptions.userId` → (Clerk user, not a Convex table)

- [x] **Are there foreign key patterns or document references?**
  **Yes — Convex document references via `v.id("table")`.** Convex doesn't enforce referential integrity (no SQL-like FK constraints), but the schema consistently uses typed IDs. Additionally, **external references** to Clerk use `v.string()` for Clerk user IDs (`userId`, `assignedTo`, `resolvedBy`, `recipientId`) — these are NOT Convex document IDs, just string references.

- [x] **What validation rules are in place?**
  - **Schema-level validation**: Convex validates types on write (string, number, boolean, id, object, array)
  - **Union types for enums**: `status: v.union(v.literal(100), v.literal(200), v.literal(1000))`
  - **Nested object validation**: `v.object({...})` validates structure of nested docs
  - **`v.optional()`**: Fields marked optional can be undefined
  - **`v.any()`**: No validation (used for flexible structures like `attributes`, `metadata`, `credentials`)
  - **Application-level validation**: Dedup checks in mutations (e.g., contact email/phone uniqueness)
  - **No custom validators**: No `v.custom()` or validation functions defined in schema

- [x] **Are there any embedded/nested documents vs normalized references?**
  **Mixed approach:**
  - **Embedded/nested objects**: `widgetConfig`, `configuration`, `schedule`, `executionLog`, `credentials` — stored as `v.object()` or `v.any()` within parent documents
  - **Normalized references**: Most cross-entity relationships use `v.id()` references (conversations → projects, messages → conversations, etc.)
  - **Denormalized fields**: `integrations` table denormalizes `phoneNumberId`, `pageId`, `webhookSecret` from within `credentials` for indexed queries (explicitly commented as "Denormalized lookup fields for O(log n) queries")
  - **Arrays of strings**: `tags`, `participants`, `memberIds` stored directly on documents rather than as separate tables

- [x] **What's the naming convention for tables and fields?**
  - **Table names**: `snake_case` plural (`activity_logs`, `knowledge_bases`, `push_subscriptions`) — with some inconsistency (`conversation_bot_state` uses underscores but `conversations` is simple plural)
  - **Field names**: `camelCase` (`projectId`, `visitorName`, `assignedTo`, `unreadCount`)
  - **Index names**: `by_fieldName` or `by_field1_field2` pattern
  - **Status codes**: Numeric (`100`, `200`, `1000`) instead of strings for conversations
  - **Clerk claims**: `org_id`, `org_role` in `ClerkIdentity` type (snake_case from JWT)

- [x] **Are timestamps consistently tracked? (creation, updates)**
  **Inconsistent:**
  - `profiles.updatedAt` — tracked (optional number)
  - `conversations.updatedAt` — tracked (optional number)
  - `activity_logs.createdAt` — tracked (optional number)
  - `notifications.createdAt` — tracked (required number)
  - `orders.createdAt` — tracked (required number)
  - `feedback.createdAt` — tracked (required number)
  - `push_subscriptions.createdAt` — tracked (required number)
  - `conversation_events.createdAt` — tracked (required number)
  - `token_usage.createdAt` — tracked (required number)
  - `unanswered_queries.lastAskedAt` — tracked (required number)
  - **Missing updatedAt**: Many tables don't track `updatedAt` (bots, bot_flows, labels, departments, knowledge_bases, etc.)
  - **Convex auto-tracks `_creationTime`**: All documents get `_creationTime` automatically from Convex, so creation time is always available

- [x] **What's the expected data volume for each table?**
  Based on schema design and query patterns:
  - **High volume**: `messages` (many per conversation), `conversations` (core entity), `activity_logs` (every action logged), `notifications` (per-user, per-event), `knowledge_base_chunks` (vector embeddings, 2048 dims)
  - **Medium volume**: `contacts`, `orders`, `csat_ratings`, `token_usage`, `conversation_events`
  - **Low volume**: `projects` (1 per org), `bots` (few per project), `knowledge_bases` (few per project), `departments`, `operating_hours`, `webhook_subscriptions`, `integrations`, `labels`, `canned_responses`
  - **Unbounded**: `feedback` (global, not project-scoped), `push_subscriptions` (per-user)

- [x] **Are there any migration files?**
  **One migration file**: `convex/migrations.ts` contains `migrateStatuses` which converted conversation statuses from strings to numeric codes (100/200/1000). **It is permanently disabled** (throws an error if called). Comment states: "Migration complete as of March 2026. This function has been permanently disabled." No other migrations exist.

- [x] **Is the schema normalized or denormalized? Why?**
  **Mostly normalized with selective denormalization:**
  - **Normalized**: Separate tables for distinct entities (bots ↔ bot_flows, knowledge_bases ↔ knowledge_base_sources ↔ knowledge_base_chunks, conversations ↔ messages)
  - **Denormalized for performance**: 
    - `integrations` denormalizes `phoneNumberId`, `pageId`, `webhookSecret` from `credentials` for indexed O(log n) lookups (explicitly documented in schema comments)
    - `conversations` embeds `participants` array, `tags` array, `attributes` bag — avoids join tables
    - `conversations` embeds `executionLog` array (bot execution history) — though this was later moved to `conversation_bot_state` to avoid OCC conflicts
  - **Rationale**: Performance-critical paths (routing, webhook delivery, integration lookup) benefit from denormalized indexes, while complex nested data (bot flows, KB chunks) stays normalized

## 📝 Agent Findings

### Schema Architecture Highlights
1. **OCC Conflict Resolution**: The `conversation_bot_state` table was created specifically to separate bot execution state from conversations, preventing Optimistic Concurrency Control write conflicts. This shows mature Convex experience.

2. **Multi-tenant Design**: Every table is scoped to either `projectId` or `orgId`, ensuring proper data isolation between organizations.

3. **Numeric Status Codes**: Conversations use numeric status codes (100=unassigned, 200=assigned, 1000=closed) instead of strings. A migration was run to convert from strings, showing evolving schema maturity.

4. **Vector Search**: The `knowledge_base_chunks` table uses Convex's vector index with 2048-dimensional embeddings from `nvidia/llama-nemotron-embed-vl-1b-v2` for semantic search.

5. **External References**: Clerk user IDs are stored as `v.string()` (not Convex IDs), creating a cross-system reference pattern. This is intentional since Clerk users aren't Convex documents.

6. **Flexible Data Bags**: Several tables use `v.any()` for flexible structures (`attributes` on conversations, `metadata` on activity_logs, `credentials` on integrations), trading type safety for flexibility.

### Notable Schema Decisions
- **No soft deletes**: Tables use hard deletes (`ctx.db.delete()`). The `projects` table uses a `status: "deleting"` flag during cascading deletion.
- **No audit timestamps on most tables**: Only a subset of tables track `updatedAt`; Convex's `_creationTime` is relied upon for creation time.
- **Webhook delivery tracking**: Separate `webhook_deliveries` table for audit trail with retry attempt tracking.

## 🔍 Key Patterns to Identify

- **Project-scoped multi-tenancy**: Nearly all tables indexed by `projectId` with org-level auth checks
- **Clerk external references**: String-based Clerk user IDs instead of Convex document IDs
- **Selective denormalization**: Performance-critical fields denormalized with dedicated indexes
- **Numeric enum patterns**: Status codes (100/200/1000) instead of strings for performance
- **Vector embeddings**: RAG pipeline with 2048-dim embeddings for KB semantic search
- **OCC-safe separation**: `conversation_bot_state` separated from `conversations` to avoid write conflicts
- **Webhook event fan-out**: `webhook_subscriptions` + `webhook_deliveries` for reliable delivery tracking

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| **`v.any()` used extensively** | MEDIUM | `attributes: v.any()`, `metadata: v.any()`, `credentials: v.any()`, `attachments: v.any()` — no schema validation on these fields. A malformed write could corrupt data. |
| **No `updatedAt` on many tables** | LOW | Bots, bot_flows, labels, departments, knowledge_bases, integrations, etc. don't track update timestamps. Makes debugging and auditing harder. |
| **Conversation `executionLog` still embedded** | LOW | Despite creating `conversation_bot_state`, the `conversations` table still has `executionLog`, `currentNodeId`, `botStepCount` fields marked "kept for backward compat." Should be cleaned up. |
| **Legacy deprecated fields in conversations** | LOW | `leadId`, `firstText`, `typing` are marked deprecated but still in schema. Adds confusion and storage overhead. |
| **No soft-delete pattern** | LOW | Hard deletes are used everywhere. For a business app, soft deletes (`deletedAt` timestamp) would allow data recovery and audit compliance. |
| **`feedback` table not project-scoped** | LOW | Uses `orgId` directly (not `projectId`), which is correct for org-level feedback but inconsistent with the project-scoped pattern used elsewhere. |
| **Single migrations file, permanently disabled** | INFO | Only one migration exists and it's disabled. Future schema changes that require data migration will need a new pattern. Consider a migration registry pattern. |
| **Vector index hardcoded to 2048 dimensions** | INFO | Tied to specific embedding model (`nvidia/llama-nemotron-embed-vl-1b-v2`). Changing models would require re-embedding all chunks. |
