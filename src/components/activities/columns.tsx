"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type ActivityLog = {
    id: string;
    created_at: string;
    user_id: string | null;
    action_type: string;
    description: string;
    metadata: any;
    // We might need to join with profiles to get user details, 
    // but for now let's assume we fetch basic user info or just show ID/System
    user_email?: string;
};

export const columns: ColumnDef<ActivityLog>[] = [
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
            return <div className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(row.getValue("created_at")), "MMM d, yyyy HH:mm")}
            </div>
        },
    },
    {
        accessorKey: "user_email", // or user_id if email not available yet
        header: "Actor",
        cell: ({ row }) => {
            const email = row.original.user_email || "System/Unknown";
            const initial = email[0]?.toUpperCase() || "?";
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{email}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "action_type",
        header: "Action",
        cell: ({ row }) => {
            const action = row.getValue("action_type") as string;
            return (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {action.replace(/_/g, " ").toUpperCase()}
                </div>
            )
        }
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div className="text-sm max-w-[500px] truncate" title={row.getValue("description")}>{row.getValue("description")}</div>,
    },
];
