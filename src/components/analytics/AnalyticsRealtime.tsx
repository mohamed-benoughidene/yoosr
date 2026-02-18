"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useProject } from "@/context/ProjectContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// With Convex, real-time is built-in — useQuery automatically updates.
// The messages query is reactive, so new messages will appear automatically.

export function AnalyticsRealtime() {
    const { activeProject } = useProject();

    const convexStats = useQuery(
        api.analytics.getConversationStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    const messageStats = useQuery(
        api.analytics.getMessageStats,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Live Activity Feed</CardTitle>
                        <CardDescription>Real-time data powered by Convex reactive queries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                    <AvatarFallback>RT</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Total Messages
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {messageStats?.total ?? 0} messages ({messageStats?.visitorMessages ?? 0} visitor, {messageStats?.agentMessages ?? 0} agent)
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Reactive queries provide real-time updates automatically.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">
                            {convexStats?.open ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently open chats</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Closed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-500">
                            {convexStats?.closed ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Resolved conversations</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
