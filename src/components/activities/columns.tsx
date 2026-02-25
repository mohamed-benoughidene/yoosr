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

const ACTION_LABELS: Record<string, string> = {
    teammate_invited: "Invited teammate",
    teammate_removed: "Removed teammate",
    teammate_accepted: "Accepted invitation",
    teammate_rejected: "Declined invitation",
    role_changed: "Changed role",
    status_changed: "Changed status",
    operating_hours_updated: "Updated operating hours",
    bot_created: "Created bot",
    bot_updated: "Updated bot",
    department_updated: "Updated department",
    other: "Other action",
};

const TARGET_COLORS: Record<string, "default" | "secondary" | "outline"> = {
    teammate: "default",
    department: "secondary",
    bot: "outline",
};

export const columns: ColumnDef<ActivityLog>[] = [
    {
        accessorKey: "createdAt",
        header: "Date",
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
        header: "Actor",
        cell: ({ row }) => (
            <span className="text-sm font-medium">
                {row.original.actorName ?? "System"}
            </span>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
            const key = row.original.action ?? row.original.actionType;
            return (
                <span className="text-sm">
                    {ACTION_LABELS[key] ?? key}
                </span>
            );
        },
    },
    {
        accessorKey: "targetType",
        header: "Target",
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
