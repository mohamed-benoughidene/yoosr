# Yoosr Codebase Inventory Audit

> **Date:** 2026-03-20 | **Type:** Read-only audit | **Purpose:** Landing page copy rewrite

---

## 1. ONBOARDING & AUTH

**STATUS: Built**

| Step | What Happens |
|------|-------------|
| Sign-up | Clerk handles sign-up, org creation, and invites (`/signup`) |
| Onboarding | `/onboarding` auto-creates a default project using the org name, then redirects to `/dashboard` |
| Post-setup | No manual setup wizard; fully automatic. Clerk Organization Switcher is embedded in sidebar |

**DETAILS:**
- Clerk manages all user/org lifecycle (sign-up, login, org creation, invites, role management)
- `OnboardingClient.tsx` checks: signed in → has org → has project → else auto-creates project → redirect to dashboard
- Clerk webhook (`/clerk-webhook`) syncs user profiles to Convex `profiles` table
- Multi-tenancy via `orgId` on every project/query

**NOTABLE:** Zero-friction onboarding — sign up, org + project created automatically, land on dashboard in seconds.

---

## 2. DASHBOARD HOME

**STATUS: Built**

**DETAILS:**
- **4 live stat cards:** Open Conversations, Waiting for Agent, Online Teammates, My Assigned
- **Live Queue table:** Shows unassigned/open conversations with visitor name, wait time, assigned agent, status — clickable to navigate to chat
- **Recent Activity Feed:** Paginated real-time feed of actions (teammate invited, conversation assigned, etc.) with "load more"
- **Today's Snapshot row (3 cards):** Conversations today (vs yesterday diff), Bot-resolved today, Average wait time
- **Conditional onboarding banner:** "Create your first Bot" CTA when no bots exist
- All data is real-time via Convex `useQuery`

**NOTABLE:** Fully functional command center with real-time data. Strong first impression.

---

## 3. MONITOR

**STATUS: Built**

**DETAILS:**
- **3-panel resizable layout** (desktop): Conversation List | Chat Display | Visitor Panel
- **Mobile responsive:** Swipe between list → chat → contact views
- **Conversation list filters:** By department (dropdown)
- **Chat display:** Full message thread with agent reply input, canned response picker, assign/resolve/transfer actions
- **Canned responses:** Built — agents can insert pre-saved quick replies
- **Visitor/Contact info panel:** See Area 3 details below

**Agent actions on a conversation:**
- Assign to self / reassign to another agent
- Resolve (close) conversation
- Transfer to department
- Set priority (low/normal/high/urgent)
- Add/remove tags
- Edit visitor info inline (name, email, phone, address, notes)
- Save visitor as contact
- Create orders tied to conversation

**Internal notes:** Not implemented as a separate feature. Visitor notes field exists in the panel.

**NOTABLE:** Full-featured agent workspace with resizable panels and mobile support.

---

## 4. CHAT SECTION

**STATUS: Built**

**DETAILS:**
- Same 3-panel layout as Monitor: Conversation List | Chat Area | Visitor Panel
- **ConversationList:** Searchable, shows visitor name, last message preview, time, unread badge, status indicator
- **ChatArea:** Message thread, text input with Send button, canned response picker, assign/resolve actions
- **VisitorPanel:** Shared component (see Monitor details)
- Separate from Monitor — this is the agent's "My Conversations" view

**NOTABLE:** Real-time message updates via Convex reactive queries.

---

## 5. DESIGN STUDIO (BOT BUILDER)

**STATUS: Built**

### Block types in UI (BLOCK_TYPES registry — 19 types):

