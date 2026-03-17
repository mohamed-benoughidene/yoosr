"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Settings,
    MessageSquare,
    LayoutTemplate,
    Building2,
    Tag,
    Clock,
    Plug,
    Webhook,
} from "lucide-react"

const sidebarNavItems = [
    {
        title: "nav_project_settings",
        href: "/dashboard/settings",
        icon: Settings
    },
    {
        title: "nav_widget_setup",
        href: "/dashboard/settings/widget",
        icon: LayoutTemplate
    },
    {
        title: "nav_departments",
        href: "/dashboard/settings/departments",
        icon: Building2
    },
    {
        title: "nav_canned_responses",
        href: "/dashboard/settings/canned-responses",
        icon: MessageSquare
    },
    {
        title: "nav_labels",
        href: "/dashboard/settings/labels",
        icon: Tag
    },
    {
        title: "nav_operating_hours",
        href: "/dashboard/settings/operating-hours",
        icon: Clock
    },
    {
        title: "nav_webhooks",
        href: "/dashboard/settings/webhooks",
        icon: Webhook
    },
    {
        title: "nav_integrations",
        href: "/dashboard/settings/integrations",
        icon: Plug
    },
]

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> { }

export function SettingsSidebar({ className, ...props }: SettingsSidebarProps) {
    const pathname = usePathname()
    const t = useTranslations("settings")

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
                    {t(item.title)}
                </Link>
            ))}
        </nav>
    )
}
