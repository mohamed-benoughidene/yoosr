"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MessageSquare, Clock, ThumbsUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";

const MOCK_TREND_DATA = [
    { date: "Mon", value: 12 },
    { date: "Tue", value: 18 },
    { date: "Wed", value: 10 },
    { date: "Thu", value: 25 },
    { date: "Fri", value: 20 },
    { date: "Sat", value: 15 },
    { date: "Sun", value: 8 },
];

export function AnalyticsOverview() {
    const { activeProject } = useProject();

    const convexStats = useQuery(
        api.analytics.getConversationStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    const totalConversations = convexStats?.total ?? 0;
    const activeNow = convexStats?.open ?? 0;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Conversations
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Now
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeNow}</div>
                        <p className="text-xs text-muted-foreground">
                            Current active chats
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2m</div>
                        <p className="text-xs text-muted-foreground">
                            +10% faster than average
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">
                            Based on 12 ratings
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <TrendChart
                        title="Conversations Volume"
                        description="Daily conversation count for the last 7 days"
                        data={MOCK_TREND_DATA}
                    />
                </div>
                <div className="col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Sources</CardTitle>
                            <CardDescription>Where your users are coming from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <div className="w-full flex-1 text-sm">Direct</div>
                                    <div className="text-sm font-medium">55%</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-full flex-1 text-sm">Social</div>
                                    <div className="text-sm font-medium">20%</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-full flex-1 text-sm">Referral</div>
                                    <div className="text-sm font-medium">15%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
