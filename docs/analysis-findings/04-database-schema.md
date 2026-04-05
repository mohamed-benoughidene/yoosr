# Part 04: Database Schema Design — Analysis Findings

## 📊 Visual Map

```
convex/schema.ts (Master Schema — 30 tables, ~500 lines)
│
├── Multi-Tenancy Core
│   ├── projects                    → orgId (Clerk org), widgetConfig, defaultModel, openRouterApiKey, slaHours
│   └── profiles                    → userId (Clerk), orgId, isAvailable, lastSeenAt, updatedAt
│
├── Conversation & Messaging
│   ├── conversations               → projectId, visitorId, assignedTo, status (100/200/1000), channel, botPaused, departmentId, priority
│   ├── messages                    → conversationId, projectId, senderType, content, attachments, channelMessageId
│   ├── conversation_bot_state      → conversationId (separated to avoid OCC conflicts), currentNodeId, botStepCount, executionLog, attributes
│   ├── conversation_events         → projectId, conversationId, handledBy (bot/agent), closed, createdAt
│   └── csat_ratings                → projectId, conversationId, rating (1-5), comment, createdAt
│
├── Bot & AI System
│   ├── bots                        → projectId, name, type (chatbot/automation), status (draft/active/archived), configuration
│   ├── bot_flows                   → botId, slug, version, nodes[], edges[], executionNodes[], variables
│   ├── knowledge_bases             → projectId, name, description, isDefault
│   ├── knowledge_base_sources      → kbId, type (url/text/file), value, status (indexing/indexed/failed)
│   ├── knowledge_base_chunks       → sourceId, projectId, text, embedding[] (2048-dim vector index)
│   ├── token_usage                 → projectId, model, tokensUsed, operation (ai_task/ai_assistant/ask_kb), createdAt
│   └── unanswered_queries          → projectId, query, count, lastAskedAt
│
├── Contact & Order Management
│   ├── contacts                    → projectId, name, email, phone, address, tags[], conversationId
│   └── orders                      → projectId, conversationId?, contactName, phone, product, status (new/confirmed/cancelled), agentId, createdAt
│
├── Organization & Settings
│   ├── departments                 → projectId, name, isDefault, routingMode (pooled/assigned), botId?, tags[], memberIds[]
│   ├── canned_responses            → projectId, trigger, message, createdBy
│   ├── labels                      → projectId, name, color (6 colors), createdBy
│   ├── operating_hours             → projectId, enabled, timezone, schedule (JSON)
│   └── integrations                → projectId, provider (telegram/whatsapp/messenger/instagram), credentials (encrypted), enabled, denormalized lookup fields
│
├── Notifications & Webhooks
│   ├── notifications               → projectId, recipientId, type (5 literals), conversationId, title, body, read, createdAt
│   ├── push_subscriptions          → userId, orgId, subscription, createdAt
│   ├── webhook_subscriptions       → projectId, url, events[], secret, isActive
│   └── webhook_deliveries          → subscriptionId, projectId, event, url, attempt (1-3), success, statusCode, error, timestamp
│
├── Analytics & Usage
│   ├── project_usage               → projectId, tokensConsumed, conversationsCount, billingCycleStart
│   └── activity_logs               → projectId, userId, actionType, description, metadata, actor fields, target fields, createdAt
│
└── Feedback
    └── feedback                    → orgId, submittedBy, submitterName, submitterEmail, type (bug/feature/general), message, createdAt
```

## 📁 File Inventory

| File | Purpose | Status |
|------|---------|--------|
| `convex/schema.ts` | Master schema — 30 tables with indexes and 1 vector index | ✅ Found (~500 lines) |
| `convex/migrations.ts` | Data migrations (currently disabled) | ✅ Found (1 migration, permanently disabled) |

## ✅ Analysis Checklist

### [x] What tables/collections are defined?

**30 tables defined** in `convex/schema.ts`:

| # | Table | Purpose |
|---|-------|---------|
| 1 | `profiles` | User profiles synced from Clerk |
| 2 | `projects` | Project/org entities with widget config and AI settings |
| 3 | `conversations` | Chat threads from visitors across all channels |
| 4 | `messages` | Individual messages within conversations |
| 5 | `conversation_bot_state` | Bot execution state (separated from conversations to avoid OCC conflicts) |
| 6 | `bots` | Chatbot/automation configurations |
| 7 | `bot_flows` | Design Studio graph data (nodes, edges, compiled execution nodes) |
| 8 | `activity_logs` | Audit/activity logging |
| 9 | `integrations` | Third-party channel integrations (WhatsApp, Telegram, etc.) |
| 10 | `departments` | Agent departments for routing and organization |
| 11 | `canned_responses` | Quick-reply message templates |
| 12 | `labels` | Color-coded tags for conversation categorization |
| 13 | `operating_hours` | Business hours schedule for routing decisions |
| 14 | `knowledge_bases` | AI knowledge base containers |
| 15 | `knowledge_base_sources` | Individual sources (URLs, text, files) within KBs |
| 16 | `knowledge_base_chunks` | Document chunks with vector embeddings for RAG |
| 17 | `contacts` | Contact records extracted from conversations |
| 18 | `conversation_events` | Bot vs agent handling tracking per conversation |
| 19 | `csat_ratings` | Customer satisfaction ratings from widget |
| 20 | `token_usage` | AI token consumption logging per call |
| 21 | `unanswered_queries` | Aggregated unanswered KB queries with counts |
| 22 | `project_usage` | Monthly usage quotas (tokens, conversations) |
| 23 | `webhook_subscriptions` | RestHooks-style webhook subscriptions |
| 24 | `webhook_deliveries` | Webhook delivery attempt tracking with retry counts |
| 25 | `notifications` | In-app agent notifications |
| 26 | `orders` | Orders placed through chat |
| 27 | `feedback` | Early access feedback and feature requests |
| 28 | `push_subscriptions` | Web push notification subscriptions |

