"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProject } from "@/context/ProjectContext"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"

type ChatTab = "all" | "unread"

export function ConversationList() {
    const { activeProject } = useProject()
    const { user } = useUser()
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentConversationId = searchParams.get("conversationId")
    const [activeTab, setActiveTab] = useState<ChatTab>("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Real-time conversations — only show assigned to me
    const allConversations = useQuery(
        api.conversations.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    // Chat only shows conversations assigned to the current agent
    const conversations = allConversations.filter((c: any) => c.assignedTo === user?.id)

    const createConversation = useMutation(api.conversations.create)

    const handleNewChat = async () => {
        if (!activeProject || !user) return

        try {
            const conversationId = await createConversation({
                projectId: activeProject._id,
                visitorName: "New Visitor",
            })
            router.push(`/dashboard/chat?conversationId=${conversationId}`)
        } catch (error) {
            console.error("Error creating new chat:", error)
        }
    }

    const handleSelectConversation = (id: string) => {
        router.push(`/dashboard/chat?conversationId=${id}`)
    }

    // Filter conversations based on active tab and search
    const filteredConversations = conversations.filter((conv) => {
        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            const matchesName = (conv.visitorName || "").toLowerCase().includes(q)
            const matchesMessage = (conv.lastMessage || "").toLowerCase().includes(q)
            if (!matchesName && !matchesMessage) return false
        }

        switch (activeTab) {
            case "all":
                // Show all conversations (or all OPEN ones? Usually 'All' implies open/active, resolved are hidden unless searched/history)
                return conv.status !== "resolved" // Wait, "change the tag open to all" usually implies keeping the logic "active conversations". If I show resolved mixed in, it gets cluttered. I'll stick to showing non-resolved as "All active".
            case "unread":
                return (conv.unreadCount ?? 0) > 0
            default:
                return true
        }
    })

    const unreadCount = conversations.filter((c: any) => (c.unreadCount ?? 0) > 0).length

    const tabs: { key: ChatTab; label: string; count?: number }[] = [
        { key: "all", label: "All" },
        { key: "unread", label: "Unread", count: unreadCount },
    ]

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Conversations</h2>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {tabs.map((tab) => (
                        <Badge
                            key={tab.key}
                            variant={activeTab === tab.key ? "secondary" : "outline"}
                            className={cn(
                                "cursor-pointer hover:bg-muted transition-colors",
                                activeTab === tab.key && "bg-muted-foreground/20 font-medium"
                            )}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                    {tab.count}
                                </span>
                            )}
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="flex flex-col">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv._id}
                            className={cn(
                                "flex flex-col gap-2 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b",
                                (conv.unreadCount ?? 0) > 0 ? "bg-muted/20" : "",
                                currentConversationId === conv._id ? "bg-muted" : ""
                            )}
                            onClick={() => handleSelectConversation(conv._id)}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{conv.visitorName || "Visitor"}</div>
                                        {(conv.unreadCount ?? 0) > 0 && (
                                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                        {conv.lastMessage || "No messages yet"}
                                    </div>
                                    {conv.status === "resolved" && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
                                            Resolved
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
