import { ComponentProps } from "react"


import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Conversation } from "./data"
import { TeammatesCarousel } from "./teammates-carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, SlidersHorizontal } from "lucide-react"

import { MessageCircle, Globe, Facebook, Mail } from "lucide-react"

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
    return (
        <div className="flex h-full flex-col">
            <TeammatesCarousel />

            <div className="p-4 pb-2 space-y-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-8" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Filter className="mr-2 h-3 w-3" />
                        Dept
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Filter className="mr-2 h-3 w-3" />
                        Agent
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                        <SlidersHorizontal className="mr-2 h-3 w-3" />
                        Status
                    </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Active (3)</span>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Served</span>
                        <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500"></div> Unserved</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2 p-4 pt-0">
                    {items.map((item) => (
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
                                            <span className="font-semibold">{item.user.name}</span>
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
                                        {item.timestamp}
                                    </div>
                                </div>
                                <div className="text-xs font-medium ml-11">{item.lastMessage}</div>
                            </div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                {item.lastMessage.substring(0, 300)}
                            </div>
                            {item.tags.length ? (
                                <div className="flex items-center gap-2">
                                    {item.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            ) : null}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
