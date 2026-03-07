"use client"

import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { useProject } from "@/context/ProjectContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const { activeProject, isLoading } = useProject()
    const router = useRouter()
    const isAdmin = activeProject?.userRole === "org:admin"

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.replace("/dashboard")
        }
    }, [isLoading, isAdmin, router])

    if (isLoading) return null
    if (!isAdmin) return null

    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your project settings and configuration.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-48 shrink-0">
                    <SettingsSidebar />
                </aside>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}
