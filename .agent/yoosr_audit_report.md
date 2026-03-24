# Yoosr Codebase Audit — Content Inventory for Landing Page Copy

> **Type:** Read-only audit · No code changes made  
> **Purpose:** Verified content inventory so every landing-page claim is backed by confirmed code

---

## 1. Live Monitor

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [monitor-layout.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/monitor-layout.tsx), [conversation-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/conversation-list.tsx), [chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx), [VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)

- Real-time conversation list via Convex reactive queries
- Filters: label, status (all/open/served/unserved/resolved), agent/bot, department
- Sort: timestamp, priority, SLA deadline
- Search by visitor name or message content
- Served/unserved indicators (dot badge)
- Priority badges (urgent/high/medium/low)
- SLA countdown display
- Channel icons (widget, telegram, messenger, instagram)
- Public/internal message toggle (yellow bubble for notes)
- Actions: resolve, reopen, mark pending, join, leave
- Transfer to agent dialog (with search)
- Transfer to department dialog (with search)
- 3-dot menu: assign to me, transfer agent, transfer dept, resolve
- Canned response picker (triggered by `/` in input)
- Template variables: `{{visitor_name}}`, `{{agent_name}}`, `{{project_name}}`, `{{user_email}}`, `{{ticket_id}}`
- Contact/visitor info side panel
- Manual label assignment
- Image message rendering with click-to-expand

---

## 2. Chat Section

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [ChatShell.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/dashboard/chat/ChatShell.tsx), [ConversationList.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ConversationList.tsx), [ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)

- Separate interface from Monitor (different route, different filtering logic)
- Shows **only conversations assigned to the current agent** (filter: `assignedTo === user.id`)
- All/Unread tabs with unread count badge
- Search by visitor name or last message
- Resizable 3-panel layout: ConversationList, ChatArea, VisitorPanel
- Same chat capabilities as Monitor: send, resolve, internal notes, transfer agent/dept, canned responses, file attachments, image rendering
- Channel relay: Telegram and Meta (Messenger/Instagram) outbound message relay

---

## 3. Bot / Design Studio

| Status | ✅ DONE (Engine) · 🟡 PARTIAL (UI — functional but not deeply audited) |
|---|---|

