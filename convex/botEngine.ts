import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Design Studio Execution Engine
 *
 * Traverses a bot's flow graph (JSON state machine) in response to
 * incoming messages. Per TILEDESK_REFERENCE.md Section 9:
 *
 * 1. Read current node from conversation attributes.currentNode
 * 2. Evaluate the node's condition or intent match
 * 3. Execute the block (send reply, set attribute, call external API, etc.)
 * 4. Update attributes.currentNode to the next node ID
 * 5. Write the reply message to the messages table
 */

// Internal: get bot flow by botId
export const getFlowInternal = internalQuery({
    args: { botId: v.id("bots") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId))
            .first();
    },
});

// Internal: send a bot message into a conversation
export const sendBotMessage = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        content: v.string(),
        attributes: v.optional(v.any()),
        senderFullname: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: args.projectId,
            senderType: "bot",
            content: args.content,
            attachments: args.attributes,
        });

        // Update conversation last message
        await ctx.db.patch(args.conversationId, {
            lastMessage: args.content,
            updatedAt: Date.now(),
        });
    },
});

// Internal: update conversation attributes (current node pointer)
export const updateConversationAttributes = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        attributes: v.any(),
        executionTrace: v.optional(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number()
        })),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            attributes: args.attributes,
        };

        if (args.executionTrace) {
            // Read current log from the dedicated bot state table
            const existing = await ctx.db
                .query("conversation_bot_state")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
                .first();
            const currentLog = existing?.executionLog || [];
            // Limit log size to last 50 actions to prevent document from growing infinitely
            updates.executionLog = [...currentLog, args.executionTrace].slice(-50);
        }

        // Upsert into conversation_bot_state — not conversations — to avoid OCC conflicts
        const existing = await ctx.db
            .query("conversation_bot_state")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, updates);
        } else {
            await ctx.db.insert("conversation_bot_state", {
                conversationId: args.conversationId,
                ...updates,
            });
        }
    },
});

// Types for flow nodes (used by the engine)
interface FlowNode {
    id: string;
    type: string;
    data: Record<string, any>;
    position: { x: number; y: number };
}

interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

