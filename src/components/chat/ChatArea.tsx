"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Paperclip, Send, Smile, Loader2, CheckCircle, MoreVertical, ChevronLeft, Info } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "@/i18n/navigation"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, usePaginatedQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { useUser, useOrganization } from "@clerk/nextjs"
import { useProject } from "@/context/ProjectContext"
import { CannedResponsePicker } from "../dashboard/monitor/canned-response-picker"
import { CONVERSATION_STATUS } from "@/lib/constants"

import { Suspense } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface ChatAreaProps {
    conversationId?: string | null
    onBack?: () => void
    onOpenContact?: () => void
}

function MessageImage({ fileId, fileName }: { fileId: string; fileName?: string }) {
    const url = useQuery(api.messages.getStorageUrl, { storageId: fileId });

    if (url === undefined) {
        return <Skeleton className="w-[240px] h-[160px] rounded-lg mt-1" />;
    }

    if (!url) return null;

    return (
        <div className="relative w-[240px] h-[160px] mt-1 rounded-lg overflow-hidden border bg-muted/20 cursor-pointer group">
            <Image
                src={url}
                alt={fileName || "Shared image"}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                onClick={() => window.open(url, "_blank")}
                sizes="240px"
            />
        </div>
    );
}

function ChatAreaContent({ conversationId: propConversationId, onBack, onOpenContact }: ChatAreaProps) {
    const searchParams = useSearchParams()
    const conversationIdFromParams = searchParams.get("conversationId") as Id<"conversations"> | null
    const conversationId = (propConversationId || conversationIdFromParams) as Id<"conversations"> | null

    const t = useTranslations("chat")
    const tMonitor = useTranslations("monitor")
    const tVisitor = useTranslations("visitor")

    const { user } = useUser()
    const [inputValue, setInputValue] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [messageMode, setMessageMode] = useState<"public" | "internal">("public")
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
    const [agentSearch, setAgentSearch] = useState("")
    const [isDepartmentTransferDialogOpen, setIsDepartmentTransferDialogOpen] = useState(false)
    const [departmentSearch, setDepartmentSearch] = useState("")
    const { activeProject } = useProject()
    const [showPicker, setShowPicker] = useState(false)
    const [pickerQuery, setPickerQuery] = useState("")

    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get conversation details for resolve status
    const conversation = useQuery(
        api.conversations.get,
        conversationId ? { id: conversationId } : "skip"
    )

    const { memberships } = useOrganization({ memberships: { infinite: true, pageSize: 50 } })

    const projectMembers = (memberships?.data ?? []).map(m => ({
        userId: m.publicUserData?.userId ?? "",
        profile: {
            fullName: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() || m.publicUserData?.identifier || t("agent_fallback"),
            avatarUrl: m.publicUserData?.imageUrl,
        },
        role: m.role,
    }))

    const departments = useQuery(
        api.departments.listDepartments,
        conversation?.projectId ? { projectId: conversation.projectId } : "skip"
    );

    // Real-time messages — no subscriptions needed!
    const { results: messages, status, loadMore } = usePaginatedQuery(
        api.messages.list,
        conversationId ? { conversationId } : "skip",
        { initialNumItems: 30 }
    )

    const cannedResponses = useQuery(
        api.cannedResponses.listCannedResponses,
        conversation?.projectId ? { projectId: conversation.projectId } : "skip"
    );

    const sendMessage = useMutation(api.messages.sendMessage)
    const sendMetaMsg = useMutation(api.conversations.relayToMeta)
    const relayToTelegramMsg = useMutation(api.conversations.relayToTelegram)
    const resolveConversation = useMutation(api.conversations.resolve)
    const markAsRead = useMutation(api.conversations.markAsRead)
    const updateConversation = useMutation(api.conversations.update)
    const transferToDept = useMutation(api.conversations.transferToDepartment)
    const sendSystemMessage = useMutation(api.messages.send)

    // Mark conversation as read when opened (debounced to avoid OCC conflicts with bot engine)
    useEffect(() => {
        if (!conversationId || !conversation || (conversation.unreadCount ?? 0) === 0) return

        const timer = setTimeout(() => {
            markAsRead({ id: conversationId })
        }, 500)

        return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, conversation?.unreadCount, markAsRead])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [conversationId])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !conversationId || !user || !conversation) return

        setIsSending(true)
        const content = inputValue
        setInputValue("") // Clear immediately

        try {
            await sendMessage({
                conversationId,
                projectId: conversation.projectId,
                content,
                isInternal: messageMode === "internal",
            })

            // If this is a Meta channel and it's a public message, relay to Meta
            if (
                messageMode !== "internal" &&
                (conversation.channel === "messenger" || conversation.channel === "instagram" || conversation.channel === "whatsapp")
            ) {
                try {
                    await sendMetaMsg({
                        conversationId,
                        content,
                    });
                } catch (metaErr) {
                    console.error("Failed to relay to Meta:", metaErr);
                }
            }

            if (
                messageMode !== "internal" &&
                conversation.channel === "telegram"
            ) {
                try {
                    await relayToTelegramMsg({
                        conversationId,
                        content,
                    });
                } catch (telegramErr) {
                    console.error("Failed to relay to Telegram:", telegramErr);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error)
            setInputValue(content) // Restore on error
        } finally {
            setIsSending(false)
        }
    }

    const handleResolve = async () => {
        if (!conversationId) return
        try {
            await resolveConversation({ id: conversationId })
        } catch (error) {
            console.error("Error resolving conversation:", error)
        }
    }

    const handleAssignToMe = async () => {
        if (!conversationId || !user) return;
        try {
            await updateConversation({
                id: conversationId,
                assignedTo: user.id
            });
            await sendSystemMessage({
                conversationId,
                content: t("system_assigned_to", { name: user.fullName || t("agent_fallback") }),
                senderType: "bot",
            });
        } catch (error) {
            console.error("Failed to assign:", error);
        }
    };

    const handleTransfer = async (agentUserId: string, agentName: string) => {
        if (!conversationId) return;
        try {
            setIsTransferDialogOpen(false);
            await updateConversation({
                id: conversationId,
                assignedTo: agentUserId,
            });
            await sendSystemMessage({
                conversationId,
                content: t("system_transferred_to_agent", { name: agentName }),
                senderType: "bot",
            });
            setAgentSearch("");
        } catch (error) {
            console.error("Failed to transfer conversation:", error);
        }
    }

    const handleDepartmentTransfer = async (departmentId: string, departmentName: string) => {
        if (!conversationId || !conversation) return;
        try {
            setIsDepartmentTransferDialogOpen(false);
            await transferToDept({
                id: conversationId,
                departmentId: departmentId as Id<"departments">,
            });
            await sendSystemMessage({
                conversationId,
                content: t("system_transferred_to_dept", { name: departmentName }),
                senderType: "bot",
            });
            setDepartmentSearch("");
        } catch (error) {
            console.error("Failed to transfer to department:", error);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showPicker && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter" || e.key === "Escape")) {
            if (e.key === "Enter") {
                e.preventDefault();
            }
            return;
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (messageMode !== "public") {
            setShowPicker(false);
            return;
        }

        const lastSlashIndex = val.lastIndexOf("/");
        if (lastSlashIndex !== -1 && (lastSlashIndex === 0 || val[lastSlashIndex - 1] === " " || val[lastSlashIndex - 1] === "\n")) {
            const query = val.slice(lastSlashIndex + 1);
            setPickerQuery(query);
            setShowPicker(true);
        } else {
            setShowPicker(false);
        }
    }

    const handlePickerSelect = (message: string) => {
        if (!conversation) return;

        let processedMessage = message;

        const visitorName = conversation.visitorName || t("visitor_fallback");
        const agentName = user?.fullName || t("agent_fallback");
        const projectName = activeProject?.name || "";
        const visitorEmail = conversation.visitorEmail || "";
        const ticketId = conversation._id || "";

        processedMessage = processedMessage.replace(/{{visitor_name}}/gi, visitorName);
        processedMessage = processedMessage.replace(/{{user_name}}/gi, visitorName);
        processedMessage = processedMessage.replace(/{{agent_name}}/gi, agentName);
        processedMessage = processedMessage.replace(/{{project_name}}/gi, projectName);
        processedMessage = processedMessage.replace(/{{user_email}}/gi, visitorEmail);
        processedMessage = processedMessage.replace(/{{ticket_id}}/gi, ticketId);

        const lastSlashIndex = inputValue.lastIndexOf("/");
        if (lastSlashIndex !== -1 && (lastSlashIndex === 0 || inputValue[lastSlashIndex - 1] === " " || inputValue[lastSlashIndex - 1] === "\n")) {
            const newValue = inputValue.substring(0, lastSlashIndex) + processedMessage;
            setInputValue(newValue);
        } else {
            setInputValue(prev => prev + processedMessage);
        }

        setShowPicker(false);
        setPickerQuery("");
    }

    if (!conversationId) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                {tMonitor("select_conversation")}
            </div>
        )
    }

    const isResolved = conversation?.status === CONVERSATION_STATUS.CLOSED

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center h-[73px] p-4 border-b shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    {onBack && (
                        <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onBack}>
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <Avatar className="shrink-0">
                        <AvatarFallback>
                            {(conversation?.visitorName ?? "V").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <div className="font-semibold truncate">{conversation?.visitorName || tVisitor("name_fallback")}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {isResolved ? t("status_resolved") : t("status_online")}
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    {onOpenContact && (
                        <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={onOpenContact}>
                            <Info className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    )}
                    {isResolved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hidden sm:flex">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t("status_resolved")}
                        </Badge>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResolve}
                            className="text-green-600 border-green-500/30 hover:bg-green-500/10 hidden sm:flex"
                        >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            {t("resolve_button")}
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={handleAssignToMe}
                                disabled={isResolved || conversation?.assignedTo === user?.id}
                            >
                                {tMonitor("menu_assign_me")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsTransferDialogOpen(true)}
                                disabled={isResolved}
                            >
                                {tMonitor("menu_transfer_agent")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDepartmentTransferDialogOpen(true)}
                                disabled={isResolved}
                            >
                                {tMonitor("menu_transfer_dept")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Transfer Dialog */}
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("transfer_dialog_title")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            placeholder={t("search_agents_placeholder")}
                            value={agentSearch}
                            onChange={(e) => setAgentSearch(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {projectMembers === undefined ? (
                                <div className="text-sm text-muted-foreground text-center py-4">{tMonitor("filter_agent_loading")}</div>
                            ) : projectMembers.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">{t("no_agents_found")}</div>
                            ) : (
                                projectMembers
                                    .filter(m => m.userId !== conversation?.assignedTo)
                                    .filter(m => {
                                        if (!agentSearch) return true;
                                        const name = m.profile?.fullName || "";
                                        return name.toLowerCase().includes(agentSearch.toLowerCase());
                                    })
                                    .map(m => (
                                        <button
                                            type="button"
                                            key={m.userId}
                                            onClick={() => handleTransfer(m.userId!, m.profile?.fullName || t("agent_fallback"))}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors w-full text-left"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={m.profile?.avatarUrl} />
                                                <AvatarFallback>{m.profile?.fullName?.charAt(0) || 'A'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{m.profile?.fullName || t("unknown_agent")}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{m.role}</span>
                                            </div>
                                        </button>
                                    ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Department Transfer Dialog */}
            <Dialog open={isDepartmentTransferDialogOpen} onOpenChange={setIsDepartmentTransferDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("transfer_to_dept_dialog_title")}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            placeholder={t("search_departments_placeholder")}
                            value={departmentSearch}
                            onChange={(e) => setDepartmentSearch(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {departments === undefined ? (
                                <div className="text-sm text-muted-foreground text-center py-4">{t("loading_departments")}</div>
                            ) : departments.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">{tMonitor("filter_dept_none")}</div>
                            ) : (
                                departments
                                    .filter(d => {
                                        if (!departmentSearch) return true;
                                        return d.name.toLowerCase().includes(departmentSearch.toLowerCase());
                                    })
                                    .map(d => (
                                        <button
                                            type="button"
                                            key={d._id}
                                            onClick={() => handleDepartmentTransfer(d._id, d.name)}
                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors border w-full text-left"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{d.name} {d.isDefault && <span className="text-xs text-muted-foreground ml-1">({t("default_dept_label")})</span>}</span>
                                                {d.description && <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.description}</span>}
                                            </div>
                                        </button>
                                    ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                {status === "LoadingFirstPage" ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (messages ?? []).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                        {t("no_messages_prompt")}
                    </div>
                ) : (
                    <>
                        {status !== "Exhausted" && (
                            <button
                                onClick={() => loadMore(30)}
                                className="mx-auto block w-fit text-xs text-muted-foreground hover:underline my-2"
                            >
                                {t("load_older_messages")}
                            </button>
                        )}
                        {[...messages].reverse().map((msg) => (
                            <div
                                key={msg._id}
                                className={cn(
                                    "flex",
                                    msg.senderType === "agent"
                                        ? "justify-end"
                                        : "justify-start"
                                )}
                            >
                                {msg.senderType === "agent" ? (
                                    msg.type === "internal" ? (
                                        <div className="flex flex-col items-end gap-1 max-w-[70%]">
                                            {msg.content && (
                                                <div className="p-3 rounded-lg bg-yellow-50/80 border border-yellow-200 text-yellow-900">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-700">{t("internal_note_badge")}</span>
                                                    </div>
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                            )}
                                            {msg.fileId && <MessageImage fileId={msg.fileId} fileName={msg.fileName} />}
                                            <span className="text-[10px] block text-yellow-700/70">
                                                {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1 max-w-[70%]">
                                            {msg.content && (
                                                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                            )}
                                            {msg.fileId && <MessageImage fileId={msg.fileId} fileName={msg.fileName} />}
                                            <span className="text-[10px] block text-muted-foreground/70">
                                                {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex gap-2 max-w-[70%]">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className={cn("text-xs", msg.senderType === "bot" && "bg-primary/20 text-primary")}>
                                                {msg.senderType === "bot" ? t("ai_fallback") : (msg.senderFullname ?? "V").substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground ml-1 mb-1 block">
                                                {msg.senderFullname || (msg.senderType === "bot" ? t("ai_assistant_name") : tVisitor("name_fallback"))}
                                            </span>
                                            {msg.content && (
                                                <div className="p-3 rounded-lg bg-muted">
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                            )}
                                            {msg.fileId && <MessageImage fileId={msg.fileId} fileName={msg.fileName} />}
                                            <span className="text-[10px] block text-muted-foreground">
                                                {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="mb-3 flex items-center justify-between">
                    <Tabs value={messageMode} onValueChange={(v) => setMessageMode(v as "public" | "internal")} className="w-[200px]">
                        <TabsList className="h-8 w-full grid grid-cols-2">
                            <TabsTrigger value="public" className="text-xs">{t("mode_public")}</TabsTrigger>
                            <TabsTrigger value="internal" className="text-xs">{t("mode_internal")}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className={cn(
                    "relative rounded-lg border shadow-sm focus-within:ring-1 transition-colors",
                    messageMode === "internal" ? "bg-yellow-50/50 border-yellow-200 focus-within:ring-yellow-300" : "bg-white focus-within:ring-ring"
                )}>
                    {showPicker && cannedResponses && (
                        <CannedResponsePicker
                            key={pickerQuery}
                            responses={cannedResponses}
                            query={pickerQuery}
                            onSelect={handlePickerSelect}
                            onClose={() => setShowPicker(false)}
                        />
                    )}
                    <Textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isResolved}
                        placeholder={isResolved ? t("resolved_placeholder") : (messageMode === "internal" ? t("internal_note_placeholder") : t("type_message_placeholder"))}
                        className={cn("min-h-[100px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0", messageMode === "internal" && "placeholder:text-yellow-700/50", isResolved && "cursor-not-allowed opacity-50")}
                    />
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" disabled={isResolved}>
                                <Smile className="h-4 w-4" />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || !conversationId || !user || !conversation) return
                                    setIsSending(true)
                                    try {
                                        await sendMessage({
                                            conversationId,
                                            projectId: conversation.projectId,
                                            content: `📎 ${file.name}`,
                                            isInternal: messageMode === "internal",
                                        })
                                    } catch (error) {
                                        console.error("Error sending attachment:", error)
                                    } finally {
                                        setIsSending(false)
                                        if (fileInputRef.current) fileInputRef.current.value = ""
                                    }
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isResolved}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={isSending || !inputValue.trim() || isResolved}
                            className={cn("gap-2", messageMode === "internal" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "")}
                        >
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {messageMode === "internal" ? t("save_note_button") : t("send_message_button")}
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ChatArea(props: ChatAreaProps) {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center bg-muted/10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <ChatAreaContent {...props} />
        </Suspense>
    )
}
