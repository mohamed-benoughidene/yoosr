"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SiteHeader } from "@/components/dashboard/SiteHeader"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useEffect } from "react"
import { useUser } from "@clerk/nextjs" // Imported for getting userId

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const ensureProfile = useMutation(api.profiles.ensureCurrent)
    const { user } = useUser()

    useEffect(() => {
        ensureProfile()

        const handleUnload = () => {
            if (user?.id) {
                const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
                if (siteUrl) {
                    const blob = new Blob([JSON.stringify({ userId: user.id })], { type: 'application/json' });
                    navigator.sendBeacon(`${siteUrl}/presence/offline`, blob);
                }
            }
        }

        window.addEventListener("beforeunload", handleUnload)

        return () => {
            handleUnload()
            window.removeEventListener("beforeunload", handleUnload)
        }
    }, [ensureProfile, user])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
