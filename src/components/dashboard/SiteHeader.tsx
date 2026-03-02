"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { SignedIn } from "@clerk/nextjs"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

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
    const pageLabel = getPageLabel(pathname ?? "")

    const profile = useQuery(api.profiles.getMe)
    const setAvailability = useMutation(api.profiles.setAvailability)

    const [isAvailable, setIsAvailable] = useState(true)

    useEffect(() => {
        if (profile) {
            setIsAvailable(profile.isAvailable ?? true)
        }
    }, [profile])


    const handleCheckedChange = async (val: boolean) => {
        setIsAvailable(val)
        try {
            await setAvailability({ isAvailable: val })
        } catch (error) {
            console.error("Failed to update availability:", error)
            // Revert state on failure if needed
            if (profile) {
                setIsAvailable(profile.isAvailable ?? true)
            }
        }
    }


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
                        onCheckedChange={handleCheckedChange}
                        disabled={profile === undefined}
                    />
                    <label htmlFor="availability" className={`cursor-pointer select-none text-sm font-medium ${isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                        Available
                    </label>
                </div>
            </div>
        </header>
    )
}
