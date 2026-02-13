"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/ProjectContext";

export function ResponseTimeMetric() {
    const { activeProject } = useProject();
    const [data, setData] = useState<any[]>([]);
    const [avgResponse, setAvgResponse] = useState(0);

    useEffect(() => {
        if (!activeProject) return;

        const fetchData = async () => {
            const supabase = createClient();
            const { data: statsData, error } = await supabase
                .rpc('get_response_time_stats', {
                    p_project_id: activeProject.id,
                });

            if (statsData) {
                const chartData = statsData.map((d: any) => ({
                    date: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                    value: Number(d.avg_response_time_seconds || 0)
                }));
                setData(chartData);

                // Simple average of averages for the summary card
                const total = statsData.reduce((acc: number, curr: any) => acc + Number(curr.avg_response_time_seconds || 0), 0);
                setAvgResponse(statsData.length ? total / statsData.length : 0);
            }
        };

        fetchData();
    }, [activeProject]);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgResponse.toFixed(1)}s</div>
                        <p className="text-xs text-muted-foreground">Across all agents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Median Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">Not implemented</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">-</div>
                        <p className="text-xs text-muted-foreground">Not implemented</p>
                    </CardContent>
                </Card>
            </div>
            <TrendChart
                title="Average Response Time Trend"
                description="Daily average response time in seconds"
                data={data}
                color="#f59e0b"
            />
        </div>
    );
}
