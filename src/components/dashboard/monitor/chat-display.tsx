
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

                    {/* Internal Note Mock */}
                    <div className="flex items-end gap-3 flex-row-reverse">
                        <Avatar className="h-8 w-8 border bg-yellow-100">
                            <AvatarFallback className="text-yellow-700">ME</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[75%]">
                            <div className="rounded-2xl rounded-tr-none bg-yellow-50 p-3 shadow-sm border border-yellow-100 text-sm">
                                <span className="mb-1 block text-[10px] font-semibold text-yellow-700 uppercase tracking-wider">Internal Note</span>
                                This customer is asking about the enterprise plan pricing.
                            </div>
                            <span className="mt-1 block text-[10px] text-muted-foreground mr-1 text-right">
                                10:35 AM
                            </span>
                        </div>
                    </div>


                    {/* Agent Message */}
                    <div className="flex items-end gap-3 flex-row-reverse">
                        <Avatar className="h-8 w-8 border bg-blue-100">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback className="text-blue-700">ME</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[75%]">
                            <div className="rounded-2xl rounded-tr-none bg-blue-600 p-3 shadow-sm text-sm text-white">
                                Hello! How can I help you today?
                            </div>
                            <span className="mt-1 block text-[10px] text-muted-foreground mr-1 text-right">
                                10:32 AM
                            </span>
                        </div>
                    </div>
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
                    <Textarea
                        placeholder={messageMode === "internal" ? "Add an internal note..." : "Type your message..."}
                        className={cn("min-h-[80px] w-full resize-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0", messageMode === "internal" && "placeholder:text-yellow-700/50")}
                    />

                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Smile className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className={cn("gap-2", messageMode === "internal" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "")}>
                                        {messageMode === "internal" ? "Save Note" : "Send as Open"}
                                        <Send className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Send as Open</DropdownMenuItem>
                                    <DropdownMenuItem>Send as Pending</DropdownMenuItem>
                                    <DropdownMenuItem>Send as Resolved</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { MessageCircle } from "lucide-react"
