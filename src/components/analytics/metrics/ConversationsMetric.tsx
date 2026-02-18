"use client";

import { BarChart } from "@/components/ui/charts/BarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";

export function ConversationsMetric() {
    const { activeProject } = useProject();

    const stats = useQuery(
        api.analytics.getConversationStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    const total = stats?.total ?? 0;
    const open = stats?.open ?? 0;
    const closed = stats?.closed ?? 0;

    // For the chart, we show a simple breakdown (daily breakdown requires a dedicated query)
    const chartData = [
        { name: "Open", open, closed: 0 },
        { name: "Closed", open: 0, closed },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Closed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{closed}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{open}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">All conversations</p>
                    </CardContent>
                </Card>
            </div>

            <BarChart
                title="Conversation Status"
                description="Breakdown of Open vs Closed conversations"
                data={chartData}
                categories={["open", "closed"]}
                colors={["#a855f7", "#3b82f6"]}
            />
        </div>
    );
}