**Confirmed in:** [bot.ts](file:///home/mohamed/lab/yoosr/convex/bot.ts), [BotEditorClient.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/design-studio/%5BbotId%5D/BotEditorClient.tsx)

### Block Types (18 confirmed in engine)

| Block | Engine | UI Node |
|---|---|---|
| Reply | ✅ | ✅ |
| Set Attribute | ✅ | ✅ |
| Capture User Reply | ✅ | ✅ |
| Condition / Branch | ✅ | ✅ |
| Ask Knowledge Base | ✅ | ✅ |
| Web Request | ✅ | ✅ |
| Replace Bot | ✅ | ✅ |
| HITL Handoff | ✅ | ✅ |
| AI Task (OpenRouter) | ✅ | ✅ |
| Clear Transcript | ✅ | ✅ |
| Wait | ✅ | ✅ |
| Apply Label | ✅ | — |
| If Operating Hours | ✅ | ✅ |
| If Online Agent | ✅ | ✅ |
| Change Department | ✅ | ✅ |
| Code Action | ✅ | ✅ |
| Set Priority | ✅ | — |
| Resolve Conversation | ✅ | — |

### Visual Editor
- ReactFlow-based canvas with drag-and-drop nodes + edges
- Auto-save with 1.5s debounce + manual save
- AI Prompt Bar: generate entire bot flows from natural language (sanitizes AI-generated nodes to valid types)
- Debugger Panel: step-through with active node highlighting
- Node type normalization (maps common AI mistakes like "greeting" → "reply", "escalate" → "hitlHandoff")

---

## 4. Knowledge Base

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [knowledge.ts](file:///home/mohamed/lab/yoosr/convex/knowledge.ts), [schema.ts](file:///home/mohamed/lab/yoosr/convex/schema.ts)

- Tables: `knowledge_bases`, `knowledge_base_sources`, `knowledge_base_chunks`
- Vector index: `by_embedding` on chunks (2048 dimensions)
- Source types: **text**, **URL** (fetches + strips HTML), **file** (PDF via `unpdf`, or plain text)
- Chunking: sentence-boundary-aware splitting (500 chars, min 30 char filter)
- Embedding: OpenRouter API (`nvidia/llama-nemotron-embed-vl-1b-v2:free`), batch of 20
- Search: `searchSimilarChunks` — vector search with `MIN_RELEVANCE_SCORE = 0.25` threshold
- Unanswered query logging: if no relevant chunks found, auto-logs to `unanswered_queries`
- File size limit: 15 MB, chunk limit: 200 per source

---

## 5. Widget

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [WidgetChat.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/components/WidgetChat.tsx), [http.ts](file:///home/mohamed/lab/yoosr/convex/http.ts)

- Embeddable chat widget (iframe-based)
- Pre-chat form with configurable contact method (email or phone)
- Visitor identity via `localStorage` (`yoosr_visitor_id`)
- Polling for messages (2s interval) and conversation status (3s interval)
- Configurable: primary color, title, logo, online status text, welcome notification delay
- Welcome message with configurable delay
- File upload: client-side validation (JPG/PNG/GIF/WEBP, max 5 MB), upload to Convex storage
- Image message rendering with click-to-expand
- Bot button rendering (interactive quick replies)
- CSAT rating submission after conversation resolution
- Notification sound on new agent/bot messages
- `postMessage` to parent window for unread badge
- Rate limiting: 5 conversations/min, 20 messages/min per visitor

---

## 6. Channels / Integrations

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [http.ts](file:///home/mohamed/lab/yoosr/convex/http.ts), [integrations.ts](file:///home/mohamed/lab/yoosr/convex/integrations.ts), [conversations.ts](file:///home/mohamed/lab/yoosr/convex/conversations.ts), [ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)

| Channel | Inbound Webhook | Outbound Relay | UI Setup | Status |
|---|---|---|---|---|
| **Web Widget** | ✅ HTTP endpoints | N/A (direct) | ✅ `widgetConfig` | ✅ DONE |
| **Telegram** | ✅ `POST /webhooks/telegram` (secret token validation) | ✅ `relayToTelegram` | ✅ `registerTelegramWebhook` action | ✅ DONE |
| **Messenger** | ✅ `POST /webhooks/meta` (HMAC SHA-256 validation) | ✅ `relayToMeta` | ✅ Encrypted credentials | ✅ DONE |
| **Instagram** | ✅ Same Meta webhook | ✅ `relayToMeta` | ✅ Encrypted credentials | ✅ DONE |
| **WhatsApp** | ✅ Same Meta webhook (phone_number_id lookup) | ✅ relayToMeta wired | ✅ Encrypted credentials | ✅ DONE |

- All integrations use AES-GCM encrypted credentials via `crypto.ts`
- CRUD operations for integration records with admin-only access

---

## 7. Analytics

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [analytics.ts](file:///home/mohamed/lab/yoosr/convex/analytics.ts)

| Metric | Query | Date-Range Filtered |
|---|---|---|
| Conversation Volume (bot vs agent) | `getConversationVolume` | ✅ daily buckets |
| Token Usage (by model) | `getTokenUsage` | ✅ |
| Unanswered Queries (top by count) | `getUnansweredQueries` | ✅ |
| CSAT Summary (avg, distribution 1-5) | `getCSATSummary` | ✅ |
| CSAT Comments | `getCSATComments` | ✅ |
| SLA Breach Rate | `getSLABreachRate` | ✅ |
| Tags Summary (semantic auto-tags) | `getTagsSummary` | ✅ |
| Project Usage (tokens + conversations) | `getProjectUsage` / `getProjectUsageSummary` | ✅ billing cycle |
| Conversation Stats (open/closed) | `getConversationStats` | ✅ |
| Visitor Stats (unique visitors) | `getVisitorStats` | ✅ |
| Message Stats (visitor/agent split) | `getMessageStats` | ✅ |

- Internal mutations: `logTokenUsage`, `logUnansweredQuery`, `logConversationEvent`, `submitCSATInternal`
- Public mutation: `submitCSAT` (no auth — for widget)
- Dismiss unanswered query mutation (with multi-tenancy check)

---

## 8. Settings

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [settings.ts](file:///home/mohamed/lab/yoosr/convex/settings.ts)

| Setting | CRUD | Activity Logging |
|---|---|---|
| Departments | ✅ list, create, update, remove, addMember, removeMember | ✅ |
| Canned Responses | ✅ list, create, update, remove | ✅ |
| Labels | ✅ list, create, update, remove (with cascade delete from conversations) | ✅ |
| Operating Hours | ✅ get, upsert (timezone + weekly schedule) | ✅ |

- All mutations require admin role via `requireAdmin()`
- Department features: `isDefault` flag, `routingMode` (pooled/assigned), per-department `botId`, `memberIds`, `tags`

---

## 9. Routing Engine

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [routing.ts](file:///home/mohamed/lab/yoosr/convex/routing.ts)

- 3-tier assignment priority:
  1. **Bot** (department bot override → project active bot)
  2. **Agent** (least-busy algorithm based on active conversation count)
  3. **Unassigned pool** (status 100)
- Department routing modes: `pooled` (skip auto-assignment) vs assigned
- Agent availability: `profiles.isAvailable` flag
- Retry logic: `retryRoutingForAgent` (triggered when agent comes online), `retryUnassignedConversations` (cron-style, 5-min threshold)
- Notification: unassigned conversations notify all org agents

---

## 10. Auth & Onboarding

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [OnboardingClient.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/onboarding/OnboardingClient.tsx), [http.ts](file:///home/mohamed/lab/yoosr/convex/http.ts)

- Clerk Organizations = tenant boundary (`orgId → projects`)
- Clerk webhook: `user.created`, `user.updated` → upsert profile; `organization.deleted` → delete project + data
- Onboarding: auto-creates project from org name if none exists, redirects to dashboard
- No Next.js middleware file found — route protection likely handled by Clerk's `<ClerkProvider>` and `useUser()` guards

---

## 11. Landing Page

| Status | ✅ DONE |
|---|---|

**Confirmed in:** [(marketing)/page.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/%28marketing%29/page.tsx)

| Section | Component | Content Source |
|---|---|---|
| Hero | `Hero.tsx` | i18n + hardcoded dashboard mockup |
| Features Grid | `FeaturesGrid.tsx` | i18n `landing.features.items` |
| Design Studio | `DesignStudioSection.tsx` | i18n |
| How It Works | `HowItWorks.tsx` | i18n |
| Channels | `ChannelsSection.tsx` | 4 channels: 🌐 Web, ✈️ Telegram, 📘 Messenger, 📸 Instagram |
| Analytics | `AnalyticsSection.tsx` | i18n |
| Orders | `OrdersSection.tsx` | i18n |
| Testimonials | `Testimonials.tsx` | i18n |
| Pricing | `PricingTable` | **Blurred + "Early Access — Plans Coming Soon" overlay** |
| CTA | `CtaSection.tsx` | i18n |

| Order Tracking | ✅ DONE |
|---|---|

**Confirmed in:** [orders.ts](file:///home/mohamed/lab/yoosr/convex/orders.ts), [orders/page.tsx](file:///home/mohamed/lab/yoosr/src/app/%5Blocale%5D/dashboard/orders/page.tsx), [VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)

- Full CRUD: Create, List, Update Status, Delete
- **Order Management Dashboard:** Dedicated page with 4 status filters (All, New, Confirmed, Cancelled).
- **Import/Export Engine:** Supports CSV, Excel (XLSX), and JSON.
- **Bulk Import Logic:** Chunked batch processing (500 items/chunk) with row skip reporting.
- **Chat Integration:** Dedicated "Orders" section in the Visitor side panel.
- **Real-time Capture:** Agents can create a new order directly from the chat window; pre-fills visitor name/phone.
- **Contextual Linking:** Orders are optionally linked to a specific `conversationId`.

---

## Convex Schema — Complete Table Inventory (26 tables)

| Table | Purpose |
|---|---|
| `profiles` | Clerk user profile sync |
| `projects` | Workspace config (one per org) |
| `conversations` | Chat threads |
| `conversation_bot_state` | Bot engine per-conversation state |
| `messages` | Chat messages |
| `bots` | Bot definitions |
| `bot_flows` | Bot visual flow data (nodes/edges) |
| `activity_logs` | Audit trail |
| `integrations` | Channel credentials |
| `departments` | Team departments |
| `canned_responses` | Quick reply templates |
| `labels` | Conversation labels/tags |
| `operating_hours` | Business hours config |
| `knowledge_bases` | KB containers |
| `knowledge_base_sources` | KB source records |
| `knowledge_base_chunks` | Vectorized text chunks |
| `contacts` | Visitor contact records |
| `conversation_events` | Analytics: open/close events |
| `csat_ratings` | Customer satisfaction ratings |
| `token_usage` | LLM token consumption |
| `unanswered_queries` | Queries with no KB match |
| `project_usage` | Billing-cycle usage quotas |
| `webhook_subscriptions` | Outbound webhook subscriptions |
| `webhook_deliveries` | Delivery logs |
| `notifications` | In-app notifications |
| `orders` | Order tracking |
| `feedback` | General feedback |
| `push_subscriptions` | Browser push notification subscriptions |

---

## HTTP Endpoints (Convex HTTP Router)

| Path | Methods | Purpose |
|---|---|---|
| `/clerk-webhook` | POST | Clerk user/org sync |
| `/widget/conversations` | GET, POST, OPTIONS | Create/find widget conversations |
| `/widget/conversations/get` | GET, OPTIONS | Get conversation status |
| `/widget/conversations/rate` | POST, OPTIONS | CSAT rating submission |
| `/widget/messages` | GET, POST, OPTIONS | Read/send widget messages |
| `/widget/project` | GET, OPTIONS | Fetch project config |
| `/widget/upload-url` | POST, OPTIONS | Generate file upload URL |
| `/webhooks/meta` | GET, POST | Meta Messenger/Instagram/WhatsApp |
| `/webhooks/telegram` | GET, POST | Telegram bot webhook |

---

## Content Inventory — Claimable Features

### ✅ Safe to claim on landing page

| Feature | Evidence |
|---|---|
| Real-time live conversation monitor | `conversations.list`, reactive Convex queries |
| Advanced filtering (label, department, agent, status, priority) | `conversation-list.tsx` filter state |
| SLA tracking with countdown | `slaDeadline`, `firstResponseAt` fields, `getSLABreachRate` |
| AI chatbot with 18+ automation blocks | `bot.ts` executeAction switch |
| Visual drag-and-drop bot builder | ReactFlow `FlowEditor` component |
| AI-powered bot flow generation | `AIPromptBar` component |
| Bot debugger with step-through | `DebuggerPanel` component |
| Knowledge base with semantic search | Vector index, OpenRouter embeddings |
| Multi-source KB (text, URL, PDF, files) | `indexSource` handler in `knowledge.ts` |
| Unanswered query detection | `searchSimilarChunks` → `logUnansweredQuery` |
| Order capturing & management | `orders.ts` mutations, `dashboard/orders/page.tsx` |
| Import/Export (CSV/Excel/JSON) | `xlsx` and `papaparse` integration in Orders page |
| Chat-linked orders | `VisitorPanel.tsx` order form + `conversationId` FK |
| 4 live channels (Web, Telegram, Messenger, Instagram) | Webhook handlers + relay mutations |
| Internal notes / private team comments | `type: "internal"` messages, yellow bubble UI |
| Canned responses with template variables | `CannedResponsePicker`, 6 template vars |
| Agent-to-agent transfer | `updateConversation({ assignedTo })` |
| Department transfer | `transferToDepartment` mutation |
| Smart routing (bot → least-busy agent → pool) | `routing.ts` 3-tier algorithm |
| Department routing modes (pooled vs assigned) | `routingMode` field check |
| CSAT collection (1-5 stars + comments) | `submitCSAT`, `RatingComponent` |
| Analytics dashboard (11 metrics) | `analytics.ts` queries/actions |
| Operating hours configuration | `operating_hours` table + upsert |
| Role-based access (admin-only mutations) | `requireAdmin()` guard |
| Multi-tenant via Clerk Organizations | `orgId` isolation throughout |
| Embeddable chat widget | iframe + HTTP API |
| Pre-chat form | `PreChatForm` component |
| File/image sharing | Convex storage upload + render |
| Activity audit log | `activity_logs` table, logged on every admin action |
| Webhook support | `webhook_subscriptions` + `webhook_deliveries` tables |
| Push notifications | `push_subscriptions` table + service worker |
| i18n / multilingual | `next-intl` with `useTranslations` throughout |
| Auto-project creation on signup | `OnboardingClient.tsx` |

### 🟡 Claim with caveat

| Feature | Caveat |
|---|---|
| WhatsApp channel | Full support for inbound and outbound. Fully wired into Chat UI and Bot Engine. |
| Pricing plans | PricingTable is blurred with "Coming Soon" overlay — do not claim active plans |

### ❌ Do NOT claim

| Feature | Reason |
|---|---|
| Standalone multi-turn AI Assistant | Standalone block removed from UI; multi-turn AI only via "Ask Knowledge Base" |
| Email channel | No email integration found in code |
| SMS channel | No SMS integration found in code |
| Payment processing | No payment/billing logic found |
| Video/voice calls | No WebRTC or voice integration |
| Mobile app | No native mobile app code found |
