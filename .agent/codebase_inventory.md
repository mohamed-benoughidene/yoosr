# Yoosr — Codebase Inventory

> Generated from source code. **Read-only audit — no files modified.**

---

## 1. Convex Schema (22 Tables)

| # | Table | Fields | Indexes |
|---|-------|--------|---------|
| 1 | `projects` | `name`, `description`, `orgId`, `status`, `widgetConfig?`, `widgetLocale?`, `defaultModel?`, `slaHours?`, `openRouterApiKey?` | `by_orgId(orgId)` |
| 2 | `conversations` | `projectId`, `visitorId?`, `visitorName?`, `channel?`, `status` (100/200/1000), `assignedTo?`, `botId?`, `botPaused?`, `priority?`, `departmentId?`, `participants?[]`, `attributes?`, `tags?[]`, `rating?`, `feedback?`, `slaDeadline?`, `firstResponseAt?`, `resolvedBy?`, `closedAt?`, `updatedAt?`, `lastBotNodeId?`, `lastBotTurn?` | `by_projectId(projectId)`, `by_visitorId(visitorId)`, `by_projectId_status(projectId, status)` |
| 3 | `messages` | `conversationId`, `projectId`, `senderType` (visitor/agent/bot), `senderId?`, `content`, `type?`, `buttons?`, `attachments?`, `metadata?`, `fileId?`, `fileName?` | `by_conversationId(conversationId)`, `by_projectId(projectId)` |
| 4 | `profiles` | `userId`, `fullName?`, `email?`, `avatarUrl?`, `username?`, `orgId?`, `isAvailable?`, `lastSeenAt?`, `updatedAt?` | `by_userId(userId)`, `by_orgId(orgId)`, `by_orgId_isAvailable(orgId, isAvailable)` |
| 5 | `bots` | `projectId`, `name`, `description?`, `type`, `status`, `configuration?` | `by_projectId(projectId)` |
| 6 | `bot_flows` | `botId`, `nodes`, `edges`, `executionNodes?`, `variables?` | `by_botId(botId)` |
| 7 | `conversation_bot_state` | `conversationId`, `currentNodeId?`, `attributes?`, `turnCount?`, `awaitingUserReply?`, `captureAttribute?`, `aiAssistantState?`, `askKbState?` | `by_conversationId(conversationId)` |
| 8 | `knowledge_bases` | `projectId`, `name`, `description?`, `isDefault?` | `by_projectId(projectId)` |
| 9 | `knowledge_base_sources` | `kbId`, `type`, `value`, `status?` | `by_kbId(kbId)` |
| 10 | `knowledge_base_chunks` | `sourceId`, `projectId`, `text`, `embedding` (vector 2048) | `by_embedding` (vectorIndex, filter: projectId) |
| 11 | `contacts` | `projectId`, `name`, `email?`, `phone?`, `address?`, `note?`, `tags?[]`, `conversationId?` | `by_projectId(projectId)`, `by_conversationId(conversationId)` |
| 12 | `departments` | `projectId`, `name`, `description?`, `isDefault?`, `memberIds?[]`, `routingMode?`, `botId?`, `tags?[]` | `by_projectId(projectId)` |
| 13 | `canned_responses` | `projectId`, `trigger`, `message`, `createdBy?` | `by_projectId(projectId)` |
| 14 | `labels` | `projectId`, `name`, `color`, `createdBy?` | `by_projectId(projectId)` |
| 15 | `integrations` | `projectId`, `provider`, `credentials?`, `enabled?` | `by_projectId(projectId)` |
| 16 | `activity_logs` | `projectId`, `userId?`, `actorId?`, `actorName?`, `actionType?`, `action?`, `description?`, `metadata?`, `targetType?`, `targetId?`, `createdAt?` | `by_projectId(projectId)` |
| 17 | `notifications` | `projectId`, `recipientId`, `type`, `conversationId`, `title`, `body?`, `read`, `createdAt` | `by_recipient(recipientId)`, `by_project_recipient(projectId, recipientId)`, `by_createdAt(createdAt)` |
| 18 | `operating_hours` | `projectId`, `enabled`, `timezone`, `schedule` | `by_projectId(projectId)` |
| 19 | `orders` | `projectId`, `conversationId?`, `contactName`, `phone?`, `product`, `notes?`, `status`, `createdAt` | `by_projectId(projectId)` |
| 20 | `token_usage` | `projectId`, `model`, `tokensUsed`, `operation`, `createdAt` | `by_projectId(projectId)` |
| 21 | `project_usage` | `projectId`, `tokensConsumed`, `conversationsCount`, `billingCycleStart` | `by_projectId(projectId)` |
| 22 | `unanswered_queries` | `projectId`, `query`, `count`, `lastAskedAt` | `by_projectId(projectId)`, `by_projectId_count(projectId, count)` |

