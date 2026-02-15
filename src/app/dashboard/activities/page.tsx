"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { createClient } from "@/lib/supabase/client";
import { ActivitiesDataTable } from "@/components/activities/ActivitiesDataTable";
import { columns, ActivityLog } from "@/components/activities/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logActivity } from "@/lib/logging";

export default function ActivitiesPage() {
    const { activeProject } = useProject();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        if (!activeProject) return;
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('project_id', activeProject.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error(error);
        } else {
            setLogs(data as ActivityLog[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [activeProject]);

    const handleTestLog = async () => {
        if (!activeProject) return;
        await logActivity({
            projectId: activeProject.id,
            actionType: 'other',
            description: 'Manual test log entry',
            metadata: { source: 'dashboard_test' }
        });
        fetchLogs();
    };

    if (!activeProject) return <div className="p-8">Select a project to view activities.</div>;

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
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ActivitiesDataTable columns={columns} data={logs} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