| Block | In UI | In Engine (`bot.ts`) | Notes |
|-------|-------|---------------------|-------|
| Start | ✅ | ✅ | Entry point |
| Reply | ✅ | ✅ | Text + button variations |
| Set Attribute | ✅ | ✅ | Key-value store |
| Condition | ✅ | ✅ | Full expression evaluator (==, !=, >, <, contains) |
| Web Request | ✅ | ✅ | GET/POST/PUT/DELETE with interpolation |
| AI Task | ✅ | ✅ | LLM prompt execution with OpenRouter |
| HITL Handoff | ✅ | ✅ | Bot→human escalation with notification |
| Close | ✅ | ✅ | Resolves conversation (status 1000) |
| If Operating Hours | ✅ | ✅ | Branches true/false (schedule check is placeholder) |
| If Online Agent | ✅ | ✅ | Branches based on agent availability |
| Capture User Reply | ✅ | ✅ | Suspends flow, waits for input |
| Wait | ✅ | ✅ | Timed delay with scheduler |
| Ask Knowledge Base | ✅ | ✅ | Multi-turn KB Q&A with AI, turn counter, system prompt |
| Replace Bot | ✅ | ✅ | Switch to another bot by slug |
| Change Department | ✅ | ✅ | Routes to department, pauses bot |
| Code Action | ✅ | ✅ | Safe JS expression evaluation (expr-eval) |
| Clear Transcript | ✅ | ✅ | Resets conversation attributes |
| Apply Label | ✅ | ✅ | Tags the conversation |
| Set Priority | ✅ | ✅ | Sets urgency level |

### UI-only / Not wired to engine:
| Block | Status |
|-------|--------|
| AI Assistant | ❌ UI node exists but renders an error card — block was intentionally removed from engine |

### Visual flow builder:
- **React Flow** editor with drag-and-drop block palette
- **Node properties panel** for configuring each block type
- **Flow toolbar** for save, publish, etc.
- **AI Prompt Bar** for AI-assisted flow building
- **Debugger Panel** for testing flows
- **Compilation:** Flows save to `bot_flows` table with both `nodes` (React Flow) and `executionNodes` (compiled engine schema)
- **End-to-end:** Yes — flow is designed → saved → compiled → executed by `bot.ts` engine

**NOTABLE:** 19 block types, all wired end-to-end. This is a strong, production-ready visual bot builder with AI-powered KB integration.

---

## 6. KNOWLEDGE BASE

**STATUS: Built**

**DETAILS:**
- **Embedding pipeline:** Fully functional
  - Uses OpenRouter API with `nvidia/llama-nemotron-embed-vl-1b-v2:free` model
  - Text → chunked (500 char, sentence-aware) → embedded → stored in Convex vector index (2048 dimensions)
- **Source types:** Text, URL (with HTML stripping), File (via Convex storage)
- **Add sources:** UI dialog (`add-content-dialog.tsx`) for adding URL, text, or file sources
- **Indexing:** Automatic — source is indexed on creation, status tracked (indexing → indexed / failed)
- **KB search wired into bot flow:** Yes — `ask_kb` block searches vectors, builds AI context, and responds with multi-turn conversation support
- **Unanswered query tracking:** When no relevant chunks found, query is logged to `unanswered_queries` table
- **KB listing:** Sidebar with all knowledge bases, click to view sources

**NOTABLE:** Complete RAG pipeline — embed, search, AI-answer, track unanswered. This is a major differentiator.

---

## 7. WIDGET

**STATUS: Built**

**DETAILS:**
- **Embeddable:** Yes — iframe-based via `/widget?projectId=xxx&lang=en`
- **Pre-chat form:** Configurable (name required, email or phone collection, configurable contact method)
- **Real-time messaging:** Polls every 2s for new messages
- **Button support:** Bot reply buttons render and are clickable (sends button label as message)
- **CSAT rating:** Shows rating component (1-5 stars + feedback) when conversation is resolved
- **File attachment:** Button exists, but sends filename as text (not actual file upload — stub)
- **Welcome message:** Configurable delay, auto-appears
- **Notification sounds:** Audio beep on new agent/bot messages
- **Configurable:** Primary color, logo URL, header title, online status text, locale
- **Widget locale:** Supports en, ar, fr — auto-detected or forced via project settings
- **Parent frame messaging:** `postMessage` for unread badge notifications
- **Emoji:** No dedicated emoji picker — users can paste emoji but no UI picker

**NOTABLE:** Full-featured embeddable widget with pre-chat, CSAT ratings, button support, and branding customization.

---

## 8. CHANNELS / INTEGRATIONS

**STATUS: Partial**

### Fully built:
| Channel | Inbound Webhook | Outbound (Bot replies) | Setup UI |
|---------|----------------|----------------------|----------|
| **Telegram** | ✅ `/webhooks/telegram` | ✅ `sendTelegramMessage` | ✅ Settings → Integrations (token input, webhook registration) |
| **Meta Messenger** | ✅ `/webhooks/meta` | ✅ `sendMetaMessage` | ✅ Settings → Integrations (page ID, access token) |
| **Instagram** | ✅ `/webhooks/meta` (shared) | ✅ `sendMetaMessage` | ✅ Settings → Integrations (page ID, access token) |

