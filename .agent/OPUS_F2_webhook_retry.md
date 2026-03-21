# Opus Planning Prompt — F-2: Webhook Delivery Retry + Log

> Paste this entire prompt to Opus. It will read the relevant files and produce an implementation spec.
> Save the output. Claude will then write the Flash/Pro implementation prompts from it.

---

## Prompt

You are planning the addition of retry logic and a delivery log to the outbound webhook system for a Convex-based SaaS platform called Yoosr.

## Context

Yoosr fires outbound webhooks to customer-configured URLs when platform events occur (conversation created, message sent, conversation resolved, etc.). The platform uses:
- Convex for backend, scheduled jobs, and database
- HMAC-SHA256 signatures on all outbound webhook payloads
- `webhook_subscriptions` table: `projectId`, `url`, `events[]`, `secret`, `isActive`

## Current state

- `convex/webhooks.ts` → `fireWebhookEvent` internalAction: fires a signed POST to each active subscription URL for a given event
- If the HTTP POST fails (non-2xx or network error), the failure is silently dropped — no retry, no log
- There is no `webhook_deliveries` table or any record of what was sent

## What to do

Read the following files in full before producing your plan:
- `convex/webhooks.ts` — the full `fireWebhookEvent` action and all supporting functions
- `convex/schema.ts` — the `webhook_subscriptions` table definition
- `convex/crons.ts` — how existing scheduled jobs are registered

## What to produce

Output a complete implementation spec in this format:

```
## F-2 — Webhook Retry + Delivery Log Spec

### Current fireWebhookEvent behavior
[What it does today — how it fetches subscriptions, builds payload, signs and fires]

### Proposed delivery log schema
[New table: webhook_deliveries — all fields, types, and indexes needed]

### Retry strategy
[Exact retry logic:
  - How many attempts maximum
  - Backoff schedule (attempt 1 delay, attempt 2 delay, attempt 3 delay)
  - What counts as a failure (non-2xx, timeout, network error)
  - What counts as a permanent failure (stop retrying)
  - How retries are scheduled in Convex (ctx.scheduler.runAfter)]

### Delivery log write strategy
[When and how to write to webhook_deliveries:
  - On first attempt
  - On retry attempt
  - On final failure
  - Fields to record per attempt]

### New or modified functions
[List each function: name, type (internalMutation/internalAction/query), file, purpose]

### Dashboard UI for delivery log
[What to show in the webhooks settings page:
  - Per-subscription delivery history
  - Fields to display (timestamp, event, status, statusCode, attempt number)
  - How many records to show
  - Any manual retry button]

### Implementation order
[Numbered sequence]
```

Do not write any code yet. Produce only the spec.
