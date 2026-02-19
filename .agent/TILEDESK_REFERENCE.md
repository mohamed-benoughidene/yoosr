# Tiledesk → Next.js / Convex / Clerk Rebuild Reference
> Complete technical reference for AI coding agents. This document consolidates architecture, schemas, APIs, routing logic, auth flows, and design patterns from the Tiledesk codebase.

---

## Table of Contents
1. [Overall Architecture](#1-overall-architecture)
2. [Live Chat Widget](#2-live-chat-widget)
3. [Agent & Bot Routing](#3-agent--bot-routing)
4. [Dashboard & Ticketing](#4-dashboard--ticketing)
5. [REST API & Webhooks](#5-rest-api--webhooks)
6. [Database Schemas & Data Models](#6-database-schemas--data-models)
7. [Authentication & Identity](#7-authentication--identity)
8. [File & Attachment Handling](#8-file--attachment-handling)
9. [Design Studio Execution Engine](#9-design-studio-execution-engine)
10. [Patterns to Adapt for Next.js / Convex / Clerk](#10-patterns-to-adapt-for-nextjs--convex--clerk)

---

## 1. Overall Architecture

### Core Infrastructure Stack

| Layer | Technology | Function |
|---|---|---|
| Backend Engine | Node.js / Express | Core API logic, non-blocking I/O for high concurrency |
| Data Persistence | MongoDB | Primary NoSQL document store for messages and metadata |
| Real-time Engine | Redis | Session sync, distributed caching, rapid state retrieval |
| Message Broker | MQTT / RabbitMQ | Real-time messaging backbone + async reliable delivery |
| NLU Core | Python (LSTM/BERT) | Intent classification via `nlu.json` config |
| Vector Store | Qdrant | Semantic search and RAG retrieval |
| Inference Layer | vLLM / Ollama | Local open-source LLM execution (Llama, Mistral) |
| Integration Std. | Model Context Protocol (MCP) | Connects AI agents to external tools (Sheets, Calendar, etc.) |
| Frontend | Angular / Ionic | Admin dashboard and mobile interface |

### System Data Flow (Message Lifecycle)

```
1. Ingress     → User sends message via Widget / WhatsApp / Telegram
2. Brokerage   → Message published to MQTT/RabbitMQ broker
3. Processing  → tiledesk-server consumes message, authenticates project sandbox
4. AI Reasoning → Queries Knowledge Base (RAG) or executes Design Studio flow
5. Routing     → Rules Engine assigns conversation to agent/bot based on dept + load
6. Egress      → Response delivered back through broker to originating channel
```

### Multi-Tenant Sandbox Model

Every Tiledesk "Project" is a fully isolated sandbox. All resources are partitioned per project:
- Knowledge Bases (RAG)
- Routing rules and departments
- Teammates and roles
- Conversation history and message data

A single server instance can host hundreds of independent projects. Every DB document is bound to a `project_id`. This is the core isolation mechanism — replicate this with Convex's query filtering on `orgId` from Clerk.

---

## 2. Live Chat Widget

### Communication Protocol

- **Primary**: WebSockets via MQTT — persistent, sub-second latency connections
- **Fallback**: REST API for message history and initial state fetching

### Embedding

Embedded via a JavaScript snippet (`launch.js`) or native plugins (WordPress, Shopify). Exposes a `window.tiledesk` object for programmatic control.

### Key Events

| Event | Description |
|---|---|
| `message.create` | Fired when a new message is sent |
| `conversation.started` | Fired when a new conversation is initiated |
| `agent.typing` | Fired when an agent is typing |

### State Management

**Local state (widget):**
- Active `conversation_id`
- User session token (JWT)
- Widget visibility (minimized/maximized)
- Local message echo for perceived performance

**Server-side state:**
- User identity (Leads/Contacts)
- Conversation transcripts
- Agent typing status

### Advanced Features

- **Pre-chat form**: Collects user data (name, email) before conversation begins
- **Proactive Rules**: Triggers widget based on behavior (e.g., time on page, URL)
- **Multichannel**: Same widget logic renders on Web, WhatsApp, Telegram via adapter layer

---

## 3. Agent & Bot Routing

### Assignment Algorithms

The routing engine uses a graph-based Design Studio flow, not hardcoded rules. Options:

| Algorithm | Description |
|---|---|
| Round-robin | Fixed repeating sequence — equal spread of work |
| Least-busy | Routes to agent with fewest active conversations |
| Priority-based | Routes based on predefined agent priority or department rules |

### Load Calculation

**"Load"** = number of active concurrent conversations assigned to an agent vs their configured maximum capacity.

- `Available`: Agent is online, MQTT engine authorized to send new conversations
- `Busy`: Agent has hit their max concurrent conversation limit, paused from new assignments
- `Offline`: Agent disconnected, triggers AI failover sequence

### Routing Flow (Step by Step)

```
1. User message arrives → MQTT broker receives event
2. Automation Engine identifies active project sandbox
3. NLU core classifies intent via nlu.json
4. Department-based routing: find matching dept (Sales, Support, etc.)
5. Check agent availability in dept pool
6. If agents available → apply Round-robin / Least-busy / Priority algorithm
7. If all agents busy → queue in dept waitlist
8. If all agents offline → trigger AI failover (see below)
9. Assign conversation, set status to 200 (Assigned)
```

### AI Failover Sequence (No Agents Available)

```
1. AI Agent activates as first-line responder (captures via MQTT)
2. Agentic RAG: queries Chain of Knowledge (priority docs → FAQs → web crawl)
3. Hybrid Search: Full-text (exact) + Semantic vector (intent) via Qdrant
4. If AI resolves → reply and stay in bot mode
5. If AI cannot resolve → queue in dept pool OR convert to email ticket
6. Fire push notification + email alerts to agents via Notification API
7. Agents can respond via mobile app without being at desktop
```

### Bot Logic: Design Studio

Bots are graph-based flows compiled from the visual Design Studio into a JSON state machine.

**Block Types:**

| Block | Function |
|---|---|
| Reply | Send text, images, buttons, carousels |
| Set Attribute | Write to `context.attributes` object |
| Web Request | Call external HTTP API (GET/POST) |
| ChatGPT Task | LLM prompt chain, Named Entity Recognition |
| Ask Knowledge Base | Invoke Hybrid Search RAG engine |
| Replace Bot | Switch to a different specialized AI agent mid-conversation |

**Variable syntax**: `{{attribute_name}}` — e.g., `{{user_email}}`, `{{lead_score}}`

### HITL (Human-in-the-Loop) Handoff

When bot cannot resolve:
1. Bot triggers `request_human` intent or "Else" branch fires
2. Conversation status transitions from bot-assigned → `100` (Unassigned/Pooled)
3. Full conversation history is preserved for the human agent
4. Agent picks up with complete context visible in dashboard

---

## 4. Dashboard & Ticketing

### Conversation Lifecycle (Status Transitions)

```
New (100) → In Progress / Assigned (200) → Closed (1000) → Archived
```

| Status Code | Label | Trigger |
|---|---|---|
| `100` | Unassigned/Pooled | New conversation, Smart Assignment engine activates |
| `200` | Assigned to Agent | Human or specialized bot takes ownership |
| `1000` | Closed/Archived | Conversation finalized, webhooks fire for CRM sync |

### Real-Time Dashboard

- Uses Agent Chat SDK with persistent WebSocket/MQTT connection
- Activities Log updates in real-time — no page refresh needed
- Agents see incoming messages and status changes instantly

### Post-Close Automation

When status → `1000`:
- `request.close` webhook fires
- Transcript sent to external CRMs (HubSpot, Salesforce) via RestHook
- Self-Learning loop: human-to-human transcripts extracted, sanitized, and fed into Knowledge Base RAG

---

## 5. REST API & Webhooks

### Base Configuration

```
Base URL: https://api.tiledesk.com/v3/
Headers:  Content-Type: application/json
Auth:     Authorization: [JWT or API_KEY]
```

Every endpoint path includes `/:project_id/` for multi-tenant isolation.

---

### Create Conversation

```
POST /:project_id/requests
```

**Request Body:**
```json
{
  "text": "I am interested in your enterprise AI solutions.",
  "attributes": {
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+15551234567",
    "company": "Vertex Corp",
    "user_language": "en"
  }
}
```

**Response (201):**
```json
{
  "request_id": "req_88224411",
  "project_id": "pid_554433",
  "status": "new",
  "created_at": "2025-05-20T14:30:00Z"
}
```

---

### Send Message

```
POST /:project_id/requests/:request_id/messages
```

**Request Body (text + carousel):**
```json
{
  "text": "Please select a solution below:",
  "type": "text",
  "attributes": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "carousel",
        "elements": [
          {
            "preview": { "src": "https://example.com/image.png" },
            "title": "Agentic Pro",
            "description": "Full autonomous workflow support",
            "buttons": [
              {
                "type": "url",
                "value": "Buy Now",
                "link": "https://example.com/checkout/pro"
              }
            ]
          }
        ]
      }
    }
  }
}
```

**Response (201):**
```json
{
  "message_id": "msg_998877",
  "senderFullname": "AI Assistant",
  "type": "text",
  "status": "delivered",
  "timestamp": "2025-05-20T14:31:00Z"
}
```

---

### Close Conversation

```
PUT /:project_id/requests/:request_id/close
```

**Request Body (optional):**
```json
{
  "tags": ["feature_request", "resolved_by_human"],
  "closing_reason": "issue_resolved"
}
```

---

### Create Webhook Subscription (RestHook)

```
POST /:project_id/subscriptions
```

**Request Body:**
```json
{
  "target": "https://your-server.com/webhooks/tiledesk",
  "event": "request.close"
}
```

**Available Events:**

| Event | Trigger |
|---|---|
| `message.create` | Any new message sent |
| `request.create` | New conversation started |
| `request.close` | Conversation closed |
| `lead.create` | New lead identified |

**RestHook Lifecycle:**
```
1. Trigger     → Internal state change occurs
2. Dispatch    → Tiledesk finds active subscriptions, POSTs JSON to target URL
3. Processing  → External server parses payload
4. Acknowledge → External server must return HTTP 200 OK (or Tiledesk retries)
```

---

### Other API Groups

| Group | Function |
|---|---|
| `/projects` | Manage multi-tenant sandboxes and settings |
| `/leads` | CRUD for end-user identities and CRM data |
| `/messages` | Send/receive messages programmatically |
| `/knowledge-bases` | Upload content (URLs, PDFs), query RAG |
| `/chatbots` | Manage bot configs and triggers |
| `/files` | Upload and retrieve file attachments |

---

## 6. Database Schemas & Data Models

### Message Object

| Field | Type | Description | Values |
|---|---|---|---|
| `_id` | ObjectId | Unique MongoDB identifier | System-generated |
| `text` | String | Primary message content | Supports Markdown |
| `sender` | String | ID of sending entity | Agent ID / Bot ID / Lead ID |
| `senderFullname` | String | Display name for UI | e.g., "AI Sales Assistant" |
| `recipient` | String | Conversation or user ID | Maps to `request_id` |
| `status` | Number | Delivery state enum | `0`, `100`, `200` |
| `attributes` | Object | Flexible JSON for rich UI | Buttons, carousels, custom keys |
| `channel` | String | Originating platform | `chat21`, `whatsapp`, `telegram`, `facebook` |
| `type` | String | Content category | `text`, `image`, `file`, `button` |
| `createdAt` | Date | UTC timestamp | System-generated |

**Message Status Enums:**
- `0` → Sent (recorded in DB)
- `100` → Delivered (handed to MQTT or channel provider)
- `200` → Seen (recipient acknowledged, read receipt shown)

---

### Conversation (Request) Object

| Field | Type | Description | Values |
|---|---|---|---|
| `request_id` | String | Unique conversation ID | e.g., `support-req-123` |
| `project_id` | String | Multi-tenant sandbox ID | Required for all queries |
| `status` | Number | Lifecycle state | `100`, `200`, `1000` |
| `lead` | ObjectId | Reference to Lead object | Foreign key |
| `deptId` | ObjectId | Department for routing | Maps to dept in project |
| `participants` | Array | Agent/Bot IDs in conversation | Array of strings |
| `first_text` | String | Opening message (preview/intent) | Captured on create |
| `tags` | Array | Labels for analytics | Array of strings |
| `rating` | Number | Post-conversation CSAT score | `1`–`5` or `null` |

**Conversation Status Enums:**
- `100` → Unassigned/Pooled (triggers Smart Assignment engine)
- `200` → Assigned to Agent (human or bot owns it)
- `1000` → Closed/Archived (triggers transcript webhooks)

---

### Lead Object

| Field | Description |
|---|---|
| `user_id` | Unique identifier (from widget or channel proxy) |
| `email` | Lead's email address |
| `full_name` | Lead's display name |
| `phone` | Phone number |
| `company` | Company name |
| `attributes` | Custom fields (budget, lead_score, primary_need, etc.) |

---

### Entity Relationships

```
Project
  ├── has many Departments
  ├── has many Chatbots
  ├── has many Teammates (Agents)
  └── has many Conversations (Requests)
       ├── belongs to one Lead
       └── has many Messages
```

---

### The `attributes` Field (Extensibility Layer)

Both Message and Conversation objects have an `attributes` object used to store anything not in the fixed schema:

- Lead qualification data: `full_name`, `email`, `budget`, `lead_score`
- UI elements: button labels, carousel configs, link URLs
- External IDs: `shopify_order_id`, `hubspot_contact_id`
- Bot state: `last_intent`, `current_node`, `account_type`
- File references: `lastUserDocumentName`, `lastUserDocumentAsInlineURL`

---

## 7. Authentication & Identity

### User Types and How the System Discriminates

| Identity Type | Identified By | Authentication Method |
|---|---|---|
| Human Agent | RBAC roles + Dashboard SDK signature | JWT with `roles: ["admin" / "agent"]` |
| Lead (End-User) | `user_id` from Widget SDK or channel proxy (e.g., WhatsApp phone number) | JWT signed by developer's backend |
| Chatbot / AI Agent | Unique `assistant_id` + bot design logic | Internal system identity |

---

### Agent RBAC Roles

| Role | Permissions | Scope |
|---|---|---|
| Owner | Project-wide control, billing, teammate management | Global project settings |
| Admin | Configure chatbots, Knowledge Bases, routing | Operational logic |
| Agent | Interact with end-users, access history, HITL handoffs | Conversation-level only |

SSO supported for enterprise — single entry point for IT access management.

---

### JWT Structure (Lead / End-User Token)

Generated on the **developer's backend** using a shared secret key (never exposed client-side). Presented to Tiledesk server which validates the signature and spawns session context.

**Conceptual JWT Payload:**
```json
{
  "sub": "user_78910",
  "project_id": "sandbox_alpha_99",
  "roles": ["end_user"],
  "iat": 1715600000,
  "exp": 1715603600
}
```

**Key constraints:**
- Short-lived tokens (`exp` set to ~1 hour) to minimize interception risk
- Refresh mechanism runs silently to avoid re-authentication UX
- Must include `user_id` + `project_id` + `roles` for multi-tenancy enforcement

---

### Lead Identity Lifecycle

```
1. Visitor arrives → assigned temporary user_id or channel proxy (e.g., phone number)
2. Developer backend generates signed JWT → sent to Tiledesk
3. Tiledesk validates → matches to existing Lead in CRM if available
4. "Certified Lead" status unlocked → AI can access historical attributes
5. Automation Engine can now fire "Hot Lead" flows or RestHook events
```

**Why this matters for Clerk mapping:**
Clerk handles your agent/admin auth. For Leads (end-users in the widget), you generate a short-lived JWT yourself (Convex auth or custom) and pass it to your chat system — they are NOT Clerk users.

---

## 8. File & Attachment Handling

### Upload Flow

```
1. Client selects file in widget or via API
2. HTTP POST to /:project_id/files (multipart/form-data)
3. Express backend writes binary to public/uploads directory
4. Unique file ID + public URL generated
5. File metadata saved to MongoDB (ownership, MIME type, project_id)
6. Server returns HTTP 200 + file URL
7. Client embeds URL in Message object attributes
```

### Message Object with Attachment

```json
{
  "type": "file",
  "text": "Please find the requested document attached.",
  "attributes": {
    "lastUserDocumentName": "invoice_2024.pdf",
    "lastUserDocumentType": "application/pdf",
    "lastUserDocumentAsInlineURL": "https://api.tiledesk.com/v3/pub/uploads/file_id.pdf"
  },
  "project_id": "project_123"
}
```

**Supported types:** PDF, DOCX, CSV, images (PNG/JPG), URLs/Sitemaps for KB ingestion.

### Multichannel Rendering

- **Web Widget**: Renders as inline URL with thumbnail/download icon
- **WhatsApp Business**: Auto-converted to native WhatsApp media template format
- Same message object, adapter layer handles translation per channel

### Attachments in RAG/AI Workflows

- Files can be added to Knowledge Base via "Add to Knowledge Base" block
- Self-Learning loop: AI extracts solutions from closed human-to-human transcripts → auto-updates KB
- Re-ranking via cross-encoder ensures most relevant snippets are used, not just semantically similar ones

---

## 9. Design Studio Execution Engine

### How Graph Traversal Works

```
1. Trigger event arrives (e.g., new message from widget)
2. Automation Engine identifies active project sandbox
3. Locates "start" block of the conversation graph (JSON state machine)
4. NLU core (LSTM or BERT via nlu.json) classifies user intent
5. Intent maps to the correct outgoing connector from the current node
6. Next block executes (Reply / Set Attribute / Web Request / etc.)
7. Current node pointer updated in MongoDB document
8. Continues traversal until a terminal block (Reply to user, HITL handoff, Close)
```

### State Tracking ("Current Node")

The current node is stored as a pointer in the Conversation's MongoDB document. This is what gives the bot "memory" across multi-turn conversations and session gaps.

The MQTT Embedded Debugger taps the live message stream to show developers exactly which blocks are firing and how variables change — useful for debugging complex flows.

### Variable System

```
Storage:   context.attributes object (JSON)
Syntax:    {{attribute_name}}
Example:   {{user_email}}, {{lead_score}}, {{account_type}}
```

Variables captured in one block are available in all subsequent blocks. Example:
- Step 1: Web Request block fetches `account_type` from CRM → stores in `context.attributes`
- Step 5: Ask Knowledge Base block uses `{{account_type}}` to filter which KB to query

### Block Reference

| Block | What It Does |
|---|---|
| `Reply` | Send text, Markdown, buttons, carousels to user |
| `Set Attribute` | Write value to `context.attributes.key` |
| `Web Request` | HTTP GET/POST to external API, parse JSON response |
| `ChatGPT Task` | Run LLM prompt, extract Named Entities (email, name, etc.) |
| `Ask Knowledge Base` | Hybrid search (full-text + semantic) in Qdrant |
| `Replace Bot` | Hand conversation to a different specialized AI agent |
| `Department Chooser` | Route to a specific department pool |
| `HITL Handoff` | Escalate to human agent, preserve full context |
| `Code Action` | Execute custom JS/Node.js to manipulate `context.attributes` |

---

## 10. Patterns to Adapt for Next.js / Convex / Clerk

### Multi-Tenant Partitioning → Convex

Every Convex query and mutation must filter by `orgId` (from Clerk organization). This replicates Tiledesk's `project_id` sandbox isolation.

```typescript
// Every table needs orgId
const conversations = await ctx.db
  .query("conversations")
  .withIndex("by_org", (q) => q.eq("orgId", orgId))
  .collect();
```

### Real-Time Engine → Convex replaces 4 Tiledesk layers

| Tiledesk | Convex Equivalent |
|---|---|
| MongoDB | Convex database |
| Redis (session sync) | Convex reactive queries |
| MQTT/WebSockets | Convex `useQuery` real-time subscriptions |
| RabbitMQ (async) | Convex mutations + actions |

### Auth Mapping → Clerk

| Tiledesk Identity | Clerk Equivalent |
|---|---|
| Human Agents (Admin/Owner/Agent) | Clerk users with organization roles |
| RBAC (Owner / Admin / Agent) | Clerk `org:role` metadata |
| SSO | Clerk SSO (built-in) |
| Leads (end-users in widget) | NOT Clerk users — generate short-lived JWT via Convex action for widget auth |

### Conversation Status Machine → Convex

```typescript
// conversations table
{
  orgId: string,         // replaces project_id
  status: 100 | 200 | 1000,  // keep same enum values
  leadId: Id<"leads">,
  deptId: Id<"departments">,
  participants: string[],
  firstText: string,
  tags: string[],
  attributes: Record<string, any>,  // flexible metadata
}
```

### Agent Routing Logic → Convex Action

Implement as a Convex `action` that runs on `message.create`:
1. Check department's online agents
2. Apply least-busy or round-robin algorithm (query active conversation counts per agent)
3. If no agents → trigger AI bot flow
4. Update conversation `status` and `participants`

### Human-in-the-Loop (HITL) → Key Implementation Rule

When transitioning from bot to human, never lose message history. The `conversationId` stays the same — only `participants` array and `status` change. The human agent's dashboard query uses `useQuery` on that same conversation to get the full history in real-time.

### Chain of Knowledge (RAG Priority)

```
1. Query product-specific docs (highest priority)
2. If no high-confidence result → query general FAQs
3. If still no result → query web index or return "else" fallback
4. If confidence below threshold → trigger HITL handoff
```

### Webhook (RestHook) Equivalent → Convex Actions + HTTP Endpoints

Use Convex `httpAction` to expose webhook endpoints. Use Convex `action` to fire outbound webhooks to external services on status transitions. Fire on:
- `conversations.status === 1000` → send transcript to CRM
- `messages` insert → send to external logging/compliance system

### MCP Integration

Tiledesk uses MCP to make agents "doers" not just "knowers". Implement via tool-calling in your AI layer — pass tools like `update_google_sheet`, `book_calendar_event`, `create_hubspot_contact` and let the LLM decide when to call them based on conversation context.

### Bot Design Studio → Implement as JSON State Machine in Convex

Store each bot's flow as a JSON document in a `botFlows` table. The execution engine is a Convex action that:
1. Reads current node from conversation `attributes.currentNode`
2. Evaluates the node's condition or intent match
3. Executes the block (call LLM, query KB, call external API)
4. Updates `attributes.currentNode` to the next node ID
5. Writes the reply message to the `messages` table

---

*This reference was compiled from the full Tiledesk codebase and documentation. All architecture decisions, data models, and API contracts above should be treated as the ground truth for this rebuild.*
