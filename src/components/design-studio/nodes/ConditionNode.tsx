"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function ConditionNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[220px] max-w-[280px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                    ? "border-amber-500 shadow-md shadow-amber-500/10"
                    : "border-border hover:border-amber-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-amber-500 !bg-background transition-colors group-hover:!bg-amber-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
                    <GitBranch className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <span className="text-xs font-semibold">
                    {nodeData.label || "Condition"}
                </span>
            </div>

            <div className="px-4 py-3">
                {nodeData.attributeKey ? (
                    <p className="text-[10px] text-muted-foreground">
                        <span className="font-mono text-amber-600">
                            {`{{${nodeData.attributeKey}}}`}
                        </span>{" "}
                        <span className="font-medium">{nodeData.operator}</span>{" "}
                        <span className="font-mono">{`"${nodeData.compareValue}"`}</span>
                    </p>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        Click to configure...
                    </p>
                )}
            </div>

            {/* Two output handles: true and false */}
            <div className="flex items-center justify-between px-4 pb-2">
                <span className="text-[10px] font-medium text-emerald-500">True</span>
                <span className="text-[10px] font-medium text-red-500">False</span>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="!left-[30%] !h-3 !w-3 !rounded-full !border-2 !border-emerald-500 !bg-background transition-colors group-hover:!bg-emerald-500"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="!left-[70%] !h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background transition-colors group-hover:!bg-red-500"
            />
        </div>
    );
}
