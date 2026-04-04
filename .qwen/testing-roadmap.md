# Yoosr Automated Testing Roadmap

**Project:** Yoosr - AI-Powered Customer Support Platform
**Created:** Saturday, April 4, 2026
**Testing Strategy:** 5 Phases, 12 Steps — Progressive coverage from unit to E2E to performance

---

## Testing Strategy Overview

| Phase | Focus | Tool | Status | Tests |
|-------|-------|------|--------|-------|
| Phase 1 | Foundation (Unit + Backend) | Vitest | ✅ **COMPLETE** | ~202 |
| Phase 2 | External Interfaces (Webhooks/API) | Vitest | ✅ **COMPLETE** | ~204 |
| Phase 3 | UI Component Tests | React Testing Library | ✅ **COMPLETE** | ~1,050 |
| Phase 4 | E2E Critical Flows | Playwright | ⏳ TODO | ~65 |
| Phase 5 | Optional Polish | Chromatic + k6 | ⏳ TODO | TBD |

---

## Phase 1: Foundation Tests — ⏳ TODO

**Tool:** Vitest (jsdom + node environments)
**Tests:** 202 passing | **Coverage:** 89.4% | **Files:** 9 test files

### ✅ Step 1: Unit Tests — 77 tests

**`convex/bot-helpers.test.ts`** (30 tests)
- `interpolate()` — Variable substitution in message templates
- `evaluateCondition()` — Boolean condition parsing
- `evaluateExpression()` — Math and string expression evaluation
- `tryParseJSON()` — Safe JSON parsing with fallback
- `isOpenNow()` — Operating hours logic with timezone support

**`src/lib/utils.test.ts`** (26 tests)
- `cn()` — Tailwind class name merging (clsx + tailwind-merge)
- `hexToBytes()` — Hex string to byte array conversion
- `encryptSecret()` / `decryptSecret()` — AES-GCM encryption
- `requireEnv()` — Environment variable validation
- `requireAdmin()` — Admin role assertion

**`src/types/flow.test.ts`** (13 tests)
- `BLOCK_TYPES` registry validation (19 block type definitions)
- `FREE_PLAN_LIMITS` constant validation
- TypeScript interface structure validation

**`messages/i18n.test.ts`** (8 tests)
- Message file completeness (EN: 1434 keys, AR: 1434, FR: 1434)
- Key coverage across all three locales
- English as superset validation (AR/FR have 0 missing keys)

### ✅ Step 2: Backend Functions — 78 tests

**`convex/bot-engine.backend.test.ts`** (50 tests)
- Complete bot execution engine testing
- All 19 block types: Reply, Capture Reply, Set Attribute, Condition, AI Task, Wait, Close, HITL Handoff, Web Request, Replace Bot, Operating Hours, Knowledge Base, Code Action, Apply Label, Set Priority
- Execution flow (sequential, conditional branching, loops)
- State management (attribute persistence, conversation context)
- Error handling (malformed blocks, API failures, timeouts)

**`convex/knowledge.backend.test.ts`** (28 tests)
- RAG retrieval pipeline
- Text chunking (splitIntoChunks with various sizes)
- Embedding batch processing
- Cosine similarity ranking
- Source type validation (URL, file, text, FAQ)
- Conversation state management

### ✅ Step 2 Expanded: Hooks, Config, API — 47 tests

**`src/hooks/use-mobile.test.tsx`** (17 tests)
- `useIsMobile()` hook with viewport widths 320px-1024px
- Breakpoint validation (768px threshold)
- Common device width coverage (iPhone SE, iPad Pro, etc.)
- `AVAILABLE_APPS` config validation (unique IDs, categories, icons, descriptions)

**`src/app/api/widget/project/route.test.ts`** (12 tests)
- Widget project API route (GET/OPTIONS)
- Missing parameter validation (400)
- Configuration error handling (500)
- CORS headers validation
- OPTIONS preflight response
- Fetch failure simulation
- URL encoding for special characters
- Caching configuration (60s revalidation)

**`src/i18n/routing.test.ts`** (18 tests)
- i18n locale support (EN/AR/FR)
- Middleware matcher patterns
- Locale detection logic simulation
- Route pattern validation (dynamic, marketing, protected)
- Redirect behavior (root → locale-prefixed)
- RTL vs LTR locale classification

### Coverage Results

| File | Statements | Branch | Functions | Lines |
|------|-----------|--------|-----------|-------|
| `convex/lib/crypto.ts` | 100% | 100% | 100% | 100% |
| `convex/lib/env.ts` | 100% | 100% | 100% | 100% |
| `src/config/apps.ts` | 100% | 100% | 100% | 100% |
| `src/lib/plans.ts` | 100% | 100% | 100% | 100% |
| `src/lib/utils.ts` | 100% | 100% | 100% | 100% |
| `src/types/flow.ts` | 100% | 100% | 100% | 100% |
| `messages/*.json` | 100% | 100% | 100% | 100% |
| `src/app/api/widget/project/route.ts` | 87.5% | 83.33% | 100% | 87.5% |
| `src/hooks/use-mobile.tsx` | 90.9% | 100% | 75% | 90% |

### Quality Gates
- ✅ 202/202 tests passing (0 failures)
- ✅ Build passing (0 errors)
- ✅ Lint passing (0 errors, 4 acceptable warnings)

---

## Phase 2: External Interfaces — ⏳ TODO

**Tool:** Vitest (pure function tests, no mocking needed — testing payload shapes, API contracts, crypto ops)
**Tests:** 204 passing | **Files:** 8 new test files

### ✅ Step 2.1: Inbound Webhook Tests — 43 tests

