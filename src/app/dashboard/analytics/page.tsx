"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { AnalyticsRealtime } from "@/components/analytics/AnalyticsRealtime";
import { AnalyticsMetrics } from "@/components/analytics/AnalyticsMetrics";

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <div className="flex items-center space-x-2">
                    {/* Calendar DatePicker could go here */}
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="realtime">Real Time</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <AnalyticsOverview />
                </TabsContent>
                <TabsContent value="realtime" className="space-y-4">
                    <AnalyticsRealtime />
                </TabsContent>
                <TabsContent value="metrics" className="space-y-4">
                    <AnalyticsMetrics />
                </TabsContent>
            </Tabs>
        </div>
    );
}
