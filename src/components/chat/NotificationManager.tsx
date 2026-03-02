"use client"

import { useEffect, useRef } from "react"
import { useProject } from "@/context/ProjectContext"
import { playNotificationSound, showBrowserNotification } from "@/lib/notifications"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Doc } from "../../../convex/_generated/dataModel"

const SOUND_STORAGE_KEY = "yoosr-sound-enabled"

function isSoundEnabled(): boolean {
    if (typeof window === "undefined") return true
    return localStorage.getItem(SOUND_STORAGE_KEY) !== "false"
}

export function NotificationManager() {
    const { activeProject } = useProject()
    const originalTitle = useRef<string>("")
    const prevMessagesRef = useRef<Doc<"messages">[]>([])

    useEffect(() => {
        if (typeof document !== 'undefined') {
            originalTitle.current = document.title
        }
    }, [])

    // Real-time query for recent visitor messages — Convex handles reactivity!
    const recentMessages = useQuery(
        api.messages.listRecentByProject,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    // Detect new messages by comparing with previous snapshot
    useEffect(() => {
        if (!recentMessages || !activeProject) return

        const prevIds = new Set(prevMessagesRef.current.map(m => m._id))
        const newMessages = recentMessages.filter(m => !prevIds.has(m._id))

        // Only notify after initial load (prevMessages was populated)
        if (prevMessagesRef.current.length > 0 && newMessages.length > 0) {
            const latestMsg = newMessages[0] // Most recent first (desc order)

            // Trigger notifications only if sound is enabled
            if (isSoundEnabled()) {
                playNotificationSound()
            }

            const notificationTitle = "New Message"
            const notificationBody = `A visitor sent a message: "${latestMsg.content.substring(0, 50)}${latestMsg.content.length > 50 ? '...' : ''}"`

            // Toast notification
            toast.info(notificationTitle, {
                description: notificationBody,
                duration: 8000,
                action: {
                    label: "View",
                    onClick: () => {
                        window.focus()
                    }
                }
            })

            // Browser notification if tab is hidden
            if (document.hidden) {
                document.title = `(1) ${originalTitle.current}`
                showBrowserNotification(notificationTitle, notificationBody)
            }
        }

        prevMessagesRef.current = recentMessages
    }, [recentMessages, activeProject])

    useEffect(() => {
        const handleFocus = () => {
            if (originalTitle.current) {
                document.title = originalTitle.current
            }
        }
        window.addEventListener("focus", handleFocus)
        return () => window.removeEventListener("focus", handleFocus)
    }, [])

    return null
}
