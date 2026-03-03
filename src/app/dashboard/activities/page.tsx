"use client";

import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { ActivitiesDataTable } from "@/components/activities/ActivitiesDataTable";
import { columns, type ActivityLog } from "@/components/activities/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity } from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const PAGE_SIZE = 25;

export default function ActivitiesPage() {
    const { activeProject } = useProject();

    const { results: logs, status, loadMore } = usePaginatedQuery(
        api.activityLogs.getActivityLog,
        activeProject ? { projectId: activeProject._id } : "skip",
        { initialNumItems: PAGE_SIZE }
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
                        Audit log of actions taken in this project, sorted by newest first.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {logs === undefined ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mappedLogs.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            No activity yet. Actions taken by admin users will appear here.
                        </div>
                    ) : (
                        <>
                            <ActivitiesDataTable columns={columns} data={mappedLogs} />
                            {status !== "Exhausted" && (
                                <div className="flex justify-center mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadMore(PAGE_SIZE)}
                                        disabled={status === "LoadingMore"}
                                    >
                                        {status === "LoadingMore" ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            "Load More"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
