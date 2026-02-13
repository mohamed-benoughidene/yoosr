"use client";

import { BarChart } from "@/components/ui/charts/BarChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/ProjectContext";

export function ConversationsMetric() {
    const { activeProject } = useProject();
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });

    useEffect(() => {
        if (!activeProject) return;

        const fetchData = async () => {
            const supabase = createClient();
            const { data: statsData, error } = await supabase
                .rpc('get_daily_conversations_stats', {
                    p_project_id: activeProject.id,
                });

            if (statsData) {
                // Format for chart
                const chartData = statsData.map((d: any) => ({
                    name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                    Bot: 0,
                    Human: Number(d.total_count),
                    total: Number(d.total_count),
                    open: Number(d.open_count),
                    closed: Number(d.closed_count)
                }));
                setData(chartData);

                // Aggregates
                const totalClosed = statsData.reduce((acc: number, curr: any) => acc + Number(curr.closed_count), 0);
                setStats({
                    total: statsData.reduce((acc: number, curr: any) => acc + Number(curr.total_count), 0),
                    open: statsData.reduce((acc: number, curr: any) => acc + Number(curr.open_count), 0),
                    closed: totalClosed
                });
            }
        };

        fetchData();
    }, [activeProject]);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Closed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.closed}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.open}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">In selected period</p>
                    </CardContent>
                </Card>
            </div>

            <BarChart
                title="Conversation Status"
                description="Daily breakdown of Open vs Closed conversations"
                data={data}
                categories={["open", "closed"]}
                colors={["#a855f7", "#3b82f6"]}
            />
        </div>
    );
}