**`convex/http.webhooks.test.ts`** (43 tests)
- **WhatsApp Webhooks** (9 tests): Payload structure, phone_number_id extraction, sender info, text extraction, multi-message handling, empty payload, 200 return policy
- **Messenger Webhooks** (6 tests): Payload structure, page_id extraction, sender ID, echo filtering, attachment handling, multi-event processing
- **Instagram Webhooks** (3 tests): Payload structure, object field distinction, account/page ID extraction
- **Webhook Verification** (5 tests): hub.mode validation, verify_token requirement, challenge response, token mismatch
- **HMAC Signature Validation** (5 tests): SHA-256 generation, different secrets/bodies produce different signatures, constant-time comparison, length mismatch rejection
- **Telegram Webhooks** (8 tests): Payload structure, secret token header requirement, chat_id/sender_id/message_id extraction, name handling, missing message field, 200 return policy
- **Telegram Verification** (2 tests): 200 OK response, no query params required
- **Clerk Webhooks** (5 tests): user.created/updated, organization.deleted, name extraction, missing name fields

### ✅ Step 2.2: Outbound Webhook Tests — 28 tests

**`convex/webhooks.outbound.test.ts`** (28 tests)
- **HMAC Signing** (3 tests): SHA-256 generation, header format, payload formatting
- **Event Types** (6 tests): contact.created, message.sent, conversation.opened, conversation.closed, agent.assigned
- **Retry Logic** (6 tests): Max 3 attempts, 60s delay (2nd), 5min delay (3rd), stop after max, non-OK retry, success no-retry
- **Timeout** (3 tests): 10s timeout, AbortSignal, error logging
- **Secret Generation** (3 tests): 32-byte random, hex format, uniqueness
- **Subscription Filtering** (3 tests): Project/event filtering, empty results, max limit
- **CRUD Operations** (4 tests): Creation, URL validation, status update, admin role requirement

### ✅ Step 2.3: AI API Client Tests — 28 tests

**`convex/openrouter.client.test.ts`** (28 tests)
- **Client Configuration** (4 tests): Base URL, API key requirement, custom key override, missing key error
- **AI Task (Single-Shot)** (10 tests): System+user message pair, default model, project default model, explicit model, low temperature, response extraction, token usage, empty/null handling, result structure
- **AI Assistant (Multi-Turn)** (5 tests): Full conversation history, higher temperature, empty history, long histories, message order preservation
- **ChatMessage Type** (4 tests): System/user/assistant roles, content validation
- **Embeddings API** (4 tests): Endpoint URL, model name, request format, response structure
- **Model Selection** (1 test): Priority chain (explicit > project default > fallback)

### ✅ Step 2.4: Outbound Messaging Tests — 26 tests

**`convex/outbound-messaging.test.ts`** (26 tests)
- **WhatsApp Outbound** (10 tests): Payload structure, API URL, Bearer token auth, error codes (131047, 130429, 131048, 131056, 190), message ID extraction
- **Messenger/Instagram Outbound** (7 tests): Payload structure, v19.0 API, access token query param, channelSenderId requirement, channel distinction, error response structure
- **Telegram Outbound** (5 tests): Payload structure, API URL, error response, channelSenderId requirement, success response
- **Channel Routing** (3 tests): WhatsApp endpoint, Telegram endpoint, unsupported channel rejection
- **Credential Encryption** (2 tests): Encrypted vs plain token detection, ENCRYPTION_KEY requirement

### ✅ Step 2.5: Rate Limiting Tests — 20 tests

**`convex/rate-limiter.test.ts`** (20 tests)
- **Fixed Window** (7 tests): 5 req/60s, 6th rejection, exact count, key generation, visitorId preference, projectId fallback, 429 response
- **Token Bucket** (5 tests): 20 req/60s with capacity 5, burst behavior, key generation, token refill rate, capacity cap
- **Integration** (5 tests): Endpoint mapping, CORS with 429, GET exemption, component usage
- **Key Isolation** (3 tests): Per-visitor, per-conversation, per-project isolation

### ✅ Step 2.6: Auth/Identity Tests — 21 tests

**`convex/auth-identity.test.ts`** (21 tests)
- **requireAdmin** (5 tests): Admin allow, member reject, viewer reject, no role reject, null identity reject
- **Project Ownership** (5 tests): Own org allow, different org reject, null project reject, ownership check return, null ownership check
- **Clerk JWT Config** (4 tests): Issuer domain, identity validation, org_id extraction, personal account handling
- **Auth Middleware Patterns** (4 tests): Dashboard protection, login redirect, public widget routes, public webhook routes
- **Multi-Tenancy** (3 tests): Org scoping, cross-org prevention, same-org access

### ✅ Step 2.7: File Upload Tests — 16 tests

**`convex/file-uploads.test.ts`** (16 tests)
- **Upload URL Generation** (3 tests): Convex storage URL format, uniqueness, JSON response
- **File Size Validation** (4 tests): 15MB limit, under limit, over limit, exact limit
- **File Type Validation** (8 tests): PDF support, text support, PDF extraction, text processing, unsupported rejection, widget upload, KB upload, upload flow
- **Upload Flow** (2 tests): 4-step sequence, file metadata in message

### ✅ Step 2.8: Next.js Middleware Tests — 22 tests

**`src/middleware.test.ts`** (22 tests)
- **Route Protection** (4 tests): Dashboard paths, public paths, login redirect, design-studio
- **Locale Redirects** (5 tests): Root redirect, dashboard redirect, user locale, all three locales, no redirect for prefixed paths
- **Skip Conditions** (5 tests): API routes, widget routes, _next routes, static files, matcher pattern
- **Clerk auth.protect()** (5 tests): Protection call, authenticated access, unsafeMetadata locale, locale validation, missing locale
- **Middleware Chain** (3 tests): Processing order, non-protected route skip, early returns

### Coverage Results

| File | Statements | Branch | Functions | Lines |
|------|-----------|--------|-----------|-------|
| `convex/lib/crypto.ts` | 100% | 100% | 100% | 100% |
| `convex/lib/env.ts` | 100% | 100% | 100% | 100% |
| `src/config/apps.ts` | 100% | 100% | 100% | 100% |
| `src/lib/plans.ts` | 100% | 100% | 100% | 100% |
| `src/lib/utils.ts` | 100% | 100% | 100% | 100% |
| `src/types/flow.ts` | 100% | 100% | 100% | 100% |
| `messages/*.json` | 100% | 100% | 100% | 100% |
| `src/app/api/widget/project/route.ts` | 87.5% | 83.33% | 100% | 87.5% |
| `src/hooks/use-mobile.tsx` | 90.9% | 100% | 75% | 90% |

