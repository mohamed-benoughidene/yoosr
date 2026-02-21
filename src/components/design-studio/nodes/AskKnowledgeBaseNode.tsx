"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BookOpen } from "lucide-react";

export function AskKnowledgeBaseNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;
    return (
        <div className={`group relative min-w-[220px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-indigo-500 shadow-indigo-500/10" : "border-border hover:border-indigo-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-indigo-500 !bg-background transition-colors group-hover:!bg-indigo-500" />
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <span className="text-xs font-semibold">{nodeData.label || "Ask KB"}</span>
            </div>
            <div className="px-4 py-2">
                <p className="text-[10px] text-muted-foreground truncate opacity-70">Assign to: {nodeData.assignTo || "kb_reply"}</p>
            </div>
            <div className="flex justify-between px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground border-t">
                <span>Success</span>
                <span>Fallback</span>
            </div>
            <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-background" />
            <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-background" />
        </div>
    );
}
