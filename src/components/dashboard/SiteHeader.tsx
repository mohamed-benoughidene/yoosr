"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { SignedIn } from "@clerk/nextjs"
import { NotificationBell } from "@/components/dashboard/NotificationBell"

const PAGE_LABELS: Record<string, string> = {
    "/dashboard": "Home",
    "/dashboard/monitor": "Monitor",
    "/dashboard/chat": "Chat",
    "/dashboard/requests": "Requests",
    "/dashboard/bots": "Bots",
    "/dashboard/kb": "Knowledge Base",
    "/dashboard/analytics": "Analytics",
    "/dashboard/activities": "Activities",
    "/dashboard/history": "History",
    "/dashboard/contacts": "Contacts",
    "/dashboard/settings": "Settings",
}

function getPageLabel(pathname: string): string {
    if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
    for (const [route, label] of Object.entries(PAGE_LABELS)) {
        if (route !== "/dashboard" && pathname.startsWith(route + "/")) return label
    }
    return "Dashboard"
}

export function SiteHeader() {
    const pathname = usePathname()
    const [isAvailable, setIsAvailable] = useState(true)
    const pageLabel = getPageLabel(pathname ?? "")
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <span className="text-sm font-medium">{pageLabel}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
                <SignedIn>
                    <NotificationBell />
                </SignedIn>
                <div className="flex items-center gap-2">
                    <Switch
                        id="availability"
                        checked={isAvailable}
                        onCheckedChange={(val) => { setIsAvailable(val); console.log("availability:", val) }}
                    />
                    <label htmlFor="availability" className={`cursor-pointer select-none text-sm font-medium ${isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                        Available
                    </label>
                </div>
            </div>
        </header>
    )
}
