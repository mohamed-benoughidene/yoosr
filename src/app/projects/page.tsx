"use client"

import { ProjectCard } from "@/components/projects/ProjectCard"
import { InviteProjectCard } from "@/components/projects/InviteProjectCard"
import { CreateProjectModal } from "@/components/projects/CreateProjectModal"
import { useProject } from "@/context/ProjectContext"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Loader2 } from "lucide-react"

export default function ProjectsPage() {
    const { projects, isLoading } = useProject()
    const pendingInvites = useQuery(api.members.getMyPendingInvites, {})

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Projects</h1>
                        <p className="text-muted-foreground mt-2">Manage and switch between your Yoosr projects.</p>
                    </div>
                    <CreateProjectModal />
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Real projects */}
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}

                        {/* Pending invitation ghost cards — shown in the same grid */}
                        {(pendingInvites ?? []).map((invite) => (
                            <InviteProjectCard key={invite._id} invite={invite} />
                        ))}

                        {/* Add Project Card */}
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group h-[200px] cursor-pointer">
                            <div className="w-full flex justify-center">
                                <CreateProjectModal />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
