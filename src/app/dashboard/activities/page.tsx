"use client";

import { useProject } from "@/context/ProjectContext";
import { ActivitiesDataTable } from "@/components/activities/ActivitiesDataTable";
import { columns } from "@/components/activities/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";

export default function ActivitiesPage() {
    const { activeProject } = useProject();
    const logs = useQuery(api.activityLogs.list, activeProject ? { projectId: activeProject._id } : "skip");
    const logActivity = useMutation(api.activityLogs.log);

    const handleTestLog = async () => {
        if (!activeProject) return;
        try {
            await logActivity({
                projectId: activeProject._id,
                actionType: "other",
                description: "Manual test log entry",
                metadata: { source: "dashboard_test" },
            });
            toast.success("Test log created");
        } catch {
            toast.error("Failed to create test log");
        }
    };

    if (!activeProject) return <div className="p-8">Select a project to view activities.</div>;

    // Map Convex documents to the format expected by the data table columns
    const mappedLogs = (logs ?? []).map((log: any) => ({
        id: log._id,
        action_type: log.actionType,
        description: log.description ?? "",
        metadata: log.metadata ?? {},
        user_id: log.userId ?? null,
        created_at: log._creationTime ? new Date(log._creationTime).toISOString() : new Date().toISOString(),
    }));

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground">
                        Audit trail of actions performed within {activeProject.name}.
                    </p>
                </div>
                <Button variant="outline" onClick={handleTestLog}>
                    Generate Test Log
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>
                        A list of recent events and actions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs === undefined ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ActivitiesDataTable columns={columns} data={mappedLogs} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
