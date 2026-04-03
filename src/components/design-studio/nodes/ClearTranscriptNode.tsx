"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Eraser } from "lucide-react";
import { useTranslations } from "next-intl";

export function ClearTranscriptNode({ selected }: NodeProps) {
    const t = useTranslations("designStudio");
    return (
        <div className={`group relative min-w-[150px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-red-500 shadow-md" : "border-border hover:border-red-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
            <div className="flex items-center gap-2 px-4 py-2.5 text-red-500">
                <Eraser className="h-4 w-4" />
                <span className="text-xs font-semibold">{t("blocks.clearTranscript.name")}</span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
        </div>
    );
}
