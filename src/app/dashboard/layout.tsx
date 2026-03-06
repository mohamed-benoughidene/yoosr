"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SiteHeader } from "@/components/dashboard/SiteHeader"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const ensureProfile = useMutation(api.profiles.ensureCurrent)
    const setAvailability = useMutation(api.profiles.setAvailability)
    const { isLoaded, isSignedIn } = useUser()

    // 1. Mark as online on mount
    useEffect(() => {
        if (isSignedIn) {
            setAvailability({ isAvailable: true })
        }
    }, [setAvailability, isSignedIn])

    // 2. Heartbeat every 30s
    useEffect(() => {
        if (!isSignedIn) return
        const interval = setInterval(() => {
            setAvailability({ isAvailable: true })
        }, 30000)
        return () => clearInterval(interval)
    }, [setAvailability, isSignedIn])

    useEffect(() => {
        if (isSignedIn) {
            ensureProfile()
        }
    }, [ensureProfile, isSignedIn])

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
