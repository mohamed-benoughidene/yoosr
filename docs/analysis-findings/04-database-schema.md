# Part 04: Database Schema Design

## 📊 Visual Map

```
convex/schema.ts (477 lines, 21KB)
│
├── User & Auth
│   └── profiles              → User profiles synced from Clerk webhooks
│       Indexes: by_userId, by_orgId, by_orgId_isAvailable
│
├── Multi-Tenant Core
│   ├── projects              → Organizations / workspaces (tenant root)
│   │   Indexes: by_orgId
│   │   └── widgetConfig      → Deeply nested object (translations × 3 locales × 6 fields)
│   │
│   ├── departments           → Team routing groups within a project
│   │   Indexes: by_projectId
│   │
│   └── operating_hours       → Business schedule per project
│       Indexes: by_projectId
│
├── Conversations & Messaging
│   ├── conversations         → Chat threads (largest table, 30+ fields)
│   │   Indexes: by_projectId, by_projectId_status, by_projectId_visitorId, by_projectId_channelSenderId
│   │   ├── Legacy fields     → leadId, firstText, typing (deprecated)
│   │   ├── Bot execution     → currentNodeId, botStepCount, executionLog (backward compat)
│   │   ├── HITL handoff      → botPaused, handoffSource
│   │   ├── Channel routing   → channel (widget|messenger|instagram|telegram|whatsapp), channelSenderId
│   │   └── SLA tracking      → priority, firstResponseAt, slaDeadline
│   │
│   ├── conversation_bot_state → Separated bot execution state (OCC optimization)
│   │   Indexes: by_conversationId
│   │
│   ├── messages              → Individual messages within conversations
│   │   Indexes: by_conversationId, by_projectId, by_projectId_senderType
│   │
│   └── conversation_events   → Bot vs agent handling tracking
│       Indexes: by_projectId, by_conversationId, by_projectId_createdAt
│
├── Bot System
│   ├── bots                  → Bot configurations (chatbot | automation)
│   │   Indexes: by_projectId
│   │   └── configuration     → AI model settings, KB reference, fallback bot
│   │
│   └── bot_flows             → Design Studio graph data (ReactFlow nodes/edges)
│       Indexes: by_botId, by_slug
│       └── executionNodes    → Compiled engine schema for runtime
│
├── Knowledge Base (AI)
│   ├── knowledge_bases       → KB containers per project
│   │   Indexes: by_projectId
│   │
│   ├── knowledge_base_sources → Articles, URLs, files feeding a KB
│   │   Indexes: by_kbId
│   │
│   └── knowledge_base_chunks → Embedding vectors for semantic search
│       VectorIndex: by_embedding (2048 dimensions, nvidia/llama-nemotron)
│       FilterFields: sourceId, projectId
│
├── Contacts & Orders
│   ├── contacts              → Saved visitor information
│   │   Indexes: by_projectId, by_conversationId, by_projectId_email, by_projectId_phone
│   │
│   └── orders                → Orders placed through chat
│       Indexes: by_projectId, by_conversationId, by_projectId_status
│
├── Analytics & Tracking
│   ├── activity_logs         → Audit trail for project actions
│   │   Indexes: by_projectId, by_actionType, by_projectId_createdAt
│   │
│   ├── csat_ratings          → Customer satisfaction scores (1-5)
│   │   Indexes: by_projectId, by_projectId_createdAt
│   │
│   ├── token_usage           → AI token consumption logging
│   │   Indexes: by_projectId, by_projectId_createdAt
│   │
│   ├── unanswered_queries    → Knowledge base gaps tracking
│   │   Indexes: by_projectId, by_projectId_count
│   │
│   └── project_usage         → Monthly quotas (tokens + conversations)
│       Indexes: by_projectId
│
├── Integrations & Webhooks
│   ├── integrations          → External channel configs (telegram, whatsapp, messenger, instagram)
│   │   Indexes: by_projectId, by_provider_enabled, by_provider_phoneNumberId, by_provider_pageId, by_provider_webhookSecret
│   │
│   ├── webhook_subscriptions → RestHooks subscriptions
│   │   Indexes: by_projectId, by_projectId_isActive
│   │
│   └── webhook_deliveries    → Delivery attempt logs
│       Indexes: by_subscriptionId, by_projectId, by_projectId_event
│
├── Communication
│   ├── notifications         → Agent notifications (5 types)
│   │   Indexes: by_recipient, by_project_recipient, by_createdAt
│   │
│   ├── push_subscriptions    → Web push VAPID subscriptions
│   │   Indexes: by_userId, by_orgId
│   │
│   └── canned_responses      → Quick reply templates
│       Indexes: by_projectId
│
├── Misc
│   ├── labels                → Conversation tagging/categorization
│   │   Indexes: by_projectId
│   │
│   └── feedback              → Early Access feedback & feature requests
│       Indexes: by_org, by_created
│
└── Support Files
    ├── convex/types.ts       → ClerkIdentity type, CONVERSATION_STATUS constants
    └── convex/migrations.ts  → 2 migrations (status codes, widget translations)
```

