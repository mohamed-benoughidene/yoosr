"use client"

import { useReducer, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { RatingComponent } from "../rating-component"
import { PreChatForm } from "./PreChatForm"
import { useTranslations } from "next-intl"

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
    type?: string
    senderId?: string
    senderName?: string
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


interface ChatState {
    projectId: string | null;
    visitorId: string;
    conversationId: string | null;
    messages: Message[];
    input: string;
    loading: boolean;
    error: string | null;
    projectConfig: any;
    conversationStatus: number;
    showRating: boolean;
    showPreChat: boolean;
    preChatData: { name: string, email?: string, phone?: string } | null;
}

type ChatAction = 
    | { type: "SET_PROJECT_ID", payload: string | null }
    | { type: "SET_VISITOR_ID", payload: string }
    | { type: "SET_CONVERSATION_ID", payload: string | null }
    | { type: "SET_MESSAGES", payload: Message[] | ((prev: Message[]) => Message[]) }
    | { type: "SET_INPUT", payload: string }
    | { type: "SET_LOADING", payload: boolean }
    | { type: "SET_ERROR", payload: string | null }
    | { type: "SET_PROJECT_CONFIG", payload: any }
    | { type: "SET_CONVERSATION_STATUS", payload: number }
    | { type: "SET_SHOW_RATING", payload: boolean }
    | { type: "SET_SHOW_PRE_CHAT", payload: boolean }
    | { type: "SET_PRE_CHAT_DATA", payload: { name: string, email?: string, phone?: string } | null }

const initialState: ChatState = {
    projectId: null,
    visitorId: "",
    conversationId: null,
    messages: [],
    input: "",
    loading: true,
    error: null,
    projectConfig: null,
    conversationStatus: 100,
    showRating: false,
    showPreChat: false,
    preChatData: null,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "SET_PROJECT_ID": return { ...state, projectId: action.payload }
        case "SET_VISITOR_ID": return { ...state, visitorId: action.payload }
        case "SET_CONVERSATION_ID": return { ...state, conversationId: action.payload }
        case "SET_MESSAGES": return {
            ...state,
            messages: typeof action.payload === 'function' ? action.payload(state.messages) : action.payload
        }
        case "SET_INPUT": return { ...state, input: action.payload }
        case "SET_LOADING": return { ...state, loading: action.payload }
        case "SET_ERROR": return { ...state, error: action.payload }
        case "SET_PROJECT_CONFIG": return { ...state, projectConfig: action.payload }
        case "SET_CONVERSATION_STATUS": return { ...state, conversationStatus: action.payload }
        case "SET_SHOW_RATING": return { ...state, showRating: action.payload }
        case "SET_SHOW_PRE_CHAT": return { ...state, showPreChat: action.payload }
        case "SET_PRE_CHAT_DATA": return { ...state, preChatData: action.payload }
        default: return state;
    }
}

