"use client";

import { TrendChart } from "@/components/ui/charts/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";

export function VisitorsMetric() {
    const { activeProject } = useProject();

    const visitorStats = useQuery(
        api.analytics.getVisitorStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    const totalVisitors = visitorStats?.totalVisitors ?? 0;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVisitors}</div>
                        <p className="text-xs text-muted-foreground">Unique visitors (all time)</p>
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
                description="Unique visitors (daily breakdown coming soon)"
                data={[]}
                color="#10b981"
            />
        </div>
    );
}
