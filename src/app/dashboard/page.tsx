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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Bot,
    Users,
    Activity,
    Clock,
    Inbox,
    UserCheck,
    MessageSquare,
    Plus,
    ActivitySquare,
    CheckCircle,
    Zap,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProject } from "@/context/ProjectContext"
import { useQuery, usePaginatedQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
    const { activeProject } = useProject()
    const router = useRouter()

    const homeStats = useQuery(
        api.dashboard.getHomeStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const { results: recentActivities, status: activityStatus, loadMore: loadMoreActivity } = usePaginatedQuery(
        api.activityLogs.getActivityLog,
        activeProject ? { projectId: activeProject._id } : "skip",
        { initialNumItems: 5 }
    );

    if (!homeStats) {
        return (
            <div className="flex flex-col gap-8 p-4 md:p-8 animate-pulse">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-muted rounded"></div>
                        <div className="h-4 w-64 bg-muted rounded mt-2"></div>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-muted rounded-xl"></div>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-12">
                    <div className="col-span-12 lg:col-span-7 h-64 bg-muted rounded-xl"></div>
                    <div className="col-span-12 lg:col-span-5 h-64 bg-muted rounded-xl"></div>
                </div>
            </div>
        )
    }

    const { botsCount, liveStats, liveQueue, todaySnapshot } = homeStats

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Project Home</h1>
                    <p className="text-muted-foreground">Real-time overview of your active conversations and team.</p>
                </div>
            </div>

            {/* 1. Conditional Onboarding Banner */}
            {botsCount === 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg">Create your first Bot</CardTitle>
                            <CardDescription className="text-blue-700/80 dark:text-blue-300/80 mt-1">
                                Automate responses, capture leads, and instantly resolve common questions 24/7.
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/bots">
                            <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Bot
                            </Button>
                        </Link>
                    </CardHeader>
                </Card>
            )}

            {/* 2. Stats Row (4 cards, real-time) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Conversations</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{liveStats.openCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently active threads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waiting for Agent</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{liveStats.waitingCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Needs human attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Online Teammates</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{liveStats.onlineTeammatesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Available to take chats</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Assigned</CardTitle>
                        <Inbox className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{liveStats.myAssignedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Conversations assigned to you</p>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Two-Column Section */}
            <div className="grid gap-4 md:grid-cols-12">

                {/* Left column — Live Queue (60% width) */}
                <Card className="col-span-12 lg:col-span-7">
                    <CardHeader>
                        <CardTitle>Live Queue</CardTitle>
                        <CardDescription>Most recent open conversations requiring attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {liveQueue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20 border-dashed">
                                <CheckCircle className="h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">No open conversations right now.</p>
                                <p className="text-xs text-muted-foreground mt-1">Inbox zero achieved! Everyone has been helped.</p>
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Visitor</TableHead>
                                            <TableHead>Wait Time</TableHead>
                                            <TableHead>Assigned</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {liveQueue.map((conv: any) => (
                                            <TableRow
                                                key={conv._id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.push(`/dashboard/chat?conversationId=${conv._id}`)}
                                            >
                                                <TableCell className="font-medium">{conv.visitorName}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDistanceToNow(Date.now() - conv.waitMs)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs truncate max-w-[120px]">{conv.assignedAgentName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {conv.status === 100 ? (
                                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300">Unassigned</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">Open</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right column — Recent Activity Feed (40% width) */}
                <Card className="col-span-12 lg:col-span-5 flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Live feed of what's happening right now.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin pr-2">
                        {!recentActivities || recentActivities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] py-8 text-center text-muted-foreground">
                                <ActivitySquare className="h-8 w-8 mb-3 opacity-20" />
                                <p className="text-sm">{recentActivities === undefined ? "Loading…" : "No activity yet."}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {recentActivities.map((activity: any) => (
                                    <div
                                        key={activity._id}
                                        className="flex gap-4 group cursor-pointer hover:bg-muted/30 p-2 -m-2 rounded-lg transition-all duration-200 ease-in-out"
                                        onClick={() => {
                                            if (activity.targetType === "conversation" && activity.targetId) {
                                                router.push(`/dashboard/chat?conversationId=${activity.targetId}`);
                                            }
                                        }}
                                    >
                                        <div className="mt-0.5 rounded-full bg-muted p-1.5 ring-1 ring-border shrink-0 group-hover:bg-primary/10 group-hover:ring-primary/20 transition-all">
                                            <Activity className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="text-sm leading-tight break-words">
                                                <span className="font-medium mr-1 text-foreground group-hover:text-primary transition-colors">{activity.actorName}</span>
                                                <span className="text-muted-foreground">{activity.action?.replace(/_/g, " ")}</span>
                                            </p>
                                            {activity.createdAt && (
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider tabular-nums">
                                                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    {activityStatus !== "Exhausted" && (
                        <div className="px-6 pb-4 border-t pt-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
                                onClick={() => loadMoreActivity(5)}
                                disabled={activityStatus === "LoadingMore"}
                            >
                                {activityStatus === "LoadingMore" ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                ) : null}
                                {activityStatus === "LoadingMore" ? "Loading…" : "View more activity"}
                            </Button>
                        </div>
                    )}
                </Card>

            </div>

            {/* 4. Today's Snapshot Row */}
            <div className="space-y-4 pt-4 border-t">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Today's Snapshot</h2>
                    <p className="text-sm text-muted-foreground">Performance metrics for today.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Conversations Today</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{todaySnapshot.todayCount}</h3>
                                    <p className={`text-xs font-medium ${todaySnapshot.diffFromYesterday >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {todaySnapshot.diffFromYesterday > 0 ? '+' : ''}{todaySnapshot.diffFromYesterday} from yesterday
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Bot Resolved Today</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{todaySnapshot.botResolvedToday}</h3>
                                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                                        <Zap className="h-3 w-3" />
                                        Automated
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Avg Wait Time Today</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">
                                        {todaySnapshot.avgWaitTimeTodayMs
                                            ? formatDistanceToNow(Date.now() - todaySnapshot.avgWaitTimeTodayMs).replace('about ', '')
                                            : '—'}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}
