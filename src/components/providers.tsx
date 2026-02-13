"use client"

import { ProjectProvider } from "@/context/ProjectContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ProjectProvider>
            {children}
        </ProjectProvider>
    )
}