**Additional tables in schema:**
| # | Table | Fields | Indexes |
|---|-------|--------|---------|
| 23 | `webhook_subscriptions` | `projectId`, `url`, `events[]`, `secret`, `isActive` | `by_projectId(projectId)`, `by_projectId_isActive(projectId, isActive)` |
| 24 | `conversation_events` | `projectId`, `conversationId`, `handledBy`, `closed`, `createdAt` | `by_projectId_createdAt(projectId, createdAt)` |
| 25 | `csat_ratings` | `projectId`, `conversationId`, `rating`, `comment?`, `createdAt` | `by_projectId(projectId)` |
| 26 | `feedback` | `orgId`, `submittedBy`, `submitterName`, `submitterEmail?`, `type`, `message`, `createdAt` | — |

---

## 2. Convex Backend — Exported Functions

### [conversations.ts](file:///home/mohamed/lab/yoosr/convex/conversations.ts) (1339 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | Paginated list of conversations for a project, filtered by status/search/tag/assignee |
| `get` | query | Get single conversation by ID with auth check |
| `getByVisitorId` | query | Find conversation by visitorId for a project |
| `listUnassigned` | query | List conversations with status=100 (unassigned) for a project |
| `listUnassignedInternal` | internalQuery | Same as above, no auth |
| `createFromWidget` | mutation | Create conversation from widget visitor (no auth) |
| `update` | mutation | Update conversation fields (status, assignedTo, priority, department, tags, etc.) |
| `resolve` | mutation | Close conversation (status=1000), log event, fire webhook, schedule tag extraction |
| `assign` | mutation | Assign agent to conversation, insert system message, notify |
| `unassign` | mutation | Remove assignee, set status=100 |
| `addParticipant` | mutation | Add a participant ID to conversation's participants array |
| `setAttributes` | mutation | Merge key-value attributes onto conversation |
| `rateConversation` | mutation | Set rating + feedback from widget (no auth) |
| `startNewConversation` | mutation | Create new conversation + send first message + route |
| `autoCloseInactive` | internalMutation | Cron: close conversations idle >24h with status 100/200 |
| `updateConversationAttributes` | internalMutation | Internal version of setAttributes |
| `getConversationInternal` | internalQuery | Get conversation by ID without auth |
| `getProjectIdByConversation` | internalQuery | Return projectId for a given conversationId |
| `listByProjectInternal` | internalQuery | List conversations for a project (no auth) |
| `pauseBot` | mutation | Set botPaused=true on a conversation |
| `resumeBot` | mutation | Set botPaused=false and re-trigger bot execution |
| `setBotNodePointer` | internalMutation | Update lastBotNodeId and lastBotTurn state |
| `updateFromHttp` | internalMutation | Patch conversation fields from HTTP handler context |

---

### [bot.ts](file:///home/mohamed/lab/yoosr/convex/bot.ts) (850 lines)

| Export | Type | Description |
|--------|------|-------------|
| `executeNextBlock` | internalAction | Main bot engine: walks execution graph, evaluates nodes (reply, condition, AI task, AI assistant, KB search, HITL handoff, operating hours check, online agent check, capture user reply, wait, code action, clear transcript, apply label, set priority, change department, replace bot, close) |
| `resumeAfterUserReply` | internalAction | Resumes bot execution after a user reply was captured |
| `handleIncomingVisitorMessage` | internalMutation | Processes incoming visitor message: if bot is awaiting reply, captures it and schedules resume; otherwise schedules `executeNextBlock` |
| `sendBotMessage` | internalMutation | Insert a bot message into the messages table |
| `getBotState` | internalQuery | Get `conversation_bot_state` for a conversation |
| `upsertBotState` | internalMutation | Create or update `conversation_bot_state` |

---

### [messages.ts](file:///home/mohamed/lab/yoosr/convex/messages.ts) (~380 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | Paginated messages for a conversation (auth required) |
| `listPublic` | internalQuery | List messages for a conversation (no auth, used by bot/tags) |
| `send` | mutation | Agent sends a message, fires `message.sent` webhook, creates notification |
| `sendFromWidget` | mutation | Visitor sends a message from widget, triggers bot handler, increments usage |
| `markRead` | mutation | Marks messages as read by patching them |
| `generateUploadUrl` | action | Generate Convex storage upload URL (auth required) |
| `generateWidgetUploadUrl` | internalMutation | Generate upload URL for widget (no auth) |
| `getWidgetMessages` | internalQuery | Get messages for widget HTTP endpoint |
| `sendWidgetMessage` | internalMutation | Internal: insert widget message |

---

### [http.ts](file:///home/mohamed/lab/yoosr/convex/http.ts) (~501 lines)