### Quality Gates
- ✅ 406/406 tests passing (0 failures)
- ✅ Build passing (0 errors)
- ✅ Lint passing (0 errors, 9 acceptable warnings)

---

## Phase 3: UI Component Tests — ⏳ TODO

**Tool:** React Testing Library + Vitest (jsdom environment)
**Tests:** 1,050 passing across 40 test files | **Coverage:** Component interaction, state transitions, accessibility, RTL, forms, dialogs, navigation

### Breakdown by Component Area

| Component Area | Test File | Tests |
|---------------|-----------|-------|
| **Chat / Conversations** | `chat/ChatArea.test.tsx` | 63 |
| | `chat/ConversationList.test.tsx` | 18 |
| | `dashboard/monitor/conversation-list.test.tsx` | 25 |
| | `dashboard/monitor/chat-display.test.tsx` | 33 |
| | `dashboard/monitor/monitor-layout.test.tsx` | 8 |
| **Design Studio** | `design-studio/FlowEditor.test.tsx` | 27 |
| | `design-studio/NodePropertiesPanel.test.tsx` | 47 |
| | `design-studio/BlockPalette.test.tsx` | 14 |
| | `design-studio/AIPromptBar.test.tsx` | 33 |
| | `design-studio/DebuggerPanel.test.tsx` | 19 |
| | `design-studio/FlowToolbar.test.tsx` | 28 |
| | `design-studio/nodes/node-components.test.tsx` | 123 |
| **Bots Management** | `dashboard/bots/page.test.tsx` | 43 |
| | `dashboard/bots/create-bot-dialog.test.tsx` | 26 |
| | `dashboard/bots/bot-card.test.tsx` | 24 |
| **Contacts** | `dashboard/contacts/page.test.tsx` | 41 |
| | `dashboard/contacts/contacts-list.test.tsx` | 24 |
| | `dashboard/contacts/edit-contact-dialog.test.tsx` | 22 |
| **Visitor Panel** | `dashboard/shared/VisitorPanel.test.tsx` | 25 |
| **Notifications** | `dashboard/NotificationBell.test.tsx` | 33 |
| **Settings** | `settings/OpenRouterCard.test.tsx` | 24 |
| | `settings/UsageCard.test.tsx` | 26 |
| | `settings/SettingsSidebar.test.tsx` | 19 |
| **Landing Page** | `landing/Hero.test.tsx` | 23 |
| | `landing/FeaturesGrid.test.tsx` | 14 |
| | `landing/HowItWorks.test.tsx` | 15 |
| | `landing/PricingTeaser.test.tsx` | 15 |
| | `landing/VideoPlayer.test.tsx` | 25 |
| | `pricing/PricingTable.test.tsx` | 31 |
| **Forms / Dialogs** | `feedback/FeedbackModal.test.tsx` | 23 |
| | `dashboard/kb/add-content-dialog.test.tsx` | 37 |
| | `activities/ActivitiesDataTable.test.tsx` | 17 |
| **Auth & Shell** | `dashboard/AppSidebar.test.tsx` | 28 |
| | `auth/DashboardAuthGuard.test.tsx` | 11 |
| | `dashboard/SiteHeader.test.tsx` | 22 |
| **i18n** | `LanguageSwitcher.test.tsx` | 11 |
| | `FooterLanguageSwitcher.test.tsx` | 13 |
| **Layout** | `layout/LandingFooter.test.tsx` | 9 |
| | `layout/LandingHeaderNoAuth.test.tsx` | 11 |
| **Total** | **40 test files** | **1,050** |

---

### ⏳ Step 3.1: Chat / Conversation System (~65 tests)

**`src/components/chat/ChatArea.test.tsx`** (~18 tests)
- **Message Sending** (4): Text input → Enter sends, button click sends, empty message blocked, loading state during send
- **Canned Responses** (3): `/` trigger opens picker, click inserts template, keyboard navigation
- **Conversation Actions** (4): Resolve button, assign dialog open/close, transfer dialog, join conversation
- **Loading/Empty/Error States** (3): Skeleton during fetch, empty message list, error state with retry
- **Accessibility** (2): Keyboard shortcuts (Enter vs Shift+Enter), ARIA labels on action buttons
- **Pagination** (2): Load more messages, scroll-to-bottom behavior

**`src/components/chat/ConversationList.test.tsx`** (~12 tests)
- **Tab Filtering** (3): All/Unread tabs, unread count badge, tab switching
- **Search Filtering** (2): Search input filters conversations, clear search resets
- **Conversation Selection** (3): Click selects conversation, active state styling, unread mark-as-read
- **Channel Icons** (2): WhatsApp/Messenger/Instagram icons per channel, fallback icon
- **Empty State** (1): "No conversations" message when empty
- **Loading State** (1): Skeleton rows during fetch

**`src/components/dashboard/monitor/conversation-list.test.tsx`** (~12 tests)
- **Filter Reducer** (5): Label filter, status filter, agent filter, department filter, combined filters
- **Search** (2): Name/email search, case-insensitive matching
- **Sorting** (2): Priority sort (high→low), SLA sort (overdue first)
- **Agent+Bot List** (2): Combined filter list rendering, empty state
- **Loading State** (1): Skeleton loading

**`src/components/dashboard/monitor/chat-display.test.tsx`** (~12 tests)
- **Message Sending** (3): Input → send button, channel relay (Meta/Telegram), disabled when no conversation
- **Status Actions** (3): Resolve, open, pending buttons, confirmation dialogs, success feedback
- **Conversation Management** (2): Join conversation, leave conversation
- **Message Rendering** (2): Bot vs user message styling, image/file attachments
- **States** (2): Empty state with placeholder, loading skeleton

