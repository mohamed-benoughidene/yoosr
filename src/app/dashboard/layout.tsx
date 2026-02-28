"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { NotificationManager } from "@/components/chat/NotificationManager"
import { useProject } from "@/context/ProjectContext"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Suspense } from "react"
import { useOrganization } from "@clerk/nextjs"

function ProjectSync() {
    const { activeProject, isLoading } = useProject()
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const searchParams = useSearchParams()
    const router = useRouter()
    const projectId = searchParams.get("project")

    const ensureProfile = useMutation(api.profiles.ensureCurrent)

    useEffect(() => {
        if (!isLoading && isOrgLoaded) {
            // Ensure profile exists
            ensureProfile()

            if (!organization) {
                // No active organization -> redirect to onboarding
                router.push("/onboarding")
                return
            }
        }
    }, [projectId, activeProject, isLoading, router, ensureProfile, organization, isOrgLoaded])

    return null
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isLoading } = useProject()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Suspense fallback={null}>
                <ProjectSync />
            </Suspense>
            <NotificationManager />
            <DashboardSidebar />
            <div className="flex flex-col">
                <DashboardHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
