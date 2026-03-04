import { ComponentProps, useState } from "react"


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
}

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, SlidersHorizontal, Tag } from "lucide-react"

import { MessageCircle, Globe, Facebook, Mail } from "lucide-react"

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

interface ConversationListProps {
    items: Conversation[]
    selectedId: string | null
    onSelect: (id: string) => void
}

const getChannelIcon = (channel: string) => {
    switch (channel) {
        case "whatsapp": return <MessageCircle className="h-3 w-3" />
        case "facebook": return <Facebook className="h-3 w-3" />
        case "email": return <Mail className="h-3 w-3" />
        default: return <Globe className="h-3 w-3" />
    }
}

export function ConversationList({
    items,
    selectedId,
    onSelect,
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
    const [activeDept, setActiveDept] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<"timestamp" | "priority">("timestamp")

    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

    const filteredItems = items
        .filter((item) => {
            const matchesLabel = activeLabel ? item.tags?.includes(activeLabel) : true;
            const matchesDept = activeDept ? item.details?.department === activeDept : true;
            return matchesLabel && matchesDept;
        })
        .sort((a, b) => {
            if (sortBy === "priority") {
                const priorityA = a.priority || "normal";
                const priorityB = b.priority || "normal";
                if (priorityOrder[priorityA] !== priorityOrder[priorityB]) {
                    return priorityOrder[priorityA] - priorityOrder[priorityB];
                }
            }
            return b.timestamp - a.timestamp;
        });

    return (
        <div className="flex h-full flex-col">


            <div className="p-4 pb-2 space-y-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-8" />
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
                                variant={activeDept ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <Filter className="mr-2 h-3 w-3" />
                                {activeDept ? `Dept: ${activeDept}` : "Dept"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]" align="start">
                            <DropdownMenuLabel className="text-xs font-medium">Filter by department</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setActiveDept(null)} className="text-xs">
                                All Departments
                            </DropdownMenuItem>
                            {departments?.map((dept) => (
                                <DropdownMenuItem
                                    key={dept._id}
                                    onClick={() => setActiveDept(dept.name)}
                                    className="text-xs"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="truncate">{dept.name}</span>
                                        {activeDept === dept.name && (
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
                    <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                        <Filter className="mr-2 h-3 w-3" />
                        Agent
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={sortBy === "priority" ? "default" : "outline"}
                                size="sm"
                                className="h-8 text-xs shrink-0"
                            >
                                <SlidersHorizontal className="mr-2 h-3 w-3" />
                                {sortBy === "priority" ? "Sort: Priority" : "Sort: Recent"}
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                        <SlidersHorizontal className="mr-2 h-3 w-3" />
                        Status
                    </Button>
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
                                                {item.priority === "urgent" && (
                                                    <Badge className="h-4 px-1 text-[9px] bg-red-600 hover:bg-red-600 text-white border-none uppercase font-bold">Urgent</Badge>
                                                )}
                                                {item.priority === "high" && (
                                                    <Badge className="h-4 px-1 text-[9px] bg-orange-500 hover:bg-orange-500 text-white border-none uppercase font-bold">High</Badge>
                                                )}
                                                {item.priority === "low" && (
                                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-slate-200 text-slate-700 hover:bg-slate-200 border-none uppercase font-bold">Low</Badge>
                                                )}
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
                            No conversations match this label.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
