"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    Bot,
    BookOpen,
    LayoutGrid,
    BarChart3,
    Activity,
    History,
    Users,
    Settings,
    MonitorPlay,
    Ticket,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProject } from "@/context/ProjectContext"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"

export function DashboardSidebar() {
    const pathname = usePathname()
    const { activeProject } = useProject()
    const { user } = useUser()

    const projectQuery = activeProject ? `?project=${activeProject._id}` : ""

    // Query conversations to count unread ones
    const conversations =
        useQuery(
            api.conversations.list,
            activeProject ? { projectId: activeProject._id } : "skip"
        ) ?? []

    // Only count unread for conversations assigned to me
    const unreadCount = conversations.filter((c: any) => c.assignedTo === user?.id && (c.unreadCount ?? 0) > 0).length
    const unassignedCount = conversations.filter((c: any) => !c.assignedTo).length

    const sidebarItems = [
        {
            title: "Home",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Monitor",
            href: "/dashboard/monitor",
            icon: MonitorPlay,
        },
        {
            title: "Chat",
            href: "/dashboard/chat",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            title: "Requests",
            href: "/dashboard/requests",
            icon: Ticket,
            badge: unassignedCount > 0 ? unassignedCount : undefined,
        },
        {
            title: "Bots",
            href: "/dashboard/bots",
            icon: Bot,
        },
        {
            title: "Knowledge Base",
            href: "/dashboard/kb",
            icon: BookOpen,
        },
        {
            title: "Apps",
            href: "/dashboard/apps",
            icon: LayoutGrid,
        },
        {
            title: "Analytics",
            href: "/dashboard/analytics",
            icon: BarChart3,
        },
        {
            title: "Activities",
            href: "/dashboard/activities",
            icon: Activity,
        },
        {
            title: "History",
            href: "/dashboard/history",
            icon: History,
        },
        {
            title: "Contacts",
            href: "/dashboard/contacts",
            icon: Users,
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
        },
    ]

    return (
        <nav className="relative hidden h-screen border-r pt-16 lg:block w-64 bg-background">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={
                                    pathname === item.href ||
                                        pathname?.startsWith(item.href + "/")
                                        ? "secondary"
                                        : "ghost"
                                }
                                className={cn(
                                    "w-full justify-start",
                                    (pathname === item.href ||
                                        pathname?.startsWith(item.href + "/")) &&
                                    "bg-muted font-medium"
                                )}
                                asChild
                            >
                                <Link href={`${item.href}${projectQuery}`}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                    {item.badge !== undefined && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto h-5 min-w-[20px] px-1.5 bg-blue-600 text-white text-[10px] font-bold"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}