## 📁 File Inventory

| File | Purpose | Actual Status |
|------|---------|---------------|
| `convex/schema.ts` | Master schema defining all database tables (477 lines, 21KB) | ✅ Present — 25 tables defined |
| `convex/types.ts` | Shared type definitions (ClerkIdentity, CONVERSATION_STATUS) | ✅ Present — 52 lines |
| `convex/migrations.ts` | Data migration functions (2 migrations) | ✅ Present — 126 lines |
| `convex/crons.ts` | Scheduled cleanup jobs for append-only tables | ✅ Present — 11 cron jobs |
| `convex/lib/embeddings.ts` | Embedding model configuration (EMBEDDING_CONFIG) | ✅ Present — referenced by schema |

## ✅ Analysis Checklist

- [x] **What tables/collections are defined?**

  **25 tables total:**

  | # | Table | Domain | Fields Count |
  |---|-------|--------|-------------|
  | 1 | `profiles` | Auth | 8 fields |
  | 2 | `projects` | Multi-tenant | 9 fields + nested widgetConfig |
  | 3 | `conversations` | Messaging | 30+ fields (largest table) |
  | 4 | `conversation_bot_state` | Bot Engine | 5 fields |
  | 5 | `messages` | Messaging | 11 fields |
  | 6 | `bots` | Bot System | 6 fields + nested configuration |
  | 7 | `bot_flows` | Bot System | 6 fields + deeply nested nodes/edges |
  | 8 | `activity_logs` | Analytics | 11 fields |
  | 9 | `integrations` | Channels | 7 fields |
  | 10 | `departments` | Routing | 7 fields |
  | 11 | `canned_responses` | Messaging | 4 fields |
  | 12 | `labels` | Organization | 4 fields |
  | 13 | `operating_hours` | Schedule | 4 fields + nested schedule array |
  | 14 | `knowledge_bases` | AI | 4 fields |
  | 15 | `knowledge_base_sources` | AI | 4 fields |
  | 16 | `knowledge_base_chunks` | AI/Vector | 4 fields + vector index |
  | 17 | `contacts` | CRM | 8 fields |
  | 18 | `conversation_events` | Analytics | 5 fields |
  | 19 | `csat_ratings` | Analytics | 5 fields |
  | 20 | `token_usage` | Analytics | 5 fields |
  | 21 | `unanswered_queries` | Analytics | 4 fields |
  | 22 | `project_usage` | Billing | 4 fields |
  | 23 | `webhook_subscriptions` | Integrations | 5 fields |
  | 24 | `webhook_deliveries` | Integrations | 8 fields |
  | 25 | `notifications` | Communication | 8 fields |
  | — | `orders` | CRM | 9 fields |
  | — | `feedback` | Feedback | 7 fields |
  | — | `push_subscriptions` | Communication | 4 fields |

  **Note:** Actually **28 tables** — the visual map in the template listed only ~16. The actual schema has significantly more domain-specific analytics and integration tables.

