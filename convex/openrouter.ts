/**
 * Shared OpenRouter helper — uses OpenAI SDK with custom baseURL.
 * Both AI Task and AI Assistant blocks call through here.
 */

import OpenAI from "openai";

const DEFAULT_AI_TASK_MODEL = "mistralai/mistral-7b-instruct";
const DEFAULT_AI_ASSISTANT_MODEL = "meta-llama/llama-3.1-8b-instruct";

function getClient(): OpenAI {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY environment variable");
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

/**
 * Single-shot LLM call for AI Task blocks.
 * Returns the raw assistant reply text.
 */
export async function callAITask(
    systemPrompt: string,
    userMessage: string,
    model?: string
): Promise<string> {
    const client = getClient();
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
    ];

    const response = await client.chat.completions.create({
        model: model || DEFAULT_AI_TASK_MODEL,
        messages,
        temperature: 0.3,
    });

    return response.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Multi-turn LLM call for AI Assistant blocks.
 * Sends full conversation history and returns the assistant reply.
 */
export async function callAIAssistant(
    systemPrompt: string,
    conversationHistory: ChatMessage[],
    model?: string
): Promise<string> {
    const client = getClient();
    const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
    ];

    const response = await client.chat.completions.create({
        model: model || DEFAULT_AI_ASSISTANT_MODEL,
        messages,
        temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content?.trim() ?? "";
}
