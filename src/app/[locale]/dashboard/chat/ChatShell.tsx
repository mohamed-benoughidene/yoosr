"use client"

import { ConversationList } from "@/components/chat/ConversationList"
import { ChatArea } from "@/components/chat/ChatArea"
import { VisitorPanel } from "@/components/dashboard/shared/VisitorPanel"
import { ThreePanelLayout } from "@/components/layout/ThreePanelLayout"
import { Suspense, useState } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "@/i18n/navigation"
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
        <div className="h-[calc(100vh-64px)] w-full">
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

            {/* Desktop View - using shared ThreePanelLayout */}
            <ThreePanelLayout
                autoSaveId="dashboard-chat-layout"
                leftPanel={<ConversationList />}
                mainPanel={children}
                rightPanel={<VisitorPanelWrapper />}
                leftPanelSize={{ default: 20, min: 15, max: 30 }}
                mainPanelSize={{ default: 55, min: 30 }}
                rightPanelSize={{ default: 25, min: 20, max: 40 }}
            />
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
