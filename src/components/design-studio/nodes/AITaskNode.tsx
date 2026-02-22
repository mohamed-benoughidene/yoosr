"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";

export function AITaskNode({ data, selected }: NodeProps) {
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[220px] max-w-[260px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                ? "border-pink-500 shadow-md shadow-pink-500/10"
                : "border-border hover:border-pink-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-pink-500 !bg-background transition-colors group-hover:!bg-pink-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-500/10">
                    <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                </div>
                <span className="text-xs font-semibold">
                    {nodeData.label || "AI Task"}
                </span>
            </div>

            <div className="px-4 py-2 space-y-0.5">
                {nodeData.prompt || nodeData.systemPrompt ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {nodeData.prompt || nodeData.systemPrompt}
                    </p>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        Click to add prompt...
                    </p>
                )}
                <p className="text-[10px] text-muted-foreground truncate opacity-70">
                    {nodeData.model || "mistralai/mistral-7b-instruct"}
                </p>
            </div>

            <div className="flex justify-between px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground border-t">
                <span>Success</span>
                <span>Failure</span>
            </div>
            <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-background" />
            <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
        </div>
    );
}