### [x] What are the fields for each table?

Detailed field inventory per table (all from `convex/schema.ts`):

**`profiles`** (9 fields):
- `userId: v.string()` — Clerk user ID
- `fullName: v.optional(v.string())`
- `avatarUrl: v.optional(v.string())`
- `username: v.optional(v.string())`
- `email: v.optional(v.string())`
- `isAvailable: v.optional(v.boolean())`
- `lastSeenAt: v.optional(v.number())`
- `orgId: v.optional(v.string())` — Multi-tenancy
- `updatedAt: v.optional(v.number())`

**`projects`** (9 fields):
- `name: v.string()`
- `description: v.optional(v.string())`
- `orgId: v.string()` — Clerk Organization ID
- `status: v.optional(v.string())` — "active" | "inactive" | "archived"
- `widgetConfig: v.optional(v.any())` — JSON config
- `widgetLocale: v.optional(v.union(v.literal("en"), v.literal("ar"), v.literal("fr")))`
- `defaultModel: v.optional(v.string())` — AI model fallback
- `openRouterApiKey: v.optional(v.string())` — Encrypted
- `slaHours: v.optional(v.number())`

**`conversations`** (39 fields — largest table):
- Core: `projectId`, `visitorId`, `visitorName`, `assignedTo`, `status` (100/200/1000), `lastMessage`, `resolvedBy`, `visitorEmail`, `visitorPhone`, `visitorAddress`, `visitorNote`, `unreadCount`, `rating`, `feedback`, `updatedAt`
- Bot state (legacy, now in separate table): `currentNodeId`, `botStepCount`, `executionLog` (array of objects), `botId`
- Legacy: `leadId`, `firstText`, `participants` (string[]), `tags` (string[]), `attributes` (any), `typing` (any)
- HITL: `botPaused`, `handoffSource`, `departmentId` (v.id("departments")), `priority` (low/normal/high/urgent), `firstResponseAt`, `slaDeadline`
- Channels: `channel` (widget/messenger/instagram/telegram/whatsapp), `channelSenderId`

**`messages`** (14 fields):
- `conversationId: v.id("conversations")`, `projectId: v.id("projects")`
- `senderType: v.string()` — "visitor" | "agent" | "bot"
- `senderId: v.optional(v.string())`, `content: v.string()`
- `attachments: v.optional(v.any())`, `fileId: v.optional(v.string())`, `fileName: v.optional(v.string())`
- Legacy: `channel`, `senderFullname`, `status`, `type`, `channelMessageId`

**`conversation_bot_state`** (6 fields):
- `conversationId: v.id("conversations")`
- `currentNodeId: v.optional(v.union(v.string(), v.null()))`
- `botStepCount: v.optional(v.number())`
- `executionLog: v.optional(v.array(v.object({ nodeId, type, action, timestamp })))`
- `attributes: v.optional(v.any())`

**`bots`** (6 fields):
- `projectId: v.id("projects")`, `name: v.string()`, `description: v.optional(v.string())`
- `type: v.string()` — "chatbot" | "automation"
- `status: v.optional(v.string())` — "draft" | "active" | "archived"
- `configuration: v.optional(v.any())` — JSON flow definition

**`bot_flows`** (9 fields):
- `botId: v.id("bots")`, `slug: v.optional(v.string())`, `version: v.optional(v.string())`
- `nodes: v.array(v.any())` — JSON array of flow nodes
- `edges: v.optional(v.any())` — Legacy ReactFlow Edge[]
- `executionNodes: v.optional(v.array(v.any()))` — Compiled engine schema
- `variables: v.optional(v.any())` — Flow-level variables

**`activity_logs`** (11 fields):
- `projectId`, `userId`, `actionType`, `description`, `metadata`, `ipAddress`
- Extended: `actorId`, `actorName`, `action`, `targetType`, `targetId`, `createdAt`

**`integrations`** (8 fields):
- `projectId`, `provider` (telegram/openai/whatsapp/messenger/instagram)
- `credentials: v.optional(v.any())` — Encrypted JSON
- `enabled: v.optional(v.boolean())`
- Denormalized lookups: `phoneNumberId`, `pageId`, `webhookSecret`

**`departments`** (8 fields):
- `projectId`, `name`, `description`, `isDefault`, `routingMode` (pooled/assigned)
- `botId`, `tags` (string[]), `memberIds` (string[])

**`canned_responses`** (4 fields):
- `projectId`, `trigger`, `message`, `createdBy`

**`labels`** (4 fields):
- `projectId`, `name`, `color` (red/orange/yellow/green/blue/violet), `createdBy`

**`operating_hours`** (4 fields):
- `projectId`, `enabled: v.boolean()`, `timezone: v.string()`, `schedule: v.any()` (JSON)

**`knowledge_bases`** (4 fields):
- `projectId`, `name`, `description`, `isDefault`

**`knowledge_base_sources`** (4 fields):
- `kbId: v.id("knowledge_bases")`, `type` (url/text/file), `value`, `status` (indexing/indexed/failed)

**`knowledge_base_chunks`** (4 fields):
- `sourceId: v.id("knowledge_base_sources")`, `projectId`, `text`, `embedding: v.array(v.number())`
- Vector index: 2048 dimensions for `nvidia/llama-nemotron-embed-vl-1b-v2`

**`contacts`** (8 fields):
- `projectId`, `name`, `email`, `phone`, `address`, `note`
- `tags: v.optional(v.array(v.string()))`, `conversationId: v.optional(v.id("conversations"))`

**`conversation_events`** (5 fields):
- `projectId`, `conversationId`, `handledBy` (bot/agent), `closed: v.boolean()`, `createdAt: v.number()`

