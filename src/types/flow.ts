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
    model?: string;
    outputVariable?: string;
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

// ─── Union Types ──────────────────────────────────────────────────

export type FlowNodeData =
    | StartNodeData
    | ReplyNodeData
    | SetAttributeNodeData
    | WebRequestNodeData
    | AITaskNodeData
    | ConditionNodeData
    | HITLHandoffNodeData
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
        defaultData: { label: "Start" },
    },
    {
        type: "reply",
        label: "Reply",
        description: "Send text, buttons, or media",
        icon: "MessageSquare",
        color: "text-blue-500",
        defaultData: { label: "Reply", text: "" },
    },
    {
        type: "setAttribute",
        label: "Set Attribute",
        description: "Save a value to context",
        icon: "Database",
        color: "text-violet-500",
        defaultData: { label: "Set Attribute", attributeKey: "", attributeValue: "" },
    },
    {
        type: "condition",
        label: "Condition",
        description: "Branch based on a variable",
        icon: "GitBranch",
        color: "text-amber-500",
        defaultData: {
            label: "Condition",
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
            label: "Web Request",
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
        defaultData: { label: "AI Task", prompt: "" },
    },
    {
        type: "hitlHandoff",
        label: "HITL Handoff",
        description: "Escalate to a human agent",
        icon: "UserRoundPlus",
        color: "text-orange-500",
        defaultData: {
            label: "HITL Handoff",
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
            label: "Close",
            closingMessage: "Thank you! This conversation has been closed.",
        },
    },
];