**`src/components/dashboard/monitor/monitor-layout.test.tsx`** (~8 tests)
- **Responsive Layout** (3): Desktop 3-panel, tablet 2-panel, mobile single-panel with toggle
- **Panel Switching** (2): Mobile list→chat toggle, mobile chat→contact toggle
- **Auto-Select** (2): First conversation auto-selected, empty state when no conversations
- **Department Filter** (1): Department dropdown filters conversation list

---

### ⏳ Step 3.2: Design Studio / Flow Builder (~60 tests)

**`src/components/design-studio/FlowEditor.test.tsx`** (~14 tests)
- **Node Management** (4): Add node from palette, delete node with confirmation, update node position, drag-stop auto-save
- **Edge Connections** (3): Connect two nodes, disconnect edge by double-click, edge rendering with labels
- **Selection** (3): Click node selects it, canvas click deselects, active node highlighting
- **Start Node Protection** (2): Cannot delete start node, cannot disconnect from start node
- **Undo/Redo** (2): Ctrl+Z undo, Ctrl+Y redo (if implemented)

**`src/components/design-studio/NodePropertiesPanel.test.tsx`** (~15 tests)
- **Reply Node Properties** (3): Text variation add/remove, button add/remove with type select, label editing
- **Condition Node** (2): Condition input rendering, operator dropdown selection
- **AI Task Node** (2): System prompt textarea, model selection dropdown
- **Wait Node** (2): Duration input with unit selector (seconds/minutes/hours)
- **WebRequest Node** (2): URL input, method dropdown (GET/POST/PUT/DELETE)
- **Generic Properties** (2): Node label editing, delete node confirmation dialog
- **Validation** (2): Required field errors, invalid input blocking save

**`src/components/design-studio/BlockPalette.test.tsx`** (~8 tests)
- **Block List** (3): All blocks rendered (excluding "start"), icons and labels from translations, description tooltips
- **Add Behavior** (3): Click block triggers onAddNode, disabled during flow execution, success feedback
- **RTL Support** (2): RTL layout direction, Arabic labels

**`src/components/design-studio/AIPromptBar.test.tsx`** (~10 tests)
- **Prompt Input** (2): Textarea with placeholder, Enter key submits, disabled without input
- **Generation Flow** (3): Generate button triggers API call, loading state during generation, success with node insertion
- **Error Handling** (3): Timeout error toast, bad format error toast, provider error toast
- **Examples** (2): Examples popover opens/closes, click example inserts into prompt

**`src/components/design-studio/DebuggerPanel.test.tsx`** (~6 tests)
- **Log Rendering** (2): Execution logs with timestamps, step-by-step output
- **Active Node** (2): Highlighting auto-updates during execution, click-to-navigate
- **States** (2): Loading indicator, empty state before execution

**`src/components/design-studio/FlowToolbar.test.tsx`** (~6 tests)
- **Save Button** (3): Idle→saving→saved→error state cycle, disabled during saving, success/error feedback
- **Toggles** (2): Debugger panel toggle, AI prompt bar toggle, active state styling
- **Navigation** (1): Back button with project query param preservation

---

### ⏳ Step 3.3: Dashboard — Bots Management (~25 tests)

**`src/app/[locale]/dashboard/bots/page.test.tsx`** (~12 tests)
- **Bot List** (3): Bot cards with status indicators (online/offline/learning), type badges, last activity
- **Filtering** (3): Type filter (all/chatbot/automation), search by name, combined filters
- **Create Bot** (2): Create button opens dialog, empty state with create cards
- **Delete Bot** (2): Delete button opens confirmation, cancellation keeps bot, deletion removes from list
- **Admin Gating** (2): Admin sees edit/delete buttons, non-admin sees read-only view

**`src/components/dashboard/bots/create-bot-dialog.test.tsx`** (~8 tests)
- **Form** (3): Name field validation (required, min length), type selection (chatbot/automation), description optional
- **Submission** (3): Create button triggers mutation, loading state during creation, success closes dialog
- **Dialog Control** (2): Open/close via prop, form reset after close, ESC key dismisses

**`src/components/dashboard/bots/bot-card.test.tsx`** (~5 tests)
- **Card Rendering** (2): Bot name, status dot (color per status), type icon
- **Actions** (2): Edit button triggers callback, delete button triggers callback
- **Hover/Focus** (1): Hover reveals action buttons

---

### ⏳ Step 3.4: Dashboard — Contacts Management (~35 tests)

**`src/app/[locale]/dashboard/contacts/page.test.tsx`** (~12 tests)
- **Create Contact** (3): Form fields (name, email, phone), validation errors, successful creation
- **Import Contacts** (4): File picker for CSV/XLSX/JSON, file parsing with preview table, chunked batch import, error handling for invalid files
- **Export Contacts** (3): Export format selection (CSV/JSON/XLSX), download trigger, error on empty dataset
- **Dialog State** (2): Reducer-driven dialog management, multiple dialogs open simultaneously

**`src/components/dashboard/contacts/contacts-list.test.tsx`** (~12 tests)
- **Table Rendering** (2): Contact rows with name/email/phone/created, sortable column headers
- **Filtering** (3): Search input filters contacts, column visibility toggle, tag filter
- **Selection** (2): Row checkboxes for batch selection, select all checkbox
- **Actions** (3): Edit opens dialog, delete opens confirmation (AlertDialog), clipboard copy email
- **States** (2): Empty state message, loading skeleton

**`src/components/dashboard/contacts/edit-contact-dialog.test.tsx`** (~11 tests)
- **Form Fields** (3): Name, email, phone, custom attributes, tag management
- **Validation** (3): Email format validation, phone format validation, required field errors
- **Submission** (3): Update triggers mutation, loading state, success feedback
- **Dialog Control** (2): Pre-fill with contact data, form reset on close

---

### ⏳ Step 3.5: Dashboard — Visitor Panel (~20 tests)

**`src/components/dashboard/shared/VisitorPanel.test.tsx`** (~12 tests)
- **Inline Editing** (4): Click field makes it editable, save/cancel on blur, Enter saves, ESC cancels
- **Contact Creation** (2): Create button triggers form, successful creation updates panel
- **Tag Management** (3): Add tag via input, remove tag via X button, tag rendering with colors
- **Priority** (2): Priority select dropdown, color-coded badge update
- **Accordion** (1): Expand/collapse sections (profile, tags, orders)