**`csat_ratings`** (5 fields):
- `projectId`, `conversationId`, `rating: v.number()` (1-5), `comment`, `createdAt: v.number()`

**`token_usage`** (5 fields):
- `projectId`, `model`, `tokensUsed`, `operation` (ai_task/ai_assistant/ask_kb), `createdAt`

**`unanswered_queries`** (4 fields):
- `projectId`, `query`, `count`, `lastAskedAt`

**`project_usage`** (4 fields):
- `projectId`, `tokensConsumed`, `conversationsCount`, `billingCycleStart`

**`webhook_subscriptions`** (5 fields):
- `projectId`, `url`, `events` (string[]), `secret`, `isActive`

**`webhook_deliveries`** (9 fields):
- `subscriptionId`, `projectId`, `event`, `url`, `attempt` (1/2/3), `success`, `statusCode`, `error`, `timestamp`

**`notifications`** (9 fields):
- `projectId`, `recipientId`, `type` (5 literals), `conversationId`, `title`, `body`, `read`, `createdAt`

**`orders`** (9 fields):
- `projectId`, `conversationId`, `contactName`, `phone`, `product`, `notes`, `status` (new/confirmed/cancelled), `agentId`, `createdAt`

**`feedback`** (7 fields):
- `orgId`, `submittedBy`, `submitterName`, `submitterEmail`, `type` (bug/feature/general), `message`, `createdAt`

**`push_subscriptions`** (4 fields):
- `userId`, `orgId`, `subscription`, `createdAt`

### [x] What data types are used? (string, number, boolean, arrays, objects)

**Convex `v.*` type system usage:**

| Type | Usage Count | Examples |
|------|------------|---------|
| `v.string()` | ~50 fields | IDs, names, descriptions, URLs, text content |
| `v.optional(v.string())` | ~60 fields | Most nullable text fields |
| `v.number()` | ~25 fields | Timestamps, counts, ratings, attempt numbers |
| `v.optional(v.number())` | ~20 fields | Optional timestamps, counts |
| `v.boolean()` | 4 fields | `operating_hours.enabled`, `notifications.read`, `conversation_events.closed`, `webhook_subscriptions.isActive`, `webhook_deliveries.success` |
| `v.optional(v.boolean())` | ~10 fields | `profiles.isAvailable`, `integrations.enabled`, `conversations.botPaused`, `departments.isDefault` |
| `v.any()` | ~12 fields | JSON blobs: `widgetConfig`, `configuration`, `credentials`, `attachments`, `metadata`, `attributes`, `typing`, `schedule`, `variables` |
| `v.optional(v.any())` | ~15 fields | Optional JSON blobs |
| `v.array(v.string())` | 5 fields | `tags` (contacts, departments), `events` (webhooks), `participants` |
| `v.array(v.any())` | 3 fields | `bot_flows.nodes`, `bot_flows.edges`, `bot_flows.executionNodes` |
| `v.array(v.number())` | 1 field | `knowledge_base_chunks.embedding` |
| `v.array(v.object({...}))` | 2 fields | `conversations.executionLog`, `conversation_bot_state.executionLog` |
| `v.id("table")` | ~35 fields | Foreign key references across tables |
| `v.optional(v.id("table"))` | ~10 fields | Optional references |
| `v.union(v.literal(...))` | 12 fields | Enums: status, channel, priority, notification type, order status, feedback type, locale, handledBy, operation |

**Union/literal enum patterns:**
- `conversations.status`: `v.union(v.literal(100), v.literal(200), v.literal(1000))` — Numeric status codes
- `conversations.channel`: `v.union(v.literal("widget"), v.literal("messenger"), v.literal("instagram"), v.literal("telegram"), v.literal("whatsapp"))`
- `conversations.priority`: `v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))`
- `notifications.type`: 5 literals — `new_message`, `assigned`, `unassigned_conversation`, `escalation`, `resolved`
- `orders.status`: `v.union(v.literal("new"), v.literal("confirmed"), v.literal("cancelled"))`
- `feedback.type`: `v.union(v.literal("bug"), v.literal("feature"), v.literal("general"))`
- `conversation_events.handledBy`: `v.union(v.literal("bot"), v.literal("agent"))`
- `token_usage.operation`: 3 literals — `ai_task`, `ai_assistant`, `ask_kb`
- `projects.widgetLocale`: `v.union(v.literal("en"), v.literal("ar"), v.literal("fr"))`

### [x] Which fields are indexed for query performance?

**56 total indexes** across 30 tables (including 1 vector index):

