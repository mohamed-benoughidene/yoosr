"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";

export function ResponseTimeMetric() {
    const { activeProject } = useProject();

    // Note: Convex doesn't have an RPC equivalent of get_response_time_stats.
    // For now, we show placeholder data. A proper implementation would require
    // a Convex query that computes response times from message timestamps.

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
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
                description="Daily average response time in seconds (coming soon)"
                data={[]}
                color="#f59e0b"
            />
        </div>
    );
}
