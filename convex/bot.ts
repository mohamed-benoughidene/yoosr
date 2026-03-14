import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { callAITask, callAIAssistant, type ChatMessage } from "./openrouter";
import { decryptSecret } from "./lib/crypto";

/**
 * Executes a specific block type and returns the state mutation instructions.
 */
async function executeAction(ctx: any, action: any, attributes: any, incomingMessage: string, conversationId: any, projectId: any, channel: any) {
    switch (action._type) {
        case "reply":
            let textValue = action.text;
            if (Array.isArray(action.textVariations) && action.textVariations.length > 0) {
                textValue = action.textVariations[Math.floor(Math.random() * action.textVariations.length)];
            }
            const text = interpolate(textValue, attributes);
            await ctx.runMutation(internal.bot.createBotMessage, {
                conversationId,
                projectId,
                channel,
                content: text,
                attachments: action.buttons && action.buttons.length > 0 ? {
                    type: "template",
                    payload: {
                        template_type: "button",
                        buttons: action.buttons
                    }
                } : undefined
            });
            return { newAttributes: {} };

        case "capture_user_reply":
            if (!incomingMessage) {
                return { suspend: true };
            }
            return {
                newAttributes: { [action.attribute]: incomingMessage },
            };

        case "set_attribute":
            return {
                newAttributes: { [action.key]: evaluateExpression(action.value, attributes) }
            };

        case "condition":
            const result = evaluateCondition(action.expression, attributes);
            return {
                newAttributes: {},
                nextNodeId: result ? action.truePath : action.falsePath,
            };

        case "chatgpt_task": {
            const systemPrompt = interpolate(action.prompt || action.systemPrompt || "", attributes);
            const userInput = interpolate(action.userInput || "{{lastUserText}}", attributes);
            try {
                const _aiTaskConv = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
                const projectInfo = _aiTaskConv ? await ctx.runQuery(internal.bot.getProjectDefaultModel, { projectId: _aiTaskConv.projectId }) : undefined;
                const projectDefaultModel = projectInfo?.defaultModel;
                let projectApiKey: string | undefined;
                if (projectInfo?.openRouterApiKey) {
                    const encryptionKey = process.env.ENCRYPTION_KEY;
                    if (encryptionKey) {
                        projectApiKey = await decryptSecret(projectInfo.openRouterApiKey, encryptionKey);
                    }
                }
                const llmResult = await callAITask(systemPrompt, userInput, action.model, projectDefaultModel, projectApiKey);
                // Log token usage
                if (_aiTaskConv) {
                    try {
                        await ctx.runMutation(internal.analytics.logTokenUsage, {
                            projectId: _aiTaskConv.projectId,
                            model: llmResult.model,
                            tokensUsed: llmResult.tokensUsed,
                            operation: "ai_task",
                        });
                    } catch (e: any) {
                        console.warn("[BOT ENGINE] Failed to log token usage:", e.message);
                    }
                }
                const parsed = tryParseJSON(llmResult.text);
                return {
                    newAttributes: parsed
                        ? { ...parsed, [action.assignTo ?? "gpt_reply"]: llmResult.text }
                        : { [action.assignTo ?? "gpt_reply"]: llmResult.text },
                    nextNodeId: action.successPath ?? null,
                };
            } catch (e: any) {
                console.error("[BOT ENGINE] AI Task failed:", e.message);
                if (action.failurePath) {
                    return { newAttributes: { ai_error: e.message }, nextNodeId: action.failurePath };
                }
                return { newAttributes: { [action.assignTo ?? "gpt_reply"]: "", ai_error: e.message } };
            }
        }

        case "ask_kb": {
            const kbQuery = interpolate(action.query, attributes);
            const kbConversation = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            // @ts-ignore - type may not be generated yet
            let kbResult: any[] = [];
            try {
                kbResult = await ctx.runAction(internal.knowledge.searchSimilarChunks, {
                    projectId: kbConversation.projectId,
                    query: kbQuery,
                });
            } catch (e: any) {
                console.error("[BOT ENGINE] searchSimilarChunks failed:", e.message);
                // kbResult stays [] → block will route to elsePath
            }
            let kbAnswer = "";
            if (kbResult.length > 0) {
                const contextStr = kbResult.map((r: any) => r.text).join("\n").slice(0, 3000);
                const kbPrompt = `Context:\n${contextStr}\n\nQuestion: ${kbQuery}\nAnswer based only on context.`;
                try {
                    let kbProjectApiKey: string | undefined;
                    if (kbConversation) {
                        const kbProjectInfo = await ctx.runQuery(internal.bot.getProjectDefaultModel, { projectId: kbConversation.projectId });
                        if (kbProjectInfo?.openRouterApiKey) {
                            const encryptionKey = process.env.ENCRYPTION_KEY;
                            if (encryptionKey) {
                                kbProjectApiKey = await decryptSecret(kbProjectInfo.openRouterApiKey, encryptionKey);
                            }
                        }
                    }
                    const kbLlmResult = await callAITask(kbPrompt, kbQuery, undefined, undefined, kbProjectApiKey);
                    kbAnswer = kbLlmResult.text;
                    // Log token usage
                    if (kbConversation) {
                        await ctx.runMutation(internal.analytics.logTokenUsage, {
                            projectId: kbConversation.projectId,
                            model: kbLlmResult.model,
                            tokensUsed: kbLlmResult.tokensUsed,
                            operation: "ask_kb",
                        });
                    }
                } catch (e: any) {
                    console.error("[BOT ENGINE] KB answer generation failed:", e.message);
                }
            } else {
                // No KB results — log unanswered query
                if (kbConversation) {
                    await ctx.runMutation(internal.analytics.logUnansweredQuery, {
                        projectId: kbConversation.projectId,
                        query: kbQuery,
                    });
                }
            }
            if (!kbAnswer) return { nextNodeId: action.elsePath };
            return { newAttributes: { [action.assignTo ?? "kb_reply"]: kbAnswer }, nextNodeId: action.truePath };
        }

        case "web_request":
            const url = interpolate(action.url, attributes);
            const method = action.method || "GET";
            const body = action.body ? JSON.stringify(interpolateObject(action.body, attributes)) : undefined;
            try {
                const response = await fetch(url, { method, body, headers: action.headers });
                if (!response.ok) return { newAttributes: {}, nextNodeId: action.failurePath };
                const data = await response.json();
                return { newAttributes: { api_results: JSON.stringify(data) } };
            } catch (e) {
                return { newAttributes: {}, nextNodeId: action.failurePath };
            }

        case "replace_bot":
            const newBotId = await ctx.runQuery(internal.bot.getBotIdBySlug, { slug: action.slug });
            if (newBotId) {
                return {
                    newAttributes: {},
                    newBotId: newBotId,
                    resetNodeId: true,
                };
            }
            return { newAttributes: {} };

        case "hitl_handoff":
            const convState = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            await ctx.runMutation(internal.bot.assignToHuman, {
                conversationId,
                deptId: action.deptId,
            });

            if (convState?.assignedTo) {
                await ctx.runMutation(internal.notifications.createNotification, {
                    projectId: convState.projectId,
                    recipientId: convState.assignedTo,
                    type: "escalation",
                    conversationId: conversationId,
                    title: "Bot handed off to you",
                    body: incomingMessage ? incomingMessage.substring(0, 80) : "A bot has handed off a conversation to you.",
                });
            }

            return { newAttributes: {}, suspend: true };

        case "mcp_tool_call":
            return { newAttributes: { [action.assignTo ?? "mcp_result"]: "Tool Called" } };

        case "wait":
            return { suspend: true, scheduleNextBlockAfter: (action.delaySeconds || 1) * 1000 };

        case "if_operating_hours":
            const ohCnv = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            const hours = await ctx.runQuery(internal.bot.getOperatingHoursInternal, { projectId: ohCnv.projectId });
            let isOpen = true;
            if (hours && hours.enabled) {
                // Placeholder for actual schedule checking
                isOpen = true;
            }
            return { nextNodeId: isOpen ? action.truePath : action.falsePath };

        case "if_online_agent":
            const c2 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            const onlineAgents = await ctx.runQuery(internal.bot.getOnlineAgentsInternal, { projectId: c2.projectId });
            return { nextNodeId: onlineAgents.length > 0 ? action.truePath : action.falsePath };

        case "change_department":
            const c3 = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            await ctx.runMutation(internal.conversations.updateInternal, {
                id: conversationId,
                departmentId: action.departmentId,
                botPaused: true,
                clearBotId: true,
            });
            await ctx.scheduler.runAfter(2000, internal.routing.routeConversation, {
                conversationId: conversationId,
                projectId: c3.projectId,
                departmentId: action.departmentId,
                skipBot: true,
            });
            return { suspend: true };

        case "code_action":
            const Parser = require("expr-eval").Parser;
            const parser = new Parser();
            let codeResult = null;
            try {
                // To avoid string syntax errors (e.g. Support == 'Support' instead of 'Support' == 'Support')
                // we will use expr-eval's native variable support for {{var}} patterns.
                // Replace all {{var}} with raw property paths (e.g. user_intent) so expr-eval handles evaluation safely.
                const expression = (action.expression || "0").replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1");
                const expr = parser.parse(expression);
                codeResult = expr.evaluate(attributes);
            } catch (e: any) {
                console.error("Code action error:", e.message);
            }
            return { newAttributes: { [action.assignTo ?? "code_result"]: codeResult } };

        case "clear_transcript":
            return { newAttributes: {}, clearAttributes: true };

        case "ai_assistant": {
            const assistantPrompt = interpolate(action.systemPrompt || "", attributes);
            const maxTurns = action.maxTurns || 3;

            try {
                // Fetch conversation history from messages table
                const msgHistory = await ctx.runQuery(internal.messages.listPublic, {
                    conversationId,
                });

                // Build chat history for the LLM
                const chatHistory: ChatMessage[] = (msgHistory || []).map((m: any) => ({
                    role: m.senderType === "visitor" ? "user" as const : "assistant" as const,
                    content: m.content || "",
                }));

                // Fetch project ID for token logging
                const assistantConv = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
                const assistantProjectInfo = assistantConv ? await ctx.runQuery(internal.bot.getProjectDefaultModel, { projectId: assistantConv.projectId }) : undefined;
                const projectDefaultModel = assistantProjectInfo?.defaultModel;
                let assistantApiKey: string | undefined;
                if (assistantProjectInfo?.openRouterApiKey) {
                    const encryptionKey = process.env.ENCRYPTION_KEY;
                    if (encryptionKey) {
                        assistantApiKey = await decryptSecret(assistantProjectInfo.openRouterApiKey, encryptionKey);
                    }
                }
                let lastReply = "";
                for (let turn = 0; turn < maxTurns; turn++) {
                    const llmResult = await callAIAssistant(assistantPrompt, chatHistory, action.model, projectDefaultModel, assistantApiKey);
                    if (!llmResult.text) break;

                    lastReply = llmResult.text;

                    // Log token usage
                    if (assistantConv) {
                        try {
                            await ctx.runMutation(internal.analytics.logTokenUsage, {
                                projectId: assistantConv.projectId,
                                model: llmResult.model,
                                tokensUsed: llmResult.tokensUsed,
                                operation: "ai_assistant",
                            });
                        } catch (e: any) {
                            console.warn("[BOT ENGINE] Failed to log token usage:", e.message);
                        }
                    }

                    // Send the reply as a bot message
                    await ctx.runMutation(internal.bot.createBotMessage, {
                        conversationId,
                        projectId,
                        channel,
                        content: llmResult.text,
                    });

                    // If it's the last allowed turn, break
                    if (turn >= maxTurns - 1) break;

                    // Check if the assistant signals completion (ends with a question = keep going)
                    const endsWithQuestion = llmResult.text.trim().endsWith("?");
                    if (!endsWithQuestion) break;

                    // Add the assistant reply to history for the next turn
                    chatHistory.push({ role: "assistant", content: llmResult.text });

                    // Suspend and wait for user reply before next turn
                    return {
                        newAttributes: { [action.assignTo ?? "assistant_reply"]: lastReply },
                        suspend: true,
                    };
                }

                // Assistant finished — route to success path
                return {
                    newAttributes: { [action.assignTo ?? "assistant_reply"]: lastReply },
                    nextNodeId: action.successPath,
                };
            } catch (e: any) {
                console.error("[BOT ENGINE] AI Assistant failed:", e.message);
                return {
                    newAttributes: { ai_error: e.message },
                    nextNodeId: action.failurePath,
                };
            }
        }

        case "applyLabel": {
            const labelName = interpolate(action.labelName || "", attributes);
            if (labelName) {
                await ctx.runMutation(api.tags.assignTagToConversation, {
                    conversationId,
                    tagName: labelName
                });
            }
            return { newAttributes: {} };
        }

        case "set_priority":
            await ctx.runMutation(internal.conversations.updateInternal, {
                id: conversationId,
                priority: action.priority
            });
            return { newAttributes: {} };

        case "resolve_conversation":
            await ctx.runMutation(internal.conversations.updateInternal, {
                id: conversationId,
                status: 1000,
            });
            return { newAttributes: {}, nextNodeId: null };

        default:
            console.warn("Unknown bot action type: ", action._type);
            return { newAttributes: {} };
    }
}

