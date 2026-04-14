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
import { useQuery } from "convex/react"
import { useProject } from "@/context/ProjectContext"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, AlertTriangle, Bot } from "lucide-react"

import { useTranslations } from "next-intl"

export default function MonitorLayout() {
    const tNav = useTranslations("nav")
    const t = useTranslations("monitor")
    const { activeProject } = useProject()
    const projectId = activeProject?._id

    const [activeDeptId, setActiveDeptId] = React.useState<Id<"departments"> | null>(null)

    const [mobileView, setMobileView] = React.useState<"list" | "chat" | "contact">("list")

    // Detect responsive layout - use lazy initializer for SSR safety
    const isDesktop = React.useMemo(() => {
        if (typeof window === "undefined") return true
        return window.matchMedia("(min-width: 1024px)").matches
    }, [])

    // Auto-refresh: increment version every 15s to trigger re-fetch
    const [refreshVersion, setRefreshVersion] = React.useState(0)
    React.useEffect(() => {
        const interval = setInterval(() => {
            setRefreshVersion((v) => v + 1)
        }, 15_000)
        return () => clearInterval(interval)
    }, [])

    const conversations = useQuery(
        api.conversations.getConversations,
        projectId ? {
            projectId,
            departmentId: activeDeptId ?? undefined,
            _refresh: refreshVersion,
        } : "skip"
    )

    // Count of all active conversations (for >100 indicator)
    const totalActiveCount = useQuery(
        api.conversations.countActiveConversations,
        projectId ? {
            projectId,
            departmentId: activeDeptId ?? undefined,
            _refresh: refreshVersion,
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

    // Derived KPIs for the command center header
    const unassignedCount = conversations?.filter(c => !c.assignedTo).length ?? 0
    const botActiveCount = conversations?.filter(c => c.botId).length ?? 0
    const slaOverdueCount = conversations?.filter(c =>
        c.slaDeadline && !c.firstResponseAt && c.slaDeadline < Date.now()
    ).length ?? 0
    const hasMoreConversations = (totalActiveCount?.count ?? 0) > (conversations?.length ?? 0)

    const KpiSkeleton = () => <Skeleton className="h-5 w-8" />

    return (
        <div className="h-[calc(100vh-5rem)] w-full">
            <div className="flex h-full flex-col">
                <div className="flex items-center px-4 py-2">
                    <h1 className="text-xl font-bold">{tNav("monitor")}</h1>
                </div>
                <Separator />

                {/* Command Center KPI Header */}
                <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("kpi_active")}</span>
                        {conversations === undefined ? (
                            <KpiSkeleton />
                        ) : (
                            <Badge variant="secondary" className="font-mono">
                                {hasMoreConversations ? `${conversations.length}+` : conversations.length}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("kpi_unassigned")}</span>
                        {conversations === undefined ? (
                            <KpiSkeleton />
                        ) : (
                            <Badge variant={unassignedCount > 0 ? "destructive" : "secondary"} className="font-mono">
                                {unassignedCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("kpi_sla_breach")}</span>
                        {conversations === undefined ? (
                            <KpiSkeleton />
                        ) : (
                            <Badge variant={slaOverdueCount > 0 ? "destructive" : "secondary"} className="font-mono">
                                {slaOverdueCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("kpi_bot_active")}</span>
                        {conversations === undefined ? (
                            <KpiSkeleton />
                        ) : (
                            <Badge variant="secondary" className="font-mono">
                                {botActiveCount}
                            </Badge>
                        )}
                    </div>
                </div>

                {conversations === undefined ? (
                    <div className="flex h-full items-center justify-center p-8">
                        <div className="flex flex-col gap-4 w-full h-full max-w-md mx-auto">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mobile View — hidden on desktop */}
                        {!isDesktop && (
                        <div className="flex flex-col h-full w-full overflow-hidden">
                            {mobileView === "list" && (
                                <ConversationList
                                    items={conversations}
                                    selectedId={selectedConversationId}
                                    onSelect={setSelectedConversationId}
                                    activeDeptId={activeDeptId}
                                    onDeptChange={setActiveDeptId}
                                    onSelectConversation={(id) => {
                                        setSelectedConversationId(id)
                                        setMobileView("chat")
                                    }}
                                />
                            )}
                            {mobileView === "chat" && (
                                selectedConversation ? (
                                    <ChatDisplay 
                                        conversation={selectedConversation} 
                                        onBack={() => setMobileView("list")}
                                        onOpenContact={() => setMobileView("contact")}
                                    />
                                ) : conversations.length === 0 ? (
                                    <div className="flex h-full items-center justify-center flex-col gap-4">
                                        <span className="text-muted-foreground">{t("no_conversations_yet")}</span>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                                        {t("select_conversation")}
                                    </div>
                                )
                            )}
                            {mobileView === "contact" && (
                                selectedConversation ? (
                                    <VisitorPanel 
                                        conversationId={selectedConversation.id as Id<"conversations">} 
                                        onBack={() => setMobileView("chat")}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                                        {t("select_conversation")}
                                    </div>
                                )
                            )}
                        </div>
                        )}

                        {/* Desktop View — visible on desktop */}
                        {isDesktop && (
                        <div className="flex h-full w-full overflow-hidden">
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
                                    ) : conversations.length === 0 ? (
                                        <div className="flex h-full items-center justify-center flex-col gap-4">
                                            <span className="text-muted-foreground">{t("no_conversations_yet")}</span>
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                                            {t("select_conversation")}
                                        </div>
                                    )}
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                                    {selectedConversation ? (
                                        <VisitorPanel conversationId={selectedConversation.id as Id<"conversations">} />
                                    ) : (
                                        <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                                            {t("select_conversation")}
                                        </div>
                                    )}
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
