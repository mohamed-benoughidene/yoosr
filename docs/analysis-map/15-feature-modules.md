# Part 15: Feature Modules

## 📊 Visual Map

```
Feature Domains
├── User Management
│   ├── Authentication    → Clerk integration (Part 07)
│   ├── Profiles          → User profiles
│   └── Settings          → User preferences
│
├── Bot/AI Features
│   ├── Bot Management    → Bot CRUD
│   ├── Flow Builder      → AI conversation flows
│   ├── AI Integration    → OpenRouter/OpenAI
│   └── Conversations     → Chat interface
│
├── Contact Management
│   ├── Contacts          → Contact CRUD
│   └── Tags/Labels       → Organization
│
├── Project Management
│   ├── Projects          → Project CRUD
│   └── Analytics         → Project insights
│
├── Messaging
│   ├── Messages          → Message CRUD
│   └── Conversations     → Thread management
│
├── Notifications
│   ├── Push              → Web push notifications
│   └── In-app            → Notification center
│
├── Orders/Commerce
│   └── Orders            → Order management
│
└── Integrations
    └── Third-party       → External service connections
```

## 📁 File Inventory

| File/Directory | Purpose |
|----------------|---------|
| `convex/bots.ts`, `convex/botFlows.ts` | Bot feature |
| `convex/aiFlowBuilder.ts` | AI flow building |
| `convex/contacts.ts` | Contact management |
| `convex/conversations.ts`, `convex/messages.ts` | Messaging feature |
| `convex/projects.ts` | Project management |
| `convex/notifications.ts`, `convex/push*.ts` | Notifications |
| `convex/orders.ts` | Order management |
| `convex/integrations.ts` | Third-party integrations |
| `convex/openrouter.ts`, `convex/openrouter_api.ts` | AI integration |
| `src/app/` feature routes | Frontend feature pages |

## ✅ Analysis Checklist

- [ ] What are the main feature domains?
- [ ] How is each feature structured? (frontend + backend)
- [ ] Are features isolated or coupled?
- [ ] What's the AI/ML integration approach?
- [ ] How does the bot flow builder work?
- [ ] What external services are integrated?
- [ ] How are web push notifications implemented?
- [ ] Is there feature flagging?
- [ ] How are feature-specific errors handled?
- [ ] Are features independently testable?
- [ ] What's the data flow for each feature?
- [ ] Are there shared feature utilities?
- [ ] How are feature permissions handled?
- [ ] Is there analytics/telemetry per feature?

## 🔗 Dependencies

- **Depends on:** Part 04-08 (backend), Part 09-14 (frontend)
- **Connected to:** Part 16 (testing), Part 18 (documentation)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Feature organization philosophy
- AI/ML integration patterns
- External service integration approach
- Notification system architecture
- Feature isolation level

## ⚠️ Potential Concerns to Watch For

- Tightly coupled features
- Missing feature tests
- No error handling for external services
- Hard-coded API keys for integrations
- Missing rate limiting for AI calls
- No fallback for feature failures
- Inconsistent feature structures
- Missing user feedback for async operations
