"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectContextType {
    projects: Project[]
    activeProject: Project | null
    isLoading: boolean
    createProject: (name: string, description?: string) => Promise<Project | null>
    selectProject: (projectId: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([])
    const [activeProject, setActiveProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setIsLoading(false)
                    return
                }

                const { data, error } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("owner_id", user.id)
                    .order("created_at", { ascending: false })

                if (error) throw error

                if (data) {
                    setProjects(data)
                    // Restore active project from local storage or default to first
                    const savedProjectId = localStorage.getItem("activeProjectId")
                    const foundProject = data.find((p) => p.id === savedProjectId)

                    if (foundProject) {
                        setActiveProject(foundProject)
                    } else if (data.length > 0) {
                        setActiveProject(data[0])
                    }
                }
            } catch (error) {
                console.error("Error fetching projects:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProjects()

        // Real-time subscription
        const channel = supabase
            .channel("projects-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "projects",
                },
                (payload) => {
                    // Refresh projects on any change for simplicity
                    // Ideally we'd update state directly based on payload
                    fetchProjects()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const createProject = async (name: string, description?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const { data, error } = await supabase
                .from("projects")
                .insert({
                    name,
                    description,
                    owner_id: user.id
                })
                .select()
                .single()

            if (error) throw error

            if (data) {
                setProjects((prev) => [data, ...prev])
                setActiveProject(data) // Auto-select new project
                localStorage.setItem("activeProjectId", data.id)
                return data
            }
        } catch (error) {
            console.error("Error creating project:", error)
            return null
        }
        return null
    }

    const selectProject = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId)
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