| Table | Indexes | Fields Indexed |
|-------|---------|----------------|
| `profiles` | 3 | `by_userId`, `by_orgId`, `by_orgId_isAvailable` (composite) |
| `projects` | 1 | `by_orgId` |
| `conversations` | 4 | `by_projectId`, `by_projectId_status` (composite), `by_projectId_visitorId` (composite), `by_projectId_channelSenderId` (composite) |
| `messages` | 3 | `by_conversationId`, `by_projectId`, `by_projectId_senderType` (composite) |
| `conversation_bot_state` | 1 | `by_conversationId` |
| `bots` | 1 | `by_projectId` |
| `bot_flows` | 2 | `by_botId`, `by_slug` |
| `activity_logs` | 3 | `by_projectId`, `by_actionType`, `by_projectId_createdAt` (composite) |
| `integrations` | 5 | `by_projectId`, `by_provider_enabled` (composite), `by_provider_phoneNumberId` (composite), `by_provider_pageId` (composite), `by_provider_webhookSecret` (composite) |
| `departments` | 1 | `by_projectId` |
| `canned_responses` | 1 | `by_projectId` |
| `labels` | 1 | `by_projectId` |
| `operating_hours` | 1 | `by_projectId` |
| `knowledge_bases` | 1 | `by_projectId` |
| `knowledge_base_sources` | 1 | `by_kbId` |
| `knowledge_base_chunks` | 1 vector | `by_embedding` (2048 dims, filterFields: sourceId, projectId) |
| `contacts` | 3 | `by_projectId`, `by_conversationId`, `by_projectId_email` (composite) |
| `conversation_events` | 3 | `by_projectId`, `by_projectId_createdAt` (composite), `by_conversationId` |
| `csat_ratings` | 2 | `by_projectId`, `by_projectId_createdAt` (composite) |
| `token_usage` | 2 | `by_projectId`, `by_projectId_createdAt` (composite) |
| `unanswered_queries` | 2 | `by_projectId`, `by_projectId_count` (composite) |
| `project_usage` | 1 | `by_projectId` |
| `webhook_subscriptions` | 2 | `by_projectId`, `by_projectId_isActive` (composite) |
| `webhook_deliveries` | 3 | `by_subscriptionId`, `by_projectId`, `by_projectId_event` (composite) |
| `notifications` | 3 | `by_recipient` (composite with createdAt), `by_project_recipient` (composite), `by_createdAt` |
| `orders` | 3 | `by_projectId`, `by_conversationId`, `by_projectId_status` (composite) |
| `feedback` | 2 | `by_org`, `by_created` |
| `push_subscriptions` | 2 | `by_userId`, `by_orgId` |

**Indexing patterns observed:**
- **`by_projectId`** — Most common single-field index (present on 17+ tables)
- **`by_orgId`** — Multi-tenant organization scoping (profiles, projects)
- **Composite indexes** — 20+ composite indexes for filtered queries (projectId + status, projectId + createdAt, provider + enabled)
- **Vector index** — 1 vector index on `knowledge_base_chunks` for RAG semantic search (2048 dimensions)

### [x] What relationships exist between tables?

**Document reference relationships** (via `v.id("table")`):

| Parent Table | Child Table | Reference Field |
|--------------|-------------|-----------------|
| `projects` | `conversations` | `projectId` |
| `projects` | `messages` | `projectId` |
| `projects` | `bots` | `projectId` |
| `projects` | `activity_logs` | `projectId` |
| `projects` | `integrations` | `projectId` |
| `projects` | `departments` | `projectId` |
| `projects` | `canned_responses` | `projectId` |
| `projects` | `labels` | `projectId` |
| `projects` | `operating_hours` | `projectId` |
| `projects` | `knowledge_bases` | `projectId` |
| `projects` | `contacts` | `projectId` |
| `projects` | `conversation_events` | `projectId` |
| `projects` | `csat_ratings` | `projectId` |
| `projects` | `token_usage` | `projectId` |
| `projects` | `unanswered_queries` | `projectId` |
| `projects` | `project_usage` | `projectId` |
| `projects` | `webhook_subscriptions` | `projectId` |
| `projects` | `webhook_deliveries` | `projectId` |
| `projects` | `notifications` | `projectId` |
| `projects` | `orders` | `projectId` |
| `projects` | `knowledge_base_chunks` | `projectId` (embedded in vector filter) |
| `conversations` | `messages` | `conversationId` |
| `conversations` | `conversation_bot_state` | `conversationId` |
| `conversations` | `contacts` | `conversationId` (optional) |
| `conversations` | `conversation_events` | `conversationId` |
| `conversations` | `csat_ratings` | `conversationId` |
| `conversations` | `notifications` | `conversationId` |
| `conversations` | `orders` | `conversationId` (optional) |
| `knowledge_bases` | `knowledge_base_sources` | `kbId` |
| `knowledge_base_sources` | `knowledge_base_chunks` | `sourceId` |
| `bots` | `bot_flows` | `botId` |
| `departments` | `conversations` | `departmentId` (optional, in conversations table) |
| `webhook_subscriptions` | `webhook_deliveries` | `subscriptionId` |

**Relationship graph:**
```
projects (root)
├── conversations ──┬── messages
│                   ├── conversation_bot_state
│                   ├── contacts (optional)
│                   ├── conversation_events
│                   ├── csat_ratings
│                   ├── notifications
│                   └── orders (optional)
├── bots ─── bot_flows
├── knowledge_bases ─── knowledge_base_sources ─── knowledge_base_chunks
├── departments ───(referenced by conversations.departmentId)
├── webhook_subscriptions ─── webhook_deliveries
├── activity_logs
├── integrations
├── canned_responses
├── labels
├── operating_hours
├── contacts
├── conversation_events
├── csat_ratings
├── token_usage
├── unanswered_queries
├── project_usage
└── notifications

profiles (standalone, linked to projects via orgId)
feedback (linked to projects via orgId)
push_subscriptions (linked to users/orgs via userId/orgId)
```

### [x] Are there foreign key patterns or document references?

**Yes — Convex `v.id("table")` pattern is used consistently.**

Convex uses document references rather than traditional SQL foreign keys. The pattern is `v.id("<table_name>")` which creates a strongly-typed reference to another document's Convex ID.

**35+ `v.id()` reference fields** exist across the schema:
- All `projectId` fields: `v.id("projects")` — 21 tables
- All `conversationId` fields: `v.id("conversations")` — 7 tables
- `kbId`: `v.id("knowledge_bases")` — 1 table
- `sourceId`: `v.id("knowledge_base_sources")` — 1 table
- `botId`: `v.id("bots")` — 1 table
- `departmentId`: `v.id("departments")` — 1 table (in conversations)
- `subscriptionId`: `v.id("webhook_subscriptions")` — 1 table

**No cascading delete constraints** at the schema level — Convex doesn't support foreign key constraints. Cascading deletes are handled at the application level in `convex/projects.ts` (`deleteProjectData` mutation with 19-step batch deletion).

