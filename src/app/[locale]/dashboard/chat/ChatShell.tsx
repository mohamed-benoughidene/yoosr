"use client"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatArea } from "@/components/chat/ChatArea"
import { VisitorPanel } from "@/components/dashboard/shared/VisitorPanel"
import { Suspense, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Id } from "../../../../../convex/_generated/dataModel"

function VisitorPanelWrapper() {
    const t = useTranslations("chat")
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null

    if (!conversationId) {
        return (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                {t("select_conversation")}
            </div>
        )
    }

    return <VisitorPanel conversationId={conversationId} />
}

function ChatLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const [mobileView, setMobileView] = useState<"list" | "chat" | "contact">("list")
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

    return (
        <div className="h-[calc(100vh-64px)] w-full border rounded-lg bg-background overflow-hidden">
            {/* Mobile View */}
            <div className="flex flex-col h-full lg:hidden">
                {mobileView === "list" && (
                    <ConversationList
                        onSelectConversation={(id) => {
                            setSelectedConversationId(id)
                            setMobileView("chat")
                        }}
                    />
                )}
                {mobileView === "chat" && (
                    <ChatArea
                        conversationId={selectedConversationId}
                        onBack={() => setMobileView("list")}
                        onOpenContact={() => setMobileView("contact")}
                    />
                )}
                {mobileView === "contact" && (
                    selectedConversationId && (
                        <VisitorPanel
                            conversationId={selectedConversationId as Id<"conversations">}
                            onBack={() => setMobileView("chat")}
                        />
                    )
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex h-full w-full">
                <ResizablePanelGroup direction="horizontal" autoSaveId="dashboard-chat-layout">
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
                            <VisitorPanelWrapper />
                        </Suspense>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}

export default function ChatShell({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <ChatLayoutContent>{children}</ChatLayoutContent>
        </Suspense>
    )
}
