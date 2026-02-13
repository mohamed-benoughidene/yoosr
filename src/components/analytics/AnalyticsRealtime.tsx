"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/ProjectContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RealtimeEvent {
    id: string;
    type: 'message' | 'conversation';
    content: string;
    timestamp: string;
    user_id?: string;
}

export function AnalyticsRealtime() {
    const { activeProject } = useProject();
    const [events, setEvents] = useState<RealtimeEvent[]>([]);

    useEffect(() => {
        if (!activeProject) return;
        const supabase = createClient();

        const channel = supabase
            .channel('analytics-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `project_id=eq.${activeProject.id}`,
                },
                (payload) => {
                    const newEvent: RealtimeEvent = {
                        id: payload.new.id,
                        type: 'message',
                        content: (payload.new as any).content || 'New message', // Cast as any if type not fully inferred
                        timestamp: new Date().toLocaleTimeString(),
                        user_id: (payload.new as any).sender_id
                    };
                    setEvents((prev) => [newEvent, ...prev].slice(0, 10)); // Keep last 10
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeProject]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Live Activity Feed</CardTitle>
                        <CardDescription>Real-time stream of incoming messages and events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    Waiting for live events...
                                </div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                            <AvatarFallback>OM</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {event.type === 'message' ? 'New Message' : 'Event'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.content.substring(0, 50)}...
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {event.timestamp}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">
                            {/* Mocked for now, would need presence */}
                            24
                        </div>
                        <p className="text-xs text-muted-foreground">Users currently online</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Queue Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-500">
                            {/* Mocked */}
                            3
                        </div>
                        <p className="text-xs text-muted-foreground">Conversations waiting for agent</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
