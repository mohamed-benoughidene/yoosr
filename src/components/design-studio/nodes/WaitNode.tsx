"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Timer } from "lucide-react";
import { useTranslations } from "next-intl";

export function WaitNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;
    return (
        <div className={`group relative min-w-[150px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-gray-500 shadow-md" : "border-border hover:border-gray-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-gray-500 !bg-background transition-colors group-hover:!bg-gray-500" />
            <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                    <Timer className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="text-xs font-semibold">{nodeData.delaySeconds || 1}{t("nodes.secondsSuffix")}</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !rounded-full !border-2 !border-gray-500 !bg-background transition-colors group-hover:!bg-gray-500" />
        </div>
    );
}
