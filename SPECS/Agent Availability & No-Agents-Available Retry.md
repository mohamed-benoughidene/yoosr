# Agent Availability & Routing Retry — Spec

## Goal
Ensure no conversation is silently stuck unassigned: notify agents when
routing fails, and re-route waiting conversations when an agent comes online.

## Scope

IN:
- Fire notifications to all org agents when routing finds zero available agents
- Re-route unassigned conversations when an agent sets themselves online
- Periodic cron safety net: re-attempt routing for conversations stuck
  unassigned longer than 5 minutes
- Availability toggle UI in the dashboard (if not already present)

OUT:
- Changing the heartbeat/presence detection mechanism (already works)
- SLA timers (separate feature)
- Email/push notifications (in-app only)

## Schema Changes
None. `notifications` table already exists. `profiles.isAvailable` already
exists. `by_orgId_isAvailable` compound index already added.

## Backend

### B-1: routeConversation — notify on no agents
In `routing.ts:routeConversation`, after the branch where no available agents
are found and conversation is set to status 100:
- Query all profiles for the org (using `by_orgId` index, `.take(100)`)
- Call `createNotification` (internal) for each profile with:
  - type: "unassigned_conversation"
  - title: "New unassigned conversation"
  - body: visitor name or "Anonymous visitor"
  - conversationId: the conversation ID

### B-2: setAvailability — trigger re-route on online
In `profiles.ts:setAvailability`, after marking `isAvailable: true`:
- Schedule an internal action via `ctx.scheduler.runAfter(0, ...)`
- That action queries conversations with status 100 and no `assignedTo`
  for the project linked to this agent's org
- For each unassigned conversation, call `routeConversation`

### B-3: Re-route cron
In `crons.ts`, add a new cron every 5 minutes:
- Calls a new `internalMutation: retryUnassignedConversations`
- In `conversations.ts` or `routing.ts`: finds all status-100 conversations
  with no `assignedTo` and `updatedAt` older than 5 minutes
- For each, calls `routeConversation`
- Cap at `.take(50)` to avoid unbounded work

## Frontend

### F-1: Availability toggle UI
A toggle in the dashboard (sidebar or header) that calls `setAvailability`.
Shows current online/offline status. Need to audit whether this already
exists before building.

## Acceptance Criteria
1. When a conversation is created and no agents are online, all agents in
   the org receive an in-app notification with the conversation linked
2. When an agent toggles themselves online, any unassigned open conversations
   in their project are automatically routed
3. A cron runs every 5 minutes and routes any conversations that have been
   unassigned for more than 5 minutes (if agents are available)
4. The availability toggle is visible and functional in the dashboard UI
5. Toggling offline stops new conversations from being routed to that agent

## Dependencies
- `createNotification` internalMutation (confirmed exists in notifications.ts)
- `by_orgId_isAvailable` index (confirmed added)
- `routeConversation` internalMutation (confirmed exists in routing.ts)

## Tasks
Sequential — one per implementation prompt.

1. B-1: Notify all agents in routeConversation when no agents available
2. B-2: Trigger re-route action when setAvailability(true) is called
3. B-3: Add retryUnassignedConversations cron (every 5 min)
4. F-1: Audit availability toggle UI — then build if missing