- [x] **What are the fields for each table?**

  Detailed field breakdown for key tables:

  **`conversations` (largest — 30+ fields):**
  ```
  projectId (id→projects), visitorId (string), visitorName, assignedTo (string),
  status (union: 100|200|1000), lastMessage, resolvedBy, visitorEmail, visitorPhone,
  visitorAddress, visitorNote, unreadCount, rating (1-5), feedback, updatedAt,
  currentNodeId (deprecated→conversation_bot_state), botStepCount (deprecated),
  executionLog (deprecated), botId (id→bots), participants (array<string>), tags (array<string>),
  attributes (any), leadId (legacy), firstText (legacy), typing (legacy),
  botPaused, handoffSource, departmentId (id→departments), priority (union: low|normal|high|urgent),
  firstResponseAt, slaDeadline, channel (union: widget|messenger|instagram|telegram|whatsapp),
  channelSenderId
  ```

  **`projects` (tenant root with nested widget config):**
  ```
  name, description, orgId, status, widgetConfig (object with 8+ nested fields including
  translations with 6 fields × 3 locales = 18 translation slots), widgetLocale,
  defaultModel, openRouterApiKey, slaHours
  ```

  **`bot_flows` (complex nested structure):**
  ```
  botId (id→bots), slug, version, nodes (array<any> — ReactFlow nodes),
  edges (array<object> with id/source/target/sourceHandle/targetHandle/type/label/markerEnd/style),
  executionNodes (array<object> — compiled engine schema), variables (object)
  ```

- [x] **What data types are used? (string, number, boolean, arrays, objects)**

  **Full type inventory:**
  - `v.string()` — Most common: names, IDs, descriptions, content
  - `v.number()` — Timestamps, ratings, counts, token usage
  - `v.boolean()` — Flags: enabled, isDefault, isActive, botPaused, read, closed
  - `v.optional()` — Used extensively (~80% of fields are optional)
  - `v.array(v.string())` — Tags, participants, memberIds, events
  - `v.array(v.object({...}))` — Schedule slots, execution logs, edges, nodes
  - `v.array(v.number())` — Embedding vectors (2048 dimensions)
  - `v.object({...})` — Nested configs: widgetConfig, configuration, translations
  - `v.id("tableName")` — Foreign key references to other Convex tables
  - `v.union(v.literal(...))` — Enum-like unions for status, channel, priority, type
  - `v.any()` — Used 7 times for flexible data: attachments, metadata, attributes, nodes, markerEnd, style, actions
  - `v.null()` — Only in `v.union(v.string(), v.null())` for currentNodeId

- [x] **Which fields are indexed for query performance?**

  **Total: 43 indexes + 1 vector index across 28 tables.**

  | Table | Index Count | Index Fields |
  |-------|------------|--------------|
  | `profiles` | 3 | userId, orgId, orgId+isAvailable |
  | `projects` | 1 | orgId |
  | `conversations` | 4 | projectId, projectId+status, projectId+visitorId, projectId+channelSenderId |
  | `conversation_bot_state` | 1 | conversationId |
  | `messages` | 3 | conversationId, projectId, projectId+senderType |
  | `bots` | 1 | projectId |
  | `bot_flows` | 2 | botId, slug |
  | `activity_logs` | 3 | projectId, actionType, projectId+createdAt |
  | `integrations` | 5 | projectId, provider+enabled, provider+phoneNumberId, provider+pageId, provider+webhookSecret |
  | `departments` | 1 | projectId |
  | `canned_responses` | 1 | projectId |
  | `labels` | 1 | projectId |
  | `operating_hours` | 1 | projectId |
  | `knowledge_bases` | 1 | projectId |
  | `knowledge_base_sources` | 1 | kbId |
  | `knowledge_base_chunks` | 1 vector | embedding (2048d), filters: sourceId, projectId |
  | `contacts` | 4 | projectId, conversationId, projectId+email, projectId+phone |
  | `conversation_events` | 3 | projectId, conversationId, projectId+createdAt |
  | `csat_ratings` | 2 | projectId, projectId+createdAt |
  | `token_usage` | 2 | projectId, projectId+createdAt |
  | `unanswered_queries` | 2 | projectId, projectId+count |
  | `project_usage` | 1 | projectId |
  | `webhook_subscriptions` | 2 | projectId, projectId+isActive |
  | `webhook_deliveries` | 3 | subscriptionId, projectId, projectId+event |
  | `notifications` | 3 | recipientId+createdAt, projectId+recipientId, createdAt |
  | `orders` | 3 | projectId, conversationId, projectId+status |
  | `feedback` | 2 | orgId, createdAt |
  | `push_subscriptions` | 2 | userId, orgId |

