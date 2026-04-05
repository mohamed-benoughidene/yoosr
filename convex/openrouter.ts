/**
 * Shared OpenRouter helper — uses OpenAI SDK with custom baseURL.
 * Both AI Task and AI Assistant blocks call through here.
 */

import OpenAI from "openai";


function getClient(customApiKey?: string): OpenAI {
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY environment variable. Set it in your Convex deployment.");
    }
    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
    });
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LLMResult {
    text: string;
    tokensUsed: number;
    model: string;
}

/**
 * Single-shot LLM call for AI Task blocks.
 * Returns the raw assistant reply text + token usage.
 */
export async function callAITask(
    systemPrompt: string,
    userMessage: string,
    model?: string,
    projectDefaultModel?: string,
    apiKey?: string
): Promise<LLMResult> {
    const client = getClient(apiKey);
    const resolvedModel = model || projectDefaultModel || "openrouter/free";
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
    ];

    const response = await client.chat.completions.create({
        model: resolvedModel,
        messages,
        temperature: 0.3,
    });

    return {
        text: response.choices?.[0]?.message?.content?.trim() ?? "",
        tokensUsed: response.usage?.total_tokens ?? 0,
        model: resolvedModel,
    };
}

/**
 * Multi-turn LLM call for AI Assistant blocks.
 * Sends full conversation history and returns the assistant reply + token usage.
 */
export async function callAIAssistant(
    systemPrompt: string,
    conversationHistory: ChatMessage[],
    model?: string,
    projectDefaultModel?: string,
    apiKey?: string
): Promise<LLMResult> {
    const client = getClient(apiKey);
    const resolvedModel = model || projectDefaultModel || "openrouter/free";
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
    ];

    const response = await client.chat.completions.create({
        model: resolvedModel,
        messages,
        temperature: 0.7,
    });

    return {
        text: response.choices?.[0]?.message?.content?.trim() ?? "",
        tokensUsed: response.usage?.total_tokens ?? 0,
        model: resolvedModel,
    };
}
