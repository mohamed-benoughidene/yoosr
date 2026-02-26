"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { type Node, type Edge } from "@xyflow/react";
import { Sparkles, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BuildWithAIModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (nodes: Node[], edges: Edge[]) => void;
}

const EXAMPLE_PROMPTS = [
    "Greet the visitor, ask for their name and email, then check if they're an existing customer. If yes, hand off to a support agent. If no, close the conversation.",
    "Welcome the user, collect their name, then route them based on whether they're a premium customer — if yes, connect to an agent; if no, send a closing message.",
    "Ask the visitor their question, search the knowledge base for an answer, and if nothing is found, escalate to a human agent.",
];

export function BuildWithAIModal({
    open,
    onOpenChange,
    onGenerate,
}: BuildWithAIModalProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const generateFlow = useAction(api.aiFlowBuilder.generateFlow);

    const handleGenerate = async () => {
        const trimmed = prompt.trim();
        if (!trimmed) return;

        setIsGenerating(true);
        try {
            const result = await generateFlow({ prompt: trimmed });
            onGenerate(result.nodes as Node[], result.edges as Edge[]);
            onOpenChange(false);
            setPrompt("");
            toast.success("Flow generated!", {
                description: "Your canvas has been populated. Review and tweak as needed.",
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            toast.error("Generation failed", { description: message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        Build with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe your flow in plain language — in English or Arabic — and AI
                        will generate a ready-made canvas for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Textarea
                        dir="auto"
                        placeholder="e.g. Greet the visitor, ask for their name, check if they're an existing customer — if yes hand off to an agent, if no close the conversation."
                        className="min-h-[140px] resize-none text-sm leading-relaxed"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isGenerating}
                    />

                    {/* Example prompts */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Try an example
                        </p>
                        <div className="space-y-1.5">
                            {EXAMPLE_PROMPTS.map((example, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPrompt(example)}
                                    disabled={isGenerating}
                                    className="w-full rounded-md border border-dashed px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