- [x] **What relationships exist between tables?**

  **22 explicit foreign key relationships using `v.id("table")`:**

  ```
  conversations.projectId       → projects
  conversations.botId           → bots
  conversations.departmentId    → departments
  conversation_bot_state.conversationId → conversations
  messages.conversationId       → conversations
  messages.projectId            → projects
  bots.projectId                → projects
  bot_flows.botId               → bots
  activity_logs.projectId       → projects
  integrations.projectId        → projects
  departments.projectId         → projects
  departments.botId             → bots
  canned_responses.projectId    → projects
  labels.projectId              → projects
  operating_hours.projectId     → projects
  knowledge_bases.projectId     → projects
  knowledge_base_sources.kbId   → knowledge_bases
  contacts.projectId            → projects
  contacts.conversationId       → conversations
  conversation_events.projectId → projects
  conversation_events.conversationId → conversations
  csat_ratings.projectId        → projects
  csat_ratings.conversationId   → conversations
  token_usage.projectId         → projects
  unanswered_queries.projectId  → projects
  project_usage.projectId       → projects
  webhook_subscriptions.projectId → projects
  webhook_deliveries.subscriptionId → webhook_subscriptions
  webhook_deliveries.projectId  → projects
  notifications.projectId       → projects
  notifications.conversationId  → conversations
  orders.projectId              → projects
  orders.conversationId         → conversations
  bots.configuration.knowledgeBaseId → knowledge_bases
  bots.configuration.fallbackBot    → bots (self-reference)
  ```

  **Implicit string-based references (Clerk IDs, not Convex IDs):**
  - `profiles.userId` → Clerk user ID
  - `conversations.visitorId` → Clerk user ID
  - `conversations.assignedTo` → Clerk user ID
  - `conversations.resolvedBy` → Clerk user ID
  - `activity_logs.userId` → Clerk user ID
  - `notifications.recipientId` → Clerk user ID
  - `departments.memberIds` → Array of Clerk user IDs
  - `projects.orgId` → Clerk organization ID
  - `feedback.orgId` → Clerk organization ID

- [x] **Are there foreign key patterns or document references?**

  **Yes, two patterns coexist:**

  1. **Convex `v.id("table")` references** — Used for all internal table-to-table relationships (22 explicit references). These provide type-safe references validated at write time.

  2. **String-based external references** — Used for Clerk-managed entities (user IDs, org IDs). These are `v.string()` rather than `v.id()` because Clerk IDs are external to Convex. The `profiles` table acts as the bridge — synced via webhook with `profiles.userId` matching Clerk's user ID.

  **No cascade deletes** — Convex doesn't support cascade deletes natively. Data cleanup relies on manual deletion logic or cron-based TTL cleanup (see `crons.ts`).

- [x] **What validation rules are in place?**

  **Schema-level validation:**
  - `v.union(v.literal(...))` for enums: conversation status (100|200|1000), channel type, priority, notification type, order status, feedback type, contact method
  - `v.id("table")` for type-safe foreign keys
  - Required vs optional enforced at schema level
  - Nested object shapes validated: widgetConfig, operating_hours schedule, bot configuration

  **Not validated at schema level (deferred to runtime):**
  - `v.any()` used 7 times — no schema validation for: `attachments`, `metadata`, `attributes`, `nodes`, `markerEnd`, `style`, `actions`
  - String format validation (email, URL, phone) — not enforced in schema
  - Range validation (rating 1-5) — not enforced in schema, only documented in comments
  - Array length limits — not enforced in schema (e.g., tags max 20 is enforced in `contacts.ts`)

