# Part 15: Feature Modules

## 📊 Visual Map

```
Feature Domains
├── User Management
│   ├── Authentication    → Clerk integration (Part 07)
│   ├── Profiles          → User profiles
│   └── Settings          → User preferences (src/app/[locale]/dashboard/settings)
│
├── Bot/AI Features
│   ├── Bot Management    → Bot CRUD (convex/bots.ts, convex/botFlows.ts)
│   ├── Flow Builder      → AI conversation flows (convex/aiFlowBuilder.ts)
│   ├── AI Integration    → OpenRouter (convex/openrouter.ts)
│   └── Knowledge Base    → KB tracking (convex/knowledge*.ts)
│
├── Contact Management
│   ├── Contacts          → Contact CRUD (convex/contacts.ts)
│   └── Tags/Labels       → Organization (convex/tags.ts, convex/labels.ts)
│
├── Project Management
│   ├── Projects          → Project CRUD (convex/projects.ts)
│   └── Analytics         → Project insights (convex/analytics.ts, convex/activityLogs.ts)
│
├── Messaging & Chat
│   ├── Messages          → Message CRUD (convex/messages.ts)
│   └── Conversations     → Thread management (convex/conversations.ts)
│
├── Notifications
│   ├── Push              → Web push notifications (convex/pushActions.ts, convex/pushMutations.ts)
│   └── In-app            → Notification center (convex/notifications.ts)
│
├── Orders/Commerce
│   └── Orders            → Order management (convex/orders.ts)
│
└── Integrations
    ├── Third-party       → External service connections (convex/integrations.ts)
    └── Webhooks          → Webhook processing (convex/webhooks.ts)
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `convex/bots.ts`, `convex/botFlows.ts` | Bot feature management and flow logic |
| `convex/aiFlowBuilder.ts` | AI flow building using OpenRouter API |
| `convex/contacts.ts`, `convex/tags.ts`, `convex/labels.ts` | Contact management, tagging, and labeling |
| `convex/conversations.ts`, `convex/messages.ts` | Messaging, routing, and conversation threading |
| `convex/projects.ts`, `convex/analytics.ts`, `convex/activityLogs.ts` | Project management, analytics, and telemetry |
| `convex/notifications.ts`, `convex/pushActions.ts`, `convex/pushMutations.ts` | Notifications center and web push handlers |
| `convex/orders.ts` | Order management and CRUD |
| `convex/integrations.ts`, `convex/webhooks.ts` | Third-party integrations (WhatsApp, Telegram, Messenger, Instagram) |
| `convex/openrouter.ts`, `convex/openrouter_api.ts` | AI platform integration (OpenRouter/OpenAI) |
| `src/app/[locale]/dashboard/*` | Frontend feature pages (bots, chat, contacts, kb, settings, etc.) |

## ✅ Analysis Checklist

- [x] What are the main feature domains?
  - The main domains align with the directory and schema structure: Bot/AI Management, Messaging/Chat, Contact Management, Projects & Analytics, Integrations/Webhooks, Settings/Preferences, Knowledge Base, and Orders. These clearly map to specific directories under `src/app/[locale]/dashboard/` and distinct backend files under `convex/`.
- [x] How is each feature structured? (frontend + backend)
  - Backend features are structured procedurally by domain in `convex/` (e.g., `convex/bots.ts`). Each file exports Convex query, mutation, internalQuery, action, and internalMutation functions specific to its domain. The frontend is localized and nested in the Next.js `app` router, e.g., `src/app/[locale]/dashboard/[feature]`, which interacts with the Convex backend via hooks.
- [x] Are features isolated or coupled?
  - They are loosely isolated by schema collection but logically coupled in application flows. For example, `convex/bots.ts` depends on `convex/activityLogs.ts` to log actions. Integrations (`convex/integrations.ts`) handle both configuration and channel-specific nuances (like Telegram, WhatsApp tokens) dynamically with encryption utilities.
- [x] What's the AI/ML integration approach?
  - It utilizes OpenRouter to tap into AI models like OpenAI or localized LLMs (`convex/openrouter.ts`, `convex/openrouter_api.ts`). Specifically, the `aiFlowBuilder.ts` generates JSON architectures of dialog trees out of natural language descriptions.
- [x] How does the bot flow builder work?
  - `convex/aiFlowBuilder.ts` executes an OpenRouter task via `callAITask(SYSTEM_PROMPT, args.prompt, "openrouter/free")`. The prompt translates plain language descriptions into React Flow nodes and edges (e.g., node types like `start`, `reply`, `condition`, `code_action`) and returns strict JSON which is loaded into the interface.
- [x] What external services are integrated?
  - Aside from OpenRouter, multiple messaging and social channel integrations exist: Telegram, Meta platforms (WhatsApp, Messenger, Instagram). These are actively managed in `convex/integrations.ts` using external webhooks and encryption arrays for `access_token` and `bot_token`.
- [x] How are web push notifications implemented?
  - Web push is split into actions and mutations via `convex/pushActions.ts` and `convex/pushMutations.ts`, separating the subscription/state modifications via Web Push subscriptions and the asynchronous delivery of push event payloads.
- [x] Is there feature flagging?
  - There does not appear to be an active, global feature flagging system. The schema enforces what is available and features operate by DB availability or permission checks rather than explicitly managed global or environmental flags.
- [x] How are feature-specific errors handled?
  - Error classes are universally defined in `convex/errors.ts` (e.g. `authError`, `notFoundError`, `forbiddenError`, `userError`). The backend throws these gracefully, which the frontend can catch. For example, missing entities trigger `notFoundError("Integration")`.
- [x] Are features independently testable?
  - It's unclear solely from their files since testing artifacts aren't physically linked to features (e.g., no `bots.test.ts` neighboring the files). The modular approach per file (`convex/orders.ts`, `convex/bots.ts`) allows straightforward unit testing by creating synthetic `ctx` mocks if configured.
- [x] What's the data flow for each feature?
  - Standard Client-to-Convex workflow. Client uses hooks (`useQuery`, `useMutation`) -> Request goes to Convex edge function -> Permission validation occurs (e.g., `requireAdmin`, `checkProjectOwnership`) -> DB operations apply -> Optional `activityLogs` mutation runs concurrently -> Reactive state pushes updates back to clients.
- [x] Are there shared feature utilities?
  - Yes, primarily located in `convex/utils.ts` (for permission wrappers like `requireAdmin`), `convex/errors.ts` for unified operational errors, and `convex/lib/` for generic abstractions like `convex/lib/crypto.ts` applied generally across integrations.
- [x] How are feature permissions handled?
  - Permissions restrict requests predominantly at the top of Convex functions by calling `ctx.auth.getUserIdentity()`, followed by invoking util checks like `requireAdmin()` and `checkProjectOwnership()`. For actions with secret encryption (`integrations.ts`), an admin checks precede modifications.
- [x] Is there analytics/telemetry per feature?
  - Yes. Modifying functions natively ping `convex/activityLogs.ts` (`logActivityInternal`) documenting `actorId`, `action`, `targetType`, and `metadata`. There is also a standalone `convex/analytics.ts` file handling dashboard metric aggregates.

## 📝 Agent Findings

### **Consistent Backend Patterns**
Features strictly organize as file-based endpoints in (`convex/`). They reliably validate identities first, perform operations, and follow up by logging via `activityLogs` internally. 

### **Comprehensive Integration Architecture**
`convex/integrations.ts` demonstrates a robust multi-channel schema handling WhatsApp, Messenger, Instagram, and Telegram with distinct encryption/decryption models for application secrets via `convex/lib/crypto.ts`. Webhook parsing occurs systematically.

### **Innovative AI Integration**
AI is not merely utilized for chat completions, but also generative tooling. `aiFlowBuilder.ts` employs LLMs through OpenRouter to automatically convert spoken intents into structural JSON matching React Flow UI elements (`edges`, `nodes`) natively mapped to `start`, `reply`, and `condition` node rules.

## 🔍 Key Patterns to Identify

- **Feature organization philosophy**: Domain-centric structure on both frontend and backend. Convex functions export queries and mutations per conceptual table/service.
- **AI/ML integration patterns**: Abstracting AI requests into explicit internal tooling via `callAITask`, specifically building conversational graph schemas via JSON prompt-injection for React Flow.
- **External service integration approach**: Direct integrations utilizing encrypted key storage at rest within the Convex backend, and Webhook ingestion routing.
- **Notification system architecture**: Decoupled Web Push notifications into internal state handlers (`Mutations`) and remote API delivery mechanisms (`Actions`).
- **Feature isolation level**: Features are structurally isolated by file space but operationally dependent on underlying primitives (`utils.ts`, `activityLogs.ts`, `errors.ts`).

## ⚠️ Potential Concerns to Watch For

- **Missing local feature tests**: (MEDIUM) No visibly co-located unit test files found next to complex features like `integrations.ts` or `botFlows.ts`.
- **Tightly coupled activity logging**: (LOW) Almost all operational updates explicitly invoke `activityLogs`. If this mutator errors or delays, it introduces trace risk or lag per module operation.
- **Hard restrictions on AI generation format**: (MEDIUM) OpenRouter JSON responses inside `aiFlowBuilder.ts` depend on simple regex `try/catch` and stripping markdown to find outputs. If the LLM drifts in formatting, the builder will crash.
- **No generic Feature Flagging infrastructure**: (LOW) For an app possessing complex integration domains and beta features (like AI flow builders), there appears to be no unified toggle mapping context.