export const executeNextBlock = internalAction({
    args: {
        conversationId: v.id("conversations"),
        incomingMessage: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`[BOT ENGINE] Start execution for convo: ${args.conversationId} with msg: "${args.incomingMessage}"`);
        // 1. Fetch conversation state
        const conversation = await ctx.runQuery(internal.bot.getConversationState, { id: args.conversationId });
        if (!conversation) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} not found`);
            return;
        }

        // Infinite Loop Guard
        const currentStepCount = conversation.botStepCount || 0;
        if (currentStepCount > 50) {
            console.warn(`[BOT ENGINE] Step limit reached for convo ${args.conversationId}, stopping to prevent infinite loop.`);
            return;
        }
        const nextStepCount = currentStepCount + 1;

        // HITL Guard: if the conversation was handed off to a human, stop all bot processing.
        if (conversation.botPaused === true) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} is paused for human handoff. Skipping bot execution.`);
            return;
        }

        if (!conversation.botId) {
            console.log(`[BOT ENGINE] Convo ${args.conversationId} has no assigned botId`);
            return;
        }


        // 2. Fetch bot flow
        console.log(`[BOT ENGINE] Fetching flow for botId: ${conversation.botId}`);
        const flow = await ctx.runQuery(internal.bot.getBotFlow, { botId: conversation.botId as Id<"bots"> });
        if (!flow || !flow.nodes || flow.nodes.length === 0) {
            console.log(`[BOT ENGINE] Bot flow empty or missing for botId ${conversation.botId}`);
            return;
        }

        const executionNodes = flow.executionNodes && flow.executionNodes.length > 0 ? flow.executionNodes : flow.nodes;
        console.log(`[BOT ENGINE] Flow loaded. ${executionNodes.length} nodes found (using ${flow.executionNodes ? "compiled" : "raw"} schema).`);

        // 3. Find current node
        const currentNodeId = conversation.currentNodeId;
        console.log(`[BOT ENGINE] currentNodeId is: ${currentNodeId}`);

        let currentNode = null;
        if (currentNodeId) {
            currentNode = executionNodes.find((n: any) => n._id === currentNodeId || n.id === currentNodeId);
        }
        if (!currentNode) {
            currentNode = executionNodes[0];
        }

        console.log(`[BOT ENGINE] raw next node: ${JSON.stringify(currentNode)}`);

        if (!currentNode) {
            console.log(`[BOT ENGINE] No valid start node found in flow. Aborting.`);
            return;
        }

        console.log(`[BOT ENGINE] Current Node: ${currentNode.name} (${currentNode._id})`);

        // 4. Execute each action sequentially
        let attributes = { ...conversation.attributes };
        let nextNodeId = currentNode.nextBlock;
        let newBotId = null;
        let resetNode = false;

        const actions = Array.isArray(currentNode.actions) ? currentNode.actions : [];

        for (const action of actions) {
            console.log(`[BOT ENGINE] -> Running Action: ${action._type}`);
            const result = await executeAction(ctx, action, attributes, args.incomingMessage, args.conversationId, conversation.projectId, conversation.channel || "widget");

            if (result.newAttributes) {
                attributes = { ...attributes, ...result.newAttributes };
            }
            if (result.clearAttributes) {
                attributes = {};
            }
            if (result.nextNodeId) {
                console.log(`[BOT ENGINE] -> Condition override to: ${result.nextNodeId}`);
                nextNodeId = result.nextNodeId;
            }
            if (result.newBotId) {
                newBotId = result.newBotId;
            }
            if (result.resetNodeId) {
                resetNode = true;
            }

            if (result.suspend) {
                console.log(`[BOT ENGINE] -> Action requested suspend at node: ${currentNode._id}`);
                await ctx.runMutation(internal.bot.updateConversationState, {
                    id: args.conversationId,
                    // If we scheduled a future block, advance the pointer now so it doesn't infinite loop.
                    // Otherwise keep it here (e.g., waiting for user reply).
                    currentNodeId: result.scheduleNextBlockAfter ? nextNodeId : currentNode._id,
                    attributes,
                    botId: newBotId,
                    botStepCount: result.scheduleNextBlockAfter ? nextStepCount : 0,
                });

                if (result.scheduleNextBlockAfter) {
                    await ctx.scheduler.runAfter(result.scheduleNextBlockAfter, internal.bot.executeNextBlock, {
                        conversationId: args.conversationId,
                        incomingMessage: "",
                    });
                }

                return;
            }
        }

        console.log(`[BOT ENGINE] Node actions complete. Next Node ID: ${nextNodeId}`);

        // 5. Advance to next node
        const updatedNodeId = resetNode ? null : (nextNodeId ?? null);
        await ctx.runMutation(internal.bot.updateConversationState, {
            id: args.conversationId,
            currentNodeId: updatedNodeId,
            attributes,
            botId: newBotId,
            botStepCount: nextStepCount,
            executionTrace: {
                nodeId: currentNode._id || currentNode.id,
                type: currentNode.name || "node",
                action: actions.map((a: any) => a._type).join(",") || "continue",
                timestamp: Date.now(),
            },
        });

        // 6. Continue traversal if next node does not require user input
        if (updatedNodeId) {
            const nextNode = executionNodes.find((n: any) => n._id === updatedNodeId || n.id === updatedNodeId);
            const requiresInput = nextNode?.actions?.some((a: any) => a._type === "capture_user_reply");
            console.log(`[BOT ENGINE] Next node is ${nextNode?.name}. Requires input? ${requiresInput}`);

            if (!requiresInput) {
                console.log(`[BOT ENGINE] Auto-continuing to next block.`);
                await ctx.runAction(internal.bot.executeNextBlock, {
                    conversationId: args.conversationId,
                    incomingMessage: "",
                });
            }
        } else if (newBotId) {
            // We replaced a bot, start traversal on new bot
            console.log(`[BOT ENGINE] Bot Replaced. Restarting execution for new bot.`);
            await ctx.runAction(internal.bot.executeNextBlock, {
                conversationId: args.conversationId,
                incomingMessage: "",
            });
        } else {
            console.log(`[BOT ENGINE] End of flow reached.`);
        }
    }
});

