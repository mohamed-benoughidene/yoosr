"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { FlowToolbar } from "@/components/design-studio/FlowToolbar";
import { FlowEditor } from "@/components/design-studio/FlowEditor";
import { DebuggerPanel } from "@/components/design-studio/DebuggerPanel";
import { AIPromptBar } from "@/components/design-studio/AIPromptBar";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

function BotEditor() {
    const t = useTranslations("designStudio");
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    useProject();

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
    const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [isAIBarOpen, setIsAIBarOpen] = useState(false);
    const [flowEditorKey, setFlowEditorKey] = useState(0);
    const [generatedFlow, setGeneratedFlow] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

    const pendingNodesRef = useRef<Node[] | null>(null);
    const pendingEdgesRef = useRef<Edge[] | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle AI-generated flow
    const handleGeneratedFlow = useCallback(
        (nodes: Node[], edges: Edge[]) => {
            // Valid registered node types in this Design Studio
            const VALID_TYPES = new Set([
                "start", "reply", "setAttribute", "condition", "webRequest",
                "aiTask", "hitlHandoff", "close", "if_operating_hours",
                "if_online_agent", "capture_user_reply", "wait", "ask_kb",
                "replace_bot", "change_department", "code_action",
                "clear_transcript", "ai_assistant",
            ]);

            // Common AI mistakes → correct type
            const TYPE_MAP: Record<string, string> = {
                greeting: "reply", message: "reply", text: "reply",
                send_message: "reply", send: "reply",
                input: "capture_user_reply", capture: "capture_user_reply",
                collect: "capture_user_reply", user_input: "capture_user_reply",
                handoff: "hitlHandoff", hand_off: "hitlHandoff",
                escalate: "hitlHandoff", agent: "hitlHandoff",
                transfer: "hitlHandoff", live_agent: "hitlHandoff",
                end: "close", finish: "close", goodbye: "close",
                if: "condition", branch: "condition", check: "condition",
                decision: "condition", router: "condition",
                delay: "wait", pause: "wait",
                set: "setAttribute", set_attribute: "setAttribute",
                ai: "aiTask", llm: "aiTask", gpt: "aiTask",
                knowledge_base: "ask_kb", kb: "ask_kb", search: "ask_kb",
            };

            const normalizeType = (t: string): string => {
                if (!t) return "reply";
                const lower = t.toLowerCase().replace(/-/g, "_");
                if (VALID_TYPES.has(lower)) return lower;
                return TYPE_MAP[lower] ?? "reply";
            };

            // Sanitize: guarantee every node has id, position, data, and a valid type
            const seenIds = new Set<string>();
            const safeNodes = nodes.map((node, index) => {
                const n = { ...node } as { id?: string; position?: { x: number; y: number }; data?: Record<string, unknown>; type?: string };
                if (!n.id) n.id = `node-${index}`;

                if (seenIds.has(n.id)) {
                    n.id = `${n.id}-${crypto.randomUUID().split('-')[0]}`;
                }
                seenIds.add(n.id);

                n.type = normalizeType(n.type ?? "");
                if (!n.position || typeof n.position.x !== "number") {
                    n.position = { x: 250, y: 50 + index * 180 };
                }
                if (!n.data || typeof n.data !== "object") {
                    n.data = { label: n.type };
                }
                return n as Node;
            });
            setGeneratedFlow({ nodes: safeNodes, edges });
            setFlowEditorKey((k) => k + 1);
        },
        []
    );

    // Ensure nodes have positions and IDs for ReactFlow
    const initialNodesWithPositions = useMemo(() => {
        if (!flow || !flow.nodes) return undefined;
        const seenIds = new Set<string>();
        return (flow.nodes as { id?: string; _id?: string; position?: { x: number; y: number }; data?: Record<string, unknown>; type?: string }[]).map((node, index) => {
            const mappedNode = { ...node };

            // Map Convex _id to ReactFlow id if required
            if (!mappedNode.id && mappedNode._id) {
                mappedNode.id = mappedNode._id;
            } else if (!mappedNode.id) {
                mappedNode.id = `node-${index}`;
            }

            // Force unique ID for legacy duplicated nodes
            if (seenIds.has(mappedNode.id)) {
                mappedNode.id = `${mappedNode.id}-${crypto.randomUUID().split('-')[0]}`;
            }
            seenIds.add(mappedNode.id);

            if (!mappedNode.position) {
                mappedNode.position = {
                    x: 250,
                    y: 100 + (index * 120), // Cascade vertically
                };
            }
            return mappedNode as Node;
        });
    }, [flow]);

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
                <p className="text-muted-foreground">{t("editor.botNotFound")}</p>
                <button
                    onClick={() =>
                        router.push(
                            `/dashboard/bots${projectId ? `?project=${projectId}` : ""}`
                        )
                    }
                    className="text-sm text-primary underline"
                >
                    {t("editor.backToBots")}
                </button>
            </div>
        );
    }

    // Derived: which nodes/edges to show (generated overrides persisted)
    const activeNodes = generatedFlow?.nodes ?? initialNodesWithPositions;
    const activeEdges = generatedFlow?.edges ?? (flow?.edges as Edge[] | undefined);

    return (
        <div className="flex h-screen flex-col">
            <FlowToolbar
                botName={bot.name}
                saveState={saveState}
                onSave={handleManualSave}
                isDebuggerOpen={isDebuggerOpen}
                onToggleDebugger={() => setIsDebuggerOpen(!isDebuggerOpen)}
                isAIBarOpen={isAIBarOpen}
                onToggleAIBar={() => setIsAIBarOpen((v) => !v)}
            />
            <div className="relative flex-1 overflow-hidden">
                {isDebuggerOpen && (
                    <DebuggerPanel
                        projectId={projectId}
                        botId={botId}
                        onActiveNodeChange={setActiveNodeId}
                        onClose={() => setIsDebuggerOpen(false)}
                    />
                )}
                <ReactFlowProvider>
                    <FlowEditor
                        key={flowEditorKey}
                        initialNodes={activeNodes}
                        initialEdges={activeEdges}
                        activeNodeId={activeNodeId}
                        onFlowChange={handleFlowChange}
                    />
                </ReactFlowProvider>
                <AIPromptBar
                    onGenerate={(nodes, edges) => {
                        handleGeneratedFlow(nodes, edges);
                        setIsAIBarOpen(false);
                    }}
                    visible={isAIBarOpen}
                />
            </div>
        </div>
    );
}

export function BotEditorClient() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <BotEditor />
        </Suspense>
    );
}
