# Yoosr — Outstanding Work Tracker

> Source: codebase inventory audit (March 2026).
> Mark items done by changing `[ ]` to `[x]`.
> Every item includes the exact file, function, and fix so it can be handed directly to an agent.

---

## Legend

| Symbol | Meaning |
|---|---|
| 🔴 Critical | Security hole — fix before any public exposure |
| 🟠 High | Data leak or correctness bug — fix before launch |
| 🟡 Medium | Scale or reliability gap — fix before growth |
| 🔵 Low | Code quality / cleanup — fix when convenient |
| ⬜ Schema Only | Table exists in schema, backend + UI not built |
| 🟤 Partial | Backend exists but incomplete or UI missing |

---

## Section 1 — Security Issues

| Done | # | Severity | File | Function(s) | Issue | Fix |
|---|---|---|---|---|---|---|
| [x] | S-1 | 🔴 Critical | `convex/botFlows.ts` | `save` | Auth check is commented out — any unauthenticated caller can overwrite any bot flow | Uncomment or re-add `if (!identity) throw new Error("Unauthenticated")` at the top of the function |
| [X] | S-2 | 🔴 Critical | `convex/bot.ts` | `executeNextBlock` (code_action handler) | Uses `new Function(...)` to evaluate user-provided expressions — arbitrary code execution risk | Replace with `expr-eval` library. Import `Parser` from `expr-eval`, call `parser.evaluate(expression, variables)` instead of `new Function` |
| [X] | S-3 | 🟠 High | `convex/knowledgeBases.ts` | `get`, `create`, `addSource`, `removeSource` | No org check — any authenticated user can read or modify any KB by ID | After resolving `projectId`, verify it belongs to `identity.org_id` via `projects` table lookup |
| [X] | S-4 | 🟠 High | `convex/bots.ts` | `get` | No org check — any authenticated user can read any bot by ID | Same pattern as S-3: resolve projectId → verify orgId matches identity |
| [X] | S-5 | 🟠 High | `convex/contacts.ts` | `update`, `findByConversation` | No org check — any authenticated user can update or read any contact | Resolve projectId from the record and verify against `identity.org_id` |
| [X] | S-6 | 🟠 High | `convex/tags.ts` | `assignTagToConversation`, `removeTagFromConversation` | No org check — any authenticated user can tag any conversation | Resolve projectId from the conversation record and verify against `identity.org_id` |
| [X] | S-7 | 🟠 High | `convex/analytics.ts` | `getConversationStats`, `getVisitorStats`, `getMessageStats`, `getConversationVolume`, `getTokenUsage`, `getCSATSummary`, `getTagsSummary`, `getSLABreachRate`, `getProjectUsage` | Identity is checked for existence but the requested `projectId` is never verified to belong to the caller's org | Add: fetch the project by `projectId`, assert `project.orgId === identity.org_id`, throw if mismatch |
| [x] | S-8 | 🟡 Medium | `convex/profiles.ts` | `getByUserId` | No auth or org check — any caller can query any agent profile by userId | Add `await ctx.auth.getUserIdentity()` check; optionally restrict cross-org reads |
| [X] | S-9 | 🟡 Medium | `convex/http.ts` | `createFromWidget`, `sendFromWidget` (HTTP routes) | No rate limiting — widget endpoints are open to abuse and spam | Implement token-bucket or sliding-window rate limiting at the HTTP handler level using visitor IP or `visitorId` as key |

---

## Section 2 — Performance & Reliability Issues

