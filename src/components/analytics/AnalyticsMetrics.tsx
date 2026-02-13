"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationsMetric } from "./metrics/ConversationsMetric";
import { VisitorsMetric } from "./metrics/VisitorsMetric";
import { ResponseTimeMetric } from "./metrics/ResponseTimeMetric";

export function AnalyticsMetrics() {
    return (
        <div className="space-y-4">
            <Tabs defaultValue="conversations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="conversations">Conversations</TabsTrigger>
                    <TabsTrigger value="visitors">Visitors</TabsTrigger>
                    <TabsTrigger value="response_time">Response Time</TabsTrigger>
                </TabsList>
                <TabsContent value="conversations" className="space-y-4">
                    <ConversationsMetric />
                </TabsContent>
                <TabsContent value="visitors" className="space-y-4">
                    <VisitorsMetric />
                </TabsContent>
                <TabsContent value="response_time" className="space-y-4">
                    <ResponseTimeMetric />
                </TabsContent>
            </Tabs>
        </div>
    );
}
