"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { NotificationManager } from "@/components/chat/NotificationManager"
import { InvitationBanner } from "@/components/dashboard/InvitationBanner"
import { useProject } from "@/context/ProjectContext"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Suspense } from "react"

function ProjectSync() {
    const { activeProject, selectProject, isLoading } = useProject()
    const searchParams = useSearchParams()
    const router = useRouter()
    const projectId = searchParams.get("project")

    const ensureProfile = useMutation(api.profiles.ensureCurrent)

    useEffect(() => {
        if (!isLoading) {
            // Ensure profile exists
            ensureProfile()

            if (projectId) {
                if (projectId !== activeProject?._id) {
                    selectProject(projectId as Id<"projects">)
                }
            } else if (activeProject) {
                // Ensure URL always has project ID for shareability
                // router.replace(`${window.location.pathname}?project=${activeProject.id}`)
            } else {
                // No project in URL or context -> redirect to selection
                router.push("/projects")
            }
        }
    }, [projectId, activeProject, isLoading, selectProject, router, ensureProfile])

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
                <InvitationBanner />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
