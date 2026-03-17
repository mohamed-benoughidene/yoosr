"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Repeat } from "lucide-react";
import { useTranslations } from "next-intl";

export function ReplaceBotNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;
    return (
        <div className={`group relative min-w-[200px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-pink-500 shadow-md" : "border-border hover:border-pink-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-pink-500 !bg-background transition-colors group-hover:!bg-pink-500" />
            <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-500/10">
                    <Repeat className="h-3.5 w-3.5 text-pink-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.replaceBot.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>
            <div className="px-4 pb-3">
                <p className="text-[10px] font-mono text-muted-foreground bg-muted p-1 rounded text-center">{nodeData.slug || t("nodes.selectBotSlug")}</p>
            </div>
        </div>
    );
}
