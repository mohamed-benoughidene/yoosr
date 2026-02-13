"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const sidebarNavItems = [
    {
        title: "General",
        href: "/dashboard/settings",
    },
    {
        title: "Teammates",
        href: "/dashboard/settings/teammates",
    },
    {
        title: "Departments",
        href: "/dashboard/settings/departments",
    },
    {
        title: "Groups",
        href: "/dashboard/settings/groups",
    },
    {
        title: "Canned Responses",
        href: "/dashboard/settings/canned-responses",
    },
]

export function SettingsSidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
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
                            ? "bg-muted hover:bg-muted"
                            : "hover:bg-transparent hover:underline",
                        "justify-start"
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}
