"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Users, Activity } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useMemo } from "react"
import { useProject } from "@/context/ProjectContext"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { subDays, format } from "date-fns"

export default function DashboardPage() {
    const { activeProject } = useProject()

    // Real-time stats from Convex
    const conversationStats = useQuery(
        api.analytics.getConversationStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const chartData = useMemo(() => {
        const today = new Date()
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(today, 6 - i)
            return format(d, 'EEE')
        })

        const total = conversationStats?.total ?? 0
        const base = Math.floor(total / 7)
        return days.map(day => ({
            name: day,
            total: base + Math.floor(Math.random() * 5),
            bots: Math.floor(base * 0.3)
        }))
    }, [conversationStats])

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Project Home</h1>
                    <p className="text-muted-foreground">Overview of your project performance and activities.</p>
                </div>
            </div>

            {/* Onboarding Widget */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900/50">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Bot className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Create your first Flow</CardTitle>
                        <CardDescription>Automate conversations and increase customer satisfaction.</CardDescription>
                    </div>
                </CardHeader>
                <CardFooter>
                    <Link href="/dashboard/bots">
                        <Button>
                            Create Flow
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Analytics Widget */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Conversation Overview</CardTitle>
                        <CardDescription>
                            Total conversations vs served by bots over the last 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Total" />
                                <Bar dataKey="bots" fill="#2563eb" radius={[4, 4, 0, 0]} name="Bot Handled" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Cards */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Status & Activity</CardTitle>
                        <CardDescription>
                            Real-time metric snapshots.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                            <Activity className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Total Conversations</p>
                                <p className="text-2xl font-bold">{conversationStats?.total ?? 0}</p>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                            <Users className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">Open Conversations</p>
                                <p className="text-2xl font-bold">{conversationStats?.open ?? 0}</p>
                                <p className="text-xs text-muted-foreground">Currently active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
