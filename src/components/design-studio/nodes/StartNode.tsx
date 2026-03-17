"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

export function StartNode({ selected }: NodeProps) {
    const t = useTranslations("designStudio");
    return (
        <div
            className={`group relative flex items-center gap-3 rounded-xl border-2 bg-background px-5 py-3 shadow-sm transition-all ${selected
                    ? "border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "border-border hover:border-emerald-500/50 hover:shadow-md"
                }`}
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <Play className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
                <p className="text-sm font-semibold">{t("blocks.start.name")}</p>
                <p className="text-xs text-muted-foreground">{t("blocks.start.description")}</p>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !rounded-full !border-2 !border-emerald-500 !bg-background transition-colors group-hover:!bg-emerald-500"
            />
        </div>
    );
}
