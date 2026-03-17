"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { type Node, type Edge } from "@xyflow/react";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AIPromptBarProps {
    onGenerate: (nodes: Node[], edges: Edge[]) => void;
    visible?: boolean;
}

export function AIPromptBar({ onGenerate, visible = true }: AIPromptBarProps) {
    const t = useTranslations("designStudio");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [examplesOpen, setExamplesOpen] = useState(false);
    const generateFlow = useAction(api.aiFlowBuilder.generateFlow);

    // Examples built from the actual node types available in the Design Studio
    const EXAMPLES = [
        {
            label: t("aiPromptBar.examples.greeting.label"),
            prompt: t("aiPromptBar.examples.greeting.prompt"),
        },
        {
            label: t("aiPromptBar.examples.leadCapture.label"),
            prompt: t("aiPromptBar.examples.leadCapture.prompt"),
        },
        {
            label: t("aiPromptBar.examples.customerCheck.label"),
            prompt: t("aiPromptBar.examples.customerCheck.prompt"),
        },
        {
            label: t("aiPromptBar.examples.kbLookup.label"),
            prompt: t("aiPromptBar.examples.kbLookup.prompt"),
        },
        {
            label: t("aiPromptBar.examples.aiAssistant.label"),
            prompt: t("aiPromptBar.examples.aiAssistant.prompt"),
        },
    ];

    const handleGenerate = async () => {
        const trimmed = prompt.trim();
        if (!trimmed || isGenerating) return;

        setIsGenerating(true);
        try {
            const result = await generateFlow({ prompt: trimmed });
            onGenerate(result.nodes as Node[], result.edges as Edge[]);
            setPrompt("");
            toast.success(t("aiPromptBar.toasts.generated"), {
                description: t("aiPromptBar.toasts.generatedDesc"),
            });
        } catch (err: unknown) {
            // Convex wraps errors with "[CONVEX A(...)] Server Error Uncaught Error: ..."
            // Extract just the meaningful message after the last "Error: " prefix
            let raw = err instanceof Error ? err.message : String(err);
            const match = raw.match(/Uncaught Error:\s*([\s\S]+?)(?:\s+at\s|$)/);
            if (match) raw = match[1].trim();

            // Map known patterns to friendly copy
            let title = t("aiPromptBar.toasts.failed");
            let description = raw;
            if (raw.toLowerCase().includes("timed out")) {
                title = t("aiPromptBar.toasts.timeout");
                description = t("aiPromptBar.toasts.timeoutDesc");
            } else if (raw.toLowerCase().includes("invalid json")) {
                title = t("aiPromptBar.toasts.badFormat");
                description = t("aiPromptBar.toasts.badFormatDesc");
            } else if (raw.toLowerCase().includes("provider returned error")) {
                title = t("aiPromptBar.toasts.providerError");
                description = t("aiPromptBar.toasts.providerErrorDesc");
            } else if (raw.toLowerCase().includes("missing required nodes")) {
                title = t("aiPromptBar.toasts.incomplete");
                description = t("aiPromptBar.toasts.incompleteDesc");
            }

            toast.error(title, { description });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    if (!visible) return null;

    return (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Beta badge */}
            <div className="absolute -top-5 right-2 flex items-center gap-1">
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
                    {t("aiPromptBar.beta")}
                </span>
            </div>

            {/* Main bar */}
            <div className="flex w-[600px] max-w-[calc(100vw-3rem)] items-center gap-2 rounded-2xl border bg-background/95 px-3 py-2 shadow-2xl backdrop-blur-sm ring-1 ring-border/50">
                {/* Examples popover */}
                <Popover open={examplesOpen} onOpenChange={setExamplesOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                            title={t("aiPromptBar.showExamples")}
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        align="start"
                        className="w-80 p-2"
                        sideOffset={10}
                    >
                        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("aiPromptBar.examplesTitle")}
                        </p>
                        <div className="space-y-1">
                            {EXAMPLES.map((ex) => (
                                <button
                                    key={ex.label}
                                    type="button"
                                    onClick={() => {
                                        setPrompt(ex.prompt);
                                        setExamplesOpen(false);
                                    }}
                                    className="w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                                >
                                    <p className="text-xs font-medium">{ex.label}</p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                                        {ex.prompt}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Divider */}
                <div className="h-5 w-px bg-border" />

                {/* Prompt input */}
                <input
                    type="text"
                    dir="auto"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating}
                    placeholder={t("aiPromptBar.placeholder")}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
                />

                {/* Generate button */}
                <Button
                    size="sm"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="shrink-0 gap-1.5 rounded-xl"
                >
                    {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {isGenerating ? t("aiPromptBar.generating") : t("aiPromptBar.generate")}
                </Button>
            </div>
        </div>
    );
}

