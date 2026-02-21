"use client";

import {
    Play,
    MessageSquare,
    Database,
    GitBranch,
    Globe,
    Sparkles,
    UserRoundPlus,
    CircleX,
    Clock,
    Users,
    UserCheck,
    Timer,
    BookOpen,
    Repeat,
    Network,
    Code2,
    Eraser,
    type LucideIcon,
} from "lucide-react";
import { BLOCK_TYPES } from "@/types/flow";

const iconMap: Record<string, LucideIcon> = {
    Play,
    MessageSquare,
    Database,
    GitBranch,
    Globe,
    Sparkles,
    UserRoundPlus,
    CircleX,
    Clock,
    Users,
    UserCheck,
    Timer,
    BookOpen,
    Repeat,
    Network,
    Code2,
    Eraser,
};

interface BlockPaletteProps {
    onAddNode: (type: string, data: Record<string, unknown>) => void;
}

export function BlockPalette({ onAddNode }: BlockPaletteProps) {
    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/30">
            <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Blocks</h3>
                <p className="text-xs text-muted-foreground">
                    Click to add to canvas
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {BLOCK_TYPES.filter((b) => b.type !== "start").map((block) => {
                    const Icon = iconMap[block.icon];

                    return (
                        <button
                            key={block.type}
                            onClick={() =>
                                onAddNode(block.type, { ...block.defaultData })
                            }
                            className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-all hover:border-border hover:bg-background hover:shadow-sm active:scale-[0.98]"
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background shadow-sm border ${block.color}`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                    {block.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {block.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
