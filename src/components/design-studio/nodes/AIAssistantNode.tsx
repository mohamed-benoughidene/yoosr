"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useTranslations } from "next-intl";

export function AIAssistantNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;
    const { activeProject } = useProject();
    const fallbackModel = activeProject?.defaultModel || "mistralai/mistral-small-3.1-24b-instruct:free";
    return (
        <div className={`group relative min-w-[220px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-fuchsia-500 shadow-fuchsia-500/10" : "border-border hover:border-fuchsia-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-fuchsia-500 !bg-background transition-colors group-hover:!bg-fuchsia-500" />
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-fuchsia-500/10">
                    <Bot className="h-3.5 w-3.5 text-fuchsia-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.aiAssistant.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>
            <div className="px-4 py-2 space-y-0.5">
                <p className="text-[10px] text-muted-foreground truncate opacity-70">
                    {nodeData.model || fallbackModel}
                </p>
                <p className="text-[10px] text-muted-foreground truncate opacity-70">
                    {t("nodes.maxTurns")}{nodeData.maxTurns || 3}
                </p>
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
