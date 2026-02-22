"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatArea } from "@/components/chat/ChatArea"
import { ContactInfo } from "@/components/chat/ContactInfo"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-[calc(100vh-64px)] w-full border rounded-lg bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <Suspense fallback={
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    }>
                        <ConversationList />
                    </Suspense>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={55} minSize={30}>
                    {children}
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <Suspense fallback={
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    }>
                        <ContactInfo />
                    </Suspense>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
