"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export type ActivityLog = {
    _id: string;
    actorName?: string;
    action?: string;
    actionType: string;
    targetType?: string;
    targetId?: string;
    createdAt?: number;
    _creationTime: number;
};

const TARGET_COLORS: Record<string, "default" | "secondary" | "outline"> = {
    teammate: "default",
    department: "secondary",
    bot: "outline",
};

export const getColumns = (t: any): ColumnDef<ActivityLog>[] => [
    {
        accessorKey: "createdAt",
        header: t("activity_log.date"),
        cell: ({ row }) => {
            const ts = row.original.createdAt ?? row.original._creationTime;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{new Date(ts).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ts), { addSuffix: true })}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "actorName",
        header: t("activity_log.actor"),
        cell: ({ row }) => (
            <span className="text-sm font-medium">
                {row.original.actorName ?? "System"}
            </span>
        ),
    },
    {
        accessorKey: "action",
        header: t("activity_log.action"),
        cell: ({ row }) => {
            const key = row.original.action ?? row.original.actionType;
            return (
                <span className="text-sm">
                    {t(`dashboard.activity_actions.${key}`)}
                </span>
            );
        },
    },
    {
        accessorKey: "targetType",
        header: t("activity_log.target"),
        cell: ({ row }) => {
            const { targetType, targetId } = row.original;
            if (!targetType) return <span className="text-muted-foreground text-sm">—</span>;
            return (
                <div className="flex items-center gap-2">
                    <Badge variant={TARGET_COLORS[targetType] ?? "secondary"}>
                        {targetType}
                    </Badge>
                    {targetId && (
                        <span className="text-xs text-muted-foreground truncate max-w-32" title={targetId}>
                            {targetId}
                        </span>
                    )}
                </div>
            );
        },
    },
];
