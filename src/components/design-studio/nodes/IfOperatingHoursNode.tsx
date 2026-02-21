"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";

export function IfOperatingHoursNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;
    return (
        <div className={`group relative min-w-[200px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-amber-500 shadow-amber-500/10" : "border-border hover:border-amber-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-amber-500 !bg-background transition-colors group-hover:!bg-amber-500" />
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <span className="text-xs font-semibold">{nodeData.label || "Operating Hours"}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground border-t">
                <span>Open</span>
                <span>Closed</span>
            </div>
            <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-background" />
            <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
        </div>
    );
}
