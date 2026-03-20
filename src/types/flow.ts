import { Node, Edge } from "@xyflow/react";

/**
 * Design Studio node and edge type definitions.
 * These map to the block types from TILEDESK_REFERENCE.md Section 9.
 */

// ─── Node Data Types ──────────────────────────────────────────────

export interface StartNodeData {
    label: string;
    [key: string]: unknown;
}

export interface ReplyNodeData {
    label: string;
    text: string;
    buttons?: Array<{
        label: string;
        value: string;
        type: "text" | "url";
        link?: string;
    }>;
    [key: string]: unknown;
}

export interface SetAttributeNodeData {
    label: string;
    attributeKey: string;
    attributeValue: string;
    [key: string]: unknown;
}

export interface WebRequestNodeData {
    label: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: string;
    responseVariable?: string;
    [key: string]: unknown;
}

export interface AITaskNodeData {
    label: string;
    prompt: string;
    systemPrompt?: string;
    userInput?: string;
    model?: string;
    outputVariable?: string;
    [key: string]: unknown;
}

export interface AIAssistantNodeData {
    label: string;
    systemPrompt: string;
    model?: string;
    maxTurns?: number;
    assignTo?: string;
    [key: string]: unknown;
}

export interface ConditionNodeData {
    label: string;
    attributeKey: string;
    operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
    compareValue: string;
    [key: string]: unknown;
}

export interface HITLHandoffNodeData {
    label: string;
    handoffMessage: string;
    departmentId?: string;
    [key: string]: unknown;
}

export interface CloseNodeData {
    label: string;
    closingMessage: string;
    [key: string]: unknown;
}

export interface ApplyLabelNodeData {
    label: string;
    labelName: string;
    [key: string]: unknown;
}

export interface SetPriorityNodeData {
    label: string;
    priority: "low" | "normal" | "high" | "urgent";
    [key: string]: unknown;
}

// ─── Union Types ──────────────────────────────────────────────────

export type FlowNodeData =
    | StartNodeData
    | ReplyNodeData
    | SetAttributeNodeData
    | WebRequestNodeData
    | AITaskNodeData
    | AIAssistantNodeData
    | ConditionNodeData
    | HITLHandoffNodeData
    | ApplyLabelNodeData
    | SetPriorityNodeData
    | CloseNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ─── Block Type Registry ──────────────────────────────────────────

export interface BlockTypeInfo {
    type: string;
    label: string;
    description: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color class
    defaultData: Record<string, unknown>;
}

export const BLOCK_TYPES: BlockTypeInfo[] = [
    {
        type: "start",
        label: "Start",
        description: "Entry point for the flow",
        icon: "Play",
        color: "text-emerald-500",
        defaultData: {},
    },
    {
        type: "reply",
        label: "Reply",
        description: "Send text, buttons, or media",
        icon: "MessageSquare",
        color: "text-blue-500",
        defaultData: { text: "" },
    },
    {
        type: "setAttribute",
        label: "Set Attribute",
        description: "Save a value to context",
        icon: "Database",
        color: "text-violet-500",
        defaultData: { attributeKey: "", attributeValue: "" },
    },
    {
        type: "condition",
        label: "Condition",
        description: "Branch based on a variable",
        icon: "GitBranch",
        color: "text-amber-500",
        defaultData: {
            attributeKey: "",
            operator: "equals" as const,
            compareValue: "",
        },
    },
    {
        type: "webRequest",
        label: "Web Request",
        description: "Call an external HTTP API",
        icon: "Globe",
        color: "text-cyan-500",
        defaultData: {
            url: "",
            method: "GET" as const,
        },
    },
    {
        type: "aiTask",
        label: "AI Task",
        description: "Execute an LLM prompt",
        icon: "Sparkles",
        color: "text-pink-500",
        defaultData: { prompt: "", systemPrompt: "", model: "", outputVariable: "gpt_reply" },
    },
    {
        type: "hitlHandoff",
        label: "HITL Handoff",
        description: "Escalate to a human agent",
        icon: "UserRoundPlus",
        color: "text-orange-500",
        defaultData: {
            handoffMessage: "Connecting you with a human agent...",
        },
    },
    {
        type: "close",
        label: "Close",
        description: "End the conversation",
        icon: "CircleX",
        color: "text-red-500",
        defaultData: {
            closingMessage: "Thank you! This conversation has been closed.",
        },
    },
    {
        type: "if_operating_hours",
        label: "If Operating Hours",
        description: "Branch by schedule",
        icon: "Clock",
        color: "text-amber-500",
        defaultData: {},
    },
    {
        type: "if_online_agent",
        label: "If Online Agent",
        description: "Branch by agent availability",
        icon: "Users",
        color: "text-amber-500",
        defaultData: {},
    },
    {
        type: "capture_user_reply",
        label: "Capture Reply",
        description: "Wait for user input",
        icon: "UserCheck",
        color: "text-purple-500",
        defaultData: { attribute: "user_input" },
    },
    {
        type: "wait",
        label: "Wait",
        description: "Pause execution",
        icon: "Timer",
        color: "text-gray-500",
        defaultData: { delaySeconds: 2 },
    },
    {
        type: "ask_kb",
        label: "Ask Knowledge Base",
        description: "Query document embeddings",
        icon: "BookOpen",
        color: "text-indigo-500",
        defaultData: { query: "", assignTo: "kb_reply", systemPrompt: "", maxTurns: 5 },
    },
    {
        type: "replace_bot",
        label: "Replace Bot",
        description: "Switch to another bot",
        icon: "Repeat",
        color: "text-pink-500",
        defaultData: { slug: "" },
    },
    {
        type: "change_department",
        label: "Change Dept",
        description: "Route to department",
        icon: "Network",
        color: "text-cyan-500",
        defaultData: { departmentId: "" },
    },
    {
        type: "code_action",
        label: "Code Action",
        description: "Run safe JS expressions",
        icon: "Code2",
        color: "text-emerald-500",
        defaultData: { expression: "", assignTo: "code_result" },
    },
    {
        type: "clear_transcript",
        label: "Clear Transcript",
        description: "Reset conversation memory",
        icon: "Eraser",
        color: "text-red-500",
        defaultData: {},
    },
    {
        type: "applyLabel",
        label: "Apply Label",
        description: "Tag the conversation",
        icon: "Tag",
        color: "text-pink-500",
        defaultData: { labelName: "" },
    },
    {
        type: "setPriority",
        label: "Set Priority",
        description: "Set conversation urgency",
        icon: "AlertCircle",
        color: "text-orange-600",
        defaultData: { priority: "normal" },
    },
];
