"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useTranslations } from "next-intl";

export function AITaskNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, string>;


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
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.aiTask.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-4 py-2 space-y-0.5">
                {nodeData.prompt || nodeData.systemPrompt ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {nodeData.prompt || nodeData.systemPrompt}
                    </p>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        {t("nodes.clickToAddPrompt")}
                    </p>
                )}

            </div>

            <div className="flex justify-between px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground border-t">
                <span>{t("nodes.success")}</span>
                <span>{t("nodes.failure")}</span>
            </div>
            <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-background" />
            <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
        </div>
    );
}
