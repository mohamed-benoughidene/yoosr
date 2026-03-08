import { ComponentProps, useState } from "react"
import { useOrganization } from "@clerk/nextjs"


import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
export interface Conversation {
    id: string;
    status: number;
    tags: string[];
    participants: string[];
    createdAt: number;
    lastMessage: string;
    timestamp: number;
    assignedTo?: string | null;
    assignedAgent?: { name: string; avatarUrl?: string } | null;
    channel: string;
    unread: number;
    user: {
        name: string;
        email: string;
        avatar?: string;
        initials: string;
    };
    details: {
        department?: string;
        location?: string;
        language?: string;
        os?: string;
        browser?: string;
        sourcePage?: string;
        ip?: string;
    };
    priority?: "low" | "normal" | "high" | "urgent";
    firstResponseAt?: number;
    slaDeadline?: number;
}

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, SlidersHorizontal, Tag } from "lucide-react"

import { MessageCircle, Globe, Facebook, Mail, Instagram, Send } from "lucide-react"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { Id } from "../../../../convex/_generated/dataModel"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export interface ConversationListProps {
    items: Conversation[]
    selectedId: string | null
    onSelect: (id: string) => void
    activeDeptId: Id<"departments"> | null
    onDeptChange: (id: Id<"departments"> | null) => void
}

const getChannelIcon = (channel: string) => {
    switch (channel) {
        case "messenger": return <MessageCircle className="h-3 w-3 text-indigo-500" />
        case "instagram": return <Instagram className="h-3 w-3 text-pink-500" />
        case "telegram": return <Send className="h-3 w-3 text-sky-500" />
        case "whatsapp": return <MessageCircle className="h-3 w-3 text-green-500" />
        case "email": return <Mail className="h-3 w-3 text-orange-500" />
        default: return <Globe className="h-3 w-3 text-muted-foreground" />
    }
}

