# Monitor Section Audit Report

This report provides a full context audit of the Monitor section in the Yoosr project.

## 1. Conversation List Component
**File Path**: `src/components/dashboard/monitor/conversation-list.tsx`

```tsx
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
```

## 2. Main Monitor Page
**File Path**: `src/app/dashboard/monitor/page.tsx`

```tsx
import MonitorLayout from "@/components/dashboard/monitor/monitor-layout"

export default function MonitorPage() {
    return <MonitorLayout />
}
```

**File Path (Layout Component)**: `src/components/dashboard/monitor/monitor-layout.tsx`

```tsx
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
import { ContactInfo } from "./contact-info"
import { conversations } from "./data"

export default function MonitorLayout() {
    const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(
        conversations[0].id
    )

    const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId
    )

    return (
        <div className="h-[calc(100vh-5rem)] w-full">
            <div className="flex h-full flex-col">
                <div className="flex items-center px-4 py-2">
                    <h1 className="text-xl font-bold">Monitor</h1>
                </div>
                <Separator />
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full items-stretch"
                >
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                        <ConversationList
                            items={conversations}
                            selectedId={selectedConversationId}
                            onSelect={setSelectedConversationId}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        {selectedConversation ? (
                            <ChatDisplay conversation={selectedConversation} />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-muted-foreground">Select a conversation</span>
                            </div>
                        )}
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                        {selectedConversation ? (
                            <ContactInfo conversation={selectedConversation} />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-muted-foreground">No contact selected</span>
                            </div>
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
```

## 3. Data Fetching Logic (Convex Queries)
**File Path**: `convex/conversations.ts`

> [!NOTE]
> The Monitor section currently uses **mock data** from `src/components/dashboard/monitor/data.ts`. The actual Convex queries for conversations are defined in the backend but not yet wired to this specific monitor UI.

```typescript
// List conversations for a project
export const list = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("conversations")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    },
});

// Get a single conversation
export const get = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db.get(args.id);
    },
});
```

## 4. Chat Display Component
**File Path**: `src/components/dashboard/monitor/chat-display.tsx`

```tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Conversation } from "./data"
import { Send, MoreVertical, Phone, Video, Paperclip, Smile, Archive, LogIn } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { cn } from "@/lib/utils"


interface ChatDisplayProps {
    conversation: Conversation | null
}

export function ChatDisplay({ conversation }: ChatDisplayProps) {
    const [messageMode, setMessageMode] = useState<"public" | "internal">("public")

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
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                        <LogIn className="h-4 w-4" />
                        Join
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Archive className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-6">
                    {/* Mock Date Divider */}
                    <div className="flex items-center justify-center">
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-muted-foreground">Today</div>
                    </div>

                    {/* Customer Message */}
                    <div className="flex items-end gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={conversation.user.avatar} />
                            <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[75%]">
                            <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm border border-slate-100 text-sm">
                                {conversation.lastMessage}
                            </div>
                            <span className="mt-1 block text-[10px] text-muted-foreground ml-1">
                                {conversation.timestamp}
                            </span>
                        </div>
                    </div>
                    {/* ... other messages ... */}
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
                {/* ... input elements ... */}
            </div>
        </div>
    )
}
import { MessageCircle } from "lucide-react"
```

## 5. Contact Info Panel Component
**File Path**: `src/components/dashboard/monitor/contact-info.tsx`

```tsx
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Conversation } from "./data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Clock, Building, Globe, Laptop, ExternalLink, MapPin } from "lucide-react"

interface ContactInfoProps {
    conversation: Conversation | null
}

export function ContactInfo({ conversation }: ContactInfoProps) {
    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
                Select a conversation to view details
            </div>
        )
    }

    const details = (conversation as any).details || {}

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="p-6 flex flex-col items-center gap-4 bg-slate-50/50">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                    <AvatarImage src={conversation.user.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">{conversation.user.initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-xl font-bold">{conversation.user.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${conversation.user.email}`} className="hover:underline">{conversation.user.email}</a>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="p-4 space-y-6">
                {/* Key Info */}
                <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Created</span>
                        <span>{conversation.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" /> Department</span>
                        <span className="font-medium">{details.department || "General"}</span>
                    </div>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {conversation.tags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* More Info Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    {/* ... details ... */}
                </Accordion>
            </div>
        </div>
    )
}
```
