# Audit Report: Convex Schema and HTTP Routes

This audit provides a snapshot of the current state of the Convex backend configuration in the `yoosr` project.

## 1. Conversations Table Audit (`convex/schema.ts`)

| Category | Finding |
| :--- | :--- |
| **Full list of fields** | `projectId`, `visitorId`, `visitorName`, `assignedTo`, `status`, `lastMessage`, `resolvedBy`, `visitorEmail`, `visitorPhone`, `visitorAddress`, `visitorNote`, `unreadCount`, `rating`, `feedback`, `updatedAt`, `currentNodeId`, `botStepCount`, `executionLog`, `botId`, `leadId`, `firstText`, `participants`, `tags`, `attributes`, `typing`, `botPaused`, `handoffSource`, `departmentId`, `priority`, `firstResponseAt`, `slaDeadline` |
| **All indexes** | `by_projectId (["projectId"])`, `by_projectId_status (["projectId", "status"])` |
| **Existence of `channel`** | No |
| **Existence of `channelSenderId`** | No |

## 2. Messages Table Audit (`convex/schema.ts`)

| Category | Finding |
| :--- | :--- |
| **Full list of fields** | `conversationId`, `projectId`, `senderType`, `senderId`, `content`, `attachments`, `channel`, `senderFullname`, `status`, `type` |
| **Existence of `channelMessageId`** | No |

## 3. Orders Table Audit (`convex/schema.ts`)

- **Status**: Not found.
- The `orders` table does not exist in `convex/schema.ts`.

## 4. Integrations Table Audit (`convex/schema.ts`)

| Category | Finding |
| :--- | :--- |
| **All fields** | `projectId`, `provider`, `credentials`, `enabled` |
| **Credential Storage** | Stored as a generic `v.optional(v.any())` field, intended for JSON-encoded data or encrypted tokens. |
| **Existence of `page_id`** | No (not explicitly defined as a schema field). |
| **Existence of `access_token`** | No (not explicitly defined as a schema field). |

## 5. File Audit: `convex/orders.ts`

- **Status**: Not found.
- The file `convex/orders.ts` does not exist in the project.

## 6. HTTP Router Audit (`convex/http.ts`)

- **File Existence**: Yes, `convex/http.ts` exists.
- **Registered Routes**:

| Method | Path | Description |
| :--- | :--- | :--- |
| POST | `/clerk-webhook` | Clerk user sync |
| POST | `/widget/conversations` | Create conversation from widget |
| POST | `/widget/messages` | Send message from widget |
| OPTIONS | `/widget/conversations` | CORS Preflight |
| OPTIONS | `/widget/messages` | CORS Preflight |
| OPTIONS | `/widget/project` | CORS Preflight |
| OPTIONS | `/widget/conversations/get` | CORS Preflight |
| OPTIONS | `/widget/conversations/rate` | CORS Preflight |
| GET | `/widget/project` | Fetch project config for widget |
| GET | `/widget/conversations/get` | Fetch single conversation public data |
| POST | `/widget/conversations/rate` | Rate a conversation (CSAT) |
| GET | `/widget/conversations` | Find existing conversation for visitor |
| GET | `/widget/messages` | Fetch messages for a conversation |

- **Existence of `/webhooks/meta`**: No, the `/webhooks/meta` route is not registered.

---

*Audit performed on: 2026-03-05*
