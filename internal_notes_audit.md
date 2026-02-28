# Internal Notes Audit Report

## 1. Widget Message Fetching Logic
The customer-facing widget fetches messages via the `/widget/messages` HTTP endpoint, which calls the `listPublic` internal query.

**File:** `convex/messages.ts`
```typescript
// Internal: list messages for widget (no auth required)
export const listPublic = internalQuery({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    },
});
```

**Observation:** This function **does NOT** filter out internal messages. It return all messages in the conversation, including those marked as `type: "internal"`. This is a potential data leak to the visitor-facing widget.

---

## 2. Monitor `getMessages` Query
This query is used by the `chat-display` component in the monitor section.

**File:** `convex/messages.ts`
```typescript
// Get messages for the monitor view (Chat display)
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Sort ascending by creation time
        messages.sort((a, b) => a._creationTime - b._creationTime);

        return messages.map((m) => {
            const isInternal = m.type === "internal"; // Using 'type' for internal notes, based on schema
            return {
                id: m._id,
                content: m.content,
                senderType: m.senderType, // "visitor" | "agent" | "bot"
                createdAt: m._creationTime,
                isInternal: isInternal,
            };
        });
    },
});
```

**Observation:** This query explicitly identifies internal messages using `m.type === "internal"` and returns them as `isInternal: true`. It does not filter them out, as monitor agents are expected to see them.

---

## 3. Chat Section Component (not monitor)
This is the `ChatArea` component used in the main Chat section.

**File:** `src/components/chat/ChatArea.tsx`
```tsx
"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Send, Smile, Loader2, CheckCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"

export function ChatArea() {
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null
    const { user } = useUser()
    const [inputValue, setInputValue] = useState("")
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Real-time messages — no subscriptions needed!
    const messages = useQuery(
        api.messages.list,
        conversationId ? { conversationId } : "skip"
    )

    // Get conversation details for resolve status
    const conversation = useQuery(
        api.conversations.get,
        conversationId ? { id: conversationId } : "skip"
    )

    const sendMessage = useMutation(api.messages.send)
    const resolveConversation = useMutation(api.conversations.resolve)
    const markAsRead = useMutation(api.conversations.markAsRead)

    // Mark conversation as read when opened
    useEffect(() => {
        if (conversationId && conversation && (conversation.unreadCount ?? 0) > 0) {
            markAsRead({ id: conversationId })
        }
    }, [conversationId, conversation, markAsRead])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !conversationId || !user) return

        setIsSending(true)
        const content = inputValue
        setInputValue("") // Clear immediately

        try {
            await sendMessage({
                conversationId,
                content,
                senderType: "agent",
                senderId: user.id,
            })
        } catch (error) {
            console.error("Error sending message:", error)
            setInputValue(content) // Restore on error
        } finally {
            setIsSending(false)
        }
    }

    const handleResolve = async () => {
        if (!conversationId) return
        try {
            await resolveConversation({ id: conversationId })
        } catch (error) {
            console.error("Error resolving conversation:", error)
        }
    }

    if (!conversationId) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                Select a conversation to start chatting
            </div>
        )
    }

    const isLoading = messages === undefined
    const isResolved = conversation?.status === 1000

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center h-[73px] p-4 border-b">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>
                            {(conversation?.visitorName ?? "V").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">{conversation?.visitorName || "Visitor"}</div>
                        <div className="text-xs text-muted-foreground">
                            {isResolved ? "Resolved" : "Online"}
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {isResolved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                        </Badge>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResolve}
                            className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                        >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Resolve
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (messages ?? []).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    (messages ?? []).map((msg) => (
                        <div
                            key={msg._id}
                            className={cn(
                                "flex",
                                msg.senderType === "agent"
                                    ? "justify-end"
                                    : "justify-start"
                            )}
                        >
                            {msg.senderType === "agent" ? (
                                <div className="p-3 rounded-lg max-w-[70%] bg-primary text-primary-foreground">
                                    <p className="text-sm">{msg.content}</p>
                                    <span className="text-[10px] mt-1 block text-primary-foreground/70">
                                        {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex gap-2 max-w-[70%]">
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarFallback className={cn("text-xs", msg.senderType === "bot" && "bg-primary/20 text-primary")}>
                                            {msg.senderType === "bot" ? "AI" : (msg.senderFullname ?? "V").substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="text-xs text-muted-foreground ml-1 mb-1 block">
                                            {msg.senderFullname || (msg.senderType === "bot" ? "AI Assistant" : "Visitor")}
                                        </span>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm">{msg.content}</p>
                                            <span className="text-[10px] mt-1 block text-muted-foreground">
                                                {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="grid gap-4">
                    <Textarea
                        className="p-4 min-h-[100px]"
                        placeholder={isResolved ? "This conversation is resolved" : "Type your message..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isResolved}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" disabled={isResolved}>
                                <Smile className="h-4 w-4" />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || !conversationId || !user) return
                                    setIsSending(true)
                                    try {
                                        await sendMessage({
                                            conversationId,
                                            content: `📎 ${file.name}`,
                                            senderType: "agent",
                                            senderId: user.id,
                                        })
                                    } catch (error) {
                                        console.error("Error sending attachment:", error)
                                    } finally {
                                        setIsSending(false)
                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                    }
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isResolved}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button size="sm" onClick={handleSendMessage} disabled={isSending || !inputValue.trim() || isResolved}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
```

**Observation:** This component uses `api.messages.list` which returns all messages. However, it **does NOT** have any UI to toggle internal messages, nor does it visually distinguish them. They would appear as regular agent messages if sent.

---

## 4. Messages Table Definition (Schema)
**File:** `convex/schema.ts`
```typescript
    // Messages within conversations
    messages: defineTable({
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        senderType: v.string(), // "visitor" | "agent" | "bot"
        senderId: v.optional(v.string()),
        content: v.string(),
        attachments: v.optional(v.any()), // JSON array
        // Legacy fields
        channel: v.optional(v.string()),
        senderFullname: v.optional(v.string()),
        status: v.optional(v.number()),
        type: v.optional(v.string()),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_projectId", ["projectId"])
        .index("by_projectId_senderType", ["projectId", "senderType"]),
```

**Observation:** The schema uses an optional `type` field to distinguish message types (e.g., `"internal"`).

---

## 5. Search Results for "isInternal" and "internal"

### Mentions of `isInternal` in `convex/messages.ts`
- **Line 189**: `const isInternal = m.type === "internal";` (In `getMessages` query)
- **Line 195**: `isInternal: isInternal,` (In `getMessages` query return map)
- **Line 207**: `isInternal: v.boolean(),` (In `sendMessage` mutation args)
- **Line 222**: `type: args.isInternal ? "internal" : "text",` (In `sendMessage` mutation insertion)
- **Line 231**: `if (!args.isInternal) { ... }` (Used to avoid updating `lastMessage` for internal notes)
- **Line 253**: `if (!args.isInternal) { ... }` (Used to avoid firing webhooks for internal notes)

---

## Summary Findings
- **Data Leak**: The public widget endpoint (`listPublic`) does not filter out `type: "internal"` messages.
- **UI Inconsistency**: The main "Chat" section (`ChatArea.tsx`) does not support or distinguish internal notes, unlike the "Monitor" chat (`chat-display.tsx`).
- **Logic**: Internal notes are correctly prevented from updating the conversation's `lastMessage` and from firing outbound webhooks.
