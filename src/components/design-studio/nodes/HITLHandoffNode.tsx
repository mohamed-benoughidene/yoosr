"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { UserRoundPlus } from "lucide-react";

export function HITLHandoffNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[200px] max-w-[260px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                    ? "border-orange-500 shadow-md shadow-orange-500/10"
                    : "border-border hover:border-orange-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-background transition-colors group-hover:!bg-orange-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/10">
                    <UserRoundPlus className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <span className="text-xs font-semibold">
                    {nodeData.label || "HITL Handoff"}
                </span>
            </div>

            <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {nodeData.handoffMessage || "Connecting you with a human agent..."}
                </p>
            </div>
        </div>
    );
}