### Not implemented / Stub:
| Channel | Status |
|---------|--------|
| WhatsApp | Schema supports it (`channel: "widget" | "messenger" | "instagram" | "telegram"`) but no WhatsApp-specific webhook or integration code |
| Email | Not implemented |

**NOTABLE:** Three external channels (Telegram, Messenger, Instagram) with encrypted credential storage. Bot flows work across all channels.

---

## 9. SETTINGS PAGES

**STATUS: Mostly Built**

| Settings Page | Status | What It Does |
|--------------|--------|-------------|
| **General** (Project Settings) | ✅ Built | Widget language, default AI model, SLA hours, project ID display |
| **Widget** | ✅ Built | Widget appearance config (color, logo, pre-chat form, etc.) |
| **Departments** | ✅ Built | CRUD for departments, member assignment, routing mode, bot assignment |
| **Canned Responses** | ✅ Built | Create/edit/delete quick reply templates |
| **Labels** | ✅ Built | Create colored labels for tagging conversations |
| **Operating Hours** | ✅ Built | Enable/disable, timezone, per-day schedule with time slots |
| **Integrations** | ✅ Built | Telegram, Messenger, Instagram channel setup with encrypted credentials |
| **Webhooks** | ✅ Built | RestHook subscriptions — URL, event selection, secret, active/inactive toggle |
| **Groups** | ❌ Stub | Placeholder text only — `TODO: Add groups list and creation functionality` |

### Also accessible (not in settings sidebar):
- **OpenRouter API Key Card** (`OpenRouterCard.tsx`) — lets admins set their own OpenRouter API key for AI features

**NOTABLE:** Webhooks system is a standout — event-based subscriptions with signed payloads.

---

## 10. ANALYTICS

**STATUS: Built**

**DETAILS:**
- **Date range picker:** Custom from/to dates + "Last 30 days" preset
- **6 stat cards:** Total Conversations, Bot-handled (% of total), Agent-handled (% of total), Avg CSAT, Total AI Tokens, SLA Breach Rate
- **Conversation Volume Chart:** Daily bar chart (bot vs agent handled) — uses Recharts
- **Tags Summary Chart:** Tag distribution visualization
- **Usage Quotas:** Token consumption and conversation counts
- **Unanswered Queries Table:** Top 20 queries the KB couldn't answer (with count + last asked)
- **CSAT Summary:** Average rating, total ratings, distribution
- **SLA Breach Rate:** Tracked with color-coding (green < 10%, amber 10-20%, red > 20%)
- **Admin-only:** Analytics is hidden from non-admin users

**NOTABLE:** Comprehensive analytics dashboard — CSAT, SLA, token usage, unanswered queries, conversation volume. All real data.

---

## 11. CONTACTS

**STATUS: Built**

**DETAILS:**
- **Contact fields:** Name, email, phone, address, note, tags
- **Add contact:** Manual form with all fields
- **Import:** CSV, XLSX, JSON — with preview table, skip validation, batch processing (500 per chunk)
- **Export:** CSV, XLSX, JSON — formatted download
- **Linked to conversations:** Contacts can be linked to conversations via "Save as Contact" in Visitor Panel
- **ContactsList component:** Renders all contacts in a list/table view
- **Batch import:** Supports up to 500 contacts per batch with dedup

**NOTABLE:** Full CRM-lite contact management with import/export in 3 formats.

---

## 12. AGENT / TEAMMATE MANAGEMENT

**STATUS: Partial**

**DETAILS:**
- **Teammate management:** Via Clerk Organizations — invite members, assign roles (admin/member), manage from Clerk UI
- **Organization Switcher:** Embedded in sidebar header
- **Agent availability:** `isAvailable` field on profiles table, used by `if_online_agent` bot block and dashboard stats
- **Department assignment:** Departments have `memberIds` array — agents can be assigned to departments via Settings → Departments
- **No custom agent management UI:** Relies on Clerk's built-in org member management
- **Agent profiles:** Synced from Clerk via webhook (name, email, avatar)

**NOTABLE:** Clerk handles the heavy lifting; department assignment is custom.

---

## 13. MULTI-LANGUAGE / LOCALIZATION

