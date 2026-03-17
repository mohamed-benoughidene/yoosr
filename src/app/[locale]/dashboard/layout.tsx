"use client"

import { useTranslations } from "next-intl"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SiteHeader } from "@/components/dashboard/SiteHeader"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("nav")
    const ensureProfile = useMutation(api.profiles.ensureCurrent)
    const updateHeartbeat = useMutation(api.profiles.updateHeartbeat)
    const { user, isLoaded, isSignedIn } = useUser()
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    // Redirect to preferred locale if needed
    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            const preferredLocale = user.unsafeMetadata?.locale as string | undefined
            if (preferredLocale && preferredLocale !== locale) {
                // Determine the correct path with the new locale
                // pathname will usually start with `/${locale}`
                const newPath = pathname.replace(`/${locale}`, `/${preferredLocale}`)
                router.replace(newPath)
            }
        }
    }, [isLoaded, isSignedIn, user, locale, pathname, router]) // eslint-disable-line react-hooks/exhaustive-deps

    // 1. Mark as online on mount
    useEffect(() => {
        if (isSignedIn) {
            updateHeartbeat()
        }
    }, [updateHeartbeat, isSignedIn])

    // 2. Heartbeat every 30s
    useEffect(() => {
        if (!isSignedIn) return
        const interval = setInterval(() => {
            updateHeartbeat()
        }, 30000)
        return () => clearInterval(interval)
    }, [updateHeartbeat, isSignedIn])

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
