"use client"

import { createContext, useContext } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { useOrganization } from "@clerk/nextjs"
import { useProjectId } from "@/hooks/useProjectId"

interface Project {
    _id: Id<"projects">
    _creationTime: number
    name: string
    description?: string
    orgId: string
    status?: string

    widgetConfig?: unknown
    userRole?: string
    slaHours?: number
    widgetLocale?: "en" | "ar" | "fr"
}

interface ProjectContextType {
    projects: Project[]
    activeProject: Project | null
    isLoading: boolean
    createProject: (name: string, description?: string) => Promise<Id<"projects"> | null>
    setProjectId: (id: Id<"projects">) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded: isOrgLoaded } = useOrganization()
    const { projectId: urlProjectId, setProjectId } = useProjectId()

    // Convex query — automatically reactive and scoped to current org by the backend
    const projectsResult = useQuery(api.projects.list)
    const projects = projectsResult ?? []

    // The active project is determined by URL param, or falls back to first one
    const activeProject = projects.length > 0 
        ? urlProjectId 
            ? projects.find(p => p._id === urlProjectId) ?? projects[0]
            : projects[0]
        : null

    // We are loading if Clerk is still resolving org state or Convex hasn't returned projects
    const isLoading = !isOrgLoaded || projectsResult === undefined

    const createProjectMutation = useMutation(api.projects.create)

    const createProject = async (name: string, description?: string) => {
        try {
            const projectId = await createProjectMutation({ name, description })
            return projectId
        } catch (error) {
            console.error("Error creating project:", error)
            return null
        }
    }

    return (
        <ProjectContext.Provider
            value={{
                projects,
                activeProject,
                isLoading,
                createProject,
                setProjectId,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider")
    }
    return context
}
