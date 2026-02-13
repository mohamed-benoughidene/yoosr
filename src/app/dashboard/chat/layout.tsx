"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatArea } from "@/components/chat/ChatArea"
import { ContactInfo } from "@/components/chat/ContactInfo"

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-[calc(100vh-64px)] w-full border rounded-lg bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <ConversationList />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={55} minSize={30}>
                    {children}
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <ContactInfo />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
