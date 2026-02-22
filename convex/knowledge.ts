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
