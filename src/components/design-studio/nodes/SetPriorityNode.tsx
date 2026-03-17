"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function SetPriorityNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-500 hover:bg-red-500 text-white";
            case "high": return "bg-orange-500 hover:bg-orange-500 text-white";
            case "low": return "bg-slate-500 hover:bg-slate-500 text-white";
            default: return "bg-gray-500 hover:bg-gray-500 text-white";
        }
    };

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
                    <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.setPriority.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{t("nodes.priority")}</span>
                    <Badge variant="secondary" className={`text-[10px] uppercase h-5 px-1.5 ${getPriorityColor(nodeData.priority || t("nodes.normalFallback") as string)}`}>
                        {nodeData.priority || t("nodes.normalFallback")}
                    </Badge>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !rounded-full !border-2 !border-orange-500 !bg-background transition-colors group-hover:!bg-orange-500"
            />
        </div>
    );
}
