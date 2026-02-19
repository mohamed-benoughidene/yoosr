"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CircleX } from "lucide-react";

export function CloseNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[200px] max-w-[260px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                    ? "border-red-500 shadow-md shadow-red-500/10"
                    : "border-border hover:border-red-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background transition-colors group-hover:!bg-red-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10">
                    <CircleX className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="text-xs font-semibold">
                    {nodeData.label || "Close"}
                </span>
            </div>

            <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {nodeData.closingMessage || "Conversation closed."}
                </p>
            </div>
        </div>
    );
}
