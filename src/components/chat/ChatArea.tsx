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
    const isResolved = conversation?.status === "resolved"

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
                                msg.senderType === "bot"
                                    ? "justify-center"
                                    : msg.senderType === "agent"
                                        ? "justify-end"
                                        : "justify-start"
                            )}
                        >
                            {msg.senderType === "bot" ? (
                                <div className="px-4 py-2 rounded-lg max-w-[85%] border border-dashed border-muted-foreground/30 bg-muted/30 text-center">
                                    <p className="text-xs text-muted-foreground italic">{msg.content}</p>
                                    <span className="text-[10px] mt-1 block text-muted-foreground/60">
                                        {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "p-3 rounded-lg max-w-[70%]",
                                        msg.senderType === "agent"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <span
                                        className={cn(
                                            "text-[10px] mt-1 block",
                                            msg.senderType === "agent"
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                    </span>
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
