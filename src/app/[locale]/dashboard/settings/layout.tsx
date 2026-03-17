"use client"

import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { useProject } from "@/context/ProjectContext"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const t = useTranslations("settings")
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
                <div className="flex-1">{children}</div>
            </div>
        </div>
    )
}