**STATUS: Built**

**DETAILS:**
- **Languages:** English, Arabic, French (3 complete translation files: `en.json` 72KB, `ar.json` 91KB, `fr.json` 80KB)
- **Framework:** `next-intl` with locale routing (`/[locale]/...`)
- **Language switcher:** Functional — available in user dropdown menu
- **RTL support:** Arabic is fully RTL (`dir="rtl"`, sidebar on right side)
- **Widget locale:** Can be set per-project in settings, or auto-detected
- **Date formatting:** Locale-aware using `date-fns` locale objects

**NOTABLE:** Full trilingual support with RTL — not a common feature in this space.

---

## 14. GENERAL

**STATUS: Built**

**DETAILS:**
- **UI framework:** Next.js 14+ (App Router) + Shadcn UI + Tailwind CSS
- **Backend:** Convex (real-time database, serverless functions, vector search)
- **Auth:** Clerk (orgs, multi-tenancy, JWT)
- **AI:** OpenRouter API (supports model selection, project-level API keys)
- **Mobile responsive:** Yes — all major views (dashboard, monitor, chat) have mobile-optimized layouts with swipeable views
- **Design language:** Clean, modern, enterprise-grade — Shadcn components, consistent spacing, dark mode support via CSS variables
- **Public API / Webhooks:** Yes — RestHook webhook subscriptions (create, manage via UI), HTTP endpoints for widget
- **Notification system:** In-app notifications for agents (new message, assigned, escalation, resolved) with bell icon + dropdown
- **Activity logging:** Comprehensive — teammate actions, conversation events, bot events logged to `activity_logs` table
- **Orders system:** Create orders from within conversations, track status (new → confirmed → cancelled)
- **Requests page:** Unassigned conversation queue with filters (unassigned, mine, bot-escalated), assign-to-self action
- **History page:** Closed conversation archive with search, date range filter, CSAT stars, export
- **Feedback system:** In-app bug/feature/general feedback modal for early access users

---

## SUMMARY

### Top 7 Strongest Features for Landing Page

1. **Visual Bot Builder (Design Studio)** — 19 block types, drag-and-drop React Flow editor, AI-powered KB integration, fully compiled execution engine. This is the hero feature.

2. **Knowledge Base with RAG Pipeline** — Upload text/URLs/files → auto-embed → vector search → AI-powered answers. Multi-turn conversation support, unanswered query tracking.

3. **Omnichannel Support** — Website widget + Telegram + Meta Messenger + Instagram, all sharing the same bot flows and conversation history.

4. **Real-Time Analytics Dashboard** — Conversation volume, CSAT scores, SLA breach rates, AI token usage, unanswered queries, tag distribution. All filterable by date.

5. **Embeddable Chat Widget** — Pre-chat form, CSAT ratings, interactive buttons, branding customization, multilingual (EN/AR/FR with RTL).

6. **Human-in-the-Loop (HITL) Handoff** — Seamless bot-to-agent escalation with history preservation, notifications, department routing, and SLA tracking.

7. **Trilingual with Full RTL** — English, Arabic, French with complete translations and proper RTL layout including sidebar placement.

### Do NOT Mention (Not Functional)

| Feature | Reason |
|---------|--------|
| WhatsApp integration | Schema exists but no webhook or implementation |
| Email channel | Not implemented |
| File upload in widget | Button exists but only sends filename as text |
| Groups (Settings) | Stub/placeholder only |
| AI Assistant block | Intentionally removed; shows error in UI |
| Operating hours schedule checking | Bot block exists but actual schedule evaluation is a placeholder (`isOpen = true`) |
| Emoji picker in widget | No dedicated picker in the widget |

### Gaps Between Current Landing Page Claims and Reality

> *Without seeing the current landing page copy, these are potential gaps based on common overclaims:*

- **"WhatsApp integration"** — Not built. Only Telegram, Messenger, Instagram.
- **"File sharing in chat"** — Widget has attach button but doesn't actually upload files.
- **"AI-powered routing based on operating hours"** — The bot block exists but doesn't actually check the schedule.
- **"Agent groups/teams"** — Groups settings page is a stub.
- **"Built-in CRM"** — Contacts exist with import/export, but it's contact management, not a full CRM (no pipeline, no deals, no custom fields).
- **"Smart email support"** — No email channel exists.
