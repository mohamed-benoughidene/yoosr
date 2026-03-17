"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import { useTranslations } from "next-intl";

export function SetAttributeNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[200px] max-w-[260px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                    ? "border-violet-500 shadow-md shadow-violet-500/10"
                    : "border-border hover:border-violet-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-violet-500 !bg-background transition-colors group-hover:!bg-violet-500"
            />

            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
                    <Database className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.setAttribute.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-4 py-3">
                {nodeData.attributeKey ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="rounded bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] text-violet-600">
                                {nodeData.attributeKey}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                            = {nodeData.attributeValue || t("nodes.clickToConfigure")}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        {t("nodes.clickToConfigure")}
                    </p>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !rounded-full !border-2 !border-violet-500 !bg-background transition-colors group-hover:!bg-violet-500"
            />
        </div>
    );
}
