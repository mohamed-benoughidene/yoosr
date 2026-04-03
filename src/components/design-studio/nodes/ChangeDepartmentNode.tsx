"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Network } from "lucide-react";
import { useTranslations } from "next-intl";

export function ChangeDepartmentNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, string>;
    return (
        <div className={`group relative min-w-[200px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-cyan-500 shadow-md" : "border-border hover:border-cyan-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-cyan-500 !bg-background transition-colors group-hover:!bg-cyan-500" />
            <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10">
                    <Network className="h-3.5 w-3.5 text-cyan-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.changeDept.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