export default function WidgetChat() {
    const t = useTranslations("widget")
    const [state, dispatch] = useReducer(chatReducer, initialState)
    const {
        projectId, visitorId, conversationId, messages, input, loading, error,
        projectConfig, conversationStatus, showRating, showPreChat, preChatData
    } = state

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
            dispatch({ type: "SET_PROJECT_ID", payload: pid })
        } else {
            dispatch({ type: "SET_ERROR", payload: t("noProjectId") })
            dispatch({ type: "SET_LOADING", payload: false })
        }

        const stored = localStorage.getItem("yoosr_visitor_id")
        if (stored) {
            dispatch({ type: "SET_VISITOR_ID", payload: stored })
        } else {
            const vid = "visitor_" + Math.random().toString(36).slice(2, 11)
            localStorage.setItem("yoosr_visitor_id", vid)
            dispatch({ type: "SET_VISITOR_ID", payload: vid })
        }
    }, [t])

    // Fetch project config
    useEffect(() => {
        if (!projectId) return
        apiGet("/widget/project", { projectId }).then((data) => {
            dispatch({ type: "SET_PROJECT_CONFIG", payload: data })
        }).catch(() => { /* ignore */ })
    }, [projectId])

    // Welcome message after delay
    useEffect(() => {
        if (!projectConfig || welcomeShownRef.current) return

        const config = projectConfig?.widgetConfig
        const enableWelcome = config?.enableWelcomeNotification ?? true
        const delay = (config?.welcomeDelay ?? 3) * 1000
        const welcomeMsg = t("system.welcome") || config?.translations?.welcomeMessage

        if (!enableWelcome) return

        const timer = setTimeout(() => {
            if (!welcomeShownRef.current) {
                welcomeShownRef.current = true
                dispatch({ type: "SET_MESSAGES", payload: prev => {
                    if (prev.length > 0) return prev
                    return [{
                        _id: "welcome_" + Date.now(),
                        content: welcomeMsg,
                        senderType: "bot",
                        _creationTime: Date.now(),
                    }]
                }})
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
        if (!projectId || !visitorId || !projectConfig) return

        async function init() {
            try {
                const existing = await apiGet("/widget/conversations", {
                    projectId: projectId!,
                    visitorId,
                })

                if (existing && existing._id) {
                    dispatch({ type: "SET_CONVERSATION_ID", payload: existing._id })
                    dispatch({ type: "SET_CONVERSATION_STATUS", payload: existing.status || 100 })
                    if (existing.status === 1000 && !existing.rating) {
                        dispatch({ type: "SET_SHOW_RATING", payload: true })
                    }
                } else {
                    // Don't create conversation until first message
                    // Show Pre-chat form if configured and no data yet
                    const enablePreChat = projectConfig.widgetConfig?.preChatFormEnabled ?? true
                    if (!preChatData && enablePreChat) {
                        dispatch({ type: "SET_SHOW_PRE_CHAT", payload: true })
                    }
                }
            } catch (e) {
                dispatch({ type: "SET_ERROR", payload: t("failedToConnect") })
            }
            dispatch({ type: "SET_LOADING", payload: false })
        }

        init()
    }, [projectId, visitorId, projectConfig, t, preChatData])

    // Poll for messages
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return
        try {
            // Also check conversation status periodically
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
                dispatch({ type: "SET_MESSAGES", payload: msgs })
                welcomeShownRef.current = true // Don't show welcome if real messages exist
            }
        } catch {
            /* silently fail on poll */
        }
    }, [conversationId])

    // Poll for conversation status separately
    useEffect(() => {
        if (!conversationId) return

        const checkStatus = async () => {
            try {
                const convo = await apiGet("/widget/conversations/get", { id: conversationId })
                if (convo) {
                    dispatch({ type: "SET_CONVERSATION_STATUS", payload: convo.status })
                    if (convo.status === 1000 && !convo.rating) {
                        dispatch({ type: "SET_SHOW_RATING", payload: true })
                    }
                }
            } catch { /* ignore */ }
        }

        checkStatus()
        const interval = setInterval(checkStatus, 3000)
        return () => clearInterval(interval)
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
    }, [messages, showRating])

    const ensureConversation = async (initialMessage?: string): Promise<string | null> => {
        if (conversationId) return conversationId
        if (!projectId) return null
        try {
            const result = await apiPost("/widget/conversations", {
                projectId,
                visitorName: preChatData?.name || t("visitor"),
                visitorEmail: preChatData?.email,
                visitorPhone: preChatData?.phone,
                visitorId,
                initialMessage,
            })
            const newId = result.conversationId
            dispatch({ type: "SET_CONVERSATION_ID", payload: newId })
            return newId
        } catch {
            dispatch({ type: "SET_ERROR", payload: t("failedToCreateConversation") })
            return null
        }
    }

    const handleSendText = async (text: string) => {
        if (!text.trim()) return

        // Optimistic update
        const tempId = "temp_" + Date.now()
        dispatch({ type: "SET_MESSAGES", payload: (prev) => [
            ...prev,
            {
                _id: tempId,
                content: text,
                senderType: "visitor",
                senderId: visitorId,
                _creationTime: Date.now(),
            },
        ]})

        const isNewConversation = !conversationId
        const convId = await ensureConversation(isNewConversation ? text : undefined)
        if (!convId) {
            dispatch({ type: "SET_MESSAGES", payload: prev => prev.filter(m => m._id !== tempId) })
            return
        }

        if (isNewConversation) {
            // First message is pushed atomically during conversation creation.
            // Fast-forward UI:
            dispatch({ type: "SET_CONVERSATION_ID", payload: convId })
            fetchMessages()
            return
        }

        try {
            const res = await apiPost("/widget/messages", {
                conversationId: convId,
                content: text,
                visitorId,
            })

            dispatch({ type: "SET_MESSAGES", payload: prev => prev.filter(m => m._id !== tempId) })

            if (res.conversationId && res.conversationId !== convId) {
                dispatch({ type: "SET_CONVERSATION_ID", payload: res.conversationId })
            } else {
                fetchMessages()
            }
        } catch {
            dispatch({ type: "SET_MESSAGES", payload: prev => prev.filter(m => m._id !== tempId) })
            dispatch({ type: "SET_ERROR", payload: t("failedToSendMessage") })
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const text = input.trim()
        dispatch({ type: "SET_INPUT", payload: "" })
        await handleSendText(text)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const convId = await ensureConversation()
        if (!convId) return

        // For now, send file name as message (full upload requires Convex file storage endpoint)
        const text = `📎 ${file.name}`
        dispatch({ type: "SET_MESSAGES", payload: (prev) => [
            ...prev,
            {
                _id: "temp_file_" + Date.now(),
                content: text,
                senderType: "visitor",
                senderId: visitorId,
                _creationTime: Date.now(),
            },
        ]})

        try {
            const res = await apiPost("/widget/messages", {
                conversationId: convId,
                content: text,
                visitorId,
            })

            if (res.conversationId && res.conversationId !== convId) {
                dispatch({ type: "SET_CONVERSATION_ID", payload: res.conversationId })
            } else {
                fetchMessages()
            }
        } catch {
            dispatch({ type: "SET_ERROR", payload: t("failedToSendAttachment") })
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleRatingSubmit = async (rating: number, feedback: string) => {
        if (!conversationId) return

        try {
            await apiPost("/widget/conversations/rate", {
                id: conversationId,
                rating,
                feedback
            })
            dispatch({ type: "SET_SHOW_RATING", payload: false })
        } catch (error) {
            console.error("Failed to submit rating", error)
            dispatch({ type: "SET_ERROR", payload: t("rating.failedToSubmit") })
        }
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
    const widgetTitle = t("headerTitle") || widgetConfig?.translations?.headerTitle || projectConfig?.name
    const onlineStatus = t("onlineStatus") || widgetConfig?.translations?.onlineStatus
    const logoUrl = widgetConfig?.logoUrl || ""

    if (error && !conversationId) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        )
    }

    if (showPreChat && !conversationId) {
        return (
            <PreChatForm
                onSubmit={(data) => {
                    dispatch({ type: "SET_PRE_CHAT_DATA", payload: data })
                    dispatch({ type: "SET_SHOW_PRE_CHAT", payload: false })
                }}
                primaryColor={widgetColor}
                title={t("preChatForm.welcome") || widgetConfig?.translations?.preChatTitle}
                subtitle={t("preChatForm.subtitle") || widgetConfig?.translations?.preChatSubtitle}
                contactMethod={widgetConfig?.contactMethod || "email"}
            />
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
                        <Image src={logoUrl} width={40} height={40} className="w-full h-full object-cover" alt="Logo" />
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
                        {t("connecting")}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        {t("startPrompt")}
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isVisitor = msg.senderType === "visitor";
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isVisitor ? "justify-end" : "justify-start"} mb-4`}
                            >
                                {!isVisitor && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden mr-2 mt-1">
                                        {logoUrl ? (
                                            <Image src={logoUrl} width={32} height={32} className="w-full h-full object-cover" alt="Avatar" />
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-500">
                                                {msg.senderType === "bot" ? t("avatarBot") : t("avatarAgent")}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1 max-w-[80%]">
                                    {!isVisitor && (
                                        <span className="text-[10px] text-gray-500 ml-1">
                                            {msg.senderName ?? (msg.senderType === "bot" ? t("aiAssistant") : t("supportAgent"))}
                                        </span>
                                    )}

                                    <div
                                        className="rounded-2xl px-4 py-2 text-sm shadow-sm"
                                        style={
                                            isVisitor
                                                ? { backgroundColor: widgetColor, color: "#fff", borderBottomRightRadius: "4px" }
                                                : { backgroundColor: "#f3f4f6", color: "#1f2937", borderBottomLeftRadius: "4px" }
                                        }
                                    >
                                        {msg.type === "system" ? t(msg.content) : msg.content}
                                    </div>
                                    {!isVisitor && msg.attachments?.payload?.buttons && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {msg.attachments.payload.buttons.map((btn: any, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendText(btn.label)}
                                                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-medium transition-colors text-center shadow-sm"
                                                    disabled={loading || conversationStatus === 1000}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                {showRating && (
                    <div className="mx-4 mb-4">
                        <RatingComponent
                            onSubmit={handleRatingSubmit}
                            primaryColor={widgetColor}
                        />
                    </div>
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
                    title={t("attachFile")}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </button>
                <input
                    type="text"
                    className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={conversationStatus === 1000 ? t("conversationResolved") : t("inputPlaceholder")}
                    value={input}
                    onChange={(e) => dispatch({ type: "SET_INPUT", payload: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={loading || conversationStatus === 1000}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim() || conversationStatus === 1000}
                    style={{ backgroundColor: widgetColor }}
                    className="text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {t("send")}
                </button>
            </div>
        </div>
    )
}