| Route | Method | Description |
|-------|--------|-------------|
| `/widget/config` | GET | Return project name + widgetConfig (public) |
| `/widget/messages` | GET | Return messages for a conversation (public) |
| `/widget/messages` | POST | Receive visitor message, create conversation if needed, route |
| `/widget/upload-url` | POST | Generate upload URL for widget file attachments |
| `/widget/csat` | POST | Submit CSAT rating from widget |
| `/webhooks/clerk` | POST | Clerk user/org webhook handler (upserts profiles, ensures projects) |
| `/webhooks/telegram` | POST | Telegram incoming message handler |
| `/webhooks/whatsapp` | GET | WhatsApp webhook verification |
| `/webhooks/whatsapp` | POST | WhatsApp incoming message handler |
| `/api/agent-offline` | POST | sendBeacon handler to mark agent offline |

---

### [analytics.ts](file:///home/mohamed/lab/yoosr/convex/analytics.ts) (519 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getConversationStats` | query | Total/open/closed conversation counts for a project |
| `getVisitorStats` | query | Unique visitor count for a project |
| `getMessageStats` | query | Total/visitor/agent message counts |
| `getConversationVolume` | query | Daily bot-vs-agent conversation volume over date range |
| `getTokenUsage` | query | Token usage summed by model over date range |
| `getUnansweredQueries` | query | Top unanswered queries sorted by count |
| `getCSATSummary` | query | CSAT average + distribution (1-5 stars) |
| `getProjectUsage` | query | Real-time token + conversation quotas |
| `getTagsSummary` | query | Top 10 semantic tags from closed conversations |
| `getSLABreachRate` | query | SLA breach rate for conversations in date range |
| `logTokenUsage` | internalMutation | Log token usage row + update `project_usage` |
| `logUnansweredQuery` | internalMutation | Upsert unanswered query (increment count) |
| `logConversationEvent` | internalMutation | Log bot/agent event to `conversation_events` |
| `submitCSATInternal` | internalMutation | CSAT write from HTTP action |
| `submitCSAT` | mutation | Public CSAT submission from widget |
| `dismissUnansweredQuery` | mutation | Delete an unanswered query with multi-tenancy check |

---

### [routing.ts](file:///home/mohamed/lab/yoosr/convex/routing.ts) (229 lines)

| Export | Type | Description |
|--------|------|-------------|
| `routeConversation` | internalMutation | Smart assignment: 1) try bot, 2) least-busy agent, 3) leave unassigned (pooled) |
| `retryRoutingForAgent` | internalAction | Re-route unassigned conversations when agent comes online |
| `retryUnassignedConversations` | internalMutation | Cron: re-route conversations stuck unassigned >5min |

---

### [settings.ts](file:///home/mohamed/lab/yoosr/convex/settings.ts) (473 lines)

| Export | Type | Description |
|--------|------|-------------|
| `listDepartments` | query | List departments for a project |
| `getMyDepartments` | query | List departments the current user belongs to |
| `createDepartment` | mutation | Create department (admin only) |
| `updateDepartment` | mutation | Update department fields (admin only) |
| `removeDepartment` | mutation | Delete department (admin only, cannot delete default) |
| `addMemberToDepartment` | mutation | Add Clerk user to department with multi-tenancy check |
| `removeMemberFromDepartment` | mutation | Remove Clerk user from department |
| `listCannedResponses` | query | List canned responses for a project |
| `createCannedResponse` | mutation | Create canned response (admin only) |
| `updateCannedResponse` | mutation | Update canned response (admin only) |
| `removeCannedResponse` | mutation | Delete canned response (admin only) |
| `listLabels` | query | List labels for a project |
| `createLabel` | mutation | Create label (admin only) |
| `updateLabel` | mutation | Update label (admin only) |
| `removeLabel` | mutation | Delete label + cascade remove from conversation tags |
| `getOperatingHours` | query | Get operating hours config for a project |
| `upsertOperatingHours` | mutation | Create or update operating hours (admin only) |

---

### [projects.ts](file:///home/mohamed/lab/yoosr/convex/projects.ts) (299 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getPublic` | internalQuery | Get project name + widget config (no auth, for widget) |
| `list` | query | List projects for user's active org |
| `get` | query | Get single project by ID with org check |
| `getByOrgId` | query | Get project by orgId with org check |
| `getByOrgIdInternal` | internalQuery | Get project by orgId (no auth) |
| `ensureProject` | mutation | Create default project if none exists for the org |
| `create` | mutation | Create new project for the active org |
| `update` | mutation | Update project fields (admin only) |
| `remove` | mutation | Delete project + cascade delete all related records (admin only) |
| `updateWidgetLocale` | mutation | Set widget locale (en/ar/fr) |
| `clearWidgetLocale` | mutation | Clear widget locale |

---

### [profiles.ts](file:///home/mohamed/lab/yoosr/convex/profiles.ts) (294 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getMe` | query | Get current user's profile |
| `getByUserId` | query | Get profile by userId (no org check) |
| `list` | query | List profiles in current user's org |
| `updateMe` | mutation | Update own profile fields |
| `upsertFromClerk` | internalMutation | Sync profile from Clerk webhook |
| `ensureCurrent` | mutation | Ensure profile exists on dashboard load, sync Clerk data |
| `seedProfile` | internalMutation | Seed a profile manually |
| `setAvailability` | mutation | Toggle agent availability, trigger re-routing if going online |
| `updateHeartbeat` | mutation | Update lastSeenAt timestamp |
| `setOffline` | internalMutation | Mark agent offline (sendBeacon) |
| `cleanupStalePresence` | internalMutation | Cron: mark agents offline if lastSeenAt > 90s ago |