- [x] **Are there any embedded/nested documents vs normalized references?**

  **Both patterns used intentionally:**

  **Embedded (denormalized):**
  - `projects.widgetConfig` — Deeply nested object (8 top-level fields + translations with 6 fields × 3 locales). Embedded because it's always read with the project, never queried independently.
  - `bots.configuration` — AI model settings embedded in the bot document.
  - `conversations.executionLog` — Array of execution log entries (deprecated, now in `conversation_bot_state`).
  - `bot_flows.nodes/edges/executionNodes` — Full ReactFlow graph stored as embedded arrays.
  - `operating_hours.schedule` — 7-day schedule with time slots.
  - `departments.memberIds` — Array of Clerk user IDs (vs. a join table).

  **Normalized (referenced):**
  - `knowledge_base_sources` → separate from `knowledge_bases`
  - `knowledge_base_chunks` → separate from `knowledge_base_sources`
  - `conversation_bot_state` → separated from `conversations` (explicit OCC optimization)
  - `webhook_deliveries` → separate from `webhook_subscriptions`
  - `messages` → separate from `conversations`

  **Design rationale:** Embedding for config that's read as a unit; normalizing for high-write/high-read-independently data to avoid OCC conflicts.

- [x] **What's the naming convention for tables and fields?**

  **Tables:** `snake_case` — e.g., `activity_logs`, `bot_flows`, `knowledge_bases`, `canned_responses`, `conversation_bot_state`, `push_subscriptions`

  **Fields:** `camelCase` — e.g., `projectId`, `visitorName`, `assignedTo`, `lastMessage`, `createdAt`, `channelSenderId`, `webhookSecret`

  **Consistent throughout** — no exceptions found.

  **Convention matches Convex best practices** — table names are descriptive plural nouns in snake_case, field names are camelCase matching JavaScript conventions.

- [x] **Are timestamps consistently tracked? (creation, updates)**

  **Inconsistent timestamp tracking — this is a notable gap:**

  | Table | `_creationTime` (auto) | `createdAt` (manual) | `updatedAt` (manual) | Notes |
  |-------|----------------------|---------------------|---------------------|-------|
  | `profiles` | ✅ (Convex auto) | ❌ | ✅ optional | Has updatedAt but no createdAt |
  | `projects` | ✅ (Convex auto) | ❌ | ❌ | No manual timestamps at all |
  | `conversations` | ✅ (Convex auto) | ❌ | ✅ optional | Has updatedAt but no createdAt |
  | `messages` | ✅ (Convex auto) | ❌ | ❌ | Relies solely on Convex auto |
  | `activity_logs` | ✅ (Convex auto) | ✅ optional | ❌ | Has createdAt but it's optional |
  | `conversation_events` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `csat_ratings` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `token_usage` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `orders` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `feedback` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `notifications` | ✅ (Convex auto) | ✅ required | ❌ | |
  | `webhook_deliveries` | ✅ (Convex auto) | ✅ (as `timestamp`) | ❌ | Uses `timestamp` not `createdAt` |
  | `push_subscriptions` | ✅ (Convex auto) | ✅ required | ❌ | |

  **Key observation:** All Convex documents get a built-in `_creationTime` automatically. The manual `createdAt` fields are added where time-range queries need indexed sorting (via `by_*_createdAt` indexes). There's no `updatedAt` on most tables — only `profiles` and `conversations` track it.

- [x] **What's the expected data volume for each table?**

  **Not explicitly documented, but can be inferred from cron cleanup TTLs:**

  | Table | Retention | Growth Pattern |
  |-------|-----------|----------------|
  | `activity_logs` | 90 days | Linear per project activity |
  | `webhook_deliveries` | 30 days | Burst (3 attempts per event × subscriptions) |
  | `token_usage` | 90 days | Linear per AI call |
  | `csat_ratings` | 180 days | Linear per resolved conversation |
  | `conversation_events` | 30 days | Linear per conversation state change |
  | `unanswered_queries` | 90 days | Aggregated (count field increments) |
  | `project_usage` | 90 days | 1 row per project per billing cycle |
  | `conversations` | No TTL | Grows indefinitely — potential concern |
  | `messages` | No TTL | Grows indefinitely — highest volume table |
  | `knowledge_base_chunks` | No TTL | Grows with KB content |