export function ConversationList({
    items,
    selectedId,
    onSelect,
    activeDeptId,
    onDeptChange,
}: ConversationListProps) {
    const { activeProject } = useProject()
    const projectId = activeProject?._id

    const labels = useQuery(
        api.labels.listLabels,
        projectId ? { projectId } : "skip"
    )

    const departments = useQuery(
        api.settings.listDepartments,
        projectId ? { projectId } : "skip"
    )

    const [activeLabel, setActiveLabel] = useState<string | null>(null)
    const [activeStatus, setActiveStatus] = useState<number | null>(null)
    const [activeAgent, setActiveAgent] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<"timestamp" | "priority" | "sla">("timestamp")
    const [searchQuery, setSearchQuery] = useState("")

    const { memberships, isLoaded: membersLoaded } = useOrganization({
        memberships: {
            infinite: true,
            keepPreviousData: true,
        },
    });

    const agents = (memberships?.data ?? []).map((m) => ({
        id: m.publicUserData?.userId ?? "",
        name: `${m.publicUserData?.firstName ?? ""} ${m.publicUserData?.lastName ?? ""}`.trim() || m.publicUserData?.identifier || "Agent",
    })).filter(a => a.id !== "");

    const activeAgentName = agents?.find(a => a.id === activeAgent)?.name;
    const activeDeptName = departments?.find(d => d._id === activeDeptId)?.name;

    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

    const filteredItems = items
        .filter((item) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = query
                ? item.user.name.toLowerCase().includes(query) ||
                item.user.email.toLowerCase().includes(query) ||
                item.lastMessage.toLowerCase().includes(query)
                : true;
            const matchesLabel = activeLabel ? item.tags?.includes(activeLabel) : true;
            const matchesStatus = activeStatus !== null ? item.status === activeStatus : true;
            const matchesAgent = activeAgent ? item.assignedTo === activeAgent : true;
            return matchesSearch && matchesLabel && matchesStatus && matchesAgent;
        })
        .sort((a, b) => {
            if (sortBy === "priority") {
                const priorityA = a.priority || "normal";
                const priorityB = b.priority || "normal";
                if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
                    return priorityOrder[priorityA] - priorityOrder[priorityB];
                }
            }
            if (sortBy === "sla") {
                const isRespondedA = !!a.firstResponseAt;
                const isRespondedB = !!b.firstResponseAt;

                // 1. Responded go to bottom
                if (isRespondedA !== isRespondedB) {
                    return isRespondedA ? 1 : -1;
                }

                // 2. No deadline go after those with one
                const hasSlaA = !!a.slaDeadline;
                const hasSlaB = !!b.slaDeadline;

                if (hasSlaA !== hasSlaB) {
                    return hasSlaA ? -1 : 1;
                }

                // 3. Deadline ascending
                if (hasSlaA && hasSlaB && a.slaDeadline !== b.slaDeadline) {
                    return (a.slaDeadline!) - (b.slaDeadline!);
                }

                // 4. Default fallback to timestamp
                return b.timestamp - a.timestamp;
            }
            return b.timestamp - a.timestamp;
        });

    return (
        <div className="flex h-full flex-col">


            <div className="p-4 pb-2 space-y-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={activeLabel ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <Tag className="mr-2 h-3 w-3" />
                                {activeLabel ? `Label: ${activeLabel}` : "Label"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2" align="start">
                            <div className="flex flex-col gap-1">
                                <div className="text-xs font-medium text-muted-foreground mb-1 px-2">Filter by label</div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start font-normal h-8"
                                    onClick={() => setActiveLabel(null)}
                                >
                                    All Conversations
                                </Button>
                                {labels?.map((label) => (
                                    <Button
                                        key={label._id}
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start font-normal h-8 flex items-center gap-2"
                                        onClick={() => setActiveLabel(activeLabel === label.name ? null : label.name)}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: label.color }}
                                        />
                                        <span className="truncate">{label.name}</span>
                                        {activeLabel === label.name && (
                                            <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </Button>
                                ))}
                                {labels && labels.length === 0 && (
                                    <div className="text-xs text-muted-foreground p-2 text-center">
                                        No labels found
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={activeDeptId ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <Filter className="mr-2 h-3 w-3" />
                                {activeDeptId ? `Dept: ${activeDeptName}` : "Dept"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]" align="start">
                            <DropdownMenuLabel className="text-xs font-medium">Filter by department</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDeptChange(null)} className="text-xs">
                                All Departments
                            </DropdownMenuItem>
                            {departments?.map((dept) => (
                                <DropdownMenuItem
                                    key={dept._id}
                                    onClick={() => onDeptChange(dept._id)}
                                    className="text-xs"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="truncate">{dept.name}</span>
                                        {activeDeptId === dept._id && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            {departments && departments.length === 0 && (
                                <div className="text-[10px] text-muted-foreground p-2 text-center italic">
                                    No departments configured
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={activeAgent ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <Filter className="mr-2 h-3 w-3" />
                                {activeAgent ? `Agent: ${activeAgentName}` : "Agent"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]" align="start">
                            <DropdownMenuLabel className="text-xs font-medium">Filter by agent</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setActiveAgent(null)} className="text-xs">
                                All Agents
                            </DropdownMenuItem>
                            {agents?.map((agent) => (
                                <DropdownMenuItem
                                    key={agent.id}
                                    onClick={() => setActiveAgent(agent.id)}
                                    className="text-xs"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="truncate">{agent.name}</span>
                                        {activeAgent === agent.id && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            {!membersLoaded && (
                                <div className="text-[10px] text-muted-foreground p-2 text-center italic">
                                    Loading members...
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={sortBy !== "timestamp" ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <SlidersHorizontal className="mr-2 h-3 w-3" />
                                {sortBy === "priority" ? "Sort: Priority" :
                                    sortBy === "sla" ? "Sort: SLA" : "Sort: Recent"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[150px]">
                            <DropdownMenuLabel className="text-xs font-medium">Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortBy("timestamp")} className="text-xs">
                                Recent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("priority")} className="text-xs">
                                Priority
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("sla")} className="text-xs">
                                SLA Deadline
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={activeStatus !== null ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <SlidersHorizontal className="mr-2 h-3 w-3" />
                                {activeStatus === 100 ? "Status: Open" :
                                    activeStatus === 200 ? "Status: Assigned" : "Status"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[160px]" align="start">
                            <DropdownMenuLabel className="text-xs font-medium">Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setActiveStatus(null)} className="text-xs">
                                All Statuses
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveStatus(100)} className="text-xs">
                                <div className="flex items-center justify-between w-full">
                                    <span>Open</span>
                                    {activeStatus === 100 && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveStatus(200)} className="text-xs">
                                <div className="flex items-center justify-between w-full">
                                    <span>Assigned</span>
                                    {activeStatus === 200 && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Active ({filteredItems.length})</span>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Served</span>
                        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500"></div> Unserved</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-4 pt-0">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            className={cn(
                                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                                selectedId === item.id && "bg-muted"
                            )}
                            onClick={() => onSelect(item.id)}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={item.user.avatar} alt={item.user.name} />
                                                <AvatarFallback>{item.user.initials}</AvatarFallback>
                                            </Avatar>
                                            {/* Status indicator could go here */}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{item.user.name}</span>
                                                {item.channel === "messenger" && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="inline-flex items-center ml-1 shrink-0">
                                                                    <MessageCircle className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/10" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right">Messenger</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {item.channel === "instagram" && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-fuchsia-600 text-[8px] font-bold text-white ml-1 shrink-0">
                                                                    IG
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="right">Instagram</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {item.priority === "urgent" && (
                                                    <Badge className="h-4 px-1 text-[9px] bg-red-600 hover:bg-red-600 text-white border-none uppercase font-bold">Urgent</Badge>
                                                )}
                                                {item.priority === "high" && (
                                                    <Badge className="h-4 px-1 text-[9px] bg-orange-500 hover:bg-orange-500 text-white border-none uppercase font-bold">High</Badge>
                                                )}
                                                {item.priority === "low" && (
                                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-slate-200 text-slate-700 hover:bg-slate-200 border-none uppercase font-bold">Low</Badge>
                                                )}
                                                {item.slaDeadline && !item.firstResponseAt && (() => {
                                                    const timeRemaining = item.slaDeadline - Date.now();
                                                    if (timeRemaining <= 0) {
                                                        return <Badge className="h-4 px-1 text-[9px] bg-red-600 hover:bg-red-600 text-white border-none uppercase font-bold">Overdue</Badge>;
                                                    }

                                                    const isAmber = timeRemaining <= 30 * 60 * 1000;
                                                    const hours = Math.floor(timeRemaining / 3600000);
                                                    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
                                                    const label = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

                                                    if (isAmber) {
                                                        return <Badge className="h-4 px-1 text-[9px] bg-amber-500 hover:bg-amber-500 text-white border-none uppercase font-bold">{label}</Badge>;
                                                    }

                                                    return <Badge className="h-4 px-1 text-[9px] bg-emerald-500 hover:bg-emerald-500 text-white border-none uppercase font-bold">{label}</Badge>;
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                {getChannelIcon(item.channel)}
                                                <span className="capitalize">{item.channel}</span>
                                            </div>
                                        </div>
                                        {item.unread > 0 && (
                                            <span className="ml-auto flex h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "ml-auto text-xs",
                                            selectedId === item.id
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {new Intl.DateTimeFormat("en", {
                                            timeStyle: "short"
                                        }).format(new Date(item.timestamp))}
                                    </div>
                                </div>
                                <div className="text-xs font-medium ml-11 line-clamp-1">{item.lastMessage}</div>
                            </div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                {item.lastMessage.substring(0, 300)}
                            </div>
                            {item.tags.length ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {item.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : null}
                        </button>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="text-sm text-center text-muted-foreground py-8">
                            {searchQuery ? "No conversations match your search." : "No conversations found."}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
