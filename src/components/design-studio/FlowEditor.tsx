"use client";

import { useCallback, useMemo, useState } from "react";
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    type OnConnect,
    type Node,
    type Edge,
    MarkerType,
    BackgroundVariant,
    useReactFlow,
    type NodeTypes,
    type NodeChange,
    type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { StartNode } from "./nodes/StartNode";
import { ReplyNode } from "./nodes/ReplyNode";
import { SetAttributeNode } from "./nodes/SetAttributeNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { WebRequestNode } from "./nodes/WebRequestNode";
import { AITaskNode } from "./nodes/AITaskNode";
import { HITLHandoffNode } from "./nodes/HITLHandoffNode";
import { CloseNode } from "./nodes/CloseNode";

import { IfOperatingHoursNode } from "./nodes/IfOperatingHoursNode";
import { IfOnlineAgentNode } from "./nodes/IfOnlineAgentNode";
import { CaptureUserReplyNode } from "./nodes/CaptureUserReplyNode";
import { WaitNode } from "./nodes/WaitNode";
import { AskKnowledgeBaseNode } from "./nodes/AskKnowledgeBaseNode";
import { ReplaceBotNode } from "./nodes/ReplaceBotNode";
import { ChangeDepartmentNode } from "./nodes/ChangeDepartmentNode";
import { CodeActionNode } from "./nodes/CodeActionNode";
import { ClearTranscriptNode } from "./nodes/ClearTranscriptNode";
import { ApplyLabelNode } from "./nodes/ApplyLabelNode";
import { SetPriorityNode } from "./nodes/SetPriorityNode";
import { BlockPalette } from "./BlockPalette";
import { NodePropertiesPanel } from "./NodePropertiesPanel";

import { useTranslations } from "next-intl";

 
const nodeTypes: NodeTypes = {
    start: StartNode,
    reply: ReplyNode,
    setAttribute: SetAttributeNode,
    condition: ConditionNode,
    webRequest: WebRequestNode,
    aiTask: AITaskNode,
    hitlHandoff: HITLHandoffNode,
    close: CloseNode,
    if_operating_hours: IfOperatingHoursNode,
    if_online_agent: IfOnlineAgentNode,
    capture_user_reply: CaptureUserReplyNode,
    wait: WaitNode,
    ask_kb: AskKnowledgeBaseNode,
    replace_bot: ReplaceBotNode,
    change_department: ChangeDepartmentNode,
    code_action: CodeActionNode,
    clear_transcript: ClearTranscriptNode,
    applyLabel: ApplyLabelNode,
    setPriority: SetPriorityNode,
};

const defaultStartNode: Node = {
    id: "start-1",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Start" },
};

interface FlowEditorProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    activeNodeId?: string | null;
    onFlowChange: (nodes: Node[], edges: Edge[]) => void;
}

