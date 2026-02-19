"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";

export function WebRequestNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[200px] max-w-[260px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                    ? "border-cyan-500 shadow-md shadow-cyan-500/10"
                    : "border-border hover:border-cyan-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-cyan-500 !bg-background transition-colors group-hover:!bg-cyan-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10">
                    <Globe className="h-3.5 w-3.5 text-cyan-500" />
                </div>
                <span className="text-xs font-semibold">
                    {nodeData.label || "Web Request"}
                </span>
            </div>

            <div className="px-4 py-3">
                {nodeData.url ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-600">
                                {nodeData.method || "GET"}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">
                            {nodeData.url}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        Click to configure...
                    </p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !rounded-full !border-2 !border-cyan-500 !bg-background transition-colors group-hover:!bg-cyan-500"
            />
        </div>
    );
}
