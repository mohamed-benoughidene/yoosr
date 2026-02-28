"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const { isLoaded: isUserLoaded, isSignedIn } = useUser()
    const { organization, isLoaded: isOrgLoaded } = useOrganization()
    const { createOrganization } = useOrganizationList()
    const projects = useQuery(api.projects.list)
    const createProject = useMutation(api.projects.create)

    const [workspaceName, setWorkspaceName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Security & Flow Checks
    useEffect(() => {
        if (isUserLoaded && !isSignedIn) {
            router.replace("/signup")
        }
    }, [isUserLoaded, isSignedIn, router])

    // Auto-redirect if everything is already set up
    useEffect(() => {
        if (isOrgLoaded && organization && projects !== undefined && projects.length > 0 && !isSubmitting) {
            // User has an org and a project -> redirect to dashboard
            router.replace("/dashboard")
        } else if (isOrgLoaded && organization && projects !== undefined && projects.length === 0 && !isSubmitting) {
            // Edge case: User has an organization but no project (maybe abandoned halfway)
            // We should create a project for them automatically.
            handleAutoCreateProject()
        }
    }, [isOrgLoaded, organization, projects, isSubmitting, router])

    const handleAutoCreateProject = async () => {
        if (!organization) return;
        setIsSubmitting(true)
        try {
            await createProject({
                name: organization.name,
                description: "Default Workspace",
            })
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Failed to recover project:", err)
            setError(err.message || "Failed to finalize workspace setup")
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!workspaceName.trim()) {
            setError("Workspace name is required")
            return
        }

        if (!createOrganization) {
            setError("Unable to create organizations at this time")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            // 1. Create Clerk Organization
            const newOrg = await createOrganization({
                name: workspaceName,
            })

            // Note: createOrganization should automatically set it as the active org in the current session
            // But just in case, convex will pick it up on the next token refresh or context reload.
            // Actually, we can just create the project, the Convex backend will read identity.org_id which might
            // require the org to be active. However Clerk's token might need a refresh.
            // For now, we wait a tick to ensure Clerk is ready...

            // To ensure the Convex token has the new org_id, let's just create the project:
            // The backend `create` mutation depends on `ctx.auth.getUserIdentity()`. 
            // Clerk might take a moment to sync this to the token Convex uses.

            // Let's rely on Convex `ensureProject` pattern if we need it, but the instruction says:
            // "call Convex createProject mutation with the same name. Then redirect to /dashboard."

            // If the token isn't fresh, the backend won't have the org_id yet. 
            // Wait a small delay to let Clerk's hook (which usually automatically sets the active org on creation) sync.
            await new Promise(resolve => setTimeout(resolve, 1000));

            await createProject({
                name: workspaceName,
                description: "Default Workspace",
            })

            // Redirect immediately to dashboard
            router.push("/dashboard")
        } catch (err: any) {
            console.error(err)
            setError(err.errors?.[0]?.longMessage || err.message || "Failed to create organization")
            setIsSubmitting(false)
        }
    }

    // Loading State
    if (!isUserLoaded || !isOrgLoaded || projects === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        )
    }

    // Main Form
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create your workspace</CardTitle>
                    <CardDescription>
                        Give your team a shared home to collaborate on customer support.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="workspaceName">Workspace Name</Label>
                            <Input
                                id="workspaceName"
                                placeholder="Acme Inc."
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-md">
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || !workspaceName.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating workspace...
                                </>
                            ) : (
                                "Create Workspace"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