interface FlowGraph {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

/**
 * Execute a single step in the bot flow.
 *
 * This action:
 * 1. Loads the bot's flow graph
 * 2. Finds the current node (or start node if first interaction)
 * 3. Processes the node based on its type
 * 4. Follows the outgoing edge to determine the next node
 * 5. Sends any reply messages
 */
export const executeStep = internalAction({
    args: {
        botId: v.id("bots"),
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        currentNodeId: v.optional(v.string()),
        userMessage: v.optional(v.string()),
        attributes: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        // 1. Load the flow graph
        const flow = await ctx.runQuery(internal.botEngine.getFlowInternal, {
            botId: args.botId,
        });

        if (!flow || !flow.nodes || !flow.edges) {
            return { error: "No flow found for this bot" };
        }

        const graph: FlowGraph = {
            nodes: flow.nodes as FlowNode[],
            edges: flow.edges as FlowEdge[],
        };

        // 2. Find the current node
        let currentNode: FlowNode | undefined;

        if (args.currentNodeId) {
            currentNode = graph.nodes.find((n) => n.id === args.currentNodeId);
        } else {
            // Find the start node
            currentNode = graph.nodes.find((n) => n.type === "start");
        }

        if (!currentNode) {
            return { error: "No valid node found" };
        }

        // 3. Process the node based on its type
        let nextNodeId: string | null = null;
        const context = { ...(args.attributes || {}) };

        switch (currentNode.type) {
            case "start": {
                // Start node just transitions to the next node
                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            case "reply": {
                // Send the reply message
                const text = interpolateVariables(
                    currentNode.data.text || "",
                    context
                );

                await ctx.runMutation(internal.botEngine.sendBotMessage, {
                    conversationId: args.conversationId,
                    projectId: args.projectId,
                    content: text,
                    senderFullname: currentNode.data.senderName || "Bot",
                    attributes: currentNode.data.buttons
                        ? {
                            attachment: {
                                type: "template",
                                payload: {
                                    template_type: "button",
                                    buttons: currentNode.data.buttons,
                                },
                            },
                        }
                        : undefined,
                });

                // Follow the default output edge
                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            case "setAttribute": {
                // Set attribute in context
                const key = currentNode.data.attributeKey;
                const value = currentNode.data.attributeValue;
                if (key) {
                    context[key] = interpolateVariables(
                        value || "",
                        context
                    );
                }

                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            case "condition": {
                // Evaluate condition and follow the appropriate branch
                const condKey = currentNode.data.attributeKey || "";
                const condOp = currentNode.data.operator || "equals";
                const condVal = currentNode.data.compareValue || "";
                const actualVal = String(context[condKey] || "");

                let conditionMet = false;
                switch (condOp) {
                    case "equals":
                        conditionMet = actualVal === condVal;
                        break;
                    case "notEquals":
                        conditionMet = actualVal !== condVal;
                        break;
                    case "contains":
                        conditionMet = actualVal.includes(condVal);
                        break;
                    case "greaterThan":
                        conditionMet = Number(actualVal) > Number(condVal);
                        break;
                    case "lessThan":
                        conditionMet = Number(actualVal) < Number(condVal);
                        break;
                    default:
                        conditionMet = actualVal === condVal;
                }

                // "true" handle vs "false" handle
                const handleId = conditionMet ? "true" : "false";
                const outEdge = graph.edges.find(
                    (e) =>
                        e.source === currentNode!.id &&
                        e.sourceHandle === handleId
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            case "hitlHandoff": {
                // Transition conversation to status 100 (Unassigned)
                // so the routing engine can assign a human agent.
                // The conversationId stays the same — history preserved.
                await ctx.runMutation(internal.botEngine.sendBotMessage, {
                    conversationId: args.conversationId,
                    projectId: args.projectId,
                    content:
                        currentNode.data.handoffMessage ||
                        "Connecting you with a human agent...",
                    senderFullname: "Bot",
                });

                nextNodeId = null;
                break;
            }

            case "close": {
                // Close the conversation
                await ctx.runMutation(internal.botEngine.sendBotMessage, {
                    conversationId: args.conversationId,
                    projectId: args.projectId,
                    content:
                        currentNode.data.closingMessage ||
                        "Thank you! This conversation has been closed.",
                    senderFullname: "Bot",
                });

                nextNodeId = null;
                break;
            }

            case "webRequest": {
                // Execute HTTP request (placeholder — actual implementation
                // would use fetch with currentNode.data.url, method, headers, body)
                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            case "aiTask": {
                // LLM prompt execution (placeholder — actual implementation
                // would call the AI provider with currentNode.data.prompt)
                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
                break;
            }

            default: {
                // Unknown node type — try to follow the default edge
                const outEdge = graph.edges.find(
                    (e) => e.source === currentNode!.id
                );
                nextNodeId = outEdge?.target ?? null;
            }
        }

        // 4. Update conversation attributes with the new pointer state
        const actionStr = currentNode.type === "hitlHandoff" ? "hitl_handoff" : currentNode.type === "close" ? "close_conversation" : "continue";
        await ctx.runMutation(internal.botEngine.updateConversationAttributes, {
            conversationId: args.conversationId,
            attributes: { ...context, currentNode: nextNodeId },
            executionTrace: {
                nodeId: currentNode.id,
                type: currentNode.type,
                action: actionStr,
                timestamp: Date.now()
            }
        });

        // 5. Handle special fallback states (like HITL Handoff)
        if (currentNode.type === "hitlHandoff") {
            const conversation = await ctx.runQuery(internal.conversations.getInternal, { id: args.conversationId });
            if (conversation) {
                // Strip the bot from the participants list so it represents "Unassigned" correctly 
                // and avoids infinite executeStep loops.
                const updatedParticipants = (conversation.participants || []).filter((p: string) => p !== args.botId);

                await ctx.runMutation(internal.conversations.updateInternal, {
                    id: args.conversationId,
                    status: 100, // Explicitly return to Unassigned pool (100)
                });

                // Directly patch participants
                await ctx.runMutation(internal.botEngine.removeBotParticipant, {
                    conversationId: args.conversationId,
                    participants: updatedParticipants
                })

                // Trigger Smart Routing again to find a human!
                await ctx.runMutation(internal.routing.routeConversation, {
                    conversationId: args.conversationId,
                    projectId: args.projectId,
                });
            }
        }

        return {
            nextNodeId,
            action: currentNode.type === "hitlHandoff" ? "hitl_handoff" : currentNode.type === "close" ? "close_conversation" : "continue",
            context,
        };
    },
});

export const removeBotParticipant = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        participants: v.array(v.string())
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, { participants: args.participants })
    }
})

/**
 * Replace {{variable}} placeholders with values from context
 */
function interpolateVariables(
    text: string,
    context: Record<string, any>
): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return context[key] !== undefined ? String(context[key]) : `{{${key}}}`;
    });
}
