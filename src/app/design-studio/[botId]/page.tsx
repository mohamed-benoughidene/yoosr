"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FlowToolbar } from "@/components/design-studio/FlowToolbar";
import { FlowEditor } from "@/components/design-studio/FlowEditor";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function BotEditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeProject } = useProject();

    const botId = params.botId as Id<"bots">;
    const projectId = searchParams.get("project");

    // Fetch bot and flow data
    const bot = useQuery(api.bots.get, botId ? { id: botId } : "skip");
    const flow = useQuery(
        api.botFlows.get,
        botId ? { botId } : "skip"
    );
    const saveFlow = useMutation(api.botFlows.save);

    const [saveState, setSaveState] = useState<SaveState>("idle");
    const pendingNodesRef = useRef<Node[] | null>(null);
    const pendingEdgesRef = useRef<Edge[] | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save with debounce
    const handleFlowChange = useCallback(
        (nodes: Node[], edges: Edge[]) => {
            pendingNodesRef.current = nodes;
            pendingEdgesRef.current = edges;

            // Debounce saves by 1.5 seconds
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(async () => {
                if (!pendingNodesRef.current || !pendingEdgesRef.current) return;

                setSaveState("saving");
                try {
                    await saveFlow({
                        botId,
                        nodes: pendingNodesRef.current,
                        edges: pendingEdgesRef.current,
                    });
                    setSaveState("saved");
                    // Reset to idle after 2 seconds
                    setTimeout(() => setSaveState("idle"), 2000);
                } catch (error) {
                    console.error("Save failed:", error);
                    setSaveState("error");
                }
            }, 1500);
        },
        [botId, saveFlow]
    );

    // Manual save
    const handleManualSave = useCallback(async () => {
        if (!pendingNodesRef.current || !pendingEdgesRef.current) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setSaveState("saving");
        try {
            await saveFlow({
                botId,
                nodes: pendingNodesRef.current,
                edges: pendingEdgesRef.current,
            });
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            setSaveState("error");
        }
    }, [botId, saveFlow]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Loading state
    if (bot === undefined || flow === undefined) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Bot not found
    if (bot === null) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Bot not found</p>
                <button
                    onClick={() =>
                        router.push(
                            `/dashboard/bots${projectId ? `?project=${projectId}` : ""}`
                        )
                    }
                    className="text-sm text-primary underline"
                >
                    Back to bots
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col">
            <FlowToolbar
                botName={bot.name}
                saveState={saveState}
                onSave={handleManualSave}
            />
            <div className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <FlowEditor
                        initialNodes={
                            flow?.nodes as Node[] | undefined
                        }
                        initialEdges={
                            flow?.edges as Edge[] | undefined
                        }
                        onFlowChange={handleFlowChange}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