/** Wait helpers for DB queries in actions */

export const getConversationState = internalQuery({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.id);
        if (!conversation) return null;

        // Read bot execution state from the dedicated table to avoid OCC conflicts
        const botState = await ctx.db
            .query("conversation_bot_state")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
            .first();

        return {
            ...conversation,
            currentNodeId: botState?.currentNodeId ?? conversation.currentNodeId,
            botStepCount: botState?.botStepCount ?? conversation.botStepCount,
            executionLog: botState?.executionLog ?? conversation.executionLog,
            attributes: botState?.attributes ?? conversation.attributes,
        };
    }
});

export const getBotFlow = internalQuery({
    args: { botId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("bot_flows")
            .withIndex("by_botId", (q) => q.eq("botId", args.botId as any))
            .first();
    }
});

export const getBotIdBySlug = internalQuery({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const flow = await ctx.db.query("bot_flows")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        return flow?.botId;
    }
});

export const updateConversationState = internalMutation({
    args: {
        id: v.id("conversations"),
        currentNodeId: v.optional(v.union(v.string(), v.null())),
        attributes: v.any(),
        botId: v.optional(v.union(v.string(), v.id("bots"), v.null())),
        botStepCount: v.optional(v.number()),
        executionTrace: v.optional(v.object({
            nodeId: v.string(),
            type: v.string(),
            action: v.string(),
            timestamp: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.id);
        if (!conversation) return;

        // botId stays on conversations (it's a routing field, not bot execution state)
        if (args.botId) {
            await ctx.db.patch(args.id, { botId: args.botId });
        }

        // Upsert bot execution state into the dedicated table
        const botStatePatch: any = {
            attributes: args.attributes,
        };
        if (args.currentNodeId !== undefined) botStatePatch.currentNodeId = args.currentNodeId;
        if (args.botStepCount !== undefined) botStatePatch.botStepCount = args.botStepCount;

        if (args.executionTrace) {
            const existing = await ctx.db
                .query("conversation_bot_state")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
                .first();
            const currentLog = existing?.executionLog || [];
            botStatePatch.executionLog = [...currentLog, args.executionTrace].slice(-50);
        }

        const existing = await ctx.db
            .query("conversation_bot_state")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, botStatePatch);
        } else {
            await ctx.db.insert("conversation_bot_state", {
                conversationId: args.id,
                ...botStatePatch,
            });
        }
    }
});