- [x] **Are there any migration files? (see `migrations.ts`)**

  **Yes, `convex/migrations.ts` (126 lines) contains 2 migrations + 1 helper:**

  1. **`migrateStatuses`** — **DISABLED.** Converted conversation status from string ("assigned") to numeric (100/200/1000). Completed March 2026. Throws error if called to prevent re-execution.

  2. **`migrateWidgetTranslations`** — **ACTIVE.** Converts flat widget translation strings to nested per-language objects (en/ar/fr). Idempotent, batch-processes 50 projects at a time.

  3. **`checkWidgetTranslationMigrationStatus`** — Helper query to verify migration progress (counts flat vs nested vs no-translations projects).

  **Migration approach:** Convex migrations are regular `internalMutation` functions run manually via CLI (`npx convex run migrations:functionName`). No migration versioning system or migration history table.

- [x] **Is the schema normalized or denormalized? Why?**

  **Intentionally mixed — mostly normalized with strategic denormalization:**

  **Normalized (majority):**
  - All entity tables are separate (conversations, messages, bots, bot_flows, contacts, etc.)
  - Knowledge base → sources → chunks is fully normalized (3 levels)
  - Webhooks: subscriptions → deliveries separated

  **Denormalized for read performance:**
  - `conversations.lastMessage` — Denormalized from messages table to avoid N+1 on conversation lists
  - `conversations.visitorName/visitorEmail/visitorPhone` — Copied from contacts to avoid joins
  - `integrations.phoneNumberId/pageId/webhookSecret` — Denormalized from credentials JSON for indexed lookups (explicitly documented: "Denormalized lookup fields for O(log n) queries")

  **Denormalized for write performance (OCC):**
  - `conversation_bot_state` — Separated from `conversations` to avoid OCC write conflicts (explicitly documented: "separated from conversations to avoid OCC write conflicts")

  **Pragmatic design** — follows Convex best practices where denormalization reduces query fan-out and OCC is mitigated by splitting hot write paths.

## 📝 Agent Findings

### Strong Points

1. **Thoughtful OCC mitigation** — The `conversation_bot_state` table was intentionally extracted from `conversations` to avoid write conflicts between bot execution and conversation updates. This shows advanced Convex knowledge. The comment is explicit: "separated from conversations to avoid OCC write conflicts."

2. **Comprehensive indexing strategy** — 43 indexes cover all major query patterns. Compound indexes like `by_projectId_status`, `by_projectId_createdAt`, and `by_provider_phoneNumberId` show careful attention to query performance. Every table with analytics queries has a time-based compound index.

3. **Vector search integration** — `knowledge_base_chunks` uses a 2048-dimension vector index with the nvidia/llama-nemotron embedding model. Filter fields are properly configured for project-scoped searches. A WARNING comment documents the coupling between model and dimensions.

4. **Data retention cron jobs** — 7 staggered cron jobs clean up append-only tables (activity_logs: 90d, webhook_deliveries: 30d, token_usage: 90d, csat_ratings: 180d, conversation_events: 30d, unanswered_queries: 90d, project_usage: 90d). Jobs are intentionally staggered across weekdays to avoid simultaneous execution.

5. **Well-documented deprecations** — Legacy fields in `conversations` (leadId, firstText, typing) and the old bot execution fields (currentNodeId, botStepCount, executionLog) are clearly commented as deprecated with migration history.

6. **Smart denormalization** — The integrations table explicitly documents its denormalization pattern: "Denormalized lookup fields for O(log n) queries (stored inside credentials but also indexed here)" for `phoneNumberId`, `pageId`, and `webhookSecret`.

### Areas for Improvement

1. **Excessive use of `v.any()`** — 7 instances bypass schema validation entirely: `attachments`, `metadata`, `attributes` (×2), `nodes`, `markerEnd`, `style`, `actions`. While some justify flexibility (ReactFlow nodes), others like `attachments` could benefit from at least a union of known shapes.