**`src/components/dashboard/shared/VisitorPanel.test.tsx`** (additional ~8 tests)
- **Order Creation** (3): Add order button, order form fields, successful creation
- **Channel Icons** (2): WhatsApp/Messenger/Instagram/Telegram icon mapping, fallback
- **Loading/Empty** (3): Skeleton during fetch, empty state for new visitor, error state

---

### ⏳ Step 3.6: Notifications (~15 tests)

**`src/components/dashboard/NotificationBell.test.tsx`** (~10 tests)
- **Unread Badge** (2): Count display, color changes when unread > 0, hidden when 0
- **Notification List** (3): Type-based icons (new_message/assigned/escalation/resolved/unassigned), timestamp formatting, preview text
- **Actions** (3): Mark as read on click, mark all read button, clear all button
- **Navigation** (2): Click notification navigates to conversation, closes popover

**`src/components/dashboard/NotificationBell.test.tsx`** (additional ~5 tests)
- **States** (3): Loading spinner, empty state ("No notifications"), error with retry
- **Real-time** (2): Convex subscription updates badge count, new notification toast

---

### ⏳ Step 3.7: Settings (~25 tests)

**`src/components/settings/OpenRouterCard.test.tsx`** (~10 tests)
- **API Key Save** (3): Input field, save button triggers mutation, validation (required)
- **Key Test** (3): Test button makes API call, success shows "Connected" badge, failure shows "Failed" badge
- **Key Removal** (2): Remove button with confirmation, resets to unconnected state
- **States** (2): Loading during save/test, masked key display (••••••••)

**`src/components/settings/UsageCard.test.tsx`** (~8 tests)
- **Metrics Display** (3): Conversations/bots/KBs/teammates counts, progress bars, limit labels
- **Progress Colors** (3): Green (< 70%), amber (70-90%), red (> 90%)
- **States** (2): Loading skeleton, fetch error toast

**`src/components/settings/SettingsSidebar.test.tsx`** (~7 tests)
- **Navigation** (3): Links with icons and labels, active state highlighting, RTL support
- **Translation** (2): Keys resolve to correct locale, fallback for missing keys
- **Sections** (2): Grouped navigation items (General, Integrations, Team, Billing)

---

### ⏳ Step 3.8: Landing Page (~40 tests)

**`src/components/landing/Hero.test.tsx`** (~8 tests)
- **Animation** (3): Word-by-word text reveal, subheadline delay visibility, animation timing
- **CTA** (2): Primary CTA button visible, link to signup/waitlist
- **Video** (3): Video player integration, play button overlay, thumbnail display

**`src/components/landing/FeaturesGrid.test.tsx`** (~6 tests)
- **Feature Cards** (3): Icon rendering, title/description from translations, hover state
- **Scroll Reveal** (2): Animation triggers on scroll, already-visible on viewport
- **Grid Layout** (1): Responsive grid (1/2/3 columns)

**`src/components/landing/HowItWorks.test.tsx`** (~6 tests)
- **Step Rendering** (3): Sequential step display with numbers, line animation between steps
- **Content** (2): Title/description per step, icon illustration
- **Scroll Trigger** (1): Animation starts when section enters viewport

**`src/components/landing/PricingTeaser.test.tsx`** (~5 tests)
- **Card Rendering** (3): Three plans with name/price/features, CTA buttons, popular badge
- **Hover** (1): Hover effect (scale up, shadow)
- **Navigation** (1): CTA links to pricing page

**`src/components/pricing/PricingTable.test.tsx`** (~8 tests)
- **Toggle** (2): Monthly/yearly toggle switch, price recalculation (yearly / 12)
- **Plan Rendering** (3): Feature list per plan, popular plan badge, CTA variant selection
- **Comparison** (3): Checkmark/X for feature availability, tooltip on hover

**`src/components/landing/VideoPlayer.test.tsx`** (~7 tests)
- **Lazy Loading** (2): IntersectionObserver triggers load, placeholder while loading
- **Playback** (3): Autoplay with mute, controls visibility, mute toggle
- **Popover** (2): Expand to larger view, close returns to inline

---

### ⏳ Step 3.9: Form Components (~25 tests)

**`src/components/feedback/FeedbackModal.test.tsx`** (~10 tests)
- **Type Toggle** (2): Bug/feature/general selection, visual feedback
- **Validation** (3): Min 20 chars, max 1000 chars, character counter display
- **Submission** (3): Submit button triggers mutation, loading state, success with auto-close
- **Error Handling** (2): Error message display, retry button
- **RTL** (1): Arabic text alignment and layout

**`src/components/dashboard/kb/add-content-dialog.test.tsx`** (~10 tests)
- **Tab System** (3): URL/text/file tabs, tab switching preserves state, active tab styling
- **URL Tab** (2): URL input validation, add button triggers scraping
- **Text Tab** (2): Textarea with character limit, submit button
- **File Tab** (3): Drag-and-drop zone, file type validation, upload progress indicator

**`src/components/activities/ActivitiesDataTable.test.tsx`** (~5 tests)
- **Table Rendering** (2): Generic data rendering with columns, pagination controls
- **Load More** (2): Load more button with status, disabled during loading
- **Empty** (1): "No data" message

---

### ⏳ Step 3.10: Auth & Shell (~20 tests)

**`src/components/dashboard/AppSidebar.test.tsx`** (~10 tests)
- **Navigation Groups** (3): Main nav items, admin-only items hidden for non-admin, analytics gating
- **User Dropdown** (3): Avatar with initials, user menu items (profile, settings, sign out), feedback modal trigger
- **RTL** (2): Sidebar on right for Arabic, icon direction flip
- **Active State** (2): Current route highlighted, organization switcher

**`src/components/auth/DashboardAuthGuard.test.tsx`** (~6 tests)
- **Loading** (2): Loading spinner during auth check, timeout fallback
- **Unauthenticated** (2): Redirect to login, preserve intended destination
- **Authenticated** (2): Children rendered, orgId check passes