export function FlowEditor({
    initialNodes,
    initialEdges,
    activeNodeId,
    onFlowChange,
}: FlowEditorProps) {
    const t = useTranslations("designStudio");
    const [nodes, setNodes, onNodesChange] = useNodesState(
        initialNodes && initialNodes.length > 0
            ? initialNodes
            : [{ ...defaultStartNode, data: { ...defaultStartNode.data, label: t("canvas.start") } }]
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        initialEdges || []
    );
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    // nodeCountRef removed to prevent duplicate ID bugs. Nodes use crypto.randomUUID() now.

    // Notify parent of changes
    const notifyChange = useCallback(
        (newNodes: Node[], newEdges: Edge[]) => {
            onFlowChange(newNodes, newEdges);
        },
        [onFlowChange]
    );

    // Handle new connections
    const onConnect: OnConnect = useCallback(
        (params) => {
            setEdges((eds) => {
                const newEdges = addEdge(
                    {
                        ...params,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 16,
                            height: 16,
                        },
                        style: { strokeWidth: 2 },
                    },
                    eds
                );
                notifyChange(nodes, newEdges);
                return newEdges;
            });
        },
        [setEdges, nodes, notifyChange]
    );

    // Handle node selection
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            setSelectedNode(node);
        },
        []
    );

    // Handle canvas click (deselect)
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // Add a new node from the palette
    const handleAddNode = useCallback(
        (type: string, data: Record<string, unknown>) => {
            setNodes((nds) => {
                const nextY = 100 + (nds.length * 120);
                const newNode: Node = {
                    id: `${type}-${crypto.randomUUID().split('-')[0]}`,
                    type,
                    position: {
                        x: 250 + Math.random() * 100 - 50,
                        y: nextY,
                    },
                    data,
                };
                const newNodes = [...nds, newNode];
                notifyChange(newNodes, edges);
                return newNodes;
            });
        },
        [setNodes, edges, notifyChange]
    );

    // Update node data (from properties panel)
    const handleUpdateNode = useCallback(
        (nodeId: string, data: Record<string, unknown>) => {
            setNodes((nds) => {
                const newNodes = nds.map((n) =>
                    n.id === nodeId ? { ...n, data } : n
                );
                const updatedNode = newNodes.find((n) => n.id === nodeId);
                if (updatedNode) setSelectedNode(updatedNode);
                notifyChange(newNodes, edges);
                return newNodes;
            });
        },
        [setNodes, edges, notifyChange]
    );

    // Delete a node
    const handleDeleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => {
                const nodeToDelete = nds.find(n => n.id === nodeId);
                if (nodeToDelete?.type === "start") {
                    return nds; // Prevent deletion of start block
                }
                const newNodes = nds.filter((n) => n.id !== nodeId);
                setEdges((eds) => {
                    const newEdges = eds.filter(
                        (e) => e.source !== nodeId && e.target !== nodeId
                    );
                    notifyChange(newNodes, newEdges);
                    return newEdges;
                });
                return newNodes;
            });
            setSelectedNode(null);
        },
        [setNodes, setEdges, notifyChange]
    );

    // Track node/edge changes for auto-save
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            // Filter out deletion events for the start node
            const filteredChanges = changes.filter((change) => {
                if (change.type === 'remove') {
                    const node = nodes.find(n => n.id === change.id);
                    return node?.type !== 'start';
                }
                return true;
            });
            onNodesChange(filteredChanges);
            // Debounced change notification will happen via the parent
        },
        [onNodesChange, nodes]
    );

    const handleEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            onEdgesChange(changes);
        },
        [onEdgesChange]
    );

    const { getNodes } = useReactFlow();

    // Sync latest nodes/edges for save
    const handleNodeDragStop = useCallback(
        () => {
            notifyChange(getNodes(), edges);
        },
        [edges, notifyChange, getNodes]
    );

    const handleEdgesDelete = useCallback(
        (deletedEdges: Edge[]) => {
            const remainingEdges = edges.filter(
                (e) => !deletedEdges.find((de) => de.id === e.id)
            );
            notifyChange(getNodes(), remainingEdges);
        },
        [getNodes, edges, notifyChange]
    );

    const handleNodesDelete = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_deletedNodes: Node[]) => {
            notifyChange(getNodes(), edges);
        },
        [getNodes, edges, notifyChange]
    );

    const onEdgeDoubleClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            event.stopPropagation();
            setEdges((eds) => {
                const newEdges = eds.filter((e) => e.id !== edge.id);
                notifyChange(getNodes(), newEdges);
                return newEdges;
            });
        },
        [setEdges, notifyChange, getNodes]
    );

    // Apply active node highlighting dynamically
    const styledNodes = useMemo(() => {
        return nodes.map(n => {
            if (activeNodeId && n.id === activeNodeId) {
                return {
                    ...n,
                    className: `${n.className || ""} ring-4 ring-emerald-500 ring-offset-4 ring-offset-background animate-pulse transition-all duration-300 shadow-xl shadow-emerald-500/20`
                };
            }
            // Return base node if not active
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { className, ...rest } = n;
            return rest as Node;
        });
    }, [nodes, activeNodeId]);

    return (
        <div className="flex h-full w-full">
            <BlockPalette onAddNode={handleAddNode} />

            <div className="relative flex-1">
                <ReactFlow
                    nodes={styledNodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onNodeDragStop={handleNodeDragStop}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    onEdgesDelete={handleEdgesDelete}
                    onNodesDelete={handleNodesDelete}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    defaultEdgeOptions={{
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 16,
                            height: 16,
                        },
                        style: { strokeWidth: 2 },
                    }}
                    proOptions={{ hideAttribution: true }}
                    className="design-studio-canvas"
                >
                    <Controls
                        position="bottom-left"
                        className="!rounded-lg !border !shadow-sm"
                    />
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        className="!bg-muted/20"
                    />
                    <MiniMap
                        position="bottom-right"
                        className="!rounded-lg !border !shadow-sm"
                        maskColor="color-mix(in srgb, var(--foreground) 8%, transparent)"
                        nodeColor={(node) => {
                            switch (node.type) {
                                case "start":
                                case "code_action":
                                    return "hsl(var(--flow-node-success))";
                                case "reply":
                                    return "hsl(var(--flow-node-info))";
                                case "setAttribute":
                                case "ask_kb":
                                case "capture_user_reply":
                                    return "hsl(var(--flow-node-purple))";
                                case "condition":
                                case "if_operating_hours":
                                case "if_online_agent":
                                    return "hsl(var(--flow-node-warning))";
                                case "webRequest":
                                case "change_department":
                                    return "hsl(var(--flow-node-cyan))";
                                case "aiTask":
                                case "replace_bot":
                                case "applyLabel":
                                    return "hsl(var(--flow-node-pink))";
                                case "hitlHandoff":
                                case "setPriority":
                                    return "hsl(var(--flow-node-orange))";
                                case "close":
                                case "clear_transcript":
                                    return "hsl(var(--flow-node-danger))";
                                case "wait":
                                    return "hsl(var(--flow-node-slate))";
                                default:
                                    return "hsl(var(--flow-node-default))";
                            }
                        }}
                    />
                </ReactFlow>
            </div>

            {selectedNode && (
                <NodePropertiesPanel
                    node={selectedNode}
                    onUpdateNode={handleUpdateNode}
                    onClose={() => setSelectedNode(null)}
                    onDeleteNode={handleDeleteNode}
                />
            )}
        </div>
    );
}
