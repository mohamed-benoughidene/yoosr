"use client"

import { useReducer, useEffect, useRef, useCallback, useState } from "react"
import Image from "next/image"
import { RatingComponent } from "../rating-component"
import { PreChatForm } from "./PreChatForm"
import { useTranslations } from "next-intl"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Paperclip, Loader2, X as XIcon } from "lucide-react"
import { CONVERSATION_STATUS } from "@/lib/constants"

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || ""

function playBeep() {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext | undefined;
        if (!AudioCtx) return;
        const ctx = new AudioCtx()
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
    attachments?: unknown
    fileId?: string
    fileName?: string
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
    projectConfig: Record<string, unknown> | null;
    conversationStatus: number;
    showRating: boolean;
    showPreChat: boolean;
    preChatData: { name: string, email?: string, phone?: string } | null;
    isUploading: boolean;
    isAgentTyping: boolean;
    typingSenderName: string;
    isSendingMessage: boolean;
}

type ChatAction =
    | { type: "SET_PROJECT_ID", payload: string | null }
    | { type: "SET_VISITOR_ID", payload: string }
    | { type: "SET_CONVERSATION_ID", payload: string | null }
    | { type: "SET_MESSAGES", payload: Message[] | ((prev: Message[]) => Message[]) }
    | { type: "SET_INPUT", payload: string }
    | { type: "SET_LOADING", payload: boolean }
    | { type: "SET_ERROR", payload: string | null }
    | { type: "SET_PROJECT_CONFIG", payload: Record<string, unknown> }
    | { type: "SET_CONVERSATION_STATUS", payload: number }
    | { type: "SET_SHOW_RATING", payload: boolean }
    | { type: "SET_SHOW_PRE_CHAT", payload: boolean }
    | { type: "SET_PRE_CHAT_DATA", payload: { name: string, email?: string, phone?: string } | null }
    | { type: "SET_UPLOADING", payload: boolean }
    | { type: "SET_AGENT_TYPING", payload: { isTyping: boolean; senderName?: string } }
    | { type: "SET_SENDING_MESSAGE", payload: boolean }

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
    isUploading: false,
    isAgentTyping: false,
    typingSenderName: "",
    isSendingMessage: false,
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
        case "SET_UPLOADING": return { ...state, isUploading: action.payload }
        case "SET_AGENT_TYPING": return {
            ...state,
            isAgentTyping: action.payload.isTyping,
            typingSenderName: action.payload.senderName ?? "",
        }
        case "SET_SENDING_MESSAGE": return { ...state, isSendingMessage: action.payload }
        default: return state;
    }
}

function MessageImage({ fileId, fileName }: { fileId: string; fileName?: string }) {
    const url = useQuery(api.messages.getStorageUrl, { storageId: fileId })

    if (url === undefined) {
        return (
            <div className="w-[200px]">
                <Skeleton className="h-[150px] w-full rounded-lg" />
            </div>
        )
    }

    if (!url) return null

    return (
        <div className="relative w-[200px] h-[150px] rounded-lg overflow-hidden cursor-pointer group shadow-sm border border-gray-100">
            <Image
                src={url}
                alt={fileName || "Image"}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                onClick={() => window.open(url, "_blank")}
                sizes="200px"
            />
        </div>
    )
}

