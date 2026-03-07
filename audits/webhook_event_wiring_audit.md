# Webhook Event Wiring Audit

## Objective
The goal of this audit was to identify all backend locations calling `fireWebhookEvent` and determine which lifecycle events are currently implemented vs. missing.

## Current Call Inventory

| File Path | Function Name | Event String | Notes |
| :--- | :--- | :--- | :--- |
| `convex/messages.ts` | `send` | `message.create` | Fired when an agent or visitor sends a message. |
| `convex/messages.ts` | `sendFromWidget` | `message.create` | Fired for public widget visitor messages. |
| `convex/messages.ts` | `sendMessage` | `message.create` | Fired for agent monitor replies (non-internal). |
| `convex/conversations.ts` | `createFromWidget` | `message.create` | Specifically fires for the **initial message** sent by a visitor on creation. |

## Lifecycle Event Status

Based on the requested events and the schema examples, here is the implementation status:

| Event Name | Wired? | Recommended Trigger Point |
| :--- | :--- | :--- |
| `message.create` | ✅ **Yes** | Fully implemented in message-sending mutations. |
| `conversation.opened` | ❌ **No** | Should be in `conversations.ts:create` or `createFromWidget`. |
| `conversation.closed` | ❌ **No** | Should be in `conversations.ts:resolve` or `autoCloseInactive`. |
| `contact.created` | ❌ **No** | Should be in `contacts.ts:create` or `conversations.ts:createFromWidget`. |
| `agent.assigned` | ❌ **No** | Should be in `conversations.ts:update` or `routing.ts:routeConversation`. |
| `request.close` | ❌ **No** | Likely redundant with `conversation.closed`. |

## Key Findings
- **High Coverage for Messages**: Every mutation that creates a text-based message correctly schedules the `fireWebhookEvent`.
- **Missing Lifecycle Hooks**: There are currently no webhooks fired for conversation status changes (open/close) or agent assignments. These are high-value events for third-party helpdesk integrations.
- **Redundant Schema Comments**: `request.close` is listed in the `schema.ts` comments as an example but is not used in the code.
