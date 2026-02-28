"use client"

import { OrganizationProfile } from "@clerk/nextjs"
import { useProject } from "@/context/ProjectContext"
import { Loader2 } from "lucide-react"

export default function TeammatesPage() {
    const { isLoading, activeProject } = useProject()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    if (!activeProject) {
        return null
    }

    return (
        <div className="w-full">
            <div>
                <h3 className="text-lg font-medium">Teammates</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Manage who has access to this project.
                </p>
            </div>

            <OrganizationProfile
                appearance={{
                    elements: {
                        rootBox: "w-full max-w-none shadow-none",
                        cardBox: "w-full max-w-none shadow-none border",
                        card: "w-full max-w-none shadow-none p-0 sm:p-0",
                        navbar: "hidden",
                        pageScrollBox: "p-6",
                    }
                }}
            />
        </div>
    )
}
