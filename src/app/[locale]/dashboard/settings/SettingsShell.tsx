"use client"

import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { AppErrorBoundary } from "@/components/error-boundary"
import { useProject } from "@/context/ProjectContext"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface SettingsShellProps {
    children: React.ReactNode
}

export default function SettingsShell({ children }: SettingsShellProps) {
    const t = useTranslations("settings")
    const { activeProject, isLoading } = useProject()
    const router = useRouter()
    const isAdmin = activeProject?.userRole === "org:admin"

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.replace("/dashboard")
        }
    }, [isLoading, isAdmin, router])

    // Show loading skeleton during auth check to prevent flash of protected content
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }
    
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                <p className="text-muted-foreground">
                    {t("description")}
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                <aside className="lg:w-48 shrink-0">
                    <SettingsSidebar />
                </aside>
                <AppErrorBoundary>
                    <div className="flex-1">{children}</div>
                </AppErrorBoundary>
            </div>
        </div>
    )
}
