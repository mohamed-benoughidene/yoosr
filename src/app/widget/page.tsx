"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

// Types
type Message = {
    id: string
    content: string
    sender_type: "user" | "agent" | "visitor"
    created_at: string
}

type ProjectConfig = {
    primaryColor: string
    translations: {
        headerTitle: string
        welcomeMessage: string
    }
    logoUrl?: string
    // Added for new requirements
    welcomeDelay?: number // in seconds
    enableWelcomeNotification?: boolean
}

export default function WidgetPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get("projectId")
    const supabase = createClient()

    // State
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [guestId, setGuestId] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null)

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 1. Initialize Guest & Config
    useEffect(() => {
        if (!projectId) return

        const initWidget = async () => {
            // A. Get or Create Guest ID
            let storedGuestId = localStorage.getItem("yoosr_guest_id")
            if (!storedGuestId) {
                const newId = uuidv4()
                localStorage.setItem("yoosr_guest_id", newId)
                storedGuestId = newId
            }
            setGuestId(storedGuestId)

            // B. Fetch Project Config
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("widget_config, name")
                .eq("id", projectId)
                .single()

            if (project?.widget_config) {
                setProjectConfig(project.widget_config as ProjectConfig)
            }

            // C. Find or Create Conversation
            // Try to find existing active conversation for this guest
            const { data: conversations } = await supabase
                .from("conversations")
                .select("id")
                .eq("project_id", projectId)
                .eq("visitor_id", storedGuestId)
                .order("updated_at", { ascending: false })
                .limit(1)

            let convId = conversations?.[0]?.id

            if (!convId) {
                // We'll create conversation on first message or now? 
                // Let's create it on first message to avoid empty spam, 
                // BUT for real-time subscription we need an ID or we subscribe to filtering by visitor_id.
                // Subscribing by visitor_id is safer if no convo exists yet.
                // Actually, if we want to receive agent messages, the agent needs a conversation to reply TO.
                // So efficient flow: 
                // 1. User sees "Welcome".
                // 2. User types message -> Create Conversation -> Send Message.
            } else {
                setConversationId(convId)
                // Fetch history
                const { data: msgs } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", convId)
                    .order("created_at", { ascending: true })

                if (msgs) setMessages(msgs as any)
            }

            setIsLoading(false)
        }

        initWidget()
    }, [projectId, supabase])

    // 2. Real-time Subscription
    useEffect(() => {
        if (!conversationId) return

        const channel = supabase
            .channel(`widget-convo-${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Dedup: If we already have this ID (from optimistic update), don't add duplicate
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    // Scroll to bottom
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, supabase])

    // 3. Handle Auto-Open / Welcome Delay
    useEffect(() => {
        if (!projectConfig?.welcomeDelay || !projectConfig?.enableWelcomeNotification) return;

        // If we already have messages, maybe don't auto-open? 
        // Or if the user has already seen it? 
        // For now, let's just respect the config.

        const timer = setTimeout(() => {
            // Post message to parent to open
            window.parent.postMessage({ type: 'yoosr:auto_open' }, "*")
        }, projectConfig.welcomeDelay * 1000)

        return () => clearTimeout(timer)
    }, [projectConfig])


    // 4. Send Message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !projectId || !guestId) return

        const content = inputValue.trim()
        setInputValue("")

        // Optimistic UI Update with generated ID
        const tempId = uuidv4()
        const optimisticMsg: Message = {
            id: tempId,
            content: content,
            sender_type: "visitor", // Fix: Guest sees their own messages (visitor) on the right
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)

        try {
            let targetConversationId = conversationId

            // If no conversation exists, create one
            if (!targetConversationId) {
                const { data: newConvo, error: createError } = await supabase
                    .from("conversations")
                    .insert({
                        project_id: projectId,
                        visitor_id: guestId,
                        status: "open",
                        unread_count: 1, // Agent sees 1 unread
                        last_message: content
                    })
                    .select("id")
                    .single()

                if (createError) throw createError
                targetConversationId = newConvo.id
                setConversationId(targetConversationId)
            }

            // Insert Message using the generated ID
            const { error: msgError } = await supabase
                .from("messages")
                .insert({
                    id: tempId, // Use the same ID as optimistic UI
                    conversation_id: targetConversationId,
                    content: content,
                    sender_type: "visitor", // Fix: Guests send as visitor
                    sender_id: null
                })

            if (msgError) {
                // Rollback optimistic update on error
                setMessages(prev => prev.filter(m => m.id !== tempId))
                throw msgError
            }

            // Update conversation last_message
            await supabase
                .from("conversations")
                .update({
                    last_message: content,
                    updated_at: new Date().toISOString(),
                    unread_count: 1
                })
                .eq("id", targetConversationId)

        } catch (error) {
            console.error("Failed to send message", error)
            toast.error("Failed to send message")
            // Rollback optimistic update on general error
            setMessages(prev => prev.filter(m => m.id !== tempId))
        }
    }

    if (!projectId) return <div className="p-4 text-center">Missing Project ID</div>

    const primaryColor = projectConfig?.primaryColor || "#000000"
    const headerTitle = projectConfig?.translations?.headerTitle || "Chat Support"
    const welcomeMessage = projectConfig?.translations?.welcomeMessage || "How can we help?"

    return (
        <div className="flex flex-col h-screen bg-background border rounded-xl overflow-hidden shadow-xl sm:rounded-none sm:shadow-none">
            {/* Header */}
            <div
                className="p-4 text-primary-foreground flex items-center gap-3 shrink-0"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {projectConfig?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={projectConfig.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                        <MessageSquare className="w-6 h-6" />
                    )}
                </div>
                <div>
                    <h1 className="font-semibold text-base">{headerTitle}</h1>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                        Online
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-900 relative">
                <ScrollArea className="h-full px-4 py-4">
                    {messages.length === 0 && (
                        <div className="flex gap-2 items-end mb-4 animate-in fade-in slide-in-from-left-2">
                            <div className="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center overflow-hidden">
                                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none text-sm shadow-sm border max-w-[85%]">
                                {welcomeMessage}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex mb-4 w-full",
                                msg.sender_type === "visitor" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm max-w-[85%] shadow-sm",
                                    msg.sender_type === "visitor"
                                        ? "rounded-br-none text-white"
                                        : "bg-white dark:bg-zinc-800 rounded-bl-none border"
                                )}
                                style={msg.sender_type === "visitor" ? { backgroundColor: primaryColor } : {}}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 bg-muted/50 border-0 focus-visible:ring-1"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputValue.trim()}
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground">
                        Powered by <span className="font-semibold">Yoosr</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
