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
import { ContactInfo } from "./contact-info"
import { conversations } from "./data"

export default function MonitorLayout() {
    const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
        conversations[0].id
    )

    const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId
    )

    return (
        <div className="h-[calc(100vh-5rem)] w-full">
            <div className="flex h-full flex-col">
                <div className="flex items-center px-4 py-2">
                    <h1 className="text-xl font-bold">Monitor</h1>
                </div>
                <Separator />
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full items-stretch"
                >
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                        <ConversationList
                            items={conversations}
                            selectedId={selectedConversationId}
                            onSelect={setSelectedConversationId}
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
                            <ContactInfo conversation={selectedConversation} />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-muted-foreground">No contact selected</span>
                            </div>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