---

### [knowledge.ts](file:///home/mohamed/lab/yoosr/convex/knowledge.ts) (270 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getChunkInternal` | internalQuery | Get a KB chunk by ID |
| `getSourceInternal` | internalQuery | Get a KB source by ID |
| `insertChunkInternal` | internalMutation | Insert a knowledge base chunk with embedding |
| `updateSourceStatusInternal` | internalMutation | Update source status (indexing/indexed/failed) |
| `indexSource` | internalAction | Process source (text/url/file), chunk, embed via OpenRouter, store |
| `searchSimilarChunks` | internalAction | Vector search for similar chunks, logs unanswered if no results |

---

### [knowledgeBases.ts](file:///home/mohamed/lab/yoosr/convex/knowledgeBases.ts) (164 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | List knowledge bases for a project |
| `get` | query | Get single knowledge base |
| `getOrCreateDefault` | mutation | Get or create default KB for a project |
| `create` | mutation | Create knowledge base |
| `listSources` | query | List sources for a KB |
| `addSource` | mutation | Add source + schedule indexing |
| `removeSource` | mutation | Delete a source |
| `generateKbUploadUrl` | action | Generate upload URL for KB file uploads |
| `remove` | mutation | Delete KB + cascade delete all sources |

---

### [integrations.ts](file:///home/mohamed/lab/yoosr/convex/integrations.ts) (252 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | List integrations for a project |
| `upsert` | mutation | Create or update integration |
| `upsertInternal` | internalMutation | Same as above, no auth |
| `remove` | mutation | Delete integration (admin, multi-tenancy check) |
| `listForProject` | internalQuery | List integrations (no auth, for internal actions) |
| `saveChannelIntegration` | action | Save integration with encrypted credentials |
| `patchCredentials` | internalMutation | Patch encrypted credentials on existing integration |
| `registerTelegramWebhook` | action | Register Telegram bot webhook URL |
| `getDecryptedWhatsAppCredentials` | internalQuery | Decrypt and return WhatsApp credentials |
| `getWhatsAppIntegrationByPhoneNumberId` | internalQuery | Find WhatsApp integration by phone number ID |

---

### [webhooks.ts](file:///home/mohamed/lab/yoosr/convex/webhooks.ts) (199 lines)

| Export | Type | Description |
|--------|------|-------------|
| `fireWebhookEvent` | internalAction | POST webhook payloads to active subscriptions with HMAC signature |
| `getActiveSubscriptions` | internalQuery | Fetch active subscriptions for project+event |
| `list` | query | List webhook subscriptions for a project |
| `create` | mutation | Create webhook subscription with auto-generated secret (admin) |
| `update` | mutation | Toggle isActive on webhook subscription (admin) |
| `remove` | mutation | Delete webhook subscription (admin, multi-tenancy check) |
| `backfillWebhookSecrets` | mutation | Migration: backfill secrets on existing subscriptions |

---

### [tags.ts](file:///home/mohamed/lab/yoosr/convex/tags.ts) (191 lines)

| Export | Type | Description |
|--------|------|-------------|
| `extractGenerativeTags` | internalAction | LLM-based tag extraction from closed conversations (labels-constrained) |
| `updateConversationTags` | internalMutation | Merge and deduplicate tags on a conversation |
| `getProjectLabels` | internalQuery | Fetch all labels for a project |
| `assignTagToConversation` | mutation | Assign a tag to a conversation + activity log |
| `removeTagFromConversation` | mutation | Remove a tag from a conversation + activity log |

---

### [bots.ts](file:///home/mohamed/lab/yoosr/convex/bots.ts) (137 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | List bots for a project |
| `get` | query | Get single bot |
| `create` | mutation | Create bot (admin only) |
| `update` | mutation | Update bot (admin only) |
| `remove` | mutation | Delete bot + cascade delete flows (admin only) |

---

### [botFlows.ts](file:///home/mohamed/lab/yoosr/convex/botFlows.ts) (241 lines)

| Export | Type | Description |
|--------|------|-------------|
| `get` | query | Get flow for a bot |
| `save` | mutation | Upsert flow: compiles React Flow nodes/edges into `executionNodes` |

Supported node types in compiler: `start`, `reply`, `setAttribute`, `condition`, `webRequest`, `aiTask`, `ai_assistant`, `hitlHandoff`, `close`, `if_operating_hours`, `if_online_agent`, `ask_kb`, `capture_user_reply`, `wait`, `replace_bot`, `change_department`, `code_action`, `clear_transcript`, `applyLabel`, `setPriority`

