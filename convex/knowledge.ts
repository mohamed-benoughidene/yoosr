import { action, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getChunkInternal = internalQuery({
    args: { id: v.id("knowledge_base_chunks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getSourceInternal = internalQuery({
    args: { id: v.id("knowledge_base_sources") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const insertChunkInternal = internalMutation({
    args: {
        sourceId: v.id("knowledge_base_sources"),
        projectId: v.id("projects"),
        text: v.string(),
        embedding: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("knowledge_base_chunks", args);
    },
});

export const updateSourceStatusInternal = internalMutation({
    args: {
        id: v.id("knowledge_base_sources"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const indexSource = internalAction({
    args: { sourceId: v.id("knowledge_base_sources"), projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const source = await ctx.runQuery(internal.knowledge.getSourceInternal, { id: args.sourceId });
        if (!source || source.status !== "indexing") return;

        if (source.type === "text") {
            const rawText = source.value;
            // Simple chunking by double newline
            const chunks = rawText.split('\n\n').filter((c: string) => c.trim().length > 0);

            if (!process.env.HUGGINGFACE_API_KEY) {
                console.error("Missing HUGGINGFACE_API_KEY");
                await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
                return;
            }

            const { HfInference } = await import("@huggingface/inference");
            const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

            let hasErrors = false;
            for (const chunk of chunks) {
                try {
                    const output = await hf.featureExtraction({
                        model: "BAAI/bge-m3",
                        inputs: chunk.trim(),
                    });

                    if (Array.isArray(output)) {
                        await ctx.runMutation(internal.knowledge.insertChunkInternal, {
                            sourceId: args.sourceId,
                            projectId: args.projectId,
                            text: chunk.trim(),
                            embedding: output as number[]
                        });
                    } else {
                        hasErrors = true;
                    }
                } catch (e: any) {
                    console.error("Failed to embed chunk", e.message);
                    hasErrors = true;
                }
            }

            // Mark as indexed if all good, otherwise failed
            await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, {
                id: args.sourceId,
                status: hasErrors && chunks.length > 0 ? "failed" : "indexed"
            });
        } else {
            // For MVP, URL/File types can just fail gracefully or skip
            await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
            console.log("Unsupported source type for MVP:", source.type);
        }
    }
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
