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
    Bot,
    Tag,
    AlertCircle,
    type LucideIcon,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
    Bot,
    Tag,
    AlertCircle,
};

const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

interface BlockPaletteProps {
    onAddNode: (type: string, data: Record<string, unknown>) => void;
}

export function BlockPalette({ onAddNode }: BlockPaletteProps) {
    const t = useTranslations("designStudio");
    const locale = useLocale();
    const isRtl = locale === "ar";

    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/30">
            <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">{t("palette.title")}</h3>
                <p className="text-xs text-muted-foreground">
                    {t("palette.hint")}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {BLOCK_TYPES.filter((b) => b.type !== "start").map((block) => {
                    const Icon = iconMap[block.icon];
                    const camelType = toCamelCase(block.type);

                    return (
                        <button
                            key={block.type}
                            dir={isRtl ? "rtl" : "ltr"}
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
                            <div className="min-w-0 rtl:text-right">
                                <p className="text-sm font-medium leading-tight rtl:text-right">
                                    {block.type ? t(`blocks.${camelType}.name`) : block.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate rtl:text-right">
                                    {block.type ? t(`blocks.${camelType}.description`) : block.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