---

### [orders.ts](file:///home/mohamed/lab/yoosr/convex/orders.ts) (190 lines)

| Export | Type | Description |
|--------|------|-------------|
| `createOrder` | mutation | Create order with multi-tenancy check |
| `listOrders` | query | List orders for a project |
| `updateOrderStatus` | mutation | Update order status (new/confirmed/cancelled) |
| `deleteOrder` | mutation | Delete order |
| `batchImportOrders` | mutation | Batch import up to 500 orders |

---

### [notifications.ts](file:///home/mohamed/lab/yoosr/convex/notifications.ts) (209 lines)

| Export | Type | Description |
|--------|------|-------------|
| `createNotification` | internalMutation | Create notification, auto-trim to 50 per user |
| `listForCurrentUser` | query | List 30 most recent notifications for current user |
| `unreadCount` | query | Count unread notifications |
| `markAsRead` | mutation | Mark single notification read |
| `markAllRead` | mutation | Mark all notifications read |
| `clearAll` | mutation | Delete all notifications for current user |
| `cleanupOldNotifications` | internalMutation | Cron: delete notifications older than 7 days |

---

### [contacts.ts](file:///home/mohamed/lab/yoosr/convex/contacts.ts) (178 lines)

| Export | Type | Description |
|--------|------|-------------|
| `list` | query | List contacts for a project |
| `findByConversation` | query | Find contact linked to a conversation |
| `create` | mutation | Create contact + fire `contact.created` webhook |
| `update` | mutation | Update contact fields |
| `remove` | mutation | Delete contact (blocks if linked to active conversation) |
| `batchImport` | mutation | Batch import up to 500 contacts (dedup by email) |

---

### [activityLogs.ts](file:///home/mohamed/lab/yoosr/convex/activityLogs.ts) (97 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getActivityLog` | query | Paginated activity log (newest first) |
| `list` | query | Legacy: take 100 recent activity logs |
| `log` | mutation | Public mutation to log an activity |
| `logActivityInternal` | internalMutation | Internal: log activity from backend functions |

---

### [dashboard.ts](file:///home/mohamed/lab/yoosr/convex/dashboard.ts) (151 lines)

| Export | Type | Description |
|--------|------|-------------|
| `getHomeStats` | query | Aggregate dashboard home stats: live queue, today snapshot, bot count, online teammates |

---

### [openrouter.ts](file:///home/mohamed/lab/yoosr/convex/openrouter.ts) (93 lines)

| Export | Type | Description |
|--------|------|-------------|
| `callAITask` | function (not exported as Convex fn) | Single-shot LLM call via OpenRouter (for AI Task blocks) |
| `callAIAssistant` | function (not exported as Convex fn) | Multi-turn LLM call via OpenRouter (for AI Assistant blocks) |

---

### [openrouter_api.ts](file:///home/mohamed/lab/yoosr/convex/openrouter_api.ts) (139 lines)

| Export | Type | Description |
|--------|------|-------------|
| `saveOpenRouterKey` | mutation | Save encrypted OpenRouter API key on project |
| `clearOpenRouterKey` | mutation | Clear API key from project |
| `getOpenRouterKeyStatus` | query | Check if key exists, return masked version |
| `testOpenRouterKey` | action | Test API key with a ping request |
| `getProjectByOrgIdInternal` | internalQuery | Get project by orgId (internal helper) |

---

### [aiFlowBuilder.ts](file:///home/mohamed/lab/yoosr/convex/aiFlowBuilder.ts) (199 lines)

| Export | Type | Description |
|--------|------|-------------|
| `generateFlow` | action | AI-powered flow generation: takes natural language prompt, returns React Flow nodes/edges |

---

### Remaining small files

| File | Export | Type | Description |
|------|--------|------|-------------|
| `feedback.ts` | `submitFeedback` | mutation | Submit bug/feature/general feedback (auth required) |
| `labels.ts` | `listLabels` | query | Duplicate of `settings.listLabels` — lists labels for a project |
| `diagnostic.ts` | `getRecentMessages` | internalQuery | Debug: get 10 recent messages |
| `diagnostic.ts` | `getConvoPointer` | internalQuery | Debug: get 5 recent conversations with bot state |
| `diagnostic.ts` | `getBotFlow` | internalQuery | Debug: get latest bot flow |
| `getAny.ts` | `getFirstProject` | internalQuery | Debug: get first project ID |
| `migrations.ts` | `migrateStatuses` | internalMutation | One-time migration: string statuses → numeric |
| `utils.ts` | `requireAdmin` | helper function | Throws if user is not `org:admin` |
| `lib/crypto.ts` | `encryptSecret` / `decryptSecret` | helper functions | AES-GCM encryption/decryption for credential storage |
| `crons.ts` | (default) | cron config | 4 crons: auto-close inactive (5min), cleanup notifications (24h), cleanup stale presence (60s), retry unassigned (5min) |

---

## 3. App Router Routes

