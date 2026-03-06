"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Settings,
    MessageSquare,
    LayoutTemplate,
    Building2,
    UserPlus,
    Tag,
    Clock,
    Plug,
    ShoppingBag,
    Webhook,
} from "lucide-react"

const sidebarNavItems = [
    {
        title: "Project Settings",
        href: "/dashboard/settings",
        icon: Settings
    },
    {
        title: "Widget Setup",
        href: "/dashboard/settings/widget",
        icon: LayoutTemplate
    },
    {
        title: "Departments",
        href: "/dashboard/settings/departments",
        icon: Building2
    },
    {
        title: "Teammates",
        href: "/dashboard/settings/teammates",
        icon: UserPlus
    },
    {
        title: "Canned Responses",
        href: "/dashboard/settings/canned-responses",
        icon: MessageSquare
    },
    {
        title: "Labels",
        href: "/dashboard/settings/labels",
        icon: Tag
    },
    {
        title: "Operating Hours",
        href: "/dashboard/settings/operating-hours",
        icon: Clock
    },
    {
        title: "Webhooks",
        href: "/dashboard/settings/webhooks",
        icon: Webhook
    },
    {
        title: "Integrations",
        href: "/dashboard/settings/integrations",
        icon: Plug
    },
]

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> { }

export function SettingsSidebar({ className, ...props }: SettingsSidebarProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex flex-col space-y-1 w-full",
                className
            )}
            {...props}
        >
            {sidebarNavItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        pathname === item.href
                            ? "bg-muted hover:bg-muted font-medium"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
