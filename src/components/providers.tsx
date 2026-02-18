"use client"

import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { ProjectProvider } from "@/context/ProjectContext"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConvexClientProvider>
            <ProjectProvider>
                {children}
                <Toaster position="top-right" richColors closeButton duration={10000} theme="light" />
            </ProjectProvider>
        </ConvexClientProvider>
    )
}
