"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Paperclip, Send, Smile, Loader2, CheckCircle, MoreVertical } from "lucide-react"
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
import { useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { useUser, useOrganization } from "@clerk/nextjs"
import { useProject } from "@/context/ProjectContext"
import { CannedResponsePicker } from "../dashboard/monitor/canned-response-picker"

export function ChatArea() {
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId") as Id<"conversations"> | null
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
            fullName: `${m.publicUserData?.firstName ?? ''} ${m.publicUserData?.lastName ?? ''}`.trim() || m.publicUserData?.identifier || 'Agent',
            avatarUrl: m.publicUserData?.imageUrl,
        },
        role: m.role,
    }))

    const departments = useQuery(
        api.settings.listDepartments,
        conversation?.projectId ? { projectId: conversation.projectId } : "skip"
    );

    // Real-time messages — no subscriptions needed!
    const messages = useQuery(
        api.messages.list,
        conversationId ? { conversationId } : "skip"
    )

    const cannedResponses = useQuery(
        api.settings.listCannedResponses,
        conversation?.projectId ? { projectId: conversation.projectId } : "skip"
    );

    const sendMessage = useMutation(api.messages.sendMessage)
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
    }, [conversationId, conversation?.unreadCount, markAsRead])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

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
                content: `Conversation assigned to ${user.fullName || "agent"}`,
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
                content: `Conversation transferred to ${agentName}`,
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
                content: `Conversation transferred to ${departmentName}`,
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

        const visitorName = conversation.visitorName || "there";
        const agentName = user?.fullName || "Agent";
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
            setInputValue(inputValue + processedMessage);
        }

        setShowPicker(false);
        setPickerQuery("");
    }

    if (!conversationId) {
        return (
            <div className="flex h-full items-center justify-center bg-muted/10 text-muted-foreground">
                Select a conversation to start chatting
            </div>
        )
    }

    const isLoading = messages === undefined
    const isResolved = conversation?.status === 1000

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center h-[73px] p-4 border-b">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>
                            {(conversation?.visitorName ?? "V").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">{conversation?.visitorName || "Visitor"}</div>
                        <div className="text-xs text-muted-foreground">
                            {isResolved ? "Resolved" : "Online"}
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {isResolved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                        </Badge>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResolve}
                            className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                        >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Resolve
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
                                Assign to me
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsTransferDialogOpen(true)}
                                disabled={isResolved}
                            >
                                Transfer to agent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDepartmentTransferDialogOpen(true)}
                                disabled={isResolved}
                            >
                                Transfer to department
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Transfer Dialog */}
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Transfer Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            placeholder="Search agents..."
                            value={agentSearch}
                            onChange={(e) => setAgentSearch(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {projectMembers === undefined ? (
                                <div className="text-sm text-muted-foreground text-center py-4">Loading agents...</div>
                            ) : projectMembers.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">No agents found.</div>
                            ) : (
                                projectMembers
                                    .filter(m => m.userId !== conversation?.assignedTo)
                                    .filter(m => {
                                        if (!agentSearch) return true;
                                        const name = m.profile?.fullName || "";
                                        return name.toLowerCase().includes(agentSearch.toLowerCase());
                                    })
                                    .map(m => (
                                        <div
                                            key={m.userId}
                                            onClick={() => handleTransfer(m.userId!, m.profile?.fullName || 'Agent')}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={m.profile?.avatarUrl} />
                                                <AvatarFallback>{m.profile?.fullName?.charAt(0) || 'A'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{m.profile?.fullName || 'Unknown Agent'}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{m.role}</span>
                                            </div>
                                        </div>
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
                        <DialogTitle>Transfer to Department</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            placeholder="Search departments..."
                            value={departmentSearch}
                            onChange={(e) => setDepartmentSearch(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {departments === undefined ? (
                                <div className="text-sm text-muted-foreground text-center py-4">Loading departments...</div>
                            ) : departments.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">No departments found.</div>
                            ) : (
                                departments
                                    .filter(d => {
                                        if (!departmentSearch) return true;
                                        return d.name.toLowerCase().includes(departmentSearch.toLowerCase());
                                    })
                                    .map(d => (
                                        <div
                                            key={d._id}
                                            onClick={() => handleDepartmentTransfer(d._id, d.name)}
                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors border"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{d.name} {d.isDefault && <span className="text-xs text-muted-foreground ml-1">(Default)</span>}</span>
                                                {d.description && <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.description}</span>}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (messages ?? []).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    (messages ?? []).map((msg) => (
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
                                    <div className="p-3 rounded-lg max-w-[70%] bg-yellow-50/80 border border-yellow-200 text-yellow-900">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-700">Internal Note</span>
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                        <span className="text-[10px] mt-1 block text-yellow-700/70">
                                            {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg max-w-[70%] bg-primary text-primary-foreground">
                                        <p className="text-sm">{msg.content}</p>
                                        <span className="text-[10px] mt-1 block text-primary-foreground/70">
                                            {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                        </span>
                                    </div>
                                )
                            ) : (
                                <div className="flex gap-2 max-w-[70%]">
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarFallback className={cn("text-xs", msg.senderType === "bot" && "bg-primary/20 text-primary")}>
                                            {msg.senderType === "bot" ? "AI" : (msg.senderFullname ?? "V").substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="text-xs text-muted-foreground ml-1 mb-1 block">
                                            {msg.senderFullname || (msg.senderType === "bot" ? "AI Assistant" : "Visitor")}
                                        </span>
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm">{msg.content}</p>
                                            <span className="text-[10px] mt-1 block text-muted-foreground">
                                                {formatDistanceToNow(new Date(msg._creationTime), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="mb-3 flex items-center justify-between">
                    <Tabs value={messageMode} onValueChange={(v) => setMessageMode(v as any)} className="w-[200px]">
                        <TabsList className="h-8 w-full grid grid-cols-2">
                            <TabsTrigger value="public" className="text-xs">Public</TabsTrigger>
                            <TabsTrigger value="internal" className="text-xs">Internal</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className={cn(
                    "relative rounded-lg border shadow-sm focus-within:ring-1 transition-colors",
                    messageMode === "internal" ? "bg-yellow-50/50 border-yellow-200 focus-within:ring-yellow-300" : "bg-white focus-within:ring-ring"
                )}>
                    {showPicker && cannedResponses && (
                        <CannedResponsePicker
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
                        placeholder={isResolved ? "This conversation is resolved" : (messageMode === "internal" ? "Leave an internal note..." : "Type your message...")}
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
                            {messageMode === "internal" ? "Save Note" : "Send Message"}
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
