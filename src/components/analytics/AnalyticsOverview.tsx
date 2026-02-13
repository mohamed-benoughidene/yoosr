"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MessageSquare, Clock, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/ProjectContext";

interface Stats {
    totalConversations: number;
    activeNow: number;
    avgResponseTime: string;
    satisfaction: string;
}

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
    const [stats, setStats] = useState<Stats>({
        totalConversations: 0,
        activeNow: 0,
        avgResponseTime: "2m",
        satisfaction: "98%",
    });

    useEffect(() => {
        if (!activeProject) return;

        const fetchStats = async () => {
            const supabase = createClient();

            // Count total conversations
            const { count: total } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', activeProject.id);

            // Active count (status = open or unassigned)
            const { count: active } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', activeProject.id)
                .neq('status', 'closed'); // Assume 'closed' is the terminal state

            setStats(prev => ({
                ...prev,
                totalConversations: total || 0,
                activeNow: active || 0
            }))
        }

        fetchStats();
    }, [activeProject]);

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
                        <div className="text-2xl font-bold">{stats.totalConversations}</div>
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
                        <div className="text-2xl font-bold">{stats.activeNow}</div>
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
                        <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
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
                        <div className="text-2xl font-bold">{stats.satisfaction}</div>
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
                    {/* Placeholder for another chart or deeper stat */}
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
