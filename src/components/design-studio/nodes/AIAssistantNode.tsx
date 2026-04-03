"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useTranslations } from "next-intl";

export function AIAssistantNode({ data, selected }: NodeProps) {
    const t = useTranslations("designStudio");
    const nodeData = data as Record<string, string>;
    const { activeProject } = useProject();
    const fallbackModel = activeProject?.defaultModel || "mistralai/mistral-small-3.1-24b-instruct:free";
    return (
        <div className={`group relative min-w-[220px] rounded-xl border-2 bg-background shadow-sm transition-all ${selected ? "border-fuchsia-500 shadow-fuchsia-500/10" : "border-border hover:border-fuchsia-500/50"}`}>
            <Handle type="target" position={Position.Top} className="!h-3 !w-3 !rounded-full !border-2 !border-fuchsia-500 !bg-background transition-colors group-hover:!bg-fuchsia-500" />
            <div className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <Bot className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-destructive leading-normal">
                    This block has been removed. Replace it with the Knowledge Base block.
                </p>
            </div>
            <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-green-500 !bg-background" />
            <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} className="!h-3 !w-3 !rounded-full !border-2 !border-red-500 !bg-background" />
        </div>
    );
}
