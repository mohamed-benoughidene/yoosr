"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useOrganization, useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Loader2 } from "lucide-react"

export function OnboardingClient() {
    const router = useRouter()
    const { isLoaded: isUserLoaded, isSignedIn } = useUser()
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const projects = useQuery(api.projects.list)
    const createProject = useMutation(api.projects.create)
    const hasCreated = useRef(false)

    useEffect(() => {
        // Wait until everything is loaded
        if (!isUserLoaded || !isOrgLoaded || projects === undefined) return;

        // Not signed in
        if (!isSignedIn) {
            router.replace("/signup")
            return
        }

        // No org exists -> fallback to signup where Clerk creates orgs
        if (!organization) {
            router.replace("/signup")
            return
        }

        // Org exists, has projects
        if (projects.length > 0) {
            router.replace("/dashboard")
            return
        }

        // Org exists, NO project -> auto create and redirect
        if (projects.length === 0) {
            if (hasCreated.current) return;
            hasCreated.current = true;

            const makeProject = async () => {
                try {
                    await createProject({
                        name: organization.name || "Default Workspace",
                        description: "Default Workspace",
                    })
                    router.push("/dashboard")
                } catch (err) {
                    console.error("Failed to recover project:", err)
                    // In a real app we might show an error, but per instructions we just redirect
                    router.push("/dashboard")
                }
            }
            makeProject()
        }
    }, [isUserLoaded, isOrgLoaded, isSignedIn, organization, projects, createProject, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
}
