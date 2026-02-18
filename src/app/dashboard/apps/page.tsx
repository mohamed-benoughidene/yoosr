"use client"

import { useProject } from "@/context/ProjectContext"
import { AVAILABLE_APPS } from "@/config/apps"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Check, Lock, Loader2 } from "lucide-react"

export default function AppsPage() {
    const { activeProject } = useProject()
    const router = useRouter()

    const integrations = useQuery(api.integrations.list, activeProject ? { projectId: activeProject._id } : "skip")
    const installedApps = (integrations ?? []).map((i: any) => i.provider)
    const loading = integrations === undefined

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">App Store</h1>
                <p className="text-muted-foreground">
                    Connect external tools and channels to your project.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {AVAILABLE_APPS.map((app) => {
                    const isInstalled = installedApps.includes(app.id)
                    const Icon = app.icon

                    return (
                        <Card key={app.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{app.name}</CardTitle>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs uppercase">
                                            {app.category}
                                        </Badge>
                                        {app.isPro && <Badge variant="secondary" className="text-xs">PRO</Badge>}
                                        {app.isComingSoon && <Badge variant="secondary" className="text-xs">SOON</Badge>}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <CardDescription>
                                    {app.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                {app.isComingSoon ? (
                                    <Button disabled variant="outline" className="w-full">
                                        Coming Soon
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isInstalled ? "secondary" : "default"}
                                        className="w-full"
                                        onClick={() => router.push(`/dashboard/apps/${app.id}`)}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                            isInstalled ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Manage
                                                </>
                                            ) : (
                                                app.isPro ? (
                                                    <>
                                                        <Lock className="mr-2 h-4 w-4" />
                                                        Install
                                                    </>
                                                ) : "Install"
                                            )
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