export default function WidgetChat() {
    const t = useTranslations("widget")
    const [state, dispatch] = useReducer(chatReducer, initialState)
    const [isMobileViewport, setIsMobileViewport] = useState(false)
    const {
        projectId, visitorId, conversationId, messages, input, loading, error,
        projectConfig, conversationStatus, showRating, showPreChat, preChatData, isUploading,
        isAgentTyping, typingSenderName, isSendingMessage
    } = state

    const chatEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevMessageCountRef = useRef<number>(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const welcomeShownRef = useRef(false)

    // Connection timeout state
    const [connectionTimeout, setConnectionTimeout] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    // Use refs to avoid stale closures in timeout callback
    const loadingRef = useRef(false)
    const conversationIdRef = useRef<string | null>(null)

    // Keep refs in sync
    useEffect(() => {
        loadingRef.current = loading
    }, [loading])

    useEffect(() => {
        conversationIdRef.current = conversationId
    }, [conversationId])

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

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

        // Read viewport size from parent to conditionally show close button
        const vp = urlParams.get("vp")
        if (vp === "mobile") {
            setIsMobileViewport(true)
        }

        const stored = localStorage.getItem("yoosr_visitor_id")
        if (stored) {
            dispatch({ type: "SET_VISITOR_ID", payload: stored })
        } else {
            const vid = "visitor_" + Math.random().toString(36).slice(2, 11)
            localStorage.setItem("yoosr_visitor_id", vid)
            dispatch({ type: "SET_VISITOR_ID", payload: vid })
        }

        // Set connection timeout after 15 seconds
        const timeoutTimer = setTimeout(() => {
            if (loadingRef.current && !conversationIdRef.current) {
                setConnectionTimeout(true)
                dispatch({ type: "SET_LOADING", payload: false })
            }
        }, 15000)

        return () => clearTimeout(timeoutTimer)
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

        const config = projectConfig?.widgetConfig as { enableWelcomeNotification?: boolean; welcomeDelay?: number } | undefined
        const widgetCfg = projectConfig?.widgetConfig as { translations?: Record<string, Record<string, string> | undefined> } | undefined
        const translations = widgetCfg?.translations
        const activeLocale = (projectConfig as unknown as Record<string, unknown>)?.widgetLocale as string | undefined || "en"
        const enableWelcome = config?.enableWelcomeNotification ?? true
        const delay = (config?.welcomeDelay ?? 3) * 1000

        // Resolve welcome message with fallback chain
        const welcomeMsg = (() => {
            const activeValue = translations?.welcomeMessage?.[activeLocale]
            if (activeValue) return activeValue
            const enValue = translations?.welcomeMessage?.en
            if (enValue) return enValue
            const i18nValue = t("system.welcome")
            if (i18nValue) return i18nValue
            return "Welcome!"
        })()

        if (!enableWelcome) return

        const timer = setTimeout(() => {
            if (!welcomeShownRef.current) {
                welcomeShownRef.current = true
                dispatch({ type: "SET_MESSAGES", payload: prev => {
                    if (prev.length > 0) return prev
                    return [{
                        _id: "welcome_" + Date.now(),
                        content: welcomeMsg || "Welcome!",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectConfig])

    // Track if widget iframe is currently visible in parent (for suppressing notifications)
    // Use ref to avoid re-creating fetchMessages callback on every visibility change
    const isWidgetVisibleRef = useRef(false)

    // Listen for visibility changes, focus requests, and typing status from parent
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === "yoosr:visibility_change") {
                isWidgetVisibleRef.current = !!e.data.visible
            }
            if (e.data?.type === "yoosr:focus_input") {
                requestAnimationFrame(() => {
                    inputRef.current?.focus()
                })
            }
            if (e.data?.type === "yoosr:typing_status") {
                const { isTyping, senderName } = e.data.payload || {}
                dispatch({ type: "SET_AGENT_TYPING", payload: { isTyping: !!isTyping, senderName } })

                // Auto-hide after 5s
                if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
                if (isTyping) {
                    typingTimerRef.current = setTimeout(() => {
                        dispatch({ type: "SET_AGENT_TYPING", payload: { isTyping: false, senderName: "" } })
                    }, 5000)
                }
            }
        }
        window.addEventListener("message", handler)
        return () => {
            window.removeEventListener("message", handler)
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        }
    }, [])

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
                    if (existing.status === CONVERSATION_STATUS.CLOSED && !existing.rating) {
                        dispatch({ type: "SET_SHOW_RATING", payload: true })
                    }
                } else {
                    // Don't create conversation until first message
                    // Show Pre-chat form if configured and no data yet
                    const enablePreChat = (projectConfig?.widgetConfig as { preChatFormEnabled?: boolean } | undefined)?.preChatFormEnabled ?? true
                    if (!preChatData && enablePreChat) {
                        dispatch({ type: "SET_SHOW_PRE_CHAT", payload: true })
                    }
                }
            } catch {
                dispatch({ type: "SET_ERROR", payload: t("failedToConnect") })
            }
            dispatch({ type: "SET_LOADING", payload: false })
        }

        init()
    }, [projectId, visitorId, projectConfig, t, preChatData])

    // Clear connection timeout when conversation is established or loading finishes
    useEffect(() => {
        if (conversationId || !loading) {
            setConnectionTimeout(false)
        }
    }, [conversationId, loading])

    // Poll for messages and typing status
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return
        try {
            // Also check conversation status periodically
            const response = await apiGet("/widget/messages", { conversationId })

            // Handle both old (array) and new (object with messages + typing) response formats
            const msgs = Array.isArray(response) ? response : response.messages
            const isAgentTyping = response.isAgentTyping ?? false
            const typingSenderName = response.typingSenderName ?? ""

            if (Array.isArray(msgs)) {
                const prevCount = prevMessageCountRef.current
                if (prevCount > 0 && msgs.length > prevCount) {
                    const newMsgs = msgs.slice(prevCount)
                    const hasAgentMessage = newMsgs.some((m: Message) => m.senderType === "agent" || m.senderType === "bot")
                    if (hasAgentMessage) {
                        // Play notification sound ONLY if widget is minimized (not actively reading)
                        if (!isWidgetVisibleRef.current) {
                            try {
                                audioRef.current?.play().catch(() => playBeep())
                            } catch {
                                playBeep()
                            }
                        }
                        // Notify parent for badge + toast preview
                        const latestMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null
                        try {
                            window.parent.postMessage({
                                type: "yoosr:new_message",
                                senderName: latestMsg?.senderName ?? "Support",
                                message: latestMsg?.content ?? "",
                            }, "*")
                        } catch { /* ignore */ }
                    }
                }
                prevMessageCountRef.current = msgs.length
                dispatch({ type: "SET_MESSAGES", payload: msgs })
                welcomeShownRef.current = true // Don't show welcome if real messages exist
            }

            // Update typing state from poll response (primary source)
            if (isAgentTyping) {
                dispatch({ type: "SET_AGENT_TYPING", payload: { isTyping: true, senderName: typingSenderName } })
            } else {
                dispatch({ type: "SET_AGENT_TYPING", payload: { isTyping: false, senderName: "" } })
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
                    if (convo.status === CONVERSATION_STATUS.CLOSED && !convo.rating) {
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

        dispatch({ type: "SET_SENDING_MESSAGE", payload: true })

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
            dispatch({ type: "SET_SENDING_MESSAGE", payload: false })
            return
        }

        if (isNewConversation) {
            // First message is pushed atomically during conversation creation.
            // Fast-forward UI:
            dispatch({ type: "SET_CONVERSATION_ID", payload: convId })
            fetchMessages()
            dispatch({ type: "SET_SENDING_MESSAGE", payload: false })
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
        } finally {
            dispatch({ type: "SET_SENDING_MESSAGE", payload: false })
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

        // Validate type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            dispatch({ type: "SET_ERROR", payload: "Only images (JPG, PNG, GIF, WEBP) are allowed" })
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        // Validate size (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
            dispatch({ type: "SET_ERROR", payload: "File size should be less than 5MB" })
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        const convId = await ensureConversation()
        if (!convId) return

        dispatch({ type: "SET_UPLOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        try {
            // Get upload URL
            const { uploadUrl } = await apiPost("/widget/upload-url", {})
            if (!uploadUrl) throw new Error("Could not get upload URL")

            // Upload binary
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })
            if (!uploadRes.ok) throw new Error("Upload failed")

            const { storageId } = await uploadRes.json()
            if (!storageId) throw new Error("No storageId returned")

            // Send message
            await apiPost("/widget/messages", {
                conversationId: convId,
                content: "",
                fileId: storageId,
                fileName: file.name,
                visitorId,
            })

            fetchMessages()
        } catch (error) {
            console.error("Upload failed", error)
            dispatch({ type: "SET_ERROR", payload: t("failedToSendAttachment") })
        } finally {
            dispatch({ type: "SET_UPLOADING", payload: false })
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
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

    // Close widget — tell parent to close via postMessage
    const handleClose = useCallback(() => {
        window.parent.postMessage({ type: "yoosr:close" }, "*")
    }, [])

    // Read widget config
    const widgetCfg = projectConfig?.widgetConfig as { primaryColor?: string; translations?: Record<string, Record<string, string> | undefined>; logoUrl?: string; contactMethod?: "email" | "phone" } | undefined
    const translations = widgetCfg?.translations
    const activeLocale = (projectConfig as unknown as Record<string, unknown>)?.widgetLocale as string | undefined || "en"
    const widgetColor = widgetCfg?.primaryColor || "#6366f1"

    // Text resolution with fallback chain:
    // 1. Custom translation for active language
    // 2. English fallback
    // 3. i18n translation default
    // 4. Hardcoded default
    const resolveText = (field: string, hardcodedDefault: string): string => {
        const fieldTranslations = translations?.[field]
        const activeValue = fieldTranslations?.[activeLocale]
        if (activeValue) return activeValue
        const enValue = fieldTranslations?.en
        if (enValue) return enValue
        const i18nValue = t(field)
        if (i18nValue) return i18nValue
        return hardcodedDefault
    }

    const widgetTitle = resolveText("headerTitle", (projectConfig?.name as string | undefined) || "Chat")
    const onlineStatus = resolveText("onlineStatus", "Online")
    const logoUrl = widgetCfg?.logoUrl || ""

    // Retry connection timeout
    const handleRetryConnection = useCallback(() => {
        setConnectionTimeout(false)
        setIsRetrying(true)
        dispatch({ type: "SET_LOADING", payload: true })
        dispatch({ type: "SET_ERROR", payload: null })

        // Reset timeout timer - use refs to avoid stale closures
        setTimeout(() => {
            if (loadingRef.current && !conversationIdRef.current) {
                setConnectionTimeout(true)
                dispatch({ type: "SET_LOADING", payload: false })
            }
            setIsRetrying(false)
        }, 15000)
    }, [])

    if (connectionTimeout && !conversationId) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-white p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{t("connectionTimeout") || "Connection timed out"}</h3>
                <p className="text-xs text-gray-500 mb-4">{t("connectionTimeoutDesc") || "Please check your internet connection and try again."}</p>
                <button
                    onClick={handleRetryConnection}
                    disabled={isRetrying}
                    className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: widgetColor }}
                >
                    {isRetrying ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("retrying") || "Retrying..."}
                        </span>
                    ) : (
                        t("retry") || "Retry"
                    )}
                </button>
            </div>
        )
    }

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
                title={resolveText("preChatTitle", "Welcome!")}
                subtitle={resolveText("preChatSubtitle", "Please fill in your details to start the chat.")}
                contactMethod={widgetCfg?.contactMethod || "email"}
            />
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Offline Banner */}
            {isOffline && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2 text-xs text-yellow-800" role="alert" aria-live="assertive">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="flex-1">{t("offline") || "You are offline. Messages may not be sent until you reconnect."}</span>
                    <button
                        onClick={() => setIsOffline(!navigator.onLine)}
                        className="text-yellow-700 hover:text-yellow-900 font-medium underline"
                    >
                        {t("checkConnection") || "Check"}
                    </button>
                </div>
            )}

            {/* Header */}
            <div
                style={{ backgroundColor: widgetColor }}
                className="px-4 py-3 text-white flex items-center gap-3 shadow-sm"
            >
                {loading ? (
                    <div className="flex items-center gap-3 flex-1">
                        {logoUrl ? (
                            <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20" />
                        )}
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-4 w-24 bg-white/30 rounded" />
                            <Skeleton className="h-3 w-16 bg-white/20 rounded" />
                        </div>
                    </div>
                ) : (
                    <>
                        {logoUrl && (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                                <Image src={logoUrl} width={40} height={40} className="w-full h-full object-cover" alt="Logo" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm font-semibold">{widgetTitle}</h1>
                            <p className="text-xs opacity-80 truncate">{onlineStatus}</p>
                        </div>
                        {/* Close button — only for mobile where launcher is hidden */}
                        {isMobileViewport && (
                            <button
                                onClick={handleClose}
                                aria-label="Close chat"
                                className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {loading ? (
                    <div className="space-y-4 py-4" aria-live="polite" aria-label={t("loadingMessages") || "Loading messages"}>
                        {/* Bot message skeleton (left-aligned) */}
                        <div className="flex justify-start mb-4">
                            <Skeleton className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-1" />
                            <div className="flex flex-col gap-1 max-w-[80%]">
                                <Skeleton className="h-3 w-16 bg-gray-200 rounded ml-1" />
                                <Skeleton className="h-12 w-48 bg-gray-100 rounded-2xl" />
                            </div>
                        </div>
                        {/* Visitor message skeleton (right-aligned) */}
                        <div className="flex justify-end mb-4">
                            <div className="flex flex-col gap-1 max-w-[80%] items-end">
                                <Skeleton className="h-10 w-40 rounded-2xl" style={{ backgroundColor: widgetColor, opacity: 0.3 }} />
                            </div>
                        </div>
                        {/* Another bot message skeleton */}
                        <div className="flex justify-start mb-4">
                            <Skeleton className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-1" />
                            <div className="flex flex-col gap-1 max-w-[80%]">
                                <Skeleton className="h-3 w-16 bg-gray-200 rounded ml-1" />
                                <Skeleton className="h-16 w-56 bg-gray-100 rounded-2xl" />
                            </div>
                        </div>
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

                                <div className={`flex flex-col gap-1 max-w-[80%] ${isVisitor ? "items-end" : "items-start"}`}>
                                    {!isVisitor && (
                                        <span className="text-[10px] text-gray-500 ml-1">
                                            {msg.senderName ?? (msg.senderType === "bot" ? t("aiAssistant") : t("supportAgent"))}
                                        </span>
                                    )}

                                    {msg.fileId && (
                                        <MessageImage fileId={msg.fileId} fileName={msg.fileName} />
                                    )}

                                    {msg.content && (
                                        <div
                                            className="rounded-2xl px-4 py-2 text-sm shadow-sm dark:border"
                                            style={
                                                isVisitor
                                                    ? { backgroundColor: widgetColor, color: "#fff", borderBottomRightRadius: "4px" }
                                                    : { backgroundColor: "#f3f4f6", color: "#1f2937", borderBottomLeftRadius: "4px", borderColor: "#e5e7eb" }
                                            }
                                        >
                                            {msg.type === "system" ? (() => {
                                                const content = msg.content as string;
                                                const key = content.startsWith("widget.") ? content.replace("widget.", "") : content;
                                                return t(key);
                                            })() : msg.content as string}
                                            {msg._creationTime && (
                                                <div className={`text-[10px] mt-1 ${isVisitor ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
                                                    {new Date(msg._creationTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!isVisitor && (msg.attachments as { payload?: { buttons?: Array<{ label: string }> } } | undefined)?.payload?.buttons && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            {(msg.attachments as { payload: { buttons: Array<{ label: string }> } }).payload.buttons.map((btn, i) => (
                                                <button
                                                    key={`btn-${btn.label}-${i}`}
                                                    onClick={() => handleSendText(btn.label)}
                                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors text-center shadow-sm"
                                                    disabled={loading || conversationStatus === CONVERSATION_STATUS.CLOSED}
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

            {/* Typing Indicator */}
            {isAgentTyping && (
                <div className="px-4 py-1 flex items-center gap-1" aria-live="polite">
                    <span className="text-xs text-gray-400">
                        {t("typingIndicator", { senderName: typingSenderName || "Agent" })}
                    </span>
                    <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" />
                        <span className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </span>
                    {/* Reduced motion fallback */}
                    <style>{`
                        @media (prefers-reduced-motion: reduce) {
                            .animate-pulse {
                                animation: none !important;
                                opacity: 0.5;
                            }
                        }
                    `}</style>
                </div>
            )}

            {/* Powered by Yoosr Footer */}
            {loading ? (
                <Skeleton className="h-4 w-20 mx-auto bg-gray-200 rounded" />
            ) : (
                <div className="px-3 py-1 text-center">
                    <a
                        href="https://yoosr.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {t("poweredBy", { brand: "Yoosr" })}
                    </a>
                </div>
            )}

            {/* Input */}
            {loading ? (
                <div className="border-t px-3 py-2 flex gap-2 items-center">
                    <Skeleton className="w-8 h-8 rounded-md bg-gray-200" />
                    <Skeleton className="flex-1 h-10 rounded-md bg-gray-100" />
                    <Skeleton className="w-16 h-10 rounded-md" style={{ backgroundColor: widgetColor, opacity: 0.3 }} />
                </div>
            ) : (
                <div className="border-t px-3 py-2 flex gap-2 items-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || isUploading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    title={t("attachFile")}
                >
                    {isUploading ? (
                        <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    ) : (
                        <Paperclip className="h-[18px] w-[18px]" />
                    )}
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={conversationStatus === CONVERSATION_STATUS.CLOSED ? t("conversationResolved") : t("inputPlaceholder")}
                    value={input}
                    onChange={(e) => dispatch({ type: "SET_INPUT", payload: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={loading || conversationStatus === CONVERSATION_STATUS.CLOSED}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim() || conversationStatus === CONVERSATION_STATUS.CLOSED || isUploading}
                    style={{ backgroundColor: widgetColor }}
                    className="text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {isSendingMessage ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="sr-only">{t("sending") || "Sending..."}</span>
                        </>
                    ) : (
                        t("send")
                    )}
                </button>
            </div>
            )}
        </div>
    )
}