### Pages (24)

| Route | Type | Renders |
|-------|------|---------|
| `[locale]/(marketing)/page.tsx` | page | Landing/marketing home page |
| `[locale]/login/page.tsx` | page | Clerk sign-in page |
| `[locale]/signup/page.tsx` | page | Clerk sign-up page |
| `[locale]/onboarding/page.tsx` | page | Onboarding flow (post-signup setup) |
| `[locale]/pricing/page.tsx` | page | Pricing page |
| `[locale]/products/[slug]/page.tsx` | page | Dynamic product page |
| `[locale]/solutions/[slug]/page.tsx` | page | Dynamic solutions page |
| `[locale]/dashboard/page.tsx` | page | Dashboard home (stats, live queue) |
| `[locale]/dashboard/monitor/page.tsx` | page | Live conversation monitor/inbox |
| `[locale]/dashboard/chat/page.tsx` | page | Agent chat view |
| `[locale]/dashboard/contacts/page.tsx` | page | Contacts management |
| `[locale]/dashboard/bots/page.tsx` | page | Bot listing and creation |
| `[locale]/dashboard/kb/page.tsx` | page | Knowledge base management |
| `[locale]/dashboard/analytics/page.tsx` | page | Analytics dashboard |
| `[locale]/dashboard/activities/page.tsx` | page | Activity audit log |
| `[locale]/dashboard/orders/page.tsx` | page | Order management |
| `[locale]/dashboard/apps/page.tsx` | page | Integrations management |
| `[locale]/dashboard/settings/page.tsx` | page | Settings landing |
| `[locale]/dashboard/requests/page.tsx` | page | UNCLEAR — needs review |
| `[locale]/dashboard/history/page.tsx` | page | Resolved conversations history |
| `[locale]/dashboard/test-widget/page.tsx` | page | Widget preview/testing |
| `[locale]/design-studio/[botId]/page.tsx` | page | Visual bot flow editor (React Flow) |
| `[locale]/test-widget/page.tsx` | page | Public widget test page |
| `widget/page.tsx` | page | Embeddable chat widget (standalone) |

### Layouts (9)

| Route | Type | Purpose |
|-------|------|---------|
| `layout.tsx` | root layout | HTML root, fonts, Clerk/Convex providers |
| `[locale]/layout.tsx` | locale layout | i18n locale wrapper |
| `[locale]/(marketing)/layout.tsx` | layout | Marketing pages wrapper |
| `[locale]/dashboard/layout.tsx` | layout | Dashboard shell (sidebar, header, auth guard) |
| `[locale]/dashboard/chat/layout.tsx` | layout | Chat page nested layout |
| `[locale]/dashboard/kb/layout.tsx` | layout | Knowledge base nested layout |
| `[locale]/dashboard/settings/layout.tsx` | layout | Settings nested layout with sidebar |
| `[locale]/design-studio/layout.tsx` | layout | Design studio wrapper |
| `widget/layout.tsx` | layout | Widget standalone layout |

### Loading States (10)

| Route |
|-------|
| `dashboard/loading.tsx`, `dashboard/activities/loading.tsx`, `dashboard/apps/loading.tsx`, `dashboard/bots/loading.tsx`, `dashboard/contacts/loading.tsx`, `dashboard/kb/loading.tsx`, `dashboard/monitor/loading.tsx`, `dashboard/orders/loading.tsx`, `dashboard/settings/loading.tsx`, `design-studio/[botId]/loading.tsx` |

---

## 4. Key UI Components (110 files, 11 feature dirs)

### Core / Layout

| Component | Description |
|-----------|-------------|
| `ConvexClientProvider.tsx` | Clerk + Convex provider wrapper |
| `providers.tsx` | Theme + i18n providers |
| `HtmlDirSetter.tsx` | Sets HTML `dir` attribute for RTL |
| `LanguageSwitcher.tsx` | Locale switcher (en/ar/fr) |
| `error-fallback.tsx` | Error boundary fallback UI |

### Dashboard Shell (`dashboard/`)

| Component | Description |
|-----------|-------------|
| `AppSidebar.tsx` | Main navigation sidebar |
| `SiteHeader.tsx` | Top header bar |
| `NotificationBell.tsx` | Notification dropdown with unread count |
| `loading-skeletons.tsx` | Shared loading skeleton components |

### Chat (`chat/`)

| Component | Description |
|-----------|-------------|
| `ChatArea.tsx` | Agent-side chat message display, input, file uploads, image rendering |
| `ConversationList.tsx` | Conversation list sidebar |

### Monitor (`dashboard/monitor/`)

| Component | Description |
|-----------|-------------|
| `monitor-layout.tsx` | Split-pane inbox layout |
| `conversation-list.tsx` | Filtered conversation list |
| `chat-display.tsx` | Chat display for monitoring view |
| `canned-response-picker.tsx` | Canned response quick-insert picker |

### Design Studio (`design-studio/`)

