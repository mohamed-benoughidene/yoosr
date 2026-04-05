"use client"

import { useState } from "react"
import { Bell, MessageSquare, UserCheck, Bot, CheckCircle, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const unreadCount = useQuery(api.notifications.unreadCount)
    const notifications = useQuery(api.notifications.listForCurrentUser)
    const markAsRead = useMutation(api.notifications.markAsRead)
    const markAllRead = useMutation(api.notifications.markAllRead)
    const clearAll = useMutation(api.notifications.clearAll)

    const handleNotificationClick = async (notifId: Id<"notifications">, conversationId: Id<"conversations">) => {
        try {
            await markAsRead({ notificationId: notifId })
        } catch (e) {
            console.error("Failed to mark as read:", e)
            toast.error("Failed to mark notification as read")
        }
        setOpen(false)
        router.push(`/dashboard/monitor?conversation=${conversationId}`)
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllRead()
        } catch (e) {
            console.error("Failed to mark all as read:", e)
            toast.error("Failed to mark all as read")
        }
    }

    const handleClearAll = async () => {
        try {
            await clearAll()
        } catch (e) {
            console.error("Failed to clear notifications:", e)
            toast.error("Failed to clear notifications")
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount !== undefined && unreadCount > 0 && (
                        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow ring-2 ring-background">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
                <div className="flex items-center justify-between p-4 pb-2 border-b">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <div className="flex items-center gap-1">
                        {unreadCount !== undefined && unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                        {notifications && notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="h-auto px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[400px] w-full">
                    {notifications === undefined ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-[200px]">
                            <Bell className="mb-3 h-8 w-8 opacity-20" />
                            <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col pb-2">
                            {notifications.map((notif: { _id?: string; conversationId?: string; read?: boolean; type?: string; title?: string; message?: string; body?: string; createdAt?: number }) => {
                                const isUnread = !notif.read;

                                let Icon = Bell;
                                let iconColor = "text-muted-foreground";
                                let iconBg = "bg-muted/50";

                                if (notif.type === "new_message") {
                                    Icon = MessageSquare;
                                    iconColor = "text-blue-500";
                                    iconBg = "bg-blue-500/10";
                                } else if (notif.type === "assigned") {
                                    Icon = UserCheck;
                                    iconColor = "text-purple-500";
                                    iconBg = "bg-purple-500/10";
                                } else if (notif.type === "unassigned_conversation") {
                                    Icon = UserX;
                                    iconColor = "text-yellow-500";
                                    iconBg = "bg-yellow-500/10";
                                } else if (notif.type === "escalation") {
                                    Icon = Bot;
                                    iconColor = "text-orange-500";
                                    iconBg = "bg-orange-500/10";
                                } else if (notif.type === "resolved") {
                                    Icon = CheckCircle;
                                    iconColor = "text-green-500";
                                    iconBg = "bg-green-500/10";
                                }

                                return (
                                    <button
                                        key={notif._id}
                                        onClick={() => {
                                            if (notif._id && notif.conversationId) {
                                                handleNotificationClick(notif._id as Id<"notifications">, notif.conversationId as Id<"conversations">)
                                            }
                                        }}
                                        className={cn(
                                            "relative flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 w-full border-b last:border-0",
                                            isUnread
                                                ? "bg-background"
                                                : "bg-muted/10 opacity-70"
                                        )}
                                    >
                                        {isUnread && (
                                            <div className="absolute left-0 top-0 h-full w-[3px] bg-blue-600 rounded-r-md" />
                                        )}
                                        <div className={cn("mt-1 shrink-0 rounded-full p-2", iconBg, iconColor)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1 pr-2 w-full overflow-hidden">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm line-clamp-1 break-all transition-all", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                                                    {notif.title}
                                                </p>
                                                <span className="shrink-0 text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                                                    {notif.createdAt ? formatDistanceToNow(notif.createdAt, { addSuffix: true }) : "recently"}
                                                </span>
                                            </div>
                                            {notif.body && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 pr-4 leading-snug">
                                                    {notif.body}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
