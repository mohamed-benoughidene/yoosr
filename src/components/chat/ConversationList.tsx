"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/context/ProjectContext"
import { useSearchParams, useRouter } from "next/navigation"
import { Database } from "@/types/supabase"

type Conversation = Database["public"]["Tables"]["conversations"]["Row"]

export function ConversationList() {
    const { activeProject } = useProject()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const supabase = createClient()
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentConversationId = searchParams.get("conversationId")

    useEffect(() => {
        if (!activeProject) return

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from("conversations")
                .select("*")
                .eq("project_id", activeProject.id)
                .order("updated_at", { ascending: false })

            if (error) {
                console.error("Error fetching conversations:", error)
            } else {
                setConversations(data || [])
            }
        }

        fetchConversations()

        const channel = supabase
            .channel(`project-conversations-${activeProject.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversations",
                    filter: `project_id=eq.${activeProject.id}`,
                },
                (payload) => {
                    fetchConversations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeProject, supabase])

    const handleNewChat = async () => {
        if (!activeProject) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("conversations")
                .insert({
                    project_id: activeProject.id,
                    visitor_name: "New Visitor",
                    last_message: "Started a new conversation",
                    status: "open",
                    unread_count: 0,
                    assigned_to: user.id
                })
                .select()
                .single()

            if (error) throw error

            if (data) {
                router.push(`/dashboard/chat?conversationId=${data.id}`)
            }
        } catch (error) {
            console.error("Error creating new chat:", error)
        }
    }

    const handleSelectConversation = (id: string) => {
        router.push(`/dashboard/chat?conversationId=${id}`)
    }

    return (
        <div className="flex flex-col h-full bg-background border-r">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Conversations</h2>
                    <Button variant="ghost" size="icon" onClick={handleNewChat}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8" />
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-muted-foreground/20">Unassigned</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Mine</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">All</Badge>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="flex flex-col">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={cn(
                                "flex flex-col gap-2 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b",
                                (conv.unread_count ?? 0) > 0 ? "bg-muted/20" : "",
                                currentConversationId === conv.id ? "bg-muted" : ""
                            )}
                            onClick={() => handleSelectConversation(conv.id)}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{conv.visitor_name || "Visitor"}</div>
                                        {(conv.unread_count ?? 0) > 0 && (
                                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {conv.updated_at && formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                    {conv.last_message || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