| Done | # | Severity | File | Function(s) | Issue | Fix |
|---|---|---|---|---|---|---|
| [ ] | P-1 | 🟠 High | `convex/projects.ts` | `remove` | Cascade delete calls `.collect()` on 15+ tables sequentially — will timeout on projects with real data | Rewrite as a scheduled job: on delete, set `project.status = "deleting"`, then batch-delete tables in separate scheduled mutations using `.take(100)` loops |
| [X] | P-2 | 🟡 Medium | `convex/analytics.ts` | All stat queries | All queries use `.take(500)` as a hard cap — analytics will silently undercount once a project has >500 records in any window | Replace with Convex paginated aggregation or server-side aggregation actions that loop until exhausted. Mark with `TODO: paginated` comment in the meantime |
| [X] | P-3 | 🟡 Medium | `convex/knowledgeBases.ts` | `remove` | `.collect()` on KB sources — moderate risk on KBs with many sources | Replace with `.take(100)` loop inside a scheduled deletion job |
| [x] | P-4 | 🔵 Low | `convex/projects.ts` | `list` | `.collect()` on all projects for an org — low risk now but unbounded | Replace with `.take(50)` — no org will have more than a handful of projects |

---

## Section 3 — Code Quality Issues

| Done | # | Severity | File | Function(s) | Issue | Fix |
|---|---|---|---|---|---|---|
| [X] | Q-1 | 🔵 Low | `convex/labels.ts` + `convex/settings.ts` | `listLabels` (both files) | Duplicate function with identical logic | Delete the copy in `settings.ts`, update any imports to point to `labels.ts` |
| [X] | Q-2 | 🔵 Low | `convex/diagnostic.ts` | `getBotFlow` | Uses `.collect()` on all bot_flows globally — diagnostic-only but dangerous if called | Add a hard guard comment: `// DIAGNOSTIC ONLY — never call from production code` and add a throw if called outside dev environment |
| [X] | Q-3 | 🔵 Low | `convex/migrations.ts` | `migrateStatuses` | `.collect()` on all conversations globally — one-time migration script | Add a guard that throws if called more than once (check a `migrations` flag table or delete the function after migration is confirmed done) |

---

## Section 4 — Partial Features

These features have backend logic but are missing functionality or a UI layer.

| Done | # | Feature | Status | What Exists | What's Missing | Files to Touch |
|---|---|---|---|---|---|---|
| [ ] | F-1 | Messenger / Instagram channel | 🟤 Partial | Credentials stored in `integrations` table. Schema and credential save/load exist. | HTTP endpoint for incoming messages (like the Telegram handler in `http.ts`). Message parsing and conversation creation from Messenger/Instagram payloads. | `convex/http.ts` — add POST handler for Messenger webhook. `convex/integrations.ts` — add credential validation action. |
| [X] | F-2 | Webhook delivery — retry + log | 🟤 Partial | Outbound webhook subscriptions exist. HMAC-signed delivery fires on events. | No retry on delivery failure. No delivery log table (`webhook_deliveries`). Failures are silently dropped. | `convex/webhooks.ts` — wrap delivery in try/catch, schedule retry with backoff. Add `webhook_deliveries` table to `schema.ts` to log each attempt (url, statusCode, success, timestamp). |
| [X] | F-3 | Notifications — push + email | 🟤 Partial | In-app notification system fully built (create/list/read/clear, auto-trim, 7-day cron). | No push notification delivery (browser push or mobile). No email notification on new conversation or assignment. | New action in `convex/notifications.ts` or a dedicated `convex/notificationDelivery.ts`. Requires choosing a push/email provider. |
| [ ] | F-4 | Feedback admin view | 🟤 Partial | Feedback submission form at `/feedback`. `feedback` table stores all submissions (orgId, type, message, submitter). | No dashboard page to read submitted feedback. Agents and admins have no way to view submissions from inside the app. | Add a read-only page under `app/dashboard/settings/feedback` (or similar). Wire to a new `list` query in a `feedback.ts` Convex file. |
| [X] | F-5 | PDF source in Knowledge Base | 🟤 Partial | KB source pipeline supports `type: "file"`. Text is extracted and chunked for embedding. | PDF files are read as raw bytes — no PDF text extraction. Only plain text files work correctly. | Add `pdf-parse` (or `pdfjs-dist`) to extract text from PDF buffers before chunking. Handle in the KB source processing action in `convex/knowledgeBases.ts`. |
| [X] | F-6 | CSAT analytics UI | 🟤 Partial | `csat_ratings` table exists. `submitCSAT` mutation is called from the widget. `getCSATSummary` query exists in `analytics.ts`. | No CSAT breakdown UI on the analytics dashboard page. CSAT data is collected but never displayed. | Add a CSAT section to `app/dashboard/analytics/page.tsx`. Display average rating, distribution bar (1–5 stars), and recent comments. |