2. **`conversations` table is bloated** — 30+ fields including deprecated ones, bot execution state (kept for backward compat), CRM fields, SLA tracking, channel routing, and tags. This is the largest table and the most likely to cause OCC issues despite the `conversation_bot_state` extraction.

3. **No updatedAt on most tables** — Only `profiles` and `conversations` track `updatedAt`. Tables like `projects`, `bots`, `departments`, `integrations`, and `labels` don't track when they were last modified, making audit trails incomplete.

4. **Inconsistent createdAt usage** — Some tables have manual `createdAt` (required), some have it as optional, and others rely solely on Convex's auto `_creationTime`. The `webhook_deliveries` table uses `timestamp` instead of `createdAt`.

5. **No soft-delete pattern** — No `deletedAt` or `isDeleted` field on any table. All deletes are hard deletes, which makes data recovery impossible and breaks referential integrity if a parent is deleted while children exist.

6. **conversations and messages have no TTL cleanup** — These are the highest-volume tables but have no data retention cron jobs, meaning they grow indefinitely.

### Schema Statistics Summary

| Metric | Count |
|--------|-------|
| Total tables | 28 |
| Total indexes | 43 + 1 vector |
| Total `v.id()` references | 22+ |
| Total `v.any()` usages | 7 |
| Total `v.union(v.literal())` enums | 8 |
| Cron cleanup jobs | 7 |
| Migrations | 2 (1 disabled) |
| Tables with `createdAt` | 10 |
| Tables with `updatedAt` | 2 |

## 🔍 Key Patterns to Identify

| Pattern | Actual Finding |
|---------|----------------|
| Schema design philosophy | **Pragmatic mixed normalization** — normalized by default, denormalized where read performance or OCC demands it. Documented rationale for each denormalization. |
| Indexing strategy | **Comprehensive compound indexes** — 43 indexes covering projectId-scoped queries, time-range queries, and provider lookups. Every analytics table has `by_projectId_createdAt`. |
| Relationship patterns | **Dual approach**: `v.id()` for Convex-internal references (22+), `v.string()` for Clerk external IDs (users, orgs). No join tables — arrays used for M:N (memberIds, tags, participants). |
| Data modeling conventions | **Multi-tenant by default** — `projectId` is the primary partition key on 20+ tables. `orgId` used only on `projects`, `profiles`, and `feedback`. |
| Timestamp tracking patterns | **Inconsistent** — auto `_creationTime` always present, manual `createdAt` on ~10 tables, `updatedAt` on only 2. No consistent pattern enforced. |

## ⚠️ Potential Concerns

| Concern | Severity | Details |
|---------|----------|---------|
| `v.any()` used 7 times | **MEDIUM** | Bypasses schema validation. `attachments`, `metadata`, `attributes` (×2), `nodes`, `markerEnd`, `style`, `actions` are all unvalidated. Could lead to data integrity issues. |
| No soft-delete pattern | **HIGH** | Hard deletes on all tables. If a bot is deleted, `bot_flows` referencing it become orphaned. No way to recover accidentally deleted data. |
| `conversations` table bloat | **MEDIUM** | 30+ fields including deprecated ones. This is the most queried and most written-to table. The OCC risk is partially mitigated by `conversation_bot_state` extraction but the table itself is still a hot spot. |
| No TTL on conversations/messages | **HIGH** | Highest-volume tables have no cleanup. Over time, these will dominate storage costs and query performance. |
| Inconsistent timestamps | **MEDIUM** | No enforced pattern for createdAt/updatedAt. Makes auditing and debugging harder. `webhook_deliveries.timestamp` breaks the naming convention. |
| `openRouterApiKey` stored in projects | **HIGH** | API keys stored as plain strings in the `projects` table (line 71). Should use `convex/lib/crypto.ts` encryption or Convex environment variables. |
| String-based Clerk IDs not indexed everywhere | **LOW** | `conversations.assignedTo` (Clerk user ID) is not indexed — querying "all conversations assigned to agent X" requires a full table scan within the project. |
| Duplicate bot execution state | **MEDIUM** | Bot execution fields exist in both `conversations` (deprecated) and `conversation_bot_state` (current). Migration to remove deprecated fields hasn't been completed. |
