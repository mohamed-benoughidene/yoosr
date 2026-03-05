import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Conversation } from "./conversation-list"
import { Send, MoreVertical, Paperclip, Smile, LogIn, LogOut, MessageCircle, ChevronDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, usePaginatedQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { useProject } from "@/context/ProjectContext"
import { useUser, useOrganization } from "@clerk/nextjs"
import { CannedResponsePicker } from "./canned-response-picker"

interface ChatDisplayProps {
    conversation: Conversation | null
}

export function ChatDisplay({ conversation }: ChatDisplayProps) {
    const { activeProject } = useProject()
    const projectId = activeProject?._id

    const [messageMode, setMessageMode] = useState<"public" | "internal">("public")
    const [inputValue, setInputValue] = useState("")
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
    const [agentSearch, setAgentSearch] = useState("")
    const [isDepartmentTransferDialogOpen, setIsDepartmentTransferDialogOpen] = useState(false)
    const [departmentSearch, setDepartmentSearch] = useState("")
    const { user } = useUser()
    const [showPicker, setShowPicker] = useState(false)
    const [pickerQuery, setPickerQuery] = useState("")

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
        projectId ? { projectId: projectId as Id<"projects"> } : "skip"
    );

    const { results, status, loadMore } = usePaginatedQuery(
        api.messages.getMessages,
        conversation ? { conversationId: conversation.id as Id<"conversations"> } : "skip",
        { initialNumItems: 30 }
    );

    const cannedResponses = useQuery(
        api.settings.listCannedResponses,
        projectId ? { projectId: projectId as Id<"projects"> } : "skip"
    );

    const sendMessage = useMutation(api.messages.sendMessage);
    const sendMetaMsg = useMutation(api.conversations.relayToMeta);
    const joinConversation = useMutation(api.conversations.join);
    const leaveConversation = useMutation(api.conversations.leave);
    const closeConversation = useMutation(api.conversations.resolve);
    const updateConversationStatus = useMutation(api.conversations.updateConversationStatus);
    const updateConversation = useMutation(api.conversations.update);
    const transferToDept = useMutation(api.conversations.transferToDepartment);
    const sendSystemMessage = useMutation(api.messages.send);

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when opening the conversation
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversation?.id])

    const handleSend = async () => {
        if (!inputValue.trim() || !conversation || !projectId) return;

        const content = inputValue;
        setInputValue(""); // immediately clear to feel responsive

        try {
            await sendMessage({
                conversationId: conversation.id as Id<"conversations">,
                projectId: projectId as Id<"projects">,
                content,
                isInternal: messageMode === "internal"
            });

            // If this is a Meta channel and it's a public message, relay to Meta
            if (
                messageMode !== "internal" &&
                (conversation.channel === "messenger" || conversation.channel === "instagram")
            ) {
                try {
                    await sendMetaMsg({
                        conversationId: conversation.id as Id<"conversations">,
                        content,
                    });
                } catch (metaErr) {
                    console.error("Failed to relay to Meta:", metaErr);
                }
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // In a real app, restore input value and show toast
        }
    }

    const handleSendAsOpen = async () => {
        if (!conversation) return;
        await handleSend();
        try {
            await updateConversationStatus({
                id: conversation.id as Id<"conversations">,
                status: 100,
            });
        } catch (error) {
            console.error("Failed to send as open:", error);
        }
    }

    const handleSendAsPending = async () => {
        if (!conversation) return;
        await handleSend();
        try {
            await updateConversationStatus({
                id: conversation.id as Id<"conversations">,
                status: 100,
                botPaused: false
            });
        } catch (error) {
            console.error("Failed to set status to pending:", error);
        }
    }

    const handleSendAsResolved = async () => {
        if (!conversation) return;
        await handleSend();
        try {
            // Note: closeConversation uses the dedicated `resolve` endpoint which tracks resolvedBy properly
            await closeConversation({ id: conversation.id as Id<"conversations"> });
        } catch (error) {
            console.error("Failed to resolve conversation:", error);
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
            e.preventDefault();
            handleSend();
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

        const visitorName = conversation.user?.name || "there";
        const agentName = user?.fullName || "Agent";
        const projectName = activeProject?.name || "";
        const visitorEmail = conversation.user?.email || "";
        const ticketId = conversation.id || "";

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

    const handleJoinLeave = async () => {
        if (!conversation || !user) return;

        try {
            if (isJoined) {
                await leaveConversation({ id: conversation.id as Id<"conversations"> });
            } else {
                await joinConversation({ id: conversation.id as Id<"conversations"> });
            }
        } catch (error) {
            console.error("Failed to toggle join status:", error);
        }
    }

    const handleClose = async () => {
        if (!conversation) return;
        try {
            await closeConversation({ id: conversation.id as Id<"conversations"> });
        } catch (error) {
            console.error("Failed to close conversation:", error);
        }
    }

    const handleTransfer = async (agentUserId: string, agentName: string) => {
        if (!conversation) return;
        try {
            setIsTransferDialogOpen(false);
            await updateConversation({
                id: conversation.id as Id<"conversations">,
                assignedTo: agentUserId,
            });
            await sendSystemMessage({
                conversationId: conversation.id as Id<"conversations">,
                content: `Conversation transferred to ${agentName}`,
                senderType: "bot",
            });
            setAgentSearch("");
        } catch (error) {
            console.error("Failed to transfer conversation:", error);
        }
    }

    const handleDepartmentTransfer = async (departmentId: string, departmentName: string) => {
        if (!conversation) return;
        try {
            setIsDepartmentTransferDialogOpen(false);
            await transferToDept({
                id: conversation.id as Id<"conversations">,
                departmentId: departmentId as Id<"departments">,
            });
            await sendSystemMessage({
                conversationId: conversation.id as Id<"conversations">,
                content: `Conversation transferred to ${departmentName}`,
                senderType: "bot",
            });
            setDepartmentSearch("");
        } catch (error) {
            console.error("Failed to transfer to department:", error);
        }
    }

    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <MessageCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium">No conversation selected</h3>
                    <p className="text-sm text-muted-foreground">Select a conversation from the list to start chatting.</p>
                </div>
            </div>
        )
    }

    const isJoined = Boolean(user && conversation.participants?.includes(user.id))

    return (
        <div className="flex h-full flex-col bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-background p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold">{conversation.user.name}</div>
                        <div className="text-xs text-muted-foreground">{conversation.user.email}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={isJoined ? "secondary" : "outline"}
                        size="sm"
                        className="h-9 gap-2"
                        onClick={handleJoinLeave}
                    >
                        {isJoined ? (
                            <>
                                <LogOut className="h-4 w-4" />
                                Leave
                            </>
                        ) : (
                            <>
                                <LogIn className="h-4 w-4" />
                                Join
                            </>
                        )}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => joinConversation({ id: conversation.id as Id<"conversations"> })}
                                disabled={isJoined || conversation.status === 1000}
                            >
                                Assign to me
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsTransferDialogOpen(true)}
                                disabled={conversation.status === 1000}
                            >
                                Transfer to agent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDepartmentTransferDialogOpen(true)}
                                disabled={conversation.status === 1000}
                            >
                                Transfer to department
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleClose}
                                disabled={conversation.status === 1000}
                            >
                                Resolve conversation
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
                                    .filter(m => m.userId !== conversation.assignedTo)
                                    .filter(m => {
                                        if (!agentSearch) return true;
                                        const name = m.profile?.fullName || "";
                                        return name.toLowerCase().includes(agentSearch.toLowerCase());
                                    })
                                    .map(m => (
                                        <div
                                            key={m.userId}
                                            onClick={() => handleTransfer(m.userId, m.profile?.fullName || 'Agent')}
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-6">
                    {status === "LoadingFirstPage" ? (
                        <div className="flex flex-col gap-4 max-w-lg">
                            <Skeleton className="h-12 w-64 rounded-2xl rounded-tl-none" />
                            <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-none" />
                            <div className="flex justify-end">
                                <Skeleton className="h-12 w-56 rounded-2xl rounded-tr-none" />
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center">
                            <span className="text-sm text-muted-foreground">No messages yet. Send a message to start!</span>
                        </div>
                    ) : (
                        <>
                            {status !== "Exhausted" && (
                                <button
                                    onClick={() => loadMore(30)}
                                    className="mx-auto block w-fit text-xs text-muted-foreground hover:underline my-2"
                                >
                                    Load older messages
                                </button>
                            )}
                            {[...results].reverse().map((msg: any) => {
                                const isLead = msg.senderType === "visitor";
                                const isInternal = msg.isInternal;

                                const timeFormat = new Intl.DateTimeFormat("en", {
                                    timeStyle: "short"
                                }).format(new Date(msg.createdAt));

                                if (isLead) {
                                    return (
                                        <div key={msg.id} className="flex items-end gap-3">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={conversation.user.avatar} />
                                                <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="max-w-[75%]">
                                                <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm border border-slate-100 text-sm whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                                <span className="mt-1 block text-[10px] text-muted-foreground ml-1">
                                                    {timeFormat}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                } else {
                                    // Agent or bot message
                                    return (
                                        <div key={msg.id} className="flex items-end gap-3 flex-row-reverse">
                                            <Avatar className={cn("h-8 w-8 border", isInternal ? "bg-yellow-100" : "bg-blue-100")}>
                                                <AvatarImage src={msg.senderType === "agent" ? "https://github.com/shadcn.png" : undefined} />
                                                <AvatarFallback className={isInternal ? "text-yellow-700" : "text-blue-700"}>
                                                    {msg.senderType === "bot" ? "BOT" : "AG"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="max-w-[75%]">
                                                <div className={cn(
                                                    "rounded-2xl rounded-tr-none p-3 shadow-sm text-sm whitespace-pre-wrap",
                                                    isInternal
                                                        ? "bg-yellow-50 border border-yellow-100 text-foreground"
                                                        : "bg-primary text-primary-foreground"
                                                )}>
                                                    {isInternal && (
                                                        <span className="mb-1 block text-[10px] font-semibold text-yellow-700 uppercase tracking-wider">Internal Note</span>
                                                    )}
                                                    {msg.content}
                                                </div>
                                                <span className="mt-1 block text-[10px] text-muted-foreground mr-1 text-right">
                                                    {timeFormat}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Footer / Input Area */}
            <div className="border-t bg-background p-4">
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
                        disabled={conversation.status === 1000}
                        placeholder={conversation.status === 1000 ? "This conversation is resolved" : (messageMode === "internal" ? "Add an internal note..." : "Type your message...")}
                        className={cn("min-h-[80px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0", messageMode === "internal" && "placeholder:text-yellow-700/50", conversation.status === 1000 && "cursor-not-allowed opacity-50")}
                    />

                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={conversation.status === 1000}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={conversation.status === 1000}>
                                <Smile className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {messageMode === "internal" ? (
                                <Button
                                    size="sm"
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || conversation.status === 1000}
                                    className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                    Save Note
                                    <Send className="h-3 w-3" />
                                </Button>
                            ) : (
                                <div className="flex items-center shadow-sm rounded-md">
                                    <Button
                                        size="sm"
                                        onClick={handleSendAsOpen}
                                        disabled={!inputValue.trim() || conversation.status === 1000}
                                        className="gap-2 rounded-r-none border-r border-primary-foreground/20"
                                    >
                                        Send as Open
                                        <Send className="h-3 w-3" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="sm"
                                                disabled={!inputValue.trim() || conversation.status === 1000}
                                                className="rounded-l-none px-2"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleSendAsResolved}>Send as Resolved</DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleSendAsPending}>Send as Pending</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

