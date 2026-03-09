"use client";

import { ArrowLeft, Check, Loader2, Save, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface FlowToolbarProps {
    botName: string;
    saveState: "idle" | "saving" | "saved" | "error";
    onSave: () => void;
    isDebuggerOpen?: boolean;
    onToggleDebugger?: () => void;
    isAIBarOpen?: boolean;
    onToggleAIBar?: () => void;
}

import { Suspense } from "react";

function FlowToolbarContent({ botName, saveState, onSave, isDebuggerOpen, onToggleDebugger, isAIBarOpen, onToggleAIBar }: FlowToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("project");

    return (
        <div className="flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        router.push(
                            `/dashboard/bots${projectId ? `?project=${projectId}` : ""}`
                        )
                    }
                    className="h-8 w-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border" />
                <h1 className="text-sm font-semibold">{botName}</h1>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {saveState === "saving" && (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Saving...</span>
                        </>
                    )}
                    {saveState === "saved" && (
                        <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">Saved</span>
                        </>
                    )}
                    {saveState === "error" && (
                        <span className="text-red-500">Save failed</span>
                    )}
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSave}
                    disabled={saveState === "saving"}
                >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save
                </Button>
                {onToggleAIBar && (
                    <Button
                        size="sm"
                        variant={isAIBarOpen ? "secondary" : "outline"}
                        onClick={onToggleAIBar}
                        className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Build with AI
                    </Button>
                )}
                {onToggleDebugger && (
                    <Button
                        size="sm"
                        variant={isDebuggerOpen ? "secondary" : "outline"}
                        onClick={onToggleDebugger}
                        className="ml-2 gap-1.5"
                    >
                        <Terminal className="h-4 w-4" />
                        Debugger
                    </Button>
                )}
            </div>
        </div>
    );
}

export function FlowToolbar(props: FlowToolbarProps) {
    return (
        <Suspense fallback={<div className="h-14 border-b bg-background px-4 flex items-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>}>
            <FlowToolbarContent {...props} />
        </Suspense>
    );
}
