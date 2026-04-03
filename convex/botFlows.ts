import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Extend the Identity type to include custom claims from Clerk
type ClerkIdentity = {
    subject: string;
    org_id?: string;
    org_role?: string;
    [key: string]: unknown;
};

// Types for bot flow nodes and edges
interface FlowNodeData {
    text?: string;
    textVariations?: string[];
    buttons?: unknown[];
    attributeKey?: string;
    attributeValue?: string;
    operator?: string;
    compareValue?: string;
    method?: string;
    url?: string;
    responseVariable?: string;
    prompt?: string;
    systemPrompt?: string;
    userInput?: string;
    model?: string;
    outputVariable?: string;
    assignTo?: string;
    maxTurns?: number;
    handoffMessage?: string;
    closingMessage?: string;
    knowledgeBaseId?: Id<"knowledge_bases">;
    query?: string;
    attribute?: string;
    delaySeconds?: number;
    slug?: string;
    departmentId?: string;
    code?: string;
    [key: string]: unknown;
}

interface FlowNode {
    id: string;
    type: string;
    data?: FlowNodeData;
    [key: string]: unknown;
}

interface FlowEdge {
    source: string;
    sourceHandle?: string;
    target?: string;
    [key: string]: unknown;
}

// Get flow for a bot
export const get = query({
    args: { botId: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity) return null;

        const bot = await ctx.db.get(args.botId);
        if (!bot) return null;

        const project = await ctx.db.get(bot.projectId);
        if (!project || project.orgId !== identity.org_id) return null;

        return await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();
    },
});

function compileToExecutionNodes(nodes: FlowNode[], edges: FlowEdge[]) {
    if (!Array.isArray(nodes)) return [];
    const safeEdges = Array.isArray(edges) ? edges : [];

    return nodes.map((node) => {
        const actions: unknown[] = [];
        const data = node.data || {};

        switch (node.type) {
            case "start":
                break; // No semantic actions
            case "reply":
                actions.push({
                    _type: "reply",
                    text: data.text || "",
                    textVariations: data.textVariations,
                    buttons: data.buttons
                });
                break;
            case "setAttribute":
                actions.push({
                    _type: "set_attribute",
                    key: data.attributeKey || "",
                    value: data.attributeValue || ""
                });
                break;
            case "condition":
                const trueEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target;
                const falseEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target;

                let expr = "";
                const rawKey = (data.attributeKey || "").replace(/^\{\{|\}\}$/g, "").trim();

                if (data.operator === "equals") expr = `{{${rawKey}}} == '${data.compareValue}'`;
                else if (data.operator === "notEquals") expr = `{{${rawKey}}} != '${data.compareValue}'`;
                else if (data.operator === "contains") expr = `{{${rawKey}}} contains '${data.compareValue}'`;
                else if (data.operator === "greaterThan") expr = `{{${rawKey}}} > '${data.compareValue}'`;
                else if (data.operator === "lessThan") expr = `{{${rawKey}}} < '${data.compareValue}'`;

                actions.push({
                    _type: "condition",
                    expression: expr,
                    truePath: trueEdge,
                    falsePath: falseEdge
                });
                break;
            case "webRequest":
                actions.push({
                    _type: "web_request",
                    method: data.method || "GET",
                    url: data.url || "",
                });
                if (data.responseVariable) {
                    actions.push({
                        _type: "set_attribute",
                        key: data.responseVariable,
                        value: "{{api_results}}"
                    });
                }
                break;
            case "aiTask": {
                const successEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target;
                const failureEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target;
                actions.push({
                    _type: "chatgpt_task",
                    prompt: data.prompt || data.systemPrompt || "",
                    systemPrompt: data.systemPrompt || data.prompt || "",
                    userInput: data.userInput || "{{lastUserText}}",
                    model: data.model || "",
                    assignTo: data.outputVariable || "gpt_reply",
                    successPath: successEdge,
                    failurePath: failureEdge,
                });
                break;
            }
            case "ai_assistant": {
                const aiSuccessEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target;
                const aiFailureEdge = safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target;
                actions.push({
                    _type: "ai_assistant",
                    systemPrompt: data.systemPrompt || "",
                    model: data.model || "",
                    maxTurns: data.maxTurns || 3,
                    assignTo: data.assignTo || "assistant_reply",
                    successPath: aiSuccessEdge,
                    failurePath: aiFailureEdge,
                });
                break;
            }
            case "hitlHandoff":
                actions.push({ _type: "reply", text: data.handoffMessage || "Transferring you to an agent..." });
                actions.push({ _type: "hitl_handoff" });
                break;
            case "close":
                actions.push({ _type: "reply", text: data.closingMessage || "Conversation ended." });
                actions.push({ _type: "resolve_conversation" });
                break;
            case "if_operating_hours":
                actions.push({
                    _type: "if_operating_hours",
                    truePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "if_online_agent":
                actions.push({
                    _type: "if_online_agent",
                    truePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "ask_kb":
                actions.push({
                    _type: "ask_kb",
                    knowledgeBaseId: data.knowledgeBaseId,
                    systemPrompt: data.systemPrompt || "",
                    maxTurns: data.maxTurns ?? 5,
                    query: data.query || "",
                    assignTo: data.assignTo || "kb_reply",
                    truePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "true")?.target,
                    elsePath: safeEdges.find((e: FlowEdge) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "capture_user_reply":
                actions.push({
                    _type: "capture_user_reply",
                    attribute: data.attribute || "user_input"
                });
                break;
            case "wait":
                actions.push({
                    _type: "wait",
                    delaySeconds: data.delaySeconds || 2
                });
                break;
            case "replace_bot":
                actions.push({
                    _type: "replace_bot",
                    slug: data.slug || ""
                });
                break;
            case "change_department":
                actions.push({
                    _type: "change_department",
                    departmentId: data.departmentId || ""
                });
                break;
            case "code_action":
                actions.push({
                    _type: "code_action",
                    expression: data.expression || "",
                    assignTo: data.assignTo || "code_result"
                });
                break;
            case "clear_transcript":
                actions.push({
                    _type: "clear_transcript"
                });
                break;
            case "applyLabel":
                actions.push({
                    _type: "applyLabel",
                    labelName: data.labelName || ""
                });
                break;
            case "setPriority":
                actions.push({
                    _type: "set_priority",
                    priority: data.priority || "normal"
                });
                break;
        }

        const nextBlock = safeEdges.find((e: FlowEdge) => e.source === node.id && !e.sourceHandle)?.target;

        return {
            _id: node.id,
            name: data.label || node.type || "Node",
            actions,
            nextBlock
        };
    });
}

// Save (upsert) flow for a bot
export const save = mutation({
    args: {
        botId: v.id("bots"),
        nodes: v.any(),
        edges: v.any(),
        variables: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity() as ClerkIdentity | null;
        if (!identity) throw new Error("Not authenticated");

        const bot = await ctx.db.get(args.botId);
        if (!bot) throw new Error("Not found");

        const project = await ctx.db.get(bot.projectId);
        if (!project) throw new Error("Not found");
        if (project.orgId !== identity.org_id) throw new Error("Unauthorized");

        const executionNodes = compileToExecutionNodes(args.nodes, args.edges);

        // Check if flow already exists for this bot
        const existing = await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                nodes: args.nodes,
                edges: args.edges,
                executionNodes,
                variables: args.variables,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("bot_flows", {
                botId: args.botId,
                nodes: args.nodes,
                edges: args.edges,
                executionNodes,
                variables: args.variables,
            });
        }
    },
});
