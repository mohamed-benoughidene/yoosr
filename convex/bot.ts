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
                console.log("[BOT DEBUG] Executing AI block, model:", action.model, "projectDefault:", projectDefaultModel, "hasProjectKey:", !!projectApiKey)
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
            if (attributes?.__kbDone === true) {
                return {
                    newAttributes: { ...attributes, __kbDone: false },
                    nextNodeId: action.truePath
                };
            }

            // Turn counter: stored as attributes.__kbTurns in the conversation bot state attributes bag.
            // Read it on entry. Default to 0 if absent.
            let kbTurns = attributes?.__kbTurns ?? 0;

            // 1. If incomingMessage is absent or empty: return { suspend: true }.
            if (!incomingMessage || incomingMessage.trim() === "") {
                return { suspend: true };
            }

            // 2. Run KB search with incomingMessage as query.
            const kbConversation = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            // @ts-ignore
            let kbResults: any[] = [];
            try {
                // Using existing searchSimilarChunks action as the KB search pipeline.
                kbResults = await ctx.runAction(internal.knowledge.searchSimilarChunks, {
                    projectId: kbConversation.projectId,
                    query: incomingMessage,
                });
            } catch (e: any) {
                console.error("[BOT ENGINE] KB search failed:", e.message);
            }

            // 3. If no result above threshold: return { nextNodeId: action.elsePath }. No reply.
            if (!kbResults || kbResults.length === 0) {
                return { nextNodeId: action.elsePath };
            }

            // 4. If results found:
            // a. systemPrompt = action.systemPrompt or fallback
            let systemPrompt = action.systemPrompt || "You are a helpful support assistant. Answer only based on the provided context.";

            // b. Append chunks joined and capped at 3000 chars.
            const contextText = kbResults.map((r: any) => r.text).join("\n").slice(0, 3000);
            systemPrompt += "\n\nUse the following context to answer:\n" + contextText;

            // c. Fetch conversation history as ChatMessage[]
            const messageDocs = await ctx.runQuery(internal.messages.listPublic, { conversationId });
            const history: ChatMessage[] = messageDocs.map((m: any) => ({
                role: (m.senderType === "visitor" ? "user" : "assistant") as any,
                content: m.content
            })).slice(-10);

            // d. Call callAIAssistant with history and project settings
            const projectInfo = await ctx.runQuery(internal.bot.getProjectDefaultModel, { projectId: kbConversation.projectId });
            let apiKey: string | undefined;
            if (projectInfo?.openRouterApiKey) {
                const encryptionKey = process.env.ENCRYPTION_KEY;
                if (encryptionKey) {
                    apiKey = await decryptSecret(projectInfo.openRouterApiKey, encryptionKey);
                }
            }

            const result = await callAIAssistant(
                systemPrompt,
                history,
                action.model,
                projectInfo?.defaultModel,
                apiKey
            );

            // e. Send reply via createBotMessage
            await ctx.runMutation(internal.bot.createBotMessage, {
                conversationId,
                projectId: kbConversation.projectId,
                channel: channel || "widget",
                content: result.text
            });

            // f. Log token usage
            await ctx.runMutation(internal.analytics.logTokenUsage, {
                projectId: kbConversation.projectId,
                model: result.model,
                tokensUsed: result.tokensUsed,
                operation: "ask_kb",
            });

            // g. Increment __kbTurns by 1.
            const nextTurns = kbTurns + 1;

            // h. Persist via updated attributes returned to the engine.
            const updatedAttributes = {
                ...attributes,
                __kbTurns: nextTurns,
                [action.assignTo ?? "kb_reply"]: result.text
            };

            // 5. If __kbTurns >= (action.maxTurns ?? 5): reset __kbTurns to 0, return { nextNodeId: action.truePath }.
            if (nextTurns >= (action.maxTurns ?? 5)) {
                return {
                    newAttributes: { ...updatedAttributes, __kbTurns: 0, __kbDone: true },
                    suspend: true
                };
            }

            // 6. Else: return { suspend: true }.
            return {
                newAttributes: updatedAttributes,
                suspend: true
            };
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
            if (hours && hours.enabled && hours.schedule && hours.timezone) {
                isOpen = isOpenNow(hours.schedule, hours.timezone);
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
        console.log("[BOT DEBUG] Bot triggered for conversation:", args.conversationId, "project:", conversation.projectId)

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
                    incomingMessage: args.incomingMessage,
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

function isOpenNow(schedule: any[], timezone: string): boolean {
    const now = new Date();
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        });

        const parts = formatter.formatToParts(now);
        const dayPart = parts.find(p => p.type === 'weekday');
        const hourPart = parts.find(p => p.type === 'hour');
        const minutePart = parts.find(p => p.type === 'minute');

        if (!dayPart || !hourPart || !minutePart) {
            console.warn("[BOT ENGINE] Date parts missing for timezone:", timezone);
            return true;
        }

        const dayName = dayPart.value.toLowerCase();
        const currentTimeStr = `${hourPart.value}:${minutePart.value}`;

        const dayEntry = schedule.find(s => s.day?.toLowerCase() === dayName);

        if (!dayEntry || (dayEntry.open === false) || !dayEntry.slots || dayEntry.slots.length === 0) {
            return false;
        }

        return dayEntry.slots.some((slot: { start: string, end: string }) => {
            return currentTimeStr >= slot.start && currentTimeStr < slot.end;
        });
    } catch (e) {
        console.error("[BOT ENGINE] Error evaluating operating hours:", e);
        return true;
    }
}

