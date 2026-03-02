# Audit Report: Conversation Transfer Message Generation

This audit investigates how "Conversation transferred" messages are generated, stored, and displayed within the Yoosr platform.

## 1. Message Generation (Frontend)

The transfer message text is generated on the client-side within the React components.

| Component | File Path | Line | Message Template |
| :--- | :--- | :--- | :--- |
| `ChatArea` | `src/components/chat/ChatArea.tsx` | 162 | ``content: `Conversation transferred to ${agentName}` `` |
| `ChatArea` | `src/components/chat/ChatArea.tsx` | 181 | ``content: `Conversation transferred to ${departmentName}` `` |
| `ChatDisplay` | `src/components/dashboard/monitor/chat-display.tsx` | 244 | ``content: `Conversation transferred to ${agentName}` `` |
| `ChatDisplay` | `src/components/dashboard/monitor/chat-display.tsx` | 263 | ``content: `Conversation transferred to ${departmentName}` `` |

## 2. Agent Name Resolution

The `agentName` variable is derived from Clerk Organization membership data using the `useOrganization` hook.

### Data Mapping Implementation:
```tsx
const { memberships } = useOrganization({ memberships: { infinite: true, pageSize: 50 } })

const projectMembers = (memberships?.data ?? []).map(m => ({
    userId: m.publicUserData.userId,
    profile: {
        fullName: `${m.publicUserData.firstName ?? ''} ${m.publicUserData.lastName ?? ''}`.trim() || m.publicUserData.identifier,
        avatarUrl: m.publicUserData.imageUrl,
    },
    role: m.role,
}))
```

When a transfer is initiated, the `fullName` is passed to the `handleTransfer` function:
`onClick={() => handleTransfer(m.userId, m.profile?.fullName || 'Agent')}`

## 3. Backend Implementation (Convex)

The frontend calls the `api.messages.send` mutation. The backend does not modify the message string; it simply inserts the content as provided by the client.

### Message Mutation (`convex/messages.ts`):
```typescript
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(), // The pre-built string from the frontend
        senderType: v.string(), // Sent as "bot" for system messages
        senderId: v.optional(v.string()),
        attachments: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // ... validation logic ...
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: conversation.projectId,
            senderType: args.senderType,
            senderId: args.senderId,
            content: args.content,
            attachments: args.attachments,
        });
        // ... post-insert updates ...
    }
});
```

## 4. Agent Profile Infrastructure

While the transfer message uses Clerk data directly, the system maintains a local `profiles` table in Convex for high-performance lookups (e.g., in the conversation list view).

### Schema Definition (`convex/schema.ts`):
```typescript
profiles: defineTable({
    userId: v.string(), // Clerk user ID
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
}).index("by_userId", ["userId"]),
```

### Sync Mechanism (`convex/http.ts`):
Profiles are kept in sync via Clerk webhooks:
1. Clerk fires `user.created` or `user.updated` to `/clerk-webhook`.
2. Convex runs `internal.profiles.upsertFromClerk`.
3. The local `profiles` table is updated with the latest Clerk metadata.

## 5. Summary of Findings

1. **Generation**: Messages are hardcoded templates on the frontend.
2. **Resolution**: Names are pulled from the `useOrganization` hook (Clerk) at the moment of transfer.
3. **Storage**: Stored as plain text in the `messages` table with `senderType: "bot"`.
4. **Consistency**: Since the name is "baked" into the message string at creation time, it will not update if the agent changes their name later.
