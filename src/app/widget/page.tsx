"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || ""

function playBeep() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.frequency.value = 800
        oscillator.type = "sine"
        gain.gain.value = 0.3
        oscillator.start()
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        oscillator.stop(ctx.currentTime + 0.3)
    } catch {
        /* AudioContext not supported */
    }
}

interface Message {
    _id: string
    content: string
    senderType: string
    senderId?: string
    attachments?: any
    _creationTime: number
}

async function apiPost(endpoint: string, body: Record<string, unknown>) {
    const res = await fetch(`${CONVEX_SITE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    return res.json()
}

async function apiGet(endpoint: string, params: Record<string, string>) {
    const url = new URL(`${CONVEX_SITE_URL}${endpoint}`)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString())
    return res.json()
}

export default function WidgetPage() {
    const [projectId, setProjectId] = useState<string | null>(null)
    const [visitorId, setVisitorId] = useState<string>("")
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [projectConfig, setProjectConfig] = useState<any>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const prevMessageCountRef = useRef<number>(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const welcomeShownRef = useRef(false)

    // Create audio element for notifications
    useEffect(() => {
        const audio = new Audio("/notification.mp3")
        audio.volume = 0.5
        audioRef.current = audio
        return () => { audioRef.current = null }
    }, [])

    // Extract projectId from search params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const pid = urlParams.get("projectId")
        if (pid) {
            setProjectId(pid)
        } else {
            setError("No projectId provided")
            setLoading(false)
        }

        const stored = localStorage.getItem("yoosr_visitor_id")
        if (stored) {
            setVisitorId(stored)
        } else {
            const vid = "visitor_" + Math.random().toString(36).slice(2, 11)
            localStorage.setItem("yoosr_visitor_id", vid)
            setVisitorId(vid)
        }
    }, [])

    // Fetch project config
    useEffect(() => {
        if (!projectId) return
        apiGet("/widget/project", { projectId }).then((data) => {
            setProjectConfig(data)
        }).catch(() => { /* ignore */ })
    }, [projectId])

    // Welcome message after delay
    useEffect(() => {
        if (!projectConfig || welcomeShownRef.current) return

        const config = projectConfig?.widgetConfig
        const enableWelcome = config?.enableWelcomeNotification ?? true
        const delay = (config?.welcomeDelay ?? 3) * 1000
        const welcomeMsg = config?.translations?.welcomeMessage || "Hi there! How can we help you?"

        if (!enableWelcome) return

        const timer = setTimeout(() => {
            if (!welcomeShownRef.current) {
                welcomeShownRef.current = true
                setMessages(prev => {
                    if (prev.length > 0) return prev
                    return [{
                        _id: "welcome_" + Date.now(),
                        content: welcomeMsg,
                        senderType: "bot",
                        _creationTime: Date.now(),
                    }]
                })
                // Notify parent for unread badge
                try {
                    window.parent.postMessage({ type: "yoosr:new_message" }, "*")
                } catch { /* ignore */ }
            }
        }, delay)

        return () => clearTimeout(timer)
    }, [projectConfig])

    // Find or create conversation
    useEffect(() => {
        if (!projectId || !visitorId) return

        async function init() {
            try {
                const existing = await apiGet("/widget/conversations", {
                    projectId: projectId!,
                    visitorId,
                })

                if (existing && existing._id) {
                    setConversationId(existing._id)
                } else {
                    // Don't create conversation until first message
                }
            } catch (e) {
                setError("Failed to connect. Please try again.")
            }
            setLoading(false)
        }

        init()
    }, [projectId, visitorId])

    // Poll for messages
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return
        try {
            const msgs = await apiGet("/widget/messages", { conversationId })
            if (Array.isArray(msgs)) {
                const prevCount = prevMessageCountRef.current
                if (prevCount > 0 && msgs.length > prevCount) {
                    const newMsgs = msgs.slice(prevCount)
                    const hasAgentMessage = newMsgs.some((m: Message) => m.senderType === "agent" || m.senderType === "bot")
                    if (hasAgentMessage) {
                        // Play notification sound
                        try {
                            audioRef.current?.play().catch(() => playBeep())
                        } catch {
                            playBeep()
                        }
                        // Notify parent (widget.js) for badge
                        try {
                            window.parent.postMessage({ type: "yoosr:new_message" }, "*")
                        } catch { /* ignore */ }
                    }
                }
                prevMessageCountRef.current = msgs.length
                setMessages(msgs)
                welcomeShownRef.current = true // Don't show welcome if real messages exist
            }
        } catch {
            /* silently fail on poll */
        }
    }, [conversationId])

    useEffect(() => {
        if (!conversationId) return
        fetchMessages()
        pollRef.current = setInterval(fetchMessages, 2000)
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [conversationId, fetchMessages])

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const ensureConversation = async (): Promise<string | null> => {
        if (conversationId) return conversationId
        if (!projectId) return null
        try {
            const result = await apiPost("/widget/conversations", {
                projectId,
                visitorName: "Visitor",
                visitorId,
            })
            const newId = result.conversationId
            setConversationId(newId)
            return newId
        } catch {
            setError("Failed to create conversation")
            return null
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const text = input.trim()
        setInput("")

        // Optimistic update
        setMessages((prev) => [
            ...prev,
            {
                _id: "temp_" + Date.now(),
                content: text,
                senderType: "visitor",
                senderId: visitorId,
                _creationTime: Date.now(),
            },
        ])

        const convId = await ensureConversation()
        if (!convId) return

        try {
            await apiPost("/widget/messages", {
                conversationId: convId,
                content: text,
                visitorId,
            })
            fetchMessages()
        } catch {
            setError("Failed to send message")
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const convId = await ensureConversation()
        if (!convId) return

        // For now, send file name as message (full upload requires Convex file storage endpoint)
        const text = `📎 ${file.name}`
        setMessages((prev) => [
            ...prev,
            {
                _id: "temp_file_" + Date.now(),
                content: text,
                senderType: "visitor",
                senderId: visitorId,
                _creationTime: Date.now(),
            },
        ])

        try {
            await apiPost("/widget/messages", {
                conversationId: convId,
                content: text,
                visitorId,
            })
            fetchMessages()
        } catch {
            setError("Failed to send attachment")
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Read widget config
    const widgetConfig = projectConfig?.widgetConfig
    const widgetColor = widgetConfig?.primaryColor || "#6366f1"
    const widgetTitle = widgetConfig?.translations?.headerTitle || projectConfig?.name || "Chat with us"
    const onlineStatus = widgetConfig?.translations?.onlineStatus || "We typically reply within a few minutes"
    const logoUrl = widgetConfig?.logoUrl || ""

    if (error && !conversationId) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div
                style={{ backgroundColor: widgetColor }}
                className="px-4 py-3 text-white flex items-center gap-3 shadow-sm"
            >
                {logoUrl && (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                )}
                <div className="flex-1">
                    <h1 className="text-sm font-semibold">{widgetTitle}</h1>
                    <p className="text-xs opacity-80">{onlineStatus}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Connecting...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Send a message to start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderType === "bot"
                                    ? "justify-center"
                                    : msg.senderType === "visitor"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                        >
                            {msg.senderType === "bot" ? (
                                <div className="max-w-[85%] rounded-lg px-3 py-2 text-center" style={{ backgroundColor: "#f9fafb", border: "1px dashed #d1d5db" }}>
                                    <span className="text-xs text-gray-500 italic">{msg.content}</span>
                                </div>
                            ) : (
                                <div
                                    className="max-w-[80%] rounded-lg px-3 py-2 text-sm"
                                    style={
                                        msg.senderType === "visitor"
                                            ? { backgroundColor: widgetColor, color: "#fff" }
                                            : { backgroundColor: "#f3f4f6", color: "#1f2937" }
                                    }
                                >
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2 flex gap-2 items-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    title="Attach file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </button>
                <input
                    type="text"
                    className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    style={{ backgroundColor: widgetColor }}
                    className="text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