**String-based references also exist** (not using `v.id()`):
- `conversations.visitorId` — `v.string()` (Clerk user ID, not a Convex doc reference)
- `conversations.assignedTo` — `v.string()` (Clerk user ID)
- `conversations.botId` — `v.string()` (NOT `v.id("bots")` — legacy field)
- `departments.botId` — `v.string()` (NOT `v.id("bots")`)
- Various `createdBy` fields — `v.string()` (Clerk user IDs)

### [x] What validation rules are in place?

**Schema-level validation** is provided by Convex's type system:

1. **Required fields** (non-optional):
   - `projects.name`, `projects.orgId`
   - `conversations.projectId`
   - `messages.conversationId`, `messages.projectId`, `messages.content`
   - `bots.projectId`, `bots.name`, `bots.type`
   - `bot_flows.botId`, `bot_flows.nodes` (array required)
   - `activity_logs.projectId`, `activity_logs.actionType`
   - `integrations.projectId`, `integrations.provider`
   - `departments.projectId`, `departments.name`
   - `canned_responses.projectId`, `canned_responses.trigger`, `canned_responses.message`
   - `labels.projectId`, `labels.name`, `labels.color`
   - `operating_hours.projectId`, `operating_hours.enabled`, `operating_hours.timezone`, `operating_hours.schedule`
   - `knowledge_bases.projectId`, `knowledge_bases.name`
   - `knowledge_base_sources.kbId`, `knowledge_base_sources.type`, `knowledge_base_sources.value`
   - `knowledge_base_chunks.sourceId`, `knowledge_base_chunks.projectId`, `knowledge_base_chunks.text`, `knowledge_base_chunks.embedding`
   - `contacts.projectId`, `contacts.name`
   - `conversation_events.projectId`, `conversation_events.conversationId`, `conversation_events.handledBy`, `conversation_events.closed`, `conversation_events.createdAt`
   - `csat_ratings.projectId`, `csat_ratings.conversationId`, `csat_ratings.rating`, `csat_ratings.createdAt`
   - `token_usage.projectId`, `token_usage.model`, `token_usage.tokensUsed`, `token_usage.operation`, `token_usage.createdAt`
   - `unanswered_queries.projectId`, `unanswered_queries.query`, `unanswered_queries.count`, `unanswered_queries.lastAskedAt`
   - `project_usage.projectId`, `project_usage.tokensConsumed`, `project_usage.conversationsCount`, `project_usage.billingCycleStart`
   - `webhook_subscriptions.projectId`, `webhook_subscriptions.url`, `webhook_subscriptions.events`, `webhook_subscriptions.secret`, `webhook_subscriptions.isActive`
   - `webhook_deliveries.subscriptionId`, `webhook_deliveries.projectId`, `webhook_deliveries.event`, `webhook_deliveries.url`, `webhook_deliveries.attempt`, `webhook_deliveries.success`, `webhook_deliveries.timestamp`
   - `notifications.projectId`, `notifications.recipientId`, `notifications.type`, `notifications.conversationId`, `notifications.title`, `notifications.read`, `notifications.createdAt`
   - `orders.projectId`, `orders.contactName`, `orders.product`, `orders.status`, `orders.createdAt`
   - `feedback.orgId`, `feedback.submittedBy`, `feedback.submitterName`, `feedback.type`, `feedback.message`, `feedback.createdAt`
   - `push_subscriptions.userId`, `push_subscriptions.orgId`, `push_subscriptions.subscription`, `push_subscriptions.createdAt`

2. **Union/literal validation** — 12 fields use `v.union(v.literal(...))` for enum-like constraints (status codes, channel types, priority levels, notification types, order statuses, feedback types, locales, etc.)

3. **No custom validation functions** — Convex only provides type-level validation. Business rule validation (e.g., "email must be valid format", "phone must be valid") is handled at the mutation level in application code, not at the schema level.

4. **No uniqueness constraints** — Convex doesn't support unique constraints at the schema level. Deduplication is handled in application code (e.g., checking for existing email before creating contact).

5. **`v.any()` used liberally** — 12 fields use `v.any()` for JSON blobs, bypassing type validation. These include `widgetConfig`, `configuration`, `credentials`, `attachments`, `metadata`, `attributes`, `typing`, `schedule`, `variables`, `executionLog` (partially), and others.

### [x] Are there any embedded/nested documents vs normalized references?

**Mixed approach — primarily normalized with selective embedding:**

**Normalized (document references):**
- All parent-child relationships use `v.id("table")` references: projects → conversations → messages, bots → bot_flows, knowledge_bases → sources → chunks, etc.
- This is the dominant pattern — 35+ reference fields

**Embedded/nested data:**
- `conversations.executionLog` — Array of objects embedded directly: `v.array(v.object({ nodeId, type, action, timestamp }))`
- `conversation_bot_state.executionLog` — Same pattern
- `departments.tags` — `v.array(v.string())` — embedded string array
- `departments.memberIds` — `v.array(v.string())` — embedded string array
- `contacts.tags` — `v.array(v.string())` — embedded string array
- `conversations.participants` — `v.array(v.string())` — embedded string array (legacy)
- `conversations.tags` — `v.array(v.string())` — embedded string array (legacy)
- `integrations.credentials` — `v.any()` — embedded encrypted JSON
- `operating_hours.schedule` — `v.any()` — embedded JSON schedule
- `bot_flows.nodes` — `v.array(v.any())` — embedded flow node definitions
- `bot_flows.edges` — `v.any()` — embedded edge definitions
- `bot_flows.variables` — `v.any()` — embedded variables
- `bots.configuration` — `v.any()` — embedded JSON flow config
- `projects.widgetConfig` — `v.any()` — embedded JSON widget settings
- `activity_logs.metadata` — `v.any()` — embedded JSON metadata
- `messages.attachments` — `v.any()` — embedded JSON array
- `conversations.attributes` — `v.any()` — embedded JSON (any type)
- `conversations.typing` — `v.any()` — embedded JSON

