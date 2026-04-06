/**
 * Shared OpenRouter helper — uses OpenAI SDK with custom baseURL.
 * Both AI Task and AI Assistant blocks call through here.
 *
 * RATE LIMITING: Configure AI_RATE_LIMIT_PER_HOUR env var to limit AI calls.
 * Default: 100 calls per project per hour.
 * Rate limiting should be enforced at the caller (mutation/action) level.
 *
 * RETRY: Transient errors (5xx, timeouts) are retried with exponential backoff
 * and jitter. Client errors (400, 401, 403) fail immediately.
 * Configure via LLM_RETRY_MAX_ATTEMPTS (default: 3) and
 * LLM_RETRY_BASE_DELAY_MS (default: 1000).
 */

import OpenAI from "openai";

/**
 * Rate limit configuration for AI calls.
 * Read from environment variable AI_RATE_LIMIT_PER_HOUR (default: 100).
 */
export const AI_RATE_LIMIT_PER_HOUR = parseInt(
    process.env.AI_RATE_LIMIT_PER_HOUR || "100",
    10
);

/**
 * Retry configuration for LLM calls.
 */
const LLM_RETRY_MAX_ATTEMPTS = parseInt(
    process.env.LLM_RETRY_MAX_ATTEMPTS || "3",
    10
);
const LLM_RETRY_BASE_DELAY_MS = parseInt(
    process.env.LLM_RETRY_BASE_DELAY_MS || "1000",
    10
);

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
 * Retry a function with exponential backoff and jitter.
 * Does NOT retry client errors (400, 401, 403) — those fail immediately.
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = LLM_RETRY_MAX_ATTEMPTS,
    baseDelayMs: number = LLM_RETRY_BASE_DELAY_MS
): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry client errors (4xx)
            if (
                lastError.message.includes("400") ||
                lastError.message.includes("401") ||
                lastError.message.includes("403")
            ) {
                throw lastError;
            }

            if (attempt < maxAttempts) {
                const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500; // jitter
                console.warn(
                    `OpenRouter call failed (attempt ${attempt + 1}/${maxAttempts + 1}), retrying in ${Math.round(delay)}ms:`,
                    lastError.message
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError!;
}

/**
 * Single-shot LLM call for AI Task blocks.
 * Returns the raw assistant reply text + token usage.
 * Retries transient failures with exponential backoff.
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

    return retryWithBackoff(async () => {
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
    });
}

/**
 * Multi-turn LLM call for AI Assistant blocks.
 * Sends full conversation history and returns the assistant reply + token usage.
 * Retries transient failures with exponential backoff.
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

    return retryWithBackoff(async () => {
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
    });
}
