# Audit Report: Ask Knowledge Base Block

## 1. Ask Knowledge Base Handler (`convex/bot.ts`)
```typescript
        case "ask_kb": {
            const kbQuery = interpolate(action.query, attributes);
            const kbConversation = await ctx.runQuery(internal.bot.getConversationState, { id: conversationId });
            // @ts-ignore - type may not be generated yet
            const kbResult = await ctx.runAction(internal.knowledge.searchSimilarChunks, {
                projectId: kbConversation.projectId,
                query: kbQuery,
            });
            let kbAnswer = "";
            if (kbResult.length > 0) {
                const contextStr = kbResult.map((r: any) => r.text).join("\n");
                const kbPrompt = `Context:\n${contextStr}\n\nQuestion: ${kbQuery}\nAnswer based only on context.`;
                try {
                    const kbLlmResult = await callAITask(kbPrompt, kbQuery);
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
```

## 2. Search Action (`convex/knowledge.ts`)
```typescript
export const searchSimilarChunks = action({
    args: {
        projectId: v.id("projects"),
        query: v.string(),
    },
    handler: async (ctx, args): Promise<any[]> => {
        if (!process.env.HUGGINGFACE_API_KEY) {
            console.error("Missing HUGGINGFACE_API_KEY");
            return [];
        }

        const { HfInference } = await import("@huggingface/inference");
        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

        let embedding: any;
        try {
            const output = await hf.featureExtraction({
                model: "BAAI/bge-m3",
                inputs: args.query,
            });
            embedding = output;
        } catch (error: any) {
            console.error("Hugging Face SDK error", error.message);
            return [];
        }

        if (!Array.isArray(embedding)) {
            console.error("Hugging Face API returned an unrecognized format", embedding);
            return [];
        }

        // Filter by minimum relevance score. Convex returns _score (cosine similarity).
        // Without this, off-topic chunks still pass the length check and no unanswered query is logged.
        const MIN_RELEVANCE_SCORE = 0.75;
        const results = await ctx.vectorSearch("knowledge_base_chunks", "by_embedding", {
            vector: embedding,
            filter: (q) => q.eq("projectId", args.projectId),
            limit: 5,
        });
        const relevantResults = results.filter((r: any) => r._score >= MIN_RELEVANCE_SCORE);


        const chunks = await Promise.all(
            relevantResults.map(async (result: any): Promise<any> => {
                const chunk = await ctx.runQuery(internal.knowledge.getChunkInternal, { id: result._id as any });
                return chunk;
            })
        );

        const validChunks = chunks.filter((c: any) => c !== null);

        if (validChunks.length === 0) {
            await ctx.runMutation(internal.analytics.logUnansweredQuery, {
                projectId: args.projectId,
                query: args.query,
            });
        }

        return validChunks;
    },
});
```

## 3. Action Arguments and Return Values
**Arguments Expected:**
- `projectId`: A Convex ID pointing to the project (`v.id("projects")`).
- `query`: A string containing the text to search for (`v.string()`).

**Returns:**
- A `Promise<any[]>` representing an array of relevant knowledge chunk objects from the database. It will return an empty array `[]` if no chunks meet the relevance threshold, or if an error happens during the process.

## 4. How the Bot Engine Calls the Search Action
The bot engine uses Convex's `ctx.runAction` to securely query the search action:
```typescript
const kbResult = await ctx.runAction(internal.knowledge.searchSimilarChunks, { ... });
```

## 5. Handling of the Search Result
- If relevant chunks are returned (`kbResult.length > 0`), the bot joins all the `.text` fields from the chunks into a unified context string.
- This context context string, alongside the user's `kbQuery`, is embedded safely inside an LLM prompt (`Context:\n${contextStr}\n\nQuestion: ${kbQuery}\nAnswer based only on context.`), which is then dynamically evaluated using `callAITask()`.
- If the AI produces an answer (`kbAnswer`), it maps the generated string inside variables (`[action.assignTo ?? "kb_reply"]: kbAnswer`) and returns `nextNodeId: action.truePath` allowing the bot execution to continue logically along the "Success" path.
- In instances of missing database chunks or an absent AI response, it defaults directly backwards to the `elsePath` ("Fallback").
- Unanswered queries are tracked to the database using `ctx.runMutation(internal.analytics.logUnansweredQuery)`.

## 6. Configurable Fields in the Design Studio UI
In the Design Studio Properties panel (`NodePropertiesPanel.tsx`), the user can configure the following two properties for an `ask_kb` node:
1. **Search Query**: Handled by the `<Input>` assigned to `data.query` where interpolation placeholders like `{{user_message}}` can be mapped.
2. **Assign Result To Variable**: Handled by the `<Input>` mapped to `data.assignTo` where the default is established as `kb_reply`.
Users can also design edge routing connections logic across `<Handle id="true">` / `<Handle id="false">`.

## 7. Silent Failures and Caught Error Paths
There are multiple situations where deep errors cause silent failure states instead of completely dropping or error-halting execution logic:

**In the Bot Engine (`bot.ts`):** 
- During `callAITask`, if the LLM generation errors or misfires (e.g. rate-limit, syntax, disconnected), it is evaluated inside a `try/catch` and triggers `console.error("[BOT ENGINE] KB answer generation failed:", e.message)`. But it does not mutate attributes with a dedicated `ai_error` value and simply routes execution onto `action.elsePath`.

**In Knowledge Context Retrieval (`knowledge.ts`):**
- Missing Keys (`!process.env.HUGGINGFACE_API_KEY`) throw console errors (`console.error("Missing HUGGINGFACE_API_KEY")`) and quietly return `[]`.
- Hugging Face endpoint failures evaluating `hf.featureExtraction` fallback inside the try/catch natively resulting into `console.error("Hugging Face SDK error", error.message)` and returns `[]`.
- Unrecognized Hugging Face Payload arrays generate `console.error("Hugging Face API returned an unrecognized format")` and resolves `[]`.

In all these scenarios, retrieving `[]` tells the bot execution layer effectively "No context exists" which skips to sending `logUnansweredQuery` triggers and defaults gracefully—but incorrectly—to `nextNodeId: action.elsePath`. System errors are masked entirely under standard "Unanswered/Empty Context" logic logic states safely to the client.
