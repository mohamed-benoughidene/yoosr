"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/ProjectContext";

export function VisitorsMetric() {
    const { activeProject } = useProject();
    const [data, setData] = useState<any[]>([]);
    const [totalVisitors, setTotalVisitors] = useState(0);

    useEffect(() => {
        if (!activeProject) return;

        const fetchData = async () => {
            const supabase = createClient();
            const { data: statsData, error } = await supabase
                .rpc('get_daily_visitors_stats', {
                    p_project_id: activeProject.id,
                });

            if (statsData) {
                const chartData = statsData.map((d: any) => ({
                    date: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                    value: Number(d.visitor_count)
                }));
                setData(chartData);
                setTotalVisitors(statsData.reduce((acc: number, curr: any) => acc + Number(curr.visitor_count), 0));
            }
        };

        fetchData();
    }, [activeProject]);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVisitors}</div>
                        <p className="text-xs text-muted-foreground">Unique visitors (Last 30 days)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">Requires session tracking</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Returning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">Requires session tracking</p>
                    </CardContent>
                </Card>
            </div>
            <TrendChart
                title="Visitor Traffic"
                description="Unique visitors over the last 30 days"
                data={data}
                color="#10b981"
            />
        </div>
    );
}
