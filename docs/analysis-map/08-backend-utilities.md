# Part 08: Backend Utilities & Helpers

## 📊 Visual Map

```
convex/
├── utils.ts               → Shared utility functions
├── lib/                   → Library/helper modules
├── convex.config.ts       → Convex configuration
├── http.ts                → HTTP endpoint handlers
├── crons.ts               → Scheduled/cron jobs
├── openrouter.ts          → OpenRouter API integration
├── openrouter_api.ts      → OpenRouter API utilities
├── aiFlowBuilder.ts       → AI flow building logic
├── getAny.ts              → Generic data fetchers
└── _generated/            → Auto-generated Convex code (DO NOT EDIT)
```

## 📁 File Inventory

| File | Purpose |
|------|---------|
| `convex/utils.ts` | Shared utility functions for backend |
| `convex/lib/` | Library modules and helper functions |
| `convex/convex.config.ts` | Convex instance configuration |
| `convex/http.ts` | HTTP API endpoints (webhooks, external integrations) |
| `convex/crons.ts` | Scheduled/cron job definitions |
| `convex/openrouter.ts` | OpenRouter (AI model) integration |
| `convex/openrouter_api.ts` | OpenRouter API utilities |
| `convex/aiFlowBuilder.ts` | AI flow building logic |
| `convex/getAny.ts` | Generic data fetching utilities |

## ✅ Analysis Checklist

- [ ] What utility functions exist in `utils.ts`?
- [ ] Are utilities reusable and well-organized?
- [ ] What's in the `lib/` directory?
- [ ] How are external API calls structured? (OpenRouter, etc.)
- [ ] Is there error handling for API failures?
- [ ] Are there retry mechanisms?
- [ ] What HTTP endpoints are exposed?
- [ ] How are webhooks handled?
- [ ] What cron jobs are defined?
- [ ] Are scheduled tasks idempotent?
- [ ] How is rate limiting implemented? (`@convex-dev/rate-limiter`)
- [ ] What's the AI integration pattern?
- [ ] Are there caching patterns for external API calls?
- [ ] How are API keys and secrets managed?
- [ ] Is there logging/monitoring infrastructure?

## 🔗 Dependencies

- **Depends on:** Part 04 (schema), Part 01 (dependencies)
- **Connected to:** Part 05 (queries), Part 06 (mutations), Part 15 (features)

## 📝 Agent Findings

<!-- Fill in during analysis -->

## 🔍 Key Patterns to Identify

- Utility function organization
- External API integration patterns
- Error handling strategies
- Retry and resilience patterns
- Rate limiting approach
- Cron job patterns

## ⚠️ Potential Concerns to Watch For

- Hard-coded API keys or secrets
- No error handling for external API failures
- Missing rate limiting
- No retry logic for transient failures
- Tightly coupled utilities
- No logging or monitoring
- Cron jobs without idempotency
- Exposed sensitive data in logs
- No timeout handling for API calls
