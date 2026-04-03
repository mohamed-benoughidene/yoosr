"use client";

import { useTranslations } from "next-intl";

import { useProject } from "@/context/ProjectContext";
import { ActivitiesDataTable } from "@/components/activities/ActivitiesDataTable";
import { getColumns, type ActivityLog } from "@/components/activities/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

const PAGE_SIZE = 25;

export default function ActivitiesPage() {
    const t = useTranslations("activities");
    const tLog = useTranslations();
    const { activeProject } = useProject();
    const columns = getColumns(tLog);

    const { results: logs, status, loadMore } = usePaginatedQuery(
        api.activityLogs.getActivityLog,
        activeProject ? { projectId: activeProject._id } : "skip",
        { initialNumItems: PAGE_SIZE }
    );

    if (!activeProject) {
        return <div className="p-8 text-muted-foreground">Select a project to view activities.</div>;
    }

    const mappedLogs: ActivityLog[] = (logs ?? []).map((log: {
        _id: string;
        actorName?: string;
        action?: string;
        actionType?: string;
        targetType?: string;
        targetId?: string;
        createdAt?: number;
        _creationTime?: number;
    }) => ({
        _id: log._id,
        actorName: log.actorName ?? "Unknown",
        action: log.action ?? "unknown",
        actionType: log.actionType ?? "unknown",
        targetType: log.targetType ?? "unknown",
        targetId: log.targetId,
        createdAt: log.createdAt ?? log._creationTime ?? 0,
        _creationTime: log._creationTime ?? 0,
    }));

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">
                    {t("subtitle")} in{" "}
                    <span className="font-medium text-foreground">{activeProject.name}</span>.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {t("recent")}
                    </CardTitle>
                    <CardDescription>
                        {t("description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {logs === undefined ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mappedLogs.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                            {t("no_activity")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <ActivitiesDataTable
                                columns={columns}
                                data={mappedLogs}
                                loadMore={loadMore}
                                status={status}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
