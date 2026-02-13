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
    LogOut,
    Ticket
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
    },
    {
        title: "Requests",
        href: "/dashboard/requests",
        icon: Ticket,
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

import { useProject } from "@/context/ProjectContext"

export function DashboardSidebar() {
    const pathname = usePathname()
    const { activeProject } = useProject()

    const projectQuery = activeProject ? `?project=${activeProject.id}` : ""

    return (
        <nav className="relative hidden h-screen border-r pt-16 lg:block w-64 bg-background">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href || pathname?.startsWith(item.href + "/") ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    (pathname === item.href || pathname?.startsWith(item.href + "/")) && "bg-muted font-medium"
                                )}
                                asChild
                            >
                                <Link href={`${item.href}${projectQuery}`}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}
