"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

export function ReplyNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, any>;

    return (
        <div
            className={`group relative min-w-[220px] max-w-[280px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected
                ? "border-blue-500 shadow-md shadow-blue-500/10"
                : "border-border hover:border-blue-500/50 hover:shadow-md"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-background transition-colors group-hover:!bg-blue-500"
            />

            {/* Header */}
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate leading-tight">
                        {t("blocks.reply.name")}
                    </span>
                    {nodeData.label && (
                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                            {nodeData.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
                {nodeData.textVariations && nodeData.textVariations.length > 0 ? (
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground/70 uppercase">{t("nodes.randomFrom")}</p>
                        {nodeData.textVariations.map((v: string, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-1 rounded">
                                {v}
                            </p>
                        ))}
                    </div>
                ) : nodeData.text ? (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                        {nodeData.text}
                    </p>
                ) : (
                    <p className="text-xs italic text-muted-foreground/50">
                        {t("nodes.clickToAddMessage")}
                    </p>
                )}

                {/* Buttons preview */}
                {nodeData.buttons && nodeData.buttons.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {nodeData.buttons.map(
                            (btn: any, i: number) => (
                                <div
                                    key={i}
                                    className="rounded-md border border-dashed px-2 py-1 text-center text-[10px] text-muted-foreground"
                                >
                                    {btn.label || t("nodes.button")}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !rounded-full !border-2 !border-blue-500 !bg-background transition-colors group-hover:!bg-blue-500"
            />
        </div>
    );
}