**`src/components/dashboard/SiteHeader.test.tsx`** (~4 tests)
- **Title** (2): Page title from pathname mapping, custom title override
- **Availability** (2): Availability switch triggers async mutation, loading during toggle

---

### ⏳ Step 3.11: i18n & Language (~12 tests)

**`src/components/LanguageSwitcher.test.tsx`** (~7 tests)
- **Dropdown** (2): Language options (EN/AR/FR), current language highlighted
- **Selection** (3): Click triggers async metadata update, redirect after change, form state preservation
- **Error** (2): Network error shows toast, retry button

**`src/components/FooterLanguageSwitcher.test.tsx`** (~5 tests)
- **Rendering** (2): Language links with pathname manipulation, current language bold/gold
- **Styling** (2): Active language highlighting, hover effects
- **RTL** (1): Arabic layout direction

---

### ⏳ Step 3.12: Design Studio Node Components (~20 tests)

**Node Component Tests** — All 20 node types in `src/components/design-studio/nodes/`
- Each node tested for: selected state styling, data display, "click to configure" placeholder, handle positions, translation lookups
- Grouped into one test file: `src/components/design-studio/nodes/node-components.test.tsx` (~20 tests)

**Tested Nodes:**
- StartNode, ReplyNode, ConditionNode, SetAttributeNode, WebRequestNode
- AITaskNode, HITLHandoffNode, CloseNode, IfOperatingHoursNode, IfOnlineAgentNode
- CaptureUserReplyNode, WaitNode, AskKnowledgeBaseNode, ReplaceBotNode, ChangeDepartmentNode
- CodeActionNode, ClearTranscriptNode, AIAssistantNode, ApplyLabelNode, SetPriorityNode

---

### Test File Organization

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatArea.test.tsx                    (~18 tests)
│   │   └── ConversationList.test.tsx            (~12 tests)
│   ├── dashboard/
│   │   ├── bots/
│   │   │   ├── page.test.tsx                    (~12 tests) [app route]
│   │   │   ├── create-bot-dialog.test.tsx       (~8 tests)
│   │   │   └── bot-card.test.tsx                (~5 tests)
│   │   ├── contacts/
│   │   │   ├── page.test.tsx                    (~12 tests) [app route]
│   │   │   ├── contacts-list.test.tsx           (~12 tests)
│   │   │   └── edit-contact-dialog.test.tsx     (~11 tests)
│   │   ├── monitor/
│   │   │   ├── conversation-list.test.tsx       (~12 tests)
│   │   │   ├── chat-display.test.tsx            (~12 tests)
│   │   │   └── monitor-layout.test.tsx          (~8 tests)
│   │   ├── shared/
│   │   │   └── VisitorPanel.test.tsx            (~20 tests)
│   │   ├── AppSidebar.test.tsx                  (~10 tests)
│   │   ├── NotificationBell.test.tsx            (~15 tests)
│   │   ├── SiteHeader.test.tsx                  (~4 tests)
│   │   └── auth/
│   │       └── DashboardAuthGuard.test.tsx      (~6 tests)
│   ├── design-studio/
│   │   ├── FlowEditor.test.tsx                  (~14 tests)
│   │   ├── NodePropertiesPanel.test.tsx         (~15 tests)
│   │   ├── BlockPalette.test.tsx                (~8 tests)
│   │   ├── AIPromptBar.test.tsx                 (~10 tests)
│   │   ├── DebuggerPanel.test.tsx               (~6 tests)
│   │   ├── FlowToolbar.test.tsx                 (~6 tests)
│   │   └── nodes/
│   │       └── node-components.test.tsx         (~20 tests)
│   ├── settings/
│   │   ├── OpenRouterCard.test.tsx              (~10 tests)
│   │   ├── UsageCard.test.tsx                   (~8 tests)
│   │   └── SettingsSidebar.test.tsx             (~7 tests)
│   ├── feedback/
│   │   └── FeedbackModal.test.tsx               (~10 tests)
│   ├── landing/
│   │   ├── Hero.test.tsx                        (~8 tests)
│   │   ├── FeaturesGrid.test.tsx                (~6 tests)
│   │   ├── HowItWorks.test.tsx                  (~6 tests)
│   │   ├── PricingTeaser.test.tsx               (~5 tests)
│   │   └── VideoPlayer.test.tsx                 (~7 tests)
│   ├── pricing/
│   │   └── PricingTable.test.tsx                (~8 tests)
│   ├── kb/
│   │   └── add-content-dialog.test.tsx          (~10 tests)
│   ├── activities/
│   │   └── ActivitiesDataTable.test.tsx         (~5 tests)
│   ├── LanguageSwitcher.test.tsx                (~7 tests)
│   └── FooterLanguageSwitcher.test.tsx          (~5 tests)
├── app/[locale]/dashboard/
│   ├── bots/page.test.tsx                       (→ dashboard/bots/page.test.tsx)
│   └── contacts/page.test.tsx                   (→ dashboard/contacts/page.test.tsx)
```

**Total: ~350 tests across ~25 test files**

---

### Component Test Setup Requirements

**Test Utilities Needed:**
```typescript
// test-utils.tsx — Custom render wrapper
import { render } from '@testing-library/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ClerkProvider } from '@clerk/clerk-react';

const mockConvex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function customRender(ui: React.ReactElement, options = {}) {
  return render(
    <ClerkProvider publishableKey="test_pk">
      <ConvexProvider client={mockConvex}>
        {ui}
      </ConvexProvider>
    </ClerkProvider>,
    options
  );
}

