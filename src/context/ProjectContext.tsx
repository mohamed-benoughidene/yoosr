"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

interface Project {
    _id: Id<"projects">
    _creationTime: number
    name: string
    description?: string
    ownerId: string
    status?: string
    widgetConfig?: any
}

interface ProjectContextType {
    projects: Project[]
    activeProject: Project | null
    isLoading: boolean
    createProject: (name: string, description?: string) => Promise<Id<"projects"> | null>
    selectProject: (projectId: Id<"projects">) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [activeProject, setActiveProject] = useState<Project | null>(null)

    // Convex query — automatically reactive, no subscriptions needed!
    const projects = useQuery(api.projects.list) ?? []
    const isLoading = projects === undefined

    const createProjectMutation = useMutation(api.projects.create)

    // Auto-select the active project when projects load
    useEffect(() => {
        if (projects.length > 0 && !activeProject) {
            const savedProjectId = localStorage.getItem("activeProjectId")
            const foundProject = projects.find(
                (p) => p._id === savedProjectId
            )
            if (foundProject) {
                setActiveProject(foundProject)
            } else {
                setActiveProject(projects[0])
            }
        }
        // Update activeProject if it changed in the data
        if (activeProject) {
            const updated = projects.find((p) => p._id === activeProject._id)
            if (updated && JSON.stringify(updated) !== JSON.stringify(activeProject)) {
                setActiveProject(updated)
            }
        }
    }, [projects, activeProject])

    const createProject = async (name: string, description?: string) => {
        try {
            const projectId = await createProjectMutation({ name, description })
            localStorage.setItem("activeProjectId", projectId)
            return projectId
        } catch (error) {
            console.error("Error creating project:", error)
            return null
        }
    }

    const selectProject = (projectId: Id<"projects">) => {
        const project = projects.find((p) => p._id === projectId)
        if (project) {
            setActiveProject(project)
            localStorage.setItem("activeProjectId", projectId)
        }
    }

    return (
        <ProjectContext.Provider
            value={{
                projects,
                activeProject,
                isLoading,
                createProject,
                selectProject,
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
