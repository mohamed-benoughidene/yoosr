"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SiteHeader } from "@/components/dashboard/SiteHeader"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useEffect } from "react"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const ensureProfile = useMutation(api.profiles.ensureCurrent)
    const setAvailability = useMutation(api.profiles.setAvailability)

    // 1. Mark as online on mount
    useEffect(() => {
        setAvailability({ isAvailable: true })
    }, [setAvailability])

    // 2. Heartbeat every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            setAvailability({ isAvailable: true })
        }, 30000)
        return () => clearInterval(interval)
    }, [setAvailability])

    useEffect(() => {
        ensureProfile()
    }, [ensureProfile])

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