**Rationale:** Small, frequently accessed arrays (tags, member lists) are embedded to avoid extra queries. Large or independently-mutated data (messages, bot flows, KB sources) are normalized into separate tables.

### [x] What's the naming convention for tables and fields?

**Table naming:**
- **Snake_case** — All table names use snake_case: `profiles`, `projects`, `conversations`, `messages`, `activity_logs`, `knowledge_bases`, `knowledge_base_sources`, `knowledge_base_chunks`, `conversation_events`, `csat_ratings`, `token_usage`, `unanswered_queries`, `project_usage`, `webhook_subscriptions`, `webhook_deliveries`, `push_subscriptions`, `conversation_bot_state`, `canned_responses`, `operating_hours`, `bot_flows`
- **No prefix convention** — Tables are named without a `tbl_` or app prefix
- **Plural for most tables** — `profiles`, `conversations`, `messages`, `bots`, `contacts`, `orders`, `labels`, `departments`, `notifications`
- **Singular for concept tables** — `feedback` (concept, not individual items), `token_usage` (aggregate concept), `project_usage` (aggregate concept)

**Field naming:**
- **camelCase** — All field names use camelCase: `projectId`, `visitorName`, `assignedTo`, `lastMessage`, `unreadCount`, `createdAt`, `billingCycleStart`
- **Suffix conventions:**
  - `Id` — Document references: `projectId`, `conversationId`, `botId`, `kbId`, `sourceId`, `subscriptionId`, `userId`, `orgId`, `departmentId`
  - `At` — Timestamps: `lastSeenAt`, `updatedAt`, `createdAt`, `firstResponseAt`, `slaDeadline`, `lastAskedAt`, `billingCycleStart`
  - `Count` — Numeric counters: `botStepCount`, `unreadCount`, `tokensUsed`, `conversationsCount`, `count`
  - `Name` — Human-readable names: `visitorName`, `contactName`, `actorName`, `submitterName`

**Index naming:**
- **`by_<field>`** — Single field: `by_userId`, `by_orgId`, `by_projectId`
- **`by_<field>_<field>`** — Composite: `by_projectId_status`, `by_orgId_isAvailable`, `by_provider_enabled`
- **Consistent** — All indexes follow the `by_*` naming convention

### [x] Are timestamps consistently tracked? (creation, updates)

**Inconsistent — two patterns observed:**

**Pattern 1: `createdAt: v.number()` (required, present)**
- `activity_logs.createdAt` — Optional (only 3 tables have this)
- `conversation_events.createdAt` — Required
- `csat_ratings.createdAt` — Required
- `token_usage.createdAt` — Required
- `unanswered_queries.lastAskedAt` — Required (serves as creation time)
- `project_usage.billingCycleStart` — Required (serves as creation time)
- `webhook_deliveries.timestamp` — Required
- `notifications.createdAt` — Required
- `orders.createdAt` — Required
- `feedback.createdAt` — Required
- `push_subscriptions.createdAt` — Required

**Pattern 2: `updatedAt: v.optional(v.number())` (optional, present)**
- `profiles.updatedAt` — Optional
- `conversations.updatedAt` — Optional

**Pattern 3: No timestamps at all (missing)**
- `projects` — No `createdAt` or `updatedAt`
- `bots` — No timestamps
- `bot_flows` — No timestamps (only `version` as string)
- `departments` — No timestamps
- `canned_responses` — No timestamps (only `createdBy`)
- `labels` — No timestamps (only `createdBy`)
- `operating_hours` — No timestamps
- `knowledge_bases` — No timestamps
- `knowledge_base_sources` — No timestamps
- `knowledge_base_chunks` — No timestamps
- `contacts` — No timestamps
- `integrations` — No timestamps
- `messages` — No timestamps (only `conversation_events.createdAt` tracks when events happen)
- `webhook_subscriptions` — No timestamps

**Assessment:** ~40% of tables have creation/update timestamps. The remaining 60% rely on Convex's built-in `_creationTime` field (automatically added by Convex to every document). However, application-level `createdAt`/`updatedAt` fields are not consistently added for audit purposes.

### [x] What's the expected data volume for each table?

**Estimated based on schema design, index patterns, and query code observed in other files:**

| Table | Expected Volume | Rationale |
|-------|----------------|-----------|
| `projects` | Low (10s-100s) | One per org, bounded queries use `.take(100)` |
| `profiles` | Medium (100s-1000s) | One per org member, bounded queries use `.take(100)` |
| `conversations` | High (1000s-100,000s) | Core transactional table, paginated queries, bounded `.take(100-2000)` |
| `messages` | Very High (10,000s-1,000,000s) | Multiple per conversation, paginated queries, bounded `.take(10)` |
| `conversation_bot_state` | Medium (1000s) | One per active bot conversation |
| `bots` | Low-Medium (10s-100s) | Per-project, bounded `.take(100)` |
| `bot_flows` | Low-Medium (10s-100s) | One per bot, bounded |
| `activity_logs` | High (10,000s) | Append-only, paginated queries, bounded `.take(100)` |
| `integrations` | Low (10s) | Few per project, bounded `.take(100)` |
| `departments` | Low (10s) | Few per project, bounded `.take(100)` |
| `canned_responses` | Low-Medium (10s-100s) | Per-project, bounded `.take(200)` |
| `labels` | Low (10s) | Per-project, bounded `.take(200)` |
| `operating_hours` | Very Low (1 per project) | One per project |
| `knowledge_bases` | Low (10s) | Per-project, bounded `.take(100)` |
| `knowledge_base_sources` | Medium (100s-1000s) | Per-KB, bounded `.take(100)` |
| `knowledge_base_chunks` | Very High (10,000s-100,000s) | Per-source chunks with embeddings, vector search |
| `contacts` | Medium-High (100s-10,000s) | Per-project, bounded `.take(500)` |
| `conversation_events` | High (10,000s) | One per conversation, paginated analytics queries |
| `csat_ratings` | Medium (100s-1000s) | Per conversation with rating, paginated analytics |
| `token_usage` | High (10,000s) | Per AI call, paginated analytics queries |
| `unanswered_queries` | Medium (100s-1000s) | Aggregated queries, ordered by count |
| `project_usage` | Low (1 per project) | Monthly aggregation, one per project |
| `webhook_subscriptions` | Low (10s) | Few per project, bounded `.take(100)` |
| `webhook_deliveries` | High (10,000s) | Per webhook event (3 attempts max), bounded cleanup |
| `notifications` | Medium (1000s) | Per-user, capped at 50/user with cleanup cron |
| `orders` | Medium (100s-1000s) | Per-project, bounded `.take(500)` |
| `feedback` | Low-Medium (100s) | Per-org, bounded |
| `push_subscriptions` | Medium (100s-1000s) | One per user-device pair |

