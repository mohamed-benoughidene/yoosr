# Conversation Events Logging — Spec (O-1)

## Goal
Log what happens to each conversation so analytics can accurately split
bot-handled vs agent-handled conversations and track resolution sources.

## Scope

IN:
- Log an event when a conversation is resolved
- Log an event when a HITL handoff occurs (bot hands off to agent)
- `getConversationVolume` query updated to use events for bot vs agent split
- Basic events timeline in the contact info panel (Monitor)

OUT:
- Full conversation audit trail / activity log (separate feature)
- Events for every status change
- Frontend timeline UI beyond a simple list in the contact panel

## Schema Changes

Table `conversation_events` already exists in schema.ts with:
- projectId: v.id("projects")
- conversationId: v.id("conversations")
- handledBy: "bot" | "agent"
- closed: boolean
- createdAt: number

No schema changes needed — verify fields match above during audit.

## Backend

### Internal Mutation: `logConversationEvent`
- Args: projectId, conversationId, handledBy ("bot"|"agent"), closed (boolean)
- No auth check needed — internal only
- Inserts a record into conversation_events with createdAt: Date.now()

### Integration points
1. Resolve via agent (Monitor three-dot menu or Send as Resolved):
   - Call logConversationEvent with handledBy: "agent", closed: true
   - Location: conversations.ts resolve mutation or equivalent

2. HITL handoff block in bot.ts:
   - Call logConversationEvent with handledBy: "bot", closed: false
   - Signals that bot handed off to a human — conversation was bot-handled
     up to this point

3. Bot resolves conversation directly (if any block does this):
   - Call logConversationEvent with handledBy: "bot", closed: true

### Query: `getConversationEvents(conversationId)`
- Authenticated query
- Returns all events for a conversation ordered by createdAt asc
- Returns: array of { handledBy, closed, createdAt }

## Frontend

Add a small "Events" section at the bottom of the contact info panel in
Monitor. Shows a simple chronological list:
- Bot handled — [relative time]
- Resolved by agent — [relative time]
- etc.

Only render if events array is non-empty.

## Acceptance Criteria

1. Resolving a conversation from Monitor logs an event with
   handledBy: "agent", closed: true
2. HITL handoff block in bot.ts logs an event with
   handledBy: "bot", closed: false
3. getConversationEvents returns correct events in order
4. Monitor contact info panel shows the events list when events exist
5. No existing resolve or HITL functionality is broken

## Dependencies
- conversation_events table confirmed in schema.ts
- Resolve mutation location confirmed during audit
- HITL block location in bot.ts confirmed during audit

## Tasks

### Task 1 — Audit
Confirm schema, resolve mutation, and HITL block location.

### Task 2 — logConversationEvent mutation
Implement the internal mutation in a new or existing convex file.

### Task 3 — Wire resolve
Call logConversationEvent from the resolve mutation.

### Task 4 — Wire HITL handoff
Call logConversationEvent from the HITL block in bot.ts.

### Task 5 — getConversationEvents query
Implement the query.

### Task 6 — Frontend events list
Add the events section to the Monitor contact info panel.