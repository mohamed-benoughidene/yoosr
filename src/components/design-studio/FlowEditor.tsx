"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import { BlockPalette } from "./BlockPalette";
import { NodePropertiesPanel } from "./NodePropertiesPanel";

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
    onFlowChange: (nodes: Node[], edges: Edge[]) => void;
}

export function FlowEditor({
    initialNodes,
    initialEdges,
    onFlowChange,
}: FlowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(
        initialNodes && initialNodes.length > 0
            ? initialNodes
            : [defaultStartNode]
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        initialEdges || []
    );
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const nodeCountRef = useRef(
        initialNodes ? initialNodes.length : 1
    );

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
            nodeCountRef.current += 1;
            const newNode: Node = {
                id: `${type}-${nodeCountRef.current}`,
                type,
                position: {
                    x: 250 + Math.random() * 100 - 50,
                    y: 100 + nodeCountRef.current * 120,
                },
                data,
            };
            setNodes((nds) => {
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
        (changes: any) => {
            // Filter out deletion events for the start node
            const filteredChanges = changes.filter((change: any) => {
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
        (changes: any) => {
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
        (deletedNodes: Node[]) => {
            notifyChange(getNodes(), edges);
        },
        [getNodes, edges, notifyChange]
    );

    return (
        <div className="flex h-full w-full">
            <BlockPalette onAddNode={handleAddNode} />

            <div className="relative flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onNodeDragStop={handleNodeDragStop}
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
                        maskColor="rgba(0, 0, 0, 0.08)"
                        nodeColor={(node) => {
                            switch (node.type) {
                                case "start":
                                    return "#10b981";
                                case "reply":
                                    return "#3b82f6";
                                case "setAttribute":
                                    return "#8b5cf6";
                                case "condition":
                                    return "#f59e0b";
                                case "webRequest":
                                    return "#06b6d4";
                                case "aiTask":
                                    return "#ec4899";
                                case "hitlHandoff":
                                    return "#f97316";
                                case "close":
                                case "clear_transcript":
                                    return "#ef4444";
                                case "wait":
                                    return "#64748b";
                                case "ask_kb":
                                    return "#6366f1";
                                case "if_operating_hours":
                                case "if_online_agent":
                                    return "#f59e0b";
                                case "replace_bot":
                                    return "#ec4899";
                                case "capture_user_reply":
                                    return "#a855f7";
                                case "change_department":
                                    return "#06b6d4";
                                case "code_action":
                                    return "#10b981";
                                default:
                                    return "#94a3b8";
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