| Component | Description |
|-----------|-------------|
| `FlowEditor.tsx` | React Flow canvas for bot flow editing |
| `FlowToolbar.tsx` | Toolbar with save/test/AI-generate buttons |
| `BlockPalette.tsx` | Draggable node palette |
| `NodePropertiesPanel.tsx` | Properties editor for selected node |
| `AIPromptBar.tsx` | AI prompt input bar for flow generation |
| `DebuggerPanel.tsx` | Flow debugger/tester panel |
| `nodes/*.tsx` (20 files) | Custom React Flow node components (Start, Reply, Condition, AITask, AIAssistant, AskKB, HITL, Close, Wait, WebRequest, CaptureUserReply, SetAttribute, CodeAction, ClearTranscript, ApplyLabel, SetPriority, ChangeDepartment, ReplacBot, IfOperatingHours, IfOnlineAgent) |

### Analytics (`analytics/`)

| Component | Description |
|-----------|-------------|
| `ConversationVolumeChart.tsx` | Bot vs agent volume chart |
| `AnalyticsCSAT.tsx` | CSAT summary display |
| `AnalyticsTagsChart.tsx` | Tags distribution chart |
| `AnalyticsUnansweredQueries.tsx` | Unanswered queries list |
| `AnalyticsUsageQuotas.tsx` | Token/conversation usage gauges |

### Settings (`settings/`)

| Component | Description |
|-----------|-------------|
| `SettingsSidebar.tsx` | Settings navigation sidebar |
| `operating-hours.tsx` | Operating hours configuration UI |

### Other feature components

| Directory | Components |
|-----------|------------|
| `activities/` | `ActivitiesDataTable.tsx`, `columns.tsx` — paginated activity log table |
| `dashboard/bots/` | `create-bot-dialog.tsx`, `data.ts` — bot creation dialog |
| `dashboard/contacts/` | `contacts-list.tsx`, `edit-contact-dialog.tsx`, `data.ts` — contacts CRUD |
| `dashboard/kb/` | `add-content-dialog.tsx`, `data.ts` — KB source management |
| `dashboard/shared/` | `VisitorPanel.tsx` — visitor info side panel |
| `feedback/` | Feedback submission form |
| `landing/` | Landing page marketing components |
| `pricing/` | Pricing page components |
| `ui/` | Shadcn UI components (button, card, dialog, etc.) |

---

## 5. Feature Inventory

| Feature Area | Status | What Exists | Missing / Gaps |
|---|---|---|---|
| **Auth & Multi-tenancy** | BUILT | Clerk integration, org-based projects, `requireAdmin` guard, profile sync | Some queries lack org check (see §6) |
| **Projects** | BUILT | CRUD, ensure default, widget config, locale, cascade delete | — |
| **Conversations** | BUILT | Create from widget, list/filter/paginate, assign/unassign, resolve, auto-close cron, attributes, tags, rating | Pagination uses `.take(500)` not true pagination in many analytics queries |
| **Messages** | BUILT | Send (agent + widget), list, file attachments (fileId/fileName), read markers | — |
| **Bot Engine** | BUILT | 20 node types executed, conversation state machine, bot pause/resume, AI Task/Assistant/KB nodes, user reply capture, multi-turn | Code action node uses `eval()` — security concern |
| **Bot Flow Editor (Design Studio)** | BUILT | React Flow canvas, 20 custom nodes, save/load, AI flow generation from prompt, flow compiler (nodes→executionNodes) | — |
| **Knowledge Base** | BUILT | CRUD for KBs and sources, text/URL/file source indexing, vector search with cosine similarity, embedding via OpenRouter | PDF parsing not supported (reads raw text only) |
| **Routing Engine** | BUILT | Smart assignment (bot→agent→pooled), least-busy agent, department routing (direct + pooled modes), retry cron | — |
| **Analytics** | BUILT | Conversation volume, token usage, CSAT summary, unanswered queries, tags chart, SLA breach rate, usage quotas, dashboard home stats | All analytics use `.take(500)` — will lose data at scale |
| **Contacts** | BUILT | CRUD, batch import (dedup by email), link to conversation, deletion guard | — |
| **Orders** | BUILT | CRUD, batch import, status management | — |
| **Departments** | BUILT | CRUD, member management, routing mode config, default department protection | — |
| **Labels / Tags** | BUILT | CRUD for labels, cascade delete from conversations, AI-powered tag extraction, manual assign/remove | Duplicate `listLabels` in `labels.ts` and `settings.ts` |
| **Canned Responses** | BUILT | CRUD | — |
| **Operating Hours** | BUILT | Config CRUD, real evaluation in bot engine | — |
| **Notifications** | BUILT | Create/list/read/clear, auto-trim to 50/user, 7-day cleanup cron | No push notifications or email |
| **Webhooks (Outbound)** | BUILT | Subscription CRUD, HMAC-signed delivery, event filtering | No retry on failure, no delivery log |
| **Integrations** | BUILT | Telegram (webhook registration + message handling), WhatsApp (webhook verification + message handling) | Messenger/Instagram: schema + credential handling exists, but no HTTP endpoint for incoming messages |
| **OpenRouter API Key** | BUILT | Save/clear/test encrypted API key per project, model selection | — |
| **AI Flow Builder** | BUILT | Natural language → React Flow graph via LLM | — |
| **Widget** | BUILT | Standalone page, HTTP API, config endpoint, CSAT, file upload | — |
| **Activity Logs** | BUILT | Paginated log, rich audit trail across all admin actions | — |
| **Feedback** | BUILT | Bug/feature/general submission | No admin view to read submitted feedback |
| **i18n** | BUILT | Locale routing (en/ar/fr), RTL support, language switcher | — |
| **Landing / Marketing** | BUILT | Landing page, pricing page, product/solution pages | — |
| **Presence** | BUILT | Agent heartbeat, availability toggle, stale cleanup cron, online teammates count | — |