export const createBotMessage = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        projectId: v.id("projects"),
        channel: v.string(),
        content: v.string(),
        attachments: v.optional(v.any())
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            projectId: args.projectId,
            senderType: "bot",
            content: args.content,
            attachments: args.attachments,
        });

        // Relay bot reply to Meta if conversation is on a Meta channel
        if (args.channel === "messenger" || args.channel === "instagram") {
            await ctx.scheduler.runAfter(0, internal.conversations.sendMetaMessage, {
                conversationId: args.conversationId,
                content: args.content,
            });
        }

        if (args.channel === "telegram") {
            await ctx.scheduler.runAfter(0, internal.conversations.sendTelegramMessage, {
                conversationId: args.conversationId,
                content: args.content,
            });
        }

        return messageId;
    }
});

export const assignToHuman = internalMutation({
    args: { conversationId: v.id("conversations"), deptId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        await ctx.db.patch(args.conversationId, {
            status: 100,            // Back to unassigned pool
            botId: undefined,       // Detach bot so it won't be re-triggered
            botPaused: true,        // Hard-stop guard — even if botId leaks back
            handoffSource: "bot",   // Agent UI badge: this came from a bot escalation
            assignedTo: undefined,  // Ensure no stale agent assignment
        });

        // Also clear the bot node pointer in the dedicated state table
        const botState = await ctx.db
            .query("conversation_bot_state")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .first();

        if (botState) {
            await ctx.db.patch(botState._id, { currentNodeId: null });
        }

        const project = await ctx.db.get(conversation.projectId);
        if (project && project.slaHours) {
            await ctx.db.patch(args.conversationId, {
                slaDeadline: Date.now() + (project.slaHours * 60 * 60 * 1000),
                firstResponseAt: undefined,
            });
        }
    }
});

