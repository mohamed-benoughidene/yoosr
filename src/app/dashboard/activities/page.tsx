"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { ActivitiesDataTable } from "@/components/activities/ActivitiesDataTable";
import { columns, type ActivityLog } from "@/components/activities/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const PAGE_SIZE = 25;

export default function ActivitiesPage() {
    const { activeProject } = useProject();

    const logs = useQuery(
        api.activityLogs.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    );

    if (!activeProject) {
        return <div className="p-8 text-muted-foreground">Select a project to view activities.</div>;
    }

    const mappedLogs: ActivityLog[] = (logs ?? []).map((log: any) => ({
        _id: log._id,
        actorName: log.actorName,
        action: log.action,
        actionType: log.actionType,
        targetType: log.targetType,
        targetId: log.targetId,
        createdAt: log.createdAt ?? log._creationTime,
        _creationTime: log._creationTime,
    }));

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                <p className="text-muted-foreground">
                    Audit trail of administrative actions in{" "}
                    <span className="font-medium text-foreground">{activeProject.name}</span>.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Showing the last {(logs ?? []).length} events, newest first.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs === undefined ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mappedLogs.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            No activity yet. Actions taken by admin users will appear here.
                        </div>
                    ) : (
                        <ActivitiesDataTable columns={columns} data={mappedLogs} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
