"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, Smile, Loader2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { Database } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Message = Database["public"]["Tables"]["messages"]["Row"]

export function ChatArea() {
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId")
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!conversationId) {
            setMessages([])
            return
        }

        const fetchMessages = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true })

            if (error) {
                console.error("Error fetching messages:", error)
            } else {
                setMessages(data || [])
            }
            setIsLoading(false)
        }

        fetchMessages()

        const channel = supabase
            .channel(`conversation-${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    setMessages((prev) => [...prev, newMessage])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !conversationId) return

        setIsSending(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const { error } = await supabase.from("messages").insert({
                conversation_id: conversationId,
                content: inputValue,
                sender_type: "user",
                sender_id: user.id
            })

            if (error) throw error

            setInputValue("")

            // Update conversation last_message
            await supabase
                .from("conversations")
                .update({
                    last_message: inputValue,
                    updated_at: new Date().toISOString()
                })
                .eq("id", conversationId)

        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setIsSending(false)
        }
    }

    if (!conversationId) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                Select a conversation to start chatting
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center h-[73px] p-4 border-b">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">Visitor</div>
                        <div className="text-xs text-muted-foreground">Online</div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex",
                                msg.sender_type === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-lg max-w-[70%]",
                                    msg.sender_type === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span
                                    className={cn(
                                        "text-[10px] mt-1 block",
                                        msg.sender_type === "user"
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="grid gap-4">
                    <Textarea
                        className="p-4 min-h-[100px]"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Smile className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button size="sm" onClick={handleSendMessage} disabled={isSending || !inputValue.trim()}>
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