---

## Section 5 — Schema-Only Features

These have a fully defined schema but no backend mutations/queries and no UI built.

| Done | # | Feature | Tables | What's Needed | Priority |
|---|---|---|---|---|---|
| [X] | O-1 | Conversation Events logging | `conversation_events` (`projectId`, `conversationId`, `handledBy`, `closed`, `createdAt`) | Mutations to log events on conversation resolve and HITL handoff. Query to retrieve events per conversation for timeline view. | Medium — needed for accurate bot vs agent analytics split |
| [X] | O-2 | Project usage / billing quotas | `project_usage` (`projectId`, `tokensConsumed`, `conversationsCount`, `billingCycleStart`) | Mutations to increment `tokensConsumed` after every OpenRouter call and `conversationsCount` on new conversation. Query for usage dashboard. Enforcement logic when quota is exceeded. | Medium — needed before charging customers |

---

## Section 6 — Deferred Paginated Aggregation TODOs

These were explicitly deferred to post-launch during Audit 4. All are low urgency until real data volume becomes an issue.

| Done | # | File | Function(s) | Issue | Fix |
|---|---|---|---|---|---|
| [x] | A-1 | `convex/analytics.ts` | `getConversationStats` | `.take(500)` cap — undercounts total conversations and by-status breakdown on large projects | Rewrite as an action using `ctx.runQuery` in a paginated loop, accumulating counts until cursor is exhausted |
| [x] | A-2 | `convex/analytics.ts` | `getVisitorStats` | `.take(500)` cap — undercounts unique visitors and today's visitors | Same paginated loop pattern as A-1 |
| [x] | A-3 | `convex/analytics.ts` | `getMessageStats` | `.take(500)` cap — undercounts total messages and agent/visitor breakdown | Same paginated loop pattern as A-1 |
| [X] | A-4 | `convex/analytics.ts` | `getConversationVolume` | `.take(500)` cap — daily volume time-series buckets will miss data beyond 500 conversations | Paginated loop accumulating per-day buckets into a Map before returning |
| [X] | A-5 | `convex/analytics.ts` | `getTokenUsage` | `.take(500)` cap — token usage grouped by model undercounts once project exceeds 500 token_usage records | Paginated loop accumulating per-model totals into a Map |
| [X] | A-6 | `convex/analytics.ts` | `getTagsSummary` | `.take(500)` cap — top tags chart misses conversations beyond the cap | Paginated loop accumulating tag frequency into a Map, then sort and slice top N |
| [ ] | A-7 | `convex/conversations.ts` | `autoCloseInactive` | Processes at most 500 conversations per cron run — stale conversations beyond the cap are never auto-closed | Add a loop: re-schedule self via `ctx.scheduler.runAfter(0)` if the batch returned a full page |
| [ ] | A-8 | `convex/bots.ts` | `remove` | Cascade deletion of bot flows may timeout on bots with many flows | Rewrite as a scheduled job: mark bot as `deleting`, then delete flows in batches of 100 via `ctx.scheduler.runAfter` |

---

## Summary

| Category | Total | Done |
|---|---|---|
| Security issues | 9 | 9 |
| Performance issues | 4 | 3 |
| Code quality | 3 | 3 |
| Partial features | 6 | 3 |
| Schema-only features | 2 | 2 |
| Deferred aggregation TODOs | 8 | 6 |
| **Total** | **32** | **26** |

---

## Agent Prompt Template

When handing an item to Antigravity, use this structure:

```
Read AGENT.md first.

Fix item [ID] from OUTSTANDING_WORK.md:

Issue: [paste the Issue column]
File: [paste the File column]
Function(s): [paste the Function(s) column]
Fix: [paste the Fix column]

Do not change anything else.
Apply the find-bugs and code-review skills.
```
