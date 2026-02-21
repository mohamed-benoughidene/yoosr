import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get flow for a bot
export const get = query({
    args: { botId: v.id("bots") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();
    },
});

function compileToExecutionNodes(nodes: any[], edges: any[]) {
    if (!Array.isArray(nodes)) return [];
    const safeEdges = Array.isArray(edges) ? edges : [];

    return nodes.map((node) => {
        const actions: any[] = [];
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
                const trueEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target;
                const falseEdge = safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target;

                let expr = "";
                if (data.operator === "equals") expr = `{{${data.attributeKey}}} == '${data.compareValue}'`;
                else if (data.operator === "contains") expr = `contains({{${data.attributeKey}}}, '${data.compareValue}')`;
                // Add more complex parsing if needed, but this covers basics

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
            case "aiTask":
                actions.push({
                    _type: "chatgpt_task",
                    prompt: data.prompt || "",
                    assignTo: data.outputVariable || "gpt_reply"
                });
                break;
            case "hitlHandoff":
                actions.push({ _type: "reply", text: data.handoffMessage || "Transferring you to an agent..." });
                actions.push({ _type: "hitl_handoff" });
                break;
            case "close":
                actions.push({ _type: "reply", text: data.closingMessage || "Conversation ended." });
                break;
            case "if_operating_hours":
                actions.push({
                    _type: "if_operating_hours",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "if_online_agent":
                actions.push({
                    _type: "if_online_agent",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    falsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
                });
                break;
            case "ask_kb":
                actions.push({
                    _type: "ask_kb",
                    query: data.query || "",
                    assignTo: data.assignTo || "kb_reply",
                    truePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "true")?.target,
                    elsePath: safeEdges.find((e: any) => e.source === node.id && e.sourceHandle === "false")?.target,
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
            default:
                break;
        }

        const nextBlock = safeEdges.find((e: any) => e.source === node.id && !e.sourceHandle)?.target;

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
        const identity = await ctx.auth.getUserIdentity();
        // if (!identity) throw new Error("Not authenticated");

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