---

## 6. Architecture Health Audit

### 🔴 Multi-tenancy Leaks

| File | Function | Issue |
|------|----------|-------|
| `profiles.ts` | `getByUserId` | **No auth or org check** — anyone can query any profile by userId |
| `analytics.ts` | `getConversationStats`, `getVisitorStats`, `getMessageStats`, `getConversationVolume`, `getTokenUsage`, `getCSATSummary`, `getTagsSummary`, `getSLABreachRate`, `getProjectUsage` | Check `identity` exists but **never verify the projectId belongs to the user's org** |
| `knowledgeBases.ts` | `get` | **No org check** — returns any KB if you know the ID |
| `knowledgeBases.ts` | `addSource`, `removeSource`, `create` | **No org check** — any authenticated user can add sources to any KB |
| `bots.ts` | `get` | **No org check** — returns any bot by ID |
| `contacts.ts` | `update`, `findByConversation` | **No org check** — any authenticated user can update any contact |
| `botFlows.ts` | `save` | Auth check commented out (`// if (!identity)`) — **no auth at all** |
| `tags.ts` | `assignTagToConversation`, `removeTagFromConversation` | **No org check** — any authenticated user can tag any conversation |
| `conversations.ts` | `createFromWidget`, `rateConversation` | **By design no auth** (widget), but `createFromWidget` accepts raw `projectId` from client — no rate limiting |
| `messages.ts` | `sendFromWidget` | **By design no auth** (widget), but no rate limiting |

### 🟡 Frontend-Passed orgId (should come from identity)

| File | Function | Issue |
|------|----------|-------|
| `projects.ts` | `getByOrgId` | Takes `orgId` as arg but also checks `identity.org_id` — correct but redundant |
| `profiles.ts` | `setAvailability` | Reads `(identity as any).org_id` from token — correct |

### 🔴 Unbounded `.collect()` Calls

| File | Function | Line | Risk |
|------|----------|------|------|
| `projects.ts` | `list` | L36 | `.collect()` on all projects for an org — low risk (few projects/org) |
| `projects.ts` | `remove` | L220–271 | **Multiple `.collect()` calls** on bots, bot_flows, KB sources, messages, conversations, contacts, integrations, activity_logs, departments, canned_responses, labels, operating_hours, project_usage, unanswered_queries, webhooks — **will timeout on large projects** |
| `knowledgeBases.ts` | `remove` | L155 | `.collect()` on KB sources — moderate risk |
| `webhooks.ts` | `backfillWebhookSecrets` | L180 | `.collect()` on all webhook_subscriptions globally — one-time migration |
| `diagnostic.ts` | `getBotFlow` | L33 | `.collect()` on all bot_flows globally — diagnostic only |
| `migrations.ts` | `migrateStatuses` | L6 | `.collect()` on all conversations globally — one-time migration |

### 🟡 Bounded `.take()` Caps That May Lose Data

Nearly all analytics queries use `.take(500)` as a hard cap. At scale, this means analytics will silently undercount. Marked with `TODO: replace with paginated aggregation` comments throughout.

| Affected queries (all in `analytics.ts`) |
|------------------------------------------|
| `getConversationStats`, `getVisitorStats`, `getMessageStats`, `getConversationVolume`, `getTokenUsage`, `getCSATSummary`, `getTagsSummary`, `getSLABreachRate` |

### 🟡 Other Observations

| Issue | Location | Detail |
|-------|----------|--------|
| `eval()` in bot engine | `bot.ts` (code_action handler) | Uses `new Function(...)` to evaluate user-provided expressions — **security risk** |
| Duplicate function | `labels.ts` vs `settings.ts` | `listLabels` exists in both files with identical logic |
| No rate limiting | Widget HTTP endpoints | `createFromWidget`, `sendFromWidget`, widget HTTP routes have no rate limiting |
| Cascade delete performance | `projects.remove` | Deletes from 15+ tables sequentially with `.collect()` — will timeout on data-heavy projects |