### [x] Are there any migration files? (see `migrations.ts`)

**Yes — `convex/migrations.ts` exists but is permanently disabled.**

The file contains one migration function `migrateStatuses` that was designed to migrate conversation status from string values to numeric codes (100 = unassigned, 200 = assigned, 1000 = closed). This migration was completed in March 2026.

The function is **permanently disabled** — it throws an error if called:
```typescript
throw new Error("Migration already run. To re-run data migrations, create a new function in this file.");
```

**No other migration files exist.** The schema evolves through direct modifications to `convex/schema.ts` and manual Convex CLI deployments. Convex handles schema migrations automatically (adding new fields is safe, removing fields requires data migration first).

**No automated migration pipeline** exists — migrations must be manually invoked via Convex CLI or dashboard.

### [x] Is the schema normalized or denormalized? Why?

**Hybrid — predominantly normalized with strategic denormalization.**

**Normalized (3NF-like):**
- Most entities are in separate tables with `v.id()` references: projects → conversations → messages, bots → bot_flows, knowledge_bases → sources → chunks
- No duplicate data storage for primary entities
- 35+ foreign key references enforce referential integrity at the application level

**Strategic denormalization:**

1. **`conversations` table has denormalized visitor data:**
   - `visitorName`, `visitorEmail`, `visitorPhone`, `visitorAddress`, `visitorNote` — all copied from `contacts` to avoid JOIN on every conversation display

2. **`conversations` table has denormalized message data:**
   - `lastMessage` — Latest message content stored directly on conversation to avoid querying messages table for list views

3. **`conversations` table has denormalized counters:**
   - `unreadCount` — Pre-computed counter updated on every message, avoids counting messages table

4. **`conversations` table has denormalized bot state (legacy):**
   - `currentNodeId`, `botStepCount`, `executionLog` — Originally in conversations, later separated into `conversation_bot_state` to avoid OCC (Optimistic Concurrency Control) write conflicts. The legacy fields remain for backward compatibility.

5. **`integrations` table has denormalized lookup fields:**
   - `phoneNumberId`, `pageId`, `webhookSecret` — Stored both encrypted in `credentials` AND as plain indexed fields for O(log n) lookups without decryption. Comment in schema: "Denormalized lookup fields for O(log n) queries (stored inside credentials but also indexed here)"

6. **`contacts` table has denormalized reference:**
   - `conversationId` — Links contact back to originating conversation (bidirectional reference)

7. **`project_usage` table is pre-aggregated:**
   - `tokensConsumed`, `conversationsCount` — Pre-computed counters updated in real-time to avoid expensive aggregation queries across `token_usage` and `conversations` tables

**Rationale:** The denormalization is intentional and well-documented in code comments. It optimizes for the most common query patterns (conversation list views, webhook routing lookups, dashboard stats) by avoiding JOINs or secondary queries. The separation of `conversation_bot_state` from `conversations` specifically addresses Convex's OCC conflicts — the bot engine writes to bot state frequently while conversations are updated by agents, and keeping them separate prevents write conflicts.

---

## 📝 Agent Findings

### Schema Architecture Overview

The schema follows a **project-centric document database** model where `projects` is the root entity and 21 other tables reference it via `v.id("projects")`. This creates a clear ownership hierarchy: every piece of data belongs to a project, and every project belongs to an organization (`orgId`).

### Conversation Table Bloat

The `conversations` table is the **largest and most complex table** with 39 fields. It mixes concerns:
- Core conversation data (visitor info, status, assignment)
- Legacy fields (leadId, firstText, participants, tags, attributes, typing)
- Bot execution state (currentNodeId, botStepCount, executionLog, botId) — now separated into `conversation_bot_state` but legacy fields remain
- HITL handoff data (botPaused, handoffSource, departmentId, priority, firstResponseAt, slaDeadline)
- Channel metadata (channel, channelSenderId)

The separation of `conversation_bot_state` is a good architectural decision to avoid OCC conflicts, but the legacy fields in `conversations` create confusion and wasted storage.

### Vector Search for RAG

The `knowledge_base_chunks` table has a **vector index** with 2048 dimensions, specifically configured for `nvidia/llama-nemotron-embed-vl-1b-v2` embeddings. This is the only vector index in the schema and enables semantic search for the RAG (Retrieval-Augmented Generation) knowledge base feature.

The vector index includes `filterFields: ["sourceId", "projectId"]` allowing filtered vector searches (search within a specific source or project only).

### Numeric Status Codes

`conversations.status` uses **numeric codes** (100, 200, 1000) rather than strings. Per `.agent/AGENT.md`, this was a deliberate migration decision (March 2026) to improve performance and reduce storage vs string comparisons. The codes represent:
- `100` = unassigned (new)
- `200` = assigned (to agent)
- `1000` = closed (resolved)

