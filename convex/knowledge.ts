import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getChunkInternal = internalQuery({
    args: { id: v.id("knowledge_base_chunks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});


export const searchSimilarChunks = action({
    args: {
        projectId: v.id("projects"),
        query: v.string(),
    },
    handler: async (ctx, args): Promise<any[]> => {
        if (!process.env.OPENAI_API_KEY) {
            console.error("Missing OPENAI_API_KEY");
            return [];
        }

        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "text-embedding-3-large",
                input: args.query,
            }),
        });

        if (!response.ok) {
            console.error("OpenAI error", await response.text());
            return [];
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;

        const results = await ctx.vectorSearch("knowledge_base_chunks", "by_embedding", {
            vector: embedding,
            filter: (q) => q.eq("projectId", args.projectId),
            limit: 5,
        });

        const chunks = await Promise.all(
            results.map(async (result): Promise<any> => {
                const chunk = await ctx.runQuery(internal.knowledge.getChunkInternal, { id: result._id as any });
                return chunk;
            })
        );

        return chunks.filter((c: any) => c !== null);
    },
});
