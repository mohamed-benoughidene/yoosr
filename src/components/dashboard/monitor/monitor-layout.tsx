"use client"

import * as React from "react"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { ConversationList } from "./conversation-list"
import { ChatDisplay } from "./chat-display"
import { VisitorPanel } from "@/components/dashboard/shared/VisitorPanel"
import { useQuery, useMutation } from "convex/react"
import { useProject } from "@/context/ProjectContext"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"

export default function MonitorLayout() {
    const { activeProject } = useProject()
    const projectId = activeProject?._id

    const [activeDeptId, setActiveDeptId] = React.useState<Id<"departments"> | null>(null)

    const conversations = useQuery(
        api.conversations.getConversations,
        projectId ? {
            projectId,
            departmentId: activeDeptId ?? undefined
        } : "skip"
    )

    const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null)

    // Select the first conversation by default if none selected and data loaded
    React.useEffect(() => {
        if (conversations && conversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(conversations[0].id)
        }
    }, [conversations, selectedConversationId])

    const selectedConversation = conversations?.find(
        (c) => c.id === selectedConversationId
    ) ?? null

    return (
        <div className="h-[calc(100vh-5rem)] w-full">
            <div className="flex h-full flex-col">
                <div className="flex items-center px-4 py-2">
                    <h1 className="text-xl font-bold">Monitor</h1>
                </div>
                <Separator />

                {conversations === undefined ? (
                    <div className="flex h-full items-center justify-center p-8">
                        <div className="flex flex-col gap-4 w-full h-full max-w-md mx-auto">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex h-full items-center justify-center flex-col gap-4">
                        <span className="text-muted-foreground">No conversations yet</span>
                    </div>
                ) : (
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="h-full items-stretch"
                    >
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                            <ConversationList
                                items={conversations}
                                selectedId={selectedConversationId}
                                onSelect={setSelectedConversationId}
                                activeDeptId={activeDeptId}
                                onDeptChange={setActiveDeptId}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={30}>
                            {selectedConversation ? (
                                <ChatDisplay conversation={selectedConversation} />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <span className="text-muted-foreground">Select a conversation</span>
                                </div>
                            )}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                            {selectedConversation ? (
                                <VisitorPanel conversationId={selectedConversation.id as Id<"conversations">} />
                            ) : (
                                <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                                    Select a conversation to view details
                                </div>
                            )}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>
        </div>
    )
}
