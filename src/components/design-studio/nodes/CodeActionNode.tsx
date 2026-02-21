"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Code2 } from "lucide-react";

export function CodeActionNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;
    return (
        <div className={`group relative min-w-[200px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-emerald-500 shadow-emerald-500/10" : "border-border hover:border-emerald-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-emerald-500 !bg-background transition-colors group-hover:!bg-emerald-500" />
            <div className="flex items-center gap-2 px-4 py-2.5 border-b">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                    <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-xs font-semibold">{nodeData.label || "Code Action"}</span>
            </div>
            <div className="px-4 pb-3 pt-2">
                <p className="text-[10px] text-muted-foreground truncate opacity-70">Assign to: {nodeData.assignTo || "code_result"}</p>
            </div>
            <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !rounded-full !border-2 !border-emerald-500 !bg-background transition-colors group-hover:!bg-emerald-500" />
        </div>
    );
}