export const getOnlineAgentsInternal = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) return [];

        const onlineProfiles = await ctx.db
            .query("profiles")
            .withIndex("by_orgId", (q) => q.eq("orgId", project.orgId))
            .filter((q) => q.eq(q.field("isAvailable"), true))
            .collect();

        return onlineProfiles;
    }
});

export const getOperatingHoursInternal = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("operating_hours")
            .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
            .first();
    }
});

export const getProjectDefaultModel = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        return {
            defaultModel: project?.defaultModel,
            openRouterApiKey: project?.openRouterApiKey,
        };
    }
});

/** Utilities */
function interpolate(template: string, attributes: Record<string, any>): string {
    if (!template) return "";
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
        return path.split('.').reduce((obj: any, key: string) => obj?.[key], attributes) ?? '';
    });
}

function interpolateObject(obj: any, attributes: Record<string, any>): any {
    if (typeof obj === 'string') return interpolate(obj, attributes);
    if (Array.isArray(obj)) return obj.map(v => interpolateObject(v, attributes));
    if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
            result[key] = interpolateObject(obj[key], attributes);
        }
        return result;
    }
    return obj;
}

function evaluateCondition(expression: string, attributes: any): boolean {
    if (!expression) return false;
    try {
        const hydrated = interpolate(expression, attributes).trim();

        // Logical Operators
        const ops = [
            { op: '==', fn: (l: string, r: string) => l === r },
            { op: '!=', fn: (l: string, r: string) => l !== r },
            { op: '>=', fn: (l: number, r: number) => l >= r },
            { op: '<=', fn: (l: number, r: number) => l <= r },
            { op: '>', fn: (l: number, r: number) => l > r },
            { op: '<', fn: (l: number, r: number) => l < r },
            { op: 'contains', fn: (l: string, r: string) => l.includes(r) },
        ];

        for (const { op, fn } of ops) {
            // Match "left [op] right" format
            const regex = new RegExp(`^(.*?)\\s*${op === 'contains' ? 'contains' : '\\' + op.split('').join('\\')}\\s*(.*)$`, 'i');
            const match = hydrated.match(regex);

            if (match) {
                let left = match[1].trim();
                let right = match[2].trim();

                // Strip surrounding quotes if present
                if ((left.startsWith("'") && left.endsWith("'")) || (left.startsWith('"') && left.endsWith('"'))) left = left.slice(1, -1);
                if ((right.startsWith("'") && right.endsWith("'")) || (right.startsWith('"') && right.endsWith('"'))) right = right.slice(1, -1);

                // For math ops, convert to number
                if (['>', '<', '>=', '<='].includes(op)) {
                    return (fn as any)(Number(left), Number(right));
                }

                return (fn as any)(left, right);
            }
        }

        // If it's just a single boolean output
        return hydrated.toLowerCase() === 'true';
    } catch {
        return false;
    }
}

function evaluateExpression(value: string | number, attributes: any): any {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return value;

    try {
        const hydrated = interpolate(value.trim(), attributes);

        // Super basic math parser (e.g., "5 + 2", "10 - 3")
        const mathMatch = hydrated.match(/^([\d\.]+)\s*([\+\-\*\/])\s*([\d\.]+)$/);
        if (mathMatch) {
            const left = Number(mathMatch[1]);
            const op = mathMatch[2];
            const right = Number(mathMatch[3]);

            if (op === '+') return left + right;
            if (op === '-') return left - right;
            if (op === '*') return left * right;
            if (op === '/') return left / right;
        }

        // Return hydrated string and try parsing numeric
        const asNum = Number(hydrated);
        return !isNaN(asNum) ? asNum : hydrated;
    } catch {
        return interpolate(value, attributes);
    }
}

function tryParseJSON(str: string) {
    try {
        const p = JSON.parse(str);
        if (typeof p === 'object' && p !== null) return p;
        return null;
    } catch {
        return null;
    }
}