### Denormalized Integration Lookups

The `integrations` table has an interesting pattern: credentials are encrypted and stored in `credentials: v.any()`, BUT the same values are ALSO stored as plain indexed fields (`phoneNumberId`, `pageId`, `webhookSecret`) for fast lookups. This means:
- **Write path:** Encrypt + store in credentials AND copy to indexed fields
- **Read path (routing):** Query indexed fields directly (O(log n)) without decrypting
- **Read path (auth):** Decrypt credentials for verification

This is a documented performance optimization for webhook routing where every incoming webhook needs to find the right integration in milliseconds.

### Separation of Bot State

`conversation_bot_state` was created as a **separate table specifically to avoid OCC write conflicts**. The bot execution engine writes to this table frequently (every step), while agents update the main `conversations` table (assignment, notes, status changes). Keeping them separate prevents Convex's OCC from rejecting concurrent writes.

### Legacy Field Accumulation

Several tables have "Legacy fields" sections:
- `conversations`: `leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`
- `messages`: `channel`, `senderFullname`, `status`, `type`, `channelMessageId`

These fields are no longer actively used but remain to prevent schema validation errors on old documents.

### Notification Type Safety

`notifications.type` uses a **strict union of 5 literals** (`new_message`, `assigned`, `unassigned_conversation`, `escalation`, `resolved`), preventing arbitrary string values. This is a good type-safety pattern that could be applied more broadly.

---

## 🔍 Key Patterns to Identify

### Schema Design Philosophy
**Hybrid normalized/denormalized.** Core entities are normalized into separate tables with `v.id()` references. Frequently accessed data (visitor info, last message, unread count, integration lookup keys) is denormalized for read performance.

### Indexing Strategy
**Project-first indexing.** Almost every table has `by_projectId` as the primary index. Composite indexes combine projectId with the most common filter (status, createdAt, senderType, email). One vector index powers RAG semantic search.

### Relationship Patterns
- **Project-centric ownership** — 21 tables reference `projectId`
- **Conversation-centric messaging** — messages, bot_state, events, ratings, notifications, orders all reference `conversationId`
- **Hierarchical KB** — knowledge_bases → sources → chunks (3-level hierarchy)
- **String references for external IDs** — Clerk user IDs stored as strings, not Convex references

### Data Modeling Conventions
- **camelCase fields**, **snake_case tables**
- **`v.id("table")` for internal references**, **`v.string()` for external IDs** (Clerk)
- **`v.union(v.literal(...))` for enums** — 12 fields use this pattern
- **`v.optional(v.any())` for JSON blobs** — flexible data storage
- **Numeric status codes** (100, 200, 1000) instead of strings

### Timestamp Tracking Patterns
**Inconsistent.** ~40% of tables have explicit `createdAt`/`updatedAt` fields. The rest rely on Convex's automatic `_creationTime`. No `updatedAt` tracking on most tables — mutations must manually update timestamps.

---

## ⚠️ Potential Concerns

| Severity | Concern | Details |
|----------|---------|---------|
| **HIGH** | `conversations` table bloat (39 fields) | Mixes 4+ concerns: core data, legacy fields, bot state, HITL, channels. Should be split into separate tables. Legacy fields (`leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`) waste storage and confuse developers. |
| **HIGH** | No timestamps on 60% of tables | 18 of 30 tables lack `createdAt`/`updatedAt` fields. While Convex provides `_creationTime`, application-level timestamps are needed for sorting, auditing, and debugging. Affects: projects, bots, bot_flows, departments, canned_responses, labels, operating_hours, knowledge_bases, knowledge_base_sources, knowledge_base_chunks, contacts, integrations, messages. |
| **HIGH** | `v.any()` used in 12+ fields | Bypasses type validation for critical data: `credentials`, `widgetConfig`, `configuration`, `attachments`, `metadata`, `attributes`, `typing`, `schedule`, `variables`. Errors in JSON structure won't be caught until runtime. |
| **MEDIUM** | No unique constraints | Convex doesn't support unique constraints at schema level. Deduplication relies on application-level checks (e.g., checking email exists before creating contact). Race conditions possible during concurrent writes. |
| **MEDIUM** | Legacy fields accumulate | `conversations` has 6 legacy fields + `messages` has 5 legacy fields that are no longer used but stored in every document. No cleanup migration exists. |
| **MEDIUM** | `conversations.botId` is `v.string()` not `v.id("bots")` | Weakly typed reference bypasses Convex's type safety. Should be `v.optional(v.id("bots"))`. Same issue with `departments.botId`. |
| **MEDIUM** | `operating_hours.schedule` is `v.any()` | No type validation for the schedule JSON structure. Invalid schedules won't be caught until runtime. Should use `v.object()` or `v.array()` with defined structure. |
| **LOW** | No soft-delete pattern | Tables don't have `deletedAt` or `isDeleted` fields. Deletions are hard deletes via cascading batch operations. No audit trail for deleted records beyond `activity_logs`. |
| **LOW** | `conversations.tags` embedded string array vs separate `tags` table | Some conversations use embedded tags while the schema also has a conceptual tagging system via `labels`. Inconsistent approach to categorization. |
| **LOW** | No indexes on some queried fields | `contacts.name` (searched by name), `bots.name` (searched by name), `canned_responses.trigger` (searched by trigger) lack indexes. Currently using post-filter with `.filter()`. |
| **LOW** | Migration file is dead code | `convex/migrations.ts` throws immediately if called. File serves no purpose and should be cleaned up or repurposed with a template for future migrations. |
| **INFO** | `feedback` table scoped to `orgId` not `projectId` | Unlike all other tables, feedback is org-scoped rather than project-scoped. This is intentional (feedback is org-wide) but inconsistent with the project-centric model. |