export * from '@testing-library/react';
export { customRender as render };
```

**Common Mocks:**
```typescript
// Mock Convex useQuery
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => mockData),
  useMutation: vi.fn(() => vi.fn()),
}));

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(() => ({ user: mockUser, isLoaded: true })),
  useAuth: vi.fn(() => ({ isSignedIn: true, userId: 'user_123' })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => '/en/dashboard/bots'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock i18n
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

**Why this matters:** Catches UI regressions before users see them. Provides safety net for refactoring components. Tests user behavior, not implementation details.

---

## Phase 4: E2E + Visual Tests — ⏳ TODO

**Tools:** Playwright (Chromium + Firefox + WebKit) + Playwright built-in screenshot diffing
**Philosophy:** Playwright handles what RTL *can't* — real browser rendering, CSS, responsive layouts, full user journeys, cross-browser bugs
**Estimated:** ~150 tests across 12 scenarios | **Effort:** 8-10 hours

### How Phase 3 (RTL) and Phase 4 (Playwright) complement each other

```
RTL (Phase 3)                          Playwright (Phase 4)
──────────────────────────────────     ──────────────────────────────────
✅ Form validation logic                 ✅ CSS layout + responsive design
✅ State transitions (idle→loading→ok)  ✅ Full user journeys (multi-page)
✅ Accessibility attributes (ARIA)      ✅ Real keyboard navigation + focus
✅ Error boundaries + empty states      ✅ Real network calls + Convex
✅ Mock edge cases (timeout, 500)       ✅ Cross-browser (Chrome/Firefox/Safari)
✅ ~350 tests in ~30s                   ✅ Visual diffs (screenshot comparison)
✅ jsdom (simulated DOM)                ✅ RTL Arabic rendering in real browser
                                        ✅ ~150 tests in ~5-8 min
```

**Overlap zones** (both test, different angles):
- **Accessibility** — RTL checks `aria-*` attributes exist, Playwright checks screen reader actually works
- **Keyboard nav** — RTL checks `onKeyDown` handlers, Playwright checks real Tab/Enter focus flow
- **Error states** — RTL forces error via mock, Playwright triggers real network failure
- **RTL/Arabic** — RTL checks `dir="rtl"` prop, Playwright checks text actually renders right-aligned

---

### ⏳ Step 4.1: Auth & Onboarding (~15 tests)

**`e2e/auth-onboarding.spec.ts`**
- **Sign Up** (3): Email + password → verify email sent → complete signup → land on dashboard
- **Login** (2): Valid credentials → dashboard redirect, invalid credentials → error message
- **Session** (2): Refresh page → session persists, close/reopen browser → still logged in
- **Onboarding** (3): Create org → create first bot → complete wizard, skip onboarding → welcome dashboard
- **Role Gates** (3): Admin sees all features, agent sees monitor-only, viewer sees read-only
- **Protected Routes** (2): Unauthenticated → redirect to `/login`, post-login redirect to intended page

### ⏳ Step 4.2: Widget Flow (~15 tests)

**`e2e/widget.spec.ts`**
- **Widget Load** (2): Embed on external page → renders in bottom-right, respects theme colors
- **Messaging** (4): User types → bot shows typing indicator → reply appears, send image attachment, send file attachment, empty message blocked
- **CSAT** (2): Conversation ends → rating prompt appears, submit rating → confirmation shown
- **Handoff** (3): User requests human → escalation notification → agent accepts → conversation transfers
- **Localization** (2): Widget respects project locale, Arabic → RTL layout in real browser
- **Responsive** (2): Desktop → full widget, mobile → fullscreen chat view

### ⏳ Step 4.3: Bot Builder — Canvas Interactions (~20 tests)

**`e2e/bot-builder-canvas.spec.ts`**
- **Create Bot** (3): Name + description → canvas loads with start node, publish/unpublish toggle
- **Add Nodes** (4): Click palette block → node appears on canvas, drag from palette → drop position, delete node → confirmation → removed, start node protected (cannot delete)
- **Edge Connections** (4): Drag from output handle → input handle connects, edge label shows, double-click edge → disconnects, delete node → connected edges removed
- **Node Configuration** (4): Click node → properties panel opens, fill form → save → node updates, validation error → save blocked, cancel → changes discarded
- **Save + Persist** (3): Save → success toast, reload page → all nodes/edges restored, auto-save on drag-stop
- **Flow Execution** (2): Test preview → step through nodes visually, debugger panel shows execution log

### ⏳ Step 4.4: Bot Builder — Node Types (~15 tests)

**`e2e/bot-builder-nodes.spec.ts`**
- **Reply Node** (2): Add text variations → preview cycles through them, add buttons → button types visible
- **Condition Node** (2): Set condition → true/false branches render, attribute comparison works
- **AI Task Node** (2): Write system prompt → save, model dropdown → select and save
- **Wait Node** (2): Set duration + unit → save, visual delay indicator in preview
- **HITL Handoff Node** (2): Configure escalation → department selection, handoff trigger in preview
- **WebRequest Node** (2): URL + method + headers → save, test request → response preview
- **Knowledge Base Node** (2): Select KB → save, retrieval preview in flow

### ⏳ Step 4.5: Monitor / Agent Dashboard (~15 tests)

**`e2e/monitor-dashboard.spec.ts`**
- **Conversation List** (3): Tabs (all/unread) → filter works, search → results update, click conversation → chat panel opens
- **Chat Display** (4): Send message → appears in chat, resolve conversation → status changes, assign to agent → notification sent, canned response → `/` picker works
- **Visitor Panel** (4): Click visitor → profile shows, inline edit name → save → updates, add tag → tag visible, change priority → color badge updates
- **Filters** (2): Department filter → conversations filter, label filter → results narrow
- **Responsive** (2): Desktop → 3-panel layout, mobile → single panel with list/chat toggle

### ⏳ Step 4.6: Contacts Management (~12 tests)

**`e2e/contacts.spec.ts`**
- **Create Contact** (3): Form → fill name/email/phone → submit → appears in table, validation errors → visible, cancel → form clears
- **Import** (3): Upload CSV → preview table appears, batch import → progress indicator, invalid file → error toast
- **Export** (2): Select format → file downloads, empty dataset → error message
- **Table Interactions** (4): Sort by column → order changes, search → filters results, select rows → batch actions enabled, delete contact → confirmation → removed

### ⏳ Step 4.7: Settings Pages (~12 tests)

**`e2e/settings.spec.ts`**
- **OpenRouter API Key** (3): Enter key → save → success toast, test key → "Connected" badge appears, remove key → confirmation → resets
- **Usage Metrics** (2): Progress bars show correct values, color changes at thresholds (green → amber → red)
- **Integrations** (3): WhatsApp connect → QR code appears, Telegram connect → bot token saved, enable/disable → toggle persists
- **Team Management** (2): Invite member → email sent, remove member → confirmation → removed from list
- **Language Switch** (2): Switch to Arabic → layout flips RTL, reload → preference persists

### ⏳ Step 4.8: Multi-tenancy (~12 tests)

**`e2e/multi-tenancy.spec.ts`**
- **Data Isolation** (4): Org A creates bot → Org B dashboard shows none, Org A conversation → Org B API 401, cross-org login → different data, shared KB → org-scoped entries
- **Access Control** (4): Admin Org A → can't access Org B settings, agent Org A → monitor only, viewer Org A → read-only, cross-org webhook → routed correctly
- **Billing** (2): Org A usage → doesn't affect Org B quota, plan change → per-org effect
- **Subdomain/Custom Domain** (2): Org A domain → routes to Org A, domain mismatch → 404

### ⏳ Step 4.9: Multilingual + RTL Visual (~14 tests)

**`e2e/multilingual.spec.ts`**
- **Arabic RTL** (5): Dashboard text aligns right, navigation sidebar flips to right, form inputs right-aligned, tables right-to-left, chat bubbles flip direction
- **French LTR** (2): Standard left-aligned layout, date format DD/MM/YYYY
- **Language Persistence** (3): Switch Arabic → reload → stays Arabic, switch in settings → all pages update, widget respects project locale
- **Number/Date Formatting** (2): Arabic-Indic digits (if configured), date formatting per locale
- **Mixed Content** (2): English words in Arabic text → correct bidirectional rendering, emoji in messages → no layout breakage

### ⏳ Step 4.10: Visual Regression (Screenshot Diffs) (~10 tests)

**`e2e/visual-regression.spec.ts`**
Uses Playwright's `expect(page).toHaveScreenshot()` for pixel-perfect diffs.
- **Bot Builder Canvas** (2): Empty canvas, canvas with populated flow
- **Dashboard Desktop** (2): 3-panel monitor layout at 1920px, 2-panel at 1280px
- **Dashboard Mobile** (2): Mobile monitor at 375px, mobile settings at 375px
- **Widget** (2): Desktop widget embed, mobile fullscreen widget
- **Dark Mode** (2): Dashboard dark theme, landing page dark theme (if supported)

**Why this matters:** Catches CSS regressions, responsive layout breaks, cross-browser rendering bugs, and real user journey failures that RTL's simulated DOM can't detect.

---

## Phase 5: Optional Polish — ⏳ TODO

**Tool:** k6 (performance/load testing)
**Estimated:** TBD tests | **Effort:** 2-3 hours

> **Note:** Visual regression moved to Phase 4 (Playwright screenshot diffs). No longer need Chromatic as a separate tool.

### ⏳ Step 11: Performance/Load (k6)
- ⚡ Concurrent webhook ingestion (1000 req/min sustained)
- ⚡ Real-time Convex query load (500 concurrent users subscribing)
- ⚡ AI API response time under load (< 2s p95)
- ⚡ Rate limiter effectiveness (verify throttling at threshold)
- ⚡ Memory leak detection during sustained load
- ⚡ Database connection pool exhaustion testing

**Why this matters:** Catches performance regressions before they impact users in production.

---

## Execution Order & Dependencies

```
Phase 1 (✅ DONE)
    ↓
Phase 2 (Webhook/API) ← No dependencies, can run independently
    ↓
Phase 3 (RTL Components) ← Requires Phase 1 for utility function coverage
    ↓
Phase 4 (Playwright E2E + Visual) ← Benefits from Phase 3 but can start in parallel
    ↓
Phase 5 (k6 Load) ← Optional, run in parallel with any phase
```

## Test Run Commands

| Command | What it does |
|---------|-------------|
| `bun test` | Run Vitest in watch mode (Phase 1 + 2 + 3) |
| `bun test:run` | Run Vitest once (CI mode) |
| `bun test:coverage` | Run Vitest with coverage report |
| `npx vitest run --config vitest.convex.config.ts` | Run Convex backend tests only |
| `npx playwright test` | Run Playwright E2E + visual tests |
| `npx playwright test --project=chromium` | Run on Chromium only (faster) |
| `npx playwright test --ui` | Interactive UI mode for debugging tests |
| `npx playwright test --update-snapshots` | Update visual regression baselines |

## Installed Testing Skills

| Skill | Purpose | Used In |
|-------|---------|---------|
| `vitest` (483 installs) | Core Vitest patterns | Phase 1, 2, 3 |
| `vitest-testing` (254 installs) | Vitest-specific patterns | Phase 1, 2, 3 |
| `react-testing-library` (258 installs) | Component testing | Phase 3 |
| `playwright-e2e-testing` (2K installs) | E2E test patterns | Phase 4 |
| `api-contract-testing` (316 installs) | API contract validation | Phase 2 |
| `typescript-unit-testing` (190 installs) | Advanced TS testing | Phase 1 |
| `javascript-testing-patterns` (28 installs) | Modern JS testing | All phases |

---

## Progress Tracker

| Phase | Status | Tests Written | Tests Passing | Coverage |
|-------|--------|--------------|---------------|----------|
| Phase 1 | ✅ DONE | ~202 | ~202 | 89.4% |
| Phase 2 | ✅ DONE | ~204 | ~204 | 89.4% |
| Phase 3 (RTL) | ✅ DONE | ~1,050 | ~1,050 | — |
| Phase 4 (Playwright) | ⏳ TODO | 0 | — | — |
| Phase 5 (k6) | ⏳ TODO | 0 | — | — |
| **Total** | | **1,456** | **1,456** | **89.4%** |

---

**Last Updated:** Saturday, April 4, 2026
**Next Step:** Phase 4 — E2E + Visual Tests (Playwright)
