import { internalAction, internalQuery, internalMutation, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { extractText } from "unpdf";
import { EMBEDDING_CONFIG } from "./lib/embeddings";

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

function splitIntoChunks(text: string, maxLen = 500): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxLen;
        if (end >= text.length) {
            chunks.push(text.slice(start).trim());
            break;
        }
        // try to cut at last ". "
        const periodIdx = text.lastIndexOf(". ", end);
        if (periodIdx > start) {
            end = periodIdx + 1;
        } else {
            // try last space
            const spaceIdx = text.lastIndexOf(" ", end);
            if (spaceIdx > start) end = spaceIdx;
        }
        chunks.push(text.slice(start, end).trim());
        start = end;
    }
    return chunks.filter(c => c.length >= 30);
}

async function processAndStoreChunks(
    ctx: ActionCtx,
    args: { sourceId: Id<"knowledge_base_sources">; projectId: Id<"projects"> },
    chunks: string[]
) {
    if (chunks.length > 200) {
        console.warn("Source too large, indexing first 200 chunks only.");
        chunks = chunks.slice(0, 200);
    }

    if (!process.env.OPENROUTER_API_KEY) {
        console.error("Missing OPENROUTER_API_KEY");
        await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
        return;
    }

    let hasErrors = false;
    const batchSize = 20;

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: EMBEDDING_CONFIG.model,
                    input: batch,
                }),
            });
            const data = await response.json();
            const output = data.data ? data.data.map((d: { embedding: number[] }) => d.embedding) : [];

            const is1D = Array.isArray(output) && output.length > 0 && typeof output[0] === 'number';
            const embeddings = is1D ? [output] : output;

            if (Array.isArray(embeddings) && embeddings.length === batch.length) {
                await Promise.all(
                    batch.map(async (chunk, idx) => {
                        const embedding = embeddings[idx] as number[];
                        await ctx.runMutation(internal.knowledge.insertChunkInternal, {
                            sourceId: args.sourceId,
                            projectId: args.projectId,
                            text: chunk,
                            embedding: embedding,
                        });
                    })
                );
            } else {
                console.error("Unexpected embedding format from OpenRouter", data);
                hasErrors = true;
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Failed to embed chunk batch", errorMessage);
            hasErrors = true;
        }
    }

    await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, {
        id: args.sourceId,
        status: hasErrors ? "failed" : "indexed"
    });
}

export const indexSource = internalAction({
    args: { sourceId: v.id("knowledge_base_sources"), projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const source = await ctx.runQuery(internal.knowledge.getSourceInternal, { id: args.sourceId });
        if (!source || source.status !== "indexing") return;

        if (source.type === "text") {
            const rawText = source.value;
            const chunks = splitIntoChunks(rawText);
            await processAndStoreChunks(ctx, args, chunks);
        } else if (source.type === "url") {
            try {
                const response = await fetch(source.value, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; YoosrBot/1.0)" },
                    signal: AbortSignal.timeout(10000)
                });

                const htmlText = await response.text();

                let cleanedText = htmlText.replace(/<[^>]*>/g, " ");
                cleanedText = cleanedText.replace(/\s+/g, " ");
                cleanedText = cleanedText
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&nbsp;/g, " ")
                    .replace(/&quot;/g, '"');
                cleanedText = cleanedText.trim();

                if (!cleanedText) {
                    throw new Error("Text is empty after stripping HTML");
                }

                const chunks = splitIntoChunks(cleanedText);
                await processAndStoreChunks(ctx, args, chunks);
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.error("Failed to process URL source:", errorMessage);
                await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
            }
        } else if (source.type === "file") {
            try {
                const blob = await ctx.storage.get(source.value as Id<"_storage">);
                if (!blob) {
                    throw new Error("File blob not found");
                }

                const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
                if (blob.size > MAX_FILE_BYTES) {
                    throw new Error(`File too large: ${blob.size} bytes. Maximum allowed is 15MB.`);
                }

                if (blob.type === "application/pdf") {
                    const arrayBuffer = await blob.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const { text } = await extractText(uint8Array, { mergePages: true });
                    const cleanedText = (text as string).trim();
                    if (!cleanedText) {
                        throw new Error("PDF text extraction returned empty content");
                    }
                    const chunks = splitIntoChunks(cleanedText);
                    await processAndStoreChunks(ctx, args, chunks);
                } else {
                    const fileText = await blob.text();
                    const cleanedText = fileText.trim();

                    if (!cleanedText) {
                        throw new Error("Content is empty after trimming");
                    }

                    const chunks = splitIntoChunks(cleanedText);
                    await processAndStoreChunks(ctx, args, chunks);
                }
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.error("Failed to process file source:", errorMessage);
                await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
            }
        } else {
            // For MVP, URL/File types can just fail gracefully or skip
            await ctx.runMutation(internal.knowledge.updateSourceStatusInternal, { id: args.sourceId, status: "failed" });
            console.warn("Unsupported source type:", source.type);
        }
    }
});


export const searchSimilarChunks = internalAction({
    args: {
        projectId: v.id("projects"),
        query: v.string(),
    },
    handler: async (ctx, args): Promise<unknown[]> => {
        if (!process.env.OPENROUTER_API_KEY) {
            console.error("Missing OPENROUTER_API_KEY");
            return [];
        }

        let embedding: { data: { embedding: number[] }[] };
        try {
            const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: EMBEDDING_CONFIG.model,
                    input: args.query,
                }),
            });
            const data = await response.json();
            embedding = data.data?.[0]?.embedding ?? data.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("OpenRouter API error", errorMessage);
            return [];
        }

        if (!Array.isArray(embedding) || embedding.length === 0) {
            console.error("OpenRouter API returned an unrecognized format", embedding);
            return [];
        }

        const is1D = Array.isArray(embedding) && embedding.length > 0 && typeof embedding[0] === 'number';
        const flatEmbedding = is1D ? embedding : (embedding as number[][])[0];

        // Filter by minimum relevance score. Convex returns _score (cosine similarity).
        // Without this, off-topic chunks still pass the length check and no unanswered query is logged.
        const MIN_RELEVANCE_SCORE = 0.25;
        const results = await ctx.vectorSearch("knowledge_base_chunks", "by_embedding", {
            vector: flatEmbedding,
            filter: (q) => q.eq("projectId", args.projectId),
            limit: 5,
        });
        const relevantResults = results.filter((r: { _score: number }) => r._score >= MIN_RELEVANCE_SCORE);


        const chunks = await Promise.all(
            relevantResults.map(async (result: { _id: Id<"knowledge_base_chunks">; _score: number }): Promise<unknown> => {
                const chunk = await ctx.runQuery(internal.knowledge.getChunkInternal, { id: result._id });
                return chunk;
            })
        );

        const validChunks = chunks.filter((c: unknown) => c !== null);

        if (validChunks.length === 0) {
            await ctx.runMutation(internal.analytics.logUnansweredQuery, {
                projectId: args.projectId,
                query: args.query,
            });
        }

        return validChunks;
    },
});
