"use client"

import { useQuery } from "convex/react"
import { useOrganization } from "@clerk/nextjs"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { FREE_PLAN_LIMITS } from "@/lib/plans"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface UsageCardProps {
    projectId: Id<"projects">
}

export function UsageCard({ projectId }: UsageCardProps) {
    const data = useQuery(api.analytics.getProjectUsageSummary, { projectId })
    const { organization, isLoaded } = useOrganization()

    if (!data || !isLoaded) {
        return <UsageCardSkeleton />
    }

    const memberCount = organization?.membersCount ?? 1

    const items = [
        {
            label: "Conversations",
            value: data.conversations,
            limit: FREE_PLAN_LIMITS.conversations,
        },
        {
            label: "Active Bots",
            value: data.bots,
            limit: FREE_PLAN_LIMITS.bots,
        },
        {
            label: "Knowledge Bases",
            value: data.knowledgeBases,
            limit: FREE_PLAN_LIMITS.knowledgeBases,
        },
        {
            label: "Teammates",
            value: memberCount,
            limit: FREE_PLAN_LIMITS.seats,
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plan Usage</CardTitle>
                <CardDescription>
                    Usage for the current billing cycle
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6">
                    {items.map((item) => {
                        const percentage = Math.min(100, (item.value / item.limit) * 100)
                        
                        let indicatorColor = "bg-primary"
                        if (percentage >= 100) {
                            indicatorColor = "bg-red-500"
                        } else if (percentage >= 80) {
                            indicatorColor = "bg-amber-500"
                        }

                        return (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{item.label}</span>
                                    <span className="text-muted-foreground">
                                        {item.value.toLocaleString()} / {item.limit.toLocaleString()}
                                    </span>
                                </div>
                                <Progress 
                                    value={percentage} 
                                    indicatorClassName={indicatorColor}
                                    className="h-2"
                                />
                            </div>
                        )
                    })}
                </div>

                <div className="pt-2">
                    <p className="text-xs text-muted-foreground italic">
                        {data.tokensConsumed.toLocaleString()} tokens consumed this cycle
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

function UsageCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                ))}
                <Skeleton className="h-3 w-40 mt-4" />
            </CardContent>
        </Card>
    )
}
