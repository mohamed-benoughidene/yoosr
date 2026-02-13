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
import { ArrowRight, Bot, MessageCircle, Users, Activity } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useProject } from "@/context/ProjectContext"
import { subDays, format } from "date-fns"

export default function DashboardPage() {
    const { activeProject } = useProject()
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalConversations: 0,
        kbCount: 0,
        activeVisitors: 1, // Mocked for now, need presence
    })
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (!activeProject) return

        const fetchStats = async () => {
            // KB Count
            const { count: kbCount } = await supabase
                .from("knowledge_bases")
                .select("*", { count: "exact", head: true })
                .eq("project_id", activeProject.id)

            // Conversation Stats (Last 7 days)
            const today = new Date()
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(today, 6 - i)
                return format(d, 'EEE') // Mon, Tue...
            })

            // Mocking chart data distribution for now as we don't have enough real data
            // In a real app, we would group by created_at date
            const { count: totalConvs } = await supabase
                .from("conversations")
                .select("*", { count: "exact", head: true })
                .eq("project_id", activeProject.id)

            setStats(prev => ({
                ...prev,
                kbCount: kbCount || 0,
                totalConversations: totalConvs || 0
            }))

            // Generate mock trend based on real total
            const base = Math.floor((totalConvs || 0) / 7)
            const mockChart = days.map(day => ({
                name: day,
                total: base + Math.floor(Math.random() * 5),
                bots: Math.floor(base * 0.3)
            }))
            setChartData(mockChart)
        }

        fetchStats()

        // Realtime subscription for status cards
        const channel = supabase
            .channel('dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_bases' }, () => {
                fetchStats()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchStats()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeProject, supabase])

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

                {/* Status Cards / Recent */}
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
                                <p className="text-sm font-medium">Knowledge Bases</p>
                                <p className="text-2xl font-bold">{stats.kbCount}</p>
                                <p className="text-xs text-muted-foreground">Active sources</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                            <Users className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">Active Visitors</p>
                                <p className="text-2xl font-bold">{stats.activeVisitors}</p>
                                <p className="text-xs text-muted-foreground">Currently online</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
