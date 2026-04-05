"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { SignedIn } from "@clerk/nextjs"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import { ProjectSwitcher } from "@/components/dashboard/ProjectSwitcher"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { toast } from "sonner"

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
    const t = useTranslations("header")
    const tNav = useTranslations("nav")
    const pathname = usePathname()
    const pageLabel = getPageLabel(pathname ?? "")

    const profile = useQuery(api.profiles.getMe)
    const setAvailability = useMutation(api.profiles.setAvailability)

    const handleCheckedChange = async (val: boolean) => {
        try {
            await setAvailability({ isAvailable: val })
        } catch (error) {
            console.error("Failed to update availability:", error)
            toast.error(t("availability_update_failed"))
        }
    }


    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ms-1" />
                <Separator orientation="vertical" className="me-2 data-[orientation=vertical]:h-4" />
                <span className="text-sm font-medium">
                    {pageLabel === "Monitor" ? tNav("monitor") : pageLabel}
                </span>
            </div>
            <div className="ms-auto flex items-center gap-3">
                <SignedIn>
                    <ProjectSwitcher />
                </SignedIn>
                <SignedIn>
                    <NotificationBell />
                </SignedIn>
                <div className="flex items-center gap-2">
                    <Switch
                        id="availability"
                        checked={profile?.isAvailable ?? true}
                        onCheckedChange={handleCheckedChange}
                        disabled={profile === undefined}
                    />
                    <label htmlFor="availability" className={`cursor-pointer select-none text-sm font-medium ${profile?.isAvailable ?? true ? "text-green-600" : "text-muted-foreground"}`}>
                        {t("available")}
                    </label>
                </div>
            </div>
        </header>
    )
}
